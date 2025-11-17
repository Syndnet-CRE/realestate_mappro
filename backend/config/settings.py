"""Application settings and configuration."""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Application configuration from environment variables."""

    # Database
    database_url: str = "postgresql://localhost:5432/realestate_mappro"

    # API Keys
    anthropic_api_key: str = ""
    openai_api_key: str = ""

    # ArcGIS APIs
    arcgis_parcel_api: str = ""
    arcgis_zoning_api: str = ""

    # File Upload
    max_upload_size_mb: int = 100
    upload_dir: str = "./uploads"
    allowed_extensions: str = ".zip,.pdf,.csv,.xlsx,.shp,.dbf,.shx,.prj"

    # RAG Configuration
    embedding_model: str = "text-embedding-3-small"
    chunk_size: int = 1000
    chunk_overlap: int = 200
    max_chunks_per_query: int = 5

    # Claude Configuration
    claude_model: str = "claude-3-5-sonnet-20241022"
    max_tokens: int = 4096
    temperature: float = 0.7

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="allow"
    )


# Global settings instance
settings = Settings()
