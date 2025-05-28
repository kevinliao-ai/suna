import os
import sys
import uuid
from datetime import datetime
from typing import Optional
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, status

# 打印当前文件路径
print(f"Loading upload.py from: {os.path.abspath(__file__)}")

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

try:
    # 创建路由
    router = APIRouter(prefix="/api/upload", tags=["upload"])
    print(f"Successfully created router with prefix: {router.prefix}")
    
    # 打印路由信息
    print(f"Router tags: {router.tags}")
    print(f"Router prefix: {router.prefix}")
    print(f"Router routes: {getattr(router, 'routes', [])}")
    
except Exception as e:
    print(f"Error creating router: {e}")
    import traceback
    traceback.print_exc()
    raise

# 添加一个测试路由
@router.get("/test", summary="测试上传路由是否工作")
async def test_upload():
    """测试上传路由是否正常工作"""
    return {"message": "Upload router is working!"}

# Configuration
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
UPLOAD_DIR = "uploads"

# Ensure upload directory exists with proper permissions
os.makedirs(UPLOAD_DIR, exist_ok=True, mode=0o755)
print(f"Created upload directory at: {os.path.abspath(UPLOAD_DIR)}")

def allowed_file(filename: str) -> bool:
    """Check if the file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@router.post("", status_code=status.HTTP_201_CREATED, response_model=dict)
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a file to the server
    """
    try:
        logger.info(f"Received file upload request for file: {file.filename}")
        
        # Reset file pointer
        await file.seek(0, 2)  # Go to end of file to get size
        file_size = file.tell()
        await file.seek(0)  # Reset file pointer to start
        
        logger.info(f"File size: {file_size} bytes")
        # Validate file
        if not file.filename or not allowed_file(file.filename):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        
        # Check file size
        file.file.seek(0, 2)  # Go to end of file
        file_size = file.file.tell()
        file.file.seek(0)  # Reset file pointer
        
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Max size: {MAX_FILE_SIZE / (1024 * 1024)}MB"
            )
        
        # Generate unique filename
        file_ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        if not file_ext or file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
            )
            
        filename = f"{uuid.uuid4()}.{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        logger.info(f"Saving file to: {file_path}")
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # In a production environment, you would upload to S3 or similar storage
        # For local development, we'll return a relative URL that will be served by FastAPI
        file_url = f"/uploads/{filename}"
        logger.info(f"File uploaded successfully. URL: {file_url}")
        
        return {
            "url": file_url,
            "filename": file.filename,
            "size": file_size,
            "content_type": file.content_type,
            "uploaded_at": datetime.utcnow().isoformat()
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload file"
        )
