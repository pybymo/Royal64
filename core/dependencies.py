from database.session import SessionLocal


class UnitOfWork:

    async def __aenter__(self):

        self.session = SessionLocal()

        return self.session

    async def __aexit__(
        self,
        exc_type,
        exc,
        tb,
    ):

        if exc:

            await self.session.rollback()

        else:

            await self.session.commit()

        await self.session.close()