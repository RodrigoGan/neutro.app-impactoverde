import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAchievements } from '@/hooks/useAchievements';
import { useLevels } from '@/hooks/useLevels';

interface AchievementsSectionProps {
  userId?: string;
  userType?: string;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  userId,
  userType = 'common'
}) => {
  const { achievements, loading: achievementsLoading, error: achievementsError, getIconComponent } = useAchievements(userId);
  const { levelProgress, loading: levelsLoading, error: levelsError } = useLevels(userId, userType);

  const loading = achievementsLoading || levelsLoading;
  const error = achievementsError || levelsError;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Conquistas e Progresso</h2>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Conquistas e Progresso</h2>
          <div className="text-red-500 text-sm">
            Erro ao carregar conquistas: {error}
          </div>
        </div>
      </div>
    );
  }

  const levelProgressValue = levelProgress ? (levelProgress.currentPoints / levelProgress.nextLevelPoints) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Conquistas e Progresso</h2>
        
        {/* Nível e Progresso */}
        {levelProgress && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-medium">Nível {levelProgress.currentLevel}</span>
                <span className="text-sm text-muted-foreground">
                  {levelProgress.currentPoints} / {levelProgress.nextLevelPoints} pontos
                </span>
              </div>
              <Progress value={levelProgressValue} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                Faltam {levelProgress.nextLevelPoints - levelProgress.currentPoints} pontos para o próximo nível
              </p>
            </CardContent>
          </Card>
        )}

        {/* Lista de Conquistas */}
        <div className="grid gap-4">
          {achievements.map((achievement) => {
            const IconComponent = getIconComponent(achievement.icon);
            return (
              <Card key={achievement.id} className={achievement.unlocked_at ? 'bg-green-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{achievement.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                      {achievement.unlocked_at ? (
                        <p className="text-sm text-green-600 mt-1">
                          Desbloqueado em {new Date(achievement.unlocked_at).toLocaleDateString()}
                        </p>
                      ) : achievement.progress !== undefined ? (
                        <div className="mt-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progresso</span>
                            <span>{achievement.progress}%</span>
                          </div>
                          <Progress value={achievement.progress} className="h-1" />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}; 