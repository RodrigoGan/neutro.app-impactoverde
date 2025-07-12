import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface Neighborhood {
  id: string;
  name: string;
  city_id?: string;
  city_name?: string;
}

const mockNeighborhoods: Neighborhood[] = [
  { id: '1', name: 'Centro' },
  { id: '2', name: 'Jardim América' },
  { id: '3', name: 'Vila Nova' },
  { id: '4', name: 'Boa Vista' },
  { id: '5', name: 'São José' },
  { id: '6', name: 'Santa Cruz' },
  { id: '7', name: 'Industrial' },
  { id: '8', name: 'Vila Maria' },
  { id: '9', name: 'Jardim Europa' },
  { id: '10', name: 'São Francisco' }
];

export const useNeighborhoods = () => {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function fetchNeighborhoods() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('neighborhoods')
          .select(`
            id,
            name,
            cities (
              id,
              name
            )
          `)
          .order('name');
        
        if (!ignore && !error && data && data.length > 0) {
          // Mapeia os campos do banco para o type Neighborhood
          const mappedNeighborhoods = data.map((n: any) => ({
            id: n.id,
            name: n.name,
            city_id: n.cities?.id,
            city_name: n.cities?.name
          }));
          setNeighborhoods(mappedNeighborhoods);
        } else {
          // Fallback para dados mockados
          setNeighborhoods(mockNeighborhoods);
        }
      } catch (err) {
        setError('Erro ao carregar bairros');
        // Fallback para dados mockados em caso de erro
        setNeighborhoods(mockNeighborhoods);
      } finally {
        setLoading(false);
      }
    }
    fetchNeighborhoods();
    return () => { ignore = true; };
  }, []);

  return { neighborhoods, loading, error };
}; 