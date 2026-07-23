from uuid import UUID

from fastapi import APIRouter
from fastapi import WebSocket
from fastapi import WebSocketDisconnect

from services.websocket_manager import WebSocketManager


router = APIRouter()

manager = WebSocketManager()


@router.websocket("/ws/game/{game_id}")
async def game_socket(

    websocket: WebSocket,

    game_id: UUID,

):

    await manager.connect(

        game_id,

        websocket,

    )

    try:

        while True:

            payload = await websocket.receive_json()

            await manager.broadcast(

                game_id,

                payload,

            )

    except WebSocketDisconnect:

        await manager.disconnect(

            game_id,

            websocket,

        )