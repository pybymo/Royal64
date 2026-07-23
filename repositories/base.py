from typing import Any, Generic, TypeVar

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

T = TypeVar("T")


class BaseRepository(Generic[T]):

    def __init__(self, session: AsyncSession):
        self.session = session

    async def add(self, obj: T) -> T:
        self.session.add(obj)
        return obj

    async def commit(self):
        await self.session.commit()

    async def rollback(self):
        await self.session.rollback()

    async def refresh(self, obj: T):
        await self.session.refresh(obj)

    async def flush(self):
        await self.session.flush()

    async def execute(self, stmt):
        return await self.session.execute(stmt)

    async def get(self, model: type[T], object_id: Any):
        return await self.session.get(model, object_id)

    async def get_all(self, model: type[T]):
        result = await self.session.execute(select(model))
        return result.scalars().all()

    async def delete_by_id(self, model: type[T], object_id: Any):
        stmt = delete(model).where(model.id == object_id)
        await self.session.execute(stmt)