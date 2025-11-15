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


# Tool execution functions
def execute_tool(tool_name: str, tool_input: Dict[str, Any]) -> Dict[str, Any]:
    """Execute a tool and return results"""

    if tool_name == "search_properties":
        # Mock property search results
        location = tool_input.get("location", "unknown")
        return {
            "results": [
                {
                    "address": f"123 Main St, {location}",
                    "price": 650000,
                    "type": "residential",
                    "beds": 3,
                    "baths": 2,
                    "sqft": 1800,
                    "zoning": "R-2"
                },
                {
                    "address": f"456 Oak Ave, {location}",
                    "price": 1200000,
                    "type": "commercial",
                    "sqft": 5000,
                    "zoning": "C-1"
                },
                {
                    "address": f"789 Pine Rd, {location}",
                    "price": 425000,
                    "type": "residential",
                    "beds": 2,
                    "baths": 1,
                    "sqft": 1200,
                    "zoning": "R-1"
                }
            ],
            "total_found": 3
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

    if not anthropic:
        raise HTTPException(
            status_code=500,
            detail="Anthropic API key not configured. Please set ANTHROPIC_API_KEY environment variable."
        )

    try:
        # First call to Claude with tools
        response = anthropic.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2048,
            tools=CLAUDE_TOOLS,
            messages=[{
                "role": "user",
                "content": message.message
            }]
        )

        # Check if Claude wants to use a tool
        tool_calls = []
        while response.stop_reason == "tool_use":
            # Extract tool use
            tool_use = next(
                (block for block in response.content if block.type == "tool_use"),
                None
            )

            if not tool_use:
                break

            # Execute the tool
            tool_result = execute_tool(tool_use.name, tool_use.input)
            tool_calls.append({
                "name": tool_use.name,
                "input": tool_use.input,
                "result": tool_result
            })

            # Continue the conversation with the tool result
            response = anthropic.messages.create(
                model="claude-3-5-sonnet-20241022",
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

        return ChatResponse(
            reply=text_response,
            tool_calls=tool_calls if tool_calls else None
        )

    except Exception as e:
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
