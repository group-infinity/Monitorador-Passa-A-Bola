import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Star, Clock, Zap, Heart } from "lucide-react";

interface Hitmit {
  tipo: string;
  timestamp: string;
  pontos: number;
  batimento: number;
  saturacao: number;
}

interface HitmitsPanelProps {
  hitmits: Hitmit[];
}


export const HitmitsPanel = ({ hitmits }: HitmitsPanelProps) => {
  const totalPontos = hitmits.reduce((acc, curr) => acc + curr.pontos, 0);
  const mediaPontos = hitmits.length > 0 ? (totalPontos / hitmits.length).toFixed(1) : "0.0";

  if (hitmits.length === 0) {
    return (
      <Card className="gradient-card border-white/20">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Trophy className="w-16 h-16 text-white/20 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Nenhum Hitmit Alcançado
          </h3>
          <p className="text-white/70 text-center max-w-md">
            Execute passes perfeitos para conquistar seus primeiros hitmits!
            Combine alta frequência cardíaca ({'>'}120 BPM) com excelente saturação ({'>'}97%).
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-lg">
            <div className="text-center p-4 rounded-lg bg-background/10 border border-white/10">
              <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-white/60 text-sm">Passe Perfeito</p>
              <p className="text-xs text-white/40">BPM {'>'}120 + SpO2 {'>'}97%</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-background/10 border border-white/10">
              <Star className="w-8 h-8 mx-auto mb-2 text-secondary" />
              <p className="text-white/60 text-sm">Sequência</p>
              <p className="text-xs text-white/40">5+ passes consecutivos</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-background/10 border border-white/10">
              <Zap className="w-8 h-8 mx-auto mb-2 text-accent" />
              <p className="text-white/60 text-sm">Alta Performance</p>
              <p className="text-xs text-white/40">10+ pontos por passe</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo dos Hitmits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="gradient-card border-white/20">
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-3 text-primary animate-bounce-in" />
            <div className="text-3xl font-bold text-white mb-1">
              {hitmits.length}
            </div>
            <p className="text-white/70">Hitmits Conquistados</p>
          </CardContent>
        </Card>

        <Card className="gradient-card border-white/20">
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 mx-auto mb-3 text-secondary animate-pulse" />
            <div className="text-3xl font-bold text-white mb-1">
              {totalPontos}
            </div>
            <p className="text-white/70">Pontos Totais</p>
          </CardContent>
        </Card>

        <Card className="gradient-card border-white/20">
          <CardContent className="p-4 text-center">
            <Zap className="w-8 h-8 mx-auto mb-3 text-accent animate-pulse-glow" />
            <div className="text-3xl font-bold text-white mb-1">
              {mediaPontos}
            </div>
            <p className="text-white/70">Média por Hitmit</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Hitmits */}
      <Card className="gradient-card border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Trophy className="h-5 w-5 text-primary" />
            Histórico de Hitmits
          </CardTitle>
          <CardDescription className="text-white/70">
            Todas as conquistas especiais durante o jogo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {hitmits.map((hitmit, index) => (
              <div 
                key={index}
                className="p-4 rounded-lg bg-background/10 border border-white/10 hover:bg-background/20 transition-smooth animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full gradient-primary shadow-glow">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">
                        {hitmit.tipo}
                      </h4>
                      <div className="flex items-center gap-2 text-white/60 text-sm">
                        <Clock className="w-3 h-3" />
                        {hitmit.timestamp}
                      </div>
                    </div>
                  </div>
                  <Badge className="gradient-accent shadow-glow text-white font-bold">
                    +{hitmit.pontos} pts
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-danger" />
                    <span className="text-white/80 text-sm">
                      {hitmit.batimento} BPM
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-accent"></div>
                    <span className="text-white/80 text-sm">
                      {hitmit.saturacao}% SpO2
                    </span>
                  </div>
                </div>

                {/* Indicador de qualidade */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, Math.floor(hitmit.pontos / 2)) }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                    ))}
                  </div>
                  <span className="text-white/50 text-xs">
                    #{hitmits.length - index}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conquistas Especiais */}
      <Card className="gradient-card border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Star className="h-5 w-5 text-secondary" />
            Próximas Conquistas
          </CardTitle>
          <CardDescription className="text-white/70">
            Continue jogando para desbloquear mais hitmits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border ${hitmits.length >= 5 ? 'bg-success/20 border-success/40' : 'bg-background/10 border-white/10'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Trophy className={`w-5 h-5 ${hitmits.length >= 5 ? 'text-success' : 'text-white/40'}`} />
                <span className={hitmits.length >= 5 ? 'text-success' : 'text-white/60'}>
                  Estreante
                </span>
              </div>
              <p className="text-xs text-white/50">
                {hitmits.length >= 5 ? '✅ Conquistado!' : `${hitmits.length}/5 hitmits`}
              </p>
            </div>

            <div className={`p-4 rounded-lg border ${hitmits.length >= 10 ? 'bg-success/20 border-success/40' : 'bg-background/10 border-white/10'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Target className={`w-5 h-5 ${hitmits.length >= 10 ? 'text-success' : 'text-white/40'}`} />
                <span className={hitmits.length >= 10 ? 'text-success' : 'text-white/60'}>
                  Experiente
                </span>
              </div>
              <p className="text-xs text-white/50">
                {hitmits.length >= 10 ? '✅ Conquistado!' : `${hitmits.length}/10 hitmits`}
              </p>
            </div>

            <div className={`p-4 rounded-lg border ${totalPontos >= 100 ? 'bg-success/20 border-success/40' : 'bg-background/10 border-white/10'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Zap className={`w-5 h-5 ${totalPontos >= 100 ? 'text-success' : 'text-white/40'}`} />
                <span className={totalPontos >= 100 ? 'text-success' : 'text-white/60'}>
                  Centurião
                </span>
              </div>
              <p className="text-xs text-white/50">
                {totalPontos >= 100 ? '✅ Conquistado!' : `${totalPontos}/100 pontos`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};