# ScoutGPT Real Estate RAG Platform - Backend

FastAPI backend for AI-powered real estate analysis with document search and GIS integration.

## Features

### 1. **ZIP File Upload with Multi-Format Extraction**
- Upload ZIP files containing mixed data (CSV, PDF, Shapefiles)
- Auto-detects and extracts file types
- Processes each format separately

### 2. **RAG System for PDFs**
- Upload market reports, appraisals, due diligence documents
- Automatic text extraction and chunking
- Semantic search with OpenAI embeddings
- Claude cites sources from your documents

### 3. **ArcGIS REST API Integration**
- Query county parcel and zoning APIs
- Spatial filtering and attribute queries
- GeoJSON conversion for map visualization
- Cached results to minimize API costs

### 4. **Claude AI Real Estate Analyst**
- Specialized system prompt for CRE analysis
- Tool calling for document search and ArcGIS queries
- Fast, actionable responses (not essays)
- Handles 20+ real estate use cases

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Database (Neon.tech or local PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/realestate_mappro

# Claude API
ANTHROPIC_API_KEY=sk-ant-xxx

# OpenAI (for embeddings)
OPENAI_API_KEY=sk-xxx

# ArcGIS REST API URLs (optional - examples)
ARCGIS_PARCEL_API=https://services.arcgis.com/.../Parcels/FeatureServer/0
ARCGIS_ZONING_API=https://services.arcgis.com/.../Zoning/FeatureServer/0
```

### 3. Initialize Database

```bash
python -m models.database
```

This creates all required tables:
- `documents` - Uploaded file metadata
- `document_chunks` - Text chunks for RAG
- `properties` - Property data from CSV/API imports
- `datasets` - Dataset metadata
- `conversations` - Chat history

### 4. Run Server

```bash
python main.py
```

Or with uvicorn:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server runs at: **http://localhost:8000**

API docs at: **http://localhost:8000/docs**

## API Endpoints

### Chat with Claude
```bash
POST /chat
{
  "message": "What's the cap rate for multifamily in Austin?",
  "conversation_id": "optional-uuid"
}
```

### Upload Files
```bash
POST /upload
Content-Type: multipart/form-data
file: <your-file.zip>
```

Supports:
- `.zip` - Auto-extracts and processes contents
- `.pdf` - Indexed for RAG search
- `.csv` - Parsed and stored
- `.xlsx` - Parsed and stored
- `.shp` (Shapefiles) - Converted to GeoJSON

### Search Documents
```bash
POST /documents/search
{
  "query": "Austin multifamily cap rates",
  "max_results": 5
}
```

### Query ArcGIS
```bash
POST /arcgis/query
{
  "layer": "parcels",
  "where": "CITY = 'Austin' AND ACRES > 5",
  "return_geometry": true,
  "max_records": 10
}
```

### List Datasets
```bash
GET /datasets
```

### Get Map Layers
```bash
GET /layers
```

### Get Layer Features
```bash
POST /layers/{layer_id}/features
{
  "bbox": [-98.5, 30.2, -97.5, 30.5],
  "filters": {"CITY": "Austin"},
  "limit": 1000
}
```

## Architecture

```
┌─────────────────────────────────────────────┐
│ FastAPI Backend (localhost:8000)            │
│                                             │
│ Routes:                                     │
│ - /chat       → Claude with tool calling   │
│ - /upload     → Multi-format file processing│
│ - /datasets   → Dataset management         │
│ - /layers     → Map layers & GeoJSON       │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│ Services:                                   │
│ - ClaudeService   → AI chat with tools     │
│ - RAGService      → Document search        │
│ - ArcGISClient    → REST API queries       │
│ - FileProcessor   → ZIP/PDF/CSV/Shapefile  │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│ PostgreSQL Database                         │
│ - documents, document_chunks (RAG)          │
│ - properties, datasets                      │
│ - conversations (chat history)              │
└─────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│ External APIs:                              │
│ - ArcGIS REST (parcels, zoning)            │
│ - Claude API (Anthropic)                    │
│ - OpenAI (embeddings)                       │
└─────────────────────────────────────────────┘
```

## Claude Tools

Claude has access to these tools:

### 1. `search_documents`
Search uploaded PDFs and documents using semantic search.

**Example:**
```json
{
  "query": "Austin multifamily cap rates Q4 2024",
  "max_results": 5
}
```

### 2. `query_arcgis`
Query ArcGIS REST APIs for parcel/zoning data.

**Example:**
```json
{
  "layer": "parcels",
  "where": "ADDRESS LIKE '%Main St%' AND CITY = 'Austin'",
  "return_geometry": true,
  "max_records": 10
}
```

## Database Schema

### `documents`
Stores uploaded files and processing status.

### `document_chunks`
Text chunks from PDFs with embeddings for semantic search.

### `properties`
Property records from CSV uploads or API imports.

### `datasets`
Metadata about uploaded datasets.

### `conversations`
Chat conversation history with Claude.

## Production Deployment

### Use Neon.tech (Free PostgreSQL)

1. Create a Neon database at https://neon.tech
2. Update `DATABASE_URL` in `.env`
3. Run `python -m models.database` to initialize

### Deploy to Railway/Render/Fly.io

```bash
# Build command
pip install -r requirements.txt

# Start command
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Environment Variables
Set all `.env` variables in your deployment platform.

## Cost Optimization

### ArcGIS Queries
- Results are not cached by default (queries on-demand)
- To cache: Store results in `properties` table after first query
- Set reasonable `max_records` limits (default: 100)

### Claude API
- Uses Claude 3.5 Sonnet (cost-effective)
- Streaming not implemented yet (can be added)
- Tool calls are lazy (only executed when needed)

### OpenAI Embeddings
- Uses `text-embedding-3-small` (cheapest)
- Only runs on PDF uploads (not on every query)
- Consider switching to local embeddings (e.g., sentence-transformers) for free

### Database
- Neon free tier: 0.5GB storage, 3GB data transfer/month
- Sufficient for testing and small datasets
- Upgrade to paid tier as needed

## Next Steps

1. **Add Authentication** - User management and API keys
2. **Implement Streaming** - Stream Claude responses for better UX
3. **Add More Data Sources** - Census API, FEMA flood zones, etc.
4. **Caching Layer** - Redis for frequent ArcGIS queries
5. **Background Jobs** - Celery for async file processing
6. **Vector Database** - Pinecone/Weaviate for better RAG performance

## Troubleshooting

### Database Connection Errors
```bash
# Check PostgreSQL is running
psql -U postgres

# Test connection
python -c "from models.database import engine; print(engine.connect())"
```

### ArcGIS API Errors
- Verify API URLs in `.env`
- Check API is publicly accessible (no auth required)
- Test URL directly: `https://your-api.com/FeatureServer/0/query?where=1=1&f=json`

### Claude Tool Errors
- Ensure `ANTHROPIC_API_KEY` is set
- Check Claude model supports tool calling (Sonnet 3.5+)
- Verify tool input schemas match expectations

### File Upload Errors
- Check `UPLOAD_DIR` exists and has write permissions
- Verify `MAX_UPLOAD_SIZE_MB` limit
- For shapefiles: Upload `.shp`, `.dbf`, `.shx`, `.prj` together in a ZIP

## Support

Questions? Open an issue or check the docs:
- FastAPI: https://fastapi.tiangolo.com
- Claude API: https://docs.anthropic.com
- ArcGIS REST: https://developers.arcgis.com/rest/

---

**Built with ❤️ for the CRE community**
