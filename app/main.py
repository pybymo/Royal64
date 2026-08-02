import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger

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


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    Every request/response logged with timing — this is what makes
    "the frontend just spins forever" debuggable at all: if a request
    never shows up here, the problem is network/tunnel, not this app;
    if it shows up but takes a very long time or 500s, that's this
    app's problem specifically, and the traceback below says where.
    """

    start = time.monotonic()

    try:
        response = await call_next(request)

    except Exception:
        logger.exception(f"{request.method} {request.url.path} -> unhandled exception")
        raise

    duration_ms = (time.monotonic() - start) * 1000

    logger.info(
        f"{request.method} {request.url.path} -> {response.status_code} "
        f"({duration_ms:.0f}ms)"
    )

    return response


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """
    Catches anything that isn't already an HTTPException (those are
    handled by FastAPI itself with their own status code). Without
    this, an unexpected bug anywhere in a route produces a bare 500
    with no JSON body — this at least always gives the frontend
    something to display instead of a fetch that succeeds with an
    unparseable response.
    """

    logger.exception(f"Unhandled exception on {request.method} {request.url.path}")

    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal error: {exc.__class__.__name__}: {exc}"},
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