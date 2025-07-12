import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Material, getMateriaisList } from '@/config/materials';

export const useMaterials = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function fetchMaterials() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('materials')
          .select('*')
          .order('name');
        
        if (!ignore && !error && data && data.length > 0) {
          // Mapeia os campos do banco para o type Material do front
          const mappedMaterials = data.map((m: any) => ({
            id: m.id,
            nome: m.name,
            unidadeDefault: m.default_unit,
            conversao: {
              kg: m.conversion_kg || 1,
              un: m.conversion_un || 1,
              sacos: m.conversion_sacos || 1,
              L: m.conversion_l || 1
            },
            icone: m.icon || 'Package',
            cor: m.color || 'text-blue-600'
          }));
          setMaterials(mappedMaterials);
        } else {
          // Fallback para dados mockados
          setMaterials(getMateriaisList());
        }
      } catch (err) {
        setError('Erro ao carregar materiais');
        // Fallback para dados mockados em caso de erro
        setMaterials(getMateriaisList());
      } finally {
        setLoading(false);
      }
    }
    fetchMaterials();
    return () => { ignore = true; };
  }, []);

  return { materials, loading, error };
}; 