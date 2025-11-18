"""
ArcGIS REST API connector for querying county parcel, zoning, and GIS data
"""
import requests
from typing import Dict, Any, Optional, List
import json


class ArcGISConnector:
    """Query ArcGIS REST APIs for county GIS data"""

    @staticmethod
    def query_feature_service(
        service_url: str,
        where: str = "1=1",
        geometry: Optional[str] = None,
        geometry_type: str = "esriGeometryEnvelope",
        spatial_rel: str = "esriSpatialRelIntersects",
        out_fields: str = "*",
        return_geometry: bool = True,
        max_records: int = 100
    ) -> Dict[str, Any]:
        """
        Generic ArcGIS FeatureServer query

        Args:
            service_url: URL to ArcGIS Feature Service (e.g., https://...../FeatureServer/0)
            where: SQL WHERE clause (e.g., "CITY='Austin'" or "ACRES>5")
            geometry: Bounding box or geometry (e.g., "-97.8,30.2,-97.7,30.3")
            geometry_type: Type of geometry filter
            spatial_rel: Spatial relationship
            out_fields: Fields to return (comma-separated or "*" for all)
            return_geometry: Whether to return geometry
            max_records: Maximum number of records to return

        Returns:
            GeoJSON FeatureCollection
        """
        try:
            # Build query parameters
            params = {
                'where': where,
                'outFields': out_fields,
                'returnGeometry': 'true' if return_geometry else 'false',
                'f': 'geojson',  # Return as GeoJSON
                'resultRecordCount': max_records
            }

            # Add geometry filter if provided
            if geometry:
                params['geometry'] = geometry
                params['geometryType'] = geometry_type
                params['spatialRel'] = spatial_rel

            # Make request to query endpoint
            query_url = f"{service_url}/query"

            print(f"🔍 ArcGIS query: {query_url}")
            print(f"   WHERE: {where}")
            if geometry:
                print(f"   BBOX: {geometry}")

            response = requests.get(query_url, params=params, timeout=30)
            response.raise_for_status()

            geojson_data = response.json()

            feature_count = len(geojson_data.get('features', []))
            print(f"✅ Found {feature_count} features from ArcGIS")

            return geojson_data

        except requests.exceptions.RequestException as e:
            print(f"❌ ArcGIS API error: {e}")
            return {
                'type': 'FeatureCollection',
                'features': [],
                'error': str(e)
            }
        except Exception as e:
            print(f"❌ Unexpected error querying ArcGIS: {e}")
            return {
                'type': 'FeatureCollection',
                'features': [],
                'error': str(e)
            }

    @staticmethod
    def query_parcels(
        service_url: str,
        city: Optional[str] = None,
        address: Optional[str] = None,
        bbox: Optional[str] = None,
        max_records: int = 50
    ) -> Dict[str, Any]:
        """
        Query parcel data from county ArcGIS service

        Args:
            service_url: URL to parcel FeatureServer
            city: Filter by city name
            address: Filter by address (partial match)
            bbox: Bounding box (west,south,east,north)
            max_records: Maximum results

        Returns:
            GeoJSON FeatureCollection with parcel data
        """
        where_clauses = []

        if city:
            where_clauses.append(f"UPPER(CITY) LIKE UPPER('%{city}%')")

        if address:
            where_clauses.append(f"UPPER(SITUS_ADDRESS) LIKE UPPER('%{address}%')")

        where = " AND ".join(where_clauses) if where_clauses else "1=1"

        return ArcGISConnector.query_feature_service(
            service_url=service_url,
            where=where,
            geometry=bbox,
            max_records=max_records
        )

    @staticmethod
    def query_zoning(
        service_url: str,
        zone_type: Optional[str] = None,
        bbox: Optional[str] = None,
        max_records: int = 50
    ) -> Dict[str, Any]:
        """
        Query zoning data from county ArcGIS service

        Args:
            service_url: URL to zoning FeatureServer
            zone_type: Filter by zoning code (e.g., "R-2", "C-1")
            bbox: Bounding box (west,south,east,north)
            max_records: Maximum results

        Returns:
            GeoJSON FeatureCollection with zoning data
        """
        where = "1=1"

        if zone_type:
            # Try common zoning field names
            where = f"ZONING='{zone_type}' OR ZONE_CLASS='{zone_type}' OR ZONE_TYPE='{zone_type}'"

        return ArcGISConnector.query_feature_service(
            service_url=service_url,
            where=where,
            geometry=bbox,
            max_records=max_records
        )

    @staticmethod
    def get_service_metadata(service_url: str) -> Dict[str, Any]:
        """
        Get metadata about an ArcGIS Feature Service

        Returns info about available fields, geometry type, etc.
        """
        try:
            response = requests.get(service_url, params={'f': 'json'}, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"❌ Error getting service metadata: {e}")
            return {}


# Common county ArcGIS service URLs (PUBLIC services that don't require tokens)
COUNTY_SERVICES = {
    'travis': {
        # City of Austin Open Data Portal - Parcels
        'parcels': 'https://services.arcgis.com/0L95CJ0VTaxqcmED/arcgis/rest/services/Jurisdictions/FeatureServer/0',
        # City of Austin Zoning
        'zoning': 'https://services.arcgis.com/0L95CJ0VTaxqcmED/arcgis/rest/services/Zoning/FeatureServer/0',
    },
    'austin': {  # Same as Travis for convenience
        'parcels': 'https://services.arcgis.com/0L95CJ0VTaxqcmED/arcgis/rest/services/Jurisdictions/FeatureServer/0',
        'zoning': 'https://services.arcgis.com/0L95CJ0VTaxqcmED/arcgis/rest/services/Zoning/FeatureServer/0',
    },
    'dallas': {
        # Dallas County Open Data
        'parcels': 'https://services.arcgis.com/SPuD7zqoCTn6u6He/arcgis/rest/services/Parcels/FeatureServer/0',
        'zoning': 'https://services.arcgis.com/SPuD7zqoCTn6u6He/arcgis/rest/services/Zoning/FeatureServer/0',
    },
    'harris': {  # Houston area
        'parcels': 'https://services.arcgis.com/su8ic9KbA7PYVxPS/arcgis/rest/services/Harris_County_Parcels/FeatureServer/0',
        'zoning': 'https://services.arcgis.com/su8ic9KbA7PYVxPS/arcgis/rest/services/Zoning/FeatureServer/0',
    },
    # Users can add more counties or override with custom URLs
}

# NOTE: If you get "token required" errors, the service may require authentication.
# Solution: Ask the user to provide a custom service_url parameter when calling the tool.
# Example: "Show me parcels in Travis County" with custom URL
# Claude will use query_arcgis_parcels(county="travis", service_url="https://your-public-url/FeatureServer/0")



def get_county_service_url(county: str, layer_type: str) -> Optional[str]:
    """
    Get ArcGIS service URL for a county and layer type

    Args:
        county: County name (e.g., 'travis', 'dallas')
        layer_type: Type of layer (e.g., 'parcels', 'zoning')

    Returns:
        Service URL or None if not found
    """
    county_key = county.lower().replace(' ', '_').replace('county', '').strip()
    return COUNTY_SERVICES.get(county_key, {}).get(layer_type)
