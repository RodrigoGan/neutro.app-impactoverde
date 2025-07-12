import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Ticket, Search, Filter, ChevronDown, Clock, CheckCircle2, MapPin, Trophy, ChevronLeft, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BackButton } from '@/components/ui/back-button';
import { getMonthlyCouponLimit, getRemainingCouponsForMonth } from '@/lib/couponUtils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { QRCodeCanvas } from 'qrcode.react';

interface MockCoupon {
  id: string;
  name: string;
  value: string;
  valueNumeric?: number;
  valorTotalCompra?: number;
  expiresAt: Date;
  partnerName: string;
  status?: string;
  motivo?: string;
  location?: {
    address?: string;
  } | null;
  rules?: string[] | null;
  photo_url: string;
  couponCode: string;
  description?: string;
  cancellationPolicy?: string;
  customerService?: string;
}

const UserCoupons: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, loading: authLoading } = useAuth();
  const userType = (authUser?.user_type || 'common').toLowerCase();
  const user = location.state?.user;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('active');
  const [expandedCoupon, setExpandedCoupon] = useState<string | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [realCoupons, setRealCoupons] = useState<MockCoupon[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const statuses = [
    { value: 'active', label: 'Disponíveis' },
    { value: 'used', label: 'Usados' },
    { value: 'inactive', label: 'Inativos' },
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Filtrar cupons reais
  const filteredCoupons = (realCoupons || []).filter((coupon: MockCoupon) => {
    const matchesSearch = coupon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         coupon.partnerName.toLowerCase().includes(searchQuery.toLowerCase());
    const status = 'status' in coupon && typeof coupon.status === 'string' ? coupon.status.toLowerCase() : undefined;
    const isUsed = status === 'usado' || status === 'used';
    const isInactiveStatus = status === 'expirado' || status === 'expired' || status === 'inativo' || status === 'inactive' || status === 'excluído' || status === 'excluido' || status === 'deleted' || status === 'cancelado' || status === 'cancelled';
    const isExpired = coupon.expiresAt < today;
    const matchesStatus =
      selectedStatus === 'active'
        ? ((!status || status === 'ativo' || status === 'active') && !isExpired)
        : selectedStatus === 'used'
        ? isUsed
        : selectedStatus === 'inactive'
        ? (isInactiveStatus || isExpired)
        : false;
    return matchesSearch && matchesStatus;
  });

  const handleShowCoupon = (coupon) => {
    if (coupon.code) {
      setSelectedCoupon(coupon);
    } else {
      setSelectedCoupon({
        code: coupon.id,
        name: coupon.name,
        partnerName: coupon.partnerName,
        expiresAt: coupon.expiresAt,
      });
    }
    setShowQRCode(true);
  };

  useEffect(() => {
    if (searchQuery.length > 0 && realCoupons) {
      const allSuggestions = realCoupons
        .map(coupon => [coupon.name, coupon.partnerName])
        .flat()
        .filter(Boolean);
      const filtered = allSuggestions.filter(s =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  }, [searchQuery, realCoupons]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // MOCK: simular id e nível do usuário
  const userId = authUser?.id;
  let userLevel = 'bronze';
  if (authUser?.level) {
    if (typeof authUser.level === 'string') {
      userLevel = authUser.level.toLowerCase();
    } else if (typeof authUser.level === 'number') {
      userLevel = authUser.level === 1 ? 'bronze' : authUser.level === 2 ? 'silver' : authUser.level === 3 ? 'gold' : 'bronze';
    }
  }
  const monthLimit = getMonthlyCouponLimit(userType, userLevel);
  // Calcular resgatados este mês a partir dos dados reais:
  const currentMonthKey = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  const redeemedThisMonth = (realCoupons || []).filter(coupon => {
    // Considera cupons usados ou ativos resgatados neste mês
    const usedAt = coupon.expiresAt instanceof Date ? coupon.expiresAt : new Date(coupon.expiresAt);
    const month = usedAt.toISOString().slice(0, 7);
    return month === currentMonthKey;
  }).length;
  const remainingThisMonth = getRemainingCouponsForMonth(userLevel, redeemedThisMonth);

  useEffect(() => {
    if (!userId || authLoading) return; // Só busca se tiver userId real e usuário carregado
    async function fetchUserCoupons() {
      setLoading(true);
      setError(false);
      try {
        console.log('[UserCoupons] userId utilizado:', userId);
        const { data: usage, error } = await supabase
          .from('coupon_usage')
          .select('*, coupon:coupons(*), partner:users(name)')
          .eq('user_id', userId)
          .order('used_at', { ascending: false });
        console.log('[UserCoupons] Resultado da query coupon_usage:', usage, 'Erro:', error);
        if (error) throw error;
        const mapped: MockCoupon[] = (usage || []).map(u => ({
          id: u.coupon?.id || u.id,
          name: u.coupon?.title || '',
          value: u.coupon?.discount_type === 'percentage' ?
            (u.coupon?.discount_value ? `${u.coupon?.discount_value}%` : '') :
            (u.coupon?.discount_value ? `R$ ${u.coupon?.discount_value}` : ''),
          valueNumeric: u.coupon?.discount_value || 0,
          valorTotalCompra: u.purchase_amount || 0,
          expiresAt: new Date(u.coupon?.valid_until || u.used_at),
          partnerName: u.partner?.name || '',
          status: u.status || '',
          motivo: u.reason && u.reason !== '' ? u.reason : undefined,
          location: undefined,
          rules: u.coupon?.rules || [],
          photo_url: u.coupon?.photo_url || '',
          couponCode: u.coupon?.couponCode || u.coupon?.code || u.coupon?.id || u.id,
          description: u.coupon?.description || '',
          cancellationPolicy: u.coupon?.cancellationPolicy || '',
          customerService: u.coupon?.customerService || '',
        }));
        setRealCoupons(mapped);
      } catch (error) {
        setRealCoupons([]);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchUserCoupons();
  }, [userId, authLoading]);

  // Novo loading global para usuário
  if (!authUser && authLoading) {
    return <Layout><div className="container mx-auto px-4 py-8 text-center">Carregando usuário...</div></Layout>;
  }

  if (loading) {
    return <Layout><div className="container mx-auto px-4 py-8 text-center">Carregando cupons...</div></Layout>;
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <Ticket className="mx-auto mb-4 w-12 h-12 text-red-400" />
          <h2 className="text-xl font-semibold mb-2">Erro ao carregar cupons.</h2>
          <p className="text-muted-foreground mb-4">
            Ocorreu um erro ao buscar seus cupons. Tente novamente mais tarde.
          </p>
          <Button onClick={() => window.location.reload()} variant="default">
            Tentar novamente
          </Button>
        </div>
      </Layout>
    );
  }

  // Renderização principal da página
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => window.history.back()} className="flex items-center gap-2 mr-2">
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="h-6 w-6 text-yellow-600" /> Meus Cupons
          </h1>
        </div>
        {/* NOVO CARD DE LIMITE DE CUPONS */}
        <div className="mb-6 p-4 rounded bg-yellow-50 border border-yellow-200 text-yellow-900 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <strong>Limite mensal de resgate:</strong> {monthLimit} cupons ({userLevel.charAt(0).toUpperCase() + userLevel.slice(1)})<br/>
            <strong>Resgatados este mês:</strong> {redeemedThisMonth} / {monthLimit}<br/>
            <strong>Disponíveis para resgatar:</strong> {remainingThisMonth}
          </div>
        </div>
        {/* FIM NOVO CARD */}
        {/* Header Simplificado */}
        <div className="mb-6">
          {user && user.name && (
            <p className="text-muted-foreground">{user.name}</p>
          )}
        </div>

        {/* Filtros Simplificados */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cupons..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(suggestions.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            />
            {showSuggestions && (
              <div className="absolute z-10 left-0 right-0 bg-white border border-gray-200 rounded shadow-md mt-1 max-h-40 overflow-auto">
                {suggestions.map((s, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                    onMouseDown={() => {
                      setSearchQuery(s);
                      setShowSuggestions(false);
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {statuses.map((status) => (
              <Button
                key={status.value}
                variant={selectedStatus === status.value ? "default" : "outline"}
                onClick={() => setSelectedStatus(status.value)}
                className="whitespace-nowrap"
              >
                {status.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Lista de Cupons ou mensagem amigável */}
        <div className="space-y-2">
          {filteredCoupons.length > 0 ? (
            filteredCoupons.map(coupon => {
              const isUsed = 'status' in coupon && typeof coupon.status === 'string' && (coupon.status === 'used' || coupon.status === 'usado');
              const isExpired = 'status' in coupon && typeof coupon.status === 'string' && (coupon.status === 'expired' || coupon.status === 'expirado');
              const isInactive = 'status' in coupon && typeof coupon.status === 'string' && (coupon.status === 'expirado' || coupon.status === 'expired' || coupon.status === 'inativo' || coupon.status === 'inactive' || coupon.status === 'excluído' || coupon.status === 'excluido' || coupon.status === 'deleted' || coupon.status === 'cancelado' || coupon.status === 'cancelled');
              const badgeColor = selectedStatus === 'active'
                ? 'bg-green-100 text-green-700'
                : selectedStatus === 'used'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-red-100 text-red-700';
              const statusText = selectedStatus === 'active' ? 'Disponível' : selectedStatus === 'used' ? 'Usado' : 'Inativo';
              
              return (
                <div
                  key={coupon.id}
                  className={`border rounded-lg bg-white transition-all duration-200 hover:shadow-md ${
                    expandedCoupon === coupon.id ? 'border-neutro shadow-lg' : ''
                  } ${(isUsed || isInactive) ? 'opacity-90' : ''}`}
                >
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 focus:outline-none"
                    onClick={() => setExpandedCoupon(expandedCoupon === coupon.id ? null : coupon.id)}
                    aria-expanded={expandedCoupon === coupon.id}
                  >
                    <div className="flex items-center gap-3">
                      {/* Foto do cupom */}
                      <div className="flex-shrink-0">
                        {coupon.photo_url ? (
                          <img
                            src={coupon.photo_url}
                            alt={`Foto do cupom ${coupon.name}`}
                            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">📷</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-base">{coupon.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-semibold text-green-600">{coupon.value}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${badgeColor}`}>
                            {statusText}
                          </span>
                        </div>
                      </div>
                    </div>
                    {expandedCoupon === coupon.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedCoupon === coupon.id && (
                    <div className="px-4 pb-3 text-sm animate-fade-in">
                      {/* Foto do cupom em tamanho maior */}
                      <div className="mb-3 flex justify-center">
                        {coupon.photo_url ? (
                          <img
                            src={coupon.photo_url}
                            alt={`Foto do cupom ${coupon.name}`}
                            className="w-32 h-32 rounded-lg object-cover border border-gray-200 shadow-sm"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-32 h-32 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-400 text-2xl">📷</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                        <div><span className="font-semibold">Valor:</span> {coupon.value}</div>
                        <div><span className="font-semibold">Validade:</span> {coupon.expiresAt.toLocaleDateString('pt-BR')}</div>
                        <div><span className="font-semibold">Parceiro:</span> {coupon.partnerName}</div>
                        {coupon.valorTotalCompra && <div><span className="font-semibold">Valor da compra:</span> R$ {coupon.valorTotalCompra.toFixed(2)}</div>}
                        {coupon.motivo && <div className="sm:col-span-2"><span className="font-semibold">Motivo:</span> {coupon.motivo}</div>}
                      </div>
                      
                      {/* Descrição */}
                      {coupon.description && (
                        <div className="mb-3">
                          <span className="font-semibold">Descrição:</span>
                          <p className="text-sm text-gray-600 mt-1">{coupon.description}</p>
                        </div>
                      )}
                      
                      {/* Regras */}
                      {coupon.rules && coupon.rules.length > 0 && (
                        <div className="mb-3">
                          <span className="font-semibold">Regras:</span>
                          <ul className="text-sm text-gray-600 mt-1 list-disc list-inside">
                            {coupon.rules.map((rule, index) => (
                              <li key={index}>{rule}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Política de Cancelamento */}
                      {coupon.cancellationPolicy && (
                        <div className="mb-3">
                          <span className="font-semibold">Política de Cancelamento:</span>
                          <p className="text-sm text-gray-600 mt-1">{coupon.cancellationPolicy}</p>
                        </div>
                      )}
                      
                      {/* SAC */}
                      {coupon.customerService && (
                        <div className="mb-3">
                          <span className="font-semibold">SAC:</span>
                          <p className="text-sm text-gray-600 mt-1">{coupon.customerService}</p>
                        </div>
                      )}
                      
                      {/* Localização */}
                      {coupon.location && coupon.location.address && (
                        <div className="mb-3">
                          <span className="font-semibold">Endereço:</span>
                          <p className="text-sm text-gray-600 mt-1">{coupon.location.address}</p>
                        </div>
                      )}
                      
                      {/* QR Code */}
                      <div className="mb-3">
                        <span className="font-semibold">QR Code do Cupom:</span>
                        <div className="flex flex-col items-center mt-2">
                          <QRCodeCanvas 
                            value={coupon.couponCode || coupon.id} 
                            size={120} 
                            level="H" 
                            includeMargin={true}
                            className="border border-gray-200 rounded-lg p-2 bg-white"
                          />
                          <p className="text-xs text-gray-600 mt-2 break-all text-center">
                            Código: {coupon.couponCode || coupon.id}
                          </p>
                        </div>
                      </div>
                      
                      {/* Botão para cupons ativos */}
                      {!isUsed && !isInactive && (
                        <div className="flex justify-center mt-3">
                          <Button 
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShowCoupon(coupon);
                            }}
                          >
                            <Ticket className="h-4 w-4 mr-2" />
                            Ver QR Code
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center mt-12">
              <Ticket className="mx-auto mb-4 w-12 h-12 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Nenhum cupom resgatado</h2>
              <p className="text-muted-foreground mb-4">
                Você ainda não possui cupons resgatados.<br />
                Explore a página de <b>Cupons Disponíveis</b> para pegar cupons de empresas parceiras, respeitando o limite mensal do seu nível.
              </p>
              <Link to="/cupons/buscar">
                <Button className="mt-2" variant="default">
                  Buscar Cupons
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Modal do QR Code */}
        <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-center">QR Code do Cupom</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 p-4">
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <QRCodeCanvas 
                    value={selectedCoupon?.code || selectedCoupon?.id} 
                    size={200} 
                    level="H" 
                    includeMargin={true}
                    className="border border-gray-200 rounded-lg p-3 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold break-all">{selectedCoupon?.code || selectedCoupon?.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedCoupon?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedCoupon?.partnerName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Válido até {selectedCoupon?.expiresAt?.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default UserCoupons; 