import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Percent, 
  DollarSign, 
  Book, 
  ArrowLeft,
  TrendingUp,
  Timer,
  ArrowUpDown
} from "lucide-react";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import CouponDetailsModal from '../../components/coupons/CouponDetailsModal';
// Remover importação e uso de mocks/location.state
// import { availableCoupons, AvailableCoupon } from '../../data/availableCoupons';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

type SortOption = 'expiring' | 'remaining' | 'discount' | 'none';

// Função utilitária para mapear nível numérico ou string para label
function getLevelLabel(level) {
  if (!level) return 'Bronze';
  if (typeof level === 'string') {
    const l = level.toLowerCase();
    if (l === 'bronze' || l === 'prata' || l === 'ouro') return l.charAt(0).toUpperCase() + l.slice(1);
    if (l === 'silver') return 'Prata';
    if (l === 'gold') return 'Ouro';
    return 'Bronze';
  }
  if (typeof level === 'number') {
    if (level === 1) return 'Bronze';
    if (level === 2) return 'Prata';
    if (level === 3) return 'Ouro';
    return 'Bronze';
  }
  return 'Bronze';
}

const SearchCouponsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, loading: authLoading } = useAuth();
  // Remover importação e uso de mocks/location.state
  // const { userLevel, userType = 'common_user', userName = '', entityName = '' } = location.state || {};
  const [selectedCoupon, setSelectedCoupon] = React.useState<any | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [selectedDiscountType, setSelectedDiscountType] = React.useState('all');
  const [sortBy, setSortBy] = React.useState<SortOption>('none');
  const [realCoupons, setRealCoupons] = React.useState<any[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  console.log('Renderizando SearchCouponsPage');
  console.log('Location:', location);
  // Remover importação e uso de mocks/location.state
  // console.log('availableCoupons:', availableCoupons);
  console.log('authUser:', authUser);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    if (authLoading || !authUser) {
      console.log('[SearchCouponsPage] Aguardando authUser estar pronto:', { authUser, authLoading });
      return;
    }
    async function fetchCoupons() {
      setLoading(true);
      setFetchError(null);
      try {
        const { data: coupons, error } = await supabase
          .from('coupons')
          .select('*')
          .eq('is_active', true)
          .gte('valid_until', new Date().toISOString());
        if (error) throw error;
        const partnerIds = [...new Set((coupons || []).map(c => c.partner_id).filter(Boolean))];
        let partnersMap = {};
        if (partnerIds.length > 0) {
          const { data: partners, error: partnersError } = await supabase
            .from('users')
            .select('id, name')
            .in('id', partnerIds);
          if (!partnersError && partners) {
            partnersMap = Object.fromEntries(partners.map(p => [p.id, p.name]));
          }
        }
        const couponsMapped = (coupons || []).map(c => ({
          id: c.id,
          name: c.title,
          value: c.discount_type === 'percentage' ? `${c.discount_value}%` : `R$ ${c.discount_value}`,
          expiresAt: new Date(c.valid_until),
          partnerName: partnersMap[c.partner_id] || 'Parceiro',
          category: c.category || 'restaurant',
          discountType: c.discount_type || 'percentage',
          remainingQuantity: c.usage_limit ? (c.usage_limit - (c.used_count || 0)) : 100,
          type: c.type || 'presential',
          description: c.description || '',
          rules: c.rules || [],
          userLimit: c.user_limit || 1,
          cancellationPolicy: c.cancellation_policy || '',
          customerService: c.customer_service || '',
          location: c.location || undefined,
          parkingInfo: c.parking_info || undefined,
          publicTransport: c.public_transport || undefined,
          corporateContact: c.corporate_contact || undefined,
          onlineInfo: c.online_info || undefined,
          photo_url: c.photo_url || '',
        }));
        setRealCoupons(couponsMapped);
      } catch (error: any) {
        setRealCoupons([]);
        setFetchError('Erro ao buscar cupons. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    }
    fetchCoupons();
  }, [authUser, authLoading]);

  // Função para verificar se um cupom está próximo de expirar (7 dias)
  const isExpiringSoon = (expiresAt: Date) => {
    const now = new Date();
    const daysUntilExpiration = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration <= 7;
  };

  // Função para verificar se um cupom está com pouca quantidade (menos de 30%)
  const isLowStock = (remainingQuantity: number) => {
    const initialQuantity = 30;
    return (remainingQuantity / initialQuantity) <= 0.3;
  };

  // Função para extrair valor numérico do desconto
  const getDiscountValue = (value: string) => {
    const match = value.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  // Função de ordenação
  const sortCoupons = (coupons: any[]) => {
    switch (sortBy) {
      case 'expiring':
        return [...coupons].sort((a, b) => a.expiresAt.getTime() - b.expiresAt.getTime());
      case 'remaining':
        return [...coupons].sort((a, b) => a.remainingQuantity - b.remainingQuantity);
      case 'discount':
        return [...coupons].sort((a, b) => getDiscountValue(b.value) - getDiscountValue(a.value));
      default:
        return coupons;
    }
  };

  // Usar apenas cupons reais
  const couponsToShow = realCoupons || [];

  const filteredCoupons = React.useMemo(() => {
    let filtered = couponsToShow.filter(coupon => {
      const matchesSearch = searchTerm === '' || 
        coupon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.partnerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || coupon.category === selectedCategory;
      const matchesDiscountType = selectedDiscountType === 'all' || coupon.discountType === selectedDiscountType;
      return matchesSearch && matchesCategory && matchesDiscountType;
    });
    return sortCoupons(filtered);
  }, [searchTerm, selectedCategory, selectedDiscountType, sortBy, couponsToShow]);

  if (authLoading || !authUser) {
    return <Layout><div className="container mx-auto p-4 text-center">Carregando usuário...</div></Layout>;
  }

  if (loading) {
    return <Layout><div className="container mx-auto p-4 text-center">Carregando cupons...</div></Layout>;
  }

  if (fetchError) {
    return <Layout><div className="container mx-auto p-4 text-center text-red-500">{fetchError}</div></Layout>;
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-4">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Cupons Disponíveis</h1>
            {authUser && (
              <Badge variant="secondary" className="bg-neutro/10 text-neutro">
                Nível {getLevelLabel(authUser.level)}
              </Badge>
            )}
          </div>
          {authUser && (
            <p className="text-muted-foreground">
              {authUser.name || authUser.full_name || authUser.email}
            </p>
          )}
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            {/* Barra de Busca - Sempre visível */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cupons..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Ordenação - Sempre visível */}
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as SortOption)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <div className="flex items-center">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    Relevância
                  </div>
                </SelectItem>
                <SelectItem value="expiring">
                  <div className="flex items-center">
                    <Timer className="mr-2 h-4 w-4" />
                    Última Chance
                  </div>
                </SelectItem>
                <SelectItem value="remaining">
                  <div className="flex items-center">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Mais Populares
                  </div>
                </SelectItem>
                <SelectItem value="discount">
                  <div className="flex items-center">
                    <Percent className="mr-2 h-4 w-4" />
                    Maior Desconto
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Filtros - Expansível em mobile */}
            <div className="space-y-4 md:grid md:grid-cols-3 md:gap-4 md:space-y-0">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  <SelectItem value="restaurant">
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4" />
                      Restaurantes
                    </div>
                  </SelectItem>
                  <SelectItem value="store">
                    <div className="flex items-center">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Lojas
                    </div>
                  </SelectItem>
                  <SelectItem value="educational">
                    <div className="flex items-center">
                      <Book className="mr-2 h-4 w-4" />
                      Educacional
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedDiscountType}
                onValueChange={setSelectedDiscountType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de Desconto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="percentage">
                    <div className="flex items-center">
                      <Percent className="mr-2 h-4 w-4" />
                      Porcentagem
                    </div>
                  </SelectItem>
                  <SelectItem value="fixed">
                    <div className="flex items-center">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Valor Fixo
                    </div>
                  </SelectItem>
                  <SelectItem value="free">
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      Gratuidade
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedDiscountType('all');
                  setSortBy('none');
                }}
              >
                <Filter className="mr-2 h-4 w-4" />
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCoupons.length > 0 ? (
            filteredCoupons.map((coupon) => (
              <Card 
                key={coupon.id}
                className="cursor-pointer transition-all hover:shadow-md"
                onClick={() => setSelectedCoupon(coupon)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{coupon.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{coupon.partnerName}</p>
                    </div>
                    <div className="flex gap-2">
                      {isExpiringSoon(coupon.expiresAt) && (
                        <Badge variant="destructive" className="whitespace-nowrap">
                          Última Chance
                        </Badge>
                      )}
                      {isLowStock(coupon.remainingQuantity) && (
                        <Badge variant="secondary" className="whitespace-nowrap">
                          Popular
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                      {coupon.photo_url ? (
                        <img
                          src={coupon.photo_url}
                          alt={`Foto do cupom ${coupon.name}`}
                          className="w-14 h-14 rounded-lg object-cover border border-gray-200"
                          onError={e => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">📷</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <span className="text-2xl font-bold text-green-600">{coupon.value}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Válido até {coupon.expiresAt.toLocaleDateString()}</span>
                      <Badge variant="outline">Restam {coupon.remainingQuantity}</Badge>
                    </div>
                    <Button className="w-full mt-4">
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              Nenhum cupom disponível no momento.
            </div>
          )}
        </div>

        {selectedCoupon && (
          <CouponDetailsModal
            isOpen={!!selectedCoupon}
            onClose={() => setSelectedCoupon(null)}
            coupon={selectedCoupon}
            userType={authUser.user_type}
          />
        )}
      </div>
    </Layout>
  );
};

export default SearchCouponsPage; 