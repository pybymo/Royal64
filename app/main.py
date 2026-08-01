from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.startup import startup
from app.websocket import router as websocket_router

from app.api.routes.auth import router as auth_router
from app.api.routes.games import router as games_router
from app.api.routes.health import router as health_router
from app.api.routes.matches import router as matches_router
from app.api.routes.offers import router as offers_router
from app.api.routes.wallet import router as wallet_router

from core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):

    await startup()

    yield


app = FastAPI(

    lifespan=lifespan,

)

# Without this, every browser request from the frontend (a different
# origin — different port locally, a whole different ngrok domain when
# testing from a phone) gets blocked by the browser itself before it
# even reaches any route here. This was missing entirely, which reads
# to the frontend as "the backend isn't responding" with no useful
# error, not as an auth problem.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    websocket_router
)

app.include_router(auth_router)
app.include_router(games_router)
app.include_router(health_router)
app.include_router(matches_router)
app.include_router(offers_router)
app.include_router(wallet_router)