FROM python:3.11-slim

# 设置环境变量
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    ENV_MODE="production" \
    PYTHONPATH=/app \
    WORKERS=33 \
    THREADS=2 \
    WORKER_CONNECTIONS=2000

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 创建非 root 用户并设置目录
RUN useradd -m -u 1000 appuser && \
    mkdir -p /app/logs && \
    chown -R appuser:appuser /app

# 安装 Python 依赖
COPY --chown=appuser:appuser requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# 切换到非 root 用户
USER appuser

# 复制应用代码
COPY --chown=appuser:appuser . .

# 暴露应用运行的端口
EXPOSE 8000

# 使用 shell 形式的 CMD 指令，确保环境变量被正确解析
CMD sh -c "gunicorn api:app \
     --workers ${WORKERS} \
     --worker-class uvicorn.workers.UvicornWorker \
     --bind 0.0.0.0:${PORT:-8000} \
     --timeout 1800 \
     --graceful-timeout 600 \
     --keep-alive 1800 \
     --max-requests 0 \
     --max-requests-jitter 0 \
     --forwarded-allow-ips '*' \
     --worker-connections ${WORKER_CONNECTIONS} \
     --worker-tmp-dir /dev/shm \
     --preload \
     --log-level info \
     --access-logfile - \
     --error-logfile - \
     --capture-output \
     --enable-stdio-inheritance \
     --threads ${THREADS}"
