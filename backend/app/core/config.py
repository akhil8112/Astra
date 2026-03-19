from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    #The format for the database URL is: #postgresql://<user>:<password>@<host>:<port>/<dbname>
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60*24*8
    GEMINI_API_KEY: str
    ML_SERVICE_URL: str = "ws://localhost:8001/ws/track"
    DDS_SERVICE_URL: str

settings = Settings()