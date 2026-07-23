from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.startup import startup
from app.websocket import router as websocket_router

from app.api.routes.health import router as health_router


@asynccontextmanager
async def lifespan(app: FastAPI):

    await startup()

    yield


app = FastAPI(

    lifespan=lifespan,

)

app.include_router(
    websocket_router
)

app.include_router(health_router)