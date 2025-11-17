"""Database models and connection management."""
from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, Text, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import uuid

from config.settings import settings

# SQLAlchemy setup
Base = declarative_base()
engine = create_engine(settings.database_url, echo=settings.debug)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ============================================================================
# DATABASE MODELS
# ============================================================================

class DocumentModel(Base):
    """Stores uploaded documents and their metadata."""
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    size_bytes = Column(Integer, nullable=False)
    status = Column(String, default="pending")
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)
    metadata = Column(JSON, default={})


class DocumentChunkModel(Base):
    """Stores text chunks from processed documents for RAG."""
    __tablename__ = "document_chunks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, nullable=False, index=True)
    document_name = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    page_number = Column(Integer, nullable=True)
    chunk_index = Column(Integer, nullable=False)
    embedding = Column(JSON, nullable=True)  # Store as JSON array
    metadata = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)


class PropertyModel(Base):
    """Stores property data from CSV uploads or API imports."""
    __tablename__ = "properties"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    address = Column(String, nullable=False, index=True)
    city = Column(String, index=True)
    state = Column(String, index=True)
    zip_code = Column(String, index=True)
    latitude = Column(Float, index=True)
    longitude = Column(Float, index=True)
    price = Column(Float)
    sqft = Column(Float)
    beds = Column(Integer)
    baths = Column(Float)
    property_type = Column(String, index=True)
    year_built = Column(Integer)
    lot_size = Column(Float)
    zoning = Column(String)
    parcel_id = Column(String, index=True)
    metadata = Column(JSON, default={})
    source = Column(String, default="upload")  # upload, attom, arcgis, mls
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DatasetModel(Base):
    """Stores metadata about uploaded datasets."""
    __tablename__ = "datasets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    status = Column(String, default="pending")
    record_count = Column(Integer, default=0)
    file_path = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    metadata = Column(JSON, default={})


class ConversationModel(Base):
    """Stores chat conversation history."""
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_message = Column(Text, nullable=False)
    assistant_response = Column(Text, nullable=False)
    conversation_id = Column(String, index=True)
    sources = Column(JSON, default=[])
    metadata = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)


# ============================================================================
# DATABASE UTILITIES
# ============================================================================

def get_db():
    """Get database session (for dependency injection)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables."""
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")


def drop_db():
    """Drop all database tables (use with caution!)."""
    Base.metadata.drop_all(bind=engine)
    print("⚠️  Database tables dropped")


if __name__ == "__main__":
    # Run this file directly to initialize the database
    init_db()
