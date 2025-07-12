import { supabase } from '@/lib/supabaseClient';
import { PointsService } from './PointsService';
import log from '@/lib/logger';

export interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  usageCount: number;
  maxUsage: number;
  referralCode: string;
}

export interface ReferralInfo {
  id: string;
  referrerId: string;
  referredId: string;
  referralCode: string;
  status: 'pending' | 'completed' | 'expired';
  pointsAwarded: boolean;
  createdAt: string;
  completedAt?: string;
}

export class ReferralService {
  /**
   * Gera código de indicação para um usuário
   */
  static async generateReferralCode(userId: string): Promise<string> {
    try {
      log.info('🔍 [ReferralService] Gerando código de indicação para usuário:', userId);
      
      const { data, error } = await supabase
        .rpc('generate_referral_code', { user_id: userId });
      
      if (error) {
        log.error('❌ [ReferralService] Erro ao gerar código:', error);
        throw error;
      }
      
      log.info('✅ [ReferralService] Código gerado:', data);
      return data;
    } catch (error) {
      log.error('❌ [ReferralService] Erro inesperado ao gerar código:', error);
      throw error;
    }
  }

  /**
   * Processa uma indicação usando código
   */
  static async processReferral(referralCode: string, referredUserId: string): Promise<boolean> {
    try {
      log.info('🔍 [ReferralService] Processando indicação:', { referralCode, referredUserId });
      
      const { data, error } = await supabase
        .rpc('process_referral', { 
          p_referral_code: referralCode, 
          p_referred_user_id: referredUserId 
        });
      
      if (error) {
        log.error('❌ [ReferralService] Erro ao processar indicação:', error);
        return false;
      }
      
      const success = data as boolean;
      log.info('✅ [ReferralService] Indicação processada:', success);
      
      return success;
    } catch (error) {
      log.error('❌ [ReferralService] Erro inesperado ao processar indicação:', error);
      return false;
    }
  }

  /**
   * Marca indicação como completa e dá pontos
   */
  static async completeReferral(referredUserId: string): Promise<boolean> {
    try {
      log.info('🔍 [ReferralService] Completando indicação para usuário:', referredUserId);
      
      // Buscar informação da indicação
      const { data: referral, error: referralError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referred_id', referredUserId)
        .eq('status', 'pending')
        .single();
      
      if (referralError || !referral) {
        log.warn('⚠️ [ReferralService] Indicação não encontrada ou já completa');
        return false;
      }
      
      // Marcar como completa
      const { data, error } = await supabase
        .rpc('complete_referral', { p_referred_user_id: referredUserId });
      
      if (error) {
        log.error('❌ [ReferralService] Erro ao completar indicação:', error);
        return false;
      }
      
      const success = data as boolean;
      
      if (success) {
        // Dar pontos ao referenciador
        try {
          await PointsService.addPoints(referral.referrer_id, 'common_referral', {
            referredUserId,
            referralCode: referral.referral_code
          });
          
          // Marcar pontos como concedidos
          await supabase
            .from('referrals')
            .update({ 
              points_awarded: true, 
              points_awarded_at: new Date().toISOString() 
            })
            .eq('id', referral.id);
          
          log.info('🎉 [ReferralService] Pontos concedidos ao referenciador:', referral.referrer_id);
        } catch (pointsError) {
          log.error('❌ [ReferralService] Erro ao dar pontos:', pointsError);
        }
      }
      
      log.info('✅ [ReferralService] Indicação completada:', success);
      return success;
    } catch (error) {
      log.error('❌ [ReferralService] Erro inesperado ao completar indicação:', error);
      return false;
    }
  }

  /**
   * Busca estatísticas de indicação de um usuário
   */
  static async getReferralStats(userId: string): Promise<ReferralStats | null> {
    try {
      log.info('🔍 [ReferralService] Buscando estatísticas de indicação para usuário:', userId);
      
      const { data, error } = await supabase
        .from('referral_stats')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        log.error('❌ [ReferralService] Erro ao buscar estatísticas:', error);
        return null;
      }
      
      const stats: ReferralStats = {
        totalReferrals: data.total_referrals || 0,
        completedReferrals: data.completed_referrals || 0,
        pendingReferrals: data.pending_referrals || 0,
        usageCount: data.usage_count || 0,
        maxUsage: data.max_usage || 10,
        referralCode: data.referral_code || ''
      };
      
      log.info('✅ [ReferralService] Estatísticas encontradas:', stats);
      return stats;
    } catch (error) {
      log.error('❌ [ReferralService] Erro inesperado ao buscar estatísticas:', error);
      return null;
    }
  }

  /**
   * Busca código de indicação de um usuário
   */
  static async getReferralCode(userId: string): Promise<string | null> {
    try {
      log.info('🔍 [ReferralService] Buscando código de indicação para usuário:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('referral_code')
        .eq('id', userId)
        .single();
      
      if (error) {
        log.error('❌ [ReferralService] Erro ao buscar código:', error);
        return null;
      }
      
      log.info('✅ [ReferralService] Código encontrado:', data.referral_code);
      return data.referral_code;
    } catch (error) {
      log.error('❌ [ReferralService] Erro inesperado ao buscar código:', error);
      return null;
    }
  }

  /**
   * Busca lista de indicações de um usuário
   */
  static async getUserReferrals(userId: string): Promise<ReferralInfo[]> {
    try {
      log.info('🔍 [ReferralService] Buscando indicações do usuário:', userId);
      
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          id,
          referrer_id,
          referred_id,
          referral_code,
          status,
          points_awarded,
          created_at,
          completed_at
        `)
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        log.error('❌ [ReferralService] Erro ao buscar indicações:', error);
        return [];
      }
      
      const referrals: ReferralInfo[] = data.map(item => ({
        id: item.id,
        referrerId: item.referrer_id,
        referredId: item.referred_id,
        referralCode: item.referral_code,
        status: item.status,
        pointsAwarded: item.points_awarded,
        createdAt: item.created_at,
        completedAt: item.completed_at
      }));
      
      log.info('✅ [ReferralService] Indicações encontradas:', referrals.length);
      return referrals;
    } catch (error) {
      log.error('❌ [ReferralService] Erro inesperado ao buscar indicações:', error);
      return [];
    }
  }

  /**
   * Verifica se um código de indicação é válido
   */
  static async validateReferralCode(code: string): Promise<{ valid: boolean; referrerId?: string }> {
    try {
      log.info('🔍 [ReferralService] Validando código de indicação:', code);
      
      const { data, error } = await supabase
        .from('referral_codes')
        .select('user_id, usage_count, max_usage, is_active, expires_at')
        .eq('code', code)
        .single();
      
      if (error || !data) {
        log.info('⚠️ [ReferralService] Código inválido:', code);
        return { valid: false };
      }
      
      const isValid = data.is_active && 
                     data.usage_count < data.max_usage &&
                     (!data.expires_at || new Date(data.expires_at) > new Date());
      
      log.info('✅ [ReferralService] Código validado:', { valid: isValid, referrerId: data.user_id });
      
      return {
        valid: isValid,
        referrerId: isValid ? data.user_id : undefined
      };
    } catch (error) {
      log.error('❌ [ReferralService] Erro ao validar código:', error);
      return { valid: false };
    }
  }

  /**
   * Gera link de compartilhamento
   */
  static generateShareLink(referralCode: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/register?ref=${referralCode}`;
  }

  /**
   * Compartilha indicação via Web Share API ou fallback
   */
  static async shareReferral(referralCode: string, message?: string): Promise<boolean> {
    const shareLink = this.generateShareLink(referralCode);
    const defaultMessage =
      'Você recebeu um convite para fazer parte da comunidade que está ajudando o planeta! Faça seu cadastro e ajude a modificar o mundo. Neutro: pequenos gestos, grandes impactos.';
    const shareText = message || `${defaultMessage}\n\nAcesse: ${shareLink}`;
    const shareImage = `${window.location.origin}/Image/compartilhamento.jpg`;

    // Tenta compartilhar nativamente
    if (navigator.share) {
      try {
        // Verifica se o navegador suporta compartilhamento com arquivos
        if ('canShare' in navigator && navigator.canShare({ files: [] })) {
          // Tenta compartilhar com imagem
          try {
            const response = await fetch(shareImage);
            const blob = await response.blob();
            const file = new File([blob], 'compartilhamento.jpg', { type: 'image/jpeg' });
            
            await navigator.share({
              title: 'Neutro - Impacto Verde',
              text: shareText,
              url: shareLink,
              files: [file]
            });
            return true;
          } catch (fileShareError) {
            // Se falhar ao compartilhar com arquivo, tenta sem
            log.warn('⚠️ [ReferralService] Falha ao compartilhar com imagem, tentando sem:', fileShareError);
          }
        }
        
        // Compartilhamento padrão (texto + URL)
        await navigator.share({
          title: 'Neutro - Impacto Verde',
          text: shareText,
          url: shareLink
        });
        return true;
      } catch (err) {
        // Se o usuário cancelar ou der erro, tenta fallback
        log.warn('⚠️ [ReferralService] Falha no compartilhamento nativo:', err);
      }
    }
    
    // Fallback: copiar para clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      if (typeof window !== 'undefined') {
        // Se houver toast, pode chamar aqui
        // Exemplo: toast({ title: 'Convite copiado!', description: 'Mensagem copiada para a área de transferência.' });
        console.log('Convite copiado para a área de transferência!');
      }
      return true;
    } catch (clipboardError) {
      log.error('❌ [ReferralService] Erro ao copiar para clipboard:', clipboardError);
      return false;
    }
  }
} 