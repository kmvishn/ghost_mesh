import logging
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from auth.service import CurrentUser
from entities.ai_character import AICharacter
from tasks.task_generate_avatar import generate_avatar

from .models import AICharacterRequest


class AICharacterService:
    def __init__(self, db: Session):
        self.db = db

    def create_ai_character(
        self, request: AICharacterRequest, current_user: CurrentUser
    ):
        try:
            existing = (
                self.db.query(AICharacter)
                .filter(
                    AICharacter.name == request.name,
                    AICharacter.owner_id == current_user.get_uuid(),
                )
                .first()
            )

            if existing:
                raise HTTPException(
                    status_code=400, detail="Character with this name already exists"
                )

            new_ai_character = AICharacter(
                name=request.name,
                description=request.description,
                personality_traits=request.personality_traits,
                owner_id=current_user.get_uuid(),
            )
            self.db.add(new_ai_character)
            self.db.commit()
            generate_avatar.delay(ai_character_id=str(new_ai_character.id))
            return new_ai_character

        except Exception as e:
            logging.error(f"Failed to create AI character: {str(e)}")
            raise

    def get_ai_character(self, ai_character_id: UUID, current_user: CurrentUser):
        try:
            ai_character = (
                self.db.query(AICharacter)
                .filter(
                    AICharacter.id == ai_character_id,
                    AICharacter.owner_id == current_user.get_uuid(),
                )
                .first()
            )
            if not ai_character:
                raise HTTPException(status_code=404, detail="AI character not found")
            return ai_character

        except Exception as e:
            logging.error(f"Failed to get AI character: {str(e)}")
            raise

    def list_ai_characters(self, current_user: CurrentUser):
        try:
            stmt = select(
                AICharacter.id,
                AICharacter.name,
                AICharacter.description,
                AICharacter.personality_traits,
                AICharacter.avatar_url,
            ).where(AICharacter.owner_id == current_user.get_uuid())
            ai_characters = self.db.execute(stmt).mappings().all()
            return ai_characters
        except Exception as e:
            logging.error(f"Failed to list AI characters: {str(e)}")
            raise
