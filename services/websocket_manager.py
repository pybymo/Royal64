from collections import defaultdict
from uuid import UUID

from fastapi import WebSocket


class WebSocketManager:

    def __init__(self):

        self.rooms: dict[
            UUID,
            list[WebSocket],
        ] = defaultdict(list)

    async def connect(

        self,

        game_id: UUID,

        websocket: WebSocket,

    ):

        await websocket.accept()

        self.rooms[game_id].append(
            websocket
        )

    async def disconnect(

        self,

        game_id: UUID,

        websocket: WebSocket,

    ):

        if game_id not in self.rooms:
            return

        if websocket in self.rooms[game_id]:

            self.rooms[game_id].remove(
                websocket
            )

        if not self.rooms[game_id]:

            del self.rooms[game_id]

    async def send(

        self,

        websocket: WebSocket,

        payload: dict,

    ):

        await websocket.send_json(
            payload
        )

    async def broadcast(

        self,

        game_id: UUID,

        payload: dict,

    ):

        if game_id not in self.rooms:
            return

        dead = []

        for ws in self.rooms[game_id]:

            try:

                await ws.send_json(
                    payload
                )

            except Exception:

                dead.append(ws)

        for ws in dead:

            self.rooms[game_id].remove(ws)

        if not self.rooms[game_id]:

            del self.rooms[game_id]