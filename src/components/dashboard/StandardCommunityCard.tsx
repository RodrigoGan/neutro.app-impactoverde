import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, ChevronRight, Package, Star, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCommunityRanking } from '@/hooks/useCommunityRanking';
import { useCommunityAchievements } from '@/hooks/useCommunityAchievements';
import { useNavigate } from 'react-router-dom';

interface StandardCommunityCardProps {
  onSeeAll?: () => void;
  user?: any;
}

const getIconComponent = (iconName: string, unlocked: boolean) => {
  const className = unlocked ? 'h-8 w-8 text-neutro' : 'h-8 w-8 text-muted-foreground';
  switch (iconName) {
    case 'Package':
      return <Package className={className} />;
    case 'Star':
      return <Star className={className} />;
    case 'Trophy':
      return <Trophy className={className} />;
    case 'Lock':
      return <Lock className={className} />;
    default:
      return <Package className={className} />;
  }
};

const StandardCommunityCard: React.FC<StandardCommunityCardProps> = ({ onSeeAll, user }) => {
  const navigate = useNavigate();
  // Buscar o bairro do usuário (ajuste conforme sua estrutura)
  const neighborhoodId = user?.neighborhoodId || user?.neighborhood_id;
  const { ranking, loading: loadingRanking, error: rankingError } = useCommunityRanking(neighborhoodId);
  const { achievements, loading: loadingAchievements, error: achievementsError } = useCommunityAchievements(neighborhoodId);

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-neutro" />
          Comunidade
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <h4 className="text-sm font-semibold mb-4">Ranking do Seu Bairro</h4>
          {loadingRanking ? (
            <div className="text-center py-4">Carregando ranking...</div>
          ) : rankingError ? (
            <div className="text-center text-red-500 py-4">Erro ao carregar ranking</div>
          ) : ranking.length === 0 ? (
            <div className="text-muted-foreground py-2">Nenhum ranking disponível para seu bairro ainda.</div>
          ) : (
            <ul className="space-y-1 mt-2">
              {ranking.slice(0, 5).map((item, idx) => (
                <li key={item.user_id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50">
                  <span className="font-semibold text-sm">{idx + 1}º</span>
                  <span className="text-sm">{item.user_name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{item.total_points} pontos</span>
                </li>
              ))}
            </ul>
          )}

          {/* Conquistas Recentes */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold mb-4">Conquistas da Comunidade</h4>
            {loadingAchievements ? (
              <div className="text-center py-4">Carregando conquistas...</div>
            ) : achievementsError ? (
              <div className="text-center text-red-500 py-4">Erro ao carregar conquistas</div>
            ) : achievements.length === 0 ? (
              <div className="text-muted-foreground py-2">Nenhuma conquista comunitária desbloqueada ainda.</div>
            ) : (
              <ul className="space-y-2 mt-2">
                {achievements.slice(0, 3).map((item) => (
                  <li key={item.id} className="flex items-center gap-3 p-2 rounded-lg border">
                    <div className="flex-shrink-0">
                      {item.achievements?.icon ? (
                        <img src={item.achievements.icon} alt="Ícone" className="w-6 h-6" />
                      ) : (
                        <Trophy className="w-6 h-6 text-neutro" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{item.achievements?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.achievements?.description}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {new Date(item.unlocked_at).toLocaleDateString('pt-BR')}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => {
                if (user?.id) {
                  navigate('/user/achievements', { state: { userId: user.id } });
                } else if (onSeeAll) {
                  onSeeAll();
                }
              }}
            >
              Ver Todas as Conquistas
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StandardCommunityCard; 