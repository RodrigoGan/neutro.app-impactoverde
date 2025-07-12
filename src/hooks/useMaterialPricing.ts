import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface MaterialPrice {
  materialId: string;
  name: string;
  price: number;
  unit: string;
  isActive: boolean;
}

import { PriceAdjustment } from '@/types/pricing';

export interface PricingData {
  basePrices: MaterialPrice[];
  adjustments: PriceAdjustment[];
  companyName?: string;
}

export const useMaterialPricing = (companyId?: string) => {
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPricingData() {
      setLoading(true);
      setError(null);
      try {
        // Buscar todos os materiais ativos
        const { data: materials, error: materialsError } = await supabase
          .from('materials')
          .select('id, name, unit, is_active')
          .eq('is_active', true)
          .order('name');
        if (materialsError) throw materialsError;

        // Buscar preços cadastrados pelas empresas
        const { data: prices, error: pricesError } = await supabase
          .from('company_material_prices')
          .select('company_id, material_id, price');
        if (pricesError) throw pricesError;

        let basePrices: MaterialPrice[] = [];
        if (!companyId) {
          // Coletor sem vínculo: calcular média dos preços (referência)
          basePrices = (materials || []).map(mat => {
            const materialPrices = (prices || []).filter(p => p.material_id === mat.id);
            const avg = materialPrices.length > 0 ? materialPrices.reduce((sum, p) => sum + Number(p.price), 0) / materialPrices.length : null;
            return {
              materialId: mat.id,
              name: mat.name,
              price: avg !== null ? avg : 0,
              unit: mat.unit || 'kg',
              isActive: mat.is_active
            };
          });
        } else {
          // Coletor vinculado: buscar preço da empresa vinculada
          basePrices = (materials || []).map(mat => {
            const companyPrice = (prices || []).find(p => p.material_id === mat.id && p.company_id === companyId);
            return {
              materialId: mat.id,
              name: mat.name,
              price: companyPrice ? Number(companyPrice.price) : 0,
              unit: mat.unit || 'kg',
              isActive: mat.is_active
            };
          });
        }

        setPricingData({ basePrices, adjustments: [] });
      } catch (err) {
        setError('Erro ao buscar preços dos materiais.');
        setPricingData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchPricingData();
  }, [companyId]);

  return { pricingData, loading, error };
}; 