#!/bin/bash

# Railway startup script
set -e

echo "Starting Suna Backend on Railway..."
echo "Environment: $ENV_MODE"
echo "Port: $PORT"

# Start the application
exec uv run gunicorn api:app \
  --workers 2 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:$PORT \
  --timeout 300 \
  --graceful-timeout 120 \
  --keep-alive 300 \
  --max-requests 1000 \
  --max-requests-jitter 100 \
  --forwarded-allow-ips '*' \
  --worker-connections 1000 \
  --preload \
  --log-level info \
  --access-logfile - \
  --error-logfile -