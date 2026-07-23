import asyncio

from services.redis_service import ping


async def main():

    result = await ping()

    print(result)


asyncio.run(main())