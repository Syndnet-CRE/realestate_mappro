"""
ScoutGPT Simple Backend - Claude-Only Version

This is a minimal backend that just talks to Claude API.
No database, no Docker, no complexity - just Claude as your brain.
"""

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from anthropic import Anthropic
import os
import requests
import json
import csv
import io
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text
from shapely.geometry import shape, mapping
from shapely import wkt

# Import database models and connection
try:
    from database import (
        get_db, create_tables, Building, Parcel, FloodZone, Road,
        ATTOMProperty, Document, DocumentChunk, SessionLocal
    )
    DATABASE_AVAILABLE = True
except ImportError:
    print("⚠️ Database module not available - spatial queries disabled")
    DATABASE_AVAILABLE = False
    get_db = None

# Import file processors and connectors
try:
    from file_processors import FileProcessor, DocumentChunker
    from arcgis_connector import ArcGISConnector, get_county_service_url
    from sentence_transformers import SentenceTransformer
    # Initialize embedding model for RAG (runs once at startup)
    EMBEDDING_MODEL = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    RAG_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ RAG/File processing modules not available: {e}")
    RAG_AVAILABLE = False
    EMBEDDING_MODEL = None

app = FastAPI(
    title="ScoutGPT Simple Backend",
    description="Lightweight backend that uses Claude for all intelligence",
    version="1.0.0"
)

# CORS - allow your frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your Netlify domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Anthropic client
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
if not ANTHROPIC_API_KEY:
    print("WARNING: ANTHROPIC_API_KEY not set. Chat will not work.")
    anthropic = None
else:
    print(f"✅ ANTHROPIC_API_KEY is set (length: {len(ANTHROPIC_API_KEY)} chars, starts with: {ANTHROPIC_API_KEY[:7]}...)")
    anthropic = Anthropic(api_key=ANTHROPIC_API_KEY)

# Initialize database (if available)
if DATABASE_AVAILABLE:
    try:
        create_tables()
        print("✅ Database tables initialized")
    except Exception as e:
        print(f"⚠️ Database initialization warning: {e}")
        DATABASE_AVAILABLE = False

# Define tools that Claude can use
CLAUDE_TOOLS = [
    {
        "name": "search_places",
        "description": "Search for any type of place, business, or point of interest using OpenStreetMap data. Use this to find restaurants, cafes, parks, shops, hotels, schools, hospitals, etc. Returns real location data with coordinates that can be displayed on a map.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "What to search for (e.g., 'coffee shops', 'restaurants', 'parks', 'hotels', 'pharmacies')"
                },
                "location": {
                    "type": "string",
                    "description": "City or area to search in (e.g., 'San Francisco', 'Oakland', 'Berkeley')"
                }
            },
            "required": ["query", "location"]
        }
    },
    {
        "name": "search_properties",
        "description": "Search for properties by location, type, price range, or other criteria",
        "input_schema": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "City, neighborhood, or address to search"
                },
                "property_type": {
                    "type": "string",
                    "description": "Type of property (residential, commercial, industrial, etc.)"
                },
                "max_price": {
                    "type": "number",
                    "description": "Maximum price in USD"
                },
                "min_price": {
                    "type": "number",
                    "description": "Minimum price in USD"
                }
            },
            "required": ["location"]
        }
    },
    {
        "name": "analyze_zoning",
        "description": "Analyze zoning regulations and restrictions for a property or area",
        "input_schema": {
            "type": "object",
            "properties": {
                "address": {
                    "type": "string",
                    "description": "Property address or location"
                },
                "zoning_code": {
                    "type": "string",
                    "description": "Zoning code to analyze (e.g., R-2, C-1, M-1)"
                }
            },
            "required": ["address"]
        }
    },
    {
        "name": "calculate_investment_metrics",
        "description": "Calculate investment metrics like cap rate, cash-on-cash return, ROI",
        "input_schema": {
            "type": "object",
            "properties": {
                "purchase_price": {
                    "type": "number",
                    "description": "Purchase price of the property"
                },
                "annual_rental_income": {
                    "type": "number",
                    "description": "Expected annual rental income"
                },
                "annual_expenses": {
                    "type": "number",
                    "description": "Expected annual expenses (taxes, insurance, maintenance)"
                },
                "down_payment": {
                    "type": "number",
                    "description": "Down payment amount"
                }
            },
            "required": ["purchase_price", "annual_rental_income"]
        }
    },
    {
        "name": "query_attom_properties",
        "description": "Search ATTOM property database for real properties with detailed information including AVM values, owner data, tax assessor data, and flood zones. Use this to find specific properties, analyze property values, search by bedrooms/bathrooms, filter by price range, or check flood risk.",
        "input_schema": {
            "type": "object",
            "properties": {
                "city": {
                    "type": "string",
                    "description": "City to search in (e.g., 'Austin', 'Houston')"
                },
                "min_bedrooms": {
                    "type": "number",
                    "description": "Minimum number of bedrooms"
                },
                "max_bedrooms": {
                    "type": "number",
                    "description": "Maximum number of bedrooms"
                },
                "min_price": {
                    "type": "number",
                    "description": "Minimum AVM/sale price in USD"
                },
                "max_price": {
                    "type": "number",
                    "description": "Maximum AVM/sale price in USD"
                },
                "min_sqft": {
                    "type": "number",
                    "description": "Minimum square footage"
                },
                "max_sqft": {
                    "type": "number",
                    "description": "Maximum square footage"
                },
                "property_type": {
                    "type": "string",
                    "description": "Property type (e.g., 'Single Family', 'Condo', 'Townhouse')"
                },
                "flood_zone": {
                    "type": "string",
                    "description": "Filter by flood zone (e.g., 'A', 'AE', 'X')"
                },
                "zip_code": {
                    "type": "string",
                    "description": "ZIP code to search in"
                },
                "limit": {
                    "type": "number",
                    "description": "Maximum number of results to return (default 50)"
                }
            },
            "required": []
        }
    },
    {
        "name": "get_market_trends",
        "description": "Get market trends and statistics for a location",
        "input_schema": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "City or neighborhood"
                },
                "timeframe": {
                    "type": "string",
                    "description": "Timeframe for trends (1 month, 6 months, 1 year, 5 years)"
                }
            },
            "required": ["location"]
        }
    },
    {
        "name": "get_flood_zones",
        "description": "Get FEMA flood zone data for a city or area to show flood risk levels on the map. Returns GeoJSON data with flood zones (A, AE, X) that can be displayed as map layers. Use this when users ask about flood zones, flood risk, or FEMA data.",
        "input_schema": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "City or area to get flood zones for (e.g., 'Austin', 'Houston', 'Dallas')"
                }
            },
            "required": ["location"]
        }
    },
    {
        "name": "search_documents",
        "description": "Search uploaded documents (PDFs, market reports, appraisals, due diligence docs) using semantic search. Use this to find relevant information from the user's uploaded document library. Returns text excerpts with source citations.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Search query (e.g., 'What are cap rates in Austin?', 'flood risk assessment', 'comparable sales')"
                },
                "top_k": {
                    "type": "number",
                    "description": "Number of results to return (default 5)"
                },
                "category": {
                    "type": "string",
                    "description": "Filter by document category (appraisal, market_report, due_diligence, etc.)"
                }
            },
            "required": ["query"]
        }
    },
    {
        "name": "query_arcgis_parcels",
        "description": "Query county parcel data from ArcGIS REST API. Returns parcel boundaries, ownership, assessed values, and property details. Use this to find parcels by address, city, or bounding box.",
        "input_schema": {
            "type": "object",
            "properties": {
                "county": {
                    "type": "string",
                    "description": "County name (e.g., 'Travis', 'Dallas', 'Harris')"
                },
                "city": {
                    "type": "string",
                    "description": "Filter by city name"
                },
                "address": {
                    "type": "string",
                    "description": "Filter by address (partial match)"
                },
                "bbox": {
                    "type": "string",
                    "description": "Bounding box (west,south,east,north) e.g., '-97.8,30.2,-97.7,30.3'"
                },
                "service_url": {
                    "type": "string",
                    "description": "Custom ArcGIS FeatureServer URL (if not using built-in county services)"
                }
            },
            "required": ["county"]
        }
    },
    {
        "name": "query_arcgis_zoning",
        "description": "Query county zoning data from ArcGIS REST API. Returns zoning designations, land use codes, and development restrictions. Use this for zoning feasibility analysis.",
        "input_schema": {
            "type": "object",
            "properties": {
                "county": {
                    "type": "string",
                    "description": "County name (e.g., 'Travis', 'Dallas', 'Harris')"
                },
                "zone_type": {
                    "type": "string",
                    "description": "Filter by zoning code (e.g., 'R-2', 'C-1', 'MF-3')"
                },
                "bbox": {
                    "type": "string",
                    "description": "Bounding box (west,south,east,north)"
                },
                "service_url": {
                    "type": "string",
                    "description": "Custom ArcGIS FeatureServer URL (if not using built-in county services)"
                }
            },
            "required": ["county"]
        }
    }
]


# Request/Response Models
class ChatMessage(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    reply: str
    tool_calls: Optional[List[Dict[str, Any]]] = None
    geojson: Optional[Dict[str, Any]] = None  # GeoJSON data to display on map


# Real Data Source Integrations

def query_overpass(query: str) -> Dict[str, Any]:
    """Query OpenStreetMap Overpass API for real geospatial data"""
    overpass_url = "https://overpass-api.de/api/interpreter"

    try:
        response = requests.post(overpass_url, data={"data": query}, timeout=30)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Overpass API error: {e}")
        return {"elements": []}


def search_poi(query: str, location: str, category: Optional[str] = None) -> Dict[str, Any]:
    """
    Search for points of interest using OpenStreetMap

    Args:
        query: Search term (e.g., "coffee shop", "restaurant", "park")
        location: City or area name (e.g., "San Francisco")
        category: Optional category filter

    Returns:
        GeoJSON FeatureCollection with results
    """

    print(f"🔍 search_poi called with query='{query}', location='{location}'")

    # Map common queries to OSM tags
    tag_mapping = {
        "coffee": "amenity=cafe",
        "cafe": "amenity=cafe",
        "restaurant": "amenity=restaurant",
        "park": "leisure=park",
        "shop": "shop",
        "hotel": "tourism=hotel",
        "bar": "amenity=bar",
        "school": "amenity=school",
        "hospital": "amenity=hospital",
        "pharmacy": "amenity=pharmacy",
    }

    # Determine the OSM tag to use
    osm_tag = None
    for key, value in tag_mapping.items():
        if key in query.lower():
            osm_tag = value
            break

    if not osm_tag:
        osm_tag = "amenity"  # Default fallback

    # Geocode the location (simplified - using San Francisco as default)
    # In production, you'd use a geocoding service
    location_coords = {
        "san francisco": {"south": 37.7, "north": 37.8, "west": -122.5, "east": -122.35},
        "sf": {"south": 37.7, "north": 37.8, "west": -122.5, "east": -122.35},
        "oakland": {"south": 37.75, "north": 37.85, "west": -122.3, "east": -122.15},
        "berkeley": {"south": 37.85, "north": 37.9, "west": -122.3, "east": -122.25},
    }

    bbox = location_coords.get(location.lower(), location_coords["san francisco"])

    # Build Overpass query
    overpass_query = f"""
    [out:json][timeout:25];
    (
      node[{osm_tag}]({bbox['south']},{bbox['west']},{bbox['north']},{bbox['east']});
      way[{osm_tag}]({bbox['south']},{bbox['west']},{bbox['north']},{bbox['east']});
      relation[{osm_tag}]({bbox['south']},{bbox['west']},{bbox['north']},{bbox['east']});
    );
    out center;
    """

    # Query OpenStreetMap
    osm_data = query_overpass(overpass_query)
    print(f"🌍 OpenStreetMap returned {len(osm_data.get('elements', []))} elements")

    # Convert to GeoJSON
    features = []
    for element in osm_data.get("elements", [])[:50]:  # Limit to 50 results
        if element.get("type") == "node":
            lat = element.get("lat")
            lon = element.get("lon")
        elif "center" in element:
            lat = element["center"]["lat"]
            lon = element["center"]["lon"]
        else:
            continue

        tags = element.get("tags", {})
        name = tags.get("name", "Unnamed")

        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [lon, lat]
            },
            "properties": {
                "name": name,
                "type": tags.get("amenity") or tags.get("shop") or tags.get("leisure", "unknown"),
                "address": tags.get("addr:street", ""),
                "city": tags.get("addr:city", location),
                "osm_id": element.get("id")
            }
        })

    print(f"✅ Converted to {len(features)} GeoJSON features")

    return {
        "type": "FeatureCollection",
        "features": features,
        "metadata": {
            "count": len(features),
            "query": query,
            "location": location
        }
    }


# Tool execution functions
def execute_tool(tool_name: str, tool_input: Dict[str, Any]) -> Dict[str, Any]:
    """Execute a tool and return results"""

    if tool_name == "search_places":
        # Search for any type of place using OpenStreetMap
        query = tool_input.get("query", "")
        location = tool_input.get("location", "San Francisco")

        # Query real data from OpenStreetMap
        geojson_data = search_poi(query, location)

        return {
            "geojson": geojson_data,
            "total_found": geojson_data["metadata"]["count"],
            "query": query,
            "location": location
        }

    elif tool_name == "search_properties":
        # Use OpenStreetMap to search for real places
        location = tool_input.get("location", "San Francisco")
        property_type = tool_input.get("property_type", "")

        # Determine what to search for based on property type
        if "commercial" in property_type.lower():
            search_query = "shop"
        elif "restaurant" in property_type.lower() or "cafe" in property_type.lower():
            search_query = "restaurant cafe"
        elif "hotel" in property_type.lower():
            search_query = "hotel"
        else:
            # Default: search for buildings/amenities
            search_query = "amenity"

        # Query real data from OpenStreetMap
        geojson_data = search_poi(search_query, location)

        return {
            "geojson": geojson_data,
            "total_found": geojson_data["metadata"]["count"],
            "location": location,
            "type": property_type or "all"
        }

    elif tool_name == "analyze_zoning":
        address = tool_input.get("address", "")
        zoning = tool_input.get("zoning_code", "R-2")
        return {
            "address": address,
            "zoning_code": zoning,
            "classification": "Residential - Two Family",
            "allowed_uses": [
                "Single-family dwellings",
                "Two-family dwellings",
                "Home occupations"
            ],
            "restrictions": {
                "max_units": 2,
                "max_height": "35 feet",
                "min_lot_size": "5,000 sq ft",
                "max_lot_coverage": "40%",
                "setbacks": {
                    "front": "15 feet",
                    "side": "5 feet",
                    "rear": "20 feet"
                }
            },
            "parking_required": "2 spaces per unit"
        }

    elif tool_name == "calculate_investment_metrics":
        price = tool_input.get("purchase_price", 0)
        income = tool_input.get("annual_rental_income", 0)
        expenses = tool_input.get("annual_expenses", 0)
        down_payment = tool_input.get("down_payment", price * 0.20)

        noi = income - expenses
        cap_rate = (noi / price * 100) if price > 0 else 0
        cash_on_cash = (noi / down_payment * 100) if down_payment > 0 else 0

        return {
            "purchase_price": price,
            "annual_income": income,
            "annual_expenses": expenses,
            "net_operating_income": noi,
            "cap_rate": f"{cap_rate:.2f}%",
            "cash_on_cash_return": f"{cash_on_cash:.2f}%",
            "monthly_cashflow": noi / 12,
            "analysis": "Good" if cap_rate > 6 else "Fair" if cap_rate > 4 else "Poor"
        }

    elif tool_name == "get_market_trends":
        location = tool_input.get("location", "San Francisco")
        return {
            "location": location,
            "median_price": "$1,250,000",
            "price_change_1yr": "+8.5%",
            "days_on_market": 24,
            "inventory_level": "Low",
            "trends": {
                "prices": "Rising",
                "demand": "High",
                "supply": "Limited"
            },
            "forecast": "Prices expected to continue rising moderately"
        }

    elif tool_name == "get_flood_zones":
        location = tool_input.get("location", "")

        # Map city to bounding box coordinates
        city_coords = {
            "austin": {"west": -97.9, "south": 30.1, "east": -97.6, "north": 30.5},
            "houston": {"west": -95.8, "south": 29.5, "east": -95.1, "north": 30.1},
            "dallas": {"west": -97.0, "south": 32.6, "east": -96.6, "north": 33.0},
            "san antonio": {"west": -98.7, "south": 29.2, "east": -98.3, "north": 29.7},
        }

        bbox = city_coords.get(location.lower())
        if not bbox:
            # Default to Austin if city not found
            bbox = city_coords["austin"]

        # Format bbox for FEMA API
        bbox_str = f"{bbox['west']},{bbox['south']},{bbox['east']},{bbox['north']}"

        # Fetch flood zone data from FEMA
        geojson_data = fetch_fema_flood_zones(bbox_str)

        return {
            "geojson": geojson_data,
            "location": location,
            "total_zones": len(geojson_data.get("features", [])),
            "bbox": bbox_str
        }

    elif tool_name == "query_attom_properties":
        if not DATABASE_AVAILABLE:
            return {"error": "Database not available", "properties": []}

        try:
            # Get database session
            db = SessionLocal()

            # Build query with filters
            query = db.query(ATTOMProperty)

            # Apply filters
            city = tool_input.get("city")
            if city:
                query = query.filter(ATTOMProperty.city.ilike(f"%{city}%"))

            zip_code = tool_input.get("zip_code")
            if zip_code:
                query = query.filter(ATTOMProperty.zip_code == zip_code)

            min_bedrooms = tool_input.get("min_bedrooms")
            if min_bedrooms:
                query = query.filter(ATTOMProperty.bedrooms >= min_bedrooms)

            max_bedrooms = tool_input.get("max_bedrooms")
            if max_bedrooms:
                query = query.filter(ATTOMProperty.bedrooms <= max_bedrooms)

            min_price = tool_input.get("min_price")
            if min_price:
                query = query.filter(
                    (ATTOMProperty.avm_value >= min_price) |
                    (ATTOMProperty.sale_price >= min_price)
                )

            max_price = tool_input.get("max_price")
            if max_price:
                query = query.filter(
                    (ATTOMProperty.avm_value <= max_price) |
                    (ATTOMProperty.sale_price <= max_price)
                )

            min_sqft = tool_input.get("min_sqft")
            if min_sqft:
                query = query.filter(ATTOMProperty.square_feet >= min_sqft)

            max_sqft = tool_input.get("max_sqft")
            if max_sqft:
                query = query.filter(ATTOMProperty.square_feet <= max_sqft)

            property_type = tool_input.get("property_type")
            if property_type:
                query = query.filter(ATTOMProperty.property_type.ilike(f"%{property_type}%"))

            flood_zone = tool_input.get("flood_zone")
            if flood_zone:
                query = query.filter(ATTOMProperty.flood_zone == flood_zone.upper())

            # Limit results
            limit = tool_input.get("limit", 50)
            properties = query.limit(min(limit, 200)).all()

            # Convert to GeoJSON
            features = []
            for prop in properties:
                # Get geometry as GeoJSON
                geom_result = db.execute(
                    text("SELECT ST_AsGeoJSON(geometry) as geojson FROM attom_properties WHERE id = :id"),
                    {"id": prop.id}
                ).fetchone()

                geometry = None
                if geom_result and geom_result[0]:
                    geometry = json.loads(geom_result[0])

                feature = {
                    "type": "Feature",
                    "geometry": geometry,
                    "properties": {
                        "id": prop.id,
                        "address": prop.address,
                        "city": prop.city,
                        "state": prop.state,
                        "zip_code": prop.zip_code,
                        "bedrooms": prop.bedrooms,
                        "bathrooms": prop.bathrooms,
                        "square_feet": prop.square_feet,
                        "lot_size_sqft": prop.lot_size_sqft,
                        "year_built": prop.year_built,
                        "property_type": prop.property_type,
                        "avm_value": prop.avm_value,
                        "avm_high": prop.avm_high,
                        "avm_low": prop.avm_low,
                        "owner_name": prop.owner_name,
                        "sale_price": prop.sale_price,
                        "assessed_total_value": prop.assessed_total_value,
                        "tax_amount": prop.tax_amount,
                        "flood_zone": prop.flood_zone,
                        "flood_risk": prop.flood_risk,
                    }
                }
                features.append(feature)

            db.close()

            geojson_data = {
                "type": "FeatureCollection",
                "features": features
            }

            return {
                "geojson": geojson_data,
                "total_found": len(features),
                "filters": tool_input,
                "message": f"Found {len(features)} properties matching your criteria"
            }

        except Exception as e:
            print(f"❌ Error querying ATTOM properties: {e}")
            return {"error": str(e), "properties": []}

    elif tool_name == "search_documents":
        if not RAG_AVAILABLE or not DATABASE_AVAILABLE:
            return {"error": "RAG system not available", "results": []}

        try:
            query_text = tool_input.get("query", "")
            top_k = int(tool_input.get("top_k", 5))
            category = tool_input.get("category")

            # Generate embedding for query
            query_embedding = EMBEDDING_MODEL.encode([query_text])[0].tolist()

            # Get database session
            db = SessionLocal()

            # Build query for document chunks
            # Use pgvector's cosine distance for similarity search
            query = db.query(DocumentChunk, Document).join(
                Document, DocumentChunk.document_id == Document.id
            )

            # Filter by category if specified
            if category:
                query = query.filter(Document.category == category)

            # Order by similarity (cosine distance)
            query = query.order_by(
                DocumentChunk.embedding.cosine_distance(query_embedding)
            ).limit(top_k)

            results = []
            for chunk, doc in query.all():
                results.append({
                    "text": chunk.chunk_text,
                    "source": doc.filename,
                    "category": doc.category,
                    "page": chunk.page_number,
                    "relevance_score": 1.0  # Could calculate actual score if needed
                })

            db.close()

            return {
                "query": query_text,
                "results": results,
                "total_found": len(results),
                "message": f"Found {len(results)} relevant passages"
            }

        except Exception as e:
            print(f"❌ Error searching documents: {e}")
            return {"error": str(e), "results": []}

    elif tool_name == "query_arcgis_parcels":
        try:
            county = tool_input.get("county", "")
            city = tool_input.get("city")
            address = tool_input.get("address")
            bbox = tool_input.get("bbox")
            service_url = tool_input.get("service_url")

            # Get service URL from county name or use custom URL
            if not service_url:
                service_url = get_county_service_url(county, 'parcels')

            if not service_url:
                return {
                    "error": f"No parcel service configured for {county} county. Please provide a custom service_url.",
                    "features": []
                }

            # Query ArcGIS API
            geojson_data = ArcGISConnector.query_parcels(
                service_url=service_url,
                city=city,
                address=address,
                bbox=bbox
            )

            return {
                "geojson": geojson_data,
                "county": county,
                "total_found": len(geojson_data.get("features", [])),
                "service_url": service_url
            }

        except Exception as e:
            print(f"❌ Error querying ArcGIS parcels: {e}")
            return {"error": str(e), "features": []}

    elif tool_name == "query_arcgis_zoning":
        try:
            county = tool_input.get("county", "")
            zone_type = tool_input.get("zone_type")
            bbox = tool_input.get("bbox")
            service_url = tool_input.get("service_url")

            # Get service URL from county name or use custom URL
            if not service_url:
                service_url = get_county_service_url(county, 'zoning')

            if not service_url:
                return {
                    "error": f"No zoning service configured for {county} county. Please provide a custom service_url.",
                    "features": []
                }

            # Query ArcGIS API
            geojson_data = ArcGISConnector.query_zoning(
                service_url=service_url,
                zone_type=zone_type,
                bbox=bbox
            )

            return {
                "geojson": geojson_data,
                "county": county,
                "total_found": len(geojson_data.get("features", [])),
                "service_url": service_url
            }

        except Exception as e:
            print(f"❌ Error querying ArcGIS zoning: {e}")
            return {"error": str(e), "features": []}

    return {"error": f"Unknown tool: {tool_name}"}


# API Endpoints
@app.get("/")
def root():
    return {
        "service": "ScoutGPT Simple Backend",
        "status": "running",
        "claude_enabled": anthropic is not None,
        "endpoints": ["/chat", "/datasets", "/layers", "/health", "/docs"]
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(message: ChatMessage):
    """Send a message to Claude and get a response"""

    print(f"🔵 Received chat request: {message.message}")

    if not anthropic:
        print("❌ ANTHROPIC_API_KEY not configured!")
        raise HTTPException(
            status_code=500,
            detail="Anthropic API key not configured. Please set ANTHROPIC_API_KEY environment variable."
        )

    try:
        # Specialized Real Estate Analyst System Prompt
        SYSTEM_PROMPT = """You are ScoutGPT, an expert real estate investment analyst specializing in commercial and residential property analysis.

**Your Expertise:**
- Property valuation (AVM, comps, cap rates)
- Zoning and land use analysis
- Investment underwriting (NOI, cash flow, ROI)
- Market trends and forecasting
- Due diligence research
- Flood risk and environmental analysis

**Response Style:**
- FAST and ACTIONABLE: Answer in <10 seconds with specific data, not essays
- DATA-FIRST: Lead with numbers, facts, and specific findings
- STRUCTURED: Use bullet points, tables, or clear sections
- CITE SOURCES: When using uploaded documents or API data, cite the source

**Tools Available:**
- query_attom_properties: Search uploaded property database
- search_documents: Find info from uploaded PDFs/reports
- query_arcgis_parcels: Live county parcel data
- query_arcgis_zoning: Live zoning information
- search_places: Find POIs from OpenStreetMap

**Examples:**
User: "Show me 4-unit multifamily under $1M in Austin"
You: [Use query_attom_properties or query_arcgis_parcels, then summarize findings with addresses, prices, cap rates]

User: "What are cap rates in this market?"
You: [Use search_documents to find market reports, cite specific data]

User: "Can I build 50 units on this lot?"
You: [Use query_arcgis_zoning, analyze FAR/setbacks, give YES/NO with reasoning]

Be direct, specific, and actionable. No fluff."""

        print(f"🟢 Calling Claude API with model: claude-3-haiku-20240307")
        # First call to Claude with tools - using Haiku for broader compatibility
        response = anthropic.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            tools=CLAUDE_TOOLS,
            messages=[{
                "role": "user",
                "content": message.message
            }]
        )

        print(f"🟢 Claude responded, stop_reason: {response.stop_reason}")

        # Check if Claude wants to use a tool
        tool_calls = []
        all_geojson_features = []  # Collect all GeoJSON features from tools

        while response.stop_reason == "tool_use":
            # Extract tool use
            tool_use = next(
                (block for block in response.content if block.type == "tool_use"),
                None
            )

            if not tool_use:
                break

            print(f"🔧 Claude wants to use tool: {tool_use.name}")
            print(f"🔧 Tool input: {tool_use.input}")

            # Execute the tool
            tool_result = execute_tool(tool_use.name, tool_use.input)
            print(f"✅ Tool result: {len(str(tool_result))} chars")
            tool_calls.append({
                "name": tool_use.name,
                "input": tool_use.input,
                "result": tool_result
            })

            # Extract GeoJSON data if present
            if "geojson" in tool_result:
                geojson = tool_result["geojson"]
                if "features" in geojson:
                    print(f"📍 Found {len(geojson['features'])} GeoJSON features")
                    all_geojson_features.extend(geojson["features"])

            # Continue the conversation with the tool result
            response = anthropic.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=2048,
                system=SYSTEM_PROMPT,
                tools=CLAUDE_TOOLS,
                messages=[
                    {"role": "user", "content": message.message},
                    {"role": "assistant", "content": response.content},
                    {
                        "role": "user",
                        "content": [{
                            "type": "tool_result",
                            "tool_use_id": tool_use.id,
                            "content": str(tool_result)
                        }]
                    }
                ]
            )

        # Extract text response
        text_response = next(
            (block.text for block in response.content if hasattr(block, "text")),
            "I apologize, but I couldn't generate a response."
        )

        # Build combined GeoJSON if we have features
        combined_geojson = None
        if all_geojson_features:
            combined_geojson = {
                "type": "FeatureCollection",
                "features": all_geojson_features
            }
            print(f"🗺️ Returning {len(all_geojson_features)} total features in GeoJSON")
        else:
            print(f"⚠️ No GeoJSON features to return")

        print(f"✅ Returning response to frontend")

        return ChatResponse(
            reply=text_response,
            tool_calls=tool_calls if tool_calls else None,
            geojson=combined_geojson
        )

    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"❌ ERROR in chat endpoint:")
        print(error_details)
        raise HTTPException(status_code=500, detail=f"Error communicating with Claude: {str(e)}")


@app.get("/datasets")
def get_datasets():
    """Return mock datasets for the sidebar"""
    return [
        {
            "id": 1,
            "name": "SF Bay Area Properties",
            "status": "ready",
            "description": "Properties in San Francisco and surrounding areas",
            "count": 12547
        },
        {
            "id": 2,
            "name": "Zoning Regulations",
            "status": "ready",
            "description": "City zoning codes and regulations",
            "count": 1205
        },
        {
            "id": 3,
            "name": "Market Trends",
            "status": "ready",
            "description": "Historical market data and trends",
            "count": 8934
        },
        {
            "id": 4,
            "name": "Investment Opportunities",
            "status": "processing",
            "description": "Curated investment opportunities",
            "count": 234
        }
    ]


@app.get("/layers")
def get_layers():
    """Return mock map layers"""
    return [
        {
            "id": 1,
            "name": "parcels",
            "type": "vector",
            "description": "Property parcels"
        },
        {
            "id": 2,
            "name": "zoning",
            "type": "vector",
            "description": "Zoning boundaries"
        },
        {
            "id": 3,
            "name": "transit",
            "type": "vector",
            "description": "Public transit lines"
        }
    ]


@app.get("/layers/{layer_name}/features")
def get_layer_features(layer_name: str):
    """Return GeoJSON features for a layer"""

    # Demo GeoJSON data - San Francisco properties
    if layer_name == "parcels" or layer_name == "1":
        return {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-122.4194, 37.7749],
                            [-122.4194, 37.7739],
                            [-122.4184, 37.7739],
                            [-122.4184, 37.7749],
                            [-122.4194, 37.7749]
                        ]]
                    },
                    "properties": {
                        "name": "123 Market St",
                        "price": "$1,200,000",
                        "type": "Commercial",
                        "sqft": 5000
                    }
                },
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-122.4214, 37.7759],
                            [-122.4214, 37.7749],
                            [-122.4204, 37.7749],
                            [-122.4204, 37.7759],
                            [-122.4214, 37.7759]
                        ]]
                    },
                    "properties": {
                        "name": "456 Mission St",
                        "price": "$850,000",
                        "type": "Residential",
                        "sqft": 2400
                    }
                },
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-122.4164, 37.7769],
                            [-122.4164, 37.7759],
                            [-122.4154, 37.7759],
                            [-122.4154, 37.7769],
                            [-122.4164, 37.7769]
                        ]]
                    },
                    "properties": {
                        "name": "789 Howard St",
                        "price": "$2,500,000",
                        "type": "Mixed Use",
                        "sqft": 12000
                    }
                }
            ]
        }

    # Default empty response
    return {
        "type": "FeatureCollection",
        "features": []
    }


@app.get("/api/buildings")
def get_buildings(
    city: Optional[str] = None,
    bbox: Optional[str] = None,  # Format: "west,south,east,north"
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get building footprints from database

    Query params:
    - city: Filter by city name (e.g., "Austin")
    - bbox: Bounding box as "west,south,east,north" (e.g., "-97.8,30.2,-97.7,30.3")
    - limit: Max results (default 100, max 1000)
    """
    if not DATABASE_AVAILABLE or db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        query = db.query(Building)

        if city:
            query = query.filter(Building.city.ilike(f"%{city}%"))

        if bbox:
            try:
                west, south, east, north = map(float, bbox.split(','))
                # PostGIS bounding box query
                query = query.filter(
                    text(f"ST_Intersects(geometry, ST_MakeEnvelope({west}, {south}, {east}, {north}, 4326))")
                )
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid bbox format. Use: west,south,east,north")

        buildings = query.limit(min(limit, 1000)).all()

        # Convert to GeoJSON
        features = []
        for building in buildings:
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[]]  # Simplified - would need proper WKB parsing
                },
                "properties": {
                    "id": building.id,
                    "name": building.name,
                    "type": building.building_type,
                    "address": building.address,
                    "city": building.city,
                    "height": building.height,
                    "levels": building.levels
                }
            })

        return {
            "type": "FeatureCollection",
            "features": features,
            "metadata": {
                "count": len(features),
                "city": city,
                "bbox": bbox
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/api/parcels")
def get_parcels(
    city: Optional[str] = None,
    county: Optional[str] = None,
    zoning: Optional[str] = None,
    bbox: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get property parcels from database

    Query params:
    - city: Filter by city
    - county: Filter by county (e.g., "Travis", "Harris")
    - zoning: Filter by zoning code
    - bbox: Bounding box
    - limit: Max results
    """
    if not DATABASE_AVAILABLE or db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        query = db.query(Parcel)

        if city:
            query = query.filter(Parcel.city.ilike(f"%{city}%"))
        if county:
            query = query.filter(Parcel.county.ilike(f"%{county}%"))
        if zoning:
            query = query.filter(Parcel.zoning.ilike(f"%{zoning}%"))

        if bbox:
            west, south, east, north = map(float, bbox.split(','))
            query = query.filter(
                text(f"ST_Intersects(geometry, ST_MakeEnvelope({west}, {south}, {east}, {north}, 4326))")
            )

        parcels = query.limit(min(limit, 1000)).all()

        features = [{
            "type": "Feature",
            "geometry": {"type": "Polygon", "coordinates": [[]]},
            "properties": {
                "id": p.id,
                "parcel_id": p.parcel_id,
                "owner": p.owner_name,
                "address": p.address,
                "city": p.city,
                "county": p.county,
                "zoning": p.zoning,
                "assessed_value": p.assessed_value,
                "land_use": p.land_use,
                "lot_size": p.lot_size
            }
        } for p in parcels]

        return {
            "type": "FeatureCollection",
            "features": features,
            "metadata": {"count": len(features)}
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/api/flood_zones")
def get_flood_zones(
    zone_type: Optional[str] = None,
    bbox: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Get FEMA flood zones

    Query params:
    - zone_type: Filter by zone (A, AE, X, etc.)
    - bbox: Bounding box
    - limit: Max results
    """
    if not DATABASE_AVAILABLE or db is None:
        # Return live FEMA data as fallback
        return fetch_fema_flood_zones(bbox)

    try:
        query = db.query(FloodZone)

        if zone_type:
            query = query.filter(FloodZone.zone_type == zone_type.upper())

        if bbox:
            west, south, east, north = map(float, bbox.split(','))
            query = query.filter(
                text(f"ST_Intersects(geometry, ST_MakeEnvelope({west}, {south}, {east}, {north}, 4326))")
            )

        zones = query.limit(limit).all()

        features = [{
            "type": "Feature",
            "geometry": {"type": "MultiPolygon", "coordinates": [[[]]]},
            "properties": {
                "zone_type": z.zone_type,
                "flood_risk": z.flood_risk,
                "description": z.description
            }
        } for z in zones]

        return {
            "type": "FeatureCollection",
            "features": features,
            "metadata": {"count": len(features)}
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


def fetch_fema_flood_zones(bbox: str):
    """Fetch flood zones - using demo data until FEMA API is fixed"""
    if not bbox:
        return {"type": "FeatureCollection", "features": []}

    try:
        west, south, east, north = map(float, bbox.split(','))

        # Demo flood zones for Austin area
        # TODO: Replace with working FEMA API when endpoint is fixed
        demo_flood_zones = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-97.75, 30.25],
                            [-97.75, 30.28],
                            [-97.72, 30.28],
                            [-97.72, 30.25],
                            [-97.75, 30.25]
                        ]]
                    },
                    "properties": {
                        "FLD_ZONE": "AE",
                        "ZONE_SUBTY": "FLOODWAY",
                        "STATIC_BFE": 520.0,
                        "flood_risk": "High",
                        "description": "Areas subject to flooding from 1% annual chance flood (100-year flood)"
                    }
                },
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-97.78, 30.30],
                            [-97.78, 30.33],
                            [-97.75, 30.33],
                            [-97.75, 30.30],
                            [-97.78, 30.30]
                        ]]
                    },
                    "properties": {
                        "FLD_ZONE": "A",
                        "ZONE_SUBTY": "",
                        "STATIC_BFE": None,
                        "flood_risk": "High",
                        "description": "Areas subject to flooding from 1% annual chance flood"
                    }
                },
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-97.70, 30.26],
                            [-97.70, 30.29],
                            [-97.67, 30.29],
                            [-97.67, 30.26],
                            [-97.70, 30.26]
                        ]]
                    },
                    "properties": {
                        "FLD_ZONE": "X",
                        "ZONE_SUBTY": "0.2 PCT ANNUAL CHANCE FLOOD HAZARD",
                        "STATIC_BFE": None,
                        "flood_risk": "Moderate",
                        "description": "Areas of moderate flood hazard (0.2% annual chance flood)"
                    }
                }
            ]
        }

        print(f"📍 Returning {len(demo_flood_zones['features'])} demo flood zones for Austin")
        return demo_flood_zones

    except Exception as e:
        print(f"Error generating demo flood zones: {e}")
        return {"type": "FeatureCollection", "features": []}


def parse_attom_geojson(geojson_data: dict, batch_id: str) -> List[Dict[str, Any]]:
    """Parse ATTOM GeoJSON format and extract property data"""
    properties_list = []

    features = geojson_data.get("features", [])
    print(f"📦 Processing {len(features)} features from GeoJSON")

    for feature in features:
        try:
            props = feature.get("properties", {})
            geom = feature.get("geometry")

            # Generate unique ATTOM ID if not present
            attom_id = props.get("ATTOM_ID") or props.get("attom_id") or str(uuid.uuid4())

            # Parse geometry
            geometry_wkt = None
            if geom:
                try:
                    geom_obj = shape(geom)
                    geometry_wkt = geom_obj.wkt
                except Exception as e:
                    print(f"⚠️ Error parsing geometry for {attom_id}: {e}")

            # Extract property data with flexible field mapping
            property_data = {
                "attom_id": attom_id,
                "upload_batch_id": batch_id,

                # Location - try multiple field name variations
                "address": (props.get("address") or props.get("SITE_ADDRESS") or
                           props.get("PropertyAddress") or props.get("SiteAddress")),
                "city": (props.get("city") or props.get("SITE_CITY") or
                        props.get("PropertyCity") or props.get("SiteCity")),
                "state": (props.get("state") or props.get("SITE_STATE") or
                         props.get("PropertyState") or "TX"),
                "zip_code": str(props.get("zip_code") or props.get("SITE_ZIP") or
                               props.get("PropertyZip") or ""),
                "county": (props.get("county") or props.get("COUNTY") or
                          props.get("CountyName") or "Travis"),

                # Property characteristics
                "bedrooms": int(props.get("bedrooms") or props.get("BEDROOMS") or
                               props.get("BedroomCount") or 0) or None,
                "bathrooms": float(props.get("bathrooms") or props.get("BATHROOMS") or
                                  props.get("BathroomCount") or 0) or None,
                "square_feet": int(props.get("square_feet") or props.get("SQFT") or
                                  props.get("BuildingSize") or props.get("LivingSize") or 0) or None,
                "lot_size_sqft": float(props.get("lot_size") or props.get("LOT_SIZE") or
                                      props.get("LotSize") or 0) or None,
                "year_built": int(props.get("year_built") or props.get("YEAR_BUILT") or
                                 props.get("YearBuilt") or 0) or None,
                "property_type": (props.get("property_type") or props.get("PROPERTY_TYPE") or
                                 props.get("PropertyType") or props.get("UseCode")),

                # AVM data
                "avm_value": float(props.get("avm_value") or props.get("AVM") or
                                  props.get("AVMValue") or props.get("EstimatedValue") or 0) or None,
                "avm_high": float(props.get("avm_high") or props.get("AVM_HIGH") or
                                 props.get("AVMHighValue") or 0) or None,
                "avm_low": float(props.get("avm_low") or props.get("AVM_LOW") or
                                props.get("AVMLowValue") or 0) or None,
                "fsd_estimate": float(props.get("fsd_estimate") or props.get("FSD") or
                                     props.get("ForeclosureSaleEstimate") or 0) or None,
                "confidence_score": float(props.get("confidence_score") or props.get("CONFIDENCE") or
                                         props.get("ConfidenceScore") or 0) or None,

                # Recorder data (ownership/deed)
                "owner_name": (props.get("owner_name") or props.get("OWNER") or
                              props.get("OwnerName") or props.get("Owner1")),
                "owner_occupied": (props.get("owner_occupied") or props.get("OWNER_OCCUPIED") or
                                  props.get("OwnerOccupied")),
                "sale_price": float(props.get("sale_price") or props.get("SALE_PRICE") or
                                   props.get("LastSaleAmount") or 0) or None,

                # Tax Assessor data
                "assessed_total_value": float(props.get("assessed_value") or props.get("ASSESSED_VALUE") or
                                             props.get("AssessedTotalValue") or 0) or None,
                "assessed_land_value": float(props.get("assessed_land") or props.get("ASSESSED_LAND") or
                                            props.get("AssessedLandValue") or 0) or None,
                "assessed_improvement_value": float(props.get("assessed_improvement") or
                                                   props.get("ASSESSED_IMPROVEMENT") or
                                                   props.get("AssessedImprovementValue") or 0) or None,
                "tax_amount": float(props.get("tax_amount") or props.get("TAX_AMOUNT") or
                                   props.get("TaxAmount") or 0) or None,

                # Flood data
                "flood_zone": (props.get("flood_zone") or props.get("FLOOD_ZONE") or
                              props.get("FloodZone") or props.get("FLD_ZONE")),
                "flood_risk": (props.get("flood_risk") or props.get("FLOOD_RISK") or
                              props.get("FloodRisk")),

                # Geometry
                "geometry_wkt": geometry_wkt
            }

            properties_list.append(property_data)

        except Exception as e:
            print(f"⚠️ Error parsing feature: {e}")
            continue

    return properties_list


def parse_attom_csv(csv_content: str, batch_id: str) -> List[Dict[str, Any]]:
    """Parse ATTOM CSV format and extract property data"""
    properties_list = []

    csv_reader = csv.DictReader(io.StringIO(csv_content))
    rows = list(csv_reader)
    print(f"📦 Processing {len(rows)} rows from CSV")

    for row in rows:
        try:
            # Generate unique ATTOM ID if not present
            attom_id = row.get("ATTOM_ID") or row.get("attom_id") or str(uuid.uuid4())

            # Parse WKT geometry if present
            geometry_wkt = row.get("geometry") or row.get("GEOMETRY") or row.get("WKT")

            property_data = {
                "attom_id": attom_id,
                "upload_batch_id": batch_id,

                # Location
                "address": row.get("address") or row.get("SITE_ADDRESS") or row.get("PropertyAddress"),
                "city": row.get("city") or row.get("SITE_CITY") or row.get("PropertyCity"),
                "state": row.get("state") or row.get("SITE_STATE") or "TX",
                "zip_code": row.get("zip_code") or row.get("SITE_ZIP") or row.get("PropertyZip"),
                "county": row.get("county") or row.get("COUNTY") or "Travis",

                # Property characteristics
                "bedrooms": int(row.get("bedrooms") or row.get("BEDROOMS") or 0) or None,
                "bathrooms": float(row.get("bathrooms") or row.get("BATHROOMS") or 0) or None,
                "square_feet": int(row.get("square_feet") or row.get("SQFT") or 0) or None,
                "lot_size_sqft": float(row.get("lot_size") or row.get("LOT_SIZE") or 0) or None,
                "year_built": int(row.get("year_built") or row.get("YEAR_BUILT") or 0) or None,
                "property_type": row.get("property_type") or row.get("PROPERTY_TYPE"),

                # AVM data
                "avm_value": float(row.get("avm_value") or row.get("AVM") or 0) or None,
                "avm_high": float(row.get("avm_high") or row.get("AVM_HIGH") or 0) or None,
                "avm_low": float(row.get("avm_low") or row.get("AVM_LOW") or 0) or None,
                "fsd_estimate": float(row.get("fsd_estimate") or row.get("FSD") or 0) or None,
                "confidence_score": float(row.get("confidence_score") or row.get("CONFIDENCE") or 0) or None,

                # Recorder data
                "owner_name": row.get("owner_name") or row.get("OWNER") or row.get("OwnerName"),
                "owner_occupied": row.get("owner_occupied") or row.get("OWNER_OCCUPIED"),
                "sale_price": float(row.get("sale_price") or row.get("SALE_PRICE") or 0) or None,

                # Tax Assessor data
                "assessed_total_value": float(row.get("assessed_value") or row.get("ASSESSED_VALUE") or 0) or None,
                "assessed_land_value": float(row.get("assessed_land") or row.get("ASSESSED_LAND") or 0) or None,
                "assessed_improvement_value": float(row.get("assessed_improvement") or row.get("ASSESSED_IMPROVEMENT") or 0) or None,
                "tax_amount": float(row.get("tax_amount") or row.get("TAX_AMOUNT") or 0) or None,

                # Flood data
                "flood_zone": row.get("flood_zone") or row.get("FLOOD_ZONE") or row.get("FloodZone"),
                "flood_risk": row.get("flood_risk") or row.get("FLOOD_RISK"),

                # Geometry
                "geometry_wkt": geometry_wkt
            }

            properties_list.append(property_data)

        except Exception as e:
            print(f"⚠️ Error parsing row: {e}")
            continue

    return properties_list


@app.post("/api/upload-data")
async def upload_data(
    file: UploadFile = File(...),
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Unified upload endpoint for all data types

    Supports:
    - ZIP files (containing CSVs, PDFs, Shapefiles, Excel files, GeoJSON)
    - PDF documents (market reports, appraisals, etc.) - stored for RAG
    - Excel files (.xlsx, .xls)
    - GeoJSON files
    - CSV files
    - Shapefiles (.shp with supporting files in ZIP)

    Returns upload summary with processing results
    """
    if not DATABASE_AVAILABLE or db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        batch_id = str(uuid.uuid4())
        content = await file.read()
        filename = file.filename.lower()

        print(f"📤 Uploading: {file.filename} ({len(content)} bytes)")

        results = {
            "success": True,
            "batch_id": batch_id,
            "filename": file.filename,
            "processed": {
                "properties": 0,
                "documents": 0,
                "chunks": 0
            },
            "errors": []
        }

        # Process based on file type
        if filename.endswith('.zip'):
            # Process ZIP file
            zip_results = FileProcessor.process_zip(content, batch_id)

            # Process each file type from ZIP
            for csv_data in zip_results.get('csvs', []):
                # Process as ATTOM property data
                props_data = parse_attom_csv(csv_data['data'], batch_id)
                # ... insert into database (reuse existing logic)
                results['processed']['properties'] += len(props_data)

            for pdf_data in zip_results.get('pdfs', []):
                # Store PDF for RAG
                doc_count, chunk_count = store_document_for_rag(pdf_data, db, category)
                results['processed']['documents'] += doc_count
                results['processed']['chunks'] += chunk_count

            for geojson_data in zip_results.get('geojsons', []):
                # Process as property data
                props_data = parse_attom_geojson(geojson_data['geojson'], batch_id)
                results['processed']['properties'] += len(props_data)

            results['errors'] = zip_results.get('errors', [])

        elif filename.endswith('.pdf'):
            # Process single PDF for RAG
            pdf_data = FileProcessor.process_pdf(content, file.filename, batch_id)
            doc_count, chunk_count = store_document_for_rag(pdf_data, db, category)
            results['processed']['documents'] = doc_count
            results['processed']['chunks'] = chunk_count

        elif filename.endswith(('.geojson', '.json')):
            # Process GeoJSON as property data
            geojson_data = json.loads(content.decode('utf-8'))
            props_data = parse_attom_geojson(geojson_data, batch_id)
            results['processed']['properties'] = len(props_data)

        elif filename.endswith('.csv'):
            # Process CSV as property data
            csv_content = content.decode('utf-8')
            props_data = parse_attom_csv(csv_content, batch_id)
            results['processed']['properties'] = len(props_data)

        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {filename}")

        return results

    except Exception as e:
        db.rollback()
        print(f"❌ Upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


def store_document_for_rag(pdf_data: Dict[str, Any], db: Session, category: Optional[str] = None) -> tuple:
    """
    Store PDF document and create embeddings for RAG

    Returns:
        (document_count, chunk_count)
    """
    if not RAG_AVAILABLE or 'text_content' not in pdf_data:
        return (0, 0)

    try:
        # Create document record
        doc = Document(
            filename=pdf_data['filename'],
            file_type='pdf',
            file_size=pdf_data.get('file_size', 0),
            upload_batch_id=pdf_data['batch_id'],
            title=pdf_data.get('metadata', {}).get('title'),
            category=category,
            text_content=pdf_data['text_content'],
            page_count=pdf_data.get('page_count'),
            metadata_json=pdf_data.get('metadata')
        )
        db.add(doc)
        db.flush()  # Get document ID

        # Chunk the text
        chunks = DocumentChunker.chunk_text(pdf_data['text_content'])

        # Generate embeddings and store chunks
        chunk_count = 0
        for idx, chunk_text in enumerate(chunks):
            # Generate embedding
            embedding = EMBEDDING_MODEL.encode([chunk_text])[0].tolist()

            # Get metadata
            metadata = DocumentChunker.get_chunk_metadata(chunk_text)

            # Create chunk record
            chunk = DocumentChunk(
                document_id=doc.id,
                chunk_text=chunk_text,
                chunk_index=idx,
                embedding=embedding,
                char_count=metadata['char_count'],
                word_count=metadata['word_count']
            )
            db.add(chunk)
            chunk_count += 1

            # Commit every 50 chunks to avoid memory issues
            if chunk_count % 50 == 0:
                db.commit()

        db.commit()
        print(f"✅ Stored document '{pdf_data['filename']}' with {chunk_count} chunks")

        return (1, chunk_count)

    except Exception as e:
        print(f"❌ Error storing document for RAG: {e}")
        db.rollback()
        return (0, 0)


@app.post("/api/upload-attom-data")
async def upload_attom_data(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload ATTOM property data (GeoJSON or CSV format)

    Supports:
    - GeoJSON files with property features
    - CSV files with property data (can include WKT geometry column)

    Returns upload summary with batch ID and record count
    """
    if not DATABASE_AVAILABLE or db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        # Generate unique batch ID for this upload
        batch_id = str(uuid.uuid4())

        # Read file content
        content = await file.read()
        filename = file.filename.lower()

        print(f"📤 Uploading file: {file.filename} ({len(content)} bytes)")

        # Parse based on file type
        properties_data = []

        if filename.endswith('.geojson') or filename.endswith('.json'):
            # Parse GeoJSON
            geojson_data = json.loads(content.decode('utf-8'))
            properties_data = parse_attom_geojson(geojson_data, batch_id)

        elif filename.endswith('.csv'):
            # Parse CSV
            csv_content = content.decode('utf-8')
            properties_data = parse_attom_csv(csv_content, batch_id)

        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type. Please upload .geojson, .json, or .csv files"
            )

        if not properties_data:
            raise HTTPException(status_code=400, detail="No valid property data found in file")

        # Insert properties into database
        inserted_count = 0
        skipped_count = 0

        for prop_data in properties_data:
            try:
                # Check if property already exists
                existing = db.query(ATTOMProperty).filter(
                    ATTOMProperty.attom_id == prop_data["attom_id"]
                ).first()

                if existing:
                    # Update existing property
                    for key, value in prop_data.items():
                        if key != "geometry_wkt" and value is not None:
                            setattr(existing, key, value)

                    # Update geometry if provided
                    if prop_data.get("geometry_wkt"):
                        db.execute(
                            text(f"UPDATE attom_properties SET geometry = ST_GeomFromText(:wkt, 4326) WHERE id = :id"),
                            {"wkt": prop_data["geometry_wkt"], "id": existing.id}
                        )

                    existing.updated_at = datetime.utcnow()
                    skipped_count += 1
                else:
                    # Create new property
                    new_property = ATTOMProperty(**{k: v for k, v in prop_data.items() if k != "geometry_wkt"})
                    db.add(new_property)
                    db.flush()  # Get the ID

                    # Set geometry separately using PostGIS function
                    if prop_data.get("geometry_wkt"):
                        db.execute(
                            text(f"UPDATE attom_properties SET geometry = ST_GeomFromText(:wkt, 4326) WHERE id = :id"),
                            {"wkt": prop_data["geometry_wkt"], "id": new_property.id}
                        )

                    inserted_count += 1

                # Commit every 100 records to avoid memory issues
                if (inserted_count + skipped_count) % 100 == 0:
                    db.commit()
                    print(f"✅ Progress: {inserted_count + skipped_count}/{len(properties_data)} records")

            except Exception as e:
                print(f"⚠️ Error inserting property {prop_data.get('attom_id')}: {e}")
                skipped_count += 1
                continue

        # Final commit
        db.commit()

        print(f"✅ Upload complete: {inserted_count} inserted, {skipped_count} skipped/updated")

        return {
            "success": True,
            "batch_id": batch_id,
            "filename": file.filename,
            "total_records": len(properties_data),
            "inserted": inserted_count,
            "updated": skipped_count,
            "message": f"Successfully processed {inserted_count + skipped_count} properties from {file.filename}"
        }

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON format: {str(e)}")
    except Exception as e:
        db.rollback()
        print(f"❌ Upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "scoutgpt-simple-backend",
        "claude_configured": anthropic is not None,
        "database_available": DATABASE_AVAILABLE
    }


# Run the server
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
