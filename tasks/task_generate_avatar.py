import os
import uuid
from contextlib import closing
from datetime import datetime

from ai_agent.gemini_model import generate_image
from celery_app import celery_client
from config import settings
from db.core import SessionLocal
from db.s3_storage import upload_file
from utils.compress_image import compress_image_under_300kb


@celery_client.task
def generate_avatar(ai_character_id: str):
    import entities.users
    import entities.chat
    from entities.ai_character import AICharacter

    BASE_PROMPT = (
        "For the AI character description create a cartoonish avatar,description:"
    )
    generated_image_path = None
    try:
        with closing(SessionLocal()) as db:
            ai_character = (
                db.query(AICharacter)
                .filter(AICharacter.id == uuid.UUID(ai_character_id))
                .first()
            )
            if not ai_character:
                raise ValueError(f"AI character not found with ID: {ai_character_id}")
            generated_image_path = generate_image(
                description=BASE_PROMPT
                + ai_character.description
                + " personality traits: "
                + ai_character.personality_traits
                + " name: "
                + ai_character.name
            )
            if not generated_image_path:
                raise RuntimeError("Failed to generate avatar")
            compress_image_under_300kb(generated_image_path, generated_image_path)
            object_name = (
                f"{ai_character_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.png"
            )
            public_url = upload_file(
                file_path=generated_image_path,
                bucket=settings.AWS_BUCKET_FOR_IMAGES,
                object_name=object_name,
            )
            if not public_url:
                raise RuntimeError("Failed to upload avatar to S3")
            ai_character.avatar_url = public_url
            db.add(ai_character)
            db.commit()
    except Exception as e:
        print(f"Error generating avatar for AI character {ai_character_id}: {e}")
    finally:
        if generated_image_path:
            os.remove(generated_image_path)
