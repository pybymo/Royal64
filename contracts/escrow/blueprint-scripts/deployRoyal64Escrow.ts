import { Address, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';

import { Royal64Escrow } from '../build/Royal64Escrow/tact_Royal64Escrow';

export async function run(provider: NetworkProvider) {

    const ownerAddress = provider.sender().address!;

    // TODO: replace with your real testnet oracle/treasury wallet
    // addresses (from step 6 in the chat reply — the two extra
    // testnet-funded wallets besides the deployer/owner one).
    const oracleAddress = Address.parse('EQ...replace-me...');
    const treasuryAddress = Address.parse('EQ...replace-me...');

    const royal64Escrow = provider.open(
        await Royal64Escrow.fromInit(ownerAddress, oracleAddress, treasuryAddress)
    );

    await royal64Escrow.send(
        provider.sender(),
        { value: toNano('0.05') },
        { $$type: 'Deploy', queryId: 0n }
    );

    await provider.waitForDeploy(royal64Escrow.address);

    console.log('Deployed Royal64Escrow at', royal64Escrow.address.toString());
    console.log('Put this address in ESCROW_ADDRESS (chain-writer/.env and backend .env.example)');
}
