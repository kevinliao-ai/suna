from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordBearer
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime, timedelta
import uuid
import logging
import time
import os
import json
import shutil
import tempfile
from enum import Enum
from urllib.parse import urlparse
import requests
from gradio_client import Client, handle_file

from pydantic import BaseModel, Field, validator

# Configure AniSora API
ANISORA_API_URL = "https://bilibili-index-anisora.ms.show/"

# Configure generated videos directory
GENERATED_VIDEOS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'generated_videos')
os.makedirs(GENERATED_VIDEOS_DIR, exist_ok=True)

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
    image_url: Optional[str] = Field(None, description="URL of the input image for image-to-video generation (optional)")
    seed: int = Field(233, ge=-1, description="Random seed, -1 for random")
    duration: float = Field(4.0, ge=1.0, le=10.0, description="Duration of the video in seconds")
    speed: Literal["原版", "加速版", "fast", "normal"] = Field("normal", description="Generation speed")
    motion: float = Field(1.0, ge=0.1, le=2.0, description="Motion intensity")
    model_id: str = Field("anime-video", description="ID of the model to use for generation")
    is_public: bool = Field(False, description="Whether the generation is public")
    
    @validator('speed')
    def validate_speed(cls, v):
        if v not in ["原版", "加速版", "fast", "normal"]:
            raise ValueError("Speed must be one of: '原版', '加速版', 'fast', 'normal'")
        return v
        
    @validator('prompt')
    def validate_prompt_length(cls, v):
        if len(v) > 200:
            raise ValueError("Prompt must be 200 characters or less")
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

def download_file(url: str, save_path: str) -> None:
    """Download a file from URL to the specified path"""
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        with open(save_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
                
    except Exception as e:
        logger.error(f"Error downloading file from {url}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to download file from URL: {str(e)}"
        )

def process_video_generation(generation_id: str, request: VideoGenerationRequest):
    """Background task to process video generation using AniSora API"""
    try:
        # Update status to processing
        video_generations[generation_id].update({
            "status": GenerationStatus.PROCESSING,
            "progress": 10.0,
            "started_at": datetime.utcnow()
        })
        
        # Download image if URL is provided
        temp_img_path = None
        if request.image_url:
            temp_img_path = os.path.join(tempfile.gettempdir(), f"temp_{generation_id}.png")
            download_file(request.image_url, temp_img_path)
            
            # Update progress
            video_generations[generation_id].update({
                "progress": 30.0,
                "status": GenerationStatus.PROCESSING
            })
        
        try:
            # Initialize AniSora client
            client = Client(ANISORA_API_URL)
            
            # Prepare parameters
            params = {
                "prompt": request.prompt,
                "seed": request.seed if request.seed != -1 else int(datetime.now().timestamp()) % 1000000,
                "duration": request.duration,
                "speed": request.speed,
                "motion": request.motion,
                "is_public": request.is_public
            }
            
            # Add image if available
            if temp_img_path:
                params["image"] = handle_file(temp_img_path)
            
            # Call AniSora API
            result = client.predict(**params, api_name="/generate_i2v")
            
            # Update progress
            video_generations[generation_id].update({
                "progress": 90.0,
                "status": GenerationStatus.PROCESSING
            })
            
            # Save the generated video
            if isinstance(result, (list, tuple)) and len(result) > 0 and hasattr(result[0], 'name'):
                video_path = result[0].name
                video_filename = f"{generation_id}.mp4"
                output_path = os.path.join(GENERATED_VIDEOS_DIR, video_filename)
                shutil.move(video_path, output_path)
                
                # Update with completion status
                video_generations[generation_id].update({
                    "status": GenerationStatus.COMPLETED,
                    "progress": 100.0,
                    "completed_at": datetime.utcnow(),
                    "result_url": f"/generated_videos/{video_filename}",
                    "seed_used": request.seed
                })
            else:
                raise ValueError("Invalid response from AniSora API")
                
        except Exception as e:
            logger.error(f"Error calling AniSora API: {str(e)}")
            video_generations[generation_id].update({
                "status": GenerationStatus.FAILED,
                "error": str(e),
                "completed_at": datetime.utcnow()
            })
            
        finally:
            # Clean up temporary files
            if temp_img_path and os.path.exists(temp_img_path):
                try:
                    os.remove(temp_img_path)
                except Exception as e:
                    logger.warning(f"Failed to remove temporary file {temp_img_path}: {str(e)}")
        
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
    # Generate a unique ID for this generation
    generation_id = str(uuid.uuid4())
    
    # Create initial generation record
    video_generations[generation_id] = {
        "id": generation_id,
        "status": GenerationStatus.PENDING,
        "created_at": datetime.utcnow(),
        "prompt": request.prompt,
        "duration": request.duration,
        "motion": request.motion,
        "speed": request.speed,
        "model_id": request.model_id,
        "is_public": request.is_public,
        "progress": 0.0
    }
    
    # Start the background task
    background_tasks.add_task(process_video_generation, generation_id, request)
    
    # Return the initial response
    return VideoGenerationResponse(**video_generations[generation_id])

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
    
    # Clean up old completed/failed generations (after 1 hour)
    generation = video_generations[generation_id]
    if generation["status"] in [GenerationStatus.COMPLETED, GenerationStatus.FAILED]:
        completed_time = generation.get("completed_at", datetime.utcnow())
        if datetime.utcnow() - completed_time > timedelta(hours=1):
            video_generations.pop(generation_id, None)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
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
            "id": "anime-video",
            "name": "Anime Video",
            "description": "Anime-style video generation model",
            "supports_image_input": True
        },
        {
            "id": "realistic-video",
            "name": "Realistic Video",
            "description": "Realistic video generation model",
            "supports_image_input": False
        }
    ]
