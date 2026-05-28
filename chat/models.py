from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class ChatSessionRequest(BaseModel):
    character_ids: list[UUID]
    title: str | None = None


class ChatSessionResponse(BaseModel):
    session_id: UUID
    websocket_url: str
    title: str
    character_ids: list[UUID]
    created_at: datetime


class ChatMessageResponse(BaseModel):
    sender_name: str
    sender_type: str
    message: str
    created_at: datetime
