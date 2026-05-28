from uuid import UUID

from pydantic import BaseModel


class AICharacterRequest(BaseModel):
    name: str
    description: str
    personality_traits: str


class AICharacterResponse(AICharacterRequest):
    id: UUID
    avatar_url: str | None = None


class AICharacterListResponse(BaseModel):
    id: UUID
    name: str
    description: str | None = None
    personality_traits: str | None = None
    avatar_url: str | None = None
