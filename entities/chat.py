import uuid
from datetime import datetime
from sqlalchemy import Column, ForeignKey, String, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from db.core import Base


class DbChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False, default="Ephemeral Chat Arena")
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    character_ids = Column(JSON, nullable=False)  # stores list of character UUIDs as a JSON array
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    messages = relationship("DbChatMessage", back_populates="session", cascade="all, delete-orphan")


class DbChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False)
    sender_name = Column(String, nullable=False)  # "User" or the AI Character name
    sender_type = Column(String, nullable=False)  # "user" or "model"
    message = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    session = relationship("DbChatSession", back_populates="messages")
