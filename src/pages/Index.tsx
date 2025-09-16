import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Heart, Target, Zap, ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-slide-up">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-background/10 backdrop-blur-sm border border-white/20 mb-6">
            <Trophy className="h-8 w-8 text-primary animate-bounce-in" />
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              Passa Bola
            </h1>
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold text-white/90 mb-4">
            Futebol Feminino IoT
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto mb-8">
            Sistema avançado de monitoramento de atletas em tempo real, 
            combinando dados vitais com gamificação esportiva
          </p>
          
          <Link to="/passa-bola">
            <Button className="gradient-primary shadow-primary transition-bounce text-lg px-8 py-4 animate-pulse-glow">
              <Play className="w-5 h-5 mr-2" />
              Iniciar Sistema
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="gradient-card border-white/20 animate-bounce-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Heart className="h-6 w-6 text-danger animate-heartbeat" />
                Monitoramento Vital
              </CardTitle>
              <CardDescription className="text-white/70">
                Acompanhamento em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent className="text-white/80">
              <ul className="space-y-2">
                <li>• Batimentos cardíacos (BPM)</li>
                <li>• Saturação de oxigênio (SpO2)</li>
                <li>• Status de atividade</li>
                <li>• Histórico completo</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="gradient-card border-white/20 animate-bounce-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Target className="h-6 w-6 text-primary" />
                Jogo Interativo
              </CardTitle>
              <CardDescription className="text-white/70">
                Gamificação esportiva
              </CardDescription>
            </CardHeader>
            <CardContent className="text-white/80">
              <ul className="space-y-2">
                <li>• Sistema de pontuação</li>
                <li>• Passes perfeitos</li>
                <li>• Sequências e combos</li>
                <li>• Hitmits especiais</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="gradient-card border-white/20 animate-bounce-in" style={{ animationDelay: "0.3s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="h-6 w-6 text-accent" />
                Análise Avançada
              </CardTitle>
              <CardDescription className="text-white/70">
                Inteligência artificial
              </CardDescription>
            </CardHeader>
            <CardContent className="text-white/80">
              <ul className="space-y-2">
                <li>• Gráficos em tempo real</li>
                <li>• Estatísticas detalhadas</li>
                <li>• Relatórios de performance</li>
                <li>• Configurações personalizadas</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Technology Stack */}
        <div className="text-center mb-16">
          <h3 className="text-2xl font-bold text-white mb-8">Tecnologias Utilizadas</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge className="bg-primary/20 text-primary border-primary/40 px-4 py-2">
              FIWARE IoT
            </Badge>
            <Badge className="bg-secondary/20 text-secondary border-secondary/40 px-4 py-2">
              React + TypeScript
            </Badge>
            <Badge className="bg-accent/20 text-accent border-accent/40 px-4 py-2">
              Real-time Charts
            </Badge>
            <Badge className="bg-success/20 text-success border-success/40 px-4 py-2">
              Modern UI/UX
            </Badge>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="gradient-card border-white/20 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-primary animate-bounce-in" />
              <h3 className="text-2xl font-bold text-white mb-4">
                Pronta para o Desafio?
              </h3>
              <p className="text-white/70 mb-6">
                Entre no sistema e comece a monitorar sua performance esportiva 
                com tecnologia de ponta
              </p>
              <Link to="/passa-bola">
                <Button className="gradient-accent shadow-glow transition-bounce animate-pulse-glow">
                  <Play className="w-4 h-4 mr-2" />
                  Acessar Sistema
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;

