import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface CouponUsage {
  id: string;
  user: string;
  value: number;
  valorTotalCompra: number;
  date: Date;
  type: 'validado' | 'distribuído';
  status: string;
  motivo?: string;
  couponName?: string;
  description?: string;
  rules?: string[];
  cancellationPolicy?: string;
  customerService?: string;
  code?: string;
  discountType?: string;
  category?: string;
  validUntil?: string;
  photo_url?: string;
}

interface CouponsData {
  coupons: CouponUsage[];
  totalValidados: number;
  totalDistribuidos: number;
  investimento: number;
  faturamento: number;
  ticketMedio: number;
  roi: number;
}

export const useCoupons = (partnerId: string) => {
  const [couponsData, setCouponsData] = useState<CouponsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar cupons do parceiro
        const { data: coupons, error: couponsError } = await supabase
          .from('coupons')
          .select('*')
          .eq('partner_id', partnerId);

        if (couponsError) throw couponsError;

        console.log('[useCoupons] coupons:', coupons);

        // Se não houver cupons, retorna vazio e métricas zeradas
        if (!coupons || coupons.length === 0) {
          setCouponsData({
            coupons: [],
            totalValidados: 0,
            totalDistribuidos: 0,
            investimento: 0,
            faturamento: 0,
            ticketMedio: 0,
            roi: 0
          });
          setLoading(false);
          return;
        }

        // Buscar uso dos cupons (só se houver cupons)
        let usage = [];
        let usageError = null;
        if (coupons.length > 0) {
          const result = await supabase
            .from('coupon_usage')
            .select('*')
            .in('coupon_id', coupons.map(c => c.id));
          usage = result.data;
          usageError = result.error;
        }
        // Se erro 400, tratar como resultado vazio
        if (
          usageError && (
            usageError.code === '400' ||
            usageError.status === 400 ||
            (typeof usageError.message === 'string' && usageError.message.includes('400'))
          )
        ) {
          usageError = null;
          usage = [];
        }
        if (usageError) throw usageError;

        // Mapear dados para formato esperado
        const mappedCoupons = (usage || []).map(u => ({
          id: u.id,
          user: u.user?.name || 'Usuário',
          value: u.coupon?.discount_value || 0,
          valorTotalCompra: u.purchase_value || 0,
          date: new Date(u.created_at),
          type: (u.status === 'used' ? 'validado' : 'distribuído') as 'validado' | 'distribuído',
          status: u.status || 'ativo',
          motivo: u.reason && u.reason !== '' ? u.reason : undefined,
          couponName: u.coupon?.title || u.coupon?.name,
          description: u.coupon?.description,
          rules: u.coupon?.rules,
          cancellationPolicy: u.coupon?.cancellation_policy,
          customerService: u.coupon?.customer_service,
          code: u.coupon?.coupon_code || u.coupon?.code,
          discountType: u.coupon?.discount_type,
          category: u.coupon?.category,
          validUntil: u.coupon?.valid_until,
          photo_url: u.coupon?.photo_url,
        }));

        // Calcular métricas
        const totalValidados = mappedCoupons.filter(c => c.type === 'validado').length;
        const totalDistribuidos = mappedCoupons.length;
        const investimento = mappedCoupons.filter(c => c.type === 'validado').reduce((acc, c) => acc + c.value, 0);
        const faturamento = mappedCoupons.filter(c => c.type === 'validado').reduce((acc, c) => acc + c.valorTotalCompra, 0);
        const ticketMedio = totalValidados > 0 ? faturamento / totalValidados : 0;
        const roi = investimento > 0 ? faturamento / investimento : 0;

        setCouponsData({
          coupons: mappedCoupons,
          totalValidados,
          totalDistribuidos,
          investimento,
          faturamento,
          ticketMedio,
          roi
        });

      } catch (err) {
        console.error('Erro ao buscar cupons:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setCouponsData(null);
      } finally {
        setLoading(false);
      }
    };

    if (partnerId) {
      fetchCoupons();
    }
  }, [partnerId]);

  return {
    couponsData,
    loading,
    error
  };
};