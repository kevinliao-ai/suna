#!/bin/bash

# Railway startup script with robust port handling
set -e

# Set default port if not provided or invalid
if [ -z "$PORT" ] || ! [[ "$PORT" =~ ^[0-9]+$ ]]; then
    echo "PORT not set or invalid, using default port 8000"
    export PORT=8000
fi

echo "Starting Suna Backend on Railway..."
echo "Environment: ${ENV_MODE:-production}"
echo "Port: $PORT"
echo "Workers: ${WORKERS:-2}"

# Start the application
exec uv run gunicorn api:app \
  --workers ${WORKERS:-2} \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind "0.0.0.0:$PORT" \
  --timeout 300 \
  --graceful-timeout 120 \
  --keep-alive 300 \
  --max-requests 1000 \
  --max-requests-jitter 100 \
  --forwarded-allow-ips '*' \
  --worker-connections ${WORKER_CONNECTIONS:-1000} \
  --preload \
  --log-level info \
  --access-logfile - \
  --error-logfile -