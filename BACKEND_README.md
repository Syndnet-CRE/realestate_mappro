# ScoutGPT Backend

Complete backend infrastructure for ScoutGPT real estate intelligence platform.

## 🏗️ Architecture

```
ScoutGPT Backend
├── PostgreSQL + PostGIS (geospatial database)
├── FastAPI (REST API server)
├── Data Ingestion (OSM, ArcGIS, WFS, Shapefiles)
├── MCP Tools (Claude integration)
└── ML Training (Hugging Face models)
```

## 🚀 Quick Start

### Prerequisites

- **Docker** and **Docker Compose**
- **Python 3.11+** (for local development)
- **Git**

### Step 1: Start the Backend

```bash
# From the project root directory
docker compose up -d

# Check logs
docker compose logs -f backend
```

This will start:
- **PostgreSQL + PostGIS** on `localhost:5432`
- **FastAPI backend** on `http://localhost:8000`

### Step 2: Verify It's Running

Open your browser and go to:
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **API Root**: http://localhost:8000

### Step 3: Test with Sample Data

The database is pre-populated with sample datasets:
```bash
# List datasets
curl http://localhost:8000/datasets

# Get layers
curl http://localhost:8000/layers

# Query parcels
curl http://localhost:8000/parcels
```

### Step 4: Connect Your Frontend

Update your frontend `.env`:
```bash
VITE_API_BASE_URL=http://localhost:8000
```

Redeploy your frontend and it will now talk to the local backend!

---

## 📚 API Endpoints

### Dataset Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/datasets` | Create a new dataset |
| `GET` | `/datasets` | List all datasets |
| `GET` | `/datasets/{id}` | Get dataset details |
| `DELETE` | `/datasets/{id}` | Delete a dataset |
| `POST` | `/datasets/{id}/upload` | Upload files to dataset |
| `POST` | `/datasets/{id}/ingest` | Trigger data ingestion |

### Map Layers

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/layers` | List all map layers |
| `GET` | `/layers/{name}/features` | Get GeoJSON features |

### Parcels

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/parcels` | Query parcels with filters |

**Query Parameters**:
- `bbox` - Bounding box (minx,miny,maxx,maxy)
- `zoning` - Filter by zoning type
- `min_lot_size` - Minimum lot size
- `limit` - Max results (default: 100)

### Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/chat` | Send a message to the AI assistant |

**Request Body**:
```json
{
  "message": "Find me R-2 zoned parcels over 5000 sq ft"
}
```

### Training

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/train` | Start a model training job |

---

## 🗄️ Database Schema

### Tables

1. **datasets** - Dataset metadata
2. **dataset_files** - Uploaded files
3. **layers** - Map layer definitions
4. **features** - Generic geospatial features
5. **parcels** - Property parcels with attributes

### Sample Queries

```sql
-- List all datasets
SELECT * FROM datasets;

-- Find R-2 zoned parcels
SELECT * FROM parcels WHERE zoning = 'R-2';

-- Get parcels within a bounding box
SELECT * FROM parcels
WHERE ST_Intersects(
  geom,
  ST_MakeEnvelope(-122.5, 37.7, -122.3, 37.8, 4326)
);
```

---

## 📥 Data Ingestion

### Import OSM Data

```bash
# Download OSM data from Geofabrik
wget https://download.geofabrik.de/north-america/us/california/san-francisco-bay-latest.osm.pbf

# Import buildings layer
docker compose exec backend python /app/../ingestion/osm_import.py \
  --file san-francisco-bay-latest.osm.pbf \
  --layer buildings \
  --db-url postgresql://scoutgpt:scoutgpt_dev_password@db:5432/scoutgpt
```

### Import from ArcGIS FeatureServer

```bash
docker compose exec backend python /app/../ingestion/arcgis_import.py \
  --url "https://services.arcgis.com/.../FeatureServer/0" \
  --table parcels \
  --db-url postgresql://scoutgpt:scoutgpt_dev_password@db:5432/scoutgpt
```

### Import from WFS

```bash
docker compose exec backend python /app/../ingestion/wfs_import.py \
  --url "https://gis.example.com/wfs" \
  --typename "parcels:zoning" \
  --table zoning \
  --db-url postgresql://scoutgpt:scoutgpt_dev_password@db:5432/scoutgpt
```

---

## 🤖 MCP Integration (Claude)

### Tool Definitions

Located in `mcp/tools.json`:
- `list_datasets` - List all datasets
- `get_dataset_details` - Get dataset info
- `ingest_dataset` - Trigger ingestion
- `list_layers` - List map layers
- `query_parcels` - Query parcels with filters
- `get_layer_features_at_point` - Spatial query
- `start_training` - Start model training

### Using MCP Tools

```python
from mcp.handlers import execute_tool

# List datasets
result = execute_tool("list_datasets", {"limit": 10})

# Query parcels
result = execute_tool("query_parcels", {
    "zoning": "R-2",
    "min_lot_size": 5000,
    "limit": 50
})
```

---

## 🧠 ML Training

### Prepare Training Data

Create a JSONL file with training examples:

```jsonl
{"input": "What does R-2 zoning mean?", "target": "R-2 zoning allows for..."}
{"input": "Explain commercial zoning", "target": "Commercial zoning permits..."}
```

### Run Training

```bash
cd ml
python train_example.py \
  --data training_data.jsonl \
  --model mistralai/Mistral-7B-Instruct-v0.2 \
  --output ./models/scoutgpt-zoning-v1
```

See `ml/hf_config_example.md` for detailed model recommendations.

---

## 🛠️ Development

### Local Setup (Without Docker)

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Start PostgreSQL separately
docker run -d \
  -p 5432:5432 \
  -e POSTGRES_DB=scoutgpt \
  -e POSTGRES_USER=scoutgpt \
  -e POSTGRES_PASSWORD=scoutgpt_dev_password \
  postgis/postgis:15-3.3

# Run backend
uvicorn app.main:app --reload --port 8000
```

### Running Tests

```bash
# TODO: Add pytest tests
pytest backend/tests/
```

---

## 🚀 Deployment

### Environment Variables

Create a `.env` file:

```bash
DATABASE_URL=postgresql://user:pass@host:5432/scoutgpt
ANTHROPIC_API_KEY=sk-ant-...
ENVIRONMENT=production
API_HOST=0.0.0.0
API_PORT=8000
```

### Deploy to Cloud

**Option 1: Railway**
```bash
railway up
```

**Option 2: Render**
- Connect your GitHub repo
- Set environment variables
- Deploy as Docker service

**Option 3: AWS/GCP/Azure**
- Use managed PostgreSQL (RDS, Cloud SQL, Azure Database)
- Deploy FastAPI as container (ECS, Cloud Run, App Service)
- Set up vector tiles for map performance

---

## 📊 Monitoring

### Health Checks

```bash
curl http://localhost:8000/health
```

### Database Connection

```bash
docker compose exec db psql -U scoutgpt -d scoutgpt

# Check PostGIS version
SELECT PostGIS_Version();

# Count parcels
SELECT COUNT(*) FROM parcels;
```

### Logs

```bash
# Backend logs
docker compose logs -f backend

# Database logs
docker compose logs -f db
```

---

## 🗂️ Project Structure

```
backend/
├── app/
│   ├── main.py           # FastAPI application
│   ├── database.py       # Database connection
│   ├── models.py         # SQLAlchemy models
│   └── schemas.py        # Pydantic schemas
├── Dockerfile            # Backend container
└── requirements.txt      # Python dependencies

db/
└── init.sql              # Database initialization

ingestion/
├── osm_import.py         # OSM/Geofabrik importer
├── arcgis_import.py      # ArcGIS FeatureServer importer
└── wfs_import.py         # WFS importer

mcp/
├── tools.json            # MCP tool definitions
└── handlers.py           # Tool handlers for Claude

ml/
├── train_example.py      # Training script template
└── hf_config_example.md  # Model recommendations

docker-compose.yml        # Infrastructure definition
```

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test locally with `docker compose up`
4. Submit a pull request

---

## 📝 License

MIT License - See LICENSE file

---

## 🆘 Troubleshooting

### Backend won't start

```bash
# Check logs
docker compose logs backend

# Rebuild containers
docker compose down
docker compose up --build
```

### Database connection errors

```bash
# Ensure database is healthy
docker compose ps

# Check connection
docker compose exec db pg_isready -U scoutgpt
```

### Frontend can't reach API

- Check CORS settings in `app/main.py`
- Verify `VITE_API_BASE_URL` in frontend `.env`
- Check firewall/network settings

---

**Built with ❤️ for real estate intelligence**
