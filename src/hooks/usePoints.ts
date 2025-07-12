import { useState, useEffect } from 'react';
import { PointsService, UserProgress } from '@/services/PointsService';
import { useAuth } from '@/contexts/AuthContext';
import log from '@/lib/logger';

export const usePoints = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Log do estado do usuário
  useEffect(() => {
    log.info('🔍 [usePoints] Estado do usuário:', { 
      hasUser: !!user, 
      userId: user?.id,
      userEmail: user?.email 
    });
  }, [user]);

  // Carregar progresso do usuário
  const loadProgress = async () => {
    log.info('🔍 [usePoints] loadProgress chamado:', { 
      hasUser: !!user, 
      userId: user?.id 
    });

    if (!user?.id) {
      log.warn('⚠️ [usePoints] Usuário não encontrado, não carregando progresso');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      log.info('🔍 [usePoints] Carregando progresso do usuário:', user.id);
      const userProgress = await PointsService.getUserProgress(user.id);
      log.info('🔍 [usePoints] Progresso carregado:', userProgress);
      setProgress(userProgress);
      setError(null);
    } catch (err) {
      log.error('❌ [usePoints] Erro ao carregar progresso:', err);
      setError('Erro ao carregar progresso');
      console.error('Erro ao carregar progresso:', err);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar pontos para uma ação
  const addPoints = async (
    actionKey: string, 
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; pointsAdded: number; newTotal: number }> => {
    log.info('🔍 [usePoints] addPoints chamado:', { 
      actionKey, 
      metadata, 
      hasUser: !!user, 
      userId: user?.id 
    });

    if (!user?.id) {
      log.error('❌ [usePoints] Usuário não encontrado para adicionar pontos');
      return { success: false, pointsAdded: 0, newTotal: 0 };
    }

    try {
      const result = await PointsService.addPoints(user.id, actionKey, metadata);
      log.info('🔍 [usePoints] Resultado do addPoints:', result);
      
      if (result.success) {
        // Recarregar progresso após adicionar pontos
        log.info('🔍 [usePoints] Recarregando progresso após adicionar pontos');
        await loadProgress();
      }
      
      return result;
    } catch (err) {
      log.error('❌ [usePoints] Erro ao adicionar pontos:', err);
      console.error('Erro ao adicionar pontos:', err);
      return { success: false, pointsAdded: 0, newTotal: 0 };
    }
  };

  // Buscar histórico de pontos
  const getPointsHistory = async (limit = 50) => {
    if (!user?.id) return [];
    
    try {
      return await PointsService.getPointsHistory(user.id, limit);
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
      return [];
    }
  };

  // Obter tabela de pontuação
  const getPointsTable = () => {
    return PointsService.getPointsTable();
  };

  // Funções para sistema de proteção de nível
  const evaluateUserLevel = async () => {
    if (!user?.id) return;
    
    try {
      await PointsService.evaluateUserLevel(user.id);
      await loadProgress(); // Recarregar progresso após avaliação
    } catch (err) {
      console.error('Erro ao avaliar nível:', err);
    }
  };

  const getLevelNotifications = async (limit = 10) => {
    if (!user?.id) return [];
    
    try {
      return await PointsService.getLevelNotifications(user.id, limit);
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
      return [];
    }
  };

  // Carregar progresso quando o usuário mudar
  useEffect(() => {
    loadProgress();
  }, [user?.id]);

  return {
    progress,
    loading,
    error,
    addPoints,
    getPointsHistory,
    getPointsTable,
    loadProgress,
    refreshProgress: loadProgress,
    evaluateUserLevel,
    getLevelNotifications
  };
}; 