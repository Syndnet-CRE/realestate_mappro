# Getting Started with ScoutGPT

Your comprehensive guide to building and deploying the ScoutGPT Real Estate AI platform.

---

## What Has Been Built

### ✅ Complete (90%+)

1. **Frontend** - Dark Felt-like UI with 6 feature pages:
   - Interactive Property Map Dashboard (Mapbox + chat)
   - Property Search & Discovery Engine
   - Market Intelligence Dashboard
   - Property Analysis Workbench
   - Deal Room Management Hub
   - System Configuration & Integration Hub

2. **Backend API Structure** - FastAPI with all route stubs:
   - Authentication routes
   - ArcGIS integration (Dallas, Harris, Travis counties)
   - AI Chat with RAG system
   - File upload (ZIP, CSV, Excel, PDF, Shapefiles)
   - Properties search and filtering
   - Deals management
   - Integrations management

3. **Database Schema** - PostgreSQL with pgvector:
   - Users, Properties, Uploads, Embeddings
   - Deals, Watchlists, Saved Searches
   - API Cache, Integrations

4. **Deployment Configuration**:
   - Docker + docker-compose
   - Alembic migrations
   - Environment configuration

### 🚧 To Be Implemented (Real Logic)

1. **Authentication** - JWT token generation, password hashing
2. **RAG System** - LangChain + pgvector integration
3. **File Processing** - CSV/PDF/Shapefile parsers with Celery
4. **Database Queries** - Replace mock data with real queries
5. **External API Integrations** - Connect to real ArcGIS/Census/FEMA endpoints
6. **LLM Integration** - Claude API with prompt engineering for 20 tasks

---

## Quick Start (5 Minutes)

### Option A: Docker (Easiest)

```bash
# 1. Navigate to backend
cd backend

# 2. Copy environment file
cp .env.example .env
# Edit .env with your API keys (ANTHROPIC_API_KEY, OPENAI_API_KEY)

# 3. Start all services
docker-compose up -d

# 4. Install pgvector extension
docker exec scoutgpt_postgres psql -U postgres -d scoutgpt -c "CREATE EXTENSION IF NOT EXISTS vector;"

# 5. Test API
curl http://localhost:8000/health
```

### Option B: Manual Setup

```bash
# 1. Run setup script
cd backend
chmod +x scripts/setup.sh
./scripts/setup.sh

# 2. Start API
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# 3. In another terminal, start frontend
cd ..
npm install
npm run dev

# 4. Open browser
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000/docs
```

---

## Architecture Overview

### Data Flow

```
User Query → Frontend → FastAPI Backend → External APIs (ArcGIS, Census)
                                        ↓
                                   Redis Cache (24hr-7day TTL)
                                        ↓
                                   PostgreSQL (user data only)
                                        ↓
                                   RAG System (pgvector)
                                        ↓
                                   Claude AI (response generation)
                                        ↓
                                   Frontend (< 10 seconds)
```

### Cost Optimization Strategy

**Minimize Data Hosting:**
- Store only user uploads, watchlists, deals
- Use API-first approach (pay per request vs. storage)
- Aggressive caching (Redis) for free API responses
- No MLS data storage - proxy requests only

**Estimated Costs (Testing Phase):**

| Service | Monthly Cost |
|---------|--------------|
| Backend Hosting (Render) | $7-20 |
| Database (Supabase free tier) | $0 |
| Redis (Upstash free tier) | $0 |
| OpenAI Embeddings | $1-5 |
| Anthropic Claude API | $10-50 |
| **Total** | **$18-75** |

**Production Scaling:**
- Add MLS API access: +$100-300/mo
- Upgrade database: +$25-50/mo
- Higher LLM usage: +$50-200/mo
- **Production Total: $193-625/mo**

---

## Top 3 Features Deep Dive

### 1. ArcGIS REST API Integration

**What it does:**
- Query parcel data by lat/lon
- Get zoning information
- Check flood zones (FEMA)
- Batch queries for multiple properties

**Endpoints:**
```bash
# Get parcel data
GET /api/arcgis/parcel?lat=32.7767&lon=-96.7970&county=dallas

# Get zoning
GET /api/arcgis/zoning/12345?county=dallas

# Check flood zone
GET /api/arcgis/flood-zone?lat=32.7767&lon=-96.7970

# Batch query
POST /api/arcgis/batch-query
{
  "queries": [
    {"lat": 32.7767, "lon": -96.7970, "county": "dallas"},
    {"lat": 29.7604, "lon": -95.3698, "county": "harris"}
  ]
}
```

**Implementation Status:**
- ✅ Route structure complete
- ✅ Caching layer implemented
- 🚧 Real ArcGIS endpoints need configuration per county
- 🚧 Error handling for API failures

**Next Steps:**
1. Get actual ArcGIS REST endpoint URLs for your target counties
2. Test with real coordinates
3. Implement retry logic for failed requests
4. Add response validation

---

### 2. RAG System with Vector Embeddings

**What it does:**
- Embed user-uploaded CSVs, PDFs, Excel files
- Store in pgvector for semantic search
- Retrieve relevant context for AI queries
- Answer questions like "What properties in my data are under $2M in Dallas?"

**Architecture:**

```
User Upload (CSV) → Parse → Generate Embeddings → Store in pgvector
                                                         ↓
User Query → Embed Query → Similarity Search → Retrieve Top K
                                                         ↓
                                            Build Context → Claude API → Response
```

**Implementation Status:**
- ✅ Database schema with vector column
- ✅ Chat endpoint with RAG flag
- 🚧 LangChain integration
- 🚧 Embedding generation service
- 🚧 Vector similarity search

**Code to Implement:**

```python
# app/services/rag_service.py
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import PGVector
from sqlalchemy import create_engine

class RAGService:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(
            model="text-embedding-3-small",  # Cost-efficient
            openai_api_key=settings.OPENAI_API_KEY
        )
        self.vectorstore = PGVector(
            connection_string=settings.DATABASE_URL,
            embedding_function=self.embeddings,
            collection_name="scoutgpt_embeddings"
        )

    async def add_document(self, text: str, metadata: dict, user_id: str):
        """Add document to vector store"""
        metadata["user_id"] = user_id
        await self.vectorstore.aadd_texts(
            texts=[text],
            metadatas=[metadata]
        )

    async def search(self, query: str, user_id: str, top_k: int = 5):
        """Search for relevant documents"""
        results = await self.vectorstore.asimilarity_search_with_score(
            query=query,
            k=top_k,
            filter={"user_id": user_id}
        )
        return results
```

**Next Steps:**
1. Install pgvector: `CREATE EXTENSION vector;`
2. Implement RAGService in `app/services/rag_service.py`
3. Update chat endpoint to use RAG retrieval
4. Test with sample CSV upload

---

### 3. ZIP File Upload with Mixed Data

**What it does:**
- Upload ZIP containing CSVs, PDFs, Shapefiles, images
- Auto-detect file types
- Parse and validate data
- Store in database + generate embeddings
- Process in background (Celery)

**Supported File Types:**

| Type | Parser | Use Case |
|------|--------|----------|
| CSV | pandas | Property lists, sales comps |
| Excel (.xlsx) | openpyxl | Financial models, underwriting |
| PDF | PyPDF2/pdfplumber | Appraisals, market reports |
| Shapefile | geopandas | Custom GIS boundaries |
| Images | PIL | Property photos, aerials |

**Upload Flow:**

```
User uploads ZIP → FastAPI endpoint → Save to temp
                                           ↓
                                  Celery background task
                                           ↓
                        Extract files → Parse by type → Validate
                                           ↓
                        Insert to DB → Generate embeddings → Cleanup
                                           ↓
                                  Notify user (WebSocket)
```

**Implementation Status:**
- ✅ Upload endpoint with file validation
- ✅ Background task structure
- 🚧 Celery worker configuration
- 🚧 File parsers for each type
- 🚧 Schema auto-detection for CSVs

**Code to Implement:**

```python
# app/tasks/file_processing.py
from celery import Celery
import pandas as pd
import zipfile
from PyPDF2 import PdfReader
import geopandas as gpd

celery_app = Celery('scoutgpt', broker=settings.REDIS_URL)

@celery_app.task
def process_zip_upload(zip_path: str, user_id: str):
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        extract_dir = f"/tmp/extract_{user_id}"
        zip_ref.extractall(extract_dir)

    for root, dirs, files in os.walk(extract_dir):
        for file in files:
            file_path = os.path.join(root, file)

            if file.endswith('.csv'):
                df = pd.read_csv(file_path)
                # Insert to database
                # Generate embeddings

            elif file.endswith('.pdf'):
                reader = PdfReader(file_path)
                text = ""
                for page in reader.pages:
                    text += page.extract_text()
                # Store text + generate embeddings

            elif file.endswith('.shp'):
                gdf = gpd.read_file(file_path)
                geojson = gdf.to_json()
                # Store as custom map layer

    # Cleanup
    shutil.rmtree(extract_dir)
    os.remove(zip_path)

    return {"status": "completed", "user_id": user_id}
```

**Next Steps:**
1. Start Celery worker: `celery -A app.tasks.celery_app worker`
2. Implement file parsers in `app/tasks/file_processing.py`
3. Test with sample ZIP file
4. Add WebSocket notifications for upload progress

---

## 20 AI Tasks Implementation Guide

Each task has a specific prompt template and data retrieval strategy.

### Example: Task 1 - Find Properties Matching Buy Box

**User Query:** "Show me 4-10 unit multifamily under $2M in Dallas"

**Backend Processing:**

```python
# app/services/ai_tasks/scout_mode.py
async def find_properties_buy_box(query: str, user_id: str):
    # 1. Parse query with LLM to extract filters
    prompt = f"""
    Extract real estate search filters from this query:
    "{query}"

    Return JSON with:
    - property_type
    - unit_range (min, max)
    - price_range (min, max)
    - location (city, state)
    """

    response = await claude_api.complete(prompt)
    filters = json.loads(response)

    # 2. Query database + RAG
    properties = await db.query(Property).filter(
        Property.property_type == filters['property_type'],
        Property.price <= filters['price_range']['max'],
        Property.city == filters['location']['city']
    ).all()

    # 3. Generate response with context
    context = "\n".join([f"{p.address} - ${p.price}" for p in properties])

    final_prompt = f"""
    User asked: {query}
    Found properties:
    {context}

    Provide a concise summary with top 5 recommendations.
    """

    return await claude_api.complete(final_prompt)
```

**Repeat this pattern for all 20 tasks.**

---

## Database Migrations

### Create First Migration

```bash
# Initialize Alembic
cd backend
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Initial schema"

# Apply migration
alembic upgrade head
```

### Add pgvector Extension

```sql
-- Run in PostgreSQL
CREATE EXTENSION IF NOT EXISTS vector;

-- Add vector column to embeddings table
ALTER TABLE embeddings ADD COLUMN embedding vector(1536);

-- Create index for similarity search
CREATE INDEX ON embeddings USING ivfflat (embedding vector_cosine_ops);
```

---

## Testing

### Manual Testing (Postman/curl)

```bash
# Health check
curl http://localhost:8000/health

# ArcGIS parcel query
curl "http://localhost:8000/api/arcgis/parcel?lat=32.7767&lon=-96.7970&county=dallas"

# Chat query
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me properties under $2M in Dallas", "mode": "scout"}'

# Upload CSV
curl -X POST http://localhost:8000/api/upload/csv \
  -F "file=@properties.csv"
```

### Automated Testing

```bash
# Run all tests
pytest

# With coverage
pytest --cov=app tests/

# Specific test
pytest tests/test_arcgis.py -v
```

---

## Deployment

### Option 1: Render.com (Recommended for testing)

1. Create account at render.com
2. Connect GitHub repo
3. Create new Web Service:
   - **Environment:** Python 3.11
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables:** Copy from .env

4. Create PostgreSQL database:
   - Enable pgvector extension
   - Copy DATABASE_URL to environment

5. Create Redis instance:
   - Copy REDIS_URL to environment

**Cost:** $7/month for starter web service + $0 for free tier database

### Option 2: Railway.app

Similar to Render, with one-click deployments.

### Option 3: AWS/GCP/Azure (Production)

For production deployments with auto-scaling.

---

## API Keys Required

| Service | Required? | Cost | Where to Get |
|---------|-----------|------|--------------|
| Anthropic Claude | ✅ Yes | $15/1M tokens | console.anthropic.com |
| OpenAI (embeddings) | ✅ Yes | $0.02/1M tokens | platform.openai.com |
| Census API | Optional | Free | api.census.gov |
| Mapbox | Frontend only | Free tier | mapbox.com |

**Minimum to get started:**
- Anthropic API key (for chat)
- OpenAI API key (for embeddings)

---

## FAQ

### Q: Do I need to store MLS data?
**A:** No! Use an API-first approach. Query MLS APIs on-demand and cache responses in Redis. This saves storage costs and keeps data fresh.

### Q: How do I add more counties for ArcGIS?
**A:** Edit `backend/app/core/config.py` and add the county's ArcGIS REST endpoint URL to `COUNTY_ENDPOINTS` dict. No code changes needed.

### Q: Can I use this without user uploads?
**A:** Yes! The system works with just API data. User uploads are optional for adding private data.

### Q: What if I don't have a Census API key?
**A:** The Census API is free but requires registration. You can skip it initially and add later.

### Q: How do I implement custom AI tasks?
**A:** Add prompt templates in `app/services/ai_tasks/` and update the chat endpoint to route to your new task based on `mode` parameter.

---

## Next Steps

### Week 1: Core Foundation
- [ ] Get API keys (Anthropic, OpenAI)
- [ ] Set up local database (Docker or manual)
- [ ] Test basic API endpoints
- [ ] Connect frontend to backend

### Week 2: Top 3 Features
- [ ] Configure ArcGIS endpoints for target counties
- [ ] Implement RAG system with sample data
- [ ] Build ZIP upload processing

### Week 3: AI Tasks
- [ ] Implement Scout Mode tasks (1-4)
- [ ] Implement Zoning-GIS Mode tasks (5-8)
- [ ] Test <10 second response times

### Week 4: Polish & Deploy
- [ ] Add authentication
- [ ] Deploy to Render/Railway
- [ ] User testing
- [ ] Documentation

---

## Support Resources

- **Implementation Plan:** `IMPLEMENTATION_PLAN.md`
- **Backend README:** `backend/README.md`
- **API Documentation:** http://localhost:8000/docs (when running)
- **FastAPI Docs:** https://fastapi.tiangolo.com
- **LangChain Docs:** https://python.langchain.com
- **pgvector Docs:** https://github.com/pgvector/pgvector

---

## Questions?

Create an issue in the GitHub repo or refer to the comprehensive documentation in `IMPLEMENTATION_PLAN.md`.

---

**Ready to build the future of real estate AI? Let's go!** 🚀
