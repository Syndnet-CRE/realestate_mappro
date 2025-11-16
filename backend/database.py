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
