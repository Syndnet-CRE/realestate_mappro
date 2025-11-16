"""
ScoutGPT Simple Backend - Claude-Only Version

This is a minimal backend that just talks to Claude API.
No database, no Docker, no complexity - just Claude as your brain.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from anthropic import Anthropic
import os
import requests
from typing import Optional, List, Dict, Any

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
    anthropic = Anthropic(api_key=ANTHROPIC_API_KEY)

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
        print(f"🟢 Calling Claude API...")
        # First call to Claude with tools
        response = anthropic.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=2048,
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
                model="claude-3-sonnet-20240229",
                max_tokens=2048,
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


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "scoutgpt-simple-backend",
        "claude_configured": anthropic is not None
    }


# Run the server
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
