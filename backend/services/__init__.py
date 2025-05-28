"""
Services package for the AniSora API.
"""

from .video import router as video_router

__all__ = [
    'video_router',
]
