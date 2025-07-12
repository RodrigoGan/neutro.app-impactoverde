import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ReferralService, ReferralStats, ReferralInfo } from '@/services/ReferralService';
import log from '@/lib/logger';

export const useReferral = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<ReferralInfo[]>([]);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados de indicação
  const loadReferralData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Carregar estatísticas
      const statsData = await ReferralService.getReferralStats(user.id);
      setStats(statsData);

      // Carregar código de indicação
      const code = await ReferralService.getReferralCode(user.id);
      setReferralCode(code);

      // Carregar lista de indicações
      const referralsData = await ReferralService.getUserReferrals(user.id);
      setReferrals(referralsData);

      log.info('✅ [useReferral] Dados de indicação carregados');
    } catch (err) {
      log.error('❌ [useReferral] Erro ao carregar dados:', err);
      setError('Erro ao carregar dados de indicação');
    } finally {
      setLoading(false);
    }
  };

  // Processar indicação
  const processReferral = async (code: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const success = await ReferralService.processReferral(code, user.id);
      if (success) {
        // Recarregar dados após processar indicação
        await loadReferralData();
      }
      return success;
    } catch (err) {
      log.error('❌ [useReferral] Erro ao processar indicação:', err);
      return false;
    }
  };

  // Completar indicação
  const completeReferral = async (): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const success = await ReferralService.completeReferral(user.id);
      if (success) {
        // Recarregar dados após completar indicação
        await loadReferralData();
      }
      return success;
    } catch (err) {
      log.error('❌ [useReferral] Erro ao completar indicação:', err);
      return false;
    }
  };

  // Validar código de indicação
  const validateCode = async (code: string) => {
    try {
      return await ReferralService.validateReferralCode(code);
    } catch (err) {
      log.error('❌ [useReferral] Erro ao validar código:', err);
      return { valid: false };
    }
  };

  // Compartilhar indicação
  const shareReferral = async (message?: string) => {
    if (!referralCode) return false;

    try {
      return await ReferralService.shareReferral(referralCode, message);
    } catch (err) {
      log.error('❌ [useReferral] Erro ao compartilhar:', err);
      return false;
    }
  };

  // Gerar link de compartilhamento
  const getShareLink = () => {
    if (!referralCode) return null;
    return ReferralService.generateShareLink(referralCode);
  };

  // Carregar dados quando usuário mudar
  useEffect(() => {
    loadReferralData();
  }, [user?.id]);

  return {
    // Dados
    stats,
    referrals,
    referralCode,
    loading,
    error,
    
    // Ações
    processReferral,
    completeReferral,
    validateCode,
    shareReferral,
    getShareLink,
    loadReferralData,
    
    // Utilitários
    hasReferralCode: !!referralCode,
    totalReferrals: stats?.totalReferrals || 0,
    completedReferrals: stats?.completedReferrals || 0,
    pendingReferrals: stats?.pendingReferrals || 0,
    usageCount: stats?.usageCount || 0,
    maxUsage: stats?.maxUsage || 10
  };
}; 