"""Chat endpoints for Claude AI."""
from fastapi import APIRouter, HTTPException
import uuid

from models.schemas import ChatMessage, ChatResponse
from models.database import SessionLocal, ConversationModel
from services.claude_service import claude_service

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(message: ChatMessage):
    """
    Chat with Claude (ScoutGPT) - Real Estate AI Analyst.

    Claude has access to:
    - Uploaded documents (PDFs, reports) via search_documents tool
    - ArcGIS REST APIs (parcels, zoning) via query_arcgis tool
    - Property database (ATTOM, county records)
    """
    # Generate or use existing conversation ID
    conversation_id = message.conversation_id or str(uuid.uuid4())

    # Get conversation history
    db = SessionLocal()
    try:
        history_records = (
            db.query(ConversationModel)
            .filter_by(conversation_id=conversation_id)
            .order_by(ConversationModel.created_at)
            .all()
        )

        # Convert to Claude message format
        conversation_history = []
        for record in history_records:
            conversation_history.append({"role": "user", "content": record.user_message})
            conversation_history.append({"role": "assistant", "content": record.assistant_response})

    finally:
        db.close()

    # Call Claude
    try:
        result = await claude_service.chat(
            message=message.message,
            conversation_history=conversation_history,
        )

        # Store conversation
        db = SessionLocal()
        try:
            db_conversation = ConversationModel(
                user_message=message.message,
                assistant_response=result["reply"],
                conversation_id=conversation_id,
                sources=result.get("sources", []),
                metadata=result.get("metadata", {}),
            )
            db.add(db_conversation)
            db.commit()
        finally:
            db.close()

        return ChatResponse(
            reply=result["reply"],
            conversation_id=conversation_id,
            sources=result.get("sources"),
            metadata=result.get("metadata"),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


@router.get("/history/{conversation_id}")
async def get_conversation_history(conversation_id: str):
    """Get full conversation history."""
    db = SessionLocal()
    try:
        records = (
            db.query(ConversationModel)
            .filter_by(conversation_id=conversation_id)
            .order_by(ConversationModel.created_at)
            .all()
        )

        messages = []
        for record in records:
            messages.append({
                "role": "user",
                "content": record.user_message,
                "timestamp": record.created_at.isoformat(),
            })
            messages.append({
                "role": "assistant",
                "content": record.assistant_response,
                "sources": record.sources,
                "timestamp": record.created_at.isoformat(),
            })

        return {"conversation_id": conversation_id, "messages": messages, "total": len(messages)}

    finally:
        db.close()


@router.delete("/history/{conversation_id}")
async def clear_conversation_history(conversation_id: str):
    """Clear conversation history."""
    db = SessionLocal()
    try:
        deleted = db.query(ConversationModel).filter_by(conversation_id=conversation_id).delete()
        db.commit()
        return {"deleted": deleted, "conversation_id": conversation_id}
    finally:
        db.close()
