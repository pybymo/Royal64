from sqlalchemy import select

from database.models.wallet import Wallet

from repositories.base import BaseRepository


class WalletRepository(BaseRepository[Wallet]):

    async def get_by_id(
        self,
        wallet_id,
    ) -> Wallet | None:

        return await self.get(Wallet, wallet_id)

    async def get_by_address(
        self,
        address: str,
    ) -> Wallet | None:

        stmt = (
            select(Wallet)
            .where(Wallet.address == address)
        )

        result = await self.execute(stmt)

        return result.scalar_one_or_none()

    async def get_by_user_id(
        self,
        user_id,
    ) -> list[Wallet]:

        stmt = (
            select(Wallet)
            .where(Wallet.user_id == user_id)
        )

        result = await self.execute(stmt)

        return list(result.scalars().all())

    async def get_default_for_user(
        self,
        user_id,
    ) -> Wallet | None:

        stmt = (
            select(Wallet)
            .where(
                Wallet.user_id == user_id,
                Wallet.is_default.is_(True),
            )
        )

        result = await self.execute(stmt)

        return result.scalar_one_or_none()

    async def clear_default_for_user(
        self,
        user_id,
    ) -> None:

        wallets = await self.get_by_user_id(user_id)

        for wallet in wallets:
            wallet.is_default = False

        await self.flush()

    async def create(
        self,
        wallet: Wallet,
    ) -> Wallet:

        await self.add(wallet)

        await self.commit()

        await self.refresh(wallet)

        return wallet

    async def save(
        self,
        wallet: Wallet,
    ) -> Wallet:

        await self.commit()

        await self.refresh(wallet)

        return wallet
