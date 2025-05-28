from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import logging
from pathlib import Path
import os

from services.video import router as video_router
from services.upload import router as upload_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="AniSora API",
    description="API for AniSora video generation service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update with your frontend URL
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# Include routers
app.include_router(video_router, prefix="/api/v1")
app.include_router(upload_router)  # Prefix is already set in the router

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "timestamp": "2023-01-01T00:00:00Z"}

# Error handler for 404
@app.exception_handler(404)
async def not_found_exception_handler(request: Request, exc: Exception):
    return {"detail": "Not Found"}, 404

# Error handler for 500
@app.exception_handler(500)
async def server_error_exception_handler(request: Request, exc: Exception):
    logger.error(f"Server error: {exc}", exc_info=True)
    return {"detail": "Internal Server Error"}, 500

if __name__ == "__main__":
        # Create uploads directory if it doesn't exist
    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True, mode=0o755)
    
    # Mount static files
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
    
    # Run the server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
