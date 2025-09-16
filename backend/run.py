#!/usr/bin/env python3
"""
Script para executar o backend do sistema Passa Bola
"""

import uvicorn
import sys
import os

# Adiciona o diretório atual ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("🚀 Iniciando servidor do Sistema Passa Bola Futebol Feminino...")
    print("📡 Conectando com FIWARE Orion Context Broker...")
    print("🎯 API disponível em: http://localhost:8000")
    print("📖 Documentação em: http://localhost:8000/docs")
    print("=" * 60)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

    