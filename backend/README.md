# ScoutGPT Backend API

Lightweight real estate intelligence backend for Render free tier.

## Features

✅ **Enabled:**
- CSV/GeoJSON property data upload (ATTOM format)
- PDF text extraction (basic)
- Excel file processing (.xlsx)
- ZIP file handling (CSV, GeoJSON, PDF)
- ArcGIS county parcel/zoning queries
- ATTOM property database queries
- Claude AI chat for real estate analysis
- Map GeoJSON export

❌ **Disabled (Resource-Intensive):**
- Shapefiles (.shp) - Requires GDAL libraries
- RAG document search - Requires sentence-transformers (500MB+)
- PDF semantic search - Part of RAG system

## Local Development

1. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Set environment variables:
```bash
cp .env.example .env
# Edit .env with your keys
```

3. Initialize database:
```bash
python database.py
```

4. Run server:
```bash
uvicorn main:app --reload --port 8000
```

API will be available at http://localhost:8000

## API Endpoints

### Health Check
- `GET /` - Service status and feature list
- `GET /health` - Health check for Render

### Upload (`/api/upload`)
- `POST /upload/csv` - Upload ATTOM CSV data
- `POST /upload/geojson` - Upload GeoJSON property data
- `POST /upload/excel` - Upload Excel (.xlsx) files
- `POST /upload/pdf` - Upload PDF (text extraction only)
- `POST /upload/zip` - Upload ZIP (CSV/GeoJSON/PDF)

### Properties (`/api/properties`)
- `GET /properties/search` - Search properties with filters
- `GET /properties/stats` - Property database statistics
- `GET /properties/geojson` - Get properties as GeoJSON for map
- `GET /properties/{id}` - Get single property

### ArcGIS (`/api/arcgis`)
- `GET /arcgis/query` - Query ArcGIS Feature Services
- `GET /arcgis/parcels/search` - Search Travis County parcels
- `GET /arcgis/zoning/search` - Search zoning data
- `GET /arcgis/layers` - List available layers
- `POST /arcgis/custom` - Query custom ArcGIS endpoint

### Chat (`/api/chat`)
- `POST /chat/message` - Send message to Claude AI
- `GET /chat/history/{session_id}` - Get conversation history
- `DELETE /chat/history/{session_id}` - Clear chat history

## Environment Variables

Required:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `ANTHROPIC_API_KEY` - Claude AI API key

Optional:
- `ARCGIS_TOKEN` - For authenticated ArcGIS endpoints
- `PORT` - Server port (default: 8000)

## Deployment to Render

1. Push to GitHub
2. Create Web Service on Render
3. Connect to your repo
4. Select branch: `claude/lightweight-deployment-01Qfa81WjJvAnP2eUCogX3Gg`
5. Set build command: `cd backend && pip install -r requirements.txt`
6. Set start command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
7. Add environment variables:
   - `DATABASE_URL` (from Neon)
   - `ANTHROPIC_API_KEY`
8. Deploy!

## Database Schema

### Properties Table
- ATTOM property data with GeoJSON geometry
- Searchable by city, state, county, price, bedrooms, etc.

### Documents Table
- Uploaded PDFs with extracted text
- File metadata and upload history

### Chat Messages Table
- Claude AI conversation history
- Session-based tracking

## Notes

This is a **lightweight version** designed for Render's free tier:
- No GDAL dependencies (no shapefiles)
- No ML models (no RAG/embeddings)
- Minimal memory footprint
- PostgreSQL via Neon serverless

For full features (RAG, shapefiles), upgrade to Render paid tier or use Hugging Face Inference API.
