#!/usr/bin/env python3
"""
生成用于 MCP 凭据加密的密钥
"""
from cryptography.fernet import Fernet

# 生成新的加密密钥
key = Fernet.generate_key()
print("Generated MCP_CREDENTIAL_ENCRYPTION_KEY:")
print(key.decode())