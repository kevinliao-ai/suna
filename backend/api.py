from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.video import router as video_router

app = FastAPI(
    title="AniSora API",
    description="API for AniSora video generation platform",
    version="1.0.0"
)

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to specific domains
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有方法
    allow_headers=["*"],  # 允许所有头
)

# Include routers
app.include_router(video_router)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "AniSora API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

# 其他路由可以根据需要逐步添加