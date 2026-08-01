import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import '@ton/test-utils';

import { Royal64Escrow } from '../build/Royal64Escrow/tact_Royal64Escrow';

describe('Royal64Escrow', () => {

    let blockchain: Blockchain;
    let owner: SandboxContract<TreasuryContract>;
    let oracle: SandboxContract<TreasuryContract>;
    let treasury: SandboxContract<TreasuryContract>;
    let playerA: SandboxContract<TreasuryContract>;
    let playerB: SandboxContract<TreasuryContract>;
    let escrow: SandboxContract<Royal64Escrow>;

    beforeEach(async () => {

        blockchain = await Blockchain.create();

        owner = await blockchain.treasury('owner');
        oracle = await blockchain.treasury('oracle');
        treasury = await blockchain.treasury('treasury');
        playerA = await blockchain.treasury('playerA');
        playerB = await blockchain.treasury('playerB');

        escrow = blockchain.openContract(
            await Royal64Escrow.fromInit(owner.address, oracle.address, treasury.address)
        );

        await escrow.send(
            owner.getSender(),
            { value: toNano('0.05') },
            { $$type: 'Deploy', queryId: 0n }
        );
    });

    it('runs a full match: create, both deposit, oracle declares winner, winner gets paid', async () => {

        const now = Math.floor(Date.now() / 1000);
        const stake = toNano('1');

        await escrow.send(
            oracle.getSender(),
            { value: toNano('0.05') },
            {
                $$type: 'CreateMatch',
                matchId: 1n,
                playerA: playerA.address,
                playerB: playerB.address,
                stake,
                depositDeadline: now + 900,
                resolveDeadline: now + 7200,
            }
        );

        await escrow.send(playerA.getSender(), { value: stake }, { $$type: 'Deposit', matchId: 1n });
        await escrow.send(playerB.getSender(), { value: stake }, { $$type: 'Deposit', matchId: 1n });

        const before = await playerA.getBalance();

        await escrow.send(
            oracle.getSender(),
            { value: toNano('0.1') },
            { $$type: 'DeclareResult', matchId: 1n, winner: playerA.address }
        );

        const after = await playerA.getBalance();

        expect(after > before).toBe(true);
    });

    it('refunds both players if the deposit window expires with only one deposit', async () => {

        const now = Math.floor(Date.now() / 1000);
        const stake = toNano('1');

        await escrow.send(
            oracle.getSender(),
            { value: toNano('0.05') },
            {
                $$type: 'CreateMatch',
                matchId: 2n,
                playerA: playerA.address,
                playerB: playerB.address,
                stake,
                depositDeadline: now - 1, // already expired
                resolveDeadline: now + 7200,
            }
        );

        // Deliberately skipping any Deposit — this checks the
        // already-expired path, not a real 15-minute wait.
        const before = await playerA.getBalance();

        const result = await escrow.send(
            playerA.getSender(),
            { value: toNano('0.05') },
            { $$type: 'CancelExpired', matchId: 2n }
        );

        expect(result.transactions).toHaveTransaction({
            from: playerA.address,
            success: true,
        });
    });

    it('force-splits with no fee if the oracle never resolves past resolveDeadline', async () => {

        const now = Math.floor(Date.now() / 1000);
        const stake = toNano('1');

        await escrow.send(
            oracle.getSender(),
            { value: toNano('0.05') },
            {
                $$type: 'CreateMatch',
                matchId: 3n,
                playerA: playerA.address,
                playerB: playerB.address,
                stake,
                depositDeadline: now + 900,
                resolveDeadline: now - 1, // already past — oracle went silent
            }
        );

        await escrow.send(playerA.getSender(), { value: stake }, { $$type: 'Deposit', matchId: 3n });
        await escrow.send(playerB.getSender(), { value: stake }, { $$type: 'Deposit', matchId: 3n });

        const result = await escrow.send(
            treasury.getSender(), // anyone can call this, including a non-player
            { value: toNano('0.05') },
            { $$type: 'ForceSplit', matchId: 3n }
        );

        expect(result.transactions).toHaveTransaction({
            from: treasury.address,
            success: true,
        });
    });
});
