import { supabase } from '@/lib/supabaseClient';
import { userLevels } from '@/components/levels/levelsData';
import { Level, LevelRequirements } from '@/components/levels/types';
import { getMetricsForUserType, getPrimaryMetric } from '@/config/userMetrics';
import log from '@/lib/logger';

export interface UserProgress {
  userId: string;
  userType: 'common' | 'collector' | 'partner' | 'cooperative' | 'company';
  currentLevel: Level;
  totalPoints: number;
  collections: number;
  kg: number;
  ratings: number;
  months: number;
  activeCoupons: number;
  sales: number;
  activeCollectors: number;
  averageRating: number;
  lastUpdated: Date;
  // Campos para sistema de proteção de nível
  levelAchievedDate?: Date;
  protectionMonthsRemaining?: number;
  monthlyAverageCollections?: number;
  monthlyAverageKg?: number;
  monthlyAverageRating?: number;
  lastNotificationSent?: Date;
  notificationType?: 'protection' | 'alert' | 'drop';
}

export interface LevelNotification {
  id: string;
  userId: string;
  notificationType: 'protection' | 'alert' | 'drop';
  message: string;
  sentAt: Date;
  readAt?: Date;
  actionRequired: Record<string, any>;
}

export interface PointsAction {
  action: string;
  points: number;
  description: string;
  userType: 'common' | 'collector' | 'partner' | 'cooperative' | 'company';
}

export class PointsService {
  // Tabela de pontuação padronizada por ação
  private static readonly POINTS_TABLE: Record<string, PointsAction> = {
    // Usuário Comum
    'common_request_collection': {
      action: 'Solicitar Coleta',
      points: 10,
      description: 'Solicitação de coleta de recicláveis',
      userType: 'common'
    },
    'common_daily_login': {
      action: 'Login Diário',
      points: 1,
      description: 'Login diário na plataforma',
      userType: 'common'
    },
    'common_rate_collector': {
      action: 'Avaliar Coletor',
      points: 5,
      description: 'Avaliação de coletor após coleta',
      userType: 'common'
    },
    'common_referral': {
      action: 'Indicação de Usuário',
      points: 50,
      description: 'Indicação de novo usuário',
      userType: 'common'
    },
    'common_cancel_last_minute': {
      action: 'Cancelamento em Cima da Hora',
      points: -5,
      description: 'Cancelou coleta em cima da hora',
      userType: 'common'
    },
    'common_fake_request': {
      action: 'Falso Agendamento',
      points: -10,
      description: 'Solicitou coleta e não entregou materiais',
      userType: 'common'
    },

    // Coletor
    'collector_accept_collection': {
      action: 'Aceitar Coleta',
      points: 15,
      description: 'Aceitar solicitação de coleta',
      userType: 'collector'
    },
    'collector_complete_collection': {
      action: 'Completar Coleta',
      points: 25,
      description: 'Completar coleta com sucesso',
      userType: 'collector'
    },
    'collector_high_rating': {
      action: 'Avaliação Alta',
      points: 10,
      description: 'Receber avaliação 4-5 estrelas',
      userType: 'collector'
    },
    'collector_on_time': {
      action: 'Pontualidade',
      points: 5,
      description: 'Chegar no horário agendado',
      userType: 'collector'
    },
    'collector_late': {
      action: 'Atraso',
      points: -10,
      description: 'Chegar atrasado na coleta',
      userType: 'collector'
    },

    // Parceiro
    'partner_create_coupon': {
      action: 'Criar Cupom',
      points: 20,
      description: 'Criar cupom de desconto',
      userType: 'partner'
    },
    'partner_coupon_used': {
      action: 'Cupom Utilizado',
      points: 15,
      description: 'Cupom utilizado por cliente',
      userType: 'partner'
    },
    'partner_high_rating': {
      action: 'Avaliação Alta',
      points: 10,
      description: 'Receber avaliação alta de cliente',
      userType: 'partner'
    },
    'partner_coupon_not_honored': {
      action: 'Cupom Não Honrado / Promoção Falsa',
      points: -20,
      description: 'Cliente denunciou cupom não aceito, promoção falsa ou outro motivo',
      userType: 'partner'
    },

    // Cooperativa
    'cooperative_complete_collection': {
      action: 'Completar Coleta',
      points: 25,
      description: 'Completar coleta de recicláveis',
      userType: 'cooperative'
    },
    'cooperative_sell_to_company': {
      action: 'Vender para Empresa',
      points: 30,
      description: 'Vender materiais para empresa coletora',
      userType: 'cooperative'
    },
    'cooperative_process_volume': {
      action: 'Processar Volume',
      points: 2,
      description: 'Processar 1kg de material',
      userType: 'cooperative'
    },
    'cooperative_cancel_sale': {
      action: 'Cancelamento de Venda Após Acordo',
      points: -15,
      description: 'Cancelou venda após acordo fechado',
      userType: 'cooperative'
    },
    'cooperative_less_volume': {
      action: 'Volume Não Entregue',
      points: -10,
      description: 'Não entregou o volume prometido',
      userType: 'cooperative'
    },

    // Empresa
    'company_buy_from_collector': {
      action: 'Comprar do Coletor',
      points: 20,
      description: 'Comprar materiais de coletor individual',
      userType: 'company'
    },
    'company_buy_from_cooperative': {
      action: 'Comprar de Cooperativa',
      points: 30,
      description: 'Comprar materiais de cooperativa',
      userType: 'company'
    },
    'company_complete_collection': {
      action: 'Realizar Coleta',
      points: 15,
      description: 'Realizar coleta de recicláveis',
      userType: 'company'
    },
    'company_cancel_purchase': {
      action: 'Cancelamento de Compra Após Negociação',
      points: -15,
      description: 'Cancelou compra após negociação fechada',
      userType: 'company'
    },

    // ===== AÇÕES DE SIMULAÇÃO PARA TESTES =====
    'test_high_rating': {
      action: 'Avaliação Alta (Teste)',
      points: 0,
      description: 'Simular avaliação alta para testes',
      userType: 'common'
    },
    'test_bulk_collections': {
      action: 'Múltiplas Coletas (Teste)',
      points: 0,
      description: 'Simular múltiplas coletas para testes',
      userType: 'common'
    },
    'test_high_kg': {
      action: 'Volume Alto (Teste)',
      points: 0,
      description: 'Simular volume alto para testes',
      userType: 'common'
    },
    'test_level_up_silver': {
      action: 'Level Up Prata (Teste)',
      points: 0,
      description: 'Forçar level up para Prata',
      userType: 'common'
    },
    'test_level_up_gold': {
      action: 'Level Up Ouro (Teste)',
      points: 0,
      description: 'Forçar level up para Ouro',
      userType: 'common'
    },
  };

  /**
   * Adiciona pontos para uma ação específica
   */
  static async addPoints(
    userId: string, 
    actionKey: string, 
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; pointsAdded: number; newTotal: number }> {
    try {
      log.info('🔍 [PointsService] Iniciando addPoints:', { userId, actionKey, metadata });
      
      // Verificar se o usuário está logado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      log.info('🔍 [PointsService] Status da autenticação:', { 
        isLoggedIn: !!user, 
        userId: user?.id,
        authError: authError?.message 
      });

      if (authError || !user) {
        log.error('❌ [PointsService] Usuário não está logado:', authError);
        throw new Error('Usuário não está autenticado');
      }

      if (user.id !== userId) {
        log.error('❌ [PointsService] ID do usuário não confere:', { 
          providedUserId: userId, 
          authenticatedUserId: user.id 
        });
        throw new Error('ID do usuário não confere');
      }

      const action = this.POINTS_TABLE[actionKey];
      if (!action) {
        log.error('❌ [PointsService] Ação não encontrada:', actionKey);
        throw new Error(`Ação não encontrada: ${actionKey}`);
      }

      log.info('✅ [PointsService] Ação encontrada:', action);

      // Buscar progresso atual do usuário
      log.info('🔍 [PointsService] Buscando progresso atual do usuário...');
      const { data: progress, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      log.info('🔍 [PointsService] Resultado da busca de progresso:', { 
        hasProgress: !!progress, 
        error: error?.message,
        progress 
      });

      if (error && error.code !== 'PGRST116') {
        log.error('❌ [PointsService] Erro ao buscar progresso:', error);
        throw error;
      }

      const currentProgress = progress || {
        user_id: userId,
        total_points: 0,
        collections: 0,
        kg: 0,
        ratings: 0,
        months: 0,
        active_coupons: 0,
        sales: 0,
        active_collectors: 0,
        average_rating: 0,
        current_level: 'bronze',
        user_type: action.userType
      };

      log.info('📊 [PointsService] Progresso atual:', currentProgress);

      // Atualizar pontos
      const newTotalPoints = currentProgress.total_points + action.points;
      log.info('📈 [PointsService] Novos pontos:', { 
        currentPoints: currentProgress.total_points, 
        pointsToAdd: action.points, 
        newTotal: newTotalPoints 
      });

      // Atualizar métricas específicas baseado na ação
      const updatedProgress = this.updateMetrics(currentProgress, actionKey, metadata);

      // --- INÍCIO: Lógica de bônus automático melhorada ---
      let totalBonusPoints = 0;
      const bonusesApplied: Array<{action: string, points: number, reason: string}> = [];

      // 1. Bônus por atingir 5 coletas no mês (usuário comum)
      if (actionKey === 'common_request_collection' && updatedProgress.collections === 5) {
        const bonus = 20;
        totalBonusPoints += bonus;
        bonusesApplied.push({
          action: 'bonus_5_coletas_mes',
          points: bonus,
          reason: 'Atingiu 5 coletas no mês'
        });
        log.info('🎉 [PointsService] Bônus de 20 pontos aplicado por 5 coletas no mês!');
      }

      // 2. Bônus por avaliação média alta (usuário comum)
      if (actionKey === 'common_rate_collector' && updatedProgress.average_rating >= 4.5) {
        const bonus = 15;
        totalBonusPoints += bonus;
        bonusesApplied.push({
          action: 'bonus_avaliacao_alta',
          points: bonus,
          reason: 'Manteve avaliação média acima de 4.5'
        });
        log.info('🎉 [PointsService] Bônus de 15 pontos aplicado por avaliação alta!');
      }

      // 2.1. Pontualidade do coletor (nova funcionalidade)
      if (actionKey === 'common_rate_collector' && metadata?.pontual !== undefined) {
        const coletorId = metadata?.coletorId;
        if (coletorId) {
          const pontualAction = metadata.pontual ? 'collector_on_time' : 'collector_late';
          const pontualPoints = metadata.pontual ? 5 : -10;
          
          // Aplicar pontos de pontualidade ao coletor
          try {
            const pontualResult = await this.addPoints(coletorId, pontualAction, {
              avaliadoPor: userId,
              estrelas: metadata.estrelas || 0
            });
            
            if (pontualResult.success) {
              bonusesApplied.push({
                action: pontualAction,
                points: pontualPoints,
                reason: metadata.pontual ? 'Chegou no horário' : 'Chegou atrasado'
              });
              log.info(`🎯 [PointsService] Pontualidade aplicada ao coletor ${coletorId}: ${pontualPoints} pontos`);
            }
          } catch (error) {
            log.error('❌ [PointsService] Erro ao aplicar pontualidade ao coletor:', error);
          }
        }
      }

      // 3. Bônus por 10 coletas no mês (coletor)
      if (actionKey === 'collector_complete_collection' && updatedProgress.collections === 10) {
        const bonus = 50;
        totalBonusPoints += bonus;
        bonusesApplied.push({
          action: 'bonus_10_coletas_mes',
          points: bonus,
          reason: 'Completou 10 coletas no mês'
        });
        log.info('🎉 [PointsService] Bônus de 50 pontos aplicado por 10 coletas no mês!');
      }

      // 4. Bônus por avaliação alta (coletor)
      if (actionKey === 'collector_high_rating' && updatedProgress.average_rating >= 4.8) {
        const bonus = 30;
        totalBonusPoints += bonus;
        bonusesApplied.push({
          action: 'bonus_avaliacao_excelente',
          points: bonus,
          reason: 'Manteve avaliação média acima de 4.8'
        });
        log.info('🎉 [PointsService] Bônus de 30 pontos aplicado por avaliação excelente!');
      }

      // 5. Bônus por volume alto (coletor)
      if (actionKey === 'collector_complete_collection' && updatedProgress.kg >= 200) {
        const bonus = 25;
        totalBonusPoints += bonus;
        bonusesApplied.push({
          action: 'bonus_volume_alto',
          points: bonus,
          reason: 'Vendeu mais de 200kg no mês'
        });
        log.info('🎉 [PointsService] Bônus de 25 pontos aplicado por volume alto!');
      }

      // 6. Bônus por criar 10 cupons (parceiro)
      if (actionKey === 'partner_create_coupon' && updatedProgress.active_coupons === 10) {
        const bonus = 100;
        totalBonusPoints += bonus;
        bonusesApplied.push({
          action: 'bonus_10_cupons',
          points: bonus,
          reason: 'Criou 10 cupons no mês'
        });
        log.info('🎉 [PointsService] Bônus de 100 pontos aplicado por 10 cupons!');
      }

      // 7. Bônus por avaliação alta (parceiro)
      if (actionKey === 'partner_high_rating' && updatedProgress.average_rating >= 4.5) {
        const bonus = 50;
        totalBonusPoints += bonus;
        bonusesApplied.push({
          action: 'bonus_avaliacao_parceiro',
          points: bonus,
          reason: 'Manteve avaliação média acima de 4.5'
        });
        log.info('🎉 [PointsService] Bônus de 50 pontos aplicado por avaliação alta do parceiro!');
      }

      // 8. Bônus por 5 ações (cooperativa)
      if (actionKey === 'cooperative_organize_action' && updatedProgress.collections === 5) {
        const bonus = 150;
        totalBonusPoints += bonus;
        bonusesApplied.push({
          action: 'bonus_5_acoes',
          points: bonus,
          reason: 'Organizou 5 ações no mês'
        });
        log.info('🎉 [PointsService] Bônus de 150 pontos aplicado por 5 ações!');
      }

      // 9. Bônus por volume alto (cooperativa)
      if (actionKey === 'cooperative_organize_action' && updatedProgress.kg >= 1000) {
        const bonus = 200;
        totalBonusPoints += bonus;
        bonusesApplied.push({
          action: 'bonus_volume_cooperativa',
          points: bonus,
          reason: 'Coletou mais de 1000kg no mês'
        });
        log.info('🎉 [PointsService] Bônus de 200 pontos aplicado por volume alto da cooperativa!');
      }

      // 10. Bônus por cadastrar 3 coletores (empresa)
      if (actionKey === 'company_hire_collector' && updatedProgress.active_collectors === 3) {
        const bonus = 150;
        totalBonusPoints += bonus;
        bonusesApplied.push({
          action: 'bonus_3_coletores',
          points: bonus,
          reason: 'Cadastrou 3 coletores no mês'
        });
        log.info('🎉 [PointsService] Bônus de 150 pontos aplicado por 3 coletores!');
      }

      // 11. Bônus por satisfação alta (empresa)
      if (actionKey === 'company_high_satisfaction' && updatedProgress.average_rating >= 4.7) {
        const bonus = 90;
        totalBonusPoints += bonus;
        bonusesApplied.push({
          action: 'bonus_satisfacao_empresa',
          points: bonus,
          reason: 'Manteve satisfação acima de 4.7'
        });
        log.info('🎉 [PointsService] Bônus de 90 pontos aplicado por alta satisfação!');
      }

      // 12. Bônus por compras de materiais (empresa)
      if (actionKey === 'company_buy_recyclables' && updatedProgress.sales >= 10) {
        const bonus = 80;
        totalBonusPoints += bonus;
        bonusesApplied.push({
          action: 'bonus_compras_materiais',
          points: bonus,
          reason: 'Realizou 10+ compras de materiais no mês'
        });
        log.info('🎉 [PointsService] Bônus de 80 pontos aplicado por compras de materiais!');
      }

      // 13. Bônus por coletas da cooperativa
      if (actionKey === 'cooperative_complete_collection' && updatedProgress.collections === 15) {
        const bonus = 100;
        totalBonusPoints += bonus;
        bonusesApplied.push({
          action: 'bonus_15_coletas_cooperativa',
          points: bonus,
          reason: 'Realizou 15 coletas no mês'
        });
        log.info('🎉 [PointsService] Bônus de 100 pontos aplicado por 15 coletas da cooperativa!');
      }

      // 14. Bônus por vendas da cooperativa
      if (actionKey === 'cooperative_sell_to_company' && updatedProgress.sales === 8) {
        const bonus = 150;
        totalBonusPoints += bonus;
        bonusesApplied.push({
          action: 'bonus_8_vendas_cooperativa',
          points: bonus,
          reason: 'Fez 8 vendas para empresas no mês'
        });
        log.info('🎉 [PointsService] Bônus de 150 pontos aplicado por 8 vendas da cooperativa!');
      }

      // 15. Bônus por volume da cooperativa
      if (actionKey === 'cooperative_process_volume' && updatedProgress.kg >= 500) {
        const bonus = 200;
        totalBonusPoints += bonus;
        bonusesApplied.push({
          action: 'bonus_500kg_cooperativa',
          points: bonus,
          reason: 'Processou mais de 500kg no mês'
        });
        log.info('🎉 [PointsService] Bônus de 200 pontos aplicado por 500kg da cooperativa!');
      }

      // 16. Bônus por cadastro de coletores (empresa)
      if (actionKey === 'company_hire_collector' && updatedProgress.active_collectors === 5) {
        const bonus = 150;
        totalBonusPoints += bonus;
        bonusesApplied.push({
          action: 'bonus_5_coletores_empresa',
          points: bonus,
          reason: 'Cadastrou 5 coletores no mês'
        });
        log.info('🎉 [PointsService] Bônus de 150 pontos aplicado por 5 coletores da empresa!');
      }

      // 17. Bônus por vendas para coletores (empresa)
      if (actionKey === 'company_sell_to_collector' && updatedProgress.sales === 10) {
        const bonus = 200;
        totalBonusPoints += bonus;
        bonusesApplied.push({
          action: 'bonus_10_vendas_coletores_empresa',
          points: bonus,
          reason: 'Fez 10 vendas para coletores no mês'
        });
        log.info('🎉 [PointsService] Bônus de 200 pontos aplicado por 10 vendas para coletores!');
      }

      // 18. Bônus por vendas para cooperativas (empresa)
      if (actionKey === 'company_sell_to_cooperative' && updatedProgress.sales === 5) {
        const bonus = 150;
        totalBonusPoints += bonus;
        bonusesApplied.push({
          action: 'bonus_5_vendas_cooperativas_empresa',
          points: bonus,
          reason: 'Fez 5 vendas para cooperativas no mês'
        });
        log.info('🎉 [PointsService] Bônus de 150 pontos aplicado por 5 vendas para cooperativas!');
      }

      // 19. Bônus por volume vendido (empresa)
      if (actionKey === 'company_sell_volume' && updatedProgress.kg >= 1000) {
        const bonus = 300;
        totalBonusPoints += bonus;
        bonusesApplied.push({
          action: 'bonus_1000kg_empresa',
          points: bonus,
          reason: 'Vendeu mais de 1000kg no mês'
        });
        log.info('🎉 [PointsService] Bônus de 300 pontos aplicado por 1000kg vendidos!');
      }

      // 20. Bônus por coletas realizadas (empresa)
      if (actionKey === 'company_complete_collection' && updatedProgress.collections === 20) {
        const bonus = 250;
        totalBonusPoints += bonus;
        bonusesApplied.push({
          action: 'bonus_20_coletas_empresa',
          points: bonus,
          reason: 'Realizou 20 coletas no mês'
        });
        log.info('🎉 [PointsService] Bônus de 250 pontos aplicado por 20 coletas da empresa!');
      }

      // 21. Bônus por pontualidade mensal (coletor)
      if (actionKey === 'collector_on_time' || actionKey === 'collector_late') {
        // Calcular porcentagem de pontualidade do mês
        const coletasPontuais = metadata?.coletasPontuais || 0;
        const totalColetas = metadata?.totalColetas || 1;
        const porcentagemPontualidade = (coletasPontuais / totalColetas) * 100;
        
        if (porcentagemPontualidade >= 95) {
          const bonus = 100;
          totalBonusPoints += bonus;
          bonusesApplied.push({
            action: 'bonus_pontualidade_perfeita',
            points: bonus,
            reason: '95%+ de pontualidade no mês'
          });
          log.info('🎉 [PointsService] Bônus de 100 pontos aplicado por pontualidade perfeita!');
        } else if (porcentagemPontualidade >= 90) {
          const bonus = 50;
          totalBonusPoints += bonus;
          bonusesApplied.push({
            action: 'bonus_pontualidade_alta',
            points: bonus,
            reason: '90%+ de pontualidade no mês'
          });
          log.info('🎉 [PointsService] Bônus de 50 pontos aplicado por pontualidade alta!');
        }
      }

      if (totalBonusPoints > 0) {
        log.info('🎉 [PointsService] Total de bônus aplicados:', totalBonusPoints);
      }
      // --- FIM: Lógica de bônus automático melhorada ---

      // Calcular novo nível
      const newLevel = this.calculateLevel(action.userType, updatedProgress);
      log.info('🏆 [PointsService] Novo nível calculado:', { 
        oldLevel: currentProgress.current_level, 
        newLevel 
      });

      // Verificar se houve level up
      const levelUp = newLevel !== currentProgress.current_level;
      
      // Ativar proteção de nível se subiu de nível
      if (levelUp) {
        log.info('🛡️ [PointsService] Usuário subiu de nível, ativando proteção:', {
          userId,
          fromLevel: currentProgress.current_level,
          toLevel: newLevel
        });
        await this.activateLevelProtection(userId, newLevel);
      }
      
      // Salvar no banco
      log.info('💾 [PointsService] Salvando no banco...');
      const { error: updateError } = await supabase
        .from('user_progress')
        .upsert({
          ...updatedProgress,
          total_points: newTotalPoints + totalBonusPoints,
          current_level: newLevel,
          last_updated: new Date().toISOString()
        });

      if (updateError) {
        log.error('❌ [PointsService] Erro ao salvar no banco:', updateError);
        throw updateError;
      }

      // Criar log da ação
      await this.logAction(userId, actionKey, action.points, metadata);
      // Registrar bônus, se aplicado
      for (const bonus of bonusesApplied) {
        await this.logAction(userId, bonus.action, bonus.points, { motivo: bonus.reason });
      }

      return {
        success: true,
        pointsAdded: action.points + totalBonusPoints,
        newTotal: newTotalPoints + totalBonusPoints
      };

    } catch (error) {
      console.error('Erro ao adicionar pontos:', error);
      return {
        success: false,
        pointsAdded: 0,
        newTotal: 0
      };
    }
  }

  /**
   * Calcula o nível atual baseado no progresso
   */
  static calculateLevel(userType: string, progress: any): Level {
    const levels = userLevels[userType as keyof typeof userLevels];
    if (!levels) return 'bronze';

    const requirements = levels.gold.requirements;
    let currentLevel: Level = 'bronze';

    // Verificar se atende requisitos do Ouro
    if (this.meetsRequirements(progress, requirements)) {
      currentLevel = 'gold';
    } else {
      const silverRequirements = levels.silver.requirements;
      if (this.meetsRequirements(progress, silverRequirements)) {
        currentLevel = 'silver';
      }
    }

    return currentLevel;
  }

  /**
   * Verifica se o progresso atende aos requisitos
   */
  private static meetsRequirements(progress: any, requirements: LevelRequirements): boolean {
    for (const [key, requiredValue] of Object.entries(requirements)) {
      const currentValue = progress[key] || 0;
      if (currentValue < requiredValue) {
        return false;
      }
    }
    return true;
  }

  /**
   * Atualiza métricas específicas baseado na ação
   */
  private static updateMetrics(progress: any, actionKey: string, metadata?: Record<string, any>): any {
    const updated = { ...progress };

    switch (actionKey) {
      case 'common_request_collection':
        updated.collections = (updated.collections || 0) + 1;
        if (metadata?.kg) {
          updated.kg = (updated.kg || 0) + metadata.kg;
        }
        break;
      
      case 'collector_complete_collection':
        updated.collections = (updated.collections || 0) + 1;
        if (metadata?.kg) {
          updated.kg = (updated.kg || 0) + metadata.kg;
        }
        break;
      
      case 'common_rate_collector':
      case 'collector_high_rating':
        updated.ratings = (updated.ratings || 0) + 1;
        break;
      
      case 'partner_create_coupon':
        updated.active_coupons = (updated.active_coupons || 0) + 1;
        break;
      
      case 'cooperative_organize_action':
        updated.collections = (updated.collections || 0) + 1;
        if (metadata?.kg) {
          updated.kg = (updated.kg || 0) + metadata.kg;
        }
        break;
      
      case 'cooperative_complete_collection':
        updated.collections = (updated.collections || 0) + 1;
        if (metadata?.kg) {
          updated.kg = (updated.kg || 0) + metadata.kg;
        }
        break;
      
      case 'cooperative_sell_to_company':
        updated.sales = (updated.sales || 0) + 1;
        if (metadata?.kg) {
          updated.kg = (updated.kg || 0) + metadata.kg;
        }
        break;
      
      case 'cooperative_process_volume':
        if (metadata?.kg) {
          updated.kg = (updated.kg || 0) + metadata.kg;
        }
        break;
      
      case 'company_hire_collector':
        updated.active_collectors = (updated.active_collectors || 0) + 1;
        break;
      
      case 'company_sell_to_collector':
        updated.sales = (updated.sales || 0) + 1;
        if (metadata?.kg) {
          updated.kg = (updated.kg || 0) + metadata.kg;
        }
        break;
      
      case 'company_sell_to_cooperative':
        updated.sales = (updated.sales || 0) + 1;
        if (metadata?.kg) {
          updated.kg = (updated.kg || 0) + metadata.kg;
        }
        break;
      
      case 'company_complete_collection':
        updated.collections = (updated.collections || 0) + 1;
        if (metadata?.kg) {
          updated.kg = (updated.kg || 0) + metadata.kg;
        }
        break;

      // ===== CASOS DE TESTE =====
      case 'test_high_rating':
        updated.ratings = (updated.ratings || 0) + 1;
        updated.average_rating = 4.8; // Forçar avaliação alta
        break;
      
      case 'test_bulk_collections':
        updated.collections = (updated.collections || 0) + 15; // Adicionar 15 coletas
        if (metadata?.kg) {
          updated.kg = (updated.kg || 0) + metadata.kg;
        } else {
          updated.kg = (updated.kg || 0) + 300; // Adicionar 300kg
        }
        break;
      
      case 'test_high_kg':
        updated.kg = (updated.kg || 0) + 500; // Adicionar 500kg
        break;
      
      case 'test_level_up_silver':
        // Forçar requisitos para Prata
        updated.collections = 15;
        updated.kg = 400;
        updated.ratings = 10;
        updated.average_rating = 4.5;
        updated.months = 3;
        break;
      
      case 'test_level_up_gold':
        // Forçar requisitos para Ouro
        updated.collections = 30;
        updated.kg = 800;
        updated.ratings = 20;
        updated.average_rating = 4.8;
        updated.months = 6;
        break;
    }

    return updated;
  }

  /**
   * Aplica bônus baseado nas métricas padronizadas
   */
  private static applyBonusPoints(progress: any, userType: string): number {
    const metrics = getMetricsForUserType(userType);
    if (!metrics) return 0;

    let bonusPoints = 0;

    // Aplicar bônus baseado nas condições específicas do tipo de usuário
    switch (userType) {
      case 'common':
        if (progress.collections >= 5) bonusPoints += 20;
        if (progress.average_rating >= 4.5) bonusPoints += 15;
        break;
      
      case 'collector':
        if (progress.collections >= 10) bonusPoints += 50;
        if (progress.average_rating >= 4.8) bonusPoints += 30;
        if (progress.kg >= 200) bonusPoints += 25;
        break;
      
      case 'partner':
        if (progress.active_coupons >= 10) bonusPoints += 100;
        if (progress.average_rating >= 4.5) bonusPoints += 50;
        break;
      
      case 'cooperative':
        if (progress.collections >= 5) bonusPoints += 150;
        if (progress.kg >= 1000) bonusPoints += 200;
        break;
      
      case 'company':
        if (progress.active_collectors >= 3) bonusPoints += 150;
        if (progress.average_rating >= 4.7) bonusPoints += 90;
        break;
    }

    return bonusPoints;
  }

  /**
   * Registra log da ação no banco
   */
  private static async logAction(
    userId: string, 
    actionKey: string, 
    points: number, 
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await supabase
        .from('points_log')
        .insert({
          user_id: userId,
          action_key: actionKey,
          points_earned: points,
          metadata: metadata || {},
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Erro ao registrar log de pontos:', error);
    }
  }

  /**
   * Busca progresso do usuário
   */
  static async getUserProgress(userId: string): Promise<UserProgress | null> {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Usuário não tem progresso ainda
        }
        throw error;
      }

      return {
        userId: data.user_id,
        userType: data.user_type,
        currentLevel: data.current_level,
        totalPoints: data.total_points,
        collections: data.collections,
        kg: data.kg,
        ratings: data.ratings,
        months: data.months,
        activeCoupons: data.active_coupons,
        sales: data.sales,
        activeCollectors: data.active_collectors,
        averageRating: data.average_rating,
        lastUpdated: new Date(data.last_updated),
        levelAchievedDate: data.level_achieved_date ? new Date(data.level_achieved_date) : undefined,
        protectionMonthsRemaining: data.protection_months_remaining,
        monthlyAverageCollections: data.monthly_average_collections,
        monthlyAverageKg: data.monthly_average_kg,
        monthlyAverageRating: data.monthly_average_rating,
        lastNotificationSent: data.last_notification_sent ? new Date(data.last_notification_sent) : undefined,
        notificationType: data.notification_type as 'protection' | 'alert' | 'drop' | undefined
      };
    } catch (error) {
      console.error('Erro ao buscar progresso do usuário:', error);
      return null;
    }
  }

  /**
   * Busca histórico de pontos do usuário
   */
  static async getPointsHistory(userId: string, limit = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('points_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar histórico de pontos:', error);
      return [];
    }
  }

  /**
   * Retorna a tabela de pontuação
   */
  static getPointsTable(): Record<string, PointsAction> {
    return this.POINTS_TABLE;
  }

  // ===== SISTEMA DE PROTEÇÃO DE NÍVEL =====

  /**
   * Avalia o nível do usuário considerando proteção temporária
   */
  static async evaluateUserLevel(userId: string): Promise<void> {
    try {
      log.info('🔍 [PointsService] Iniciando avaliação de nível para usuário:', userId);
      
      const progress = await this.getUserProgress(userId);
      if (!progress) {
        log.warn('⚠️ [PointsService] Progresso não encontrado para usuário:', userId);
        return;
      }

      // Calcular média dos últimos 3 meses
      const monthlyAverages = await this.calculateMonthlyAverage(userId, 3);
      
      // Determinar nível baseado na média
      const averageBasedLevel = this.calculateLevel(progress.userType, monthlyAverages);
      
      // Verificar se está em proteção
      const isProtected = progress.protectionMonthsRemaining && progress.protectionMonthsRemaining > 0;
      
      log.info('📊 [PointsService] Avaliação de nível:', {
        userId,
        currentLevel: progress.currentLevel,
        averageBasedLevel,
        isProtected,
        protectionMonthsRemaining: progress.protectionMonthsRemaining,
        monthlyAverages
      });

      // Se não está em proteção e o nível baseado na média é menor
      if (!isProtected && this.isLevelLower(averageBasedLevel, progress.currentLevel)) {
        await this.handleLevelDrop(userId, progress, averageBasedLevel);
      } else if (isProtected) {
        await this.updateProtectionStatus(userId, progress, monthlyAverages);
      }

    } catch (error) {
      log.error('❌ [PointsService] Erro na avaliação de nível:', error);
    }
  }

  /**
   * Calcula a média mensal dos últimos N meses
   */
  private static async calculateMonthlyAverage(
    userId: string, 
    months: number = 3
  ): Promise<{ collections: number; kg: number; rating: number }> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      // Buscar logs dos últimos N meses
      const { data: logs, error } = await supabase
        .from('points_log')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Calcular médias baseado nos logs
      let totalCollections = 0;
      let totalKg = 0;
      let totalRatings = 0;
      let ratingCount = 0;

      logs?.forEach(log => {
        const metadata = log.metadata || {};
        
        if (log.action_key.includes('collection') || log.action_key.includes('coleta')) {
          totalCollections++;
        }
        
        if (metadata.kg) {
          totalKg += metadata.kg;
        }
        
        if (metadata.rating) {
          totalRatings += metadata.rating;
          ratingCount++;
        }
      });

      return {
        collections: Math.round(totalCollections / months),
        kg: Math.round(totalKg / months),
        rating: ratingCount > 0 ? totalRatings / ratingCount : 0
      };

    } catch (error) {
      log.error('❌ [PointsService] Erro ao calcular média mensal:', error);
      return { collections: 0, kg: 0, rating: 0 };
    }
  }

  /**
   * Verifica se um nível é menor que outro
   */
  private static isLevelLower(level1: Level, level2: Level): boolean {
    const levelOrder = { bronze: 1, silver: 2, gold: 3, platinum: 4, diamond: 5 };
    return levelOrder[level1] < levelOrder[level2];
  }

  /**
   * Lida com a queda de nível
   */
  private static async handleLevelDrop(
    userId: string, 
    progress: UserProgress, 
    newLevel: Level
  ): Promise<void> {
    try {
      log.info('📉 [PointsService] Usuário caiu de nível:', {
        userId,
        fromLevel: progress.currentLevel,
        toLevel: newLevel
      });

      // Atualizar nível no banco
      const { error } = await supabase
        .from('user_progress')
        .update({
          current_level: newLevel,
          protection_months_remaining: 0,
          notification_type: 'drop',
          last_notification_sent: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Enviar notificação de queda
      await this.sendLevelNotification(userId, 'drop', progress.currentLevel, newLevel, {
        collections: progress.collections,
        kg: progress.kg,
        rating: progress.averageRating
      });

    } catch (error) {
      log.error('❌ [PointsService] Erro ao lidar com queda de nível:', error);
    }
  }

  /**
   * Atualiza status de proteção
   */
  private static async updateProtectionStatus(
    userId: string, 
    progress: UserProgress, 
    monthlyAverages: { collections: number; kg: number; rating: number }
  ): Promise<void> {
    try {
      const monthsRemaining = (progress.protectionMonthsRemaining || 0) - 1;
      
      // Se ainda tem proteção
      if (monthsRemaining > 0) {
        await supabase
          .from('user_progress')
          .update({
            protection_months_remaining: monthsRemaining,
            monthly_average_collections: monthlyAverages.collections,
            monthly_average_kg: monthlyAverages.kg,
            monthly_average_rating: monthlyAverages.rating
          })
          .eq('user_id', userId);

        // Enviar notificação de alerta se necessário
        if (monthsRemaining <= 1) {
          await this.sendLevelNotification(userId, 'alert', progress.currentLevel, progress.currentLevel, monthlyAverages);
        }
      } else {
        // Proteção acabou, verificar se mantém o nível
        const canMaintainLevel = this.canMaintainLevel(progress.userType, monthlyAverages, progress.currentLevel);
        
        if (!canMaintainLevel) {
          await this.handleLevelDrop(userId, progress, this.calculateLevel(progress.userType, monthlyAverages));
        } else {
          // Manteve o nível, resetar proteção
          await supabase
            .from('user_progress')
            .update({
              protection_months_remaining: 0,
              notification_type: null,
              monthly_average_collections: monthlyAverages.collections,
              monthly_average_kg: monthlyAverages.kg,
              monthly_average_rating: monthlyAverages.rating
            })
            .eq('user_id', userId);
        }
      }

    } catch (error) {
      log.error('❌ [PointsService] Erro ao atualizar status de proteção:', error);
    }
  }

  /**
   * Verifica se o usuário pode manter o nível atual
   */
  private static canMaintainLevel(
    userType: string, 
    averages: { collections: number; kg: number; rating: number }, 
    currentLevel: Level
  ): boolean {
    const levels = userLevels[userType as keyof typeof userLevels];
    if (!levels) return true;

    const levelData = levels[currentLevel];
    if (!levelData) return true;

    const requirements = levelData.requirements;
    
    // Verificar se atende pelo menos 70% dos requisitos
    let metRequirements = 0;
    let totalRequirements = 0;

    if (requirements.collections) {
      totalRequirements++;
      if (averages.collections >= requirements.collections * 0.7) metRequirements++;
    }

    if (requirements.kg) {
      totalRequirements++;
      if (averages.kg >= requirements.kg * 0.7) metRequirements++;
    }

    if (requirements.ratings) {
      totalRequirements++;
      if (averages.rating >= requirements.ratings * 0.7) metRequirements++;
    }

    return totalRequirements === 0 || (metRequirements / totalRequirements) >= 0.7;
  }

  /**
   * Envia notificação de nível
   */
  private static async sendLevelNotification(
    userId: string,
    type: 'protection' | 'alert' | 'drop',
    currentLevel: Level,
    targetLevel: Level,
    averages: { collections: number; kg: number; rating: number }
  ): Promise<void> {
    try {
      const message = this.generateNotificationMessage(type, currentLevel, targetLevel, averages);
      const actionRequired = this.generateActionRequired(type, currentLevel, targetLevel, averages);

      // Salvar notificação no banco
      const { error } = await supabase
        .from('level_notifications')
        .insert({
          user_id: userId,
          notification_type: type,
          message,
          action_required: actionRequired,
          sent_at: new Date().toISOString()
        });

      if (error) throw error;

      log.info('📢 [PointsService] Notificação de nível enviada:', {
        userId,
        type,
        message: message.substring(0, 100) + '...'
      });

    } catch (error) {
      log.error('❌ [PointsService] Erro ao enviar notificação:', error);
    }
  }

  /**
   * Gera mensagem de notificação
   */
  private static generateNotificationMessage(
    type: 'protection' | 'alert' | 'drop',
    currentLevel: Level,
    targetLevel: Level,
    averages: { collections: number; kg: number; rating: number }
  ): string {
    const levelNames = { bronze: 'Bronze', silver: 'Prata', gold: 'Ouro', platinum: 'Platina', diamond: 'Diamante' };
    
    switch (type) {
      case 'protection':
        return `🎉 Parabéns! Você está no nível ${levelNames[currentLevel]} há 3 meses. Para manter este nível, você precisa manter sua performance consistente nos próximos meses.`;
      
      case 'alert':
        return `⚠️ Atenção! Sua média caiu para ${levelNames[targetLevel]}. Para manter o nível ${levelNames[currentLevel]}, você precisa melhorar sua performance no próximo mês.`;
      
      case 'drop':
        return `📉 Você caiu para ${levelNames[targetLevel]}. Continue se esforçando para voltar ao nível ${levelNames[currentLevel]}! 💪`;
      
      default:
        return '';
    }
  }

  /**
   * Gera ações requeridas para a notificação
   */
  private static generateActionRequired(
    type: 'protection' | 'alert' | 'drop',
    currentLevel: Level,
    targetLevel: Level,
    averages: { collections: number; kg: number; rating: number }
  ): Record<string, any> {
    return {
      type,
      currentLevel,
      targetLevel,
      currentAverages: averages,
      requiredImprovements: type === 'alert' ? {
        collections: Math.max(0, averages.collections + 5),
        kg: Math.max(0, averages.kg + 100),
        rating: Math.max(0, averages.rating + 0.5)
      } : {}
    };
  }

  /**
   * Ativa proteção de nível quando usuário sobe de nível
   */
  static async activateLevelProtection(userId: string, newLevel: Level): Promise<void> {
    try {
      log.info('🛡️ [PointsService] Ativando proteção de nível:', { userId, newLevel });

      const { error } = await supabase
        .from('user_progress')
        .update({
          level_achieved_date: new Date().toISOString(),
          protection_months_remaining: 3,
          notification_type: 'protection',
          last_notification_sent: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Enviar notificação de proteção
      await this.sendLevelNotification(userId, 'protection', newLevel, newLevel, {
        collections: 0,
        kg: 0,
        rating: 0
      });

    } catch (error) {
      log.error('❌ [PointsService] Erro ao ativar proteção de nível:', error);
    }
  }

  /**
   * Busca notificações de nível do usuário
   */
  static async getLevelNotifications(userId: string, limit = 10): Promise<LevelNotification[]> {
    try {
      const { data, error } = await supabase
        .from('level_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('sent_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(notification => ({
        id: notification.id,
        userId: notification.user_id,
        notificationType: notification.notification_type,
        message: notification.message,
        sentAt: new Date(notification.sent_at),
        readAt: notification.read_at ? new Date(notification.read_at) : undefined,
        actionRequired: notification.action_required
      }));

    } catch (error) {
      log.error('❌ [PointsService] Erro ao buscar notificações:', error);
      return [];
    }
  }

  /**
   * Função para facilitar testes - ajusta requisitos temporariamente
   */
  static async enableTestMode(userId: string): Promise<void> {
    try {
      log.info('🧪 [PointsService] Ativando modo de teste para usuário:', userId);
      
      // Buscar progresso atual
      const progress = await this.getUserProgress(userId);
      if (!progress) {
        log.warn('⚠️ [PointsService] Progresso não encontrado para usuário:', userId);
        return;
      }

      // Ajustar requisitos para facilitar level up
      const { error } = await supabase
        .from('user_progress')
        .update({
          collections: Math.max(progress.collections, 20),
          kg: Math.max(progress.kg, 500),
          ratings: Math.max(progress.ratings, 15),
          average_rating: Math.max(progress.averageRating, 4.8),
          months: Math.max(progress.months, 6),
          total_points: Math.max(progress.totalPoints, 300)
        })
        .eq('user_id', userId);

      if (error) throw error;

      log.info('✅ [PointsService] Modo de teste ativado com sucesso');
      
    } catch (error) {
      log.error('❌ [PointsService] Erro ao ativar modo de teste:', error);
    }
  }

  /**
   * Função para forçar level up específico
   */
  static async forceLevelUp(userId: string, targetLevel: Level): Promise<void> {
    try {
      log.info('🚀 [PointsService] Forçando level up para:', { userId, targetLevel });
      
      // Definir requisitos baseado no nível alvo
      let requirements: any = {};
      
      switch (targetLevel) {
        case 'silver':
          requirements = {
            collections: 15,
            kg: 400,
            ratings: 10,
            average_rating: 4.5,
            months: 3,
            total_points: 200
          };
          break;
        case 'gold':
          requirements = {
            collections: 30,
            kg: 800,
            ratings: 20,
            average_rating: 4.8,
            months: 6,
            total_points: 500
          };
          break;
        default:
          requirements = {
            collections: 5,
            kg: 100,
            ratings: 5,
            average_rating: 4.0,
            months: 1,
            total_points: 50
          };
      }

      // Atualizar progresso
      const { error } = await supabase
        .from('user_progress')
        .update({
          ...requirements,
          current_level: targetLevel,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Ativar proteção se subiu de nível
      await this.activateLevelProtection(userId, targetLevel);

      log.info('✅ [PointsService] Level up forçado com sucesso');
      
    } catch (error) {
      log.error('❌ [PointsService] Erro ao forçar level up:', error);
    }
  }
} 