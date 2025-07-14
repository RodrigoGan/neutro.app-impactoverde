import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export type UserType =
  | 'common_user'
  | 'individual_collector'
  | 'cooperative'
  | 'cooperative_owner'
  | 'collector_company_owner'
  | 'restaurant_partner'
  | 'store_partner'
  | 'educational_partner'
  | 'partner_owner';

export interface ActiveSchedulesFilters {
  tipoColeta?: string;
  date?: Date;
}

export interface UseActiveSchedulesOptions {
  userType: UserType;
  userId?: string;
  entityId?: string;
  filters?: ActiveSchedulesFilters;
  page?: number;
  pageSize?: number;
}

export function useActiveSchedules({
  userType,
  userId,
  entityId,
  filters = {},
  page = 1,
  pageSize = 10,
}: UseActiveSchedulesOptions) {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    let query = supabase.from('collections').select(`
      *,
      occurrences,
      recurring_pattern
    `, { count: 'exact' });

    // Filtro por tipo de usuário
    if (userType === 'common_user' && userId) {
      query = query.eq('solicitante_id', userId);
    } else if (userType === 'individual_collector' && userId) {
      query = query.eq('collector_id', userId).eq('collector_type', 'individual');
    } else if (
      ['cooperative', 'cooperative_owner'].includes(userType) && entityId
    ) {
      query = query.eq('collector_id', entityId).eq('collector_type', 'cooperative');
    } else if (
      ['collector_company_owner', 'restaurant_partner', 'store_partner', 'educational_partner', 'partner_owner'].includes(userType) && entityId
    ) {
      query = query.eq('entity_id', entityId); // manter para outros perfis se necessário
    }

    // Filtro para agendamentos ativos (pending, scheduled)
    query = query.in('status', ['pending', 'scheduled']);

    // Filtros adicionais
    if (filters.tipoColeta && filters.tipoColeta !== 'all') {
      query = query.eq('collection_type', filters.tipoColeta);
    }
    if (filters.date) {
      query = query.eq('date', filters.date.toISOString().slice(0, 10));
    }

    // Paginação
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to).order('date', { ascending: true });

    const { data, error, count } = await query;
    if (error) {
      // Se for erro 400, transformar em string '400' para friendly state
      const errorMsg = error.code === '400' || (typeof error.message === 'string' && error.message.includes('400'))
        ? '400'
        : (error.message || error.toString() || 'Erro ao buscar agendamentos ativos');
      setError(errorMsg);
      setSchedules([]);
      setTotal(0);
    } else {
      setSchedules(data || []);
      setTotal(count || 0);
    }
    setLoading(false);
  }, [userType, userId, entityId, JSON.stringify(filters), page, pageSize]);

  useEffect(() => {
    fetchActiveSchedules();
  }, [fetchActiveSchedules]);

  // Função para recarregar os dados
  const refresh = useCallback(() => {
    fetchActiveSchedules();
  }, [fetchActiveSchedules]);

  return { schedules, total, loading, error, refresh };
} 