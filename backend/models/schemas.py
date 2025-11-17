"""Pydantic models for request/response validation."""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# ============================================================================
# ENUMS
# ============================================================================

class FileType(str, Enum):
    """Supported file types."""
    PDF = "pdf"
    CSV = "csv"
    XLSX = "xlsx"
    ZIP = "zip"
    SHAPEFILE = "shapefile"
    UNKNOWN = "unknown"


class ProcessingStatus(str, Enum):
    """File processing status."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class LayerType(str, Enum):
    """Map layer types."""
    PARCEL = "parcel"
    ZONING = "zoning"
    FLOOD = "flood"
    DEMOGRAPHIC = "demographic"
    CUSTOM = "custom"


# ============================================================================
# CHAT MODELS
# ============================================================================

class ChatMessage(BaseModel):
    """Chat message from user."""
    message: str = Field(..., min_length=1, max_length=10000)
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    """Chat response from Claude."""
    reply: str
    conversation_id: str
    sources: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


# ============================================================================
# FILE UPLOAD MODELS
# ============================================================================

class UploadResponse(BaseModel):
    """Response after file upload."""
    file_id: str
    filename: str
    file_type: FileType
    size_bytes: int
    status: ProcessingStatus
    message: str
    extracted_files: Optional[List[str]] = None


class FileProcessingResult(BaseModel):
    """Result of file processing."""
    file_id: str
    filename: str
    file_type: FileType
    status: ProcessingStatus
    records_processed: int = 0
    errors: List[str] = []
    metadata: Dict[str, Any] = {}


# ============================================================================
# DOCUMENT RAG MODELS
# ============================================================================

class DocumentChunk(BaseModel):
    """A chunk of text from a processed document."""
    chunk_id: str
    document_id: str
    document_name: str
    content: str
    page_number: Optional[int] = None
    metadata: Dict[str, Any] = {}


class DocumentSearchRequest(BaseModel):
    """Request to search documents."""
    query: str = Field(..., min_length=1, max_length=500)
    max_results: int = Field(default=5, ge=1, le=20)
    filters: Optional[Dict[str, Any]] = None


class DocumentSearchResult(BaseModel):
    """Single search result from RAG."""
    document_name: str
    content: str
    page_number: Optional[int] = None
    relevance_score: float
    metadata: Dict[str, Any] = {}


class DocumentSearchResponse(BaseModel):
    """Response with search results."""
    query: str
    results: List[DocumentSearchResult]
    total_found: int


# ============================================================================
# ARCGIS MODELS
# ============================================================================

class ArcGISQueryRequest(BaseModel):
    """Request to query ArcGIS REST API."""
    layer: str = Field(..., description="Layer name: parcels, zoning, etc.")
    where: str = Field(default="1=1", description="SQL WHERE clause")
    geometry: Optional[Dict[str, Any]] = Field(None, description="Spatial filter geometry")
    return_geometry: bool = Field(default=True, description="Include geometries in response")
    max_records: int = Field(default=100, ge=1, le=2000)


class ArcGISFeature(BaseModel):
    """Single feature from ArcGIS."""
    attributes: Dict[str, Any]
    geometry: Optional[Dict[str, Any]] = None


class ArcGISQueryResponse(BaseModel):
    """Response from ArcGIS query."""
    features: List[ArcGISFeature]
    total_count: int
    layer: str
    geojson: Optional[Dict[str, Any]] = None


# ============================================================================
# DATASET MODELS
# ============================================================================

class Dataset(BaseModel):
    """Dataset metadata."""
    id: str
    name: str
    status: ProcessingStatus
    record_count: int = 0
    created_at: datetime
    updated_at: datetime
    file_type: FileType
    metadata: Dict[str, Any] = {}


class DatasetListResponse(BaseModel):
    """List of datasets."""
    datasets: List[Dataset]
    total: int


# ============================================================================
# MAP LAYER MODELS
# ============================================================================

class Layer(BaseModel):
    """Map layer metadata."""
    id: str
    name: str
    type: LayerType
    visible: bool = True
    opacity: float = Field(default=1.0, ge=0.0, le=1.0)
    style: Optional[Dict[str, Any]] = None
    source: Optional[str] = None


class LayerListResponse(BaseModel):
    """List of available map layers."""
    layers: List[Layer]
    total: int


class LayerFeaturesRequest(BaseModel):
    """Request for layer features."""
    layer_id: str
    bbox: Optional[List[float]] = Field(None, description="Bounding box [minX, minY, maxX, maxY]")
    filters: Optional[Dict[str, Any]] = None
    limit: int = Field(default=1000, ge=1, le=10000)


class LayerFeaturesResponse(BaseModel):
    """GeoJSON FeatureCollection response."""
    type: str = "FeatureCollection"
    features: List[Dict[str, Any]]
    properties: Optional[Dict[str, Any]] = None


# ============================================================================
# PROPERTY MODELS
# ============================================================================

class Property(BaseModel):
    """Property record."""
    id: str
    address: str
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price: Optional[float] = None
    sqft: Optional[float] = None
    beds: Optional[int] = None
    baths: Optional[float] = None
    property_type: Optional[str] = None
    year_built: Optional[int] = None
    lot_size: Optional[float] = None
    zoning: Optional[str] = None
    metadata: Dict[str, Any] = {}


class PropertySearchRequest(BaseModel):
    """Request to search properties."""
    query: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_sqft: Optional[float] = None
    max_sqft: Optional[float] = None
    property_types: Optional[List[str]] = None
    bbox: Optional[List[float]] = None
    limit: int = Field(default=100, ge=1, le=1000)


class PropertySearchResponse(BaseModel):
    """Response with property search results."""
    properties: List[Property]
    total: int
    query: Optional[str] = None


# ============================================================================
# HEALTH CHECK
# ============================================================================

class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    version: str
    database: str
    timestamp: datetime
