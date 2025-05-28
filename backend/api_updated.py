from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi import APIRouter
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pathlib import Path
import os
import logging
from typing import Optional

# Import routers
from services import video_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AniSora API",
    description="API for AniSora video generation platform",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to specific domains
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["Content-Disposition"]
)

# Ensure generated videos directory exists
generated_videos_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'generated_videos')
os.makedirs(generated_videos_dir, exist_ok=True)

# Add static file serving
app.mount("/generated_videos", StaticFiles(directory=generated_videos_dir), name="generated_videos")

# Add a global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "AniSora API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

# Create upload router
upload_router = APIRouter(prefix="/api/upload", tags=["upload"])

# Add upload test route
@upload_router.get("/test")
async def test_upload():
    return {"message": "Upload router is working!"}

# Add file upload route
@upload_router.post("")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Add file upload logic here
        return {"filename": file.filename, "message": "File uploaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Register upload router
app.include_router(upload_router)
logger.info("Registered upload router at /api/upload")

# Register video router
app.include_router(video_router, prefix="/api/v1")
logger.info("Registered video router at /api/v1/video")
