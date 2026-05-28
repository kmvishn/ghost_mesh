from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    DATABASE_URL: str
    GEMINI_API_KEY: str
    REDIS_URL: str
    REDIS_CELERY_BROKER: str
    CHAT_SESSION_TTL: int = 3600
    AWS_ENDPOINT_URL: str
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_REGION_NAME: str
    AWS_BUCKET_FOR_IMAGES: str
    IMAGE_PUBLIC_ACCESS_URL: str
    GEMINI_CHAT_MODEL: str
    GEMINI_IMG_GEN_MODEL: str

    class Config:
        env_file = ".env"


settings = Settings()
