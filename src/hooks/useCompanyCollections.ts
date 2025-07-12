import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface Collection {
  id: string;
  client: string;
  avatar?: string;
  status: 'Agendada' | 'Em Andamento' | 'Concluída' | 'Cancelada';
  date: string;
  time: string;
  address: string;
  driver: string;
  cancelReason: string;
  fotos: string[];
  observacoes: string;
  observacaoEmpresa: string;
  materiais: Array<{
    type: string;
    quantity: number;
    unit: string;
  }>;
}

export const useCompanyCollections = (entityId?: string) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCompanyCollections() {
      if (!entityId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('🔄 Buscando coleções da empresa:', entityId);

        // Buscar coleções da empresa
        const { data: companyCollections, error: collectionsError } = await supabase
          .from('collections')
          .select(`
            id,
            status,
            scheduled_date,
            scheduled_time,
            address,
            observations,
            company_observations,
            photos,
            cancel_reason,
            materials (
              material_id,
              quantity,
              unit,
              material:material_id (
                name
              )
            ),
            client:user_id (
              name,
              avatar_url
            ),
            driver:collector_id (
              name
            )
          `)
          .eq('entity_id', entityId)
          .order('scheduled_date', { ascending: false });

        if (collectionsError) throw collectionsError;

        // Mapear dados para o formato esperado
        const mappedCollections: Collection[] = (companyCollections || []).map(collection => ({
          id: collection.id,
          client: collection.client?.[0]?.name || 'Cliente',
          avatar: collection.client?.[0]?.avatar_url,
          status: collection.status as any,
          date: collection.scheduled_date,
          time: collection.scheduled_time,
          address: collection.address,
          driver: collection.driver?.[0]?.name || '',
          cancelReason: collection.cancel_reason || '',
          fotos: collection.photos || [],
          observacoes: collection.observations || '',
          observacaoEmpresa: collection.company_observations || '',
                      materiais: (collection.materials || []).map(material => ({
              type: material.material?.[0]?.name || material.material_id,
              quantity: material.quantity,
              unit: material.unit
            }))
        }));

        console.log('✅ Coleções da empresa carregadas:', mappedCollections.length);
        setCollections(mappedCollections);

      } catch (err) {
        console.error('❌ Erro ao buscar coleções da empresa:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar coleções');
        setCollections([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCompanyCollections();
  }, [entityId]);

  return {
    collections,
    loading,
    error
  };
}; 