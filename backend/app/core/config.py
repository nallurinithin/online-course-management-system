from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SECRET_KEY: str = "supersecretjwtkey2024changeInProduction"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    DATABASE_URL: str = "sqlite:///./course_platform.db"
    ADMIN_SECRET_KEY: str = "admin-secret-2024"
    ADMIN_DEFAULT_EMAIL: str = "admin1@example.com"
    ADMIN_DEFAULT_PASSWORD: str = "Admin1@"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"
    S3_BUCKET_NAME: str = "course-platform-videos"
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
