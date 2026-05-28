from uuid import UUID, uuid4
from fastapi import APIRouter, HTTPException, Depends
from starlette import status

from auth.service import CurrentUser
from db.core import DbSession
from entities.ai_character import AICharacter
from entities.chat import DbChatSession, DbChatMessage

from . import models, service

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/sessions", response_model=models.ChatSessionResponse)
def create_session(
    payload: models.ChatSessionRequest,
    current_user: CurrentUser,
    db: DbSession,
):
    user_id = current_user.get_uuid()
    
    # 1. Validate character ownership
    owned = (
        db.query(AICharacter)
        .filter(AICharacter.owner_id == user_id, AICharacter.id.in_(payload.character_ids))
        .all()
    )
    if len(owned) != len(payload.character_ids):
        raise HTTPException(status_code=403, detail="Character ownership mismatch")

    # 2. Determine title
    title = payload.title
    if not title:
        names = [char.name for char in owned]
        title = f"Resonance with {', '.join(names)}" if names else "Ghost Session"

    # 3. Create persistent DB chat session
    session_id = uuid4()
    db_session = DbChatSession(
        id=session_id,
        title=title,
        user_id=user_id,
        character_ids=[str(cid) for cid in payload.character_ids]
    )
    db.add(db_session)
    
    # Add initial system message to persist in DB
    init_msg = DbChatMessage(
        id=uuid4(),
        session_id=session_id,
        sender_name="System",
        sender_type="system",
        message="Resonance channel established successfully."
    )
    db.add(init_msg)
    db.commit()
    db.refresh(db_session)

    # 4. Initialize session in celery/websocket memory manager
    service.session_manager.create_persistent_session(
        session_id=session_id,
        user_id=user_id,
        character_ids=payload.character_ids
    )

    ws_url = f"/ws/chat/{session_id}"
    return models.ChatSessionResponse(
        session_id=db_session.id,
        websocket_url=ws_url,
        title=db_session.title,
        character_ids=payload.character_ids,
        created_at=db_session.created_at
    )


@router.get("/sessions", response_model=list[models.ChatSessionResponse])
def list_sessions(
    current_user: CurrentUser,
    db: DbSession,
):
    user_id = current_user.get_uuid()
    sessions = (
        db.query(DbChatSession)
        .filter(DbChatSession.user_id == user_id)
        .order_by(DbChatSession.created_at.desc())
        .all()
    )
    
    res = []
    for s in sessions:
        char_ids = [UUID(cid) for cid in s.character_ids]
        ws_url = f"/ws/chat/{s.id}"
        res.append(
            models.ChatSessionResponse(
                session_id=s.id,
                websocket_url=ws_url,
                title=s.title,
                character_ids=char_ids,
                created_at=s.created_at
            )
        )
    return res


@router.get("/sessions/{session_id}/messages", response_model=list[models.ChatMessageResponse])
def get_session_messages(
    session_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
):
    user_id = current_user.get_uuid()
    
    # Verify ownership of session
    db_session = (
        db.query(DbChatSession)
        .filter(DbChatSession.id == session_id, DbChatSession.user_id == user_id)
        .first()
    )
    if not db_session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    messages = (
        db.query(DbChatMessage)
        .filter(DbChatMessage.session_id == session_id)
        .order_by(DbChatMessage.created_at.asc())
        .all()
    )

    return [
        models.ChatMessageResponse(
            sender_name=m.sender_name,
            sender_type=m.sender_type,
            message=m.message,
            created_at=m.created_at
        )
        for m in messages
    ]
