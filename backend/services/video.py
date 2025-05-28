from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordBearer
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid
import logging
import time
import os
import json
from enum import Enum

from pydantic import BaseModel, Field, validator

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/video", tags=["video"])

# In-memory storage for video generations (replace with database in production)
video_generations: Dict[str, Dict[str, Any]] = {}

class GenerationStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class VideoGenerationRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=1000, description="Text prompt for video generation")
    duration: float = Field(4.0, ge=1.0, le=10.0, description="Duration of the video in seconds")
    motion: float = Field(1.0, ge=0.1, le=2.0, description="Motion intensity")
    speed: str = Field("normal", description="Generation speed (normal/fast)")
    image_url: Optional[str] = Field(None, description="Optional image URL for image-to-video")
    model_id: str = Field("anime-video", description="ID of the model to use for generation")
    is_public: bool = Field(False, description="Whether the generation is public")
    
    @validator('speed')
    def validate_speed(cls, v):
        if v not in ["normal", "fast"]:
            raise ValueError("Speed must be either 'normal' or 'fast'")
        return v

class VideoGenerationResponse(BaseModel):
    id: str
    status: GenerationStatus
    created_at: datetime
    prompt: str
    duration: float
    motion: float
    speed: str
    model_id: str
    is_public: bool
    progress: float = 0.0
    result_url: Optional[str] = None
    seed_used: Optional[int] = None
    error: Optional[str] = None
    
    class Config:
        use_enum_values = True

def process_video_generation(generation_id: str, request: VideoGenerationRequest):
    """Background task to process video generation"""
    try:
        # Update status to processing
        video_generations[generation_id].update({
            "status": GenerationStatus.PROCESSING,
            "progress": 10.0,
            "started_at": datetime.utcnow()
        })
        
        # Simulate video generation process
        for i in range(10, 100, 5):
            time.sleep(1)  # Simulate processing time
            video_generations[generation_id].update({
                "progress": float(i) + 5.0,
                "status": GenerationStatus.PROCESSING
            })
        
        # Mark as completed with a dummy URL
        video_generations[generation_id].update({
            "status": GenerationStatus.COMPLETED,
            "progress": 100.0,
            "completed_at": datetime.utcnow(),
            "result_url": f"https://example.com/generated/{generation_id}.mp4",
            "seed_used": 42  # Example seed
        })
        
    except Exception as e:
        logger.error(f"Error in video generation task: {str(e)}")
        video_generations[generation_id].update({
            "status": GenerationStatus.FAILED,
            "error": str(e),
            "completed_at": datetime.utcnow()
        })

@router.post("/generate", response_model=VideoGenerationResponse, status_code=status.HTTP_202_ACCEPTED)
async def generate_video(
    request: VideoGenerationRequest,
    background_tasks: BackgroundTasks
):
    """
    Generate a new video based on the provided prompt and parameters
    """
    try:
        # Generate a unique ID for this generation
        generation_id = str(uuid.uuid4())
        created_at = datetime.utcnow()
        
        # Create the generation record
        generation = {
            "id": generation_id,
            "status": GenerationStatus.PENDING,
            "created_at": created_at,
            "prompt": request.prompt,
            "duration": request.duration,
            "motion": request.motion,
            "speed": request.speed,
            "model_id": request.model_id,
            "is_public": request.is_public,
            "progress": 0.0,
            "result_url": None,
            "seed_used": None,
            "error": None
        }
        
        # Store the generation (in-memory for now)
        video_generations[generation_id] = generation
        
        # Start background task for video generation
        background_tasks.add_task(process_video_generation, generation_id, request)
        
        return VideoGenerationResponse(**generation)
        
    except Exception as e:
        logger.error(f"Error generating video: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/status/{generation_id}", response_model=VideoGenerationResponse)
async def get_generation_status(generation_id: str):
    """
    Get the status of a video generation
    """
    if generation_id not in video_generations:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Generation not found"
        )
    
    generation = video_generations[generation_id]
    
    # Clean up old completed/failed generations (after 1 hour)
    if generation["status"] in [GenerationStatus.COMPLETED, GenerationStatus.FAILED]:
        completed_time = generation.get("completed_at", datetime.utcnow())
        if datetime.utcnow() - completed_time > timedelta(hours=1):
            video_generations.pop(generation_id, None)
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="Generation result has expired"
            )
    
    return VideoGenerationResponse(**generation)

@router.get("/recent", response_model=List[VideoGenerationResponse])
async def get_recent_generations(limit: int = 10):
    """
    Get recent video generations
    """
    generations = sorted(
        video_generations.values(),
        key=lambda x: x["created_at"],
        reverse=True
    )[:limit]
    
    return [VideoGenerationResponse(**gen) for gen in generations]

@router.get("/models", response_model=List[dict])
async def list_models():
    """
    List all available video generation models
    """
    return [
        {
            "id": "animesora-v1",
            "name": "AnimeSora V1",
            "description": "Anime style video generation",
            "is_recommended": True
        },
        {
            "id": "realsora-v1",
            "name": "RealSora V1",
            "description": "Realistic style video generation",
            "is_recommended": False
        },
        {
            "id": "pixsora-v1",
            "name": "PixSora V1",
            "description": "Pixar style animation generation",
            "is_recommended": False
        }
    ]
