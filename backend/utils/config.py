import logging
from typing import Optional

logger = logging.getLogger(__name__)

# 在 Configuration 类中，只保留最基本的配置项
class Configuration:
    # 基础配置
    ENV_MODE: str = "local"  # 使用字符串代替枚举
    
    # 必需的服务配置
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    
    # Redis 配置（如果不需要可以移除）
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = ""
    REDIS_SSL: bool = False  # 本地开发通常不需要SSL

    # 其他配置设为可选
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None

    def __init__(self):
        """Initialize configuration"""
        self._validate()

    def _validate(self):
        """只验证最基础的配置"""
        required_fields = [
            'SUPABASE_URL',
            'SUPABASE_ANON_KEY',
        ]
        
        missing = [f for f in required_fields if not getattr(self, f, None)]
        if missing:
            logger.warning(f"Missing recommended configuration: {', '.join(missing)}")

# 创建配置实例
config = Configuration()