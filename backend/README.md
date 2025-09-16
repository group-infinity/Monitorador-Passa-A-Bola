# Passa Bola Futebol Feminino - Backend Python

## Descrição
Backend Python com FastAPI para o sistema IoT de monitoramento de atletas em tempo real, conectando com FIWARE Orion Context Broker para obter dados de sensores do Wokwi.

## Requisitos Atendidos
- ✅ Entrada, processamento e saída (10 pontos)
- ✅ Estruturas de decisão e repetição (10 pontos) 
- ✅ Listas e dicionários (20 pontos)
- ✅ Funções (30 pontos)
- ✅ Interface intuitiva (10 pontos)
- ✅ Boas práticas (10 pontos)

## Instalação e Execução

### 1. Instalar dependências
```bash
cd backend
pip install -r requirements.txt
```

### 2. Executar o servidor
```bash
python run.py
```

### 3. Acessar a API
- API: http://localhost:8000
- Documentação: http://localhost:8000/docs
- Saúde da API: http://localhost:8000/health

## Estrutura da API

### Endpoints Principais

#### Atleta
- `GET /atleta/dados` - Obtém dados atuais da atleta
- `POST /atleta/atualizar` - Força atualização dos dados
- `GET /atleta/historico` - Obtém histórico de dados

#### Jogo
- `POST /jogo/iniciar` - Inicia nova partida
- `POST /jogo/parar` - Para o jogo atual
- `POST /jogo/passe` - Executa um passe
- `GET /jogo/status` - Status atual do jogo
- `GET /jogo/hitmits` - Obtém hitmits alcançados

#### Configurações
- `GET /configuracoes` - Obtém configurações atuais
- `POST /configuracoes` - Atualiza configurações

## Configuração FIWARE

O sistema conecta com o FIWARE Orion Context Broker:
- Host: `http://20.171.8.213:1026`
- Entity ID: `urn:ngsi-ld:Atleta:0001`
- Service: `smart`
- Service Path: `/`

## Dados Monitorados

### Sensores
- **Batimento Cardíaco (BPM)**: Frequência cardíaca da atleta
- **Saturação de Oxigênio (SpO2)**: Nível de oxigenação do sangue
- **Status de Atividade**: Indicador de atividade (ON/OFF)

### Análise Automática
- **Batimento**: Baixo (<60), Normal (60-100), Elevado (100-150), Muito Alto (>150)
- **Saturação**: Baixo (<95%), Bom (95-98%), Excelente (>98%)

## Sistema de Jogo

### Pontuação
- **Passe Fraco**: 1 ponto (SpO2 ≤ 95%)
- **Passe Regular**: 2 pontos (SpO2 > 95%)
- **Passe Bom**: 3 pontos (BPM > 100 e SpO2 > 95%)
- **Passe Perfeito**: 4 pontos (BPM > 120 e SpO2 > 97%)

### Hitmits
- Passes perfeitos geram hitmits especiais
- Sistema de sequências e combos
- Estatísticas detalhadas de performance

## Arquitetura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Wokwi Sim     │────│  FIWARE Orion    │────│  Backend API    │
│   (Sensores)    │    │  Context Broker  │    │  (FastAPI)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                                                         │
                                               ┌─────────────────┐
                                               │  Frontend Web   │
                                               │  (React)        │
                                               └─────────────────┘
```

## Classes Principais

### AtletaMonitor
- Busca dados do FIWARE
- Mantém histórico de dados
- Analisa status vital
- Gerencia configurações

### JogoPassaBola
- Controla estado do jogo
- Calcula pontuação baseada em dados vitais
- Gerencia hitmits e estatísticas
- Sistema de sequências

## Funcionalidades Avançadas

- **Atualização Automática**: Dados atualizados automaticamente
- **API RESTful**: Interface padronizada para frontend
- **Validação de Dados**: Validação completa com Pydantic
- **Documentação Automática**: Swagger/OpenAPI integrado
- **CORS Configurado**: Acesso frontend liberado
- **Health Check**: Monitoramento de saúde da API

## Logs e Monitoramento

O sistema gera logs detalhados de:
- Conexões com FIWARE
- Atualizações de dados
- Ações do jogo
- Erros e exceções

## Integração com Frontend

O frontend React consome esta API para:
- Exibir dados em tempo real
- Controlar o jogo
- Visualizar histórico e estatísticas
- Gerenciar configurações
