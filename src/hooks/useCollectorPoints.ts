import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface PointsData {
  currentPoints: number;
  currentLevel: string;
  nextLevel: string;
  pointsToNextLevel: number;
  monthlyProgress: Array<{
    month: string;
    points: number;
  }>;
  currentBenefits: string[];
  nextLevelBenefits: string[];
  activeQuests: Array<{
    title: string;
    description: string;
    points: number;
    progress: number;
  }>;
  achievements: Array<{
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
  }>;
  ranking: {
    globalPosition: number;
    regionalPosition: number;
    totalCollectors: number;
    topCollectors: Array<{
      name: string;
      points: number;
      position: number;
    }>;
  };
}

export const useCollectorPoints = (userId?: string) => {
  const [pointsData, setPointsData] = useState<PointsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCollectorPoints() {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('🔄 Buscando dados de pontos do coletor para:', userId);

        // Buscar progresso do usuário
        const { data: userProgress, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (progressError) throw progressError;

        const currentPoints = userProgress?.total_points || 0;
        const currentLevel = userProgress?.current_level || 1;

        // Determinar níveis
        const levelNames = ['Bronze', 'Prata', 'Ouro'];
        const currentLevelName = levelNames[Math.min(currentLevel - 1, 2)];
        const nextLevelName = levelNames[Math.min(currentLevel, 2)];

        // Calcular pontos para próximo nível
        const levelThresholds = [0, 500, 1000, 2000];
        const pointsToNextLevel = levelThresholds[Math.min(currentLevel, 3)];

        // Buscar coleções para calcular progresso mensal
        const { data: collections, error: collectionsError } = await supabase
          .from('collections')
          .select('created_at, total_value')
          .eq('collector_id', userId)
          .order('created_at', { ascending: false });

        if (collectionsError) throw collectionsError;

        // Calcular progresso mensal (últimos 6 meses)
        const monthlyProgress = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
          
          const monthCollections = (collections || []).filter(c => {
            const collectionDate = new Date(c.created_at);
            return collectionDate >= monthStart && collectionDate <= monthEnd;
          });

          const monthPoints = monthCollections.reduce((sum, c) => sum + (c.total_value || 0) * 0.1, 0);
          
          monthlyProgress.push({
            month: date.toLocaleDateString('pt-BR', { month: 'short' }),
            points: Math.floor(monthPoints)
          });
        }

        // Benefícios baseados no nível
        const currentBenefits = [
          'Todos os benefícios do Bronze',
          'Kit Neutro Prata: equipamentos de proteção individual',
          'Ranking "Top 5 Coletores Prata do Mês"',
          'Badge especial no perfil',
          'Bônus de 100 pontos'
        ];

        const nextLevelBenefits = [
          'Todos os benefícios da Prata',
          'Kit Neutro Ouro: kits higiênicos e benefícios premium',
          'Ranking "Top 5 Coletores Ouro do Mês"',
          'Badge exclusivo',
          'Bônus de 200 pontos',
          'Participação em sorteios especiais'
        ];

        // Buscar quests ativas
        const { data: quests, error: questsError } = await supabase
          .from('collector_quests')
          .select('*')
          .eq('collector_id', userId)
          .eq('is_active', true);

        if (questsError) throw questsError;

        const activeQuests = (quests || []).map(quest => ({
          title: quest.title,
          description: quest.description,
          points: quest.points_reward,
          progress: quest.progress || 0
        }));

        // Fallback para quests padrão
        if (activeQuests.length === 0) {
          activeQuests.push(
            {
              title: 'Coletor da Semana',
              description: 'Realize 5 coletas em 7 dias',
              points: 50,
              progress: 60
            },
            {
              title: 'Avaliação Perfeita',
              description: 'Mantenha 5 estrelas por 3 dias',
              points: 30,
              progress: 80
            },
            {
              title: 'Volume Máximo',
              description: 'Colete 200kg em uma semana',
              points: 40,
              progress: 62.5
            }
          );
        }

        // Buscar conquistas
        const { data: achievements, error: achievementsError } = await supabase
          .from('collector_achievements')
          .select('*')
          .eq('collector_id', userId);

        if (achievementsError) throw achievementsError;

        const achievementsList = (achievements || []).map(achievement => ({
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon || '🏆',
          unlocked: achievement.unlocked_at !== null
        }));

        // Fallback para conquistas padrão
        if (achievementsList.length === 0) {
          achievementsList.push(
            {
              title: 'Primeiro Mês',
              description: 'Complete um mês na plataforma',
              icon: '🌟',
              unlocked: true
            },
            {
              title: 'Coletor Bronze',
              description: 'Alcance o nível Bronze',
              icon: '🥉',
              unlocked: currentLevel >= 1
            },
            {
              title: 'Coletor Prata',
              description: 'Alcance o nível Prata',
              icon: '🥈',
              unlocked: currentLevel >= 2
            },
            {
              title: 'Coletor Ouro',
              description: 'Alcance o nível Ouro',
              icon: '🥇',
              unlocked: currentLevel >= 3
            }
          );
        }

        // Buscar ranking
        const { data: allCollectors, error: rankingError } = await supabase
          .from('users')
          .select(`
            id,
            name,
            user_progress (
              total_points
            )
          `)
          .eq('user_type', 'individual_collector')
          .order('user_progress.total_points', { ascending: false });

        if (rankingError) throw rankingError;

        const globalPosition = (allCollectors || []).findIndex(c => c.id === userId) + 1;
        const totalCollectors = allCollectors?.length || 0;
        const topCollectors = (allCollectors || []).slice(0, 3).map((collector, index) => ({
          name: collector.name,
          points: collector.user_progress?.[0]?.total_points || 0,
          position: index + 1
        }));

        const ranking = {
          globalPosition,
          regionalPosition: Math.floor(globalPosition / 10) + 1, // Simplificado
          totalCollectors,
          topCollectors
        };

        const pointsData: PointsData = {
          currentPoints,
          currentLevel: currentLevelName,
          nextLevel: nextLevelName,
          pointsToNextLevel,
          monthlyProgress,
          currentBenefits,
          nextLevelBenefits,
          activeQuests,
          achievements: achievementsList,
          ranking
        };

        console.log('✅ Dados de pontos do coletor carregados:', pointsData);
        setPointsData(pointsData);

      } catch (err) {
        console.error('❌ Erro ao buscar dados de pontos do coletor:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados de pontos');
        setPointsData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchCollectorPoints();
  }, [userId]);

  return {
    pointsData,
    loading,
    error
  };
}; 