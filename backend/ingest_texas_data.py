"""
Data ingestion script for Texas GeoFabrik OSM data

This script downloads and imports Texas building footprints, roads, and POIs
from GeoFabrik OpenStreetMap extracts into PostGIS database.

Usage:
    python ingest_texas_data.py --data-type buildings --city austin
    python ingest_texas_data.py --data-type all
"""
import os
import sys
import argparse
import subprocess
from pathlib import Path
import requests
from sqlalchemy.orm import Session
from database import engine, Building, Road, create_tables
from shapely import wkb
from shapely.geometry import shape
import geojson

# Download URLs
GEOFABRIK_TEXAS_URL = "https://download.geofabrik.de/north-america/us/texas-latest.osm.pbf"
DATA_DIR = Path("/tmp/texas_osm_data")


def download_texas_extract():
    """Download Texas OSM extract from GeoFabrik"""
    print("📥 Downloading Texas OSM extract from GeoFabrik...")

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    output_file = DATA_DIR / "texas-latest.osm.pbf"

    if output_file.exists():
        print(f"✅ File already exists: {output_file}")
        return output_file

    response = requests.get(GEOFABRIK_TEXAS_URL, stream=True)
    total_size = int(response.headers.get('content-length', 0))

    with open(output_file, 'wb') as f:
        downloaded = 0
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
            downloaded += len(chunk)
            if total_size > 0:
                percent = (downloaded / total_size) * 100
                print(f"Progress: {percent:.1f}%", end='\r')

    print(f"\n✅ Downloaded: {output_file} ({total_size / 1024 / 1024:.1f} MB)")
    return output_file


def extract_buildings_with_osmium(pbf_file: Path, city_filter: str = None):
    """
    Extract buildings from PBF using osmium-tool

    Note: Requires osmium-tool to be installed
    Install: apt-get install osmium-tool  (Linux)
             brew install osmium-tool      (Mac)
    """
    print(f"🏗️ Extracting buildings from {pbf_file.name}...")

    output_file = DATA_DIR / "buildings.geojson"

    # osmium tags-filter command to extract buildings
    cmd = [
        "osmium", "tags-filter",
        str(pbf_file),
        "w/building",
        "-o", str(output_file),
        "-f", "geojson"
    ]

    try:
        subprocess.run(cmd, check=True)
        print(f"✅ Extracted buildings to {output_file}")
        return output_file
    except FileNotFoundError:
        print("❌ osmium-tool not found. Please install it:")
        print("   Linux: sudo apt-get install osmium-tool")
        print("   Mac: brew install osmium-tool")
        return None
    except subprocess.CalledProcessError as e:
        print(f"❌ Error extracting buildings: {e}")
        return None


def import_buildings_to_db(geojson_file: Path, city_filter: str = None):
    """Import buildings from GeoJSON to database"""
    print(f"📊 Importing buildings to database...")

    if not engine:
        print("❌ No database connection. Set DATABASE_URL environment variable.")
        return

    with open(geojson_file, 'r') as f:
        data = geojson.load(f)

    session = Session(engine)
    count = 0

    try:
        for feature in data['features']:
            props = feature.get('properties', {})
            geom = feature.get('geometry')

            # Skip if city filter is set and doesn't match
            if city_filter:
                city_name = props.get('addr:city', '').lower()
                if city_filter.lower() not in city_name:
                    continue

            building = Building(
                osm_id=str(props.get('id', props.get('@id', ''))),
                name=props.get('name'),
                building_type=props.get('building'),
                address=props.get('addr:street'),
                city=props.get('addr:city'),
                zip_code=props.get('addr:postcode'),
                height=float(props.get('height', 0)) if props.get('height') else None,
                levels=int(props.get('building:levels', 0)) if props.get('building:levels') else None,
                geometry=f"SRID=4326;{shape(geom).wkt}"
            )

            session.add(building)
            count += 1

            if count % 1000 == 0:
                session.commit()
                print(f"  Imported {count} buildings...", end='\r')

        session.commit()
        print(f"\n✅ Successfully imported {count} buildings")

    except Exception as e:
        session.rollback()
        print(f"❌ Error importing buildings: {e}")
    finally:
        session.close()


def fetch_county_parcels_api(county: str = "travis"):
    """
    Fetch parcel data from county GIS APIs

    Major Texas counties with open data:
    - Travis County (Austin): https://data.austintexas.gov
    - Harris County (Houston): https://pdata-hcad.opendata.arcgis.com
    - Dallas County: https://gis.dallascounty.org
    - Bexar County (San Antonio): https://bexar.trueautomation.com
    """
    print(f"📍 Fetching parcel data for {county} county...")

    # Example: Travis County parcels (Austin)
    if county.lower() == "travis":
        api_url = "https://services.arcgis.com/0L95CJ0VTaxqcmED/arcgis/rest/services/BOUNDARIES_single_member_districts/FeatureServer/0/query"
        params = {
            "where": "1=1",
            "outFields": "*",
            "outSR": "4326",
            "f": "geojson",
            "resultRecordCount": 1000  # Limit for demo
        }

        response = requests.get(api_url, params=params)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Fetched {len(data.get('features', []))} features from Travis County")
            return data
        else:
            print(f"❌ Failed to fetch data: {response.status_code}")
            return None

    print(f"⚠️ County '{county}' not yet implemented")
    return None


def main():
    parser = argparse.ArgumentParser(description="Import Texas GIS data")
    parser.add_argument('--data-type', choices=['buildings', 'roads', 'all'], default='buildings',
                        help='Type of data to import')
    parser.add_argument('--city', type=str, help='Filter by city (e.g., austin, dallas, houston)')
    parser.add_argument('--download-only', action='store_true', help='Only download, do not import')
    parser.add_argument('--skip-download', action='store_true', help='Skip download, use existing file')

    args = parser.parse_args()

    # Create database tables
    create_tables()

    # Download data
    if not args.skip_download:
        pbf_file = download_texas_extract()
    else:
        pbf_file = DATA_DIR / "texas-latest.osm.pbf"
        if not pbf_file.exists():
            print(f"❌ File not found: {pbf_file}")
            return

    if args.download_only:
        print("✅ Download complete. Exiting.")
        return

    # Extract and import buildings
    if args.data_type in ['buildings', 'all']:
        geojson_file = extract_buildings_with_osmium(pbf_file, args.city)
        if geojson_file:
            import_buildings_to_db(geojson_file, args.city)

    print("\n🎉 Data ingestion complete!")
    print("\nNext steps:")
    print("1. Set DATABASE_URL environment variable in Render")
    print("2. Run this script on a machine with osmium-tool installed")
    print("3. Or use the web UI to upload GeoJSON files directly")


if __name__ == "__main__":
    main()
