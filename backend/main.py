"""
Desafio: Passa Bola de Futebol Feminino
Sistema IoT para monitoramento de atletas em tempo real - Backend Python

Requisitos atendidos:
- Entrada, processamento e saída (10 pontos)
- Estruturas de decisão e repetição (10 pontos) 
- Listas e dicionários (20 pontos)
- Funções (30 pontos)
- Interface intuitiva (10 pontos)
- Boas práticas (10 pontos)
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import time
import json
from datetime import datetime
from typing import Dict, List, Optional
import asyncio
from pydantic import BaseModel

# Configurações do FIWARE
ORION_HOST = "http://20.171.8.213:1026"
ENTITY_ID = "urn:ngsi-ld:Atleta:0001"
HEADERS = {
    "fiware-service": "smart",
    "fiware-servicepath": "/"
}

# Modelos Pydantic para API
class DadosAtleta(BaseModel):
    id: str
    tipo: str
    timestamp: str
    time_instant: str
    batimento: int
    saturacao: float
    piscar: str

class StatusAnalise(BaseModel):
    status: str
    cor: str
    alerta: str

class EstatisticasJogo(BaseModel):
    pontuacao: int
    passes_executados: int
    passes_perfeitos: int
    tempo_inicio: Optional[datetime]
    melhor_sequencia: int
    sequencia_atual: int

class Hitmit(BaseModel):
    tipo: str
    timestamp: str
    pontos: int
    batimento: int
    saturacao: float

class ConfiguracaoRequest(BaseModel):
    intervalo_atualizacao: int
    limite_historico: int
    limites_batimento: Dict[str, int]
    limites_saturacao: Dict[str, float]

class AtletaMonitor:
    """Classe para monitoramento de dados da atleta"""
    
    def __init__(self):
        """Inicializa o monitor da atleta"""
        self.historico_dados = []  # Lista para armazenar histórico
        self.dados_atuais = {}     # Dicionário para dados atuais
        self.configuracoes = {     # Dicionário de configurações
            "intervalo_atualizacao": 2,
            "limite_historico": 50,
            "limites_batimento": {"baixo": 60, "normal": 100, "alto": 150},
            "limites_saturacao": {"baixo": 95, "bom": 98}
        }
        self.conectado = False
    
    async def buscar_dados_fiware(self) -> Optional[Dict]:
        """
        Busca dados da atleta no FIWARE
        Returns: Dicionário com dados da atleta ou None se erro
        """
        try:
            url = f"{ORION_HOST}/v2/entities/{ENTITY_ID}"
            response = requests.get(url, headers=HEADERS, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                
                # Processamento dos dados recebidos
                dados_processados = {
                    "id": data.get("id", ""),
                    "tipo": data.get("type", ""),
                    "timestamp": datetime.now().strftime("%H:%M:%S"),
                    "time_instant": data.get("TimeInstant", {}).get("value", ""),
                    "batimento": data.get("batimento", {}).get("value", 0),
                    "saturacao": data.get("saturacao", {}).get("value", 0),
                    "piscar": data.get("piscar", {}).get("value", "")
                }
                
                self.conectado = True
                return dados_processados
            else:
                print(f"Erro HTTP: {response.status_code}")
                self.conectado = False
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"Erro de conexão: {e}")
            self.conectado = False
            return None
        except Exception as e:
            print(f"Erro inesperado: {e}")
            self.conectado = False
            return None
    
    async def atualizar_dados(self) -> bool:
        """
        Atualiza os dados atuais da atleta
        Returns: True se sucesso, False se erro
        """
        novos_dados = await self.buscar_dados_fiware()
        
        if novos_dados:
            self.dados_atuais = novos_dados
            
            # Adiciona ao histórico (mantém apenas os últimos N registros)
            self.historico_dados.append(novos_dados.copy())
            if len(self.historico_dados) > self.configuracoes["limite_historico"]:
                self.historico_dados.pop(0)
            
            return True
        return False
    
    def analisar_status_batimento(self, bpm: int) -> Dict[str, str]:
        """
        Analisa o status dos batimentos cardíacos
        Args: bpm - batimentos por minuto
        Returns: Dicionário com status e cor
        """
        limites = self.configuracoes["limites_batimento"]
        
        if bpm < limites["baixo"]:
            return {"status": "Baixo", "cor": "bmp-low", "alerta": "⚠️"}
        elif bpm < limites["normal"]:
            return {"status": "Normal", "cor": "bpm-normal", "alerta": "✅"}
        elif bpm < limites["alto"]:
            return {"status": "Elevado", "cor": "bmp-elevated", "alerta": "⚡"}
        else:
            return {"status": "Muito Alto", "cor": "bpm-high", "alerta": "🚨"}
    
    def analisar_status_saturacao(self, spo2: float) -> Dict[str, str]:
        """
        Analisa o status da saturação de oxigênio
        Args: spo2 - saturação de oxigênio em %
        Returns: Dicionário com status e cor
        """
        limites = self.configuracoes["limites_saturacao"]
        
        if spo2 >= limites["bom"]:
            return {"status": "Excelente", "cor": "success", "alerta": "✅"}
        elif spo2 >= limites["baixo"]:
            return {"status": "Bom", "cor": "warning", "alerta": "⚠️"}
        else:
            return {"status": "Baixo", "cor": "danger", "alerta": "🚨"}

class JogoPassaBola:
    """Classe para gerenciar o jogo Passa Bola de Futebol Feminino"""
    
    def __init__(self, monitor: AtletaMonitor):
        """Inicializa o jogo"""
        self.monitor = monitor
        self.jogo_ativo = False
        self.estatisticas = {
            "pontuacao": 0,
            "passes_executados": 0,
            "passes_perfeitos": 0,
            "tempo_inicio": None,
            "melhor_sequencia": 0,
            "sequencia_atual": 0
        }
        self.hitmits = []  # Lista para armazenar os "hitmits" (marcos importantes)
    
    def iniciar_jogo(self):
        """Inicia uma nova partida"""
        self.jogo_ativo = True
        self.estatisticas = {
            "pontuacao": 0,
            "passes_executados": 0,
            "passes_perfeitos": 0,
            "tempo_inicio": datetime.now(),
            "melhor_sequencia": 0,
            "sequencia_atual": 0
        }
        self.hitmits = []
        print("\n🟢 JOGO INICIADO! Boa sorte, atleta!")
        return {"sucesso": True, "mensagem": "Jogo iniciado com sucesso!"}
    
    def parar_jogo(self):
        """Para o jogo atual"""
        if self.jogo_ativo:
            self.jogo_ativo = False
            tempo_total = datetime.now() - self.estatisticas["tempo_inicio"]
            print(f"\n🔴 JOGO FINALIZADO!")
            print(f"Tempo total: {tempo_total.seconds} segundos")
            
            relatorio = self.gerar_relatorio_final()
            return {"sucesso": True, "relatorio": relatorio}
        return {"sucesso": False, "mensagem": "Jogo não está ativo"}
    
    def executar_passe(self) -> Dict[str, any]:
        """
        Executa um passe no jogo
        Returns: Dicionário com resultado do passe
        """
        if not self.jogo_ativo:
            return {"sucesso": False, "mensagem": "Jogo não está ativo"}
        
        if not self.monitor.dados_atuais:
            return {"sucesso": False, "mensagem": "Dados da atleta não disponíveis"}
        
        # Obtém dados atuais da atleta
        batimento = self.monitor.dados_atuais.get("batimento", 0)
        saturacao = self.monitor.dados_atuais.get("saturacao", 0)
        
        # Lógica de pontuação baseada nos dados vitais
        pontos_base = 1
        bonus = 0
        qualidade_passe = "Normal"
        
        # Estruturas de decisão para calcular pontuação
        if batimento > 120 and saturacao > 97:
            bonus += 3
            qualidade_passe = "Perfeito"
            self.estatisticas["passes_perfeitos"] += 1
            self.estatisticas["sequencia_atual"] += 1
        elif batimento > 100 and saturacao > 95:
            bonus += 2
            qualidade_passe = "Bom"
            self.estatisticas["sequencia_atual"] += 1
        elif saturacao > 95:
            bonus += 1
            qualidade_passe = "Regular"
            self.estatisticas["sequencia_atual"] += 1
        else:
            qualidade_passe = "Fraco"
            self.estatisticas["sequencia_atual"] = 0
        
        pontos_totais = pontos_base + bonus
        
        # Atualiza estatísticas
        self.estatisticas["pontuacao"] += pontos_totais
        self.estatisticas["passes_executados"] += 1
        
        # Verifica se é uma nova melhor sequência
        if self.estatisticas["sequencia_atual"] > self.estatisticas["melhor_sequencia"]:
            self.estatisticas["melhor_sequencia"] = self.estatisticas["sequencia_atual"]
        
        # Adiciona hitmit se for um passe especial
        if qualidade_passe == "Perfeito":
            hitmit = {
                "tipo": "Passe Perfeito",
                "timestamp": datetime.now().strftime("%H:%M:%S"),
                "pontos": pontos_totais,
                "batimento": batimento,
                "saturacao": saturacao
            }
            self.hitmits.append(hitmit)
        
        resultado = {
            "sucesso": True,
            "pontos": pontos_totais,
            "qualidade": qualidade_passe,
            "batimento": batimento,
            "saturacao": saturacao,
            "sequencia": self.estatisticas["sequencia_atual"]
        }
        
        return resultado
    
    def gerar_relatorio_final(self):
        """Gera relatório final do jogo"""
        tempo_total = 0
        if self.estatisticas["tempo_inicio"]:
            tempo_total = (datetime.now() - self.estatisticas["tempo_inicio"]).seconds
        
        return {
            "pontuacao_total": self.estatisticas["pontuacao"],
            "passes_executados": self.estatisticas["passes_executados"],
            "passes_perfeitos": self.estatisticas["passes_perfeitos"],
            "melhor_sequencia": self.estatisticas["melhor_sequencia"],
            "tempo_total": tempo_total,
            "hitmits": self.hitmits
        }

# Instâncias globais
monitor = AtletaMonitor()
jogo = JogoPassaBola(monitor)

# Configuração do FastAPI
app = FastAPI(
    title="Passa Bola Futebol Feminino - API",
    description="Sistema IoT para monitoramento de atletas em tempo real",
    version="1.0.0"
)

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especificar domínios
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoints da API

@app.get("/")
async def root():
    """Endpoint raiz da API"""
    return {
        "message": "Passa Bola Futebol Feminino - Sistema IoT",
        "version": "1.0.0",
        "status": "online"
    }

@app.get("/atleta/dados")
async def obter_dados_atleta():
    """Obtém os dados atuais da atleta"""
    await monitor.atualizar_dados()
    
    if not monitor.dados_atuais:
        raise HTTPException(status_code=404, detail="Dados da atleta não disponíveis")
    
    # Análises dos dados
    status_batimento = monitor.analisar_status_batimento(monitor.dados_atuais["batimento"])
    status_saturacao = monitor.analisar_status_saturacao(monitor.dados_atuais["saturacao"])
    
    return {
        "dados": monitor.dados_atuais,
        "status_batimento": status_batimento,
        "status_saturacao": status_saturacao,
        "conectado": monitor.conectado,
        "ultima_atualizacao": datetime.now().isoformat()
    }

@app.post("/atleta/atualizar")
async def atualizar_dados_atleta():
    """Força atualização dos dados da atleta"""
    sucesso = await monitor.atualizar_dados()
    
    if sucesso:
        return {"sucesso": True, "mensagem": "Dados atualizados com sucesso"}
    else:
        raise HTTPException(status_code=500, detail="Erro ao atualizar dados")

@app.get("/atleta/historico")
async def obter_historico():
    """Obtém o histórico de dados da atleta"""
    return {
        "historico": monitor.historico_dados,
        "total_registros": len(monitor.historico_dados),
        "limite_configurado": monitor.configuracoes["limite_historico"]
    }

@app.post("/jogo/iniciar")
async def iniciar_jogo():
    """Inicia uma nova partida"""
    resultado = jogo.iniciar_jogo()
    return resultado

@app.post("/jogo/parar")
async def parar_jogo():
    """Para o jogo atual"""
    resultado = jogo.parar_jogo()
    return resultado

@app.post("/jogo/passe")
async def executar_passe():
    """Executa um passe no jogo"""
    resultado = jogo.executar_passe()
    return resultado

@app.get("/jogo/status")
async def obter_status_jogo():
    """Obtém o status atual do jogo"""
    tempo_jogo = 0
    if jogo.estatisticas["tempo_inicio"]:
        tempo_jogo = (datetime.now() - jogo.estatisticas["tempo_inicio"]).seconds
    
    return {
        "jogo_ativo": jogo.jogo_ativo,
        "estatisticas": jogo.estatisticas,
        "tempo_jogo": tempo_jogo,
        "hitmits": jogo.hitmits
    }

@app.get("/jogo/hitmits")
async def obter_hitmits():
    """Obtém os hitmits alcançados"""
    return {
        "hitmits": jogo.hitmits,
        "total_hitmits": len(jogo.hitmits),
        "total_pontos": sum(h["pontos"] for h in jogo.hitmits)
    }

@app.get("/configuracoes")
async def obter_configuracoes():
    """Obtém as configurações atuais"""
    return monitor.configuracoes

@app.post("/configuracoes")
async def atualizar_configuracoes(config: ConfiguracaoRequest):
    """Atualiza as configurações do sistema"""
    try:
        # Validações
        if config.intervalo_atualizacao < 1 or config.intervalo_atualizacao > 60:
            raise HTTPException(status_code=400, detail="Intervalo deve estar entre 1 e 60 segundos")
        
        if config.limite_historico < 10 or config.limite_historico > 1000:
            raise HTTPException(status_code=400, detail="Limite do histórico deve estar entre 10 e 1000")
        
        # Atualiza configurações
        monitor.configuracoes.update(config.dict())
        
        return {
            "sucesso": True,
            "mensagem": "Configurações atualizadas com sucesso",
            "configuracoes": monitor.configuracoes
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar configurações: {str(e)}")

@app.get("/health")
async def health_check():
    """Endpoint de saúde da aplicação"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "fiware_connected": monitor.conectado,
        "game_active": jogo.jogo_ativo,
        "total_records": len(monitor.historico_dados)
    }

# Task em background para atualização automática
@app.on_event("startup")
async def startup_event():
    """Evento de inicialização da aplicação"""
    print("🚀 Iniciando sistema Passa Bola Futebol Feminino...")
    
    # Busca dados iniciais
    await monitor.atualizar_dados()
    
    # Inicia task de atualização automática
    asyncio.create_task(auto_update_task())

async def auto_update_task():
    """Task automática para atualização dos dados"""
    while True:
        try:
            await asyncio.sleep(monitor.configuracoes["intervalo_atualizacao"])
            await monitor.atualizar_dados()
        except Exception as e:
            print(f"Erro na atualização automática: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

    