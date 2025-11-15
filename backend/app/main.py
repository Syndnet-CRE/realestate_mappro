from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import os

from app.database import get_db, engine
from app import models, schemas

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ScoutGPT API",
    description="Backend API for ScoutGPT real estate intelligence platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "ScoutGPT API",
        "version": "1.0.0",
        "endpoints": {
            "datasets": "/datasets",
            "layers": "/layers",
            "chat": "/chat",
            "docs": "/docs"
        }
    }


# ===== DATASET ENDPOINTS =====

@app.post("/datasets", response_model=schemas.Dataset)
def create_dataset(dataset: schemas.DatasetCreate, db: Session = Depends(get_db)):
    """Create a new dataset"""
    db_dataset = models.Dataset(**dataset.dict())
    db.add(db_dataset)
    db.commit()
    db.refresh(db_dataset)
    return db_dataset


@app.get("/datasets", response_model=List[schemas.Dataset])
def list_datasets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all datasets"""
    datasets = db.query(models.Dataset).offset(skip).limit(limit).all()
    return datasets


@app.get("/datasets/{dataset_id}", response_model=schemas.Dataset)
def get_dataset(dataset_id: int, db: Session = Depends(get_db)):
    """Get a specific dataset"""
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return dataset


@app.delete("/datasets/{dataset_id}")
def delete_dataset(dataset_id: int, db: Session = Depends(get_db)):
    """Delete a dataset"""
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    db.delete(dataset)
    db.commit()
    return {"message": "Dataset deleted successfully"}


@app.post("/datasets/{dataset_id}/upload")
async def upload_file(dataset_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload a file to a dataset"""
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    # Create upload directory
    upload_dir = f"/data/datasets/{dataset_id}"
    os.makedirs(upload_dir, exist_ok=True)

    # Save file
    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # Create file record
    db_file = models.DatasetFile(
        dataset_id=dataset_id,
        path=file_path,
        original_name=file.filename,
        file_type=file.content_type,
        size_bytes=len(content)
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    return {"message": "File uploaded successfully", "file_id": db_file.id}


@app.post("/datasets/{dataset_id}/ingest")
def ingest_dataset(dataset_id: int, config: schemas.IngestConfig, db: Session = Depends(get_db)):
    """Trigger ingestion for a dataset"""
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    # Update dataset status
    dataset.status = "processing"
    db.commit()

    # TODO: Implement actual ingestion logic based on ingest_type
    # For now, just return success

    return {
        "message": f"Ingestion started for dataset {dataset_id}",
        "ingest_type": config.ingest_type,
        "dataset_id": dataset_id
    }


# ===== LAYER ENDPOINTS =====

@app.get("/layers", response_model=List[schemas.Layer])
def list_layers(db: Session = Depends(get_db)):
    """List all map layers"""
    layers = db.query(models.Layer).all()
    return layers


@app.get("/layers/{layer_name}/features")
def get_layer_features(
    layer_name: str,
    bbox: Optional[str] = None,
    limit: int = 1000,
    db: Session = Depends(get_db)
):
    """Get GeoJSON features for a layer"""
    layer = db.query(models.Layer).filter(models.Layer.name == layer_name).first()
    if not layer:
        raise HTTPException(status_code=404, detail="Layer not found")

    # Query features for this layer
    query = db.query(models.Feature).filter(models.Feature.layer_id == layer.id)

    # TODO: Apply bbox filter if provided

    features = query.limit(limit).all()

    # Convert to GeoJSON
    geojson = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": feature.geom_geojson,
                "properties": feature.properties
            }
            for feature in features
        ]
    }

    return geojson


# ===== PARCEL ENDPOINTS =====

@app.get("/parcels")
def get_parcels(
    bbox: Optional[str] = None,
    zoning: Optional[str] = None,
    min_lot_size: Optional[float] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Query parcels with filters"""
    query = db.query(models.Parcel)

    # Apply filters
    if zoning:
        query = query.filter(models.Parcel.zoning == zoning)
    if min_lot_size:
        query = query.filter(models.Parcel.lot_size >= min_lot_size)

    # TODO: Apply bbox filter using PostGIS

    parcels = query.limit(limit).all()

    # Convert to GeoJSON
    features = []
    for parcel in parcels:
        features.append({
            "type": "Feature",
            "geometry": parcel.geom_geojson,
            "properties": {
                "id": parcel.id,
                "apn": parcel.apn,
                "owner_name": parcel.owner_name,
                "zoning": parcel.zoning,
                "lot_size": float(parcel.lot_size) if parcel.lot_size else None,
                **(parcel.attributes or {})
            }
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }


# ===== CHAT ENDPOINT =====

@app.post("/chat")
def chat(message: schemas.ChatMessage, db: Session = Depends(get_db)):
    """Handle chat messages with AI"""
    user_message = message.message

    # TODO: Implement actual Claude integration
    # For now, return a simple response

    # Simple pattern matching for demo
    if "parcel" in user_message.lower() or "property" in user_message.lower():
        response = "I can help you find parcels in the database. The current dataset includes SF parcels with zoning and ownership information."
    elif "dataset" in user_message.lower():
        datasets = db.query(models.Dataset).all()
        response = f"I have access to {len(datasets)} datasets: {', '.join([d.name for d in datasets])}"
    elif "zoning" in user_message.lower():
        response = "I can query zoning information. Try asking about specific zoning types like 'R-2' or 'commercial' zones."
    else:
        response = "I'm ScoutGPT, your real estate intelligence assistant. Ask me about parcels, datasets, or zoning information!"

    return {"reply": response, "message": user_message}


# ===== TRAINING ENDPOINT =====

@app.post("/train")
def train_model(config: schemas.TrainConfig, db: Session = Depends(get_db)):
    """Trigger model training (stub)"""
    dataset = db.query(models.Dataset).filter(models.Dataset.id == config.dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    return {
        "message": f"Training started for task '{config.task_type}' on dataset {config.dataset_id}",
        "task_type": config.task_type,
        "dataset_name": dataset.name,
        "status": "queued"
    }


# Health check
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "scoutgpt-api"}
