# Design Document

## Overview

本设计文档描述了如何修复 Suna 后端项目中的 Python 依赖版本兼容性问题。主要问题是当前的 Python 版本要求 `>=3.11` 没有设置上限，与 langfuse 包的要求 `<4.0,>=3.9` 产生冲突。

## Architecture

### 当前问题分析

1. **版本冲突根源**：
   - 项目要求：`requires-python = ">=3.11"`
   - langfuse 要求：`Python <4.0,>=3.9`
   - 冲突：没有明确的上限导致依赖解析器无法确定兼容范围

2. **影响范围**：
   - 开发环境设置
   - CI/CD 流水线
   - Docker 构建
   - 生产部署

### 解决方案架构

```
Python Version Management
├── pyproject.toml (主配置)
├── Dockerfile (容器环境)
├── README.md (文档更新)
└── CI/CD 配置 (如果存在)
```

## Components and Interfaces

### 1. Python 版本范围定义

**组件**: `pyproject.toml` 配置更新
- **输入**: 当前的版本要求和依赖列表
- **输出**: 兼容的 Python 版本范围
- **接口**: 标准 PEP 621 项目配置格式

### 2. 依赖兼容性验证

**组件**: 依赖包版本检查
- **输入**: 所有项目依赖及其版本要求
- **输出**: 兼容性报告和建议的版本范围
- **接口**: 包管理器 (uv/pip) 依赖解析

### 3. 文档同步更新

**组件**: 项目文档更新
- **输入**: 新的 Python 版本要求
- **输出**: 更新的 README 和相关文档
- **接口**: Markdown 文档格式

## Data Models

### Python 版本配置模型

```toml
[project]
requires-python = ">=3.11,<4.0"  # 明确的版本范围
```

### 依赖包模型

```toml
dependencies = [
    "langfuse==2.60.5",  # 兼容 Python >=3.9,<4.0
    # 其他依赖保持不变
]
```

## Error Handling

### 1. 版本冲突处理

- **检测**: 在依赖安装前进行版本兼容性检查
- **报告**: 提供清晰的错误信息和解决建议
- **恢复**: 提供回退到已知工作版本的机制

### 2. 构建失败处理

- **Docker 构建**: 确保容器使用正确的 Python 版本
- **CI/CD**: 在自动化流水线中验证版本兼容性
- **本地开发**: 提供环境设置指南

## Testing Strategy

### 1. 依赖安装测试

```bash
# 测试依赖安装
uv sync --locked
pip install -r requirements.txt
```

### 2. 版本兼容性测试

```bash
# 测试不同 Python 版本
python3.11 -m pytest
python3.12 -m pytest
```

### 3. 构建测试

```bash
# 测试 Docker 构建
docker build -t suna-backend .
docker run --rm suna-backend python --version
```

## Implementation Plan

### Phase 1: 配置文件修复
1. 更新 `pyproject.toml` 中的 Python 版本要求
2. 验证所有依赖包的兼容性
3. 测试依赖安装过程

### Phase 2: 环境验证
1. 更新 Dockerfile 确保使用正确的 Python 版本
2. 测试 Docker 构建过程
3. 验证应用启动和基本功能

### Phase 3: 文档更新
1. 更新 README.md 中的 Python 版本要求
2. 更新安装说明
3. 添加故障排除指南

## Risk Assessment

### 低风险
- 配置文件更新：简单的文本修改
- 文档更新：不影响代码功能

### 中等风险
- 依赖版本变更：可能影响现有功能
- Python 版本限制：可能影响部署环境

### 缓解策略
- 在测试环境中先验证所有更改
- 保留原始配置文件的备份
- 分阶段部署更改