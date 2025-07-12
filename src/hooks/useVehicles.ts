import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { TRANSPORT_TYPES } from '@/constants/transportTypes';

export interface Vehicle {
  id: string;
  type: string;
  description?: string;
  user_id?: string;
}

const mockVehicles: Vehicle[] = TRANSPORT_TYPES.map((type, index) => ({
  id: String(index + 1),
  type: type.value,
  description: type.label
}));

export const useVehicles = (userId?: string) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function fetchVehicles() {
      setLoading(true);
      setError(null);
      try {
        let query = supabase
          .from('vehicles')
          .select('*')
          .order('type');
        
        // Se userId fornecido, filtra por usuário
        if (userId) {
          query = query.eq('user_id', userId);
        }
        
        const { data, error } = await query;
        
        if (!ignore && !error && data && data.length > 0) {
          // Mapeia os campos do banco para o type Vehicle
          const mappedVehicles = data.map((v: any) => ({
            id: v.id,
            type: v.type,
            description: v.description,
            user_id: v.user_id
          }));
          setVehicles(mappedVehicles);
        } else {
          // Fallback para dados mockados
          setVehicles(mockVehicles);
        }
      } catch (err) {
        setError('Erro ao carregar veículos');
        // Fallback para dados mockados em caso de erro
        setVehicles(mockVehicles);
      } finally {
        setLoading(false);
      }
    }
    fetchVehicles();
    return () => { ignore = true; };
  }, [userId]);

  return { vehicles, loading, error };
}; 