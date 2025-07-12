import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface EnvironmentalImpact {
  totalCO2Saved: number;
  totalTreesSaved: number;
  totalWaterSaved: number;
  totalEnergySaved: number;
  monthlyCO2Saved: number;
  monthlyTreesSaved: number;
  monthlyWaterSaved: number;
  monthlyEnergySaved: number;
  impactChart: {
    labels: string[];
    co2Data: number[];
    treesData: number[];
    waterData: number[];
    energyData: number[];
  };
  materialsImpact: {
    material: string;
    quantity: number;
    co2Saved: number;
    treesSaved: number;
    waterSaved: number;
    energySaved: number;
  }[];
}

export const useEnvironmentalImpact = (userId?: string, entityId?: string) => {
  const [impactData, setImpactData] = useState<EnvironmentalImpact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImpactData() {
      if (!userId && !entityId) {
        setLoading(false);
        setImpactData(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Buscar coleções do usuário/entidade
        const { data: collections, error: collectionsError } = await supabase
          .from('collections')
          .select(`
            id,
            total_value,
            created_at,
            materials (
              material_id,
              quantity,
              unit,
              material:material_id (
                name,
                co2_factor,
                trees_factor,
                water_factor,
                energy_factor
              )
            )
          `)
          .eq(userId ? 'user_id' : 'entity_id', userId || entityId)
          .order('created_at', { ascending: false });

        if (collectionsError || !collections || collections.length === 0) {
          setImpactData({
            totalCO2Saved: 0,
            totalTreesSaved: 0,
            totalWaterSaved: 0,
            totalEnergySaved: 0,
            monthlyCO2Saved: 0,
            monthlyTreesSaved: 0,
            monthlyWaterSaved: 0,
            monthlyEnergySaved: 0,
            impactChart: {
              labels: [],
              co2Data: [],
              treesData: [],
              waterData: [],
              energyData: []
            },
            materialsImpact: []
          });
          setLoading(false);
          setError(null);
          return;
        }

        let totalCO2Saved = 0;
        let totalTreesSaved = 0;
        let totalWaterSaved = 0;
        let totalEnergySaved = 0;
        let monthlyCO2Saved = 0;
        let monthlyTreesSaved = 0;
        let monthlyWaterSaved = 0;
        let monthlyEnergySaved = 0;

        const materialsImpact: EnvironmentalImpact['materialsImpact'] = [];
        const materialTotals: { [key: string]: number } = {};

        // Calcular impacto total
        (collections || []).forEach(collection => {
          const isLastMonth = new Date(collection.created_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

          collection.materials?.forEach(material => {
            const materialData = material.material?.[0];
            if (!materialData) return;

            const quantity = material.quantity || 0;
            const co2Saved = quantity * (materialData.co2_factor || 0);
            const treesSaved = quantity * (materialData.trees_factor || 0);
            const waterSaved = quantity * (materialData.water_factor || 0);
            const energySaved = quantity * (materialData.energy_factor || 0);

            totalCO2Saved += co2Saved;
            totalTreesSaved += treesSaved;
            totalWaterSaved += waterSaved;
            totalEnergySaved += energySaved;

            if (isLastMonth) {
              monthlyCO2Saved += co2Saved;
              monthlyTreesSaved += treesSaved;
              monthlyWaterSaved += waterSaved;
              monthlyEnergySaved += energySaved;
            }

            // Acumular por material
            const materialName = materialData.name;
            if (!materialTotals[materialName]) {
              materialTotals[materialName] = 0;
            }
            materialTotals[materialName] += quantity;
          });
        });

        setImpactData({
          totalCO2Saved,
          totalTreesSaved,
          totalWaterSaved,
          totalEnergySaved,
          monthlyCO2Saved,
          monthlyTreesSaved,
          monthlyWaterSaved,
          monthlyEnergySaved,
          impactChart: {
            labels: [],
            co2Data: [],
            treesData: [],
            waterData: [],
            energyData: []
          },
          materialsImpact: []
        });
        setLoading(false);
        setError(null);
      } catch (err: any) {
        setImpactData({
          totalCO2Saved: 0,
          totalTreesSaved: 0,
          totalWaterSaved: 0,
          totalEnergySaved: 0,
          monthlyCO2Saved: 0,
          monthlyTreesSaved: 0,
          monthlyWaterSaved: 0,
          monthlyEnergySaved: 0,
          impactChart: {
            labels: [],
            co2Data: [],
            treesData: [],
            waterData: [],
            energyData: []
          },
          materialsImpact: []
        });
        setLoading(false);
        setError('Erro ao buscar dados de impacto ambiental.');
      }
    }
    fetchImpactData();
  }, [userId, entityId]);

  return { impactData, loading, error };
}; 