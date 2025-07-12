import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface Level {
  name: string;
  minPoints: number;
  maxPoints: number;
  benefits: string[];
  icon: string;
  color: string;
}

export interface PointAction {
  name: string;
  points: number;
  icon: string;
  description: string;
}

export interface UserLevelData {
  currentPoints: number;
  currentLevel: Level;
  nextLevel?: Level;
  progressToNextLevel: number;
  levels: Level[];
  pointActions: PointAction[];
}

export const useUserLevels = (userId?: string) => {
  const [userLevelData, setUserLevelData] = useState<UserLevelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserLevels() {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('🔄 Buscando dados de níveis para:', userId);

        // Buscar progresso do usuário
        const { data: userProgress, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (progressError) throw progressError;

        const currentPoints = userProgress?.total_points || 0;

        // Definir níveis (pode vir do banco também)
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
            icon: '🏆',
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
            icon: '🏆',
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
            icon: '🏆',
            color: 'bg-yellow-100 text-yellow-700'
          }
        ];

        // Encontrar nível atual
        const currentLevel = levels.find(level => 
          currentPoints >= level.minPoints && currentPoints <= level.maxPoints
        ) || levels[0];

        // Encontrar próximo nível
        const nextLevel = levels[levels.indexOf(currentLevel) + 1];

        // Calcular progresso para o próximo nível
        const progressToNextLevel = nextLevel
          ? ((currentPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
          : 100;

        // Buscar ações que geram pontos
        const { data: pointActionsData, error: actionsError } = await supabase
          .from('point_actions')
          .select('*')
          .order('points', { ascending: false });

        if (actionsError) throw actionsError;

        const pointActions: PointAction[] = (pointActionsData || []).map(action => ({
          name: action.name,
          points: action.points,
          icon: action.icon,
          description: action.description
        }));

        // Fallback para ações padrão se não houver no banco
        if (pointActions.length === 0) {
          pointActions.push(
            {
              name: 'Primeira Coleta',
              points: 50,
              icon: '📦',
              description: 'Realize sua primeira coleta'
            },
            {
              name: 'Coleta Regular',
              points: 10,
              icon: '♻️',
              description: 'Pontos por cada coleta realizada'
            },
            {
              name: 'Volume Reciclado',
              points: 5,
              icon: '🌱',
              description: 'Pontos a cada 5kg de material reciclado'
            },
            {
              name: 'Avaliação 5 Estrelas',
              points: 15,
              icon: '⭐',
              description: 'Receba uma avaliação 5 estrelas do coletor'
            },
            {
              name: 'Agendamento Recorrente',
              points: 30,
              icon: '📅',
              description: 'Crie um agendamento recorrente'
            },
            {
              name: 'Metas Mensais',
              points: 100,
              icon: '✅',
              description: 'Complete todas as metas do mês'
            }
          );
        }

        const userLevelData: UserLevelData = {
          currentPoints,
          currentLevel,
          nextLevel,
          progressToNextLevel,
          levels,
          pointActions
        };

        console.log('✅ Dados de níveis carregados:', userLevelData);
        setUserLevelData(userLevelData);

      } catch (err) {
        console.error('❌ Erro ao buscar dados de níveis:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados de níveis');
        setUserLevelData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUserLevels();
  }, [userId]);

  return {
    userLevelData,
    loading,
    error
  };
}; 