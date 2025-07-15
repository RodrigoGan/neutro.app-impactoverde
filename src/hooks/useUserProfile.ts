import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Address, NotificationPreference } from '@/types/user';

// MOCKS DE USUÁRIO (exemplo simplificado)
const mockUsers: Record<string, any> = {
  'mock-user-id': {
    id: 'mock-user-id',
    name: 'Usuário Mock',
    email: 'mock@email.com',
    avatar: '',
    addresses: [
      {
        id: '1',
        street: 'Rua das Flores',
        number: '123',
        complement: 'Apto 45',
        neighborhood: 'Centro',
        city: 'Cidade',
        state: 'UF',
        zipCode: '12345-678',
        isMain: true,
        region: 'Região Central',
      },
    ],
    notificationPreferences: [
      {
        type: 'email',
        enabled: true,
        categories: {
          collections: true,
          achievements: true,
          promotions: false,
          system: true,
        },
      },
      {
        type: 'push',
        enabled: true,
        categories: {
          collections: true,
          achievements: false,
          promotions: true,
          system: true,
        },
      },
    ],
  },
  'd9f3e4a5-6b7c-8901-2cde-f34567890123': {
    id: 'd9f3e4a5-6b7c-8901-2cde-f34567890123',
    name: 'Carlos Mendes',
    email: 'carlos.mendes@email.com',
    user_type: 'cooperative_owner',
    avatar: '',
    addresses: [
      {
        id: '2',
        street: 'Rua das Cooperativas',
        number: '456',
        complement: 'Sala 10',
        neighborhood: 'Centro',
        city: 'Cidade Verde',
        state: 'SP',
        zipCode: '12345-000',
        isMain: true,
        region: 'Região Central',
      },
    ],
    notificationPreferences: [
      {
        type: 'email',
        enabled: true,
        categories: {
          collections: true,
          achievements: true,
          promotions: false,
          system: true,
        },
      },
      {
        type: 'push',
        enabled: true,
        categories: {
          collections: true,
          achievements: true,
          promotions: true,
          system: true,
        },
      },
    ],
    entity: {
      id: '301',
      name: 'Cooperativa Verde',
      type: 'cooperative',
      is_verified: true,
      avatar: '',
      metrics: {
        active_since: '2022-01-01',
        rating: 4.8,
      },
    },
    stats: {
      team_members: 45,
      rating: 4.8,
      monthly_volume: 15.2,
      platform_time: '3 anos',
    },
    role: 'Presidente',
  },
};

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  user_type: string;
  avatar?: string;
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
    monthly_volume?: number;
    platform_time?: string;
    customers_per_month?: number;
    green_meals?: number;
    coupons_served?: number;
    coupons_validated?: number;
    green_classes?: number;
  };
  entity?: {
    id: string;
    name: string;
    type: string;
    is_verified: boolean;
    avatar?: string;
    metrics: {
      active_since: string;
      rating?: number;
    };
  };
  company_affiliation?: {
    company_id: string;
    company_name: string;
    since: string;
  };
  addresses?: {
    id: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    isMain: boolean;
    region: string;
  }[];
  notificationPreferences?: {
    type: string;
    enabled: boolean;
    categories: {
      collections: boolean;
      achievements: boolean;
      promotions: boolean;
      system: boolean;
    };
  }[];
}

export function useUserProfile(userId: string) {
  const [userData, setUserData] = useState<any>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar dados do usuário, endereços e preferências de notificação
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 2. Buscar dados reais do banco
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
      if (userError) throw userError;

      const { data: addressesData, error: addressesError } = await supabase
        .from('addresses')
            .select('*')
        .eq('user_id', userId);
      if (addressesError) throw addressesError;

      let { data: notificationData, error: notificationError } = await supabase
        .from('user_notification_preferences')
            .select('*')
        .eq('user_id', userId);
      if (notificationError) throw notificationError;

      // 3. Se não houver preferências, criar padrão
      if (!notificationData || notificationData.length === 0) {
        const defaultPrefs = [
          { type: 'email', enabled: true, collections: true, achievements: true, promotions: false, system: true },
          { type: 'push', enabled: true, collections: true, achievements: false, promotions: true, system: true },
        ];
        await Promise.all(
          defaultPrefs.map(pref =>
            supabase.from('user_notification_preferences').insert({ user_id: userId, ...pref })
          )
        );
        // Buscar novamente após inserir
        const { data: newData } = await supabase
          .from('user_notification_preferences')
              .select('*')
          .eq('user_id', userId);
        notificationData = newData;
      }

      // Mapear endereços para o formato do frontend
      const mappedAddresses = (addressesData || []).map((a: any) => ({
        id: a.id,
        street: a.street,
        number: a.number,
        complement: a.complement,
        neighborhood: a.neighborhood,
        city: a.city,
        state: a.state,
        zipCode: a.zip_code,
        isMain: a.is_main,
        region: '', // Adapte se necessário
      }));

      // Mapear preferências de notificação para o formato do frontend
      const mappedNotificationPreferences = (notificationData || []).map((n: any) => ({
        type: n.type,
        enabled: n.enabled,
        categories: {
          collections: n.collections,
          achievements: n.achievements,
          promotions: n.promotions,
          system: n.system,
        },
      }));

      setUserData(user);
      setAddresses(mappedAddresses);
      setNotificationPreferences(mappedNotificationPreferences as NotificationPreference[]);
    } catch (err: any) {
      // Fallback para mock se houver erro de múltiplas linhas ou nenhum resultado
      if (mockUsers[userId]) {
        setUserData(mockUsers[userId]);
        setAddresses(mockUsers[userId].addresses || []);
        setNotificationPreferences(mockUsers[userId].notificationPreferences || []);
        setError(null);
      } else {
        setError(err.message || 'Erro ao carregar perfil');
      }
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchProfile();
  }, [userId, fetchProfile]);

  // Funções para manipular endereços
  const addAddress = async (address: Omit<Address, 'id'>) => {
    const { error } = await supabase.from('addresses').insert([{ ...address, user_id: userId }]);
    if (!error) fetchProfile();
    return !error;
  };
  const updateAddress = async (address: Address) => {
    const { error } = await supabase.from('addresses').update(address).eq('id', address.id);
    if (!error) fetchProfile();
    return !error;
  };
  const deleteAddress = async (addressId: string) => {
    const { error } = await supabase.from('addresses').delete().eq('id', addressId);
    if (!error) fetchProfile();
    return !error;
  };
  const setMainAddress = async (addressId: string) => {
    // Desmarcar todos como principal
    await supabase.from('addresses').update({ is_main: false }).eq('user_id', userId);
    // Marcar o selecionado como principal
    const { error } = await supabase.from('addresses').update({ is_main: true }).eq('id', addressId);
    if (!error) fetchProfile();
    return !error;
  };

  // Funções para manipular preferências de notificação
  const updateNotificationPreference = async (preference: NotificationPreference) => {
    // Buscar o registro correspondente pelo user_id e type
    const { data, error: fetchError } = await supabase
      .from('user_notification_preferences')
      .select('id')
      .eq('user_id', userId)
      .eq('type', preference.type)
      .single();
    if (fetchError || !data?.id) return false;
    const { error } = await supabase
      .from('user_notification_preferences')
      .update({
        enabled: preference.enabled,
        collections: preference.categories.collections,
        achievements: preference.categories.achievements,
        promotions: preference.categories.promotions,
        system: preference.categories.system,
      })
      .eq('id', data.id);
    if (!error) fetchProfile();
    return !error;
  };

  return {
    userData,
    addresses,
    notificationPreferences,
    loading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    setMainAddress,
    updateNotificationPreference,
    refresh: fetchProfile,
  };
}

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