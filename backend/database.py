"""
Database connection and models for PostGIS and RAG
"""
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, JSON, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from geoalchemy2 import Geometry
from pgvector.sqlalchemy import Vector
import os
from datetime import datetime

# Database URL from environment variable
DATABASE_URL = os.getenv("DATABASE_URL")

# SQLAlchemy setup
Base = declarative_base()
engine = None
SessionLocal = None

if DATABASE_URL:
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    print(f"✅ Database connected: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'configured'}")
else:
    print("⚠️ DATABASE_URL not set - database features disabled")


# Database Models
class Building(Base):
    """OSM Building footprints"""
    __tablename__ = "buildings"

    id = Column(Integer, primary_key=True, index=True)
    osm_id = Column(String, unique=True, index=True)
    name = Column(String, nullable=True)
    building_type = Column(String, nullable=True)
    address = Column(String, nullable=True)
    city = Column(String, index=True)
    state = Column(String, default="TX")
    zip_code = Column(String, nullable=True)
    height = Column(Float, nullable=True)
    levels = Column(Integer, nullable=True)
    geometry = Column(Geometry('POLYGON', srid=4326))
    created_at = Column(DateTime, default=datetime.utcnow)


class Parcel(Base):
    """Property parcels from county GIS"""
    __tablename__ = "parcels"

    id = Column(Integer, primary_key=True, index=True)
    parcel_id = Column(String, unique=True, index=True)
    owner_name = Column(String, nullable=True)
    address = Column(String, nullable=True)
    city = Column(String, index=True)
    county = Column(String, index=True)
    state = Column(String, default="TX")
    zip_code = Column(String, nullable=True)
    assessed_value = Column(Float, nullable=True)
    land_use = Column(String, nullable=True)
    zoning = Column(String, nullable=True, index=True)
    lot_size = Column(Float, nullable=True)  # square feet
    geometry = Column(Geometry('POLYGON', srid=4326))
    created_at = Column(DateTime, default=datetime.utcnow)


class FloodZone(Base):
    """FEMA flood zones"""
    __tablename__ = "flood_zones"

    id = Column(Integer, primary_key=True, index=True)
    fema_id = Column(String, index=True)
    zone_type = Column(String, index=True)  # A, AE, X, etc.
    flood_risk = Column(String)  # High, Moderate, Low
    description = Column(Text, nullable=True)
    geometry = Column(Geometry('MULTIPOLYGON', srid=4326))
    created_at = Column(DateTime, default=datetime.utcnow)


class Road(Base):
    """Road network from OSM"""
    __tablename__ = "roads"

    id = Column(Integer, primary_key=True, index=True)
    osm_id = Column(String, unique=True, index=True)
    name = Column(String, nullable=True, index=True)
    road_type = Column(String, index=True)  # highway, residential, etc.
    surface = Column(String, nullable=True)
    lanes = Column(Integer, nullable=True)
    max_speed = Column(Integer, nullable=True)
    geometry = Column(Geometry('LINESTRING', srid=4326))
    created_at = Column(DateTime, default=datetime.utcnow)


class ATTOMProperty(Base):
    """ATTOM property data - combines AVM, Recorder, Tax Assessor, Parcel, and Flood data"""
    __tablename__ = "attom_properties"

    id = Column(Integer, primary_key=True, index=True)
    attom_id = Column(String, unique=True, index=True)

    # Location
    address = Column(String, index=True)
    city = Column(String, index=True)
    state = Column(String, default="TX")
    zip_code = Column(String, index=True)
    county = Column(String, index=True)

    # Property Characteristics
    bedrooms = Column(Integer, nullable=True, index=True)
    bathrooms = Column(Float, nullable=True)
    square_feet = Column(Integer, nullable=True, index=True)
    lot_size_sqft = Column(Float, nullable=True)
    year_built = Column(Integer, nullable=True, index=True)
    property_type = Column(String, nullable=True, index=True)  # Single Family, Condo, etc.

    # AVM (Automated Valuation Model)
    avm_value = Column(Float, nullable=True, index=True)
    avm_high = Column(Float, nullable=True)
    avm_low = Column(Float, nullable=True)
    avm_date = Column(DateTime, nullable=True)
    fsd_estimate = Column(Float, nullable=True)  # Foreclosure sale estimate
    confidence_score = Column(Float, nullable=True)

    # Recorder (Deed/Ownership)
    owner_name = Column(String, nullable=True, index=True)
    owner_occupied = Column(String, nullable=True)  # Y/N
    deed_date = Column(DateTime, nullable=True)
    deed_type = Column(String, nullable=True)
    sale_price = Column(Float, nullable=True, index=True)
    sale_date = Column(DateTime, nullable=True, index=True)

    # Tax Assessor
    assessed_total_value = Column(Float, nullable=True, index=True)
    assessed_land_value = Column(Float, nullable=True)
    assessed_improvement_value = Column(Float, nullable=True)
    tax_year = Column(Integer, nullable=True)
    tax_amount = Column(Float, nullable=True)

    # Flood Hazard
    flood_zone = Column(String, nullable=True, index=True)
    flood_risk = Column(String, nullable=True)  # High, Moderate, Low

    # Parcel Geometry
    geometry = Column(Geometry('POLYGON', srid=4326))

    # Metadata
    data_source = Column(String, default="ATTOM")
    upload_batch_id = Column(String, nullable=True, index=True)  # Track which upload this came from
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Document(Base):
    """Uploaded documents for RAG (PDFs, market reports, appraisals, etc.)"""
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    file_type = Column(String)  # pdf, xlsx, csv, etc.
    file_size = Column(Integer)  # bytes
    upload_batch_id = Column(String, nullable=True, index=True)

    # Document metadata
    title = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=True, index=True)  # appraisal, market_report, due_diligence, etc.
    location = Column(String, nullable=True, index=True)  # City/area this doc relates to

    # Extracted content
    text_content = Column(Text, nullable=True)  # Full text extracted from document
    page_count = Column(Integer, nullable=True)
    metadata_json = Column(JSON, nullable=True)  # Additional metadata (author, date, etc.)

    created_at = Column(DateTime, default=datetime.utcnow)


class DocumentChunk(Base):
    """Text chunks from documents with embeddings for semantic search (RAG)"""
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, index=True)  # References documents.id

    # Chunk content
    chunk_text = Column(Text)
    chunk_index = Column(Integer)  # Order within document
    page_number = Column(Integer, nullable=True)

    # Embedding for semantic search (384 dimensions for sentence-transformers/all-MiniLM-L6-v2)
    embedding = Column(Vector(384))

    # Metadata for better retrieval
    char_count = Column(Integer)
    word_count = Column(Integer)

    created_at = Column(DateTime, default=datetime.utcnow)


def get_db():
    """Get database session"""
    if SessionLocal is None:
        return None
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all database tables and enable extensions"""
    if engine:
        # Enable pgvector extension for vector similarity search
        try:
            with engine.connect() as conn:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
                conn.commit()
                print("✅ pgvector extension enabled")
        except Exception as e:
            print(f"⚠️ pgvector extension warning: {e}")

        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
    else:
        print("❌ Cannot create tables - no database connection")
