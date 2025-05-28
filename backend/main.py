from fastapi import FastAPI, Request, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import APIRouter
import uvicorn
import logging
from pathlib import Path
import os
import sys
import uuid
from typing import Optional

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 创建 FastAPI 应用
app = FastAPI(
    title="AniSora API",
    description="API for AniSora video generation service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# 创建上传路由
upload_router = APIRouter(prefix="/api/upload", tags=["upload"])

# 添加上传测试路由
@upload_router.get("/test")
async def test_upload():
    return {"message": "Upload router is working!"}

# 添加上传文件路由
@upload_router.post("")
async def upload_file(file: UploadFile = File(...)):
    try:
        # 这里添加文件上传逻辑
        return {"filename": file.filename, "message": "File uploaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 注册路由
app.include_router(upload_router)
print("Registered upload router at /api/upload")

# 添加 CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# 添加健康检查端点
@app.get("/health")
async def health_check():
    return {"status": "ok"}

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
