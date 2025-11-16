# ScoutGPT Database Setup Guide

Complete guide for setting up PostGIS database with Texas real estate data.

## Quick Start (5 minutes)

### Option 1: Neon (Recommended - Easiest)

1. **Sign up for Neon** (FREE forever tier):
   - Go to https://neon.tech
   - Sign up with GitHub
   - Create a new project: "scoutgpt-realestate"
   - Region: US East (closest to Texas)

2. **Get your connection string**:
   ```
   postgres://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb
   ```

3. **Enable PostGIS** (run in Neon SQL Editor):
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE EXTENSION IF NOT EXISTS postgis_topology;
   ```

4. **Add to Render**:
   - Go to your Render service → Environment
   - Add variable: `DATABASE_URL` = [your Neon connection string]
   - Click "Save"
   - Redeploy

### Option 2: Supabase (Alternative)

1. **Sign up**: https://supabase.com
2. Create project → Get connection string
3. PostGIS is already enabled!
4. Add `DATABASE_URL` to Render

---

## Data Ingestion

### Method 1: Use Pre-processed GeoJSON (Easiest)

We'll provide pre-processed GeoJSON files for major Texas cities:

1. **Download city data** (will be hosted):
   - Austin buildings (~50MB): `austin_buildings.geojson`
   - Dallas buildings (~80MB): `dallas_buildings.geojson`
   - Houston buildings (~120MB): `houston_buildings.geojson`

2. **Import via API** (coming soon):
   ```bash
   curl -X POST https://your-backend.com/admin/import \
        -F "file=@austin_buildings.geojson" \
        -F "data_type=buildings"
   ```

### Method 2: Process Raw OSM Data (Advanced)

If you want ALL Texas data:

1. **Download Texas extract**:
   ```bash
   wget https://download.geofabrik.de/north-america/us/texas-latest.osm.pbf
   ```
   Size: ~450 MB

2. **Install osmium-tool**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install osmium-tool

   # macOS
   brew install osmium-tool
   ```

3. **Extract buildings**:
   ```bash
   osmium tags-filter texas-latest.osm.pbf w/building -o buildings.geojson -f geojson
   ```

4. **Import to database**:
   ```bash
   python backend/ingest_texas_data.py --skip-download --city austin
   ```

---

## Data Sources

### 1. Buildings (OpenStreetMap)
- **Source**: GeoFabrik Texas Extract
- **Coverage**: Entire state
- **Update frequency**: Weekly
- **Size**: ~2M buildings
- **Fields**: name, type, address, height, floors

### 2. Property Parcels (County GIS)

#### Travis County (Austin)
- **API**: https://data.austintexas.gov
- **Coverage**: ~400k parcels
- **Fields**: owner, value, zoning, lot size
- **Free**: Yes

#### Harris County (Houston)
- **API**: https://pdata-hcad.opendata.arcgis.com
- **Coverage**: ~1.5M parcels
- **Fields**: appraisal, land use, improvements
- **Free**: Yes

#### Dallas County
- **API**: https://gis.dallascounty.org
- **Coverage**: ~900k parcels
- **Free**: Yes

#### Bexar County (San Antonio)
- **API**: https://bexar.trueautomation.com
- **Coverage**: ~700k parcels
- **Free**: Yes

### 3. Flood Zones (FEMA)
- **Source**: FEMA National Flood Hazard Layer
- **API**: https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer
- **Coverage**: Nationwide
- **Free**: Yes
- **Zones**: A (high risk), AE, X (moderate/low risk)

### 4. Zoning
- **Source**: City planning departments
- **Austin**: https://data.austintexas.gov/Locations-and-Maps/Zoning/5rzy-nm8f
- **Dallas**: Available via ArcGIS REST
- **Houston**: No official zoning (unique!)
- **San Antonio**: Available via open data portal

### 5. Demographics (US Census)
- **Source**: TIGER/Line Shapefiles
- **API**: https://tigerweb.geo.census.gov/arcgis/rest/services
- **Data**: Block groups, income, population
- **Free**: Yes

---

## Database Schema

```sql
-- Buildings from OSM
CREATE TABLE buildings (
    id SERIAL PRIMARY KEY,
    osm_id VARCHAR UNIQUE,
    name VARCHAR,
    building_type VARCHAR,
    address VARCHAR,
    city VARCHAR,
    state VARCHAR DEFAULT 'TX',
    zip_code VARCHAR,
    height FLOAT,
    levels INTEGER,
    geometry GEOMETRY(POLYGON, 4326),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Property parcels from counties
CREATE TABLE parcels (
    id SERIAL PRIMARY KEY,
    parcel_id VARCHAR UNIQUE,
    owner_name VARCHAR,
    address VARCHAR,
    city VARCHAR,
    county VARCHAR,
    state VARCHAR DEFAULT 'TX',
    zip_code VARCHAR,
    assessed_value FLOAT,
    land_use VARCHAR,
    zoning VARCHAR,
    lot_size FLOAT,
    geometry GEOMETRY(POLYGON, 4326),
    created_at TIMESTAMP DEFAULT NOW()
);

-- FEMA flood zones
CREATE TABLE flood_zones (
    id SERIAL PRIMARY KEY,
    fema_id VARCHAR,
    zone_type VARCHAR,
    flood_risk VARCHAR,
    description TEXT,
    geometry GEOMETRY(MULTIPOLYGON, 4326),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Roads from OSM
CREATE TABLE roads (
    id SERIAL PRIMARY KEY,
    osm_id VARCHAR UNIQUE,
    name VARCHAR,
    road_type VARCHAR,
    surface VARCHAR,
    lanes INTEGER,
    max_speed INTEGER,
    geometry GEOMETRY(LINESTRING, 4326),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create spatial indexes
CREATE INDEX idx_buildings_geom ON buildings USING GIST (geometry);
CREATE INDEX idx_buildings_city ON buildings (city);
CREATE INDEX idx_parcels_geom ON parcels USING GIST (geometry);
CREATE INDEX idx_parcels_city ON parcels (city);
CREATE INDEX idx_flood_zones_geom ON flood_zones USING GIST (geometry);
CREATE INDEX idx_roads_geom ON roads USING GIST (geometry);
```

---

## API Endpoints (After Setup)

```
GET  /layers/buildings?city=austin&bbox=-97.8,30.2,-97.7,30.3
GET  /layers/parcels?city=austin&bbox=-97.8,30.2,-97.7,30.3
GET  /layers/flood_zones?bbox=-97.8,30.2,-97.7,30.3
GET  /layers/roads?bbox=-97.8,30.2,-97.7,30.3
GET  /property/{parcel_id}
POST /chat  (now with spatial query capabilities)
```

---

## Cost Breakdown

### FREE Option (Recommended for starting)
- **Neon Database**: FREE (0.5 GB storage, 512 MB compute)
- **Render Backend**: FREE (512 MB RAM, spins down after 15min)
- **Netlify Frontend**: FREE (100 GB bandwidth)
- **Data Sources**: FREE (all government/OSM data)
- **Total**: $0/month

### Limitations of FREE tier:
- Database size: 0.5 GB (~50,000-100,000 buildings)
- Solution: Store only major cities (Austin, Dallas, Houston, San Antonio)
- Backend: Spins down after 15min inactivity (~30s cold start)

### Paid Option (Production scale)
- **Neon Pro**: $19/month (3 GB storage, 2 GB compute, no sleep)
- **Render Standard**: $7/month (always-on)
- **Total**: $26/month for full Texas coverage

---

## Next Steps

1. ✅ Sign up for Neon
2. ✅ Create database and enable PostGIS
3. ✅ Add DATABASE_URL to Render
4. ✅ Redeploy backend
5. ⏳ Import city data (Austin, Dallas, Houston)
6. ⏳ Test spatial queries via API
7. ⏳ Update frontend with layer controls

Need help? Check the main README or ask in chat!
