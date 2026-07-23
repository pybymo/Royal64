from database.repositories import UserRepository


class DatabaseService:

    def __init__(self, session):

        self.users = UserRepository(session)