"""File upload endpoints."""
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import uuid

from models.schemas import UploadResponse, FileProcessingResult, ProcessingStatus
from models.database import SessionLocal, DocumentModel, DatasetModel
from services.file_processor import file_processor
from services.rag_service import rag_service

router = APIRouter(prefix="/upload", tags=["upload"])


@router.post("", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """
    Upload and process a file (ZIP, PDF, CSV, Excel, Shapefile).

    Supports:
    - ZIP files with mixed content (auto-extracts and processes)
    - PDFs (extracted and indexed for RAG)
    - CSV/Excel (parsed and stored in database)
    - Shapefiles (converted to GeoJSON)
    """
    # Read file content
    content = await file.read()
    size_bytes = len(content)

    # Detect file type
    file_type = file_processor.detect_file_type(file.filename)

    # Save upload
    file_id, file_path = await file_processor.save_upload(file.filename, content)

    # Store in database
    db = SessionLocal()
    try:
        db_document = DocumentModel(
            id=file_id,
            filename=file.filename,
            file_type=file_type.value,
            file_path=file_path,
            size_bytes=size_bytes,
            status=ProcessingStatus.PENDING.value,
        )
        db.add(db_document)
        db.commit()
    finally:
        db.close()

    # Process file asynchronously (in production, use background tasks)
    try:
        result = await file_processor.process_file(file_path, file_type)

        # Update database status
        db = SessionLocal()
        try:
            db_document = db.query(DocumentModel).filter_by(id=file_id).first()
            if db_document:
                db_document.status = result.status.value
                db_document.meta_data = result.metadata
                db.commit()
        finally:
            db.close()

        # If PDF, store chunks for RAG
        if file_type.value == "pdf" and result.status == ProcessingStatus.COMPLETED:
            chunks = result.metadata.get("chunks", [])
            if chunks:
                await rag_service.store_document_chunks(
                    document_id=file_id,
                    document_name=file.filename,
                    chunks=chunks,
                )
                # Don't include full chunks in response (too large)
                result.metadata["chunks"] = f"{len(chunks)} chunks stored"

        return UploadResponse(
            file_id=file_id,
            filename=file.filename,
            file_type=file_type,
            size_bytes=size_bytes,
            status=result.status,
            message=f"File processed successfully. {result.records_processed} records processed.",
            extracted_files=result.metadata.get("extracted_files"),
        )

    except Exception as e:
        # Update status to failed
        db = SessionLocal()
        try:
            db_document = db.query(DocumentModel).filter_by(id=file_id).first()
            if db_document:
                db_document.status = ProcessingStatus.FAILED.value
                db_document.meta_data = {"error": str(e)}
                db.commit()
        finally:
            db.close()

        raise HTTPException(status_code=500, detail=f"File processing failed: {str(e)}")


@router.post("/batch", response_model=List[UploadResponse])
async def upload_multiple_files(files: List[UploadFile] = File(...)):
    """Upload and process multiple files at once."""
    results = []
    for file in files:
        try:
            result = await upload_file(file)
            results.append(result)
        except Exception as e:
            # Continue processing other files even if one fails
            results.append(
                UploadResponse(
                    file_id=str(uuid.uuid4()),
                    filename=file.filename,
                    file_type="unknown",
                    size_bytes=0,
                    status=ProcessingStatus.FAILED,
                    message=f"Failed: {str(e)}",
                )
            )
    return results


@router.get("/status/{file_id}", response_model=FileProcessingResult)
async def get_upload_status(file_id: str):
    """Get the processing status of an uploaded file."""
    db = SessionLocal()
    try:
        document = db.query(DocumentModel).filter_by(id=file_id).first()
        if not document:
            raise HTTPException(status_code=404, detail="File not found")

        return FileProcessingResult(
            file_id=document.id,
            filename=document.filename,
            file_type=document.file_type,
            status=document.status,
            records_processed=document.meta_data.get("records_processed", 0) if document.meta_data else 0,
            metadata=document.meta_data or {},
        )
    finally:
        db.close()
