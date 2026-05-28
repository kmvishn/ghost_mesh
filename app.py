from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import register_routes
from db.core import engine, Base
# Import all entities to ensure they are registered on Base
import entities.users
import entities.ai_character
import entities.chat

# Create all tables in database
Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_routes(app)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
