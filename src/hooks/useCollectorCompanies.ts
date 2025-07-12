import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface CollectorCompany {
  id: string;
  name: string;
  location?: string;
  distance?: string;
  isCurrent?: boolean;
  prices?: MaterialPrice[];
}

export interface MaterialPrice {
  materialId: string;
  name: string;
  basePrice: number;
  adjustment: number;
  unit: string;
}

export const useCollectorCompanies = () => {
  const [companies, setCompanies] = useState<CollectorCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCompanies() {
      setLoading(true);
      setError(null);
      
      try {
        // Buscar empresas coletoras do banco de dados
        const { data, error } = await supabase
          .from('companies')
          .select(`
            id,
            name,
            address,
            city,
            state
          `)
          .eq('company_type', 'collector_company')
          .eq('is_active', true);

        if (error) {
          console.error('Erro ao buscar empresas coletoras:', error);
          setError('Erro ao buscar empresas coletoras');
          setCompanies([]);
          return;
        }

        // Transformar dados para o formato esperado
        const transformedCompanies: CollectorCompany[] = (data || []).map(company => ({
          id: company.id,
          name: company.name,
          location: `${company.city}, ${company.state}`,
          distance: 'Calculando...', // TODO: Implementar cálculo de distância
          isCurrent: false, // TODO: Implementar lógica de empresa atual
          prices: [] // TODO: Implementar busca de preços
        }));

        setCompanies(transformedCompanies);
      } catch (err) {
        console.error('Erro inesperado ao buscar empresas:', err);
        setError('Erro inesperado ao buscar empresas');
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, []);

  return {
    companies,
    loading,
    error
  };
}; 