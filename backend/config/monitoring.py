"""
监控和错误追踪配置
"""
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.redis import RedisIntegration
from utils.config import config

def setup_monitoring():
    """设置监控和错误追踪"""
    if config.ENV_MODE == "production":
        sentry_sdk.init(
            dsn=config.SENTRY_DSN,  # 需要在环境变量中设置
            integrations=[
                FastApiIntegration(auto_enabling_integrations=False),
                RedisIntegration(),
            ],
            traces_sample_rate=0.1,  # 10% 的请求进行性能追踪
            environment=config.ENV_MODE,
        )

# 健康检查端点增强
async def enhanced_health_check():
    """增强的健康检查"""
    try:
        # 检查数据库连接
        from services.supabase import DBConnection
        db = DBConnection()
        await db.initialize()
        
        # 检查 Redis 连接
        from services import redis
        redis_client = await redis.get_client()
        await redis_client.ping()
        
        return {
            "status": "healthy",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "services": {
                "database": "healthy",
                "redis": "healthy"
            }
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }