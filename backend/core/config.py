from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    GROQ_API_KEY: str
    GEMINI_API_KEY: str
    WHATSAPP_WEBHOOK_VERIFY_TOKEN: str
    WHATSAPP_API_TOKEN: str
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()
