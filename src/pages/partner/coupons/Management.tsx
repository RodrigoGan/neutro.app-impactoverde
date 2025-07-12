import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, ArrowLeft, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { QRCodeCanvas } from 'qrcode.react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

const statusOptions = [
  { value: 'todos', label: 'Todos' },
  { value: 'Ativo', label: 'Ativo' },
  { value: 'Distribuído', label: 'Distribuído' },
  { value: 'Pendente', label: 'Pendente' },
];

const couponTypeOptions = [
  { value: 'todos', label: 'Todos' },
  { value: 'Percentual', label: 'Percentual' },
  { value: 'Valor Fixo', label: 'Valor Fixo' },
];

const statusBg = {
  'Ativo': 'bg-green-50',
  'Inativo': 'bg-gray-100',
  'Expirado': 'bg-red-50',
};

const statusChangeOptions = [
  { value: 'Ativo', label: 'Ativo' },
  { value: 'Inativo', label: 'Inativo' },
  { value: 'Expirado', label: 'Expirado' },
  { value: 'Excluído', label: 'Excluído' },
];

const CouponsManagement: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const partnerType = searchParams.get('type') || 'restaurant';
  const userId = location.state?.userId || searchParams.get('userId') || authUser?.id;

  const [status, setStatus] = React.useState('todos');
  const [search, setSearch] = React.useState('');
  const [couponType, setCouponType] = React.useState('todos');
  const [startDate, setStartDate] = React.useState<Date | undefined>();
  const [endDate, setEndDate] = React.useState<Date | undefined>();
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [statusModal, setStatusModal] = React.useState<{id: string, status: string, motivo: string} | null>(null);
  const [deleteModal, setDeleteModal] = React.useState<{id: string, name: string, motivo: string} | null>(null);
  const [cupons, setCupons] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  // Função para buscar cupons do banco de dados
  const fetchCouponsFromDB = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const { data: coupons, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('partner_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mapear dados do banco para o formato esperado
      const mappedCoupons = (coupons || []).map(c => ({
        id: c.id,
        name: c.title,
        value: c.discount_value,
        discountType: c.discount_type,
        expiresAt: c.valid_until,
        status: c.status || 'Ativo',
        motivo: c.reason || '',
        quantity: c.usage_limit,
        rules: c.rules || [],
        description: c.description || '',
        cancellationPolicy: c.cancellation_policy || '',
        customerService: c.customer_service || '',
        photo_url: c.photo_url || '',
        couponCode: c.coupon_code || c.id,
        restaurantType: c.restaurant_type,
        customRestaurantType: c.custom_restaurant_type,
        storeCategories: c.store_categories,
        educationalType: c.educational_type,
        created_at: c.created_at,
        updated_at: c.updated_at
      }));

      setCupons(mappedCoupons);
    } catch (error) {
      console.error('Erro ao buscar cupons:', error);
      toast({
        title: 'Erro ao carregar cupons',
        description: 'Não foi possível carregar os cupons. Tente novamente.',
        variant: 'destructive',
      });
      setCupons([]);
    } finally {
      setLoading(false);
    }
  };

  // Adaptação para compatibilidade com o mock novo
  const getStatus = (c) => c.status || 'Ativo';
  const getType = (c) => c.discountType === 'percentage' ? 'Percentual' : 'Valor Fixo';
  const getValidity = (c) => c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('pt-BR') : '';
  const getMotivo = (c) => c.motivo || '';
  const getQuantidade = (c) => c.quantity ? `${c.quantity}` : '';
  const getRegras = (c) => c.rules ? c.rules.join(', ') : '';
  const getValue = (c) => c.value ? `${c.value}${c.discountType === 'percentage' ? '% OFF' : ' OFF'}` : '';
  const getDescription = (c) => c.description || '';
  const getCancellationPolicy = (c) => c.cancellationPolicy || '';
  const getCustomerService = (c) => c.customerService || '';
  const getPartnerType = (c) => {
    if (c.restaurantType) {
      const restaurantTypes = {
        'buffet': 'Buffet',
        'marmitex': 'Marmitex',
        'ala_carte': 'À la carte',
        'delivery': 'Delivery',
        'outros': c.customRestaurantType || 'Outros'
      };
      return restaurantTypes[c.restaurantType] || c.restaurantType;
    }
    if (c.storeCategories && c.storeCategories.length > 0) {
      const storeCategories = {
        'sustentavel': 'Produtos Sustentáveis',
        'reciclado': 'Material Reciclado',
        'organico': 'Produtos Orgânicos'
      };
      return c.storeCategories.map(cat => storeCategories[cat] || cat).join(', ');
    }
    if (c.educationalType) {
      const educationalTypes = {
        'curso_online': 'Curso Online',
        'workshop': 'Workshop',
        'consultoria': 'Consultoria'
      };
      return educationalTypes[c.educationalType] || c.educationalType;
    }
    return '';
  };

  const getCouponCode = (c) => c.couponCode || c.id || '';

  const filteredCoupons = cupons.filter(c => {
    const status = getStatus(c);
    const allowed = ['Ativo', 'Distribuído', 'Pendente'];
    return allowed.includes(status) &&
      (status === 'todos' || status === status) &&
      (couponType === 'todos' || getType(c) === couponType) &&
      (search === '' || c.name?.toLowerCase().includes(search.toLowerCase())) &&
      (!startDate || new Date(c.expiresAt) >= startDate) &&
      (!endDate || new Date(c.expiresAt) <= endDate);
  });

  // Funções utilitárias para métricas
  const totalAtivos = cupons.filter(c => getStatus(c) === 'Ativo').length;
  const totalInativos = cupons.filter(c => getStatus(c) === 'Inativo').length;
  const totalExpirados = cupons.filter(c => getStatus(c) === 'Expirado').length;
  const investimento = 1200.00; // mock
  const faturamento = 3500.00; // mock

  // Função para atualizar status no banco de dados
  const handleStatusChange = async () => {
    if (!statusModal) return;
    
    if (['Inativo', 'Expirado', 'Excluído'].includes(statusModal.status) && !statusModal.motivo) {
      toast({
        title: 'Motivo obrigatório',
        description: 'Informe o motivo para alterar o status do cupom.',
        variant: 'destructive',
      });
      return;
    }

    setActionLoading('status');
    try {
      const { error } = await supabase
        .from('coupons')
        .update({
          status: statusModal.status.toLowerCase(),
          reason: ['Inativo', 'Expirado', 'Excluído'].includes(statusModal.status) ? statusModal.motivo : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', statusModal.id);

      if (error) throw error;

      // Atualizar estado local
      const idx = cupons.findIndex(c => c.id === statusModal.id);
      if (idx !== -1) {
        const updatedCoupons = [...cupons];
        updatedCoupons[idx] = {
          ...updatedCoupons[idx],
          status: statusModal.status,
          motivo: ['Inativo', 'Expirado', 'Excluído'].includes(statusModal.status) ? statusModal.motivo : ''
        };
        setCupons(updatedCoupons);
      }

      toast({
        title: `Cupom ${statusModal.status.toLowerCase()} com sucesso!`,
        description: `O cupom foi ${statusModal.status.toLowerCase()}${statusModal.motivo ? `: ${statusModal.motivo}` : ''}`,
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro ao atualizar status',
        description: 'Não foi possível atualizar o status do cupom. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
      setStatusModal(null);
      setOpenId(null);
    }
  };

  // Função para excluir cupom no banco de dados
  const handleDeleteCoupon = async () => {
    if (!deleteModal) return;
    
    if (!deleteModal.motivo) {
      toast({
        title: 'Motivo obrigatório',
        description: 'Informe o motivo para excluir o cupom.',
        variant: 'destructive',
      });
      return;
    }
    
    setActionLoading('delete');
    try {
      // Exclusão lógica - marcar como excluído
      const { error } = await supabase
        .from('coupons')
        .update({
          status: 'excluído',
          reason: deleteModal.motivo,
          updated_at: new Date().toISOString()
        })
        .eq('id', deleteModal.id);

      if (error) throw error;

      // Atualizar estado local
      const idx = cupons.findIndex(c => c.id === deleteModal.id);
      if (idx !== -1) {
        const updatedCoupons = [...cupons];
        updatedCoupons[idx] = {
          ...updatedCoupons[idx],
          status: 'Excluído',
          motivo: deleteModal.motivo
        };
        setCupons(updatedCoupons);
      }

      toast({
        title: 'Cupom excluído com sucesso!',
        description: 'O cupom foi removido da lista.',
      });
    } catch (error) {
      console.error('Erro ao excluir cupom:', error);
      toast({
        title: 'Erro ao excluir cupom',
        description: 'Não foi possível excluir o cupom. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
      setDeleteModal(null);
      setOpenId(null);
    }
  };

  React.useEffect(() => {
    fetchCouponsFromDB();
  }, [userId]);

  // Adicionar loading state
  if (loading) {
    return <div className="container max-w-3xl mx-auto px-4 py-8 text-center">Carregando cupons...</div>;
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="flex items-center gap-2 mb-6"
        onClick={() => {
          if (userId) {
            navigate('/dashboard/standard', { state: { userId } });
          } else {
            navigate('/dashboard/standard');
          }
        }}
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Button>
      {/* Título e botão Criar Cupom + Botão Ver histórico */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h1 className="text-2xl font-bold">Gestão de Cupons Criados</h1>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <Button
            onClick={() => navigate('/partner/coupons-history')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Ver histórico
          </Button>
          <Button
            onClick={fetchCouponsFromDB}
            variant="outline"
            className="flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        <Button
          onClick={() => navigate(`/partner/coupons/create?type=${partnerType}`, userId ? { state: { userId } } : undefined)}
          variant="default"
            className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Criar Cupom
        </Button>
        </div>
      </div>
      {/* Cards de métricas resumidas - sempre em linha, compactos */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Card className="shadow-none border border-gray-200 p-0">
          <CardContent className="py-2 px-1 flex flex-col items-center justify-center">
            <span className="text-[11px] text-muted-foreground mb-0.5">Ativos</span>
            <span className="text-lg font-bold text-green-700 leading-none">{totalAtivos}</span>
          </CardContent>
        </Card>
        <Card className="shadow-none border border-gray-200 p-0">
          <CardContent className="py-2 px-1 flex flex-col items-center justify-center">
            <span className="text-[11px] text-muted-foreground mb-0.5">Inativos</span>
            <span className="text-lg font-bold text-gray-500 leading-none">{totalInativos}</span>
          </CardContent>
        </Card>
        <Card className="shadow-none border border-gray-200 p-0">
          <CardContent className="py-2 px-1 flex flex-col items-center justify-center">
            <span className="text-[11px] text-muted-foreground mb-0.5">Expirados</span>
            <span className="text-lg font-bold text-red-700 leading-none">{totalExpirados}</span>
          </CardContent>
        </Card>
      </div>
      {/* Filtros avançados */}
      <Card className="mb-6">
        <CardContent className="py-4 flex flex-col sm:flex-row gap-2 sm:items-end">
          <Input
            placeholder="Buscar por nome do cupom..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:w-64"
          />
          <div className="flex flex-col gap-1 w-full sm:w-40">
            <span className="text-xs text-muted-foreground pl-1">Status:</span>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status do cupom" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1 w-full sm:w-40">
            <span className="text-xs text-muted-foreground pl-1">Tipo:</span>
            <Select value={couponType} onValueChange={setCouponType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tipo de cupom" />
              </SelectTrigger>
              <SelectContent>
                {couponTypeOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-40 justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "dd/MM/yyyy") : "Validade inicial"}
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
                {endDate ? format(endDate, "dd/MM/yyyy") : "Validade final"}
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
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Cupons Criados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredCoupons.map(c => (
              <div
                key={c.id}
                className={`rounded-lg border border-gray-200 ${statusBg[getStatus(c)] || ''} transition-shadow shadow-sm`}
              >
                <button
                  className="w-full flex items-center justify-between px-4 py-3 focus:outline-none"
                  onClick={() => setOpenId(openId === c.id ? null : c.id)}
                  aria-expanded={openId === c.id}
                >
                  <div className="flex items-center gap-3">
                    {/* Foto do cupom */}
                    <div className="flex-shrink-0">
                      {c.photo_url ? (
                        <img
                          src={c.photo_url}
                          alt={`Foto do cupom ${c.name}`}
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
                      <span className="font-medium text-base">{c.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-semibold text-green-600">{getValue(c)}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
                          ${getStatus(c) === 'Ativo' ? 'bg-green-100 text-green-700' : ''}
                          ${getStatus(c) === 'Inativo' ? 'bg-gray-200 text-gray-700' : ''}
                          ${getStatus(c) === 'Expirado' ? 'bg-red-100 text-red-700' : ''}
                        `}>{getStatus(c)}</span>
                      </div>
                    </div>
                  </div>
                  {openId === c.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {openId === c.id && (
                  <div className="px-4 pb-3 text-sm animate-fade-in">
                    {/* Foto do cupom em tamanho maior */}
                    <div className="mb-3 flex justify-center">
                      {c.photo_url ? (
                        <img
                          src={c.photo_url}
                          alt={`Foto do cupom ${c.name}`}
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
                      <div><span className="font-semibold">Tipo:</span> {getType(c)}</div>
                      <div><span className="font-semibold">Validade:</span> {getValidity(c)}</div>
                      <div><span className="font-semibold">Valor:</span> {getValue(c)}</div>
                      {getPartnerType(c) && <div><span className="font-semibold">Categoria:</span> {getPartnerType(c)}</div>}
                      {getMotivo(c) && <div className="sm:col-span-2"><span className="font-semibold">Motivo:</span> {getMotivo(c)}</div>}
                    </div>
                    
                    {/* Descrição */}
                    {getDescription(c) && (
                      <div className="mb-3">
                        <span className="font-semibold">Descrição:</span>
                        <p className="text-sm text-gray-600 mt-1">{getDescription(c)}</p>
                      </div>
                    )}
                    
                    {/* Regras */}
                    {getRegras(c) && (
                      <div className="mb-3">
                        <span className="font-semibold">Regras:</span>
                        <p className="text-sm text-gray-600 mt-1">{getRegras(c)}</p>
                      </div>
                    )}
                    
                    {/* Política de Cancelamento */}
                    {getCancellationPolicy(c) && (
                      <div className="mb-3">
                        <span className="font-semibold">Política de Cancelamento:</span>
                        <p className="text-sm text-gray-600 mt-1">{getCancellationPolicy(c)}</p>
                      </div>
                    )}
                    
                    {/* SAC */}
                    {getCustomerService(c) && (
                      <div className="mb-3">
                        <span className="font-semibold">SAC:</span>
                        <p className="text-sm text-gray-600 mt-1">{getCustomerService(c)}</p>
                      </div>
                    )}
                    
                    {/* QR Code */}
                    <div className="mb-3">
                      <span className="font-semibold">QR Code do Cupom:</span>
                      <div className="flex flex-col items-center mt-2">
                        <QRCodeCanvas 
                          value={getCouponCode(c)} 
                          size={120} 
                          level="H" 
                          includeMargin={true}
                          className="border border-gray-200 rounded-lg p-2 bg-white"
                        />
                        <p className="text-xs text-gray-600 mt-2 break-all text-center">
                          Código: {getCouponCode(c)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => navigate(`/partner/coupons/edit?id=${c.id}&type=${partnerType}`, userId ? { state: { userId } } : undefined)}
                        disabled={actionLoading !== null}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => setDeleteModal({ id: c.id, name: c.name, motivo: getMotivo(c) })}
                        disabled={actionLoading !== null}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStatusModal({ id: c.id, status: getStatus(c), motivo: getMotivo(c) })}
                        disabled={actionLoading !== null}
                      >
                        {actionLoading === 'status' ? 'Salvando...' : 'Mudar Status'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {filteredCoupons.length === 0 && (
              <div className="p-4 text-center text-muted-foreground border rounded-lg bg-white">Nenhum cupom encontrado.</div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Modal de mudança de status */}
      <Dialog open={!!statusModal} onOpenChange={v => !v && setStatusModal(null)}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Mudar Status do Cupom</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Status</Label>
            <Select value={statusModal?.status} onValueChange={v => setStatusModal(s => s ? { ...s, status: v } : s)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {statusChangeOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {['Inativo', 'Expirado', 'Excluído'].includes(statusModal?.status || '') && (
              <div>
                <Label>Motivo <span className="text-red-500">*</span></Label>
                <Input
                  value={statusModal?.motivo || ''}
                  onChange={e => setStatusModal(s => s ? { ...s, motivo: e.target.value } : s)}
                  placeholder="Descreva o motivo"
                  required
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={handleStatusChange}
              disabled={['Inativo', 'Expirado', 'Excluído'].includes(statusModal?.status || '') && !statusModal?.motivo || actionLoading === 'status'}
            >
              {actionLoading === 'status' ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button variant="ghost" onClick={() => setStatusModal(null)} disabled={actionLoading === 'status'}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modal de confirmação de exclusão */}
      <Dialog open={!!deleteModal} onOpenChange={(open) => !open && setDeleteModal(null)}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p>Tem certeza que deseja excluir o cupom "{deleteModal?.name}"?</p>
            <div>
              <Label>Motivo da Exclusão <span className="text-red-500">*</span></Label>
              <Input
                value={deleteModal?.motivo || ''}
                onChange={e => setDeleteModal(s => s ? { ...s, motivo: e.target.value } : s)}
                placeholder="Descreva o motivo da exclusão"
                required
              />
            </div>
            <p className="text-sm text-muted-foreground">Esta ação não pode ser desfeita.</p>
          </div>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={handleDeleteCoupon}
              disabled={!deleteModal?.motivo || actionLoading === 'delete'}
            >
              {actionLoading === 'delete' ? 'Excluindo...' : 'Excluir'}
            </Button>
            <Button variant="ghost" onClick={() => setDeleteModal(null)} disabled={actionLoading === 'delete'}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CouponsManagement; 