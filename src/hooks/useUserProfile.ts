import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Address, NotificationPreference } from '@/types/user';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  user_type: string;
  avatar?: string;
  representative?: {
    id: string;
    name: string;
    cpf: string;
    email: string;
    phone: string;
    position: string;
    avatar_url?: string;
  };
  level?: {
    label: string;
    value: number;
    color: string;
  };
  stats?: {
    total_recycled?: number;
    rating?: number;
    scheduled_collections?: number;
    available_coupons?: number;
    total_collected?: number;
    coverage_areas?: number;
    team_members?: number;
    sustainable_practices?: number;
    environmental_impact?: number;
    community_contributions?: number;
    platform_time?: string;
    monthly_volume?: number;
    customers_per_month?: number;
    green_meals?: number;
    coupons_served?: number;
    coupons_validated?: number;
    green_classes?: number;
  };
  addresses?: Address[];
  notificationPreferences?: NotificationPreference[];
  materials?: Array<{
    id: string;
    name: string;
    identificador: string;
  }>;
  neighborhoods?: Array<{
    id: string;
    name: string;
    user_id: string;
  }>;
}

export const useUserProfile = (userId?: string) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async () => {
    if (!userId) {
      console.log('❌ [useUserProfile] userId não fornecido');
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 [useUserProfile] Iniciando busca do perfil do usuário:', userId);
      setLoading(true);
      setError(null);

      // 1. Buscar dados da tabela users (mais confiável)
      let userData = null;
      const { data: tableData, error: tableError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (tableError) {
        console.error('❌ [useUserProfile] Erro ao buscar dados do usuário:', tableError);
        throw tableError;
      }

      if (!tableData) {
        console.log('❌ [useUserProfile] Usuário não encontrado');
        setError('Usuário não encontrado');
        setLoading(false);
        return;
      }

      console.log('✅ [useUserProfile] Dados encontrados na tabela users:', tableData);
      console.log('🔍 [useUserProfile] Level do banco:', tableData.level);
      console.log('🔍 [useUserProfile] Avatar do banco:', tableData.avatar_url);
      console.log('🔍 [useUserProfile] Logo do banco:', tableData.logo);
      userData = tableData;

      // 3. Buscar dados do representante (para cooperativas, empresas coletoras e parceiras)
      let representativeData = null;
      if (userData.user_type === 'cooperative_owner' || userData.user_type === 'collector_company_owner' || userData.user_type === 'partner_owner') {
        try {
          const { data: representative, error: representativeError } = await supabase
            .from('representatives')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (representativeError) {
            console.error('⚠️ [useUserProfile] Erro ao buscar representante:', representativeError);
          } else if (representative) {
            representativeData = representative;
            console.log('✅ [useUserProfile] Dados do representante carregados:', representativeData);
          }
        } catch (representativeError) {
          console.error('⚠️ [useUserProfile] Erro ao buscar representante:', representativeError);
        }
      }

      // 4. Buscar endereços
      let addressesData = [];
      try {
        const { data: addresses, error: addressesError } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', userId)
          .order('id', { ascending: true });

        if (addressesError) {
          console.error('⚠️ [useUserProfile] Erro ao buscar endereços:', addressesError);
        } else {
          // Converter campos do banco para o formato esperado pelo tipo Address
          addressesData = (addresses || []).map(address => ({
            id: address.id,
            street: address.logradouro || '',
            number: address.numero || '',
            complement: address.complemento || '',
            neighborhood: address.bairro || '',
            city: address.cidade || '',
            state: address.estado || '',
            zipCode: address.cep || '',
            isMain: address.is_main || false,
            region: 'Centro' // Valor padrão, pode ser ajustado conforme necessário
          }));
          console.log('✅ [useUserProfile] Endereços carregados:', addressesData.length);
        }
      } catch (addressesError) {
        console.error('⚠️ [useUserProfile] Erro ao buscar endereços:', addressesError);
      }

      // Se não há endereços, não criar nenhum (será mostrado o estado vazio)
      if (addressesData.length === 0) {
        addressesData = [];
        console.log('✅ [useUserProfile] Nenhum endereço encontrado - será mostrado estado vazio');
      }

      // 4. Buscar preferências de notificação
      console.log('🔍 [useUserProfile] Buscando notificações para usuário:', userId);
      
      const { data: notificationPreferencesData, error: notificationError } = await supabase
        .from('user_notification_settings')
        .select('*')
        .eq('user_id', userId);

      if (notificationError) {
        console.error('❌ [useUserProfile] Erro ao buscar notificações:', notificationError);
      }

      // Processar preferências de notificação
      let processedNotificationPreferences: NotificationPreference[] = [];
      
      if (notificationPreferencesData && notificationPreferencesData.length > 0) {
        processedNotificationPreferences = notificationPreferencesData.map(pref => ({
          id: pref.id,
          type: pref.channel, // Usar 'channel' em vez de 'type'
          enabled: pref.enabled,
          categories: {
            collections: pref.collections,
            achievements: pref.achievements,
            promotions: pref.promotions,
            system: pref.system
          }
        }));

        // Verificar duplicatas
        const tipos = processedNotificationPreferences.map(p => p.type);
        const tiposUnicos = [...new Set(tipos)];
        
        if (tipos.length !== tiposUnicos.length) {
          console.warn('⚠️ [useUserProfile] ATENÇÃO: Há tipos duplicados!');
          console.log('🔄 [useUserProfile] Removendo duplicatas...');

          // Remover duplicatas mantendo apenas o primeiro de cada tipo
          const preferenciasUnicas = [];
          const tiposProcessados = new Set();

          for (const pref of processedNotificationPreferences) {
            if (!tiposProcessados.has(pref.type)) {
              preferenciasUnicas.push(pref);
              tiposProcessados.add(pref.type);
            }
          }

          processedNotificationPreferences = preferenciasUnicas;
          console.log('✅ [useUserProfile] Duplicatas removidas. Total final:', processedNotificationPreferences.length);
        }
      } else {
        // Criar preferências padrão se não existirem
        console.log('🔍 [useUserProfile] Verificando se precisa criar preferências padrão...');
        console.log('🔍 [useUserProfile] notificationPreferencesData.length:', notificationPreferencesData?.length);
        
        processedNotificationPreferences = [
          {
            id: `default-email-${userId}`,
            type: 'email',
            enabled: true,
            categories: {
              collections: true,
              achievements: true,
              promotions: false,
              system: true
            }
          },
          {
            id: `default-push-${userId}`,
            type: 'push',
            enabled: true,
            categories: {
              collections: true,
              achievements: true,
              promotions: false,
              system: true
            }
          }
        ];
        console.log('✅ [useUserProfile] Preferências padrão criadas');
      }

      console.log('✅ [useUserProfile] Preferências carregadas do banco:', processedNotificationPreferences);

      // 5. Processar dados do usuário
      const processedUserData: UserProfile = {
        id: userData.id,
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        document: userData.document || '',
        user_type: userData.user_type || '',
        avatar: userData.avatar_url || userData.logo || userData.avatar?.src || '',
        representative: representativeData ? {
          id: representativeData.id,
          name: representativeData.name,
          cpf: representativeData.cpf,
          email: representativeData.email,
          phone: representativeData.phone,
          position: representativeData.position,
          avatar_url: representativeData.avatar_url
        } : undefined,
        addresses: addressesData,
        notificationPreferences: processedNotificationPreferences,
      };

      // 5. Buscar materiais do usuário
      let materialsData = [];
      try {
        const { data: userMaterials, error: materialsError } = await supabase
          .from('user_materials')
          .select(`
            material_id,
            description,
            materials (
              id,
              nome,
              identificador
            )
          `)
          .eq('user_id', userId);

        if (materialsError) {
          console.error('⚠️ [useUserProfile] Erro ao buscar materiais:', materialsError);
        } else if (userMaterials) {
          materialsData = userMaterials
            .filter(um => um.materials)
            .map(um => ({
              id: um.materials.id,
              name: um.materials.nome, // Corrigido: usar 'nome' em vez de 'name'
              identificador: um.materials.identificador,
              description: um.description || null
            }));
          console.log('✅ [useUserProfile] Materiais carregados:', materialsData.length);
          console.log('📦 [useUserProfile] Detalhes dos materiais:', materialsData);
        }
      } catch (materialsError) {
        console.error('⚠️ [useUserProfile] Erro ao buscar materiais:', materialsError);
      }

      // 6. Buscar bairros do usuário
      let neighborhoodsData = [];
      try {
        const { data: userNeighborhoods, error: neighborhoodsError } = await supabase
          .from('user_neighborhoods')
          .select(`
            id,
            user_id,
            neighborhood_id,
            neighborhoods!inner(
              id,
              name
            )
          `)
          .eq('user_id', userId);

        if (neighborhoodsError) {
          console.error('⚠️ [useUserProfile] Erro ao buscar bairros:', neighborhoodsError);
        } else if (userNeighborhoods) {
          neighborhoodsData = userNeighborhoods.map(un => ({
            id: un.id,
            name: un.neighborhoods?.name || 'Bairro sem nome',
            user_id: un.user_id
          }));
          console.log('✅ [useUserProfile] Bairros carregados:', neighborhoodsData.length);
          console.log('🏘️ [useUserProfile] Detalhes dos bairros:', neighborhoodsData);
        }
      } catch (neighborhoodsError) {
        console.error('⚠️ [useUserProfile] Erro ao buscar bairros:', neighborhoodsError);
      }

      // Adicionar materiais e bairros ao processedUserData
      processedUserData.materials = materialsData;
      processedUserData.neighborhoods = neighborhoodsData;

      // 7. Processar level se existir
      if (userData.level) {
        try {
          const levelData = typeof userData.level === 'string' 
            ? JSON.parse(userData.level) 
            : userData.level;
          
          processedUserData.level = {
            label: levelData.label || 'Bronze',
            value: levelData.value || 1,
            color: levelData.color || '#bfa046'
          };
        } catch (levelError) {
          console.error('⚠️ [useUserProfile] Erro ao processar level:', levelError);
          processedUserData.level = {
            label: 'Bronze',
            value: 1,
            color: '#bfa046'
          };
        }
      } else {
        // Se não há level, criar um padrão
        console.log('⚠️ [useUserProfile] Nenhum level encontrado, criando padrão');
        processedUserData.level = {
          label: 'Bronze',
          value: 1,
          color: '#bfa046'
        };
      }

      // 8. Processar stats se existir
      if (userData.stats) {
        try {
          const statsData = typeof userData.stats === 'string' 
            ? JSON.parse(userData.stats) 
            : userData.stats;
          
          processedUserData.stats = {
            total_recycled: statsData.total_recycled || 0,
            rating: statsData.rating || 0,
            scheduled_collections: statsData.scheduled_collections || 0,
            available_coupons: statsData.available_coupons || 0,
            total_collected: statsData.total_collected || 0,
            coverage_areas: statsData.coverage_areas || 0,
            team_members: statsData.team_members || 0,
            sustainable_practices: statsData.sustainable_practices || 0,
            environmental_impact: statsData.environmental_impact || 0,
            community_contributions: statsData.community_contributions || 0,
            platform_time: statsData.platform_time || '0 meses',
            monthly_volume: statsData.monthly_volume || 0,
            customers_per_month: statsData.customers_per_month || 0,
            green_meals: statsData.green_meals || 0,
            coupons_served: statsData.coupons_served || 0,
            coupons_validated: statsData.coupons_validated || 0,
            green_classes: statsData.green_classes || 0
          };
        } catch (statsError) {
          console.error('⚠️ [useUserProfile] Erro ao processar stats:', statsError);
          processedUserData.stats = {
            total_recycled: 0,
            rating: 0,
            scheduled_collections: 0,
            available_coupons: 0,
            total_collected: 0,
            coverage_areas: 0,
            team_members: 0,
            sustainable_practices: 0,
            environmental_impact: 0,
            community_contributions: 0,
            platform_time: '0 meses',
            monthly_volume: 0,
            customers_per_month: 0,
            green_meals: 0,
            coupons_served: 0,
            coupons_validated: 0,
            green_classes: 0
          };
        }
      }

      console.log('✅ [useUserProfile] Perfil processado com sucesso:', processedUserData);
      console.log('🔍 [useUserProfile] Avatar final:', processedUserData.avatar);
      console.log('🔍 [useUserProfile] Level final:', processedUserData.level);
      setUserProfile(processedUserData);
      setError(null);

    } catch (err) {
      console.error('❌ [useUserProfile] Erro inesperado:', err);
      setError(err instanceof Error ? err.message : 'Erro inesperado');
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  return {
    userProfile,
    loading,
    error,
    refetch: fetchUserProfile
  };
};

// Função auxiliar para calcular estatísticas do usuário
async function calculateUserStats(userId: string, userType: string, userProgress: any) {
  const stats: any = {};

  try {
    switch (userType) {
      case 'common_user':
        // Buscar total reciclado
        const { data: collections } = await supabase
          .from('collections')
          .select('total_weight')
          .eq('user_id', userId);
        
        stats.total_recycled = collections?.reduce((sum, c) => sum + (c.total_weight || 0), 0) || 0;
        stats.rating = userProgress?.average_rating || 4.7;
        // Buscar número real de agendamentos ativos (apenas status 'scheduled')
        const { count: scheduledCountUser } = await supabase
          .from('collections')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'scheduled');
        stats.scheduled_collections = scheduledCountUser || 0;
        // Buscar número real de cupons disponíveis (status 'ativo')
        const { count: availableCoupons } = await supabase
          .from('coupon_usage')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'ativo');
        stats.available_coupons = availableCoupons || 0;
        break;

      case 'individual_collector':
        // Buscar total coletado
        const { data: collectorCollections } = await supabase
          .from('collections')
          .select('total_weight')
          .eq('collector_id', userId);
        stats.total_collected = collectorCollections?.reduce((sum, c) => sum + (c.total_weight || 0), 0) || 0;
        // Buscar avaliação real (0 se não houver)
        stats.rating = userProgress?.average_rating || 0;
        // Calcular tempo de plataforma (sempre retorna)
        const { data: userData } = await supabase
          .from('users')
          .select('created_at, entity_id')
          .eq('id', userId)
          .single();
        let platformTime = '';
        if (userData?.created_at) {
          const createdAt = new Date(userData.created_at);
          const now = new Date();
          const diffMonths = (now.getFullYear() - createdAt.getFullYear()) * 12 + (now.getMonth() - createdAt.getMonth());
          platformTime = diffMonths >= 12 ? `${Math.floor(diffMonths/12)} anos` : `${diffMonths} meses`;
        } else {
          platformTime = '0 meses';
        }
        stats.platform_time = platformTime;
        // Buscar empresa vinculada se houver, senão "Não Vinculado" (para todos os coletores)
        if (userData?.entity_id) {
          const { data: company } = await supabase
            .from('entities')
            .select('name')
            .eq('id', userData.entity_id)
            .single();
          stats.company_affiliation = company ? { company_name: company.name } : { company_name: 'Não Vinculado' };
        } else {
          stats.company_affiliation = { company_name: 'Não Vinculado' };
        }
        // Buscar número real de agendamentos ativos (apenas status 'scheduled')
        const { count: scheduledCountCollector } = await supabase
          .from('collections')
          .select('*', { count: 'exact', head: true })
          .eq('collector_id', userId)
          .eq('status', 'scheduled');
        stats.scheduled_collections = scheduledCountCollector || 0;
        // Buscar número de coletas recorrentes ativas
        const { count: recurringCount } = await supabase
          .from('collections')
          .select('*', { count: 'exact', head: true })
          .eq('collector_id', userId)
          .eq('is_recurring', true)
          .eq('status', 'scheduled');
        stats.active_recurring_collections = recurringCount || 0;
        break;

      case 'cooperative_owner':
        // Buscar membros da equipe
        const { data: teamMembers } = await supabase
          .from('users')
          .select('id')
          .eq('entity_id', userId);
        
        stats.team_members = teamMembers?.length || 45;
        stats.rating = userProgress?.average_rating || 4.8;
        stats.monthly_volume = userProgress?.monthly_volume || '15.2t';
        stats.platform_time = '3 anos'; // Mock por enquanto
        // Buscar número de solicitações pendentes
        const { count: pendingRequests } = await supabase
          .from('collections')
          .select('*', { count: 'exact', head: true })
          .eq('collector_id', userId)
          .eq('collector_type', 'cooperative')
          .eq('status', 'pending');
        stats.pending_requests = pendingRequests || 0;
        // Buscar número de coletas ativas ou em andamento
        const { count: activeCollections } = await supabase
          .from('collections')
          .select('*', { count: 'exact', head: true })
          .eq('collector_id', userId)
          .eq('collector_type', 'cooperative')
          .in('status', ['scheduled', 'accepted', 'in_progress']);
        stats.active_collections = activeCollections || 0;
        // Buscar número de coletas pendentes e agendadas (simples ou recorrentes)
        const { count: historyPendingScheduled } = await supabase
          .from('collections')
          .select('*', { count: 'exact', head: true })
          .eq('collector_id', userId)
          .eq('collector_type', 'cooperative')
          .in('status', ['pending', 'scheduled']);
        stats.history_pending_scheduled = historyPendingScheduled || 0;
        break;

      case 'collector_company_owner':
        // Buscar coletores da empresa
        const { data: collectors } = await supabase
          .from('users')
          .select('id')
          .eq('entity_id', userId)
          .eq('user_type', 'individual_collector');
        
        stats.team_members = collectors?.length || 35;
        stats.rating = userProgress?.average_rating || 4.9;
        stats.monthly_volume = userProgress?.monthly_volume || '25.5t';
        stats.platform_time = '2 anos'; // Mock por enquanto
        // Buscar número de solicitações pendentes
        const { count: pendingRequestsCompany } = await supabase
          .from('collections')
          .select('*', { count: 'exact', head: true })
          .eq('entity_id', userId)
          .eq('status', 'pending');
        stats.pending_requests = pendingRequestsCompany || 0;
        // Buscar número de coletas ativas ou em andamento
        const { count: activeCollectionsCompany } = await supabase
          .from('collections')
          .select('*', { count: 'exact', head: true })
          .eq('entity_id', userId)
          .in('status', ['scheduled', 'accepted', 'in_progress']);
        stats.active_collections = activeCollectionsCompany || 0;
        // Buscar número de coletas pendentes e agendadas (simples ou recorrentes)
        const { count: historyPendingScheduledCompany } = await supabase
          .from('collections')
          .select('*', { count: 'exact', head: true })
          .eq('entity_id', userId)
          .in('status', ['pending', 'scheduled']);
        stats.history_pending_scheduled = historyPendingScheduledCompany || 0;
        break;

      case 'restaurant_partner':
      case 'store_partner':
      case 'educational_partner':
      case 'partner_owner':
        // Buscar número de coletas pendentes e agendadas (simples ou recorrentes)
        const { count: historyPendingScheduledPartner } = await supabase
          .from('collections')
          .select('*', { count: 'exact', head: true })
          .eq('entity_id', userProgress?.entity_id || userId)
          .in('status', ['pending', 'scheduled']);
        stats.history_pending_scheduled = historyPendingScheduledPartner || 0;
        // Buscar número de cupons ativos (pegos por outros usuários)
        const { count: activeCoupons } = await supabase
          .from('coupon_usage')
          .select('*', { count: 'exact', head: true })
          .eq('partner_id', userProgress?.entity_id || userId)
          .eq('status', 'ativo');
        stats.active_coupons = activeCoupons || 0;
        break;
    }
  } catch (err) {
    console.error('Erro ao calcular estatísticas:', err);
  }

  return stats;
}

// Função auxiliar para obter cor do nível
function getLevelColor(level: string): string {
  switch (level) {
    case 'bronze':
      return 'text-amber-600';
    case 'silver':
      return 'text-gray-400';
    case 'gold':
      return 'text-yellow-500';
    default:
      return 'text-gray-600';
  }
} 