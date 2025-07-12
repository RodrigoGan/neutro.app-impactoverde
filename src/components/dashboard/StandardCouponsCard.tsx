import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ticket, ChevronRight, ArrowRight, ShoppingCart, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Coupon {
  id: string;
  name: string;
  value: string;
  expiresAt: Date;
  partnerName: string;
}

interface StandardCouponsCardProps {
  userLevel: {
    label: string;
    color?: string;
  };
  monthlyLimit: number;
  availableCoupons: number;
  activeCoupons: Coupon[];
  userName: string;
  entityName?: string;
  userType: string;
  userId?: string;
  user?: any;
}

const StandardCouponsCard: React.FC<StandardCouponsCardProps> = ({
  userLevel,
  monthlyLimit,
  availableCoupons,
  activeCoupons,
  userName,
  entityName,
  userType,
  userId,
  user
}) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="space-y-2 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center justify-between sm:flex-1">
            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
              <Ticket className="h-5 w-5 text-neutro" />
              Meus Cupons
            </CardTitle>
            <Badge variant="secondary" className="bg-neutro/10 text-neutro sm:hidden">
              Nível {userLevel.label}
            </Badge>
          </div>
          <Badge variant="secondary" className="bg-neutro/10 text-neutro hidden sm:inline-flex">
            Nível {userLevel.label}
          </Badge>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Você pode pegar até {monthlyLimit} cupons por mês por estar no nível {userLevel.label}
          </p>
          <Badge variant="outline" className="w-fit">
            {availableCoupons}/{monthlyLimit} disponíveis
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4 sm:p-6">
        {activeCoupons.length > 0 ? (
          <div className="space-y-3">
            {activeCoupons.slice(0, 2).map((coupon) => (
              <div
                key={coupon.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-secondary/20 rounded-lg gap-2 sm:gap-3"
              >
                <div className="flex items-center gap-3">
                  <Ticket className="h-5 w-5 text-neutro shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{coupon.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {coupon.partnerName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1">
                  <p className="font-bold">{coupon.value}</p>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    Válido até {new Date(coupon.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>Você não tem cupons ativos no momento</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <Button 
            variant="outline" 
            className="w-full sm:flex-1"
            onClick={() => navigate('/user/coupons', { state: { userType, userName, entityName, userId, user } })}
          >
            Ver Mais Cupons
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            variant="default" 
            className="w-full sm:flex-1"
            onClick={() => navigate('/cupons/buscar', { 
              state: { 
                userLevel: {
                  label: userLevel.label,
                  color: userLevel.color || 'bg-neutro/10 text-neutro'
                },
                userType: 'common_user',
                userName,
                entityName
              }
            })}
          >
            Buscar Novos
            <Search className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default StandardCouponsCard; 