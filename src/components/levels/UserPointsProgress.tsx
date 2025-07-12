import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, TrendingUp, Target, Shield, AlertTriangle, Info } from 'lucide-react';
import { usePoints } from '@/hooks/usePoints';
import { userLevels } from './levelsData';
import { Level } from './types';

interface UserPointsProgressProps {
  className?: string;
  showDetails?: boolean;
}

export const UserPointsProgress: React.FC<UserPointsProgressProps> = ({
  className = '',
  showDetails = true
}) => {
  const { progress, loading, error } = usePoints();

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !progress) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-gray-500">
          <Target className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>Não foi possível carregar o progresso</p>
        </CardContent>
      </Card>
    );
  }

  const userType = progress.userType as keyof typeof userLevels;
  const currentLevelData = userLevels[userType]?.[progress.currentLevel];
  const nextLevel = getNextLevel(progress.currentLevel);
  const nextLevelData = userLevels[userType]?.[nextLevel];

  const getLevelColor = (level: Level) => {
    switch (level) {
      case 'bronze': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'silver': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelIcon = (level: Level) => {
    switch (level) {
      case 'bronze': return '🥉';
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      default: return '🏆';
    }
  };

  const calculateProgressToNextLevel = () => {
    if (!nextLevelData || progress.currentLevel === 'gold') {
      return 100;
    }

    const currentRequirements = currentLevelData?.requirements;
    const nextRequirements = nextLevelData?.requirements;
    
    if (!currentRequirements || !nextRequirements) return 0;

    // Calcular progresso baseado na métrica principal
    const primaryMetric = getPrimaryMetric(userType);
    const currentValue = progress[primaryMetric] || 0;
    const currentRequired = currentRequirements[primaryMetric] || 0;
    const nextRequired = nextRequirements[primaryMetric] || 0;
    
    if (nextRequired <= currentRequired) return 100;
    
    const progressPercentage = ((currentValue - currentRequired) / (nextRequired - currentRequired)) * 100;
    return Math.min(Math.max(progressPercentage, 0), 100);
  };

  const getPrimaryMetric = (userType: string) => {
    switch (userType) {
      case 'common': return 'collections';
      case 'collector': return 'collections';
      case 'partner': return 'activeCoupons';
      case 'cooperative': return 'collections';
      case 'company': return 'activeCollectors';
      default: return 'collections';
    }
  };

  const getMetricLabel = (userType: string) => {
    switch (userType) {
      case 'common': return 'Coletas';
      case 'collector': return 'Coletas';
      case 'partner': return 'Cupons';
      case 'cooperative': return 'Coletas';
      case 'company': return 'Coletores';
      default: return 'Coletas';
    }
  };

  const progressToNext = calculateProgressToNextLevel();
  const primaryMetric = getPrimaryMetric(userType);
  const metricLabel = getMetricLabel(userType);
  const currentValue = progress[primaryMetric] || 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Progresso de Nível
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Nível Atual */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getLevelIcon(progress.currentLevel)}</span>
            <div>
              <div className="font-semibold text-lg">
                {currentLevelData?.name || 'Nível'}
              </div>
              <div className="text-sm text-gray-600">
                {currentLevelData?.description}
              </div>
            </div>
          </div>
          <Badge className={getLevelColor(progress.currentLevel)}>
            {progress.currentLevel.toUpperCase()}
          </Badge>
        </div>

        {/* Pontos Totais */}
        <div className="flex items-center gap-2 text-sm">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="font-medium">{progress.totalPoints} pontos totais</span>
        </div>

        {/* Progresso para próximo nível */}
        {progress.currentLevel !== 'gold' && nextLevelData && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso para {nextLevelData.name}</span>
              <span>{progressToNext.toFixed(1)}%</span>
            </div>
            <Progress value={progressToNext} className="w-full" />
            <div className="text-xs text-gray-500">
              {currentValue} {metricLabel} de {nextLevelData.requirements[primaryMetric]} necessários
            </div>
          </div>
        )}

        {/* Sistema de Proteção de Nível */}
        {progress.protectionMonthsRemaining && progress.protectionMonthsRemaining > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-blue-500" />
              <h4 className="font-medium text-blue-700">Proteção de Nível Ativa</h4>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700">Meses de proteção restantes:</span>
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                  {progress.protectionMonthsRemaining} {progress.protectionMonthsRemaining === 1 ? 'mês' : 'meses'}
                </Badge>
              </div>
              {progress.protectionMonthsRemaining <= 1 && (
                <div className="flex items-center gap-2 text-sm text-orange-700">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Último mês de proteção! Melhore sua performance para manter o nível.</span>
                </div>
              )}
              {progress.levelAchievedDate && (
                <div className="text-xs text-blue-600">
                  Nível alcançado em: {progress.levelAchievedDate.toLocaleDateString('pt-BR')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Médias Mensais */}
        {(progress.monthlyAverageCollections || progress.monthlyAverageKg || progress.monthlyAverageRating) && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-gray-500" />
              <h4 className="font-medium text-gray-700">Médias dos Últimos 3 Meses</h4>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {progress.monthlyAverageCollections !== undefined && (
                <div>
                  <span className="text-gray-600">Coletas/mês:</span>
                  <span className="font-medium ml-1">{progress.monthlyAverageCollections}</span>
                </div>
              )}
              {progress.monthlyAverageKg !== undefined && (
                <div>
                  <span className="text-gray-600">Kg/mês:</span>
                  <span className="font-medium ml-1">{progress.monthlyAverageKg}</span>
                </div>
              )}
              {progress.monthlyAverageRating !== undefined && (
                <div>
                  <span className="text-gray-600">Avaliação/mês:</span>
                  <span className="font-medium ml-1">{progress.monthlyAverageRating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Detalhes do progresso */}
        {showDetails && (
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Métricas Detalhadas
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Coletas:</span>
                <span className="font-medium ml-1">{progress.collections}</span>
              </div>
              <div>
                <span className="text-gray-600">Kg:</span>
                <span className="font-medium ml-1">{progress.kg}</span>
              </div>
              <div>
                <span className="text-gray-600">Avaliações:</span>
                <span className="font-medium ml-1">{progress.ratings}</span>
              </div>
              <div>
                <span className="text-gray-600">Meses:</span>
                <span className="font-medium ml-1">{progress.months}</span>
              </div>
              {progress.activeCoupons > 0 && (
                <div>
                  <span className="text-gray-600">Cupons:</span>
                  <span className="font-medium ml-1">{progress.activeCoupons}</span>
                </div>
              )}
              {progress.activeCollectors > 0 && (
                <div>
                  <span className="text-gray-600">Coletores:</span>
                  <span className="font-medium ml-1">{progress.activeCollectors}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

function getNextLevel(currentLevel: Level): Level {
  switch (currentLevel) {
    case 'bronze': return 'silver';
    case 'silver': return 'gold';
    case 'gold': return 'gold';
    default: return 'bronze';
  }
} 