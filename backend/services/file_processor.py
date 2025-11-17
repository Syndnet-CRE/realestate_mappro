"""File processing service for ZIP, PDF, CSV, Excel, and Shapefiles."""
import os
import zipfile
import csv
import json
from pathlib import Path
from typing import List, Dict, Any, Tuple
import uuid

import PyPDF2
import pdfplumber
import pandas as pd
import geopandas as gpd
from shapely.geometry import mapping

from models.schemas import FileType, ProcessingStatus, FileProcessingResult
from config.settings import settings


class FileProcessor:
    """Handles multi-format file processing."""

    def __init__(self):
        self.upload_dir = Path(settings.upload_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def detect_file_type(self, filename: str) -> FileType:
        """Detect file type from extension."""
        ext = Path(filename).suffix.lower()
        if ext == ".pdf":
            return FileType.PDF
        elif ext == ".csv":
            return FileType.CSV
        elif ext in [".xlsx", ".xls"]:
            return FileType.XLSX
        elif ext == ".zip":
            return FileType.ZIP
        elif ext in [".shp", ".dbf", ".shx", ".prj"]:
            return FileType.SHAPEFILE
        else:
            return FileType.UNKNOWN

    async def save_upload(self, filename: str, content: bytes) -> Tuple[str, str]:
        """Save uploaded file and return (file_id, file_path)."""
        file_id = str(uuid.uuid4())
        safe_filename = f"{file_id}_{Path(filename).name}"
        file_path = self.upload_dir / safe_filename

        with open(file_path, "wb") as f:
            f.write(content)

        return file_id, str(file_path)

    async def process_file(self, file_path: str, file_type: FileType) -> FileProcessingResult:
        """Process file based on type."""
        filename = Path(file_path).name
        file_id = filename.split("_")[0]

        result = FileProcessingResult(
            file_id=file_id,
            filename=filename,
            file_type=file_type,
            status=ProcessingStatus.PROCESSING,
        )

        try:
            if file_type == FileType.ZIP:
                extracted = await self._process_zip(file_path)
                result.records_processed = len(extracted)
                result.metadata["extracted_files"] = extracted
            elif file_type == FileType.PDF:
                chunks = await self._process_pdf(file_path)
                result.records_processed = len(chunks)
                result.metadata["chunks"] = chunks
                result.metadata["pages"] = len(set(c.get("page_number") for c in chunks))
            elif file_type == FileType.CSV:
                records = await self._process_csv(file_path)
                result.records_processed = len(records)
            elif file_type == FileType.XLSX:
                records = await self._process_excel(file_path)
                result.records_processed = len(records)
            elif file_type == FileType.SHAPEFILE:
                features = await self._process_shapefile(file_path)
                result.records_processed = len(features)
            else:
                raise ValueError(f"Unsupported file type: {file_type}")

            result.status = ProcessingStatus.COMPLETED

        except Exception as e:
            result.status = ProcessingStatus.FAILED
            result.errors.append(str(e))

        return result

    async def _process_zip(self, file_path: str) -> List[str]:
        """Extract and process files from ZIP archive."""
        extracted_files = []
        extract_dir = Path(file_path).parent / f"{Path(file_path).stem}_extracted"
        extract_dir.mkdir(exist_ok=True)

        with zipfile.ZipFile(file_path, "r") as zip_ref:
            zip_ref.extractall(extract_dir)

        # Process each extracted file
        for extracted_file in extract_dir.rglob("*"):
            if extracted_file.is_file():
                file_type = self.detect_file_type(extracted_file.name)
                if file_type != FileType.UNKNOWN:
                    # Recursively process extracted files
                    await self.process_file(str(extracted_file), file_type)
                    extracted_files.append(extracted_file.name)

        return extracted_files

    async def _process_pdf(self, file_path: str) -> List[Dict[str, Any]]:
        """Extract text chunks from PDF."""
        chunks = []

        try:
            with pdfplumber.open(file_path) as pdf:
                for page_num, page in enumerate(pdf.pages, start=1):
                    text = page.extract_text()
                    if text and text.strip():
                        # Split into chunks (simple implementation)
                        chunk_size = settings.chunk_size
                        for i in range(0, len(text), chunk_size):
                            chunk = text[i:i + chunk_size]
                            chunks.append({
                                "page_number": page_num,
                                "content": chunk,
                                "chunk_index": i // chunk_size,
                            })
        except Exception as e:
            # Fallback to PyPDF2 if pdfplumber fails
            with open(file_path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                for page_num, page in enumerate(reader.pages, start=1):
                    text = page.extract_text()
                    if text and text.strip():
                        chunks.append({
                            "page_number": page_num,
                            "content": text,
                            "chunk_index": 0,
                        })

        return chunks

    async def _process_csv(self, file_path: str) -> List[Dict[str, Any]]:
        """Process CSV file and return records."""
        records = []

        try:
            df = pd.read_csv(file_path)
            records = df.to_dict(orient="records")
        except Exception as e:
            # Fallback to standard CSV reader
            with open(file_path, "r", encoding="utf-8-sig") as f:
                reader = csv.DictReader(f)
                records = list(reader)

        return records

    async def _process_excel(self, file_path: str) -> List[Dict[str, Any]]:
        """Process Excel file and return records."""
        records = []

        df = pd.read_excel(file_path, sheet_name=0)  # Read first sheet
        records = df.to_dict(orient="records")

        return records

    async def _process_shapefile(self, file_path: str) -> List[Dict[str, Any]]:
        """Process shapefile and convert to GeoJSON features."""
        features = []

        # Shapefiles come in sets (.shp, .dbf, .shx, .prj)
        # GeoPandas handles this automatically
        gdf = gpd.read_file(file_path)

        # Convert to GeoJSON-like features
        for idx, row in gdf.iterrows():
            feature = {
                "type": "Feature",
                "properties": {k: v for k, v in row.items() if k != "geometry"},
                "geometry": mapping(row.geometry) if row.geometry else None,
            }
            features.append(feature)

        return features

    def cleanup_file(self, file_path: str):
        """Delete uploaded file after processing."""
        try:
            Path(file_path).unlink()
        except Exception:
            pass


# Global instance
file_processor = FileProcessor()
