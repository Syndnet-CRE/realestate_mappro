"""
Database connection and models for PostGIS
"""
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from geoalchemy2 import Geometry
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
    """Create all database tables"""
    if engine:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
    else:
        print("❌ Cannot create tables - no database connection")
