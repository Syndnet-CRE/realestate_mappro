"""
ScoutGPT Real Estate RAG Platform - FastAPI Backend

Features:
- ZIP file upload with multi-format extraction (CSV, PDF, Shapefile)
- RAG system for document search (market reports, appraisals)
- ArcGIS REST API integration (parcels, zoning)
- Claude AI with specialized real estate analysis
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from datetime import datetime
import sys
from pathlib import Path

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).parent))

from config import settings
from models import init_db
from routes import upload_router, chat_router, datasets_router, layers_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    print("🚀 Initializing ScoutGPT Backend...")
    print(f"📊 Database: {settings.database_url}")
    print(f"🤖 Claude Model: {settings.claude_model}")
    print(f"📂 Upload Directory: {settings.upload_dir}")

    # Initialize database
    try:
        init_db()
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"⚠️  Database initialization warning: {e}")

    yield

    print("👋 Shutting down ScoutGPT Backend...")


# Create FastAPI app
app = FastAPI(
    title="ScoutGPT Real Estate RAG Platform",
    description="AI-powered real estate analysis with document search and GIS integration",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "connected" if settings.database_url else "not configured",
        "claude": "configured" if settings.anthropic_api_key else "not configured",
    }


@app.get("/")
async def root():
    """Root endpoint with API info."""
    return {
        "message": "ScoutGPT Real Estate RAG Platform API",
        "version": "1.0.0",
        "docs": "/docs",
        "features": [
            "ZIP file upload with multi-format extraction",
            "PDF RAG document search",
            "ArcGIS REST API integration",
            "Claude AI real estate analyst",
        ],
        "endpoints": {
            "chat": "/chat",
            "upload": "/upload",
            "datasets": "/datasets",
            "layers": "/layers",
            "health": "/health",
        },
    }


# Include routers
app.include_router(chat_router)
app.include_router(upload_router)
app.include_router(datasets_router)
app.include_router(layers_router)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all unhandled exceptions."""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc) if settings.debug else "An error occurred",
            "path": str(request.url),
        },
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info",
    )
