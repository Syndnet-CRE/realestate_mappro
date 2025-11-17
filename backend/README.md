# ScoutGPT Backend API

Real Estate AI Assistant with ArcGIS Integration, RAG, and Multi-Source Data

## Quick Start

### 1. Prerequisites

- Python 3.11+
- PostgreSQL 15+ with pgvector extension
- Redis 7+

### 2. Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your API keys and database credentials
```

### 3. Database Setup

```bash
# Create database
createdb scoutgpt

# Install pgvector extension
psql scoutgpt -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Run migrations
alembic upgrade head
```

### 4. Start Services

```bash
# Terminal 1: Start Redis
redis-server

# Terminal 2: Start API server
uvicorn app.main:app --reload --port 8000

# Terminal 3 (optional): Start Celery worker
celery -A app.tasks.celery_app worker --loglevel=info
```

### 5. Test API

Open http://localhost:8000/docs for interactive API documentation.

---

## Architecture

### API-First, Low-Cost Design

- **Zero Data Hosting** for external sources (ArcGIS, Census, FEMA)
- **Proxy Pattern** - API requests go through backend, responses are cached
- **User Data Only** - Store only user uploads, watchlists, deals
- **Redis Caching** - Aggressive caching for <10s response times

### Cost Breakdown

| Service | Cost/Month | Notes |
|---------|-----------|-------|
| Database (Supabase free tier) | $0 | Up to 500MB |
| Redis (Upstash free tier) | $0 | 10K requests/day |
| Backend Hosting (Render) | $7-20 | Starter plan |
| OpenAI Embeddings | $1-5 | text-embedding-3-small |
| Anthropic Claude | $10-50 | Haiku for simple, Sonnet for complex |
| **Total** | **$18-75** | For testing phase |

---

## API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
```

### ArcGIS Integration (Top Priority)
```
GET    /api/arcgis/parcel?lat={lat}&lon={lon}&county={county}
GET    /api/arcgis/zoning/{parcel_id}?county={county}
GET    /api/arcgis/flood-zone?lat={lat}&lon={lon}
POST   /api/arcgis/batch-query
GET    /api/arcgis/counties
```

### AI Chat with RAG
```
POST   /api/chat
GET    /api/chat/history
POST   /api/chat/rag-query
```

### File Uploads
```
POST   /api/upload/zip
POST   /api/upload/csv
POST   /api/upload/shapefile
GET    /api/upload/status/{task_id}
GET    /api/uploads
DELETE /api/uploads/{id}
```

### Properties
```
GET    /api/properties?filters=...
GET    /api/properties/{id}
POST   /api/properties/search  (AI-powered)
GET    /api/properties/{id}/analysis
POST   /api/properties/{id}/watchlist
```

### Deals
```
GET    /api/deals
POST   /api/deals
PUT    /api/deals/{id}
PUT    /api/deals/{id}/stage
DELETE /api/deals/{id}
POST   /api/deals/bulk-action
```

### Integrations
```
GET    /api/integrations
POST   /api/integrations
POST   /api/integrations/{id}/sync
GET    /api/integrations/{id}/logs
```

---

## Environment Variables

See `.env.example` for all configuration options.

### Required

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/scoutgpt

# AI APIs
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Security
SECRET_KEY=your-secret-key-here
```

### Optional

```env
# Data Sources
CENSUS_API_KEY=...  (Census API is free but requires key)
ARCGIS_DALLAS_URL=...  (Custom county endpoints)

# File Upload
MAX_UPLOAD_SIZE_MB=100
UPLOAD_DIR=/tmp/scoutgpt_uploads
```

---

## 20 Core AI Tasks

The AI chat system supports 4 modes:

### Scout Mode
1. Find properties matching Buy Box
2. Neighborhood analysis
3. Quick comp check
4. Owner research

### Zoning-GIS Mode
5. Zoning feasibility
6. Development capacity
7. Setback/FAR analysis
8. Use-by-right check

### Comps Mode
9. Price per unit/SF
10. Sales comps table
11. Cap rate analysis
12. Rent comps

### Site Analysis Mode
13. Multi-layer risk check
14. Traffic counts
15. Demographics
16. Utilities/infrastructure

### Cross-Mode
17. Deal memo generation
18. Underwriting assist
19. Due diligence checklist
20. Market trends

All tasks are designed to respond in **<10 seconds**.

---

## RAG System

### Data Sources for RAG

1. **User Uploads** - CSVs, PDFs, Excel files
2. **Cached API Data** - ArcGIS parcel queries, Census data
3. **User's Saved Data** - Watchlists, deals, analysis history
4. **Public Data** - Cached from free APIs

### Vector Embeddings

```python
# Example: Embedding user-uploaded CSV
from langchain.embeddings import OpenAIEmbeddings
from app.services.rag_service import rag_service

# Upload CSV
df = pd.read_csv("properties.csv")

# Generate embeddings
for _, row in df.iterrows():
    text = f"{row['address']}, {row['city']}, {row['state']} - {row['property_type']}, ${row['price']}, {row['sqft']} sqft"
    await rag_service.add_document(
        text=text,
        metadata={"source": "csv_upload", "property_id": row['id']},
        user_id="user-123"
    )
```

---

## File Upload Processing

### Supported Formats

- **ZIP** - Mixed data (CSVs, PDFs, Shapefiles)
- **CSV** - Property lists, sales comps
- **Excel (.xlsx)** - Financial models
- **PDF** - Appraisals, reports
- **Shapefiles** - GIS boundary data
- **Images** - Property photos

### Processing Pipeline

```
Upload → Extract → Parse → Validate → Store → Embed → Notify
```

### Background Jobs (Celery)

```python
# Example upload task
@celery_app.task
def process_zip_upload(zip_path: str, user_id: str):
    # Extract files
    # Parse each file type
    # Insert to database
    # Generate embeddings
    # Cleanup temp files
    pass
```

---

## ArcGIS County Configuration

Add new counties by editing `app/core/config.py`:

```python
COUNTY_ENDPOINTS = {
    "dallas": "https://gis.dallascounty.org/arcgis/rest/services/",
    "harris": "https://pdata.hcad.org/ArcGIS/rest/services/",
    "travis": "https://services.arcgis.com/0L95CJ0VTaxqcmED/",
    # Add more counties here
}
```

No code changes needed - just add the endpoint URL.

---

## Caching Strategy

| Data Type | TTL | Reasoning |
|-----------|-----|-----------|
| Parcel data | 24 hours | Parcels rarely change |
| Zoning data | 7 days | Zoning updates are infrequent |
| Flood zones | Indefinite | FEMA flood maps are static |
| Census data | 7 days | Demographics update annually |
| Property listings | 1 hour | Market data changes frequently |

---

## Performance Optimization

### <10 Second Response Requirement

1. **Redis Caching** - Cache all external API responses
2. **Connection Pooling** - Reuse database connections
3. **Async Operations** - FastAPI async endpoints
4. **Batch Processing** - Combine multiple queries
5. **CDN for Static Assets** - Frontend files
6. **Database Indexing** - Lat/lon, price, property_type

---

## Testing

```bash
# Run tests
pytest

# With coverage
pytest --cov=app tests/

# Specific test file
pytest tests/test_arcgis.py
```

---

## Deployment

### Render.com (Recommended for low-cost)

1. Connect GitHub repo
2. Create Web Service
3. Environment: Python 3.11
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables from `.env`

### Database: Supabase

1. Create project at supabase.com
2. Enable pgvector extension
3. Copy DATABASE_URL to .env

---

## MCP Server Integration (Optional)

For advanced users, integrate MCP servers to allow Claude direct API access:

```bash
# Install MCP SDK
npm install -g @anthropic/mcp-sdk

# Create MCP server for ArcGIS
mcp-server create arcgis-server

# Configure in Claude Desktop
# See: https://docs.anthropic.com/en/docs/build-with-claude/mcp
```

---

## Support

- **Documentation**: See `IMPLEMENTATION_PLAN.md`
- **Issues**: Create GitHub issue
- **API Docs**: http://localhost:8000/docs

---

## License

MIT License - See LICENSE file

---

**Built with FastAPI, PostgreSQL, pgvector, Redis, LangChain, and Anthropic Claude**
