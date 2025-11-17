# ScoutGPT Backend Setup Guide

Complete guide to setting up and running the ScoutGPT Real Estate RAG Platform backend.

## What You Just Built

A complete FastAPI backend with:

### ✅ Phase 1: ZIP File Upload with Multi-Format Extraction
- Upload ZIP files containing mixed data (CSV, PDF, Shapefiles)
- Auto-detect and extract file types
- Process each format separately
- **Location:** `backend/services/file_processor.py`

### ✅ Phase 2: RAG System for PDFs
- Upload market reports, appraisals, due diligence documents
- Automatic text extraction and chunking (1000 char chunks with 200 char overlap)
- Semantic search with OpenAI embeddings
- Claude cites sources from your documents
- **Location:** `backend/services/rag_service.py`

### ✅ Phase 3: ArcGIS REST API Integration
- Query county parcel and zoning APIs
- Spatial filtering and attribute queries
- GeoJSON conversion for map visualization
- **Location:** `backend/services/arcgis_client.py`

### ✅ Phase 4: Specialized Claude Real Estate Analyst
- Expert system prompt for CRE analysis
- Tool calling: `search_documents`, `query_arcgis`
- Fast, actionable responses (not essays)
- Handles 20+ real estate use cases
- **Location:** `backend/config/prompts.py`, `backend/services/claude_service.py`

---

## Quick Start (5 Minutes)

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

Or use a virtual environment (recommended):
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Required: Database
DATABASE_URL=postgresql://username:password@localhost:5432/realestate_mappro

# Required: Claude API
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Required for RAG: OpenAI (for embeddings)
OPENAI_API_KEY=sk-your-key-here

# Optional: ArcGIS REST APIs (add your county's API URLs)
ARCGIS_PARCEL_API=https://services.arcgis.com/.../Parcels/FeatureServer/0
ARCGIS_ZONING_API=https://services.arcgis.com/.../Zoning/FeatureServer/0
```

### 4. Set Up Database

**Option A: Use Neon.tech (Free, Recommended)**
1. Go to https://neon.tech and create a free account
2. Create a new project called "realestate_mappro"
3. Copy the connection string (looks like: `postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/realestate_mappro`)
4. Paste it into `.env` as `DATABASE_URL`
5. Initialize tables:
   ```bash
   python -m models.database
   ```

**Option B: Use Local PostgreSQL**
1. Install PostgreSQL on your machine
2. Create database:
   ```bash
   psql -U postgres
   CREATE DATABASE realestate_mappro;
   \q
   ```
3. Update `.env`:
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/realestate_mappro
   ```
4. Initialize tables:
   ```bash
   python -m models.database
   ```

### 5. Start the Server
```bash
python main.py
```

Or use uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Or use the startup script (Linux/Mac):
```bash
chmod +x start.sh
./start.sh
```

### 6. Verify It's Working

Open your browser:
- **API Root:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs (interactive Swagger UI)
- **Health Check:** http://localhost:8000/health

You should see:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "database": "connected",
  "claude": "configured"
}
```

---

## Testing the Features

### Test 1: Chat with Claude (No Documents Yet)

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What can you help me with?"}'
```

Response:
```json
{
  "reply": "I'm ScoutGPT, an elite commercial real estate analyst...",
  "conversation_id": "abc-123-xyz",
  "sources": [],
  "metadata": {...}
}
```

### Test 2: Upload a PDF

```bash
curl -X POST http://localhost:8000/upload \
  -F "file=@/path/to/your/market-report.pdf"
```

Response:
```json
{
  "file_id": "abc-123-xyz",
  "filename": "market-report.pdf",
  "file_type": "pdf",
  "status": "completed",
  "message": "File processed successfully. 47 records processed."
}
```

### Test 3: Search the Uploaded PDF

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the cap rates for multifamily properties in Austin?"
  }'
```

Claude will:
1. Use the `search_documents` tool to search your PDF
2. Find relevant chunks mentioning "cap rates" and "multifamily"
3. Respond with citations: "According to *market-report.pdf* (page 12)..."

### Test 4: Query ArcGIS (If Configured)

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What parcels are available on Main Street in Austin?"
  }'
```

Claude will:
1. Use the `query_arcgis` tool
2. Query the parcels layer with `WHERE ADDRESS LIKE '%Main%' AND CITY = 'Austin'`
3. Return parcel data and GeoJSON for mapping

### Test 5: Upload a ZIP with Mixed Files

Create a test ZIP:
```bash
zip test-data.zip properties.csv market-report.pdf parcels.shp parcels.dbf parcels.shx
```

Upload it:
```bash
curl -X POST http://localhost:8000/upload \
  -F "file=@test-data.zip"
```

The backend will:
1. Extract all files from ZIP
2. Process CSV → store in `properties` table
3. Process PDF → index for RAG
4. Process Shapefile → convert to GeoJSON

---

## API Endpoints Reference

### Chat
```
POST /chat
Body: {"message": "Your question", "conversation_id": "optional-uuid"}
```

### Upload File
```
POST /upload
Content-Type: multipart/form-data
Body: file=<your-file>
```

Supported formats:
- `.zip` - Auto-extracts and processes contents
- `.pdf` - Indexed for RAG search
- `.csv` - Parsed and stored in database
- `.xlsx` - Parsed and stored in database
- `.shp` (with .dbf, .shx, .prj) - Converted to GeoJSON

### List Datasets
```
GET /datasets
```

### Get Map Layers
```
GET /layers
```

### Get Layer Features
```
POST /layers/{layer_id}/features
Body: {
  "bbox": [-98.5, 30.2, -97.5, 30.5],
  "filters": {"CITY": "Austin"},
  "limit": 1000
}
```

### Get Conversation History
```
GET /chat/history/{conversation_id}
```

---

## Connecting the Frontend

Update your frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

The frontend (`src/components/ChatPanel.jsx`) already expects:
- `POST /chat` ✅ Implemented
- `GET /datasets` ✅ Implemented
- `GET /layers` ✅ Implemented
- `GET /layers/{id}/features` ✅ Implemented

All endpoints are ready to go!

---

## Database Schema

After running `python -m models.database`, you'll have these tables:

### `documents`
Stores uploaded files and processing status.
```sql
id, filename, file_type, file_path, size_bytes, status, uploaded_at, processed_at, metadata
```

### `document_chunks`
Text chunks from PDFs with embeddings for RAG.
```sql
id, document_id, document_name, content, page_number, chunk_index, embedding, metadata, created_at
```

### `properties`
Property records from CSV uploads or API imports.
```sql
id, address, city, state, zip_code, latitude, longitude, price, sqft, beds, baths,
property_type, year_built, lot_size, zoning, parcel_id, metadata, source, created_at, updated_at
```

### `datasets`
Metadata about uploaded datasets.
```sql
id, name, file_type, status, record_count, file_path, created_at, updated_at, metadata
```

### `conversations`
Chat conversation history with Claude.
```sql
id, user_message, assistant_response, conversation_id, sources, metadata, created_at
```

---

## Claude Tools

Claude has access to these tools (configured in `services/claude_service.py`):

### 1. `search_documents`
Search uploaded PDFs using semantic search.

**Input:**
```json
{
  "query": "Austin multifamily cap rates Q4 2024",
  "max_results": 5
}
```

**Output:**
```json
{
  "success": true,
  "results": [
    {
      "document_name": "JLL-Austin-Market-Report.pdf",
      "content": "Multifamily cap rates in Austin averaged 5.4%...",
      "page_number": 12,
      "relevance_score": 0.89
    }
  ]
}
```

### 2. `query_arcgis`
Query ArcGIS REST APIs for parcel/zoning data.

**Input:**
```json
{
  "layer": "parcels",
  "where": "ADDRESS LIKE '%Main St%' AND CITY = 'Austin'",
  "return_geometry": true,
  "max_records": 10
}
```

**Output:**
```json
{
  "success": true,
  "total_count": 3,
  "features": [...],
  "geojson": {...}
}
```

---

## Architecture

```
Frontend (React + Vite)
    ↓
    POST /chat
    ↓
FastAPI Backend (main.py)
    ↓
ClaudeService (claude_service.py)
    ↓
    ├─→ search_documents → RAGService → PostgreSQL (document_chunks)
    ├─→ query_arcgis → ArcGISClient → County APIs
    └─→ Response with citations
```

---

## Troubleshooting

### "Connection to database failed"
- **Check:** PostgreSQL is running
- **Check:** `DATABASE_URL` in `.env` is correct
- **Fix:** Test connection: `python -c "from models.database import engine; print(engine.connect())"`

### "Claude API error: authentication failed"
- **Check:** `ANTHROPIC_API_KEY` in `.env` is valid
- **Fix:** Get key from https://console.anthropic.com

### "OpenAI embedding error"
- **Check:** `OPENAI_API_KEY` in `.env` is valid
- **Alternative:** Comment out embedding code to skip RAG temporarily

### "ArcGIS query failed"
- **Check:** `ARCGIS_PARCEL_API` URL is publicly accessible
- **Test:** Visit `https://your-api.com/FeatureServer/0/query?where=1=1&f=json` in browser
- **Note:** ArcGIS queries are optional - Claude will work without them

### "File upload failed: No such file or directory"
- **Fix:** Create uploads directory: `mkdir -p backend/uploads`

### "Module not found: anthropic"
- **Fix:** Install dependencies: `pip install -r requirements.txt`

---

## Next Steps

### Immediate (5 minutes each)
- [ ] Upload a test PDF and ask Claude about it
- [ ] Configure ArcGIS API URLs for your county
- [ ] Test the frontend connection

### Short-term (1-2 hours)
- [ ] Upload your real ATTOM CSV data
- [ ] Upload market reports and appraisals
- [ ] Test all 20 use cases from your requirements

### Medium-term (1-2 days)
- [ ] Deploy to Railway/Render/Fly.io
- [ ] Add authentication (API keys or OAuth)
- [ ] Implement caching for ArcGIS queries
- [ ] Add streaming responses for better UX

### Long-term (1-2 weeks)
- [ ] Switch to dedicated vector database (Pinecone/Weaviate)
- [ ] Add background job processing (Celery)
- [ ] Integrate additional APIs (Census, FEMA, etc.)
- [ ] Build custom analysis tools for Claude

---

## Cost Estimates

### Claude API
- **Model:** Claude 3.5 Sonnet
- **Cost:** ~$3 per 1M input tokens, ~$15 per 1M output tokens
- **Typical chat:** ~5,000 tokens = $0.02-0.10
- **With RAG context:** ~10,000 tokens = $0.05-0.20

### OpenAI Embeddings
- **Model:** text-embedding-3-small
- **Cost:** $0.02 per 1M tokens
- **Typical PDF (100 pages):** ~50,000 tokens = $0.001

### ArcGIS Queries
- **Most county APIs:** Free (public data)
- **Commercial ArcGIS services:** Check pricing
- **Optimization:** Cache results in database

### Database (Neon.tech Free Tier)
- **Storage:** 0.5 GB (sufficient for testing)
- **Compute:** 191.9 hours/month
- **Data transfer:** 3 GB/month

**Total for testing:** < $5/month

---

## Support

Questions or issues?
- **FastAPI Docs:** https://fastapi.tiangolo.com
- **Claude API:** https://docs.anthropic.com
- **ArcGIS REST:** https://developers.arcgis.com/rest/

---

**You're all set! 🎉**

Start the server and ask Claude your first real estate question!

```bash
python main.py
```

Then open http://localhost:8000/docs and try the `/chat` endpoint.
