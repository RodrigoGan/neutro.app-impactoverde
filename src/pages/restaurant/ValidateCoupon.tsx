import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const ValidateCoupon: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Button variant="ghost" onClick={() => navigate('/dashboard/standard', { state: { userId: location.state?.userId } })} className="flex items-center gap-2 mb-4">
      <ChevronLeft className="h-4 w-4" />
      Voltar
    </Button>
  );
};

export default ValidateCoupon; 