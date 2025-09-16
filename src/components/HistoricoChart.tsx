import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, Activity, Droplet, Clock } from "lucide-react";

interface DadosAtleta {
  id: string;
  tipo: string;
  timestamp: string;
  time_instant: string;
  batimento: number;
  saturacao: number;
  piscar: string;
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


interface HistoricoChartProps {
  historicoDados: DadosAtleta[];
  configuracoes: Configuracoes;
}

export const HistoricoChart = ({ historicoDados, configuracoes }: HistoricoChartProps) => {
  // Preparar dados para os gráficos
  const dadosGrafico = historicoDados.slice(-20).map((dado, index) => ({
    index: index + 1,
    timestamp: dado.timestamp,
    batimento: dado.batimento,
    saturacao: dado.saturacao,
    time: new Date(dado.time_instant).toLocaleTimeString().slice(-8),
  }));

  // Calcular estatísticas
  const mediasBatimento = historicoDados.length > 0 
    ? historicoDados.reduce((acc, curr) => acc + curr.batimento, 0) / historicoDados.length
    : 0;

  const mediaSaturacao = historicoDados.length > 0 
    ? historicoDados.reduce((acc, curr) => acc + curr.saturacao, 0) / historicoDados.length
    : 0;

  const maxBatimento = Math.max(...historicoDados.map(d => d.batimento), 0);
  const minBatimento = Math.min(...historicoDados.map(d => d.batimento), 200);
  const maxSaturacao = Math.max(...historicoDados.map(d => d.saturacao), 0);
  const minSaturacao = Math.min(...historicoDados.map(d => d.saturacao), 100);

  if (historicoDados.length === 0) {
    return (
      <Card className="gradient-card border-white/20">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Activity className="w-12 h-12 text-white/40 mb-4" />
          <p className="text-white/70 text-center">
            Nenhum dado histórico disponível ainda.
          </p>
          <p className="text-white/50 text-sm text-center mt-2">
            Os dados aparecerão conforme forem coletados.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas Resumidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="gradient-card border-white/20">
          <CardContent className="p-4 text-center">
            <Activity className="w-6 h-6 mx-auto mb-2 text-danger" />
            <div className="text-2xl font-bold text-white">
              {mediasBatimento.toFixed(0)}
            </div>
            <p className="text-white/70 text-sm">BPM Médio</p>
          </CardContent>
        </Card>

        <Card className="gradient-card border-white/20">
          <CardContent className="p-4 text-center">
            <Droplet className="w-6 h-6 mx-auto mb-2 text-accent" />
            <div className="text-2xl font-bold text-white">
              {mediaSaturacao.toFixed(1)}%
            </div>
            <p className="text-white/70 text-sm">SpO2 Médio</p>
          </CardContent>
        </Card>

        <Card className="gradient-card border-white/20">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold text-white">
              {maxBatimento}
            </div>
            <p className="text-white/70 text-sm">BPM Máximo</p>
          </CardContent>
        </Card>

        <Card className="gradient-card border-white/20">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-secondary" />
            <div className="text-2xl font-bold text-white">
              {historicoDados.length}
            </div>
            <p className="text-white/70 text-sm">Registros</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Batimentos Cardíacos */}
      <Card className="gradient-card border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Activity className="h-5 w-5 text-danger" />
            Histórico de Batimentos Cardíacos
          </CardTitle>
          <CardDescription className="text-white/70">
            Últimos {dadosGrafico.length} registros de BPM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dadosGrafico}>
                <defs>
                  <linearGradient id="batimentoGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--danger))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--danger))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="time" 
                  stroke="rgba(255,255,255,0.7)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.7)"
                  fontSize={12}
                  domain={[minBatimento - 10, maxBatimento + 10]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                  formatter={(value: any) => [`${value} BPM`, 'Batimentos']}
                />
                <Area
                  type="monotone" 
                  dataKey="batimento" 
                  stroke="hsl(var(--danger))" 
                  strokeWidth={2}
                  fill="url(#batimentoGradient)"
                />
                {/* Linhas de referência */}
                <Line type="monotone" dataKey={() => configuracoes.limites_batimento.baixo} stroke="hsl(var(--bpm-low))" strokeDasharray="5 5" strokeWidth={1} />
                <Line type="monotone" dataKey={() => configuracoes.limites_batimento.normal} stroke="hsl(var(--bpm-normal))" strokeDasharray="5 5" strokeWidth={1} />
                <Line type="monotone" dataKey={() => configuracoes.limites_batimento.alto} stroke="hsl(var(--bpm-high))" strokeDasharray="5 5" strokeWidth={1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Saturação */}
      <Card className="gradient-card border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Droplet className="h-5 w-5 text-accent" />
            Histórico de Saturação de Oxigênio
          </CardTitle>
          <CardDescription className="text-white/70">
            Últimos {dadosGrafico.length} registros de SpO2
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dadosGrafico}>
                <defs>
                  <linearGradient id="saturacaoGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="time" 
                  stroke="rgba(255,255,255,0.7)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.7)"
                  fontSize={12}
                  domain={[Math.min(90, minSaturacao - 2), Math.max(102, maxSaturacao + 2)]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                  formatter={(value: any) => [`${value}%`, 'Saturação']}
                />
                <Area
                  type="monotone" 
                  dataKey="saturacao" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={2}
                  fill="url(#saturacaoGradient)"
                />
                {/* Linhas de referência */}
                <Line type="monotone" dataKey={() => configuracoes.limites_saturacao.baixo} stroke="hsl(var(--warning))" strokeDasharray="5 5" strokeWidth={1} />
                <Line type="monotone" dataKey={() => configuracoes.limites_saturacao.bom} stroke="hsl(var(--success))" strokeDasharray="5 5" strokeWidth={1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};