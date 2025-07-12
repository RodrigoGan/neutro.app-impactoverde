import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, CheckCircle2, ChevronRight, Package, Recycle, Star, Users, Truck, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Goal } from './standard/types';
import GoldLevelProgressCard from './standard/GoldLevelProgressCard';
import { Button } from '@/components/ui/button';

interface StandardGoalsProgressCardProps {
  title?: string;
  userLevel: {
    label: string;
    color?: string;
  };
  currentPoints: number;
  nextLevelPoints: number;
  monthlyGoals: Goal[];
  userName: string;
  maxLevelMessage?: string;
  maintenanceRequirements?: {
    description: string;
    icon: string;
  }[];
  benefits?: {
    description: string;
    icon: string;
  }[];
  userType: string;
}

const getIconComponent = (iconName: string) => {
  const icons: { [key: string]: React.ReactNode } = {
    Package: <Package className="h-4 w-4 text-neutro" />,
    Recycle: <Recycle className="h-4 w-4 text-neutro" />,
    Star: <Star className="h-4 w-4 text-neutro" />,
    Users: <Users className="h-4 w-4 text-neutro" />,
    Truck: <Truck className="h-4 w-4 text-neutro" />,
    Clock: <Clock className="h-4 w-4 text-neutro" />,
    Target: <Target className="h-4 w-4 text-neutro" />
  };
  return icons[iconName] || <Target className="h-4 w-4 text-neutro" />;
};

const StandardGoalsProgressCard: React.FC<StandardGoalsProgressCardProps> = ({
  title = "Metas e Progresso",
  userLevel,
  currentPoints,
  nextLevelPoints,
  monthlyGoals,
  userName,
  maxLevelMessage,
  maintenanceRequirements,
  benefits,
  userType
}) => {
  const navigate = useNavigate();
  const progressToNextLevel = (currentPoints / nextLevelPoints) * 100;
  const isGoldLevel = userLevel.label === 'Ouro';

  if (isGoldLevel) {
    return (
      <GoldLevelProgressCard
        title={title}
        userLevel={userLevel}
        maxLevelMessage={maxLevelMessage}
        maintenanceRequirements={maintenanceRequirements}
        benefits={benefits}
        userType={userType}
        currentPoints={currentPoints}
        nextLevelPoints={nextLevelPoints}
        monthlyGoals={monthlyGoals}
      />
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-2 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center justify-between sm:flex-1 w-full">
            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
              <Trophy className="h-5 w-5 text-neutro" />
              {title}
            </CardTitle>
            <Badge variant="secondary" className="bg-neutro/10 text-neutro">
              Nível {userLevel.label}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Acompanhe seu progresso e conquiste benefícios
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progresso do Nível */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-neutro" />
              <span className="text-sm font-medium">Progresso para o próximo nível</span>
            </div>
            <Badge variant="outline">
              {currentPoints}/{nextLevelPoints} pts
            </Badge>
          </div>
          <Progress value={progressToNextLevel} className="h-2" />
        </div>

        {/* Metas Mensais */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Metas do Mês</h3>
          </div>
          {monthlyGoals.length === 0 ? (
            <div className="text-center text-muted-foreground py-4 space-y-2">
              {userLevel.label === 'Ouro' ? (
                <div>Fique ligado! Em breve novas metas serão disponibilizadas.</div>
              ) : (
                <div>
                  Você está no nível <b>{userLevel.label}</b>. Para avançar para o próximo nível, acumule mais <b>{nextLevelPoints - currentPoints}</b> pontos.
                </div>
              )}
            </div>
          ) : (
            monthlyGoals.slice(0, 3).map((goal) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getIconComponent(goal.icon)}
                    <span className="text-sm">{goal.title}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {goal.currentProgress}/{goal.total}
                  </span>
                </div>
                <Progress 
                  value={(goal.currentProgress / goal.total) * 100} 
                  className="h-2"
                />
                <div className="flex justify-end">
                  <span className="text-xs text-muted-foreground">
                    {goal.points} pontos
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/standard/levels', {
              state: {
                userType,
                userLevel,
                currentPoints,
                nextLevelPoints,
                monthlyGoals
              }
            })}
          >
            Ver Todas as Metas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StandardGoalsProgressCard; 