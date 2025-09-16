import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, RefreshCw, Save, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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


interface ConfigPanelProps {
  configuracoes: Configuracoes;
  onConfiguracoes: (novasConfig: Configuracoes) => void;
}

export const ConfigPanel = ({ configuracoes, onConfiguracoes }: ConfigPanelProps) => {
  const [configLocal, setConfigLocal] = useState<Configuracoes>({ ...configuracoes });
  const [alteracoesPendentes, setAlteracoesPendentes] = useState(false);
  const { toast } = useToast();

  const handleChange = (categoria: string, campo: string, valor: number) => {
    const novaConfig = { ...configLocal };
    
    if (categoria === 'geral') {
      (novaConfig as any)[campo] = valor;
    } else {
      (novaConfig as any)[categoria][campo] = valor;
    }
    
    setConfigLocal(novaConfig);
    setAlteracoesPendentes(true);
  };

  const salvarConfiguracoes = () => {
    // Validações
    if (configLocal.intervalo_atualizacao < 1 || configLocal.intervalo_atualizacao > 60) {
      toast({
        title: "Erro de Validação",
        description: "Intervalo deve estar entre 1 e 60 segundos",
        variant: "destructive",
      });
      return;
    }

    if (configLocal.limite_historico < 10 || configLocal.limite_historico > 1000) {
      toast({
        title: "Erro de Validação", 
        description: "Limite do histórico deve estar entre 10 e 1000 registros",
        variant: "destructive",
      });
      return;
    }

    if (configLocal.limites_batimento.baixo >= configLocal.limites_batimento.normal ||
        configLocal.limites_batimento.normal >= configLocal.limites_batimento.alto) {
      toast({
        title: "Erro de Validação",
        description: "Os limites de batimento devem estar em ordem crescente",
        variant: "destructive",
      });
      return;
    }

    if (configLocal.limites_saturacao.baixo >= configLocal.limites_saturacao.bom) {
      toast({
        title: "Erro de Validação",
        description: "O limite baixo de saturação deve ser menor que o bom",
        variant: "destructive",
      });
      return;
    }

    onConfiguracoes(configLocal);
    setAlteracoesPendentes(false);
    
    toast({
      title: "Configurações Salvas",
      description: "Todas as alterações foram aplicadas com sucesso",
    });
  };

  const resetarConfiguracoes = () => {
    const configPadrao: Configuracoes = {
      intervalo_atualizacao: 2,
      limite_historico: 50,
      limites_batimento: { baixo: 60, normal: 100, alto: 150 },
      limites_saturacao: { baixo: 95, bom: 98 },
    };

    setConfigLocal(configPadrao);
    setAlteracoesPendentes(true);
    
    toast({
      title: "Configurações Resetadas",
      description: "Valores padrão restaurados. Clique em 'Salvar' para aplicar.",
    });
  };

  const cancelarAlteracoes = () => {
    setConfigLocal({ ...configuracoes });
    setAlteracoesPendentes(false);
  };

  return (
    <div className="space-y-6">
      {/* Header com status */}
      <Card className="gradient-card border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Settings className="h-5 w-5 text-primary" />
            Configurações do Sistema
          </CardTitle>
          <CardDescription className="text-white/70">
            Personalize o comportamento do sistema de monitoramento
          </CardDescription>
          {alteracoesPendentes && (
            <Badge className="w-fit bg-warning/20 text-warning border-warning/40">
              <AlertCircle className="w-3 h-3 mr-1" />
              Alterações pendentes
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {alteracoesPendentes && (
            <div className="flex gap-3 mb-6">
              <Button 
                onClick={salvarConfiguracoes}
                className="gradient-primary shadow-primary transition-bounce"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </Button>
              <Button 
                onClick={cancelarAlteracoes}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configurações Gerais */}
      <Card className="gradient-card border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Configurações Gerais</CardTitle>
          <CardDescription className="text-white/70">
            Controles básicos do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="intervalo" className="text-white">
                Intervalo de Atualização (segundos)
              </Label>
              <Input
                id="intervalo"
                type="number"
                min="1"
                max="60"
                value={configLocal.intervalo_atualizacao}
                onChange={(e) => handleChange('geral', 'intervalo_atualizacao', parseInt(e.target.value) || 1)}
                className="bg-background/20 border-white/20 text-white placeholder:text-white/50"
              />
              <p className="text-xs text-white/60">
                Frequência de busca de novos dados (1-60s)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="historico" className="text-white">
                Limite do Histórico (registros)
              </Label>
              <Input
                id="historico"
                type="number"
                min="10"
                max="1000"
                value={configLocal.limite_historico}
                onChange={(e) => handleChange('geral', 'limite_historico', parseInt(e.target.value) || 10)}
                className="bg-background/20 border-white/20 text-white placeholder:text-white/50"
              />
              <p className="text-xs text-white/60">
                Máximo de registros mantidos no histórico (10-1000)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Limites de Batimento */}
      <Card className="gradient-card border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Limites de Batimento Cardíaco</CardTitle>
          <CardDescription className="text-white/70">
            Defina os intervalos para classificação dos batimentos (BPM)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bpm-baixo" className="text-white flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-bpm-low"></span>
                Limite Baixo
              </Label>
              <Input
                id="bpm-baixo"
                type="number"
                min="30"
                max="200"
                value={configLocal.limites_batimento.baixo}
                onChange={(e) => handleChange('limites_batimento', 'baixo', parseInt(e.target.value) || 60)}
                className="bg-background/20 border-white/20 text-white"
              />
              <p className="text-xs text-white/60">
                BPM abaixo deste valor: Baixo
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bpm-normal" className="text-white flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-bpm-normal"></span>
                Limite Normal
              </Label>
              <Input
                id="bpm-normal"
                type="number"
                min="50"
                max="200"
                value={configLocal.limites_batimento.normal}
                onChange={(e) => handleChange('limites_batimento', 'normal', parseInt(e.target.value) || 100)}
                className="bg-background/20 border-white/20 text-white"
              />
              <p className="text-xs text-white/60">
                BPM entre baixo e este valor: Normal
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bpm-alto" className="text-white flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-bpm-high"></span>
                Limite Alto
              </Label>
              <Input
                id="bpm-alto"
                type="number"
                min="100"
                max="250"
                value={configLocal.limites_batimento.alto}
                onChange={(e) => handleChange('limites_batimento', 'alto', parseInt(e.target.value) || 150)}
                className="bg-background/20 border-white/20 text-white"
              />
              <p className="text-xs text-white/60">
                BPM acima deste valor: Muito Alto
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-background/10 border border-white/10">
            <h4 className="text-white font-medium mb-2">Classificação Atual:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div className="text-center">
                <div className="text-bpm-low">⚠️ Baixo</div>
                <div className="text-white/60">&lt; {configLocal.limites_batimento.baixo}</div>
              </div>
              <div className="text-center">
                <div className="text-bpm-normal">✅ Normal</div>
                <div className="text-white/60">{configLocal.limites_batimento.baixo}-{configLocal.limites_batimento.normal}</div>
              </div>
              <div className="text-center">
                <div className="text-bpm-elevated">⚡ Elevado</div>
                <div className="text-white/60">{configLocal.limites_batimento.normal}-{configLocal.limites_batimento.alto}</div>
              </div>
              <div className="text-center">
                <div className="text-bpm-high">🚨 Muito Alto</div>
                <div className="text-white/60">&gt; {configLocal.limites_batimento.alto}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Limites de Saturação */}
      <Card className="gradient-card border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Limites de Saturação de Oxigênio</CardTitle>
          <CardDescription className="text-white/70">
            Defina os intervalos para classificação da saturação (%)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="spo2-baixo" className="text-white flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-warning"></span>
                Limite Baixo (%)
              </Label>
              <Input
                id="spo2-baixo"
                type="number"
                min="80"
                max="100"
                value={configLocal.limites_saturacao.baixo}
                onChange={(e) => handleChange('limites_saturacao', 'baixo', parseInt(e.target.value) || 95)}
                className="bg-background/20 border-white/20 text-white"
              />
              <p className="text-xs text-white/60">
                SpO2 abaixo deste valor: Baixo
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="spo2-bom" className="text-white flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-success"></span>
                Limite Bom (%)
              </Label>
              <Input
                id="spo2-bom"
                type="number"
                min="90"
                max="100"
                value={configLocal.limites_saturacao.bom}
                onChange={(e) => handleChange('limites_saturacao', 'bom', parseInt(e.target.value) || 98)}
                className="bg-background/20 border-white/20 text-white"
              />
              <p className="text-xs text-white/60">
                SpO2 acima deste valor: Excelente
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-background/10 border border-white/10">
            <h4 className="text-white font-medium mb-2">Classificação Atual:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <div className="text-danger">🚨 Baixo</div>
                <div className="text-white/60">&lt; {configLocal.limites_saturacao.baixo}%</div>
              </div>
              <div className="text-center">
                <div className="text-warning">⚠️ Bom</div>
                <div className="text-white/60">{configLocal.limites_saturacao.baixo}-{configLocal.limites_saturacao.bom}%</div>
              </div>
              <div className="text-center">
                <div className="text-success">✅ Excelente</div>
                <div className="text-white/60">&gt; {configLocal.limites_saturacao.bom}%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <Card className="gradient-card border-white/20">
        <CardContent className="flex flex-wrap gap-3 pt-6">
          <Button 
            onClick={resetarConfiguracoes}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 transition-bounce"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Restaurar Padrões
          </Button>
          
          {!alteracoesPendentes && (
            <div className="flex items-center gap-2 text-success">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Todas as configurações estão salvas</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};