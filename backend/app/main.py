"""
ScoutGPT Backend API
Real Estate AI Assistant with RAG, ArcGIS Integration, and File Upload
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.routes import auth, properties, arcgis, chat, upload, deals, integrations

# Lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 ScoutGPT API Starting...")
    print(f"Environment: {settings.ENVIRONMENT}")
    print(f"Database: {settings.DATABASE_URL.split('@')[-1]}")  # Hide credentials

    # Initialize database connection pool
    # await database.connect()

    # Initialize Redis connection
    # await redis.connect()

    yield

    # Shutdown
    print("🛑 ScoutGPT API Shutting down...")
    # await database.disconnect()
    # await redis.disconnect()

# Initialize FastAPI app
app = FastAPI(
    title="ScoutGPT API",
    description="Real Estate AI Assistant with ArcGIS, RAG, and Multi-Source Data Integration",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0"
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "ScoutGPT API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(properties.router, prefix="/api/properties", tags=["Properties"])
app.include_router(arcgis.router, prefix="/api/arcgis", tags=["ArcGIS Integration"])
app.include_router(chat.router, prefix="/api/chat", tags=["AI Chat"])
app.include_router(upload.router, prefix="/api/upload", tags=["File Uploads"])
app.include_router(deals.router, prefix="/api/deals", tags=["Deals"])
app.include_router(integrations.router, prefix="/api/integrations", tags=["Integrations"])

# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc) if settings.ENVIRONMENT == "development" else "An unexpected error occurred"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if settings.ENVIRONMENT == "development" else False
    )
