from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "postgresql://clusterxview:clusterxview@db:5432/clusterxview"
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    SEED_DEMO: bool = True
    DOCUMENTS_DIR: str = "/data/documents"
    BACKUPS_DIR: str = "/data/backups"


settings = Settings()
