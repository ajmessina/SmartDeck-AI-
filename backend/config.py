from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import Set, Optional

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "SmartDeck AI"
    APP_VERSION: str = "2.0.0"
    
    # Environment
    ENV: str = Field("development", description="Environment: development, production")
    
    # API Keys
    GEMINI_API_KEY: Optional[str] = Field(None, description="API Key for Google Gemini")
    
    # Security Constants
    MAX_FILE_SIZE: int = Field(50 * 1024 * 1024, description="50MB")
    MAX_FILES_PER_REQUEST: int = 10
    MAX_TOTAL_UPLOAD_SIZE: int = Field(200 * 1024 * 1024, description="200MB")
    ALLOWED_EXTENSIONS: Set[str] = {'.txt', '.csv', '.xlsx', '.xls', '.docx', '.doc', '.pdf'}
    
    # Rate Limiting
    RATE_LIMIT_ANALYZE: str = "5/minute"
    RATE_LIMIT_GENERATE: str = "10/minute"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding='utf-8', extra="ignore")

    def is_gemini_enabled(self) -> bool:
        return bool(self.GEMINI_API_KEY)

settings = Settings()
