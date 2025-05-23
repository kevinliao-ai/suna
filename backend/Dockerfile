# 使用最新的 Python 3.11 版本，并基于 Debian bookworm 以获得更好的安全更新
FROM python:3.11-slim-bookworm

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    ENV_MODE="production" \
    PYTHONPATH=/app

WORKDIR /app

# 更新系统包并安装依赖
RUN apt-get update && apt-get upgrade -y --no-install-recommends && \
    apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Create non-root user and set up directories
RUN useradd -m -u 1000 appuser && \
    mkdir -p /app/logs && \
    chown -R appuser:appuser /app

# Install Python dependencies
COPY --chown=appuser:appuser requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Switch to non-root user
USER appuser

# Copy application code
COPY --chown=appuser:appuser . .

# Expose the port the app runs on
EXPOSE 8000

# Calculate optimal worker count based on 16 vCPUs
# Using (2*CPU)+1 formula for CPU-bound applications
ENV WORKERS=33
ENV THREADS=2
ENV WORKER_CONNECTIONS=2000

# Set default port if not provided
ENV PORT=8000

# Gunicorn configuration
CMD exec gunicorn api:app \
    --workers $WORKERS \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:${PORT:-8000} \
    --timeout 1800 \
    --graceful-timeout 600 \
    --keep-alive 1800 \
     --max-requests 0 \
     --max-requests-jitter 0 \
     --forwarded-allow-ips '*' \
     --worker-connections $WORKER_CONNECTIONS \
     --worker-tmp-dir /dev/shm \
     --preload \
     --log-level info \
     --access-logfile - \
     --error-logfile - \
     --capture-output \
     --enable-stdio-inheritance \
     --threads $THREADS"]
