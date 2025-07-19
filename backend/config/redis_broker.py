"""
Redis broker configuration for Railway deployment
替代 RabbitMQ 使用 Redis 作为消息队列
"""
import dramatiq
from dramatiq.brokers.redis import RedisBroker
from utils.config import config
import os

# 配置 Redis 作为 Dramatiq 的消息代理
def setup_redis_broker():
    """设置 Redis 作为 Dramatiq 消息代理"""
    
    # Railway 可能提供 REDIS_URL 或单独的连接参数
    redis_url = os.getenv('REDIS_URL')
    
    if redis_url:
        # 使用 REDIS_URL 连接
        redis_broker = RedisBroker(url=redis_url, db=1)
    else:
        # 使用单独的连接参数
        redis_broker = RedisBroker(
            host=config.REDIS_HOST,
            port=config.REDIS_PORT,
            password=config.REDIS_PASSWORD,
            db=1,  # 使用 db=1 用于消息队列，db=0 用于缓存
        )
    
    dramatiq.set_broker(redis_broker)
    return redis_broker

# 初始化 broker
setup_redis_broker()