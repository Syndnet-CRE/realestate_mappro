"""
File upload routes for CSV, GeoJSON, Excel, PDF, ZIP
"""
import json
import zipfile
import io
import pandas as pd
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from pypdf import PdfReader

from database import get_db, Property, Document

router = APIRouter()


@router.post("/csv")
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload ATTOM CSV property data"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(400, "File must be CSV format")

    try:
        # Read CSV file
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))

        properties_added = 0

        # Parse ATTOM data (adjust column names based on your CSV)
        for _, row in df.iterrows():
            property_data = Property(
                attom_id=str(row.get('ATTOM ID', row.get('id', f"CSV_{properties_added}"))),
                address=row.get('Address', row.get('address', '')),
                city=row.get('City', row.get('city', '')),
                state=row.get('State', row.get('state', '')),
                zip_code=str(row.get('Zip', row.get('zip_code', ''))),
                county=row.get('County', row.get('county', '')),
                bedrooms=int(row.get('Bedrooms', row.get('bedrooms', 0))) if pd.notna(row.get('Bedrooms', row.get('bedrooms'))) else None,
                bathrooms=float(row.get('Bathrooms', row.get('bathrooms', 0))) if pd.notna(row.get('Bathrooms', row.get('bathrooms'))) else None,
                square_feet=int(row.get('SqFt', row.get('square_feet', 0))) if pd.notna(row.get('SqFt', row.get('square_feet'))) else None,
                lot_size=float(row.get('LotSize', row.get('lot_size', 0))) if pd.notna(row.get('LotSize', row.get('lot_size'))) else None,
                year_built=int(row.get('YearBuilt', row.get('year_built', 0))) if pd.notna(row.get('YearBuilt', row.get('year_built'))) else None,
                property_type=row.get('PropertyType', row.get('property_type', '')),
                avm=float(row.get('AVM', row.get('avm', 0))) if pd.notna(row.get('AVM', row.get('avm'))) else None,
                assessed_value=float(row.get('AssessedValue', row.get('assessed_value', 0))) if pd.notna(row.get('AssessedValue', row.get('assessed_value'))) else None,
                market_value=float(row.get('MarketValue', row.get('market_value', 0))) if pd.notna(row.get('MarketValue', row.get('market_value'))) else None,
                raw_data=row.to_dict()
            )

            # Check if property already exists
            existing = db.query(Property).filter(Property.attom_id == property_data.attom_id).first()
            if not existing:
                db.add(property_data)
                properties_added += 1

        db.commit()

        return {
            "status": "success",
            "message": f"Uploaded {properties_added} properties from CSV",
            "total_rows": len(df),
            "properties_added": properties_added
        }

    except Exception as e:
        raise HTTPException(500, f"Error processing CSV: {str(e)}")


@router.post("/geojson")
async def upload_geojson(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload GeoJSON property data"""
    if not file.filename.endswith(('.geojson', '.json')):
        raise HTTPException(400, "File must be GeoJSON/JSON format")

    try:
        contents = await file.read()
        geojson_data = json.loads(contents)

        properties_added = 0

        # Parse GeoJSON features
        features = geojson_data.get('features', [])

        for feature in features:
            props = feature.get('properties', {})
            geometry = feature.get('geometry', {})

            property_data = Property(
                attom_id=str(props.get('ATTOM ID', props.get('id', f"GEO_{properties_added}"))),
                address=props.get('Address', props.get('address', '')),
                city=props.get('City', props.get('city', '')),
                state=props.get('State', props.get('state', '')),
                zip_code=str(props.get('Zip', props.get('zip_code', ''))),
                county=props.get('County', props.get('county', '')),
                bedrooms=props.get('Bedrooms', props.get('bedrooms')),
                bathrooms=props.get('Bathrooms', props.get('bathrooms')),
                square_feet=props.get('SqFt', props.get('square_feet')),
                lot_size=props.get('LotSize', props.get('lot_size')),
                year_built=props.get('YearBuilt', props.get('year_built')),
                property_type=props.get('PropertyType', props.get('property_type')),
                avm=props.get('AVM', props.get('avm')),
                assessed_value=props.get('AssessedValue', props.get('assessed_value')),
                market_value=props.get('MarketValue', props.get('market_value')),
                geometry=geometry,
                raw_data=props
            )

            existing = db.query(Property).filter(Property.attom_id == property_data.attom_id).first()
            if not existing:
                db.add(property_data)
                properties_added += 1

        db.commit()

        return {
            "status": "success",
            "message": f"Uploaded {properties_added} properties from GeoJSON",
            "total_features": len(features),
            "properties_added": properties_added
        }

    except Exception as e:
        raise HTTPException(500, f"Error processing GeoJSON: {str(e)}")


@router.post("/excel")
async def upload_excel(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload Excel (.xlsx) property data"""
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(400, "File must be Excel format (.xlsx or .xls)")

    try:
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))

        properties_added = 0

        for _, row in df.iterrows():
            property_data = Property(
                attom_id=str(row.get('ATTOM ID', row.get('id', f"XLS_{properties_added}"))),
                address=row.get('Address', row.get('address', '')),
                city=row.get('City', row.get('city', '')),
                state=row.get('State', row.get('state', '')),
                zip_code=str(row.get('Zip', row.get('zip_code', ''))),
                county=row.get('County', row.get('county', '')),
                bedrooms=int(row.get('Bedrooms', row.get('bedrooms', 0))) if pd.notna(row.get('Bedrooms', row.get('bedrooms'))) else None,
                bathrooms=float(row.get('Bathrooms', row.get('bathrooms', 0))) if pd.notna(row.get('Bathrooms', row.get('bathrooms'))) else None,
                square_feet=int(row.get('SqFt', row.get('square_feet', 0))) if pd.notna(row.get('SqFt', row.get('square_feet'))) else None,
                avm=float(row.get('AVM', row.get('avm', 0))) if pd.notna(row.get('AVM', row.get('avm'))) else None,
                raw_data=row.to_dict()
            )

            existing = db.query(Property).filter(Property.attom_id == property_data.attom_id).first()
            if not existing:
                db.add(property_data)
                properties_added += 1

        db.commit()

        return {
            "status": "success",
            "message": f"Uploaded {properties_added} properties from Excel",
            "total_rows": len(df),
            "properties_added": properties_added
        }

    except Exception as e:
        raise HTTPException(500, f"Error processing Excel: {str(e)}")


@router.post("/pdf")
async def upload_pdf(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload PDF and extract text (no semantic search/RAG)"""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(400, "File must be PDF format")

    try:
        contents = await file.read()

        # Extract text from PDF
        pdf_reader = PdfReader(io.BytesIO(contents))
        text_content = ""

        for page in pdf_reader.pages:
            text_content += page.extract_text() + "\n\n"

        # Save document
        document = Document(
            filename=file.filename,
            file_type="pdf",
            text_content=text_content,
            file_size=len(contents),
            extra_metadata={
                "num_pages": len(pdf_reader.pages),
                "note": "Text extracted - semantic search disabled (lightweight mode)"
            }
        )

        db.add(document)
        db.commit()

        return {
            "status": "success",
            "message": f"PDF uploaded and text extracted",
            "filename": file.filename,
            "pages": len(pdf_reader.pages),
            "text_length": len(text_content),
            "note": "✅ Text extraction works, ❌ Semantic search disabled (no RAG in lightweight mode)"
        }

    except Exception as e:
        raise HTTPException(500, f"Error processing PDF: {str(e)}")


@router.post("/zip")
async def upload_zip(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload ZIP containing CSVs, GeoJSON, PDFs (no shapefiles)"""
    if not file.filename.endswith('.zip'):
        raise HTTPException(400, "File must be ZIP format")

    try:
        contents = await file.read()
        results = {
            "csv_files": [],
            "geojson_files": [],
            "pdf_files": [],
            "skipped_files": [],
            "total_properties": 0
        }

        with zipfile.ZipFile(io.BytesIO(contents)) as zip_file:
            for filename in zip_file.namelist():
                file_lower = filename.lower()

                # Skip shapefiles (disabled - requires GDAL)
                if file_lower.endswith(('.shp', '.shx', '.dbf', '.prj')):
                    results["skipped_files"].append({
                        "filename": filename,
                        "reason": "Shapefiles disabled in lightweight mode (requires GDAL)"
                    })
                    continue

                file_data = zip_file.read(filename)

                # Process CSV files
                if file_lower.endswith('.csv'):
                    df = pd.read_csv(io.BytesIO(file_data))
                    count = len(df)
                    # Process CSV data (similar to upload_csv)
                    results["csv_files"].append({"filename": filename, "rows": count})
                    results["total_properties"] += count

                # Process GeoJSON files
                elif file_lower.endswith(('.geojson', '.json')):
                    geojson_data = json.loads(file_data)
                    features = geojson_data.get('features', [])
                    results["geojson_files"].append({"filename": filename, "features": len(features)})
                    results["total_properties"] += len(features)

                # Process PDF files
                elif file_lower.endswith('.pdf'):
                    pdf_reader = PdfReader(io.BytesIO(file_data))
                    results["pdf_files"].append({"filename": filename, "pages": len(pdf_reader.pages)})

        return {
            "status": "success",
            "message": "ZIP file processed",
            "results": results
        }

    except Exception as e:
        raise HTTPException(500, f"Error processing ZIP: {str(e)}")
