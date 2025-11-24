"""
Compatibility routes for frontend that expects different endpoint names
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel

from database import get_db, Property
from routes.upload import upload_csv, upload_geojson, upload_zip
from routes.properties import get_property_stats
from routes.arcgis import list_available_layers

router = APIRouter()


# Frontend expects /datasets instead of /api/properties/stats
@router.get("/datasets")
async def get_datasets(db: Session = Depends(get_db)):
    """
    Return datasets compatible with frontend expectations
    Maps to properties stats
    """
    stats = await get_property_stats(db)

    # Transform into dataset format frontend expects
    datasets = []

    if stats.get("total_properties", 0) > 0:
        # Group by city/county
        cities = stats.get("cities", [])
        for idx, city_info in enumerate(cities[:10]):
            datasets.append({
                "id": idx + 1,
                "name": f"{city_info.get('city', 'Unknown')}, {city_info.get('state', '')}",
                "status": "ready",
                "type": "properties",
                "count": stats.get("total_properties", 0) // len(cities) if cities else 0
            })
    else:
        # Return placeholder when no data
        datasets = [
            {"id": 1, "name": "No data uploaded", "status": "empty", "type": "none", "count": 0}
        ]

    return datasets


# Frontend expects /layers instead of /api/arcgis/layers
@router.get("/layers")
async def get_layers():
    """
    Return layers compatible with frontend expectations
    Maps to ArcGIS layers
    """
    arcgis_layers = await list_available_layers()

    # Transform into format frontend expects
    layers = []
    for idx, (name, url) in enumerate(arcgis_layers.get("endpoints", {}).items()):
        layers.append({
            "id": idx + 1,
            "name": name.replace("_", " ").title(),
            "type": "arcgis",
            "url": url,
            "visible": False
        })

    return layers


# Frontend expects /layers/:id/features
@router.get("/layers/{layer_id}/features")
async def get_layer_features(layer_id: int, db: Session = Depends(get_db)):
    """
    Return GeoJSON features for a layer
    For now, return properties as GeoJSON
    """
    from routes.properties import get_properties_geojson

    # Return properties as GeoJSON features
    return await get_properties_geojson(limit=500, db=db)


# Chat endpoint without /api prefix
class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = "default"


@router.post("/chat")
async def chat_message(request: ChatMessage, db: Session = Depends(get_db)):
    """
    Chat endpoint compatible with frontend expectations
    Maps to /api/chat/message
    """
    from routes.chat import send_message, ChatRequest

    chat_req = ChatRequest(
        message=request.message,
        session_id=request.session_id,
        include_context=True
    )

    response = await send_message(chat_req, db)

    # Transform response to frontend format
    return {
        "reply": response.response,
        "session_id": response.session_id,
        "timestamp": response.timestamp
    }


# Upload endpoint that frontend expects
@router.post("/api/upload-data")
async def upload_data(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Universal upload endpoint that detects file type and routes appropriately
    """
    filename = file.filename.lower()

    if filename.endswith('.zip'):
        return await upload_zip(file, db)
    elif filename.endswith('.csv'):
        return await upload_csv(file, db)
    elif filename.endswith(('.geojson', '.json')):
        return await upload_geojson(file, db)
    else:
        raise HTTPException(400, f"Unsupported file type: {filename}. Supported: .zip, .csv, .geojson")
