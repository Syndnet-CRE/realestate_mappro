"""
ArcGIS integration for county parcel and zoning data
"""
import os
import httpx
from fastapi import APIRouter, HTTPException, Query
from typing import Optional

router = APIRouter()

# Common ArcGIS REST API endpoints for county data
ARCGIS_ENDPOINTS = {
    "travis_county_parcels": "https://services.arcgis.com/0L95CJ0VTaxqcmED/arcgis/rest/services/TCAD_Parcels/FeatureServer/0",
    "travis_county_zoning": "https://services.arcgis.com/0L95CJ0VTaxqcmED/arcgis/rest/services/Zoning/FeatureServer/0",
}


@router.get("/query")
async def query_arcgis(
    layer: str = Query(..., description="Layer name (e.g., 'travis_county_parcels')"),
    where: str = Query("1=1", description="SQL where clause"),
    return_geometry: bool = Query(True, description="Include geometry"),
    limit: int = Query(100, le=1000, description="Max results")
):
    """
    Query ArcGIS Feature Service
    Example: /api/arcgis/query?layer=travis_county_parcels&where=OWNER_NAME LIKE '%SMITH%'&limit=10
    """

    # Get endpoint URL
    endpoint_url = ARCGIS_ENDPOINTS.get(layer)

    if not endpoint_url:
        # Allow custom endpoint URL
        if layer.startswith("http"):
            endpoint_url = layer
        else:
            raise HTTPException(
                400,
                f"Unknown layer: {layer}. Available: {list(ARCGIS_ENDPOINTS.keys())} or provide full URL"
            )

    # Build ArcGIS REST API query
    params = {
        "where": where,
        "outFields": "*",
        "returnGeometry": "true" if return_geometry else "false",
        "f": "geojson",
        "resultRecordCount": limit
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(f"{endpoint_url}/query", params=params)
            response.raise_for_status()
            data = response.json()

        # Return GeoJSON
        return data

    except httpx.HTTPStatusError as e:
        if e.response.status_code == 403:
            raise HTTPException(
                403,
                "ArcGIS authentication required. Add token to environment or use public endpoints."
            )
        raise HTTPException(e.response.status_code, f"ArcGIS API error: {str(e)}")

    except Exception as e:
        raise HTTPException(500, f"Error querying ArcGIS: {str(e)}")


@router.get("/parcels/search")
async def search_parcels(
    address: Optional[str] = None,
    owner: Optional[str] = None,
    city: Optional[str] = None,
    limit: int = Query(50, le=500)
):
    """
    Search Travis County parcels by address or owner
    Example: /api/arcgis/parcels/search?address=123 Main St&city=Austin
    """

    where_clauses = []

    if address:
        where_clauses.append(f"SITUS_ADDRESS LIKE '%{address.upper()}%'")
    if owner:
        where_clauses.append(f"OWNER_NAME LIKE '%{owner.upper()}%'")
    if city:
        where_clauses.append(f"SITUS_CITY LIKE '%{city.upper()}%'")

    where = " AND ".join(where_clauses) if where_clauses else "1=1"

    return await query_arcgis(
        layer="travis_county_parcels",
        where=where,
        return_geometry=True,
        limit=limit
    )


@router.get("/zoning/search")
async def search_zoning(
    zoning_type: Optional[str] = None,
    limit: int = Query(50, le=500)
):
    """
    Search Travis County zoning data
    Example: /api/arcgis/zoning/search?zoning_type=residential
    """

    where = f"ZONE_TYPE LIKE '%{zoning_type.upper()}%'" if zoning_type else "1=1"

    return await query_arcgis(
        layer="travis_county_zoning",
        where=where,
        return_geometry=True,
        limit=limit
    )


@router.get("/layers")
async def list_available_layers():
    """List available ArcGIS layers"""
    return {
        "available_layers": list(ARCGIS_ENDPOINTS.keys()),
        "endpoints": ARCGIS_ENDPOINTS,
        "note": "You can also provide custom ArcGIS REST API URLs as the 'layer' parameter"
    }


@router.post("/custom")
async def query_custom_arcgis(
    url: str,
    where: str = "1=1",
    return_geometry: bool = True,
    limit: int = 100
):
    """
    Query any ArcGIS REST API endpoint
    Provide full FeatureServer URL
    """
    if not url.startswith("http"):
        raise HTTPException(400, "URL must start with http:// or https://")

    return await query_arcgis(
        layer=url,
        where=where,
        return_geometry=return_geometry,
        limit=limit
    )
