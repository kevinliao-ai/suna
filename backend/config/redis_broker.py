"""
Redis broker configuration for DigitalOcean deployment
替代 RabbitMQ 使用 Redis 作为消息队列
"""
import dramatiq
from dramatiq.brokers.redis import RedisBroker
from utils.config import config

# 配置 Redis 作为 Dramatiq 的消息代理
redis_broker = RedisBroker(
    host=config.REDIS_HOST,
    port=config.REDIS_PORT,
    password=config.REDIS_PASSWORD,
    db=1,  # 使用 db=1 用于消息队列，db=0 用于缓存
)

dramatiq.set_broker(redis_broker)