import React from 'react';
import Layout from '@/components/Layout';
import { useUserLevels } from '@/hooks/useUserLevels';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Star,
  ArrowLeft,
  Package,
  Leaf,
  Award,
  ArrowRight,
  CheckCircle2,
  Recycle,
  Calendar,
  ThumbsUp
} from 'lucide-react';

interface Level {
  name: string;
  minPoints: number;
  maxPoints: number;
  benefits: string[];
  icon: React.ReactNode;
  color: string;
}

interface PointAction {
  name: string;
  points: number;
  icon: React.ReactNode;
  description: string;
}

const levels: Level[] = [
  {
    name: 'Bronze',
    minPoints: 0,
    maxPoints: 500,
    benefits: [
      'Acesso ao sistema de agendamentos',
      'Participação no ranking regional',
      'Certificados básicos'
    ],
    icon: <Trophy className="h-6 w-6" />,
    color: 'bg-orange-100 text-orange-700'
  },
  {
    name: 'Prata',
    minPoints: 501,
    maxPoints: 1000,
    benefits: [
      'Todos os benefícios do Bronze',
      'Prioridade em coletas',
      'Certificados especiais',
      'Destaque no ranking'
    ],
    icon: <Trophy className="h-6 w-6" />,
    color: 'bg-gray-100 text-gray-700'
  },
  {
    name: 'Ouro',
    minPoints: 1001,
    maxPoints: 2000,
    benefits: [
      'Todos os benefícios do Prata',
      'Máxima prioridade em coletas',
      'Certificados premium',
      'Destaque especial no ranking',
      'Badge exclusiva no perfil'
    ],
    icon: <Trophy className="h-6 w-6" />,
    color: 'bg-yellow-100 text-yellow-700'
  }
];

const pointActions: PointAction[] = [
  {
    name: 'Primeira Coleta',
    points: 50,
    icon: <Package className="h-5 w-5" />,
    description: 'Realize sua primeira coleta'
  },
  {
    name: 'Coleta Regular',
    points: 10,
    icon: <Recycle className="h-5 w-5" />,
    description: 'Pontos por cada coleta realizada'
  },
  {
    name: 'Volume Reciclado',
    points: 5,
    icon: <Leaf className="h-5 w-5" />,
    description: 'Pontos a cada 5kg de material reciclado'
  },
  {
    name: 'Avaliação 5 Estrelas',
    points: 15,
    icon: <Star className="h-5 w-5" />,
    description: 'Receba uma avaliação 5 estrelas do coletor'
  },
  {
    name: 'Agendamento Recorrente',
    points: 30,
    icon: <Calendar className="h-5 w-5" />,
    description: 'Crie um agendamento recorrente'
  },
  {
    name: 'Metas Mensais',
    points: 100,
    icon: <CheckCircle2 className="h-5 w-5" />,
    description: 'Complete todas as metas do mês'
  }
];

const UserLevels: React.FC = () => {
  const navigate = useNavigate();
  
  // Usar dados reais
  const { userLevelData, loading } = useUserLevels('1'); // TODO: usar userId real
  
  if (loading) {
    return (
      <Layout>
        <div className="container py-6 px-4 md:px-6">
          <div className="text-center">Carregando dados de níveis...</div>
        </div>
      </Layout>
    );
  }
  
  if (!userLevelData) {
    return (
      <Layout>
        <div className="container py-6 px-4 md:px-6">
          <div className="text-center">Erro ao carregar dados de níveis</div>
        </div>
      </Layout>
    );
  }
  
  const { currentPoints, currentLevel, nextLevel, progressToNextLevel, levels, pointActions } = userLevelData;

  return (
    <Layout>
      <div className="container py-6 px-4 md:px-6">
        {/* Botão Voltar */}
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        {/* Nível Atual */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-neutro" />
              Seu Progresso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${userLevel.color}`}>
                  {userLevel.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold">Nível {currentLevel.name}</h3>
                    <Badge variant="secondary" className="bg-neutro/10 text-neutro">
                      {currentPoints} pontos
                    </Badge>
                  </div>
                  {nextLevel && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                        <span>{currentLevel.name}</span>
                        <span>{nextLevel.name}</span>
                      </div>
                      <Progress value={progressToNextLevel} className="h-2" />
                      <p className="text-sm text-muted-foreground mt-1">
                        Faltam {nextLevel.minPoints - currentPoints} pontos para o próximo nível
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Níveis e Benefícios */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-neutro" />
              Níveis e Benefícios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {levels.map((level, index) => (
                <div
                  key={level.name}
                  className={`flex items-start gap-4 p-4 rounded-lg ${
                    level.name === userLevel.name ? 'bg-neutro/5 border border-neutro/20' : 'bg-muted/50'
                  }`}
                >
                  <div className={`p-3 rounded-full ${level.color}`}>
                    {level.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{level.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {level.minPoints} - {level.maxPoints} pontos
                      </Badge>
                      {level.name === userLevel.name && (
                        <Badge variant="secondary" className="bg-neutro/10 text-neutro text-xs">
                          Nível Atual
                        </Badge>
                      )}
                    </div>
                    <ul className="space-y-1">
                      {level.benefits.map((benefit, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Como Ganhar Pontos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-neutro" />
              Como Ganhar Pontos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pointActions.map(action => (
                <div
                  key={action.name}
                  className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg"
                >
                  <div className="p-2 bg-neutro/10 rounded-full text-neutro">
                    {action.icon}
                  </div>
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      {action.name}
                      <Badge variant="secondary" className="bg-neutro/10 text-neutro text-xs">
                        +{action.points} pts
                      </Badge>
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default UserLevels; 