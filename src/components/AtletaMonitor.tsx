import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Heart, Droplet, User, Clock } from "lucide-react";

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

interface AtletaMonitorProps {
  dadosAtuais: DadosAtleta | null;
  conectado: boolean;
  analisarStatusBatimento: (bpm: number) => StatusBatimento;
  analisarStatusSaturacao: (spo2: number) => StatusSaturacao;
  ultimaAtualizacao: Date | null;
  onAtualizarDados: () => void;
}

export const AtletaMonitor = ({
  dadosAtuais,
  conectado,
  analisarStatusBatimento,
  analisarStatusSaturacao,
  ultimaAtualizacao,
  onAtualizarDados,
}: AtletaMonitorProps) => {
  if (!dadosAtuais) {
    return (
      <Card className="gradient-card border-white/20">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-white/70 text-center mb-4">
            Carregando dados da atleta...
          </p>
          <Button 
            onClick={onAtualizarDados}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  const statusBatimento = analisarStatusBatimento(dadosAtuais.batimento);
  const statusSaturacao = analisarStatusSaturacao(dadosAtuais.saturacao);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Informações da Atleta */}
      <Card className="gradient-card border-white/20 animate-bounce-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <User className="h-5 w-5 text-primary" />
            Atleta
          </CardTitle>
          <CardDescription className="text-white/70">
            Informações gerais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-white/80">ID:</span>
              <span className="text-white font-mono text-sm">
                {dadosAtuais.id.split(':').pop()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80">Tipo:</span>
              <Badge variant="secondary" className="bg-secondary/20 text-secondary">
                {dadosAtuais.tipo}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80">Status:</span>
              <Badge 
                className={`${conectado ? "animate-pulse-glow bg-success" : "bg-muted"} text-white`}
              >
                {conectado ? "🟢 Ativo" : "⚫ Inativo"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80">Última att:</span>
              <span className="text-white/60 text-sm flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {dadosAtuais.timestamp}
              </span>
            </div>
          </div>
          
          <Button 
            onClick={onAtualizarDados}
            variant="outline"
            size="sm"
            className="w-full border-white/20 text-white hover:bg-white/10 transition-bounce"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </CardContent>
      </Card>

      {/* Batimentos Cardíacos */}
      <Card className="gradient-card border-white/20 animate-bounce-in" style={{ animationDelay: "0.1s" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Heart className="h-5 w-5 text-danger animate-heartbeat" />
            Batimentos Cardíacos
          </CardTitle>
          <CardDescription className="text-white/70">
            Frequência cardíaca atual
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">
              {dadosAtuais.batimento}
              <span className="text-xl text-white/60 ml-1">BPM</span>
            </div>
            <Badge 
              className={`text-white ${
                statusBatimento.cor === "bpm-low" ? "bg-bpm-low" :
                statusBatimento.cor === "bpm-normal" ? "bg-bpm-normal" :
                statusBatimento.cor === "bpm-elevated" ? "bg-bpm-elevated" :
                "bg-bpm-high animate-pulse"
              }`}
            >
              {statusBatimento.alerta} {statusBatimento.status}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Baixo (&lt;60)</span>
              <span className="text-bpm-low">⚠️</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Normal (60-100)</span>
              <span className="text-bpm-normal">✅</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Elevado (100-150)</span>
              <span className="text-bpm-elevated">⚡</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Alto (&gt;150)</span>
              <span className="text-bpm-high">🚨</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saturação de Oxigênio */}
      <Card className="gradient-card border-white/20 animate-bounce-in" style={{ animationDelay: "0.2s" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Droplet className="h-5 w-5 text-accent" />
            Saturação de Oxigênio
          </CardTitle>
          <CardDescription className="text-white/70">
            SpO2 atual
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">
              {dadosAtuais.saturacao}
              <span className="text-xl text-white/60 ml-1">%</span>
            </div>
            <Badge 
              className={`text-white ${
                statusSaturacao.cor === "success" ? "bg-success" :
                statusSaturacao.cor === "warning" ? "bg-warning" :
                "bg-danger animate-pulse"
              }`}
            >
              {statusSaturacao.alerta} {statusSaturacao.status}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Baixo (&lt;95%)</span>
              <span className="text-danger">🚨</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Bom (95-98%)</span>
              <span className="text-warning">⚠️</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Excelente (&gt;98%)</span>
              <span className="text-success">✅</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tempo desde última atualização */}
      {ultimaAtualizacao && (
        <Card className="gradient-card border-white/20 md:col-span-2 lg:col-span-3 animate-bounce-in" style={{ animationDelay: "0.3s" }}>
          <CardContent className="flex items-center justify-center py-4">
            <div className="text-center text-white/70">
              <Clock className="w-5 h-5 mx-auto mb-2" />
              <p>
                Última atualização: {ultimaAtualizacao.toLocaleTimeString()}
                <span className="ml-2 text-white/50">
                  ({Math.floor((Date.now() - ultimaAtualizacao.getTime()) / 1000)}s atrás)
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};