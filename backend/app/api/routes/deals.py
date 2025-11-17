"""
Deals/Opportunities routes
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class Deal(BaseModel):
    id: str
    property_id: Optional[str] = None
    property_address: str
    stage: str  # "interest", "diligence", "negotiation", "contract", "closing"
    priority: str  # "high", "medium", "low"
    asking_price: float
    offer_price: Optional[float] = None
    estimated_value: Optional[float] = None
    created_at: datetime
    updated_at: datetime

class DealCreate(BaseModel):
    property_id: Optional[str] = None
    property_address: str
    asking_price: float
    stage: str = "interest"
    priority: str = "medium"

class DealUpdate(BaseModel):
    stage: Optional[str] = None
    priority: Optional[str] = None
    offer_price: Optional[float] = None
    estimated_value: Optional[float] = None

@router.get("/")
async def list_deals(
    stage: Optional[str] = None,
    priority: Optional[str] = None,
    user_id: str = "mock-user"
):
    """
    List all deals for a user

    Filter by stage and priority
    """
    # TODO: Query database
    mock_deals = [
        {
            "id": "deal-1",
            "property_address": "123 Main St, Dallas, TX",
            "stage": "diligence",
            "priority": "high",
            "asking_price": 1500000,
            "offer_price": 1450000,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
    ]

    return {"deals": mock_deals, "total": 1}

@router.post("/")
async def create_deal(deal: DealCreate, user_id: str = "mock-user"):
    """
    Create a new deal
    """
    # TODO: Insert to database
    return {
        "id": "new-deal-id",
        **deal.dict(),
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }

@router.get("/{deal_id}")
async def get_deal(deal_id: str):
    """
    Get deal details
    """
    # TODO: Query database
    return {
        "id": deal_id,
        "property_address": "123 Main St",
        "stage": "diligence",
        "priority": "high"
    }

@router.put("/{deal_id}")
async def update_deal(deal_id: str, updates: DealUpdate):
    """
    Update deal information
    """
    # TODO: Update database
    return {"id": deal_id, "message": "Deal updated"}

@router.put("/{deal_id}/stage")
async def update_deal_stage(deal_id: str, new_stage: str):
    """
    Move deal to a different stage

    Stages: interest → diligence → negotiation → contract → closing
    """
    valid_stages = ["interest", "diligence", "negotiation", "contract", "closing"]

    if new_stage not in valid_stages:
        raise HTTPException(status_code=400, detail=f"Invalid stage. Must be one of: {valid_stages}")

    # TODO: Update database
    return {"id": deal_id, "stage": new_stage}

@router.delete("/{deal_id}")
async def delete_deal(deal_id: str):
    """
    Delete a deal
    """
    # TODO: Delete from database
    return {"message": "Deal deleted"}

@router.post("/bulk-action")
async def bulk_deal_action(
    deal_ids: List[str],
    action: str,
    user_id: str = "mock-user"
):
    """
    Perform bulk actions on multiple deals

    Actions: update_stage, update_priority, delete, export
    """
    # TODO: Implement bulk operations
    return {
        "action": action,
        "deal_ids": deal_ids,
        "affected": len(deal_ids)
    }
