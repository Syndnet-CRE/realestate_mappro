"""Dataset management endpoints."""
from fastapi import APIRouter, HTTPException

from models.schemas import DatasetListResponse, Dataset as DatasetSchema
from models.database import SessionLocal, DatasetModel

router = APIRouter(prefix="/datasets", tags=["datasets"])


@router.get("", response_model=DatasetListResponse)
async def list_datasets():
    """List all uploaded datasets."""
    db = SessionLocal()
    try:
        db_datasets = db.query(DatasetModel).order_by(DatasetModel.created_at.desc()).all()

        datasets = [
            DatasetSchema(
                id=ds.id,
                name=ds.name,
                status=ds.status,
                record_count=ds.record_count,
                created_at=ds.created_at,
                updated_at=ds.updated_at,
                file_type=ds.file_type,
                metadata=ds.metadata,
            )
            for ds in db_datasets
        ]

        return DatasetListResponse(datasets=datasets, total=len(datasets))

    finally:
        db.close()


@router.get("/{dataset_id}", response_model=DatasetSchema)
async def get_dataset(dataset_id: str):
    """Get dataset details."""
    db = SessionLocal()
    try:
        dataset = db.query(DatasetModel).filter_by(id=dataset_id).first()
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")

        return DatasetSchema(
            id=dataset.id,
            name=dataset.name,
            status=dataset.status,
            record_count=dataset.record_count,
            created_at=dataset.created_at,
            updated_at=dataset.updated_at,
            file_type=dataset.file_type,
            metadata=dataset.metadata,
        )

    finally:
        db.close()


@router.delete("/{dataset_id}")
async def delete_dataset(dataset_id: str):
    """Delete a dataset."""
    db = SessionLocal()
    try:
        dataset = db.query(DatasetModel).filter_by(id=dataset_id).first()
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")

        db.delete(dataset)
        db.commit()

        return {"deleted": True, "dataset_id": dataset_id}

    finally:
        db.close()
