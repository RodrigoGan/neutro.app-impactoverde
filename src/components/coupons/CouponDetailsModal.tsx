import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Clock,
  Phone,
  Car,
  Bus,
  AlertCircle,
  Info,
  CalendarClock,
  User,
  Building2,
  Mail,
  ExternalLink
} from "lucide-react";
import { getMonthlyCouponLimit, getMonthlyCouponLimitByLevel, getCouponsRedeemedThisMonth, canRedeemCoupon } from '@/lib/couponUtils';
import { useAuth } from '@/contexts/AuthContext';

interface Location {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  openingHours: string;
  phone: string;
}

interface OnlineInfo {
  url: string;
  instructions: string[];
  validationCode?: string;
}

interface Coupon {
  id: string;
  type: 'presential' | 'online' | 'hybrid';
  name: string;
  partnerName: string;
  value: string;
  expiresAt: Date;
  remainingQuantity: number;
  description: string;
  rules: string[];
  userLimit: number;
  cancellationPolicy: string;
  customerService: string;
  location?: Location;
  parkingInfo?: string;
  publicTransport?: string[];
  corporateContact?: string;
  onlineInfo?: OnlineInfo;
  photo_url?: string; // Added photo_url to the Coupon interface
}

interface CouponDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon: Coupon;
  userType?: string;
  userLevel?: string;
  redeemedThisMonth?: number;
  userTypeOld?: 'common_user' | 'individual_collector' | 'linked_collector' | 'company' | 'partner'; // compatibilidade
}

const CouponDetailsModal: React.FC<CouponDetailsModalProps> = ({
  isOpen,
  onClose,
  coupon,
  userType,
  userLevel,
  redeemedThisMonth,
  userTypeOld
}) => {
  const { user: authUser } = useAuth();
  // Prioriza props, senão pega do contexto
  const resolvedUserType = (userType || authUser?.user_type || 'common').toLowerCase();
  let resolvedUserLevel = userLevel || 'bronze';
  if (!userLevel && authUser?.level) {
    if (typeof authUser.level === 'string') {
      resolvedUserLevel = authUser.level.toLowerCase();
    } else if (typeof authUser.level === 'number') {
      resolvedUserLevel = authUser.level === 1 ? 'bronze' : authUser.level === 2 ? 'silver' : authUser.level === 3 ? 'gold' : 'bronze';
    }
  }
  // Limite real
  const monthLimit = getMonthlyCouponLimit(resolvedUserType, resolvedUserLevel);
  // Resgatados reais se vier prop, senão fallback para mock
  const userId = authUser?.id || 'user123';
  const redeemed = typeof redeemedThisMonth === 'number'
    ? redeemedThisMonth
    : getCouponsRedeemedThisMonth(userId);
  const canRedeem = canRedeemCoupon(resolvedUserLevel, redeemed);

  const isCollector = resolvedUserType === 'individual_collector' || resolvedUserType === 'linked_collector';
  const isCompanyOrPartner = resolvedUserType === 'company' || resolvedUserType === 'partner';

  const renderLocationInfo = () => {
    if (!coupon.location) return null;

    return (
      <div className="space-y-4">
        <h3 className="font-semibold">Informações do Local</h3>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-1" />
            <p>{coupon.location.address}</p>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 mt-1" />
            <p>{coupon.location.openingHours}</p>
          </div>
          <div className="flex items-start gap-2">
            <Phone className="h-4 w-4 mt-1" />
            <p>{coupon.location.phone}</p>
          </div>
          {coupon.parkingInfo && (
            <div className="flex items-start gap-2">
              <Car className="h-4 w-4 mt-1" />
              <p>{coupon.parkingInfo}</p>
            </div>
          )}
          {coupon.publicTransport && (
            <div className="flex items-start gap-2">
              <Bus className="h-4 w-4 mt-1" />
              <div>
                <p className="font-medium">Transporte Público:</p>
                <ul className="list-disc list-inside pl-4">
                  {coupon.publicTransport.map((transport, index) => (
                    <li key={index}>{transport}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderOnlineInfo = () => {
    if (!coupon.onlineInfo) return null;

    return (
      <div className="space-y-4">
        <h3 className="font-semibold">Informações Online</h3>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <ExternalLink className="h-4 w-4 mt-1" />
            <a 
              href={coupon.onlineInfo.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Acessar Site
            </a>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Instruções:</p>
            <ul className="list-disc list-inside pl-4">
              {coupon.onlineInfo.instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ul>
          </div>
          {coupon.onlineInfo.validationCode && (
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-1" />
              <div>
                <p className="font-medium">Código de Validação:</p>
                <p className="font-mono bg-muted p-2 rounded">{coupon.onlineInfo.validationCode}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderBusinessInfo = () => {
    if (!isCompanyOrPartner || !coupon.corporateContact) return null;

    return (
      <div className="space-y-4">
        <h3 className="font-semibold">Informações Corporativas</h3>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Building2 className="h-4 w-4 mt-1" />
            <p>{coupon.partnerName}</p>
          </div>
          <div className="flex items-start gap-2">
            <Mail className="h-4 w-4 mt-1" />
            <p>{coupon.corporateContact}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95%] sm:w-[90%] md:w-[80%] lg:w-[70%] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{coupon.name}</DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-2 mt-1">
              <span>{coupon.partnerName}</span>
              <Badge variant="outline">Restam {coupon.remainingQuantity}</Badge>
            </div>
          </DialogDescription>
        </DialogHeader>
        {/* Foto ampliada do cupom */}
        {coupon.photo_url ? (
          <div className="flex justify-center mb-4">
            <img
              src={coupon.photo_url}
              alt={`Foto do cupom ${coupon.name}`}
              className="w-40 h-40 rounded-xl object-cover border border-gray-200 shadow-sm"
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        ) : (
          <div className="flex justify-center mb-4">
            <div className="w-40 h-40 rounded-xl border border-gray-200 bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-3xl">📷</span>
            </div>
          </div>
        )}

        {/* NOVA SEÇÃO: Limite mensal de cupons */}
        <div className="mb-2 p-2 rounded bg-yellow-50 border border-yellow-200 text-yellow-900 text-sm">
          <strong>Limite mensal de resgate:</strong> {monthLimit} cupons ({resolvedUserLevel.charAt(0).toUpperCase() + resolvedUserLevel.slice(1)})<br/>
          <strong>Resgatados este mês:</strong> {redeemed} / {monthLimit}
          {!canRedeem && (
            <div className="mt-1 text-red-600 font-semibold">Você atingiu o limite de resgates deste mês.</div>
          )}
        </div>
        {/* FIM NOVA SEÇÃO */}

        <div className="space-y-4">
          {/* Valor e Validade */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span className="text-3xl font-bold text-green-600">{coupon.value}</span>
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              <span>Válido até {coupon.expiresAt.toLocaleDateString()}</span>
            </div>
          </div>

          <Separator />

          {/* Descrição */}
          <div>
            <p>{coupon.description}</p>
          </div>

          {/* Regras */}
          <div className="space-y-2">
            <h3 className="font-semibold">Regras de Uso</h3>
            <ul className="list-disc list-inside space-y-1">
              {coupon.rules.map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          </div>

          {/* Informações do Local/Online */}
          {coupon.type !== 'online' && renderLocationInfo()}
          {coupon.type !== 'presential' && renderOnlineInfo()}

          <Separator />

          {/* Informações Adicionais */}
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 mt-1" />
              <p>Limite de {coupon.userLimit} {coupon.userLimit === 1 ? 'cupom' : 'cupons'} por usuário</p>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-1" />
              <div>
                <p className="font-medium">Política de Cancelamento:</p>
                <p>{coupon.cancellationPolicy}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 mt-1" />
              <div>
                <p className="font-medium">SAC:</p>
                <p>{coupon.customerService}</p>
              </div>
            </div>
          </div>

          {/* Informações Corporativas */}
          {renderBusinessInfo()}
        </div>

        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button disabled={!canRedeem}>
            {isCollector ? 'Coletar Cupom' : 'Pegar Cupom'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CouponDetailsModal; 