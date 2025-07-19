#!/bin/bash

# Railway startup script with robust error handling
set -e

echo "=== Railway Startup Debug ==="
echo "Environment: ${ENV_MODE:-production}"
echo "PORT: ${PORT:-not_set}"
echo "Python version: $(python --version)"
echo "Working directory: $(pwd)"
echo "Files in directory:"
ls -la
echo "=========================="

# Set default port if not provided
if [ -z "$PORT" ]; then
    echo "PORT not set, using default 8000"
    PORT=8000
fi

# Validate port
if ! echo "$PORT" | grep -qE '^[0-9]+$'; then
    echo "Invalid PORT '$PORT', using 8000"
    PORT=8000
fi

echo "Final PORT: $PORT"

# Test if we can import the app
echo "Testing Python app import..."
if ! uv run python -c "import api; print('App import successful')"; then
    echo "ERROR: Failed to import app"
    exit 1
fi

echo "Starting Gunicorn server..."

# Start with minimal configuration first
exec uv run gunicorn api:app \
  --workers 1 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind "0.0.0.0:$PORT" \
  --timeout 120 \
  --log-level debug \
  --access-logfile - \
  --error-logfile -