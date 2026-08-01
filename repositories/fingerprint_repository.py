from uuid import UUID

from sqlalchemy import select

from database.models.fingerprint import Fingerprint
from repositories.base import BaseRepository


class FingerprintRepository(BaseRepository[Fingerprint]):

    async def get_by_user_id(self, user_id: UUID) -> Fingerprint | None:

        stmt = select(Fingerprint).where(Fingerprint.user_id == user_id)
        result = await self.execute(stmt)
        return result.scalar_one_or_none()

    async def get_or_create(self, user_id: UUID) -> Fingerprint:

        existing = await self.get_by_user_id(user_id)

        if existing is not None:
            return existing

        fp = Fingerprint(user_id=user_id)

        await self.add(fp)
        await self.commit()
        await self.refresh(fp)

        return fp

    async def save(self, fp: Fingerprint) -> Fingerprint:

        await self.commit()
        await self.refresh(fp)
        return fp
