import json
import secrets
from collections import defaultdict
from uuid import UUID

from fastapi import HTTPException, WebSocket
from sqlalchemy.orm import Session

from config import settings
from db.redis import redis_client
from entities.ai_character import AICharacter


class ChatSessionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = defaultdict(list)

    def create(self, user_id: UUID, character_ids: list[UUID], db: Session) -> str:
        owned = (
            db.query(AICharacter.id)
            .filter(AICharacter.owner_id == user_id, AICharacter.id.in_(character_ids))
            .all()
        )
        if len(owned) != len(character_ids):
            raise HTTPException(status_code=403, detail="Character ownership mismatch")
        session_id = secrets.token_urlsafe(16)
        redis_client.set(f"session:{session_id}:owner_id", str(user_id))
        if character_ids:
            redis_client.sadd(
                f"session:{session_id}:characters", *[str(cid) for cid in character_ids]
            )
        redis_client.lpush(
            f"session:{session_id}:messages",
            json.dumps({"user": "Begin"}),
        )
        self.refresh_ttl(session_id)
        return session_id

    def create_persistent_session(self, session_id: UUID, user_id: UUID, character_ids: list[UUID]) -> None:
        sid = str(session_id)
        redis_client.set(f"session:{sid}:owner_id", str(user_id))
        if character_ids:
            redis_client.sadd(
                f"session:{sid}:characters", *[str(cid) for cid in character_ids]
            )
        self.refresh_ttl(sid)

    def get_ai_characters(self, session_id: str):
        return [
            UUID(cid)
            for cid in redis_client.smembers(f"session:{session_id}:characters")
        ]

    def get_owner(self, session_id: str):
        id = redis_client.get(f"session:{session_id}:owner_id")
        if not id:
            return None
        return UUID(id)

    def add_connection(self, session_id: str, websocket: WebSocket):
        self.active_connections[session_id].append(websocket)

    def remove_connection(self, session_id: str, websocket: WebSocket):
        if session_id in self.active_connections:
            try:
                self.active_connections[session_id].remove(websocket)
                if not self.active_connections[session_id]:
                    self.active_connections.pop(session_id)
            except ValueError:
                pass

    def get_connections(self, session_id: str):
        return self.active_connections.get(session_id, [])

    def discard(self, session_id: str):
        redis_client.delete(f"session:{session_id}:messages")
        redis_client.delete(f"session:{session_id}:characters")
        redis_client.delete(f"session:{session_id}:owner_id")
        self.active_connections.pop(session_id, None)

    def add_message(self, session_id: str, message: str):
        redis_client.rpush(f"session:{session_id}:messages", json.dumps(message))

    def get_messages(self, session_id: str):
        msgs = [
            json.loads(m)
            for m in redis_client.lrange(f"session:{session_id}:messages", 0, -1)
        ]
        return msgs

    def refresh_ttl(self, session_id: str):
        redis_client.expire(f"session:{session_id}:messages", settings.CHAT_SESSION_TTL)
        redis_client.expire(
            f"session:{session_id}:characters", settings.CHAT_SESSION_TTL
        )
        redis_client.expire(f"session:{session_id}:owner_id", settings.CHAT_SESSION_TTL)


session_manager = ChatSessionManager()
