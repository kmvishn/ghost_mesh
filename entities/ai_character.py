import uuid

from sqlalchemy import Column, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from db.core import Base


class AICharacter(Base):
    __tablename__ = "ai_characters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=False, nullable=False)
    description = Column(String, nullable=False)
    personality_traits = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="ai_characters")

    __table_args__ = (UniqueConstraint("name", "owner_id", name="_name_owner_uc"),)

    def __repr__(self):
        return f"<AICharacter(name='{self.name}', description='{self.description}')>"
