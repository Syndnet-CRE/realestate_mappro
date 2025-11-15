from sqlalchemy import Column, Integer, String, Text, ARRAY, TIMESTAMP, ForeignKey, BigInteger, Numeric
from sqlalchemy.dialects.postgresql import JSONB
from geoalchemy2 import Geometry
from geoalchemy2.functions import ST_AsGeoJSON
from sqlalchemy.orm import relationship
from datetime import datetime
import json

from app.database import Base


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    type = Column(String(50))
    tags = Column(ARRAY(Text))
    status = Column(String(50), default="pending")
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    files = relationship("DatasetFile", back_populates="dataset", cascade="all, delete-orphan")
    layers = relationship("Layer", back_populates="dataset", cascade="all, delete-orphan")


class DatasetFile(Base):
    __tablename__ = "dataset_files"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id", ondelete="CASCADE"))
    path = Column(Text, nullable=False)
    original_name = Column(String(255))
    file_type = Column(String(50))
    size_bytes = Column(BigInteger)
    uploaded_at = Column(TIMESTAMP, default=datetime.utcnow)

    # Relationships
    dataset = relationship("Dataset", back_populates="files")


class Layer(Base):
    __tablename__ = "layers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id", ondelete="CASCADE"))
    geom_type = Column(String(50))
    srid = Column(Integer, default=4326)
    bbox = Column(Geometry("POLYGON", srid=4326))
    metadata = Column(JSONB)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

    # Relationships
    dataset = relationship("Dataset", back_populates="layers")
    features = relationship("Feature", back_populates="layer", cascade="all, delete-orphan")


class Feature(Base):
    __tablename__ = "features"

    id = Column(Integer, primary_key=True, index=True)
    layer_id = Column(Integer, ForeignKey("layers.id", ondelete="CASCADE"))
    geom = Column(Geometry("GEOMETRY", srid=4326))
    properties = Column(JSONB)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

    # Relationships
    layer = relationship("Layer", back_populates="features")

    @property
    def geom_geojson(self):
        """Convert geometry to GeoJSON"""
        if self.geom:
            # This would need a database session to execute
            # For now, return a placeholder
            return {"type": "Point", "coordinates": [0, 0]}
        return None


class Parcel(Base):
    __tablename__ = "parcels"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id", ondelete="CASCADE"))
    geom = Column(Geometry("GEOMETRY", srid=4326))
    apn = Column(String(50))
    owner_name = Column(String(255))
    zoning = Column(String(50))
    lot_size = Column(Numeric)
    attributes = Column(JSONB)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

    @property
    def geom_geojson(self):
        """Convert geometry to GeoJSON"""
        if self.geom:
            # This would need a database session to execute
            # For now, return a placeholder
            return {"type": "Polygon", "coordinates": []}
        return None
