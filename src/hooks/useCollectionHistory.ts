import { useEffect, useState } from 'react';
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

export interface CollectionHistoryFilters {
  status?: string;
  tipoColeta?: string;
  date?: Date;
}

export interface UseCollectionHistoryOptions {
  userType: UserType;
  userId?: string;
  entityId?: string;
  filters?: CollectionHistoryFilters;
  page?: number;
  pageSize?: number;
}

export function useCollectionHistory({
  userType,
  userId,
  entityId,
  filters = {},
  page = 1,
  pageSize = 10,
}: UseCollectionHistoryOptions) {
  const [collections, setCollections] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchCollections() {
      setLoading(true);
      setError(null);
      
      let query = supabase.from('collections').select('*', { count: 'exact' });

      // Filtro por tipo de usuário
      if (userType === 'common_user' && userId) {
        query = query.eq('solicitante_id', userId);
      } else if (userType === 'individual_collector' && userId) {
        query = query.eq('collector_id', userId);
      } else if (
        ['cooperative', 'cooperative_owner', 'collector_company_owner', 'restaurant_partner', 'store_partner', 'educational_partner', 'partner_owner'].includes(userType) && entityId
      ) {
        query = query.eq('entity_id', entityId);
      }

      // Filtros adicionais
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.tipoColeta && filters.tipoColeta !== 'all') {
        query = query.eq('collection_type', filters.tipoColeta);
      }
      if (filters.date) {
        query = query.eq('date', filters.date.toISOString().slice(0, 10));
      }

      // Paginação
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to).order('date', { ascending: false });

      const { data, error, count } = await query;
      if (!isMounted) return;
      if (error) {
        setError('Erro ao buscar histórico de coletas');
        setCollections([]);
        setTotal(0);
      } else {
        setCollections(data || []);
        setTotal(count || 0);
      }
      setLoading(false);
    }
    fetchCollections();
    return () => {
      isMounted = false;
    };
  }, [userType, userId, entityId, JSON.stringify(filters), page, pageSize]);

  return { collections, total, loading, error };
} 