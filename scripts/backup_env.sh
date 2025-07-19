#!/bin/bash

# Railway 环境变量备份脚本
echo "Backing up Railway environment variables..."

# 导出环境变量到文件
railway variables > env_backup_$(date +%Y%m%d_%H%M%S).txt

echo "Environment variables backed up successfully!"