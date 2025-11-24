"""
ScoutGPT Backend API - Lightweight version for Render free tier
No GDAL (shapefiles), no sentence-transformers (RAG/embeddings)
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import database initialization
from database import init_db

# Import routes
from routes.upload import router as upload_router
from routes.properties import router as properties_router
from routes.arcgis import router as arcgis_router
from routes.chat import router as chat_router
from routes.compat import router as compat_router

# Create FastAPI app
app = FastAPI(
    title="ScoutGPT API",
    description="Real Estate Intelligence Platform - Lightweight Backend",
    version="1.0.0"
)

# CORS configuration - allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://*.render.com",
        "*"  # Allow all for now (restrict in production)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload_router, prefix="/api/upload", tags=["Upload"])
app.include_router(properties_router, prefix="/api/properties", tags=["Properties"])
app.include_router(arcgis_router, prefix="/api/arcgis", tags=["ArcGIS"])
app.include_router(chat_router, prefix="/api/chat", tags=["Chat"])
# Compatibility routes for frontend (no prefix)
app.include_router(compat_router, tags=["Compatibility"])


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    print("🚀 Starting ScoutGPT API...")
    print("📊 Initializing database...")
    init_db()
    print("✅ ScoutGPT API ready!")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ScoutGPT API",
        "version": "1.0.0",
        "features": {
            "csv_upload": True,
            "geojson_upload": True,
            "excel_upload": True,
            "pdf_text_extraction": True,
            "zip_files": True,
            "arcgis_queries": True,
            "attom_queries": True,
            "claude_chat": True,
            "shapefiles": False,  # Disabled (requires GDAL)
            "rag_search": False,  # Disabled (requires sentence-transformers)
        }
    }


@app.get("/health")
async def health():
    """Health check for Render"""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
