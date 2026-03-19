import asyncio
import aiohttp
from typing import Annotated
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from app.api.deps import get_current_user_from_token # <-- IMPORT THE NEW FUNCTION
from app.models.user import User

router = APIRouter()

# (The ConnectionManager class remains exactly the same)
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def broadcast_to_user(self, user_id: int, message: str):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(message)

manager = ConnectionManager()


async def connect_to_ml_service(user_id: int):
    ml_service_url = "ws://localhost:8001/ws/track"
    try:
        async with aiohttp.ClientSession() as session:
            async with session.ws_connect(ml_service_url) as ws_ml:
                print(f"Main backend connected to ML service for user {user_id}")
                async for msg in ws_ml:
                    if msg.type == aiohttp.WSMsgType.TEXT:
                        await manager.broadcast_to_user(user_id, msg.data)
                    elif msg.type == aiohttp.WSMsgType.ERROR:
                        break
    except Exception as e:
        print(f"Error connecting to ML service for user {user_id}: {e}")
    finally:
        print(f"Connection to ML service closed for user {user_id}")


@router.websocket("/ws/sensory-gym")
async def websocket_endpoint(
    websocket: WebSocket,
    # vvv THIS IS THE CRITICAL CHANGE vvv
    # Use the new dependency that reads the token from the query parameter
    current_user: Annotated[User, Depends(get_current_user_from_token)]
):
    user_id = current_user.id
    await manager.connect(user_id, websocket)
    ml_task = asyncio.create_task(connect_to_ml_service(user_id))
    
    try:
        while True:
            await websocket.receive_text() 
    except WebSocketDisconnect:
        print(f"User {user_id} disconnected from the main backend.")
        manager.disconnect(user_id)
        ml_task.cancel()