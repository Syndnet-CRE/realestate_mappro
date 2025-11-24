"""
Property query routes for ATTOM data
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import Optional, List
from pydantic import BaseModel

from database import get_db, Property

router = APIRouter()


class PropertyResponse(BaseModel):
    id: int
    attom_id: str
    address: str
    city: str
    state: str
    zip_code: str
    county: Optional[str]
    bedrooms: Optional[int]
    bathrooms: Optional[float]
    square_feet: Optional[int]
    lot_size: Optional[float]
    year_built: Optional[int]
    property_type: Optional[str]
    avm: Optional[float]
    assessed_value: Optional[float]
    market_value: Optional[float]
    geometry: Optional[dict]

    class Config:
        from_attributes = True


@router.get("/search", response_model=List[PropertyResponse])
async def search_properties(
    city: Optional[str] = None,
    state: Optional[str] = None,
    county: Optional[str] = None,
    min_bedrooms: Optional[int] = None,
    max_bedrooms: Optional[int] = None,
    min_bathrooms: Optional[float] = None,
    min_sqft: Optional[int] = None,
    max_sqft: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    property_type: Optional[str] = None,
    limit: int = Query(100, le=1000),
    db: Session = Depends(get_db)
):
    """
    Search properties with filters
    Example: /api/properties/search?city=Austin&min_bedrooms=3&max_price=500000
    """
    query = db.query(Property)

    # Apply filters
    filters = []

    if city:
        filters.append(Property.city.ilike(f"%{city}%"))
    if state:
        filters.append(Property.state.ilike(f"%{state}%"))
    if county:
        filters.append(Property.county.ilike(f"%{county}%"))
    if min_bedrooms:
        filters.append(Property.bedrooms >= min_bedrooms)
    if max_bedrooms:
        filters.append(Property.bedrooms <= max_bedrooms)
    if min_bathrooms:
        filters.append(Property.bathrooms >= min_bathrooms)
    if min_sqft:
        filters.append(Property.square_feet >= min_sqft)
    if max_sqft:
        filters.append(Property.square_feet <= max_sqft)
    if min_price:
        filters.append(Property.avm >= min_price)
    if max_price:
        filters.append(Property.avm <= max_price)
    if property_type:
        filters.append(Property.property_type.ilike(f"%{property_type}%"))

    if filters:
        query = query.filter(and_(*filters))

    properties = query.limit(limit).all()

    return properties


@router.get("/stats")
async def get_property_stats(db: Session = Depends(get_db)):
    """Get statistics about uploaded properties"""
    total_properties = db.query(Property).count()

    if total_properties == 0:
        return {
            "total_properties": 0,
            "message": "No properties uploaded yet. Upload CSV or GeoJSON files first."
        }

    # Get city breakdown
    cities = db.query(Property.city, Property.state)\
        .distinct()\
        .limit(20)\
        .all()

    # Average values
    from sqlalchemy import func
    avg_stats = db.query(
        func.avg(Property.bedrooms).label('avg_bedrooms'),
        func.avg(Property.bathrooms).label('avg_bathrooms'),
        func.avg(Property.square_feet).label('avg_sqft'),
        func.avg(Property.avm).label('avg_avm'),
        func.min(Property.avm).label('min_avm'),
        func.max(Property.avm).label('max_avm')
    ).first()

    return {
        "total_properties": total_properties,
        "cities": [{"city": city, "state": state} for city, state in cities],
        "averages": {
            "bedrooms": round(avg_stats.avg_bedrooms, 1) if avg_stats.avg_bedrooms else None,
            "bathrooms": round(avg_stats.avg_bathrooms, 1) if avg_stats.avg_bathrooms else None,
            "square_feet": round(avg_stats.avg_sqft, 0) if avg_stats.avg_sqft else None,
            "avm": round(avg_stats.avg_avm, 0) if avg_stats.avg_avm else None,
            "price_range": {
                "min": round(avg_stats.min_avm, 0) if avg_stats.min_avm else None,
                "max": round(avg_stats.max_avm, 0) if avg_stats.max_avm else None
            }
        }
    }


@router.get("/geojson")
async def get_properties_geojson(
    city: Optional[str] = None,
    state: Optional[str] = None,
    county: Optional[str] = None,
    limit: int = Query(500, le=5000),
    db: Session = Depends(get_db)
):
    """
    Get properties as GeoJSON for map display
    """
    query = db.query(Property).filter(Property.geometry.isnot(None))

    if city:
        query = query.filter(Property.city.ilike(f"%{city}%"))
    if state:
        query = query.filter(Property.state.ilike(f"%{state}%"))
    if county:
        query = query.filter(Property.county.ilike(f"%{county}%"))

    properties = query.limit(limit).all()

    features = []
    for prop in properties:
        features.append({
            "type": "Feature",
            "geometry": prop.geometry,
            "properties": {
                "id": prop.id,
                "attom_id": prop.attom_id,
                "address": prop.address,
                "city": prop.city,
                "state": prop.state,
                "bedrooms": prop.bedrooms,
                "bathrooms": prop.bathrooms,
                "square_feet": prop.square_feet,
                "avm": prop.avm,
                "property_type": prop.property_type
            }
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }


@router.get("/{property_id}", response_model=PropertyResponse)
async def get_property(property_id: int, db: Session = Depends(get_db)):
    """Get single property by ID"""
    property = db.query(Property).filter(Property.id == property_id).first()

    if not property:
        raise HTTPException(404, "Property not found")

    return property
