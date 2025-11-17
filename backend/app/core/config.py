"""
Configuration settings for ScoutGPT backend
"""
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # App
    APP_NAME: str = "ScoutGPT"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    # Database
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/scoutgpt"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # AI/LLM
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    PERPLEXITY_API_KEY: str = ""

    # Data Sources
    CENSUS_API_KEY: str = ""
    FEMA_WMS_URL: str = "https://hazards.fema.gov/gis/nfhl/services/public/NFHL/MapServer/WMSServer"

    # ArcGIS
    ARCGIS_DALLAS_URL: str = "https://gis.dallascounty.org/arcgis/rest/services/"
    ARCGIS_HARRIS_URL: str = "https://pdata.hcad.org/ArcGIS/rest/services/"
    ARCGIS_TRAVIS_URL: str = "https://services.arcgis.com/0L95CJ0VTaxqcmED/"

    # File Upload
    MAX_UPLOAD_SIZE_MB: int = 100
    UPLOAD_DIR: str = "/tmp/scoutgpt_uploads"

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
