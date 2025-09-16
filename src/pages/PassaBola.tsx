import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Zap, Trophy, Target, Play, Pause, RotateCcw, Settings } from "lucide-react";
import { AtletaMonitor } from "@/components/AtletaMonitor";
import { JogoStats } from "@/components/JogoStats";
import { HistoricoChart } from "@/components/HistoricoChart";
import { ConfigPanel } from "@/components/ConfigPanel";
import { HitmitsPanel } from "@/components/HitmitsPanel";
import logoPassaBola from "@/assets/logopassaabola.png";

// Tipos para o sistema
interface DadosAtleta {
  id: string;
  tipo: string;
  timestamp: string;
  time_instant: string;
  batimento: number;
  saturacao: number;
  piscar: string;
}

interface StatusBatimento {
  status: string;
  cor: string;
  alerta: string;
}

interface StatusSaturacao {
  status: string;
  cor: string;
  alerta: string;
}

interface EstatisticasJogo {
  pontuacao: number;
  passes_executados: number;
  passes_perfeitos: number;
  tempo_inicio: Date | null;
  melhor_sequencia: number;
  sequencia_atual: number;
}

interface Hitmit {
  tipo: string;
  timestamp: string;
  pontos: number;
  batimento: number;
  saturacao: number;
}

interface Configuracoes {
  intervalo_atualizacao: number;
  limite_historico: number;
  limites_batimento: {
    baixo: number;
    normal: number;
    alto: number;
  };
  limites_saturacao: {
    baixo: number;
    bom: number;
  };
}

const PassaBola = () => {
  // Estados principais
  const [dadosAtuais, setDadosAtuais] = useState<DadosAtleta | null>(null);
  const [historicoDados, setHistoricoDados] = useState<DadosAtleta[]>([]);
  const [jogoAtivo, setJogoAtivo] = useState(false);
  const [estatisticas, setEstatisticas] = useState<EstatisticasJogo>({
    pontuacao: 0,
    passes_executados: 0,
    passes_perfeitos: 0,
    tempo_inicio: null,
    melhor_sequencia: 0,
    sequencia_atual: 0,
  });
  const [hitmits, setHitmits] = useState<Hitmit[]>([]);
  const [configuracoes, setConfiguracoes] = useState<Configuracoes>({
    intervalo_atualizacao: 2,
    limite_historico: 50,
    limites_batimento: { baixo: 60, normal: 100, alto: 150 },
    limites_saturacao: { baixo: 95, bom: 98 },
  });
  const [conectado, setConectado] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null);

  // Função para simular dados (substituir pela integração real com FIWARE)
  const buscarDadosFiware = useCallback(async (): Promise<DadosAtleta | null> => {
    try {
      // Conectar com a API Python
      const response = await fetch('http://localhost:8000/atleta/dados');
      
      if (response.ok) {
        const data = await response.json();
        // Usar o status de conexão retornado pela API
        setConectado(data.conectado || false);
        return data.dados;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setConectado(false);
      return null;
    }
  }, []);

  // Atualizar dados
  const atualizarDados = useCallback(async () => {
    const novosDados = await buscarDadosFiware();
    
    if (novosDados) {
      setDadosAtuais(novosDados);
      setUltimaAtualizacao(new Date());
      
      // Adicionar ao histórico
      setHistoricoDados(prev => {
        const novoHistorico = [...prev, novosDados];
        return novoHistorico.slice(-configuracoes.limite_historico);
      });
    }
  }, [buscarDadosFiware, configuracoes.limite_historico]);

  // Analisar status do batimento
  const analisarStatusBatimento = useCallback((bpm: number): StatusBatimento => {
    const { baixo, normal, alto } = configuracoes.limites_batimento;
    
    if (bpm < baixo) {
      return { status: "Baixo", cor: "bpm-low", alerta: "⚠️" };
    } else if (bpm < normal) {
      return { status: "Normal", cor: "bpm-normal", alerta: "✅" };
    } else if (bpm < alto) {
      return { status: "Elevado", cor: "bpm-elevated", alerta: "⚡" };
    } else {
      return { status: "Muito Alto", cor: "bpm-high", alerta: "🚨" };
    }
  }, [configuracoes.limites_batimento]);

  // Analisar status da saturação
  const analisarStatusSaturacao = useCallback((spo2: number): StatusSaturacao => {
    const { baixo, bom } = configuracoes.limites_saturacao;
    
    if (spo2 >= bom) {
      return { status: "Excelente", cor: "success", alerta: "✅" };
    } else if (spo2 >= baixo) {
      return { status: "Bom", cor: "warning", alerta: "⚠️" };
    } else {
      return { status: "Baixo", cor: "danger", alerta: "🚨" };
    }
  }, [configuracoes.limites_saturacao]);

  // Iniciar jogo
  const iniciarJogo = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/jogo/iniciar', {
        method: 'POST',
      });
      
      if (response.ok) {
        setJogoAtivo(true);
        setEstatisticas({
          pontuacao: 0,
          passes_executados: 0,
          passes_perfeitos: 0,
          tempo_inicio: new Date(),
          melhor_sequencia: 0,
          sequencia_atual: 0,
        });
        setHitmits([]);
      }
    } catch (error) {
      console.error("Erro ao iniciar jogo:", error);
    }
  }, []);

  // Parar jogo
  const pararJogo = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/jogo/parar', {
        method: 'POST',
      });
      
      if (response.ok) {
        setJogoAtivo(false);
      }
    } catch (error) {
      console.error("Erro ao parar jogo:", error);
    }
  }, []);

  // Executar passe
  const executarPasse = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/jogo/passe', {
        method: 'POST',
      });
      
      if (response.ok) {
        const resultado = await response.json();
        
        if (resultado.sucesso) {
          // Atualizar estatísticas locais
          setEstatisticas(prev => ({
            ...prev,
            pontuacao: prev.pontuacao + resultado.pontos,
            passes_executados: prev.passes_executados + 1,
            passes_perfeitos: resultado.qualidade === "Perfeito" ? prev.passes_perfeitos + 1 : prev.passes_perfeitos,
            sequencia_atual: resultado.sequencia,
            melhor_sequencia: Math.max(prev.melhor_sequencia, resultado.sequencia),
          }));

          // Atualizar hitmits se necessário
          if (resultado.qualidade === "Perfeito") {
            const novoHitmit: Hitmit = {
              tipo: "Passe Perfeito",
              timestamp: new Date().toLocaleTimeString(),
              pontos: resultado.pontos,
              batimento: resultado.batimento,
              saturacao: resultado.saturacao,
            };
            setHitmits(prev => [...prev, novoHitmit]);
          }

          return resultado;
        }
      }
    } catch (error) {
      console.error("Erro ao executar passe:", error);
    }
    return null;
  }, []);

  // Efeito para atualização automática
  useEffect(() => {
    // Buscar dados iniciais
    atualizarDados();

    // Configurar intervalo de atualização
    const interval = setInterval(atualizarDados, configuracoes.intervalo_atualizacao * 1000);

    return () => clearInterval(interval);
  }, [atualizarDados, configuracoes.intervalo_atualizacao]);

  // Calcular tempo de jogo
  const tempoJogo = estatisticas.tempo_inicio 
    ? Math.floor((Date.now() - estatisticas.tempo_inicio.getTime()) / 1000)
    : 0;

  return (
    <div className="min-h-screen gradient-hero relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,119,198,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(192,132,252,0.1),transparent_50%)]" />
      
      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
          {/* Modern Header */}
          <header className="text-center space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-sm border border-white/10 animate-bounce-in">
                <img src={logoPassaBola} alt="Logo Passa Bola" className="h-16 w-16 object-contain" />
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                  Passa Bola
                </h1>
                <p className="text-xl md:text-2xl font-semibold text-white/90">
                  Futebol Feminino
                </p>
                <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
                  Sistema IoT para monitoramento avançado de atletas em tempo real
                </p>
              </div>
            </div>
            
            {/* Enhanced connection status */}
            <div className="flex items-center justify-center gap-4">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-sm border transition-all duration-300 ${
                conectado 
                  ? "bg-status-excellent/20 border-status-excellent/30 text-status-excellent animate-pulse-glow" 
                  : "bg-status-danger/20 border-status-danger/30 text-status-danger"
              }`}>
                <div className={`w-2 h-2 rounded-full ${conectado ? "bg-status-excellent" : "bg-status-danger"} ${conectado ? "animate-pulse" : ""}`} />
                <span className="font-medium">
                  {conectado ? "Sistema Conectado" : "Sistema Offline"}
                </span>
              </div>
              
              {ultimaAtualizacao && (
                <div className="text-white/60 text-sm">
                  Última atualização: {ultimaAtualizacao.toLocaleTimeString()}
                </div>
              )}
            </div>
          </header>

          {/* Modern Navigation */}
          <nav className="w-full">
            <Tabs defaultValue="monitor" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-14 p-1 bg-surface-primary/50 backdrop-blur-md border border-white/10 rounded-2xl">
                <TabsTrigger 
                  value="monitor" 
                  className="flex items-center gap-2 rounded-xl font-medium text-white/70 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-variant data-[state=active]:text-white data-[state=active]:shadow-glow transition-all duration-300"
                >
                  <Heart className="w-4 h-4" />
                  <span className="hidden sm:inline">Monitor</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="jogo" 
                  className="flex items-center gap-2 rounded-xl font-medium text-white/70 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-variant data-[state=active]:text-white data-[state=active]:shadow-glow transition-all duration-300"
                >
                  <Target className="w-4 h-4" />
                  <span className="hidden sm:inline">Jogo</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="historico" 
                  className="flex items-center gap-2 rounded-xl font-medium text-white/70 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-variant data-[state=active]:text-white data-[state=active]:shadow-glow transition-all duration-300"
                >
                  <Zap className="w-4 h-4" />
                  <span className="hidden sm:inline">Histórico</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="hitmits" 
                  className="flex items-center gap-2 rounded-xl font-medium text-white/70 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-variant data-[state=active]:text-white data-[state=active]:shadow-glow transition-all duration-300"
                >
                  <Trophy className="w-4 h-4" />
                  <span className="hidden sm:inline">Hitmits</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="config" 
                  className="flex items-center gap-2 rounded-xl font-medium text-white/70 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-variant data-[state=active]:text-white data-[state=active]:shadow-glow transition-all duration-300"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Config</span>
                </TabsTrigger>
              </TabsList>

              {/* Monitor da Atleta */}
              <TabsContent value="monitor" className="space-y-6 animate-fade-in">
                <AtletaMonitor
                  dadosAtuais={dadosAtuais}
                  conectado={conectado}
                  analisarStatusBatimento={analisarStatusBatimento}
                  analisarStatusSaturacao={analisarStatusSaturacao}
                  ultimaAtualizacao={ultimaAtualizacao}
                  onAtualizarDados={atualizarDados}
                />
              </TabsContent>

              {/* Jogo */}
              <TabsContent value="jogo" className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Enhanced Game Controls */}
                  <Card className="card-floating">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20">
                            <Target className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-white text-xl">Controles do Jogo</CardTitle>
                            <CardDescription className="text-white/70">
                              {jogoAtivo ? "🟢 Jogo em andamento" : "⚫ Pronto para iniciar"}
                            </CardDescription>
                          </div>
                        </div>
                        {jogoAtivo && (
                          <div className="text-right text-sm text-white/70">
                            <div>⏱️ {Math.floor(tempoJogo / 60)}:{(tempoJogo % 60).toString().padStart(2, '0')}</div>
                            <div>🔥 {estatisticas.sequencia_atual} sequência</div>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      <div className="flex flex-wrap gap-3">
                        {!jogoAtivo ? (
                          <Button 
                            onClick={iniciarJogo}
                            className="btn-primary flex-1 min-w-[200px] h-12 text-lg font-semibold animate-pulse-glow"
                            disabled={!dadosAtuais}
                          >
                            <Play className="w-5 h-5 mr-2" />
                            Iniciar Partida
                          </Button>
                        ) : (
                          <>
                            <Button 
                              onClick={executarPasse}
                              className="btn-accent flex-1 min-w-[140px] h-12 text-lg font-semibold animate-pulse-glow"
                              disabled={!dadosAtuais}
                            >
                              <Target className="w-5 h-5 mr-2" />
                              Executar Passe
                            </Button>
                            <Button 
                              onClick={pararJogo}
                              variant="destructive"
                              className="h-12 transition-bounce"
                            >
                              <Pause className="w-4 h-4 mr-2" />
                              Parar
                            </Button>
                            <Button 
                              onClick={() => {
                                pararJogo();
                                setTimeout(iniciarJogo, 100);
                              }}
                              variant="outline"
                              className="border-white/20 text-white hover:bg-white/10 transition-bounce h-12"
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Reset
                            </Button>
                          </>
                        )}
                      </div>

                      {jogoAtivo && (
                        <div className="space-y-4 p-4 rounded-xl bg-gradient-to-r from-surface-primary/50 to-surface-secondary/50 border border-white/10">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/80">Progresso da Sequência</span>
                            <span className="text-primary font-semibold">{estatisticas.sequencia_atual}/10</span>
                          </div>
                          <Progress 
                            value={(estatisticas.sequencia_atual / 10) * 100} 
                            className="h-3 bg-surface-primary"
                          />
                          <div className="grid grid-cols-2 gap-4 text-xs text-white/70">
                            <div>Tempo: {Math.floor(tempoJogo / 60)}:{(tempoJogo % 60).toString().padStart(2, '0')}</div>
                            <div>Melhor: {estatisticas.melhor_sequencia}</div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Enhanced Game Stats */}
                  <JogoStats estatisticas={estatisticas} jogoAtivo={jogoAtivo} />
                </div>
              </TabsContent>

              {/* Histórico */}
              <TabsContent value="historico" className="animate-fade-in">
                <HistoricoChart 
                  historicoDados={historicoDados}
                  configuracoes={configuracoes}
                />
              </TabsContent>

              {/* Hitmits */}
              <TabsContent value="hitmits" className="animate-fade-in">
                <HitmitsPanel hitmits={hitmits} />
              </TabsContent>

              {/* Configurações */}
              <TabsContent value="config" className="animate-fade-in">
                <ConfigPanel 
                  configuracoes={configuracoes}
                  onConfiguracoes={setConfiguracoes}
                />
              </TabsContent>
            </Tabs>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default PassaBola;


