# chat/websocket.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from uuid import UUID, uuid4

from ai_agent.gemini_model import generate_ai_character_response
from auth.service import verify_token
from db.core import SessionLocal
from exceptions import AuthenticationError
from entities.chat import DbChatSession, DbChatMessage

from .service import session_manager

ws_router = APIRouter()


@ws_router.websocket("/ws/chat/{session_id}")
async def chat_socket(          
    websocket: WebSocket,
    session_id: str,
):
    token = websocket.query_params.get("token")
    if not token:
        auth_header = websocket.headers.get("Authorization")
        if auth_header and auth_header.lower().startswith("bearer "):
            token = auth_header.split(" ", 1)[1]

    if not token:
        await websocket.close(code=4401)
        return

    try:
        current_user = verify_token(token)
    except AuthenticationError:
        await websocket.close(code=4401)
        return

    db = SessionLocal()
    try:
        # 1. Hot-load session from DB if not present in memory cache
        owner = session_manager.get_owner(session_id)
        if not owner:
            try:
                db_sess = db.query(DbChatSession).filter(DbChatSession.id == UUID(session_id)).first()
                if db_sess:
                    session_manager.create_persistent_session(
                        session_id=db_sess.id,
                        user_id=db_sess.user_id,
                        character_ids=[UUID(cid) for cid in db_sess.character_ids]
                    )
                    owner = db_sess.user_id
            except Exception as e:
                print(f"Error hot-loading session from DB: {e}")

        if not owner or owner != current_user.get_uuid():
            await websocket.close(code=4403)
            return

        await websocket.accept()
        session_manager.add_connection(session_id, websocket)

        # 2. Push historical messages from DB to the client immediately on link setup
        try:
            past_messages = (
                db.query(DbChatMessage)
                .filter(DbChatMessage.session_id == UUID(session_id))
                .order_by(DbChatMessage.created_at.asc())
                .all()
            )
            for pm in past_messages:
                if pm.sender_type == "system":
                    continue
                await websocket.send_json({
                    "name": pm.sender_name,
                    "message": pm.message
                })
        except Exception as e:
            print(f"Failed to push past messages: {e}")

        try:
            while True:
                payload = await websocket.receive_json()

                # 3. Persist incoming user message to PostgreSQL
                try:
                    db_user_msg = DbChatMessage(
                        id=uuid4(),
                        session_id=UUID(session_id),
                        sender_name=payload.get("name", "User"),
                        sender_type="user",
                        message=payload.get("message", "")
                    )
                    db.add(db_user_msg)
                    db.commit()
                except Exception as e:
                    print(f"Failed to persist user message in DB: {e}")
                    db.rollback()

                session_manager.add_message(session_id, payload)
                session_manager.refresh_ttl(session_id)
                
                # Broadcast payload to other active connections in the session
                for conn in list(session_manager.get_connections(session_id)):
                    if conn != websocket:
                        try:
                            await conn.send_json(payload)
                        except Exception:
                            session_manager.remove_connection(session_id, conn)

                # Generate AI responses concurrently
                await generate_ai_character_response(
                    session_manager.get_ai_characters(session_id),
                    session_manager.get_messages(session_id),
                    db,
                    websocket,
                    session_id,
                )

        except WebSocketDisconnect:
            session_manager.remove_connection(session_id, websocket)
        except Exception as exc:
            try:
                await websocket.send_json({"error": str(exc)})
            except Exception:
                pass
            await websocket.close()
    finally:
        db.close()
