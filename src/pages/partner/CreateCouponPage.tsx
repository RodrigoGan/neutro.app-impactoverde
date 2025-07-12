import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CreateCouponForm } from '@/components/partner/CreateCouponForm';
import { ArrowLeft } from 'lucide-react';

type PartnerType = 'restaurant' | 'store' | 'educational';

export function CreateCouponPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Determina o tipo de parceiro baseado no state da navegação ou query params
  const getPartnerType = (): PartnerType => {
    const searchParams = new URLSearchParams(location.search);
    const type = searchParams.get('type');
    
    switch (type) {
      case 'store':
        return 'store';
      case 'educational':
        return 'educational';
      default:
        return 'restaurant';
    }
  };

  // Função para ser chamada após fechar o modal do QR Code
  const handleAfterQRCode = () => {
    navigate('/dashboard/standard');
  };

  const handleSubmit = (data: any) => {
    // Apenas exibe o toast, não navega
    toast({
      title: 'Cupom criado com sucesso!',
      description: 'O cupom foi criado e está disponível para uso.',
    });
    // O redirecionamento será feito após fechar o modal do QR Code
  };

  const userId = location.state?.userId;

  return (
    <div className="container max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            const searchParams = new URLSearchParams(location.search);
            const type = searchParams.get('type') || 'restaurant';
            const userId = location.state?.userId;
            navigate(
              `/partner/coupons-management?type=${type}${userId ? `&userId=${userId}` : ''}`,
              userId ? { state: { userId } } : undefined
            );
          }}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Criar Novo Cupom</h1>
      </div>

      <div className="space-y-6">
        <CreateCouponForm
          partnerType={getPartnerType()}
          onSubmit={handleSubmit}
          onAfterQRCode={handleAfterQRCode}
          userId={userId}
        />
      </div>
    </div>
  );
} 