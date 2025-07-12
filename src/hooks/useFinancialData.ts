import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface FinancialData {
  totalRevenue: number;
  monthlyRevenue: number;
  totalCollections: number;
  monthlyCollections: number;
  averageCollectionValue: number;
  pendingPayments: number;
  completedPayments: number;
  revenueChart: {
    labels: string[];
    data: number[];
  };
  collectionsChart: {
    labels: string[];
    data: number[];
  };
}

export const useFinancialData = (userId?: string, userType?: string, entityId?: string) => {
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFinancialData() {
      if (!userId || !userType) {
        setLoading(false);
        setFinancialData(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let totalRevenue = 0;
        let monthlyRevenue = 0;
        let totalCollections = 0;
        let monthlyCollections = 0;
        let pendingPayments = 0;
        let completedPayments = 0;

        // Buscar coleções baseado no tipo de usuário
        if (["individual_collector", "cooperative_owner", "collector_company_owner"].includes(userType)) {
          const { data: collections, error: collectionsError } = await supabase
            .from('collections')
            .select(`
              id,
              total_value,
              status,
              created_at,
              materials (
                material_id,
                quantity,
                unit_price
              )
            `)
            .eq(userType === 'individual_collector' ? 'collector_id' : 'entity_id', 
                userType === 'individual_collector' ? userId : entityId)
            .order('created_at', { ascending: false });

          if (collectionsError || !collections) {
            setFinancialData({
              totalRevenue: 0,
              monthlyRevenue: 0,
              totalCollections: 0,
              monthlyCollections: 0,
              averageCollectionValue: 0,
              pendingPayments: 0,
              completedPayments: 0,
              revenueChart: { labels: [], data: [] },
              collectionsChart: { labels: [], data: [] }
            });
            setLoading(false);
            setError(null);
            return;
          }

          totalRevenue = (collections || []).reduce((sum, collection) => sum + (collection.total_value || 0), 0);
          const lastMonth = new Date();
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          monthlyRevenue = (collections || []).filter(collection => new Date(collection.created_at) >= lastMonth).reduce((sum, collection) => sum + (collection.total_value || 0), 0);
          totalCollections = collections?.length || 0;
          monthlyCollections = (collections || []).filter(collection => new Date(collection.created_at) >= lastMonth).length;
          pendingPayments = (collections || []).filter(c => c.status === 'pending').length;
          completedPayments = (collections || []).filter(c => c.status === 'completed').length;

          setFinancialData({
            totalRevenue,
            monthlyRevenue,
            totalCollections,
            monthlyCollections,
            averageCollectionValue: totalCollections > 0 ? totalRevenue / totalCollections : 0,
            pendingPayments,
            completedPayments,
            revenueChart: { labels: [], data: [] },
            collectionsChart: { labels: [], data: [] }
          });
        } else if (userType === 'partner_owner') {
          const { data: validatedCoupons, error: couponsError } = await supabase
            .from('coupon_validations')
            .select(`
              id,
              discount_value,
              created_at
            `)
            .eq('partner_id', entityId);

          if (couponsError || !validatedCoupons) {
            setFinancialData({
              totalRevenue: 0,
              monthlyRevenue: 0,
              totalCollections: 0,
              monthlyCollections: 0,
              averageCollectionValue: 0,
              pendingPayments: 0,
              completedPayments: 0,
              revenueChart: { labels: [], data: [] },
              collectionsChart: { labels: [], data: [] }
            });
            setLoading(false);
            setError(null);
            return;
          }

          totalRevenue = (validatedCoupons || []).reduce((sum, c) => sum + (c.discount_value || 0), 0);
          const lastMonth = new Date();
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          monthlyRevenue = (validatedCoupons || []).filter(c => new Date(c.created_at) >= lastMonth).reduce((sum, c) => sum + (c.discount_value || 0), 0);
          totalCollections = validatedCoupons?.length || 0;
          monthlyCollections = (validatedCoupons || []).filter(c => new Date(c.created_at) >= lastMonth).length;

          setFinancialData({
            totalRevenue,
            monthlyRevenue,
            totalCollections,
            monthlyCollections,
            averageCollectionValue: totalCollections > 0 ? totalRevenue / totalCollections : 0,
            pendingPayments: 0,
            completedPayments: 0,
            revenueChart: { labels: [], data: [] },
            collectionsChart: { labels: [], data: [] }
          });
        } else {
          setFinancialData({
            totalRevenue: 0,
            monthlyRevenue: 0,
            totalCollections: 0,
            monthlyCollections: 0,
            averageCollectionValue: 0,
            pendingPayments: 0,
            completedPayments: 0,
            revenueChart: { labels: [], data: [] },
            collectionsChart: { labels: [], data: [] }
          });
        }
        setLoading(false);
        setError(null);
      } catch (err) {
        setFinancialData({
          totalRevenue: 0,
          monthlyRevenue: 0,
          totalCollections: 0,
          monthlyCollections: 0,
          averageCollectionValue: 0,
          pendingPayments: 0,
          completedPayments: 0,
          revenueChart: { labels: [], data: [] },
          collectionsChart: { labels: [], data: [] }
        });
        setLoading(false);
        setError('Erro ao buscar dados financeiros.');
      }
    }
    fetchFinancialData();
  }, [userId, userType, entityId]);

  return { financialData, loading, error };
}; 