from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime


# Dataset Schemas
class DatasetBase(BaseModel):
    name: str
    description: Optional[str] = None
    type: Optional[str] = None
    tags: Optional[List[str]] = []


class DatasetCreate(DatasetBase):
    pass


class Dataset(DatasetBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Layer Schemas
class LayerBase(BaseModel):
    name: str
    dataset_id: Optional[int] = None
    geom_type: Optional[str] = None
    srid: int = 4326
    metadata: Optional[Dict[str, Any]] = None


class Layer(LayerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Ingestion Config
class IngestConfig(BaseModel):
    ingest_type: str  # 'osm_geofabrik', 'arcgis_feature_server', 'wfs_geojson', 'local_shapefile'
    options: Optional[Dict[str, Any]] = {}


# Chat Message
class ChatMessage(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None


# Training Config
class TrainConfig(BaseModel):
    dataset_id: int
    task_type: str  # 'zoning_explainer', 'document_summary', etc.
    options: Optional[Dict[str, Any]] = {}
