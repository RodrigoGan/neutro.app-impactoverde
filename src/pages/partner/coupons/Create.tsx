import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { CreateCouponForm } from '@/components/partner/CreateCouponForm';

const CreateCoupon: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const partnerType = (searchParams.get('type') as 'restaurant' | 'store' | 'educational') || undefined;
  const userId = location.state?.userId;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container py-6">
      <Button variant="ghost" onClick={() => navigate('/partner/coupons-management', userId ? { state: { userId } } : undefined)} className="flex items-center gap-2 mb-4">
        <ChevronLeft className="h-4 w-4" />
        Voltar
      </Button>
      <CreateCouponForm
        partnerType={partnerType}
        userId={userId}
        isEdit={false}
        onSubmit={() => {}}
        onCancel={() => navigate('/partner/coupons-management', userId ? { state: { userId } } : undefined)}
      />
    </div>
  );
};

export default CreateCoupon; 