"""Map layer endpoints."""
from fastapi import APIRouter, HTTPException
from typing import List

from models.schemas import (
    LayerListResponse,
    Layer,
    LayerFeaturesRequest,
    LayerFeaturesResponse,
    LayerType,
)
from services.arcgis_client import arcgis_client

router = APIRouter(prefix="/layers", tags=["layers"])


# Mock layers for now (can be made dynamic later)
AVAILABLE_LAYERS = [
    Layer(
        id="parcels",
        name="Property Parcels",
        type=LayerType.PARCEL,
        visible=True,
        opacity=0.8,
        style={"color": "#3388ff", "weight": 2, "fillOpacity": 0.3},
        source="arcgis",
    ),
    Layer(
        id="zoning",
        name="Zoning Districts",
        type=LayerType.ZONING,
        visible=False,
        opacity=0.6,
        style={"color": "#ff6633", "weight": 1, "fillOpacity": 0.4},
        source="arcgis",
    ),
    Layer(
        id="flood",
        name="FEMA Flood Zones",
        type=LayerType.FLOOD,
        visible=False,
        opacity=0.5,
        style={"color": "#0066cc", "weight": 1, "fillOpacity": 0.2},
        source="fema",
    ),
]


@router.get("", response_model=LayerListResponse)
async def list_layers():
    """Get list of available map layers."""
    return LayerListResponse(layers=AVAILABLE_LAYERS, total=len(AVAILABLE_LAYERS))


@router.get("/{layer_id}", response_model=Layer)
async def get_layer(layer_id: str):
    """Get layer details."""
    layer = next((l for l in AVAILABLE_LAYERS if l.id == layer_id), None)
    if not layer:
        raise HTTPException(status_code=404, detail="Layer not found")
    return layer


@router.post("/{layer_id}/features", response_model=LayerFeaturesResponse)
async def get_layer_features(layer_id: str, request: LayerFeaturesRequest):
    """
    Get features for a map layer.

    For ArcGIS layers (parcels, zoning), this queries the ArcGIS REST API.
    For other layers, returns mock data or queries other sources.
    """
    # Validate layer exists
    layer = next((l for l in AVAILABLE_LAYERS if l.id == layer_id), None)
    if not layer:
        raise HTTPException(status_code=404, detail="Layer not found")

    # For ArcGIS-backed layers, query the API
    if layer.source == "arcgis" and layer_id in ["parcels", "zoning"]:
        try:
            # Build WHERE clause from filters
            where = "1=1"
            if request.filters:
                conditions = []
                for key, value in request.filters.items():
                    if isinstance(value, str):
                        conditions.append(f"{key} = '{value}'")
                    else:
                        conditions.append(f"{key} = {value}")
                where = " AND ".join(conditions)

            # Build geometry filter from bbox
            geometry = None
            if request.bbox:
                # Convert bbox to Esri JSON envelope
                geometry = {
                    "xmin": request.bbox[0],
                    "ymin": request.bbox[1],
                    "xmax": request.bbox[2],
                    "ymax": request.bbox[3],
                    "spatialReference": {"wkid": 4326},
                }

            # Query ArcGIS
            response = await arcgis_client.query_layer(
                layer=layer_id,
                where=where,
                geometry=geometry,
                return_geometry=True,
                max_records=request.limit,
            )

            # Return GeoJSON
            if response.geojson:
                return LayerFeaturesResponse(
                    type="FeatureCollection",
                    features=response.geojson["features"],
                    properties={"layer": layer_id, "total_count": response.total_count},
                )

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch layer features: {str(e)}")

    # For non-ArcGIS layers, return empty FeatureCollection (implement other sources as needed)
    return LayerFeaturesResponse(
        type="FeatureCollection",
        features=[],
        properties={"layer": layer_id, "message": "No features available for this layer"},
    )
