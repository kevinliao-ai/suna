"""
Configuration management.

This module provides a centralized way to access configuration settings and
environment variables across the application.
"""

import os
import logging
from enum import Enum
from typing import Dict, Any, Optional, get_type_hints, Union
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

class EnvMode(Enum):
    """Environment mode enumeration."""
    LOCAL = "local"
    STAGING = "staging"
    PRODUCTION = "production"

class Configuration:
    """Centralized configuration management with environment variable support."""
    
    # Environment mode
    ENV_MODE: EnvMode = EnvMode.LOCAL
    
    # Required configuration (must be set in environment)
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    REDIS_HOST: str = ""
    REDIS_PASSWORD: str = ""
    
    # Optional configuration with defaults
    REDIS_PORT: int = 6379
    REDIS_SSL: bool = True
    
    # LLM API keys (optional)
    ANTHROPIC_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    OPENROUTER_API_KEY: Optional[str] = None
    OPENROUTER_API_BASE: str = "https://openrouter.ai/api/v1"
    
    # Daytona sandbox (optional)
    DAYTONA_API_KEY: Optional[str] = None
    DAYTONA_SERVER_URL: Optional[str] = None
    DAYTONA_TARGET: str = "default"
    
    # Other API keys (optional)
    TAVILY_API_KEY: Optional[str] = None
    RAPID_API_KEY: Optional[str] = None
    FIRECRAWL_API_KEY: Optional[str] = None
    FIRECRAWL_URL: str = "https://api.firecrawl.dev"
    
    # Stripe configuration (optional)
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    STRIPE_DEFAULT_PLAN_ID: Optional[str] = None
    STRIPE_DEFAULT_TRIAL_DAYS: int = 14

    def __init__(self):
        """Initialize configuration by loading from environment variables."""
        # Load environment variables from .env file if it exists
        load_dotenv()
        
        # Set environment mode
        self._set_environment_mode()
        
        # Load all configuration values
        self._load_config_values()
        
        # Validate required configuration
        self._validate()

    def _set_environment_mode(self):
        """Set the environment mode from environment variable."""
        env_mode_str = os.getenv("ENV_MODE", EnvMode.LOCAL.value)
        try:
            self.ENV_MODE = EnvMode(env_mode_str.lower())
        except ValueError:
            logger.warning(f"Invalid ENV_MODE: {env_mode_str}, defaulting to LOCAL")
            self.ENV_MODE = EnvMode.LOCAL
        logger.info(f"Environment mode: {self.ENV_MODE.value}")

    def _load_config_values(self):
        """Load configuration values from environment variables."""
        for key, default in self._get_config_defaults().items():
            env_val = os.getenv(key)
            
            if env_val is not None:
                # Convert to the correct type based on the default value's type
                if isinstance(default, bool):
                    setattr(self, key, env_val.lower() in ('true', 't', 'yes', 'y', '1'))
                elif isinstance(default, int):
                    try:
                        setattr(self, key, int(env_val))
                    except ValueError:
                        setattr(self, key, default)
                else:
                    setattr(self, key, env_val)
            elif getattr(self, key, None) is None:
                setattr(self, key, default)

    def _get_config_defaults(self) -> Dict[str, Any]:
        """Get default values for all configuration fields."""
        defaults = {}
        for key, value in get_type_hints(self.__class__).items():
            if key.startswith('_') or key in ['ENV_MODE']:
                continue
            defaults[key] = getattr(self, key, None)
        return defaults

    def _validate(self):
        """Validate required configuration values."""
        required_fields = [
            'SUPABASE_URL',
            'SUPABASE_ANON_KEY',
            'SUPABASE_SERVICE_ROLE_KEY',
            'REDIS_HOST',
            'REDIS_PASSWORD',
        ]
        
        missing = [field for field in required_fields if not getattr(self, field, None)]
        if missing:
            raise ValueError(f"Missing required configuration: {', '.join(missing)}")

# Create a singleton instance
config = Configuration()