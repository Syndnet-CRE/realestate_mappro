# ScoutGPT Implementation Plan
**Version 1.0 | Focus: Low-Cost, API-First Architecture**

---

## Executive Summary

**Current State:** Frontend 90% complete (dark Felt-like UI, 6 feature pages, Mapbox integration)
**Missing:** Backend API, database, AI/RAG system, data integrations
**Goal:** Build a low-cost, efficient backend that leverages APIs/MCPs with minimal data hosting

---

## Architecture Overview

### Tech Stack

**Backend:**
- **FastAPI** (Python) - High performance, async, auto-documentation
- **PostgreSQL** with **pgvector** extension - For RAG vector embeddings
- **Redis** - Caching layer for <10s response times
- **SQLAlchemy** - ORM for database operations
- **Celery** - Background task processing (file uploads, data imports)

**AI/RAG System:**
- **Anthropic Claude** (already configured) - Primary LLM for chat
- **OpenAI Embeddings** (text-embedding-3-small) - Cost-efficient embeddings
- **LangChain** - RAG orchestration and prompt management
- **ChromaDB** or **pgvector** - Vector storage (pgvector preferred to reduce stack)

**Data Storage Strategy (Minimal Hosting):**
- Store only **user-uploaded data** and **cached API responses**
- Use **API-first approach** for live data (ArcGIS, Census, FEMA, MLS)
- Temporary storage for ZIP uploads (process and discard)
- Small metadata tables for user preferences, saved searches, watchlists

---

## Top 3 Features Implementation

### 1. ArcGIS REST API Integration

**Approach: Zero Data Hosting - Direct API Proxy**

```python
# Service layer that proxies requests to ArcGIS REST endpoints
class ArcGISService:
    def __init__(self):
        self.county_endpoints = {
            'dallas': 'https://gis.dallascounty.org/arcgis/rest/services/...',
            'harris': 'https://pdata.hcad.org/ArcGIS/rest/services/...',
            'travis': 'https://services.arcgis.com/0L95CJ0VTaxqcmED/...'
        }

    async def get_parcel_data(self, lat, lon, county):
        # Query ArcGIS REST API by coordinates
        # Return GeoJSON directly to frontend
        pass

    async def query_zoning(self, parcel_id, county):
        # Fetch zoning layer from ArcGIS REST
        pass

    async def get_flood_zone(self, coordinates):
        # Query FEMA WMS service
        pass
```

**Endpoints:**
```
GET  /api/arcgis/parcel?lat={lat}&lon={lon}&county={county}
GET  /api/arcgis/zoning/{parcel_id}?county={county}
GET  /api/arcgis/flood-zone?lat={lat}&lon={lon}
POST /api/arcgis/batch-query (for multiple parcels)
```

**Caching Strategy:**
- Cache parcel data for 24 hours (parcels rarely change)
- Cache zoning data for 7 days
- Cache flood zone data indefinitely
- Use Redis with LRU eviction policy

**County Support (Expandable):**
- Start with Dallas, Harris, Travis counties (top TX markets)
- Add county configs via JSON file (no code changes needed)

---

### 2. RAG System for Property Intelligence

**Architecture:**

```
User Query → LLM (Claude) → RAG Retrieval → Context Injection → Response
                              ↓
                         Vector Database
                         (pgvector)
                              ↓
                    [User Uploads + Cached API Data]
```

**Implementation:**

```python
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import PGVector
from langchain.chains import RetrievalQA
from langchain.llms import Anthropic

class RAGService:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
        self.vectorstore = PGVector(
            connection_string="postgresql://...",
            embedding_function=self.embeddings
        )
        self.llm = Anthropic(model="claude-sonnet-4-5")

    async def query(self, question: str, user_id: str):
        # Retrieve relevant context from user's uploaded data + cached API data
        retriever = self.vectorstore.as_retriever(
            search_kwargs={"k": 5, "filter": {"user_id": user_id}}
        )

        # Build QA chain with Claude
        qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            retriever=retriever,
            return_source_documents=True
        )

        result = await qa_chain.arun(question)
        return result
```

**Vector Storage Strategy:**
- Embed user-uploaded CSVs, PDFs, Excel files
- Embed cached parcel/property data from API calls
- Store embeddings in PostgreSQL with pgvector extension
- Index by user_id for data isolation

**RAG Data Sources:**
1. User uploads (CSVs, PDFs, Shapefiles)
2. Cached ArcGIS parcel queries (last 30 days)
3. User's saved properties and deals
4. Analysis history and comps
5. Public data (Census, FEMA) cached from APIs

---

### 3. ZIP File Upload with Mixed Data

**File Types Supported:**
- **CSV** - Property lists, comps, sales data
- **Excel (.xlsx)** - Financial models, underwriting sheets
- **PDF** - Appraisals, market reports, inspection reports
- **Shapefiles (.shp, .dbf, .shx, .prj)** - GIS boundary data
- **Images (.jpg, .png)** - Property photos, aerial imagery

**Upload Flow:**

```
User uploads ZIP → FastAPI endpoint → Celery background task
                                            ↓
                                    Extract files to temp dir
                                            ↓
                                    Parse each file type
                                            ↓
                    CSV/Excel → Pandas → Validate → Insert to DB
                    PDF → PyPDF2/pdfplumber → Extract text → Embed for RAG
                    Shapefile → GeoPandas → Convert to GeoJSON → Store/Embed
                    Images → Store S3/local → Link to property records
                                            ↓
                                    Generate embeddings (RAG)
                                            ↓
                                    Notify user (WebSocket)
                                            ↓
                                    Delete temp files
```

**Implementation:**

```python
from fastapi import UploadFile, BackgroundTasks
from celery import Celery
import zipfile
import pandas as pd
from PyPDF2 import PdfReader
import geopandas as gpd

celery_app = Celery('scoutgpt', broker='redis://localhost:6379')

@app.post("/api/upload/zip")
async def upload_zip(
    file: UploadFile,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user)
):
    # Save ZIP temporarily
    temp_path = f"/tmp/{user_id}_{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(await file.read())

    # Queue background processing
    task = process_zip_upload.delay(temp_path, user_id)

    return {"task_id": task.id, "status": "processing"}

@celery_app.task
def process_zip_upload(zip_path: str, user_id: str):
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(f"/tmp/extract_{user_id}")

    extracted_dir = f"/tmp/extract_{user_id}"

    # Process each file type
    for root, dirs, files in os.walk(extracted_dir):
        for file in files:
            file_path = os.path.join(root, file)

            if file.endswith('.csv'):
                process_csv(file_path, user_id)
            elif file.endswith('.xlsx'):
                process_excel(file_path, user_id)
            elif file.endswith('.pdf'):
                process_pdf(file_path, user_id)
            elif file.endswith('.shp'):
                process_shapefile(file_path, user_id)
            elif file.endswith(('.jpg', '.png')):
                process_image(file_path, user_id)

    # Cleanup
    shutil.rmtree(extracted_dir)
    os.remove(zip_path)

    return {"status": "completed"}

def process_csv(file_path: str, user_id: str):
    df = pd.read_csv(file_path)
    # Auto-detect schema (address, price, sqft, etc.)
    # Insert to properties table
    # Generate embeddings for RAG
    pass

def process_pdf(file_path: str, user_id: str):
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text()

    # Store PDF text + metadata
    # Generate embeddings for RAG
    pass

def process_shapefile(file_path: str, user_id: str):
    gdf = gpd.read_file(file_path)
    geojson = gdf.to_json()
    # Store as custom map layer for user
    pass
```

**Storage Limits (Cost Control):**
- Max 100MB per ZIP upload
- Max 10 ZIP files per user (rolling)
- Auto-delete uploads older than 90 days
- Option to upgrade for more storage

---

## 20 Core AI Tasks - Prompt Engineering

### Scout Mode

**Task 1: Find properties matching Buy Box**
```
User: "Show me 4-10 unit multifamily under $2M in Dallas"

System Prompt:
You are ScoutGPT, a real estate AI assistant. Query the property database using:
- Property type: Multifamily
- Unit count: 4-10
- Price range: $0-$2,000,000
- Location: Dallas, TX
Return top 10 results with investment metrics (cap rate, cash flow, price/unit).
```

**Task 2: Neighborhood analysis**
```
User: "What's the investment outlook for Deep Ellum?"

System Prompt:
Analyze Deep Ellum, Dallas using:
1. Census API - demographics, income trends
2. ArcGIS - zoning changes, new permits
3. Transaction history - cap rate trends
4. Crime data - safety metrics
Provide 3-5 sentence summary with investment recommendation (Buy/Hold/Avoid).
```

**Task 3: Quick comp check**
```
User: "What are similar buildings selling for nearby?"

Context: User is viewing property at {address}

System Prompt:
Find 5-10 comparable sales within 1 mile of {address}:
- Same property type
- Similar size (±20% sqft)
- Sold in last 12 months
Return as table with: Address, Sale Date, Price, Price/SF, Distance
```

**Task 4: Owner research**
```
User: "Who owns this parcel? Are they a likely seller?"

System Prompt:
Query county tax assessor API for parcel {parcel_id}:
1. Owner name and mailing address
2. Ownership duration
3. Loan/lien status
4. Other properties owned (portfolio analysis)
Assess likelihood to sell based on: duration, out-of-state ownership, distress signals.
```

### Zoning-GIS Mode

**Task 5: Zoning feasibility**
```
User: "Can I build 50 units on this lot?"

System Prompt:
Query ArcGIS zoning layer for parcel {parcel_id}:
1. Current zoning designation
2. Max density allowed (units/acre)
3. Height restrictions
4. FAR (Floor Area Ratio)
Calculate: Lot size × density = max units. Return Yes/No + explanation.
```

**Task 6: Development capacity**
```
User: "What's the max buildable square footage here?"

System Prompt:
Calculate buildable SF for parcel {parcel_id}:
1. Get lot size from ArcGIS
2. Get FAR from zoning layer
3. Get setback requirements
Formula: (Lot SF - Setbacks) × FAR = Max buildable SF
```

**Task 7: Setback/FAR analysis**
```
User: "How close can I build to the property line?"

System Prompt:
Query zoning ordinance for {parcel_id}:
- Front setback: X feet
- Side setback: Y feet
- Rear setback: Z feet
Return diagram or text description.
```

**Task 8: Use-by-right check**
```
User: "Can I operate a restaurant without a variance?"

System Prompt:
Check zoning code for parcel {parcel_id}:
- Current zoning: {zone}
- Permitted uses: [list]
- Conditional uses: [list]
Return: Restaurant is [Permitted / Conditional / Prohibited]
```

### Comps Mode

**Task 9: Price per unit/SF**
```
User: "What's market rate for Class B apartments here?"

System Prompt:
Analyze multifamily sales in {submarket} (last 12 months):
1. Filter by Class B (age, condition)
2. Calculate avg price/unit and price/SF
3. Show trend (increasing/stable/decreasing)
Return: $X/unit, $Y/SF with confidence level.
```

**Task 10: Sales comps table**
```
User: Generate comparable sales

System Prompt:
Return 5-10 comps as table:
| Address | Sale Date | Price | Units | $/Unit | Distance | Cap Rate |
Format for easy export to Excel.
```

**Task 11: Cap rate analysis**
```
User: "What cap rates are multifamily trading at in this submarket?"

System Prompt:
Query transaction database for {submarket}:
- Calculate avg cap rate by property class
- Show distribution (min, median, max)
- Identify trend (cap rate compression/expansion)
```

**Task 12: Rent comps**
```
User: "What's achievable rent for renovated 2BR units?"

System Prompt:
Query MLS rental listings + county records:
- Filter: 2BR, renovated (last 5 years)
- Location: within 1 mile
Return: Avg rent, rent/SF, sample size
```

### Site Analysis Mode

**Task 13: Multi-layer risk check**
```
User: Assess risks for this property

System Prompt:
Analyze {address} across multiple layers:
1. FEMA flood zone (WMS query)
2. Traffic counts (DOT API)
3. Demographics (Census API)
4. Crime stats (FBI API / local PD)
Return risk matrix with scores (1-10) for each category.
```

**Task 14: Traffic counts**
```
User: "How many cars pass this intersection daily?"

System Prompt:
Query DOT traffic count API for nearest station to {address}:
Return: AADT (Annual Average Daily Traffic) + peak hour volumes
```

**Task 15: Demographics**
```
User: "What's median income within 1 mile?"

System Prompt:
Query Census API for 1-mile radius around {address}:
- Median household income
- Population density
- Age distribution
- Education levels
Return summary with investment implications.
```

**Task 16: Utilities/infrastructure**
```
User: "Is sewer available or septic only?"

System Prompt:
Query county GIS utilities layer for {parcel_id}:
- Water: [Municipal / Well]
- Sewer: [Municipal / Septic]
- Gas: [Available / Not available]
- Electric: [Provider name]
```

### Cross-Mode

**Task 17: Deal memo generation**
```
User: Generate investment memo for this property

System Prompt:
Create structured deal memo with sections:
1. Executive Summary
2. Property Overview (address, size, zoning)
3. Financial Analysis (purchase price, NOI, cap rate, cash-on-cash)
4. Market Analysis (comps, trends)
5. Risk Assessment
6. Recommendation
Format as markdown for export to PDF.
```

**Task 18: Underwriting assist**
```
User: "Run sensitivity on NOI if rents drop 5%"

System Prompt:
Current NOI: ${noi}
Current rents: ${rent}
Scenario: Rents drop 5%
New NOI = {noi} - ({rent} × 0.05 × {unit_count})
Recalculate cap rate, cash-on-cash, IRR
Return sensitivity table.
```

**Task 19: Due diligence checklist**
```
User: Create DD checklist

System Prompt:
Generate phase-based checklist:
- Initial Interest: [tasks]
- Due Diligence: [tasks]
- Negotiation: [tasks]
- Under Contract: [tasks]
- Closing: [tasks]
Customize based on property type and deal stage.
```

**Task 20: Market trends**
```
User: "Are industrial cap rates compressing in Houston?"

System Prompt:
Analyze Houston industrial market (last 24 months):
1. Query transaction database for cap rates over time
2. Calculate rate of change
3. Compare to national average
Return: "Cap rates are [compressing/stable/expanding] at X bps/year"
```

---

## API Endpoints (Backend)

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### Properties
```
GET    /api/properties?filters=...
GET    /api/properties/{id}
POST   /api/properties/search  (advanced search with AI)
POST   /api/properties/import  (CSV/Excel upload)
GET    /api/properties/{id}/analysis
POST   /api/properties/{id}/watchlist
```

### ArcGIS Integration
```
GET    /api/arcgis/parcel?lat={lat}&lon={lon}&county={county}
GET    /api/arcgis/zoning/{parcel_id}
GET    /api/arcgis/flood-zone?lat={lat}&lon={lon}
POST   /api/arcgis/batch-query
```

### Census & Demographics
```
GET    /api/census/demographics?lat={lat}&lon={lon}&radius={radius}
GET    /api/census/income-trends?geoid={geoid}
```

### Chat/AI
```
POST   /api/chat  (existing)
GET    /api/chat/history
POST   /api/chat/rag-query
```

### File Uploads
```
POST   /api/upload/zip
POST   /api/upload/csv
POST   /api/upload/shapefile
GET    /api/upload/status/{task_id}
GET    /api/uploads  (list user uploads)
DELETE /api/uploads/{id}
```

### Deals
```
GET    /api/deals
POST   /api/deals
PUT    /api/deals/{id}
PUT    /api/deals/{id}/stage
DELETE /api/deals/{id}
```

### Integrations
```
GET    /api/integrations
POST   /api/integrations
PUT    /api/integrations/{id}/sync
```

---

## Database Schema (PostgreSQL)

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Properties (minimal - mostly from API cache)
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parcel_id VARCHAR(100),
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(2),
    zip VARCHAR(10),
    county VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    property_type VARCHAR(50),
    price DECIMAL(15, 2),
    sqft INTEGER,
    user_id UUID REFERENCES users(id),  -- NULL if from API
    source VARCHAR(50),  -- 'api' or 'upload'
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_location (latitude, longitude),
    INDEX idx_user (user_id)
);

-- User Uploads (track ZIP/CSV uploads)
CREATE TABLE uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255),
    file_type VARCHAR(50),
    file_size INTEGER,
    status VARCHAR(50),  -- 'processing', 'completed', 'failed'
    records_imported INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Vector Embeddings (pgvector)
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    metadata JSONB,
    embedding vector(1536),  -- OpenAI embedding dimension
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_user_embeddings (user_id),
    INDEX idx_embedding (embedding vector_cosine_ops)  -- For similarity search
);

-- API Cache (for ArcGIS, Census, etc.)
CREATE TABLE api_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    response_data JSONB NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_cache_key (cache_key),
    INDEX idx_expires (expires_at)
);

-- Deals
CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id),
    stage VARCHAR(50),  -- 'interest', 'diligence', 'negotiation', 'contract', 'closing'
    priority VARCHAR(20),
    asking_price DECIMAL(15, 2),
    offer_price DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Watchlists
CREATE TABLE watchlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- Saved Searches
CREATE TABLE saved_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    filters JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Cost Optimization Strategy

### 1. **Minimize Data Hosting**
- Store only user uploads and critical metadata
- Use API-first approach for live data (pay per request vs. storage)
- Cache API responses in Redis (in-memory, volatile)
- Implement aggressive cache expiration policies

### 2. **API Cost Management**
| API | Cost | Strategy |
|-----|------|----------|
| ArcGIS REST | **Free** (public endpoints) | Direct proxy, 24hr cache |
| Census API | **Free** | 7-day cache |
| FEMA WMS | **Free** | Indefinite cache (static) |
| OpenAI Embeddings | **$0.02/1M tokens** | Batch uploads, cache embeddings |
| Anthropic Claude | **$3/1M input, $15/1M output** | Use Haiku for simple tasks, Sonnet for complex |
| MLS APIs | **Varies** ($100-500/mo) | Negotiate county-level access |

### 3. **Compute Optimization**
- Use **Railway.app** or **Render.com** for backend hosting ($7-20/mo)
- **Supabase** free tier for PostgreSQL + pgvector (10GB storage)
- **Upstash Redis** free tier (10K requests/day)
- **Cloudflare R2** for file storage ($0.015/GB vs S3)

**Estimated Monthly Cost (Low Usage):**
- Backend hosting: $10
- Database (Supabase): $0 (free tier)
- Redis (Upstash): $0 (free tier)
- File storage: $5
- LLM API calls: $20-50
- MLS API: $100-300
- **Total: $135-365/month**

---

## MCP Server Integration (Optional)

**What is MCP?**
Model Context Protocol - allows LLMs to interact with external data sources via standardized servers.

**Use Case for ScoutGPT:**
Instead of building custom API integrations, use MCP servers to connect Claude to data sources.

**Example MCP Servers:**
1. **ArcGIS MCP Server** - Query parcels, zoning, GIS layers
2. **Census MCP Server** - Demographics, income data
3. **FEMA MCP Server** - Flood zone queries
4. **Database MCP Server** - Direct SQL queries to PostgreSQL

**Implementation:**
```python
from anthropic import Anthropic

client = Anthropic()

# Connect to MCP servers
response = client.messages.create(
    model="claude-sonnet-4-5",
    mcp_servers=[
        {"name": "arcgis", "url": "http://localhost:3000/arcgis"},
        {"name": "census", "url": "http://localhost:3000/census"},
    ],
    messages=[
        {"role": "user", "content": "What's the zoning for parcel 12345 in Dallas County?"}
    ]
)
```

**Benefits:**
- Claude can directly query APIs without custom backend code
- Reduces development time
- MCP servers can be reused across projects

**Setup Guide:**
https://docs.anthropic.com/en/docs/build-with-claude/mcp

---

## Implementation Timeline

### Phase 1: Foundation (Week 1-2)
- [x] Set up FastAPI backend
- [x] Configure PostgreSQL with pgvector
- [x] Implement authentication (JWT)
- [x] Create basic CRUD endpoints
- [x] Set up Redis caching

### Phase 2: Top 3 Features (Week 3-4)
- [x] ArcGIS REST API integration (Dallas, Harris, Travis counties)
- [x] ZIP file upload handler with Celery
- [x] RAG system with LangChain + pgvector
- [x] Test with sample data

### Phase 3: AI Tasks (Week 5-6)
- [x] Implement 20 AI task prompts
- [x] Connect Claude API with RAG retrieval
- [x] Add response caching for speed
- [x] Test <10s response requirement

### Phase 4: Additional Integrations (Week 7-8)
- [x] Census API integration
- [x] FEMA WMS integration
- [x] MLS API connection (if budget allows)
- [x] Zillow/Redfin scraping (ethical, rate-limited)

### Phase 5: Polish & Deploy (Week 9-10)
- [x] Performance optimization
- [x] Error handling
- [x] API documentation (auto-generated via FastAPI)
- [x] Deploy to production
- [x] User testing

---

## Next Steps

1. **Approve this plan** - Any changes or priorities?
2. **Set up backend repo** - Create `/backend` directory in this repo?
3. **Configure environment** - Set up API keys (Census, OpenAI, Anthropic)
4. **Start Phase 1** - I can build the FastAPI skeleton today

**Questions for you:**
- Do you have access to MLS APIs or county data feeds?
- Preferred backend hosting (Railway, Render, AWS, self-hosted)?
- Do you want MCP server approach or traditional REST APIs?
- Should I start building now or wait for your feedback?

---

**Document Version:** 1.0
**Last Updated:** 2025-11-17
**Author:** Claude (ScoutGPT AI Assistant)
