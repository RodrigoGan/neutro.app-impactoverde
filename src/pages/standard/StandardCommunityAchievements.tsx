import React, { useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Trophy, Package, Star, Lock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { useCommunityRanking } from '@/hooks/useCommunityRanking';
import { useCommunityAchievements } from '@/hooks/useCommunityAchievements';
import { Badge } from '@/components/ui/badge';

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

const categories = [
  { key: 'coletas', label: 'Coletas' },
  { key: 'avaliacao', label: 'Avaliações' },
  { key: 'nivel', label: 'Níveis' }
];

const StandardCommunityAchievements: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obter dados do usuário da navegação ou usar fallback
  const user = location.state?.user || {};
  const neighborhoodId = user?.neighborhoodId || user?.neighborhood_id;
  
  // Usar dados reais dos hooks
  const { ranking, loading: loadingRanking, error: rankingError } = useCommunityRanking(neighborhoodId);
  const { achievements, loading: loadingAchievements, error: achievementsError } = useCommunityAchievements(neighborhoodId);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const handleBack = () => {
    navigate(-1);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }, 0);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            className="flex items-center gap-2 hover:bg-secondary/20"
            onClick={handleBack}
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
        
        {/* Ranking da Comunidade */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-neutro" />
              Ranking da Comunidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold mb-4">Ranking do Seu Bairro</h4>
              {loadingRanking ? (
                <div className="text-center py-8">Carregando ranking...</div>
              ) : rankingError ? (
                <div className="text-center text-red-500 py-8">Erro ao carregar ranking</div>
              ) : ranking.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Nenhum ranking disponível para seu bairro ainda.
                </div>
              ) : (
                ranking.map((user, index) => (
                  <div 
                    key={user.user_id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      user.isUser ? 'bg-neutro/5 border border-neutro/20' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        user.isUser ? 'bg-neutro/10 text-neutro' : 'bg-muted'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className={`font-medium ${user.isUser ? 'text-neutro' : ''}`}>{user.user_name}</p>
                        <p className="text-xs text-muted-foreground">{user.total_points} pts</p>
                      </div>
                    </div>
                    {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Conquistas da Comunidade */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-neutro" />
              Conquistas da Comunidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAchievements ? (
              <div className="text-center py-8">Carregando conquistas...</div>
            ) : achievementsError ? (
              <div className="text-center text-red-500 py-8">Erro ao carregar conquistas</div>
            ) : achievements.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Nenhuma conquista comunitária disponível ainda.
              </div>
            ) : (
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      achievement.unlocked_at ? 'bg-neutro/5 border-neutro/20' : 'bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-[120px]">
                      <div className="rounded-full p-2 bg-white border">
                        {achievement.achievements?.icon ? (
                          <img src={achievement.achievements.icon} alt="Ícone" className="w-6 h-6" />
                        ) : (
                          getIconComponent('Trophy', !!achievement.unlocked_at)
                        )}
                      </div>
                      <div>
                        <p className={`font-medium ${achievement.unlocked_at ? 'text-neutro' : ''}`}>
                          {achievement.achievements?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {achievement.achievements?.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <Progress 
                        value={achievement.unlocked_at ? 100 : 0} 
                        className="h-2" 
                      />
                      <div className="flex items-center justify-between text-xs">
                        <span>{achievement.unlocked_at ? '100' : '0'}%</span>
                        <span>{achievement.achievements?.points || 0} pts</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground min-w-[120px] text-right">
                      {achievement.unlocked_at ? (
                        <Badge variant="secondary">
                          {new Date(achievement.unlocked_at).toLocaleDateString('pt-BR')}
                        </Badge>
                      ) : (
                        achievement.achievements?.requirement || 'Em progresso'
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default StandardCommunityAchievements; 