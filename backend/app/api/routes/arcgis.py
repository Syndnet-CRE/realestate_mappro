"""
ArcGIS REST API Integration
Zero-hosting approach - proxy requests to county ArcGIS services
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
import httpx
from pydantic import BaseModel

from app.core.config import settings
from app.services.cache_service import cache_service

router = APIRouter()

class ParcelQuery(BaseModel):
    lat: float
    lon: float
    county: str

class BatchParcelQuery(BaseModel):
    queries: List[ParcelQuery]

# County endpoint mapping
COUNTY_ENDPOINTS = {
    "dallas": settings.ARCGIS_DALLAS_URL,
    "harris": settings.ARCGIS_HARRIS_URL,
    "travis": settings.ARCGIS_TRAVIS_URL,
}

@router.get("/parcel")
async def get_parcel_data(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    county: str = Query(..., description="County name (dallas, harris, travis)")
):
    """
    Query parcel data from county ArcGIS REST API

    Returns parcel information including:
    - Parcel ID
    - Owner information
    - Property details
    - Zoning
    """
    county_lower = county.lower()

    if county_lower not in COUNTY_ENDPOINTS:
        raise HTTPException(
            status_code=400,
            detail=f"County '{county}' not supported. Available: {list(COUNTY_ENDPOINTS.keys())}"
        )

    # Check cache first (24 hour TTL)
    cache_key = f"parcel:{county_lower}:{lat}:{lon}"
    cached = await cache_service.get(cache_key)
    if cached:
        return {"data": cached, "source": "cache"}

    # Query ArcGIS REST API
    base_url = COUNTY_ENDPOINTS[county_lower]

    # Example query (adjust based on actual county endpoint structure)
    params = {
        "geometry": f"{lon},{lat}",
        "geometryType": "esriGeometryPoint",
        "inSR": "4326",
        "spatialRel": "esriSpatialRelIntersects",
        "outFields": "*",
        "returnGeometry": "true",
        "f": "json"
    }

    try:
        async with httpx.AsyncClient() as client:
            # Note: Actual endpoint path varies by county
            # This is a template - need to configure per county
            response = await client.get(
                f"{base_url}Parcels/MapServer/0/query",
                params=params,
                timeout=10.0
            )
            response.raise_for_status()
            data = response.json()

            # Cache for 24 hours
            await cache_service.set(cache_key, data, ttl=86400)

            return {"data": data, "source": "arcgis"}

    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"ArcGIS API error: {str(e)}")

@router.get("/zoning/{parcel_id}")
async def get_zoning_data(
    parcel_id: str,
    county: str = Query(..., description="County name")
):
    """
    Query zoning information for a parcel
    """
    county_lower = county.lower()

    if county_lower not in COUNTY_ENDPOINTS:
        raise HTTPException(status_code=400, detail=f"County '{county}' not supported")

    # Check cache (7 day TTL)
    cache_key = f"zoning:{county_lower}:{parcel_id}"
    cached = await cache_service.get(cache_key)
    if cached:
        return {"data": cached, "source": "cache"}

    # Query zoning layer
    base_url = COUNTY_ENDPOINTS[county_lower]

    params = {
        "where": f"PARCEL_ID='{parcel_id}'",
        "outFields": "*",
        "f": "json"
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{base_url}Zoning/MapServer/0/query",
                params=params,
                timeout=10.0
            )
            response.raise_for_status()
            data = response.json()

            # Cache for 7 days
            await cache_service.set(cache_key, data, ttl=604800)

            return {"data": data, "source": "arcgis"}

    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"ArcGIS API error: {str(e)}")

@router.get("/flood-zone")
async def get_flood_zone(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
):
    """
    Query FEMA flood zone data via WMS
    """
    # Check cache (indefinite - flood zones rarely change)
    cache_key = f"flood:{lat}:{lon}"
    cached = await cache_service.get(cache_key)
    if cached:
        return {"data": cached, "source": "cache"}

    # Query FEMA WMS
    params = {
        "SERVICE": "WMS",
        "VERSION": "1.3.0",
        "REQUEST": "GetFeatureInfo",
        "LAYERS": "1",  # Flood zones layer
        "QUERY_LAYERS": "1",
        "I": "50",
        "J": "50",
        "WIDTH": "101",
        "HEIGHT": "101",
        "CRS": "EPSG:4326",
        "BBOX": f"{lat-0.001},{lon-0.001},{lat+0.001},{lon+0.001}",
        "INFO_FORMAT": "application/json"
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                settings.FEMA_WMS_URL,
                params=params,
                timeout=15.0
            )
            response.raise_for_status()
            data = response.json()

            # Cache indefinitely
            await cache_service.set(cache_key, data, ttl=None)

            return {"data": data, "source": "fema"}

    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"FEMA WMS error: {str(e)}")

@router.post("/batch-query")
async def batch_parcel_query(batch: BatchParcelQuery):
    """
    Query multiple parcels in a single request
    Limited to 50 parcels per batch
    """
    if len(batch.queries) > 50:
        raise HTTPException(status_code=400, detail="Maximum 50 parcels per batch")

    results = []
    for query in batch.queries:
        try:
            result = await get_parcel_data(query.lat, query.lon, query.county)
            results.append({"query": query.dict(), "result": result})
        except Exception as e:
            results.append({"query": query.dict(), "error": str(e)})

    return {"results": results, "total": len(results)}

@router.get("/counties")
async def list_supported_counties():
    """
    List all supported counties with their endpoints
    """
    return {
        "counties": [
            {
                "name": "Dallas County, TX",
                "code": "dallas",
                "endpoint": COUNTY_ENDPOINTS["dallas"]
            },
            {
                "name": "Harris County, TX",
                "code": "harris",
                "endpoint": COUNTY_ENDPOINTS["harris"]
            },
            {
                "name": "Travis County, TX",
                "code": "travis",
                "endpoint": COUNTY_ENDPOINTS["travis"]
            }
        ]
    }
