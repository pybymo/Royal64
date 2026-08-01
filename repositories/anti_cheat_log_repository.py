from database.models.anti_cheat_log import AntiCheatLog
from repositories.base import BaseRepository


class AntiCheatLogRepository(BaseRepository[AntiCheatLog]):

    async def create(self, log: AntiCheatLog) -> AntiCheatLog:

        await self.add(log)
        await self.commit()
        await self.refresh(log)
        return log
