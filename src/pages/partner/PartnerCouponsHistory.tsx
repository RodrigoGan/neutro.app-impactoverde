import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCoupons } from '@/hooks/useCoupons';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Filter, Gift, TrendingUp, Users, DollarSign, ChevronUp, ChevronDown } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { addMonths, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter } from 'date-fns';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

// Importar o tipo CouponUsage do hook
type CouponUsage = {
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
  observacao?: string;
};

// Mock de dados (agora com status variados)
const mockCoupons = [
  { user: 'João Pedro', value: 10.00, valorTotalCompra: 80.00, date: new Date(new Date().setHours(10, 20, 0, 0)), type: 'validado' as 'validado', status: 'usado' },
  { user: 'Fernanda Alves', value: 12.00, valorTotalCompra: 95.00, date: new Date(new Date(Date.now() - 24*60*60*1000).setHours(17, 0, 0, 0)), type: 'distribuído' as 'distribuído', status: 'ativo' },
  { user: 'Lucas Silva', value: 8.00, valorTotalCompra: 60.00, date: new Date(new Date(Date.now() - 24*60*60*1000).setHours(15, 30, 0, 0)), type: 'distribuído' as 'distribuído', status: 'expirado', motivo: 'Cupom expirado pelo sistema' },
  { user: 'Ana Paula', value: 15.00, valorTotalCompra: 120.00, date: new Date(new Date(Date.now() - 2*24*60*60*1000).setHours(14, 0, 0, 0)), type: 'distribuído' as 'distribuído', status: 'inativo', motivo: 'Promoção pausada pelo parceiro' },
  { user: 'Carlos Lima', value: 20.00, valorTotalCompra: 150.00, date: new Date(new Date(Date.now() - 3*24*60*60*1000).setHours(11, 0, 0, 0)), type: 'distribuído' as 'distribuído', status: 'excluído', motivo: 'Cupom removido por descumprimento de regras' },
  { user: 'Marina Souza', value: 18.00, valorTotalCompra: 110.00, date: new Date(new Date(Date.now() - 4*24*60*60*1000).setHours(16, 0, 0, 0)), type: 'distribuído' as 'distribuído', status: 'cancelado' },
  { user: 'Pedro Henrique', value: 9.00, valorTotalCompra: 70.00, date: new Date(new Date(Date.now() - 5*24*60*60*1000).setHours(10, 0, 0, 0)), type: 'distribuído' as 'distribuído', status: 'pendente' },
];

const statusOptions = [
  { value: 'todos', label: 'Todos' },
  { value: 'usado', label: 'Usado' },
  { value: 'expirado', label: 'Expirado' },
  { value: 'inativo', label: 'Inativo' },
  { value: 'excluído', label: 'Excluído' },
  { value: 'distribuído', label: 'Distribuído' },
  { value: 'validado', label: 'Validado' },
  { value: 'cancelado', label: 'Cancelado' },
  { value: 'pendente', label: 'Pendente' },
];

const statusBg = {
  'ativo': 'bg-green-50',
  'usado': 'bg-blue-50',
  'expirado': 'bg-red-50',
  'inativo': 'bg-gray-100',
  'excluído': 'bg-red-100',
  'distribuído': 'bg-yellow-50',
  'validado': 'bg-green-100',
  'cancelado': 'bg-orange-50',
  'pendente': 'bg-neutral-100',
};

const PartnerCouponsHistory: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser } = useAuth();

  // Obter partnerId do navigation state ou do usuário autenticado
  const partnerId = location.state?.userId || authUser?.id;

  const [startDate, setStartDate] = React.useState<Date | undefined>();
  const [endDate, setEndDate] = React.useState<Date | undefined>();
  const [filteredCoupons, setFilteredCoupons] = React.useState<CouponUsage[]>([]);
  const [period, setPeriod] = React.useState<'mes' | 'trimestre' | 'personalizado'>('mes');
  const [couponType, setCouponType] = React.useState<'todos' | 'distribuído' | 'validado'>('todos');
  const [couponStatus, setCouponStatus] = React.useState('todos');
  const [openId, setOpenId] = React.useState<number | null>(null);
  // Usar dados reais
  const { couponsData, loading, error } = useCoupons(partnerId);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Atualizar dados quando carregarem
  useEffect(() => {
    if (couponsData) {
      // Filtrar para mostrar apenas cupons não ativos
      setFilteredCoupons(couponsData.coupons.filter(c => c.status && c.status.toLowerCase() !== 'ativo'));
    } else {
      setFilteredCoupons([]);
    }
  }, [couponsData]);

  // Cálculos de resumo
  const totalValidados = filteredCoupons.filter(c => c.type === 'validado').length;
  const totalDistribuidos = filteredCoupons.length;
  const investimento = filteredCoupons.filter(c => c.type === 'validado').reduce((acc, c) => acc + (c.value || 0), 0);
  const faturamento = filteredCoupons.filter(c => c.type === 'validado').reduce((acc, c) => acc + (c.valorTotalCompra || 0), 0);
  const ticketMedio = totalValidados > 0 ? faturamento / totalValidados : 0;
  const roi = investimento > 0 ? faturamento / investimento : 0;

  // Atualizar datas ao trocar período
  React.useEffect(() => {
    if (period === 'mes') {
      setStartDate(startOfMonth(new Date()));
      setEndDate(endOfMonth(new Date()));
    } else if (period === 'trimestre') {
      setStartDate(startOfQuarter(new Date()));
      setEndDate(endOfQuarter(new Date()));
    }
    // personalizado: não altera datas
  }, [period]);

  const handleFilter = () => {
    let filtered = filteredCoupons;
    if (startDate || endDate) {
      filtered = filtered.filter((c) => {
        const couponDate = c.date;
        if (startDate && couponDate < startDate) return false;
        if (endDate && couponDate > endDate) return false;
        return true;
      });
    }
    if (couponType !== 'todos') {
      filtered = filtered.filter((c) => c.type === couponType);
    }
    if (couponStatus !== 'todos') {
      filtered = filtered.filter((c) => c.status === couponStatus);
    }
    setFilteredCoupons(filtered);
  };

  // Funções auxiliares para garantir o tipo correto nos filtros
  const handlePeriodChange = (v: string) => {
    if (v === 'mes' || v === 'trimestre' || v === 'personalizado') setPeriod(v as 'mes' | 'trimestre' | 'personalizado');
  };
  const handleCouponTypeChange = (v: string) => {
    if (v === 'todos' || v === 'distribuído' || v === 'validado') setCouponType(v as 'todos' | 'distribuído' | 'validado');
  };

  if (!partnerId) {
    return <div className="container mx-auto px-4 py-8 max-w-4xl text-center">Não foi possível identificar o parceiro. Faça login novamente.</div>;
  }
  if (loading) {
    return <div className="container mx-auto px-4 py-8 max-w-4xl text-center">Carregando histórico de cupons...</div>;
  }
  if (error) {
    return <div className="container mx-auto px-4 py-8 max-w-4xl text-center text-red-600">Erro ao carregar cupons: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Botão voltar */}
      <Button variant="ghost" className="flex items-center gap-2 mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Button>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Gift className="h-6 w-6 text-blue-700" /> Histórico de Cupons
      </h1>
      {/* Indicador de período dos dados */}
      <div className="mb-2 text-xs text-muted-foreground font-medium">
        {period === 'mes' && "Dados referentes ao mês atual"}
        {period === 'trimestre' && "Dados referentes ao trimestre"}
        {period === 'personalizado' && startDate && endDate && (
          <>Dados do período: {format(startDate, "dd/MM/yyyy")} a {format(endDate, "dd/MM/yyyy")}</>
        )}
      </div>
      {/* Cards de resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="py-4 flex flex-col items-center">
            <Badge className="mb-2 bg-blue-100 text-blue-700"><Gift className="h-4 w-4 mr-1" /> Distribuídos</Badge>
            <span className="text-xl font-bold">{filteredCoupons.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 flex flex-col items-center">
            <Badge className="mb-2 bg-green-100 text-green-700"><TrendingUp className="h-4 w-4 mr-1" /> Validados</Badge>
            <span className="text-xl font-bold">{filteredCoupons.filter(c => c.type === 'validado').length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 flex flex-col items-center">
            <Badge className="mb-2 bg-yellow-100 text-yellow-700"><DollarSign className="h-4 w-4 mr-1" /> Investido</Badge>
            <span className="text-xl font-bold">R$ {filteredCoupons.filter(c => c.type === 'validado').reduce((acc, c) => acc + (c.value || 0), 0).toFixed(2)}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 flex flex-col items-center">
            <Badge className="mb-2 bg-green-200 text-green-800"><DollarSign className="h-4 w-4 mr-1" /> Faturamento</Badge>
            <span className="text-xl font-bold">R$ {filteredCoupons.filter(c => c.type === 'validado').reduce((acc, c) => acc + (c.valorTotalCompra || 0), 0).toFixed(2)}</span>
          </CardContent>
        </Card>
      </div>
      {/* Filtros rápidos */}
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-end sm:gap-4">
        <Select value={period} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mes">Mês atual</SelectItem>
            <SelectItem value="trimestre">Trimestre</SelectItem>
            <SelectItem value="personalizado">Personalizado</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex flex-col w-full sm:w-40">
          <span className="text-xs text-muted-foreground pl-1 mb-0.5">Tipo:</span>
          <Select value={couponType} onValueChange={handleCouponTypeChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tipo de cupom" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="distribuído">Distribuído</SelectItem>
              <SelectItem value="validado">Validado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col w-full sm:w-40">
          <span className="text-xs text-muted-foreground pl-1 mb-0.5">Status:</span>
          <Select value={couponStatus} onValueChange={v => setCouponStatus(v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Filtro de datas mobile first - só aparece se período for personalizado */}
      {period === 'personalizado' && (
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-end sm:gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-40 justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "dd/MM/yyyy") : "Data inicial"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-40 justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "dd/MM/yyyy") : "Data final"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            className="w-full sm:w-auto flex items-center gap-2"
            onClick={handleFilter}
          >
            <Filter className="h-4 w-4" /> Filtrar
          </Button>
        </div>
      )}
      {/* Cards de cupons (substitui tabela) */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Cupons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredCoupons.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground border rounded-lg bg-white">Nenhum cupom alterado até o momento.</div>
            ) : (
              filteredCoupons.map((c, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg border border-gray-200 ${statusBg[c.status] || ''} transition-shadow shadow-sm`}
                >
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 focus:outline-none"
                    onClick={() => setOpenId(openId === idx ? null : idx)}
                    aria-expanded={openId === idx}
                  >
                    <div className="flex items-center gap-3">
                      {/* Foto do cupom (se disponível) */}
                      <div className="flex-shrink-0">
                        {c.photo_url ? (
                          <img
                            src={c.photo_url}
                            alt={`Foto do cupom`}
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
                        <span className="font-medium text-base">{c.user} - {c.type === 'validado' ? 'Validado' : 'Distribuído'}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-semibold text-green-600">
                            {c.value ? `R$ ${c.value.toFixed(2)}` : '-'}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
                            ${c.status === 'ativo' ? 'bg-green-100 text-green-700' : ''}
                            ${c.status === 'usado' ? 'bg-blue-100 text-blue-700' : ''}
                            ${c.status === 'expirado' ? 'bg-red-100 text-red-700' : ''}
                            ${c.status === 'inativo' ? 'bg-gray-200 text-gray-700' : ''}
                            ${c.status === 'excluído' ? 'bg-gray-300 text-gray-800' : ''}
                            ${c.status === 'distribuído' ? 'bg-yellow-100 text-yellow-700' : ''}
                            ${c.status === 'validado' ? 'bg-green-200 text-green-800' : ''}
                            ${c.status === 'cancelado' ? 'bg-orange-100 text-orange-700' : ''}
                            ${c.status === 'pendente' ? 'bg-neutral-100 text-neutral-700' : ''}
                          `}>{statusOptions.find(opt => opt.value === c.status)?.label || c.status}</span>
                        </div>
                      </div>
                    </div>
                    {openId === idx ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {openId === idx && (
                    <div className="px-4 pb-3 text-sm animate-fade-in">
                      {/* Foto do cupom em tamanho maior */}
                      <div className="mb-3 flex justify-center">
                        {c.photo_url ? (
                          <img
                            src={c.photo_url}
                            alt={`Foto do cupom`}
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
                        <div><span className="font-semibold">Usuário:</span> {c.user}</div>
                        <div><span className="font-semibold">Tipo:</span> {c.type === 'validado' ? 'Validado' : 'Distribuído'}</div>
                        <div><span className="font-semibold">Valor do Desconto:</span> {c.value ? `R$ ${c.value.toFixed(2)}` : '-'}</div>
                        <div><span className="font-semibold">Data:</span> {c.date ? format(c.date, 'dd/MM/yyyy HH:mm') : '-'}</div>
                        {c.couponName && <div><span className="font-semibold">Nome do Cupom:</span> {c.couponName}</div>}
                        {c.code && <div><span className="font-semibold">Código:</span> {c.code}</div>}
                        {c.discountType && <div><span className="font-semibold">Tipo de Desconto:</span> {c.discountType}</div>}
                        {c.category && <div><span className="font-semibold">Categoria:</span> {c.category}</div>}
                        {c.validUntil && <div><span className="font-semibold">Validade:</span> {c.validUntil}</div>}
                        {(c.type === 'validado' && c.status === 'usado') && (
                          <div><span className="font-semibold">Valor da Compra:</span> {c.valorTotalCompra ? `R$ ${c.valorTotalCompra.toFixed(2)}` : '-'}</div>
                        )}
                        {(c.status === 'inativo' || c.status === 'excluído') && c.motivo && (
                          <div className="sm:col-span-2"><span className="font-semibold">Motivo:</span> {c.motivo}</div>
                        )}
                      </div>
                      
                      {/* Descrição */}
                      {c.description && (
                        <div className="mb-3">
                          <span className="font-semibold">Descrição:</span>
                          <p className="text-sm text-gray-600 mt-1">{c.description}</p>
                        </div>
                      )}
                      
                      {/* Regras */}
                      {c.rules && (
                        <div className="mb-3">
                          <span className="font-semibold">Regras:</span>
                          <p className="text-sm text-gray-600 mt-1">
                            {Array.isArray(c.rules) ? c.rules.join('; ') : c.rules}
                          </p>
                        </div>
                      )}
                      
                      {/* Política de Cancelamento */}
                      {c.cancellationPolicy && (
                        <div className="mb-3">
                          <span className="font-semibold">Política de Cancelamento:</span>
                          <p className="text-sm text-gray-600 mt-1">{c.cancellationPolicy}</p>
                        </div>
                      )}
                      
                      {/* SAC */}
                      {c.customerService && (
                        <div className="mb-3">
                          <span className="font-semibold">SAC:</span>
                          <p className="text-sm text-gray-600 mt-1">{c.customerService}</p>
                        </div>
                      )}
                      
                      {/* Código do Cupom (para referência) */}
                      {c.code && (
                        <div className="mb-3">
                          <span className="font-semibold">Código do Cupom:</span>
                          <p className="text-sm text-gray-600 mt-1 font-mono bg-gray-100 p-2 rounded">{c.code}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnerCouponsHistory; 