"""
Claude AI chat route for real estate analysis
"""
import os
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from anthropic import Anthropic
from typing import List, Optional
from datetime import datetime

from database import get_db, ChatMessage, Property

router = APIRouter()

# Initialize Anthropic client
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

if not ANTHROPIC_API_KEY or ANTHROPIC_API_KEY == "your-anthropic-api-key-here":
    print("⚠️  WARNING: ANTHROPIC_API_KEY not set. Chat functionality will be disabled.")
    anthropic_client = None
else:
    anthropic_client = Anthropic(api_key=ANTHROPIC_API_KEY)


class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"
    include_context: bool = True


class ChatResponse(BaseModel):
    response: str
    session_id: str
    timestamp: datetime


@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Send message to Claude AI for real estate analysis
    """

    if not anthropic_client:
        raise HTTPException(
            503,
            "Chat functionality disabled. Set ANTHROPIC_API_KEY environment variable."
        )

    try:
        # Get conversation history
        history = db.query(ChatMessage)\
            .filter(ChatMessage.session_id == request.session_id)\
            .order_by(ChatMessage.timestamp.desc())\
            .limit(10)\
            .all()

        # Build context from database
        context = ""

        if request.include_context:
            # Get property statistics for context
            total_properties = db.query(Property).count()

            if total_properties > 0:
                from sqlalchemy import func

                stats = db.query(
                    func.count(Property.id).label('total'),
                    func.avg(Property.avm).label('avg_price'),
                    func.avg(Property.bedrooms).label('avg_beds'),
                    func.avg(Property.square_feet).label('avg_sqft')
                ).first()

                # Get sample cities
                cities = db.query(Property.city, Property.state)\
                    .distinct()\
                    .limit(10)\
                    .all()

                city_list = ", ".join([f"{city} ({state})" for city, state in cities if city and state])

                # Format statistics
                avg_price_str = f"${stats.avg_price:,.0f}" if stats.avg_price else 'N/A'
                avg_beds_str = f"{stats.avg_beds:.1f}" if stats.avg_beds else 'N/A'
                avg_sqft_str = f"{stats.avg_sqft:,.0f}" if stats.avg_sqft else 'N/A'

                context = f"""
You are ScoutGPT, a real estate intelligence assistant. You have access to the following data:

DATABASE CONTEXT:
- Total properties in database: {stats.total}
- Average property value: {avg_price_str}
- Average bedrooms: {avg_beds_str}
- Average square feet: {avg_sqft_str}
- Cities covered: {city_list}

Available data sources:
✅ ATTOM property data (uploaded by user)
✅ ArcGIS county parcels and zoning
✅ PDF documents (text extraction only)
❌ RAG/semantic search (disabled in lightweight mode)

User can query properties by:
- City, state, county
- Bedrooms, bathrooms, square feet
- Price range (AVM)
- Property type

When analyzing real estate, provide insights on:
- Market trends and comparisons
- Property valuations
- Investment potential
- Location analysis
- Zoning and development opportunities
"""

        # Build messages for Claude
        messages = []

        # Add conversation history (reversed to chronological order)
        for msg in reversed(history):
            messages.append({
                "role": msg.role,
                "content": msg.content
            })

        # Add current user message
        messages.append({
            "role": "user",
            "content": request.message
        })

        # Call Claude API
        response = anthropic_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2000,
            system=context if context else "You are ScoutGPT, a helpful real estate analysis assistant.",
            messages=messages
        )

        assistant_message = response.content[0].text

        # Save messages to database
        user_msg = ChatMessage(
            session_id=request.session_id,
            role="user",
            content=request.message,
            extra_metadata={"include_context": request.include_context}
        )
        db.add(user_msg)

        assistant_msg = ChatMessage(
            session_id=request.session_id,
            role="assistant",
            content=assistant_message,
            extra_metadata={
                "model": "claude-3-5-sonnet-20241022",
                "tokens": response.usage.output_tokens if hasattr(response, 'usage') else None
            }
        )
        db.add(assistant_msg)

        db.commit()

        return ChatResponse(
            response=assistant_message,
            session_id=request.session_id,
            timestamp=datetime.utcnow()
        )

    except Exception as e:
        raise HTTPException(500, f"Chat error: {str(e)}")


@router.get("/history/{session_id}")
async def get_chat_history(session_id: str, limit: int = 50, db: Session = Depends(get_db)):
    """Get chat history for a session"""

    messages = db.query(ChatMessage)\
        .filter(ChatMessage.session_id == session_id)\
        .order_by(ChatMessage.timestamp.desc())\
        .limit(limit)\
        .all()

    return {
        "session_id": session_id,
        "messages": [
            {
                "role": msg.role,
                "content": msg.content,
                "timestamp": msg.timestamp
            }
            for msg in reversed(messages)
        ]
    }


@router.delete("/history/{session_id}")
async def clear_chat_history(session_id: str, db: Session = Depends(get_db)):
    """Clear chat history for a session"""

    deleted = db.query(ChatMessage)\
        .filter(ChatMessage.session_id == session_id)\
        .delete()

    db.commit()

    return {
        "status": "success",
        "messages_deleted": deleted
    }
