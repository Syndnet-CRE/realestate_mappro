"""
Database models using SQLAlchemy
"""
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, Index, DECIMAL
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(String(50), default="user")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    properties = relationship("Property", back_populates="user", cascade="all, delete-orphan")
    uploads = relationship("Upload", back_populates="user", cascade="all, delete-orphan")
    deals = relationship("Deal", back_populates="user", cascade="all, delete-orphan")
    watchlist = relationship("Watchlist", back_populates="user", cascade="all, delete-orphan")

class Property(Base):
    __tablename__ = "properties"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    parcel_id = Column(String(100), index=True)
    address = Column(String(255), nullable=False)
    city = Column(String(100))
    state = Column(String(2))
    zip = Column(String(10))
    county = Column(String(100), index=True)
    latitude = Column(DECIMAL(10, 8))
    longitude = Column(DECIMAL(11, 8))
    property_type = Column(String(50), index=True)
    price = Column(DECIMAL(15, 2))
    sqft = Column(Integer)
    beds = Column(Integer)
    baths = Column(Float)
    cap_rate = Column(Float)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"))
    source = Column(String(50), index=True)  # "api", "upload", "mls"
    metadata = Column(JSONB)  # Flexible storage for additional data
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="properties")
    deals = relationship("Deal", back_populates="property")

    # Indexes
    __table_args__ = (
        Index("idx_location", "latitude", "longitude"),
        Index("idx_price", "price"),
    )

class Upload(Base):
    __tablename__ = "uploads"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50))  # "zip", "csv", "xlsx", "pdf", "shapefile"
    file_size = Column(Integer)  # Size in bytes
    status = Column(String(50), default="processing", index=True)  # "processing", "completed", "failed"
    records_imported = Column(Integer, default=0)
    error_message = Column(Text)
    metadata = Column(JSONB)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    user = relationship("User", back_populates="uploads")

class Embedding(Base):
    __tablename__ = "embeddings"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    metadata = Column(JSONB)
    # Note: vector column for pgvector will be added via raw SQL migration
    # embedding = Column(Vector(1536))
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_user_embeddings", "user_id"),
    )

class APICache(Base):
    __tablename__ = "api_cache"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    cache_key = Column(String(255), unique=True, nullable=False, index=True)
    response_data = Column(JSONB, nullable=False)
    expires_at = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Deal(Base):
    __tablename__ = "deals"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    property_id = Column(UUID(as_uuid=False), ForeignKey("properties.id", ondelete="SET NULL"))
    property_address = Column(String(255), nullable=False)
    stage = Column(String(50), default="interest", index=True)
    priority = Column(String(20), default="medium", index=True)
    asking_price = Column(DECIMAL(15, 2))
    offer_price = Column(DECIMAL(15, 2))
    estimated_value = Column(DECIMAL(15, 2))
    metadata = Column(JSONB)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="deals")
    property = relationship("Property", back_populates="deals")

class Watchlist(Base):
    __tablename__ = "watchlists"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    property_id = Column(UUID(as_uuid=False), ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="watchlist")

    __table_args__ = (
        Index("idx_user_watchlist", "user_id", "property_id", unique=True),
    )

class SavedSearch(Base):
    __tablename__ = "saved_searches"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    filters = Column(JSONB, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Integration(Base):
    __tablename__ = "integrations"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)  # "arcgis", "census", "mls", "crm"
    status = Column(String(50), default="active")  # "active", "error", "paused"
    endpoint = Column(String(500))
    sync_frequency = Column(String(50), default="daily")
    configuration = Column(JSONB)
    last_sync = Column(DateTime)
    records_count = Column(Integer, default=0)
    error_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
