from uuid import UUID

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from database.session import SessionLocal
from services.game_loop_service import GameLoop, GameLoopError, authenticate, load_game
from services.websocket_manager import WebSocketManager

router = APIRouter()

manager = WebSocketManager()


@router.websocket("/ws/game/{game_id}")
async def game_socket(
    websocket: WebSocket,
    game_id: UUID,
    token: str | None = None,
):
    """
    Auth is via a `?token=` query param carrying the same session JWT
    issued by /auth/telegram — browsers can't attach custom headers to
    a WebSocket handshake, so a header-based Bearer token (as used
    everywhere else in this API) isn't an option here.
    """

    async with SessionLocal() as session:

        try:
            user = await authenticate(token, session)
            game = await load_game(game_id, user.id, session)

        except GameLoopError as exc:
            await websocket.accept()
            await websocket.send_json({"type": "error", "message": str(exc)})
            await websocket.close(code=4001)
            return

        loop = GameLoop(manager, session, game, user)

        await manager.connect(game_id, websocket)

        try:
            await loop.on_connect(websocket)

            while True:

                payload = await websocket.receive_json()

                try:
                    await loop.on_message(payload)

                except GameLoopError as exc:
                    await manager.send(websocket, {"type": "error", "message": str(exc)})

        except WebSocketDisconnect:
            await manager.disconnect(game_id, websocket)
