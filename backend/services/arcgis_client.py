"""ArcGIS REST API client for querying parcel and zoning data."""
import httpx
from typing import Dict, Any, List, Optional
import json

from models.schemas import ArcGISFeature, ArcGISQueryResponse
from config.settings import settings


class ArcGISClient:
    """Client for ArcGIS REST API (FeatureServer) queries."""

    def __init__(self):
        self.timeout = httpx.Timeout(30.0)
        self.layer_urls = {
            "parcels": settings.arcgis_parcel_api,
            "zoning": settings.arcgis_zoning_api,
        }

    async def query_layer(
        self,
        layer: str,
        where: str = "1=1",
        geometry: Optional[Dict[str, Any]] = None,
        return_geometry: bool = True,
        out_fields: str = "*",
        max_records: int = 100,
    ) -> ArcGISQueryResponse:
        """
        Query an ArcGIS FeatureServer layer.

        Args:
            layer: Layer name (parcels, zoning, etc.)
            where: SQL WHERE clause (e.g., "CITY = 'Austin'")
            geometry: Optional spatial filter (GeoJSON or Esri JSON)
            return_geometry: Include geometries in response
            out_fields: Fields to return (* for all)
            max_records: Maximum number of features to return

        Returns:
            ArcGISQueryResponse with features and optional GeoJSON
        """
        # Get layer URL from configuration
        layer_url = self.layer_urls.get(layer)
        if not layer_url:
            # Allow custom layer URLs passed directly
            layer_url = layer

        if not layer_url:
            raise ValueError(f"Unknown layer: {layer}. Configure in .env or provide full URL.")

        # Build query parameters
        params = {
            "where": where,
            "outFields": out_fields,
            "returnGeometry": str(return_geometry).lower(),
            "f": "json",
            "resultRecordCount": max_records,
        }

        # Add geometry filter if provided
        if geometry:
            params["geometry"] = json.dumps(geometry)
            params["geometryType"] = "esriGeometryEnvelope"  # Assuming bbox
            params["spatialRel"] = "esriSpatialRelIntersects"

        # Make request
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(f"{layer_url}/query", params=params)
            response.raise_for_status()
            data = response.json()

        # Handle errors
        if "error" in data:
            error_msg = data["error"].get("message", "Unknown ArcGIS error")
            raise RuntimeError(f"ArcGIS API error: {error_msg}")

        # Parse features
        features = []
        for feature in data.get("features", []):
            features.append(
                ArcGISFeature(
                    attributes=feature.get("attributes", {}),
                    geometry=feature.get("geometry") if return_geometry else None,
                )
            )

        # Convert to GeoJSON if requested
        geojson = None
        if return_geometry:
            geojson = self._to_geojson(data.get("features", []))

        return ArcGISQueryResponse(
            features=features,
            total_count=len(features),
            layer=layer,
            geojson=geojson,
        )

    def _to_geojson(self, esri_features: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Convert ArcGIS (Esri JSON) features to GeoJSON."""
        geojson_features = []

        for feature in esri_features:
            geometry = feature.get("geometry")
            attributes = feature.get("attributes", {})

            if geometry:
                # Convert Esri geometry to GeoJSON geometry
                geojson_geometry = self._esri_to_geojson_geometry(geometry)

                geojson_features.append({
                    "type": "Feature",
                    "properties": attributes,
                    "geometry": geojson_geometry,
                })

        return {
            "type": "FeatureCollection",
            "features": geojson_features,
        }

    def _esri_to_geojson_geometry(self, esri_geom: Dict[str, Any]) -> Dict[str, Any]:
        """Convert Esri JSON geometry to GeoJSON geometry."""
        if "x" in esri_geom and "y" in esri_geom:
            # Point
            return {
                "type": "Point",
                "coordinates": [esri_geom["x"], esri_geom["y"]],
            }
        elif "rings" in esri_geom:
            # Polygon
            return {
                "type": "Polygon",
                "coordinates": esri_geom["rings"],
            }
        elif "paths" in esri_geom:
            # LineString
            return {
                "type": "LineString",
                "coordinates": esri_geom["paths"][0] if esri_geom["paths"] else [],
            }
        else:
            return {"type": "Point", "coordinates": [0, 0]}

    async def get_parcel_by_address(self, address: str, city: Optional[str] = None) -> Optional[ArcGISFeature]:
        """Convenience method to get parcel by address."""
        where = f"ADDRESS LIKE '%{address}%'"
        if city:
            where += f" AND CITY = '{city}'"

        response = await self.query_layer(
            layer="parcels",
            where=where,
            max_records=1,
        )

        return response.features[0] if response.features else None

    async def get_zoning_by_parcel_id(self, parcel_id: str) -> Optional[ArcGISFeature]:
        """Convenience method to get zoning by parcel ID."""
        response = await self.query_layer(
            layer="zoning",
            where=f"PARCEL_ID = '{parcel_id}'",
            max_records=1,
        )

        return response.features[0] if response.features else None


# Global instance
arcgis_client = ArcGISClient()
