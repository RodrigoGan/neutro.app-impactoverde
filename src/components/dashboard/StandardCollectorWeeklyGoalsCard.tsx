import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target } from 'lucide-react';
import { standardCollectorWeeklyGoals } from './standard/mockData/standardCollectorWeeklyGoals';

const StandardCollectorWeeklyGoalsCard: React.FC = () => {
  const { collections, volume, rating } = standardCollectorWeeklyGoals;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-neutro" />
          Metas da Semana
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Coletas Realizadas */}
          <div className="flex items-center justify-between text-sm font-medium">
            <span>{collections.label}</span>
            <span>{collections.current}/{collections.total}</span>
          </div>
          <Progress value={(collections.current / collections.total) * 100} className="h-2" />

          {/* Volume de Materiais */}
          <div className="flex items-center justify-between text-sm font-medium mt-2">
            <span>{volume.label}</span>
            <span>{volume.current}/{volume.total} {volume.unit}</span>
          </div>
          <Progress value={(volume.current / volume.total) * 100} className="h-2" />

          {/* Avaliação Média */}
          <div className="flex items-center justify-between text-sm font-medium mt-2">
            <span>{rating.label}</span>
            <span>{rating.current}/{rating.total}</span>
          </div>
          <Progress value={(rating.current / rating.total) * 100} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default StandardCollectorWeeklyGoalsCard; 