-- Initialize PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Create datasets table
CREATE TABLE IF NOT EXISTS datasets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50),
    tags TEXT[],
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create dataset_files table
CREATE TABLE IF NOT EXISTS dataset_files (
    id SERIAL PRIMARY KEY,
    dataset_id INTEGER REFERENCES datasets(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    original_name VARCHAR(255),
    file_type VARCHAR(50),
    size_bytes BIGINT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create layers table
CREATE TABLE IF NOT EXISTS layers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    dataset_id INTEGER REFERENCES datasets(id) ON DELETE CASCADE,
    geom_type VARCHAR(50),
    srid INTEGER DEFAULT 4326,
    bbox GEOMETRY(POLYGON, 4326),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create parcels table (example geometry table)
CREATE TABLE IF NOT EXISTS parcels (
    id SERIAL PRIMARY KEY,
    dataset_id INTEGER REFERENCES datasets(id) ON DELETE CASCADE,
    geom GEOMETRY(GEOMETRY, 4326),
    apn VARCHAR(50),
    owner_name VARCHAR(255),
    zoning VARCHAR(50),
    lot_size NUMERIC,
    attributes JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index on parcels
CREATE INDEX IF NOT EXISTS idx_parcels_geom ON parcels USING GIST(geom);

-- Create generic features table for flexible storage
CREATE TABLE IF NOT EXISTS features (
    id SERIAL PRIMARY KEY,
    layer_id INTEGER REFERENCES layers(id) ON DELETE CASCADE,
    geom GEOMETRY(GEOMETRY, 4326),
    properties JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_features_geom ON features USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_features_layer ON features(layer_id);

-- Insert sample datasets for demo
INSERT INTO datasets (name, description, type, status, tags) VALUES
    ('SF Parcels', 'San Francisco property parcels', 'parcels', 'ready', ARRAY['parcels', 'properties', 'sf']),
    ('Zoning Data', 'Zoning classifications', 'zoning', 'processing', ARRAY['zoning', 'planning']),
    ('OSM Buildings', 'OpenStreetMap building footprints', 'buildings', 'ready', ARRAY['osm', 'buildings'])
ON CONFLICT DO NOTHING;

-- Create a sample layer
INSERT INTO layers (name, dataset_id, geom_type, srid, metadata) VALUES
    ('sf_parcels', 1, 'Polygon', 4326, '{"source": "demo", "year": 2024}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Insert sample parcel data
INSERT INTO parcels (dataset_id, geom, apn, owner_name, zoning, lot_size, attributes) VALUES
    (1, ST_GeomFromText('POLYGON((-122.42 37.78, -122.42 37.77, -122.41 37.77, -122.41 37.78, -122.42 37.78))', 4326),
     '1234-567', 'Demo Owner', 'R-2', 5000, '{"address": "123 Market St", "year_built": 1920}'::jsonb)
ON CONFLICT DO NOTHING;
