import logging
import os
from typing import Optional
from enum import Enum

logger = logging.getLogger(__name__)

class EnvMode(Enum):
    LOCAL = "local"
    STAGING = "staging"
    PRODUCTION = "production"

# 在 Configuration 类中，只保留最基本的配置项
class Configuration:
    """
    Centralized configuration for AgentPress backend.
    
    This class loads environment variables and provides type checking and validation.
    Default values can be specified for optional configuration items.
    """
    
    # Environment mode
    ENV_MODE: EnvMode = EnvMode.LOCAL
    
    # Subscription tier IDs - Production
    STRIPE_FREE_TIER_ID_PROD: str = 'price_1RILb4G6l1KZGqIrK4QLrx9i'
    STRIPE_TIER_2_20_ID_PROD: str = 'price_1RILb4G6l1KZGqIrhomjgDnO'
    STRIPE_TIER_6_50_ID_PROD: str = 'price_1RILb4G6l1KZGqIr5q0sybWn'
    STRIPE_TIER_12_100_ID_PROD: str = 'price_1RILb4G6l1KZGqIr5Y20ZLHm'
    STRIPE_TIER_25_200_ID_PROD: str = 'price_1RILb4G6l1KZGqIrGAD8rNjb'
    STRIPE_TIER_50_400_ID_PROD: str = 'price_1RILb4G6l1KZGqIruNBUMTF1'
    STRIPE_TIER_125_800_ID_PROD: str = 'price_1RILb3G6l1KZGqIrbJA766tN'
    STRIPE_TIER_200_1000_ID_PROD: str = 'price_1RILb3G6l1KZGqIrmauYPOiN'
    
    # Yearly subscription tier IDs - Production (15% discount)
    STRIPE_TIER_2_20_YEARLY_ID_PROD: str = 'price_1ReHB5G6l1KZGqIrD70I1xqM'
    STRIPE_TIER_6_50_YEARLY_ID_PROD: str = 'price_1ReHAsG6l1KZGqIrlAog487C'
    STRIPE_TIER_12_100_YEARLY_ID_PROD: str = 'price_1ReHAWG6l1KZGqIrBHer2PQc'
    STRIPE_TIER_25_200_YEARLY_ID_PROD: str = 'price_1ReH9uG6l1KZGqIrsvMLHViC'
    STRIPE_TIER_50_400_YEARLY_ID_PROD: str = 'price_1ReH9fG6l1KZGqIrsPtu5KIA'
    STRIPE_TIER_125_800_YEARLY_ID_PROD: str = 'price_1ReH9GG6l1KZGqIrfgqaJyat'
    STRIPE_TIER_200_1000_YEARLY_ID_PROD: str = 'price_1ReH8qG6l1KZGqIrK1akY90q'
    
    # Subscription tier IDs - Staging
    STRIPE_FREE_TIER_ID_STAGING: str = 'price_1RIGvuG6l1KZGqIrw14abxeL'
    STRIPE_TIER_2_20_ID_STAGING: str = 'price_1RIGvuG6l1KZGqIrCRu0E4Gi'
    STRIPE_TIER_6_50_ID_STAGING: str = 'price_1RIGvuG6l1KZGqIrvjlz5p5V'
    STRIPE_TIER_12_100_ID_STAGING: str = 'price_1RIGvuG6l1KZGqIrT6UfgblC'
    STRIPE_TIER_25_200_ID_STAGING: str = 'price_1RIGvuG6l1KZGqIrOVLKlOMj'
    STRIPE_TIER_50_400_ID_STAGING: str = 'price_1RIKNgG6l1KZGqIrvsat5PW7'
    STRIPE_TIER_125_800_ID_STAGING: str = 'price_1RIKNrG6l1KZGqIrjKT0yGvI'
    STRIPE_TIER_200_1000_ID_STAGING: str = 'price_1RIKQ2G6l1KZGqIrum9n8SI7'
    
    # Yearly subscription tier IDs - Staging (15% discount)
    STRIPE_TIER_2_20_YEARLY_ID_STAGING: str = 'price_1ReGogG6l1KZGqIrEyBTmtPk'
    STRIPE_TIER_6_50_YEARLY_ID_STAGING: str = 'price_1ReGoJG6l1KZGqIr0DJWtoOc'
    STRIPE_TIER_12_100_YEARLY_ID_STAGING: str = 'price_1ReGnZG6l1KZGqIr0ThLEl5S'
    STRIPE_TIER_25_200_YEARLY_ID_STAGING: str = 'price_1ReGmzG6l1KZGqIre31mqoEJ'
    STRIPE_TIER_50_400_YEARLY_ID_STAGING: str = 'price_1ReGmgG6l1KZGqIrn5nBc7e5'
    STRIPE_TIER_125_800_YEARLY_ID_STAGING: str = 'price_1ReGmMG6l1KZGqIrvE2ycrAX'
    STRIPE_TIER_200_1000_YEARLY_ID_STAGING: str = 'price_1ReGlXG6l1KZGqIrlgurP5GU'
    
    # Computed subscription tier IDs based on environment
    @property
    def STRIPE_FREE_TIER_ID(self) -> str:
        if self.ENV_MODE == EnvMode.STAGING:
            return self.STRIPE_FREE_TIER_ID_STAGING
        return self.STRIPE_FREE_TIER_ID_PROD
    
    @property
    def STRIPE_TIER_2_20_ID(self) -> str:
        if self.ENV_MODE == EnvMode.STAGING:
            return self.STRIPE_TIER_2_20_ID_STAGING
        return self.STRIPE_TIER_2_20_ID_PROD
    
    @property
    def STRIPE_TIER_6_50_ID(self) -> str:
        if self.ENV_MODE == EnvMode.STAGING:
            return self.STRIPE_TIER_6_50_ID_STAGING
        return self.STRIPE_TIER_6_50_ID_PROD
    
    @property
    def STRIPE_TIER_12_100_ID(self) -> str:
        if self.ENV_MODE == EnvMode.STAGING:
            return self.STRIPE_TIER_12_100_ID_STAGING
        return self.STRIPE_TIER_12_100_ID_PROD
    
    @property
    def STRIPE_TIER_25_200_ID(self) -> str:
        if self.ENV_MODE == EnvMode.STAGING:
            return self.STRIPE_TIER_25_200_ID_STAGING
        return self.STRIPE_TIER_25_200_ID_PROD
    
    @property
    def STRIPE_TIER_50_400_ID(self) -> str:
        if self.ENV_MODE == EnvMode.STAGING:
            return self.STRIPE_TIER_50_400_ID_STAGING
        return self.STRIPE_TIER_50_400_ID_PROD
    
    @property
    def STRIPE_TIER_125_800_ID(self) -> str:
        if self.ENV_MODE == EnvMode.STAGING:
            return self.STRIPE_TIER_125_800_ID_STAGING
        return self.STRIPE_TIER_125_800_ID_PROD
    
    @property
    def STRIPE_TIER_200_1000_ID(self) -> str:
        if self.ENV_MODE == EnvMode.STAGING:
            return self.STRIPE_TIER_200_1000_ID_STAGING
        return self.STRIPE_TIER_200_1000_ID_PROD
    
    # Yearly tier computed properties
    @property
    def STRIPE_TIER_2_20_YEARLY_ID(self) -> str:
        if self.ENV_MODE == EnvMode.STAGING:
            return self.STRIPE_TIER_2_20_YEARLY_ID_STAGING
        return self.STRIPE_TIER_2_20_YEARLY_ID_PROD
    
    @property
    def STRIPE_TIER_6_50_YEARLY_ID(self) -> str:
        if self.ENV_MODE == EnvMode.STAGING:
            return self.STRIPE_TIER_6_50_YEARLY_ID_STAGING
        return self.STRIPE_TIER_6_50_YEARLY_ID_PROD
    
    @property
    def STRIPE_TIER_12_100_YEARLY_ID(self) -> str:
        if self.ENV_MODE == EnvMode.STAGING:
            return self.STRIPE_TIER_12_100_YEARLY_ID_STAGING
        return self.STRIPE_TIER_12_100_YEARLY_ID_PROD
    
    @property
    def STRIPE_TIER_25_200_YEARLY_ID(self) -> str:
        if self.ENV_MODE == EnvMode.STAGING:
            return self.STRIPE_TIER_25_200_YEARLY_ID_STAGING
        return self.STRIPE_TIER_25_200_YEARLY_ID_PROD
    
    @property
    def STRIPE_TIER_50_400_YEARLY_ID(self) -> str:
        if self.ENV_MODE == EnvMode.STAGING:
            return self.STRIPE_TIER_50_400_YEARLY_ID_STAGING
        return self.STRIPE_TIER_50_400_YEARLY_ID_PROD
    
    @property
    def STRIPE_TIER_125_800_YEARLY_ID(self) -> str:
        if self.ENV_MODE == EnvMode.STAGING:
            return self.STRIPE_TIER_125_800_YEARLY_ID_STAGING
        return self.STRIPE_TIER_125_800_YEARLY_ID_PROD
    
    @property
    def STRIPE_TIER_200_1000_YEARLY_ID(self) -> str:
        if self.ENV_MODE == EnvMode.STAGING:
            return self.STRIPE_TIER_200_1000_YEARLY_ID_STAGING
        return self.STRIPE_TIER_200_1000_YEARLY_ID_PROD
    
    # LLM API keys
    ANTHROPIC_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    OPENROUTER_API_KEY: Optional[str] = None
    XAI_API_KEY: Optional[str] = None
    OPENROUTER_API_BASE: Optional[str] = "https://openrouter.ai/api/v1"
    OR_SITE_URL: Optional[str] = "https://kortix.ai"
    OR_APP_NAME: Optional[str] = "Kortix AI"    
    
    # AWS Bedrock credentials
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION_NAME: Optional[str] = None
    
    # Model configuration
    MODEL_TO_USE: Optional[str] = "anthropic/claude-sonnet-4-20250514"
    
    # Supabase configuration
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str
    
    # Redis configuration
    REDIS_HOST: str
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: Optional[str] = None
    REDIS_SSL: bool = True
    
    # Daytona sandbox configuration
    DAYTONA_API_KEY: Optional[str] = None
    DAYTONA_SERVER_URL: Optional[str] = None
    DAYTONA_TARGET: Optional[str] = None
    
    # Search and other API keys
    TAVILY_API_KEY: str
    RAPID_API_KEY: str
    CLOUDFLARE_API_TOKEN: Optional[str] = None
    FIRECRAWL_API_KEY: str
    FIRECRAWL_URL: Optional[str] = "https://api.firecrawl.dev"
    
    # Stripe configuration
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    STRIPE_DEFAULT_PLAN_ID: Optional[str] = None
    STRIPE_DEFAULT_TRIAL_DAYS: int = 14
    
    # Stripe Product IDs
    STRIPE_PRODUCT_ID_PROD: str = 'prod_SCl7AQ2C8kK1CD'
    STRIPE_PRODUCT_ID_STAGING: str = 'prod_SCgIj3G7yPOAWY'
    
    # Sandbox configuration
    SANDBOX_IMAGE_NAME = "kortix/suna:0.1.3"
    SANDBOX_ENTRYPOINT = "/usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf"

    # LangFuse configuration
    LANGFUSE_PUBLIC_KEY: Optional[str] = None
    LANGFUSE_SECRET_KEY: Optional[str] = None
    LANGFUSE_HOST: str = "https://cloud.langfuse.com"

    # Admin API key for server-side operations
    ADMIN_API_KEY: Optional[str] = None
    
    @property
    def STRIPE_PRODUCT_ID(self) -> str:
        if self.ENV_MODE == EnvMode.STAGING:
            return self.STRIPE_PRODUCT_ID_STAGING
        return self.STRIPE_PRODUCT_ID_PROD
    
    def __init__(self):
        """Initialize configuration from environment variables"""
        self._load_from_env()
        self._validate()
    
    def _load_from_env(self):
        """Load configuration values from environment variables"""
        # Environment mode
        env_mode_str = os.getenv("ENV_MODE", "local").lower()
        try:
            self.ENV_MODE = EnvMode(env_mode_str)
        except ValueError:
            logger.warning(f"Invalid ENV_MODE '{env_mode_str}', defaulting to LOCAL")
            self.ENV_MODE = EnvMode.LOCAL
        
        # Supabase configuration (required)
        self.SUPABASE_URL = os.getenv("SUPABASE_URL", "")
        self.SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
        self.SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        
        # Redis configuration
        self.REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
        self.REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
        self.REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")
        self.REDIS_SSL = os.getenv("REDIS_SSL", "false").lower() == "true"
        
        # RabbitMQ configuration
        self.RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
        self.RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", "5672"))
        
        # LLM API keys
        self.ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
        self.OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
        self.GROQ_API_KEY = os.getenv("GROQ_API_KEY")
        self.OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
        self.XAI_API_KEY = os.getenv("XAI_API_KEY")
        
        # AWS credentials
        self.AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
        self.AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
        self.AWS_REGION_NAME = os.getenv("AWS_REGION_NAME")
        
        # Model configuration
        self.MODEL_TO_USE = os.getenv("MODEL_TO_USE", "anthropic/claude-sonnet-4-20250514")
        
        # Daytona sandbox configuration
        self.DAYTONA_API_KEY = os.getenv("DAYTONA_API_KEY")
        self.DAYTONA_SERVER_URL = os.getenv("DAYTONA_SERVER_URL")
        self.DAYTONA_TARGET = os.getenv("DAYTONA_TARGET")
        
        # Search and other API keys
        self.TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")
        self.RAPID_API_KEY = os.getenv("RAPID_API_KEY", "")
        self.CLOUDFLARE_API_TOKEN = os.getenv("CLOUDFLARE_API_TOKEN")
        self.FIRECRAWL_API_KEY = os.getenv("FIRECRAWL_API_KEY", "")
        self.FIRECRAWL_URL = os.getenv("FIRECRAWL_URL", "https://api.firecrawl.dev")
        
        # Stripe configuration
        self.STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
        self.STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
        self.STRIPE_DEFAULT_PLAN_ID = os.getenv("STRIPE_DEFAULT_PLAN_ID")
        
        # LangFuse configuration
        self.LANGFUSE_PUBLIC_KEY = os.getenv("LANGFUSE_PUBLIC_KEY")
        self.LANGFUSE_SECRET_KEY = os.getenv("LANGFUSE_SECRET_KEY")
        self.LANGFUSE_HOST = os.getenv("LANGFUSE_HOST", "https://cloud.langfuse.com")
        
        # Admin API key
        self.ADMIN_API_KEY = os.getenv("ADMIN_API_KEY")

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