#!/bin/bash

# Railway startup script with robust port handling
set -e

# Debug: Print all environment variables related to PORT
echo "=== Environment Debug ==="
echo "PORT environment variable: '$PORT'"
echo "All environment variables containing 'PORT':"
env | grep -i port || echo "No PORT-related environment variables found"
echo "========================="

# Set default port with multiple fallback strategies
if [ -z "$PORT" ]; then
    echo "PORT is empty, using default 8000"
    PORT=8000
elif ! echo "$PORT" | grep -qE '^[0-9]+$'; then
    echo "PORT '$PORT' is not a valid number, using default 8000"
    PORT=8000
elif [ "$PORT" -lt 1 ] || [ "$PORT" -gt 65535 ]; then
    echo "PORT '$PORT' is out of valid range, using default 8000"
    PORT=8000
fi

# Export the validated PORT
export PORT

echo "Starting Suna Backend on Railway..."
echo "Environment: ${ENV_MODE:-production}"
echo "Final Port: $PORT"
echo "Workers: ${WORKERS:-2}"

# Start the application with explicit port
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