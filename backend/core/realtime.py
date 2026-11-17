"""
Golden Hackathon Starter — Real-Time WebSocket Hub
Provides /ws/live for bidirectional event streaming & toast notifications.
"""

import json
from typing import List, Dict, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from core.envelope import success_response

router = APIRouter(tags=["Real-Time"])


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, event_type: str, payload: Dict[str, Any]):
        message = json.dumps({"type": event_type, "payload": payload})
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                dead_connections.append(connection)
        for dc in dead_connections:
            self.disconnect(dc)


ws_manager = ConnectionManager()


@router.websocket("/ws/live")
async def websocket_live_endpoint(websocket: WebSocket):
    """
    Live WebSocket stream for instant notifications and toast messages.
    """
    await ws_manager.connect(websocket)
    try:
        # Welcome message
        await websocket.send_text(json.dumps({
            "type": "CONNECTION_ESTABLISHED",
            "payload": {"message": "Connected to Golden Hackathon Live Event Stream"}
        }))
        while True:
            data_text = await websocket.receive_text()
            try:
                data = json.loads(data_text)
                # Handle client ping
                if data.get("type") == "PING":
                    await websocket.send_text(json.dumps({"type": "PONG", "payload": {}}))
                elif data.get("type") == "ECHO":
                    await websocket.send_text(json.dumps({"type": "ECHO_REPLY", "payload": data.get("payload", {})}))
            except Exception:
                pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)


class BroadcastRequest(BaseModel):
    event_type: str = "NOTIFICATION"
    title: str = "Alert"
    message: str
    severity: str = "info"  # info, success, warning, error


@router.post("/api/realtime/broadcast")
async def trigger_broadcast(req: BroadcastRequest):
    """
    Manually push a broadcast event to all active dashboard clients.
    """
    payload = {
        "title": req.title,
        "message": req.message,
        "severity": req.severity,
    }
    await ws_manager.broadcast(req.event_type, payload)
    return success_response(
        data={"activeClients": len(ws_manager.active_connections), "event": req.event_type},
        message="Broadcast dispatched to connected clients",
    )
