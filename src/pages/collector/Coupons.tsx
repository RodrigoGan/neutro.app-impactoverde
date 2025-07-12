import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Ticket, Search, Filter, ChevronDown, Clock, CheckCircle2, MapPin, Trophy, ChevronLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  discount: string;
  store: string;
  storeAddress: string;
  businessHours: string;
  validUntil: string;
  status: 'active' | 'expired' | 'used';
  category: string;
  conditions: string[];
}

const mockCoupons: Coupon[] = [
  {
    id: '1',
    code: 'VERDE20',
    title: '20% OFF',
    description: 'Desconto em produtos sustentáveis',
    discount: '20%',
    store: 'Loja Verde',
    storeAddress: 'Rua das Flores, 123 - Centro',
    businessHours: 'Seg a Sex: 9h às 18h, Sáb: 9h às 13h',
    validUntil: '30/04/2024',
    status: 'active',
    category: 'Produtos',
    conditions: ['Válido para compras acima de R$ 100', 'Aplicável em todos os produtos']
  },
  {
    id: '2',
    code: 'ECO15',
    title: 'R$ 15 OFF',
    description: 'Desconto em compras acima de R$ 100',
    discount: 'R$ 15',
    store: 'EcoStore',
    storeAddress: 'Av. Principal, 456 - Jardins',
    businessHours: 'Seg a Sáb: 10h às 22h',
    validUntil: '15/05/2024',
    status: 'active',
    category: 'Produtos',
    conditions: ['Válido para compras acima de R$ 100', 'Não cumulativo']
  }
];

const Coupons: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [expandedCoupon, setExpandedCoupon] = useState<string | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);

  const categories = ['all', 'Produtos', 'Alimentos', 'Serviços'];
  const statuses = ['all', 'active', 'expired', 'used'];

  const filteredCoupons = mockCoupons.filter(coupon => {
    const matchesSearch = coupon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         coupon.store.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || coupon.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || coupon.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleShowCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setShowQRCode(true);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Meus Cupons</h1>
            <p className="text-muted-foreground">Gerencie e utilize seus cupons de desconto</p>
          </div>
        </div>

        {/* Status dos Cupons - Design Melhorado */}
        <Card className="mb-8 border-2 border-neutro/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-neutro/10 rounded-lg">
                  <Trophy className="h-6 w-6 text-neutro" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold">Nível Prata</h3>
                    <Badge variant="secondary" className="bg-neutro/10 text-neutro">
                      3/5 disponíveis
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Você pode pegar até 5 cupons por mês
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground">
                  Próximo nível:
                </div>
                <Badge variant="outline" className="bg-neutro/5">
                  Nível Ouro - 8 cupons/mês
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filtros */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-neutro" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Categoria</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category === 'all' ? 'Todas' : category}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Status</label>
                <div className="flex flex-wrap gap-2">
                  {statuses.map(status => (
                    <Button
                      key={status}
                      variant={selectedStatus === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedStatus(status)}
                    >
                      {status === 'all' ? 'Todos' : status === 'active' ? 'Ativos' : status === 'expired' ? 'Expirados' : 'Usados'}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Barra de Pesquisa */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cupons..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Lista de Cupons */}
        <div className="space-y-4">
          {filteredCoupons.map(coupon => (
            <Card key={coupon.id} className={cn(
              "transition-all duration-200",
              "hover:shadow-lg hover:border-neutro",
              expandedCoupon === coupon.id && "border-neutro"
            )}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4">
                  {/* Cabeçalho do Cupom */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-neutro/10 rounded-lg">
                        <Ticket className="h-6 w-6 text-neutro" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{coupon.title}</h3>
                          <Badge variant={coupon.status === 'active' ? 'default' : 'secondary'}>
                            {coupon.status === 'active' ? 'Ativo' : coupon.status === 'expired' ? 'Expirado' : 'Usado'}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{coupon.store}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setExpandedCoupon(expandedCoupon === coupon.id ? null : coupon.id)}
                    >
                      <ChevronDown className={cn(
                        "h-4 w-4",
                        expandedCoupon === coupon.id && "transform rotate-180"
                      )} />
                    </Button>
                  </div>

                  {/* Detalhes Expandidos */}
                  {expandedCoupon === coupon.id && (
                    <div className="space-y-4">
                      <Separator />
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                            <div>
                              <p className="font-medium">{coupon.store}</p>
                              <p className="text-sm text-muted-foreground">{coupon.storeAddress}</p>
                              <p className="text-sm text-muted-foreground">{coupon.businessHours}</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>Válido até {coupon.validUntil}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Condições</p>
                          <ul className="space-y-1">
                            {coupon.conditions.map((condition, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-neutro" />
                                <span className="text-sm">{condition}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex justify-end">
                          <Button onClick={() => handleShowCoupon(coupon)}>
                            <Ticket className="h-4 w-4 mr-2" />
                            Mostrar Cupom
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal do QR Code */}
        <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cupom {selectedCoupon?.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 p-4">
              <div className="flex justify-center">
                {/* Aqui você pode adicionar um componente de QR Code real */}
                <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  QR Code
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold">{selectedCoupon?.code}</p>
                <p className="text-sm text-muted-foreground">
                  Válido até {selectedCoupon?.validUntil}
                </p>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="font-medium">{selectedCoupon?.store}</p>
                <p className="text-sm text-muted-foreground">{selectedCoupon?.storeAddress}</p>
                <p className="text-sm text-muted-foreground">{selectedCoupon?.businessHours}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Coupons; 