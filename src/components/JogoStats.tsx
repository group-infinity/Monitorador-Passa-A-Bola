import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Zap, Flame, Clock, Star } from "lucide-react";

interface EstatisticasJogo {
  pontuacao: number;
  passes_executados: number;
  passes_perfeitos: number;
  tempo_inicio: Date | null;
  melhor_sequencia: number;
  sequencia_atual: number;
}

interface JogoStatsProps {
  estatisticas: EstatisticasJogo;
  jogoAtivo: boolean;
}


export const JogoStats = ({ estatisticas, jogoAtivo }: JogoStatsProps) => {
  const tempoJogo = estatisticas.tempo_inicio 
    ? Math.floor((Date.now() - estatisticas.tempo_inicio.getTime()) / 1000)
    : 0;

  const porcentagemPerfeitos = estatisticas.passes_executados > 0 
    ? Math.round((estatisticas.passes_perfeitos / estatisticas.passes_executados) * 100)
    : 0;

  const mediaPontosPorPasse = estatisticas.passes_executados > 0
    ? (estatisticas.pontuacao / estatisticas.passes_executados).toFixed(1)
    : "0.0";

  return (
    <Card className="card-floating animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Trophy className="h-5 w-5 text-primary animate-pulse" />
          Estatísticas do Jogo
        </CardTitle>
        <CardDescription className="text-white/70">
          {jogoAtivo ? "Jogo em andamento" : "Último jogo"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pontuação Principal */}
        <div className="text-center p-4 rounded-xl gradient-primary shadow-glow-primary animate-pulse-glow">
          <div className="text-4xl font-bold text-white mb-1">
            {estatisticas.pontuacao.toLocaleString()}
          </div>
          <p className="text-white/90">Pontos Totais</p>
          {jogoAtivo && (
            <Badge className="mt-2 bg-white/20 text-white animate-pulse-glow">
              🎮 JOGO ATIVO
            </Badge>
          )}
        </div>

        {/* Grid de Estatísticas */}
        <div className="grid grid-cols-2 gap-4">
          {/* Passes Executados */}
          <div className="text-center p-3 rounded-xl bg-surface-primary/30 border border-white/10 hover:bg-surface-primary/50 transition-smooth">
            <Target className="w-6 h-6 mx-auto mb-2 text-accent" />
            <div className="text-2xl font-bold text-white">
              {estatisticas.passes_executados}
            </div>
            <p className="text-white/70 text-sm">Passes</p>
          </div>

          {/* Passes Perfeitos */}
          <div className="text-center p-3 rounded-xl bg-surface-primary/30 border border-white/10 hover:bg-surface-primary/50 transition-smooth">
            <Star className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold text-white">
              {estatisticas.passes_perfeitos}
            </div>
            <p className="text-white/70 text-sm">Perfeitos</p>
          </div>

          {/* Sequência Atual */}
          <div className="text-center p-3 rounded-xl bg-surface-primary/30 border border-white/10 hover:bg-surface-primary/50 transition-smooth">
            <Flame className="w-6 h-6 mx-auto mb-2 text-warning animate-pulse" />
            <div className="text-2xl font-bold text-white">
              {estatisticas.sequencia_atual}
            </div>
            <p className="text-white/70 text-sm">Sequência</p>
          </div>

          {/* Melhor Sequência */}
          <div className="text-center p-3 rounded-xl bg-surface-primary/30 border border-white/10 hover:bg-surface-primary/50 transition-smooth">
            <Zap className="w-6 h-6 mx-auto mb-2 text-secondary" />
            <div className="text-2xl font-bold text-white">
              {estatisticas.melhor_sequencia}
            </div>
            <p className="text-white/70 text-sm">Recorde</p>
          </div>
        </div>

        {/* Métricas Avançadas */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <h4 className="text-white font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Métricas Avançadas
          </h4>
          
          <div className="grid grid-cols-1 gap-3">
            {/* Tempo de Jogo */}
            <div className="flex justify-between items-center">
              <span className="text-white/70">Tempo de Jogo:</span>
              <Badge variant="outline" className="border-white/20 text-white">
                {Math.floor(tempoJogo / 60)}:{(tempoJogo % 60).toString().padStart(2, '0')}
              </Badge>
            </div>

            {/* Porcentagem de Perfeitos */}
            <div className="flex justify-between items-center">
              <span className="text-white/70">Taxa de Perfeitos:</span>
              <Badge 
                className={`${
                  porcentagemPerfeitos >= 50 ? "bg-success" :
                  porcentagemPerfeitos >= 25 ? "bg-warning" :
                  "bg-danger"
                } text-white`}
              >
                {porcentagemPerfeitos}%
              </Badge>
            </div>

            {/* Média de Pontos */}
            <div className="flex justify-between items-center">
              <span className="text-white/70">Média por Passe:</span>
              <Badge variant="secondary" className="bg-secondary/20 text-secondary">
                {mediaPontosPorPasse} pts
              </Badge>
            </div>

            {/* Passes por Minuto */}
            {tempoJogo > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-white/70">Passes/min:</span>
                <Badge variant="outline" className="border-white/20 text-white">
                  {((estatisticas.passes_executados / tempoJogo) * 60).toFixed(1)}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};