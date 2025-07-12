import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Goal, Trophy, Leaf, Users, Package, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MonthlyGoal {
  id: string;
  title: string;
  current: number;
  total: number;
  points: number;
  icon: string;
}

interface GoalsProgressData {
  userLevel: {
    label: string;
    color: string;
  };
  currentPoints: number;
  nextLevelPoints: number;
  monthlyGoals: MonthlyGoal[];
  userName: string;
  onViewAll?: () => void;
}

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'goal':
      return <Goal className="h-5 w-5" />;
    case 'trophy':
      return <Trophy className="h-5 w-5" />;
    case 'leaf':
      return <Leaf className="h-5 w-5" />;
    case 'users':
      return <Users className="h-5 w-5" />;
    case 'package':
      return <Package className="h-5 w-5" />;
    case 'BookOpen':
      return <BookOpen className="h-5 w-5" />;
    default:
      return <Goal className="h-5 w-5" />;
  }
};

export const StandardGoalsProgressCard: React.FC<GoalsProgressData> = ({
  userLevel,
  currentPoints,
  nextLevelPoints,
  monthlyGoals,
  userName,
  onViewAll
}) => {
  const progressPercentage = (currentPoints / nextLevelPoints) * 100;

  return (
    <Card className="w-full">
      <CardHeader className="space-y-2 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center justify-between sm:flex-1 w-full">
            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
              <Trophy className="h-5 w-5 text-neutro" />
              Metas e Progresso
            </CardTitle>
            <span className={cn(
              "ml-2 px-2 py-1 rounded-full text-xs font-semibold bg-opacity-80",
              userLevel.color === 'gold' && "bg-yellow-100 text-yellow-800",
              userLevel.color === 'silver' && "bg-gray-100 text-gray-800",
              userLevel.color === 'bronze' && "bg-orange-100 text-orange-800"
            )}>
              Nível {userLevel.label}
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Acompanhe seu progresso e conquiste benefícios
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Pontos Atuais: {currentPoints}</span>
              <span>Próximo Nível: {nextLevelPoints}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Metas Mensais</h3>
            {monthlyGoals.map((goal) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getIconComponent(goal.icon)}
                    <span className="text-sm">{goal.title}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {goal.current}/{goal.total}
                  </span>
                </div>
                <Progress 
                  value={(goal.current / goal.total) * 100} 
                  className="h-2"
                />
                <div className="flex justify-end">
                  <span className="text-xs text-muted-foreground">
                    {goal.points} pontos
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full mt-6"
          onClick={onViewAll}
        >
          Ver Todas as Metas
        </Button>
      </CardContent>
    </Card>
  );
}; 