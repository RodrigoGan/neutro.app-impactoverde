import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Plus, ArrowLeft } from 'lucide-react';
import { CreateCouponForm } from '@/components/partner/CreateCouponForm';

// Mock de cupons (importar do local correto no seu projeto)
import { mockCoupons } from './Management';

// Importe os mocks corretos para cada tipo de parceiro
import { standardRestaurantCoupons, standardStoreCoupons, standardEducationalCoupons } from '@/mocks/StandardCouponsMockData';

const EditCouponPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const searchParams = new URLSearchParams(location.search);
  const couponId = searchParams.get('id');
  const partnerType = (searchParams.get('type') as 'restaurant' | 'store' | 'educational') || 'restaurant';
  const userId = location.state?.userId || searchParams.get('userId');

  const [coupon, setCoupon] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const getCouponsByType = (type: string) => {
    if (type === 'store') return standardStoreCoupons.activeCoupons;
    if (type === 'educational') return standardEducationalCoupons.activeCoupons;
    return standardRestaurantCoupons.activeCoupons;
  };

  useEffect(() => {
    if (couponId) {
      const coupons = getCouponsByType(partnerType);
      const found = coupons.find(c => String(c.id) === String(couponId));
      setCoupon(found || null);
    }
    setLoading(false);
  }, [couponId, partnerType]);

  const handleSubmit = (data: any) => {
    console.log('SUBMIT DISPARADO', data);
    // Atualizar o mock (apenas para simulação)
    if (coupon) {
      Object.assign(coupon, data);
      toast({
        title: 'Cupom editado com sucesso!',
        description: 'As alterações foram salvas.',
        duration: 2000,
      });
      setTimeout(() => {
        navigate(`/partner/coupons-management?type=${partnerType}${userId ? `&userId=${userId}` : ''}`, userId ? { state: { userId } } : undefined);
      }, 1200);
    }
  };

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (!coupon) return <div className="p-8 text-center text-red-600">Cupom não encontrado.</div>;

  return (
    <div className="container max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/partner/coupons-management?type=${partnerType}${userId ? `&userId=${userId}` : ''}`, userId ? { state: { userId } } : undefined)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Editar Cupom</h1>
      </div>
      <div className="space-y-6">
        <CreateCouponForm
          partnerType={partnerType as 'restaurant' | 'store' | 'educational'}
          onSubmit={handleSubmit}
          onAfterQRCode={() => {}}
          initialData={coupon}
          isEdit
        />
      </div>
    </div>
  );
};

export default EditCouponPage; 