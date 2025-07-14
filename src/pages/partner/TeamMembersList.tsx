import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Users, UserPlus, Filter, Search, Edit, Trash2, Eye, ArrowLeft, Utensils, ShoppingBag, GraduationCap, ChevronUp, ChevronDown } from 'lucide-react';
import { standardEntities } from '@/mocks/StandardMockData';
import { restaurantPartnerTeamMock, storePartnerTeamMock, educationalPartnerTeamMock, cooperativeTeamMock, collectorCompanyTeamMock } from '@/components/dashboard/standard/mockData/teamManagementMock';
import { Switch } from '@/components/ui/switch';
import { updateEmployee } from '@/hooks/useTeamManagement';
import { toast } from 'sonner';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { supabase } from '@/lib/supabaseClient';
import AppFooter from '@/components/AppFooter';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveSchedules } from '@/hooks/useActiveSchedules';

// Tipos
type PartnerType = 'restaurant' | 'store' | 'educational' | 'cooperative' | 'collector_company';

const TEAM_MOCKS: Record<PartnerType, any[]> = {
  restaurant: restaurantPartnerTeamMock,
  store: storePartnerTeamMock,
  educational: educationalPartnerTeamMock,
  cooperative: cooperativeTeamMock,
  collector_company: collectorCompanyTeamMock,
};

const ENTITY_LABELS: Record<PartnerType, { label: string; icon?: React.ComponentType<{ className?: string }> }> = {
  restaurant: { label: 'Restaurante', icon: Utensils },
  store: { label: 'Loja', icon: ShoppingBag },
  educational: { label: 'Instituição Educacional', icon: GraduationCap },
  cooperative: { label: 'Cooperativa' },
  collector_company: { label: 'Empresa Coletora' },
};

const STATUS_OPTIONS = [
  { value: 'Ativo', label: 'Ativo' },
  { value: 'Inativo', label: 'Inativo' },
  { value: 'Excluído', label: 'Excluído' },
];
const INACTIVE_REASONS = [
  'Afastado por férias',
  'Licença médica',
  'Licença maternidade',
  'Afastado para estudos',
  'Outro',
];
const EXCLUDE_REASONS = [
  'Desligamento voluntário',
  'Desligamento por justa causa',
  'Falecimento',
  'Término de contrato',
  'Outro',
];

const statusBadge = {
  'Pendente': 'bg-yellow-100 text-yellow-700',
};

const TeamMembersList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { user: authUser } = useAuth();

  // Prioriza dados do usuário autenticado, location.state, teamData, e só usa mock como fallback
  const entityId = authUser?.entity?.id || location.state?.entityId || undefined;
  const type: PartnerType = authUser?.entity?.type || (searchParams.get('type') as PartnerType) || 'store';
  const entityName = useMemo(() => {
    if (type === 'restaurant') return 'Restaurante Sabor Verde';
    if (type === 'store') return 'Loja EcoMais';
    if (type === 'educational') return 'Colégio Sustentável';
    if (type === 'cooperative') return 'Cooperativa Verde';
    if (type === 'collector_company') return 'Empresa Coletora Vida';
    return '';
  }, [type]);

  // Hook para buscar dados reais da equipe da empresa (coletora, parceira, etc)
  const { teamData, loading, error } = useTeamManagement(entityId, type);

  // Usar dados reais para todos os tipos
  const team = teamData ? teamData.members : [];
  const [selected, setSelected] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [editMember, setEditMember] = useState<any | null>(null);
  const [editStatus, setEditStatus] = useState('Ativo');
  const [editReason, setEditReason] = useState('');
  const [editCustomReason, setEditCustomReason] = useState('');
  const [teamState, setTeamState] = useState(team);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editPermissions, setEditPermissions] = useState<any>({});
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [cuponsServidos, setCuponsServidos] = useState(0);

  // Estatísticas
  const totalMembers = team.length;
  const avgAdmission = useMemo(() => {
    const dates = team.map(m => m.admission && !isNaN(Date.parse(m.admission)) ? new Date(m.admission) : null).filter(Boolean) as Date[];
    if (!dates.length) return '-';
    const now = new Date();
    const avgMs = dates.reduce((acc, d) => acc + (now.getTime() - d.getTime()), 0) / dates.length;
    const avgYears = avgMs / (1000 * 60 * 60 * 24 * 365.25);
    return avgYears > 1 ? `${avgYears.toFixed(1)} anos` : `${(avgYears*12).toFixed(0)} meses`;
  }, [team]);

  // Função para extrair valor numérico do highlight
  function extractNumber(str: string) {
    if (!str) return 0;
    const match = str.match(/\d+[\.,]?\d*/);
    return match ? parseFloat(match[0].replace(',', '.')) : 0;
  }

  // Função para definir o motivo do destaque
  function getHighlightReason(type: PartnerType, member: any) {
    if (!member || !member.highlight) return '';
    if (type === 'cooperative') return 'coletou mais kg no mês';
    if (type === 'collector_company') return member.highlight.includes('rotas') ? 'realizou mais rotas' : 'maior tempo de empresa';
    if (type === 'restaurant') return member.highlight.includes('cupons') ? 'serviu mais cupons' : 'maior destaque do mês';
    if (type === 'store') return member.highlight.includes('cupons') ? 'validou mais cupons' : 'maior destaque do mês';
    if (type === 'educational') return member.highlight.includes('aulas') ? 'realizou mais aulas verdes' : 'maior destaque do mês';
    return 'maior destaque do mês';
  }

  // Encontrar o destaque do mês
  const highlightMember = useMemo(() => {
    // Filtrar apenas funcionários ativos
    const activeTeam = team.filter(member => member.status === 'Ativo');
    if (!activeTeam.length) return null;
    let max = -Infinity;
    let best = null;
    for (const m of activeTeam) {
      // Considerar apenas cupons validados no destaque
      const val = m.highlight && m.highlight.toLowerCase().includes('cupon') ? extractNumber(m.highlight) : 0;
      if (val > max) {
        max = val;
        best = m;
      }
    }
    return best;
  }, [team]);

  // Busca e filtro
  const filteredTeam = useMemo(() => {
    return teamState.filter(member => {
      const matchesSearch = [member.name, member.role, member.email].some(field => field?.toLowerCase().includes(search.toLowerCase()));
      const matchesRole = filterRole ? member.role === filterRole : true;
      const matchesStatus = filterStatus ? member.status === filterStatus : true;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [teamState, search, filterRole, filterStatus]);

  // Funções únicas para filtro
  const uniqueRoles = Array.from(new Set(team.map(m => m.role).filter(Boolean)));

  // Mensagem de vazio contextualizada
  const emptyMsg = search || filterRole
    ? 'Nenhum membro encontrado com os filtros atuais.'
    : (
        type === 'collector_company' ? 'Nenhum funcionário cadastrado ainda para esta empresa coletora.' :
        type === 'restaurant' ? 'Nenhum funcionário cadastrado ainda para este restaurante.' :
        type === 'store' ? 'Nenhum funcionário cadastrado ainda para esta loja.' :
        type === 'educational' ? 'Nenhum funcionário cadastrado ainda para esta instituição educacional.' :
        type === 'cooperative' ? 'Nenhum funcionário cadastrado ainda para esta cooperativa.' :
        'Nenhum funcionário cadastrado ainda para este parceiro.'
      );

  // Rota de cadastro
  const getRegisterRoute = () => {
    if (type === 'cooperative') return '/cooperativa/equipe/novo';
    if (type === 'collector_company') return '/empresa/equipe/novo';
    return `/parceiro/equipe/novo?type=${type}`;
  };

  // Indicadores mockados por tipo
  const stats = type === 'restaurant' ? [
    { label: 'Funcionários', value: totalMembers.toString() },
    { label: 'Cupons Servidos', value: cuponsServidos.toString() },
  ] : type === 'store' ? [
    { label: 'Funcionários', value: totalMembers.toString() },
    { label: 'Cupons Validados', value: cuponsServidos.toString() },
  ] : [
    { label: 'Funcionários', value: totalMembers.toString() },
    { label: 'Aulas Verdes', value: '30' },
    { label: 'Projetos', value: '5' },
  ];

  const entity = ENTITY_LABELS[type];
  const Icon = entity.icon;

  // Substituir ALL_PERMISSIONS por CARD_PERMISSIONS igual ao cadastro
  const CARD_PERMISSIONS = [
    { key: 'cupons', label: 'Cupons' },
    { key: 'metas', label: 'Metas e Progresso' },
    { key: 'impacto', label: 'Impacto Ambiental' },
    { key: 'financeiro', label: 'Gestão Financeira' },
    { key: 'notificacoes', label: 'Notificações' },
    { key: 'equipe', label: 'Gestão de Equipe' }
  ];

  React.useEffect(() => {
    if (editMember) {
      setEditName(editMember.name || '');
      setEditRole(editMember.role || '');
      setEditEmail(editMember.email || '');
      setEditPhone(editMember.phone || '');
      setEditAvatarUrl(editMember.avatarUrl || '');
      setEditPermissions(editMember.permissions || {});
    }
  }, [editMember]);

  React.useEffect(() => {
    setTeamState(team);
  }, [team]);

  // Buscar cupons servidos reais
  useEffect(() => {
    async function fetchCuponsServidos() {
      if (!entityId) {
        setCuponsServidos(0);
        return;
      }
      const { data, error } = await supabase
        .from('coupon_usage')
        .select('id, coupon:coupons(partner_id)')
        .eq('coupon.coupons.partner_id', entityId);
      if (error) {
        setCuponsServidos(0);
      } else {
        setCuponsServidos(data ? data.length : 0);
      }
    }
    fetchCuponsServidos();
  }, [entityId]);

  return (
    <>
      <div className="container pb-12"> {/* Adiciona padding inferior */}
        {/* Cabeçalho */}
        <div className="flex items-center gap-2 mb-4 mt-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="p-2"><ArrowLeft className="h-5 w-5" /></Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">{Icon && <Icon className="h-5 w-5 mr-1 text-neutro" />} Gestão de Funcionários do {entity.label}</h1>
        </div>
        {/* Nome da entidade (sem badge, sem ícone) */}
        <div className="mb-4">
          <span className="font-semibold text-lg">{entityName}</span>
        </div>
        {/* Botão Novo Funcionário acima das estatísticas */}
        <div className="flex justify-end mb-2">
          <Button variant="default" className="flex items-center gap-2 px-3 py-1 text-sm" onClick={() => {
            if (type === 'cooperative') {
              navigate('/cooperativa/equipe/novo');
            } else if (type === 'collector_company') {
              navigate('/empresa/equipe/novo');
            } else {
              navigate(getRegisterRoute());
            }
          }}>
            <UserPlus className="h-4 w-4" />
            Novo {type === 'cooperative' ? 'Cooperado' : 'Funcionário'}
          </Button>
        </div>
        {/* Estatísticas */}
        <div className="flex flex-wrap gap-4 mb-4 items-center">
          <div className="text-sm text-muted-foreground">Total: <b>{totalMembers}</b></div>
          {highlightMember && (
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <b>{type === 'cooperative' ? 'Cooperado' : 'Funcionário'} destaque do mês:</b>
              <span className="font-semibold">{highlightMember.name}</span>
              <span className="text-xs text-muted-foreground">({highlightMember.role})</span>
              <span className="text-xs text-green-700">- {getHighlightReason(type, highlightMember)}</span>
            </div>
          )}
        </div>
        {/* Indicadores */}
        <div className="flex gap-4 mb-4 flex-wrap">
          {stats.map(stat => (
            <div key={stat.label} className="bg-muted/50 rounded-lg px-4 py-2 flex flex-col items-center min-w-[110px]">
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              <span className="text-lg font-bold">{stat.value}</span>
            </div>
          ))}
        </div>
        {/* Busca e filtros */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Input
              placeholder="Buscar por nome, função ou e-mail..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8"
            />
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              className="border rounded px-2 py-1 text-sm"
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
            >
              <option value="">Todas as funções</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="">Todos os status</option>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
              <option value="Excluído">Excluído</option>
            </select>
          </div>
        </div>
        {/* Lista de membros */}
        <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-xl p-1 sm:p-2">
          <CardHeader className="pb-1">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-neutro" /> Equipe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex flex-col gap-0.5">
              {(loading && !error) && (
                <div className="text-center py-8 text-muted-foreground">Carregando funcionários...</div>
              )}
              {error && (
                <div className="text-center py-8 text-red-500">Erro ao carregar funcionários.</div>
              )}
              {(!loading && !error && filteredTeam.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">{emptyMsg}</div>
              )}
              {filteredTeam.map((member, idx) => {
                const isExpanded = expandedMember === member.id;
                return (
                  <div key={idx} className={`flex flex-col transition-all rounded-lg ${isExpanded ? 'border-2 border-green-200 bg-green-50 shadow-sm' : 'border border-muted bg-white'} mb-1`}>
                    <div
                      className="flex items-center gap-1 pl-0 pr-1 py-1 sm:pl-0 sm:pr-2 sm:py-1 cursor-pointer justify-between min-h-[40px]"
                      onClick={() => setExpandedMember(isExpanded ? null : member.id)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Avatar className="h-8 w-8">
                          {member.avatarUrl ? <AvatarImage src={member.avatarUrl} /> : <AvatarFallback>{member.name[0]}</AvatarFallback>}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">{member.name}</div>
                          <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                            {member.role || member.function}
                            {member.status && (
                              <Badge
                                variant="outline"
                                className={
                                  member.status === 'Ativo'
                                    ? 'text-green-700 bg-green-100 border-green-200'
                                    : member.status === 'Inativo'
                                    ? 'text-yellow-700 bg-yellow-100 border-yellow-200'
                                    : 'text-red-700 bg-red-100 border-red-200'
                                }
                              >
                                {member.status}
                              </Badge>
                            )}
                          </div>
                          {member.status === 'Inativo' && member.inactiveReason && (
                            <div className="text-[10px] text-yellow-700 mt-0.5">{member.inactiveReason}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" onClick={e => { e.stopPropagation(); setSelected(member); }} title="Visualizar">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={e => { e.stopPropagation(); setEditMember(member); setEditStatus(member.status || 'Ativo'); setEditReason(member.inactiveReason || ''); setEditCustomReason(''); }} title="Editar">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-3 pt-1 text-xs text-muted-foreground animate-fade-in flex flex-col gap-1">
                        {member.email && <div><b>E-mail:</b> {member.email}</div>}
                        {member.phone && <div><b>Telefone:</b> {member.phone}</div>}
                        {member.admission && <div><b>Admissão:</b> {member.admission}</div>}
                        {member.notes && <div><b>Observações:</b> {member.notes}</div>}
                        {member.permissions && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            <b className="w-full">Permissões:</b>
                            {Object.entries(member.permissions).map(([key, val]) => val && (
                              <Badge key={key} variant="outline" className="text-blue-700 bg-blue-100 border-blue-200">{key}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        {/* Modal de detalhes */}
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalhes do Membro</DialogTitle>
            </DialogHeader>
            {selected && (
              <div className="flex flex-col items-center gap-3">
                <Avatar className="h-20 w-20 mb-2">
                  {selected.avatarUrl ? <AvatarImage src={selected.avatarUrl} /> : <AvatarFallback>{selected.name[0]}</AvatarFallback>}
                </Avatar>
                <div className="font-bold text-lg">{selected.name}</div>
                <div className="text-sm text-muted-foreground mb-2">{selected.role || selected.function}</div>
                {selected.status && (
                  <div className="mb-1">
                    <Badge
                      variant="outline"
                      className={
                        selected.status === 'Ativo'
                          ? 'text-green-700 bg-green-100 border-green-200'
                          : selected.status === 'Inativo'
                          ? 'text-yellow-700 bg-yellow-100 border-yellow-200'
                          : 'text-red-700 bg-red-100 border-red-200'
                      }
                    >
                      {selected.status}
                    </Badge>
                  </div>
                )}
                {selected.status === 'Excluído' && (
                  <>
                    <div className="text-sm text-red-700 text-center mb-2">Este membro está excluído. Você pode restaurá-lo para reativar o acesso.</div>
                    <Button variant="outline" className="bg-red-100 text-red-700 border-red-200 hover:bg-red-200" disabled>Restaurar</Button>
                  </>
                )}
                {selected.status === 'Inativo' && (
                  <>
                    <div className="text-sm text-yellow-700 text-center mb-2">Este membro está inativo. Você pode ativá-lo novamente para que volte a ter acesso e participar das operações.</div>
                    {selected.inactiveReason && (
                      <div className="text-xs text-yellow-700 text-center mb-2 font-semibold">Motivo: {selected.inactiveReason}</div>
                    )}
                    <Button variant="outline" className="bg-green-100 text-green-700 border-green-200 hover:bg-green-200" disabled>Ativar</Button>
                  </>
                )}
                <div className="w-full flex flex-col gap-1 text-sm mt-2">
                  {selected.email && <div><b>E-mail:</b> {selected.email}</div>}
                  {selected.phone && <div><b>Telefone:</b> {selected.phone}</div>}
                  {selected.admission && <div><b>Admissão:</b> {selected.admission}</div>}
                  {selected.highlight && <div><b>Destaque:</b> {selected.highlight}</div>}
                  {selected.permissions && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      <b className="w-full">Permissões:</b>
                      {Object.entries(selected.permissions).map(([key, val]) => val && (
                        <Badge key={key} variant="outline" className="text-blue-700 bg-blue-100 border-blue-200">{key}</Badge>
                      ))}
                    </div>
                  )}
                  {selected.notes && <div className="mt-2 text-sm italic">{selected.notes}</div>}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        {/* Modal de edição */}
        <Dialog open={!!editMember} onOpenChange={() => setEditMember(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Membro</DialogTitle>
            </DialogHeader>
            {editMember && (
              <form
                onSubmit={async e => {
                  e.preventDefault();
                  setEditLoading(true);
                  setEditError(null);
                  try {
                    const error = await updateEmployee({
                      id: editMember.id,
                      name: editName,
                      email: editEmail,
                      phone: editPhone,
                      role: editRole,
                      status: editStatus,
                      permissions: editPermissions
                    });
                    setEditLoading(false);
                    if (!error) {
                      setTeamState(prev => prev.map(m =>
                        m.id === editMember.id
                          ? {
                              ...m,
                              name: editName,
                              role: editRole,
                              email: editEmail,
                              phone: editPhone,
                              avatarUrl: editAvatarUrl,
                              permissions: editPermissions,
                              status: editStatus,
                              inactiveReason: editStatus === 'Inativo' ? (editReason === 'Outro' ? editCustomReason : editReason) : (editStatus === 'Excluído' ? (editReason === 'Outro' ? editCustomReason : editReason) : undefined)
                            }
                          : m
                      ));
                      setEditMember(null);
                      toast.success('Funcionário atualizado com sucesso!');
                    } else {
                      setEditError('Erro ao salvar alterações.');
                    }
                  } catch (err: any) {
                    console.log('ERRO SUPABASE:', err);
                    setEditError('Erro ao salvar alterações.');
                  }
                }}
                className="flex flex-col gap-4"
              >
                {/* Foto de Perfil */}
                <div>
                  <label className="block text-sm font-medium mb-1">Foto de Perfil</label>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      {editAvatarUrl ? <AvatarImage src={editAvatarUrl} /> : <AvatarFallback>{editName[0]}</AvatarFallback>}
                    </Avatar>
                    <input
                      type="file"
                      accept="image/*"
                      className="text-sm"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = ev => setEditAvatarUrl(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                </div>
                {/* Campos básicos */}
                <div>
                  <label className="block text-sm font-medium mb-1">Nome</label>
                  <input
                    className="border rounded px-2 py-1 w-full"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Função/Cargo</label>
                  <input
                    className="border rounded px-2 py-1 w-full"
                    value={editRole}
                    onChange={e => setEditRole(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">E-mail</label>
                  <input
                    className="border rounded px-2 py-1 w-full"
                    type="email"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Telefone</label>
                  <input
                    className="border rounded px-2 py-1 w-full"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    className="border rounded px-2 py-1 w-full"
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                {(editStatus === 'Inativo' || editStatus === 'Excluído') && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Motivo</label>
                    <select
                      className="border rounded px-2 py-1 w-full mb-2"
                      value={editReason}
                      onChange={e => setEditReason(e.target.value)}
                    >
                      <option value="">Selecione um motivo</option>
                      {(editStatus === 'Inativo' ? INACTIVE_REASONS : EXCLUDE_REASONS).map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    {editReason === 'Outro' && (
                      <input
                        className="border rounded px-2 py-1 w-full"
                        placeholder="Digite o motivo"
                        value={editCustomReason}
                        onChange={e => setEditCustomReason(e.target.value)}
                      />
                    )}
                  </div>
                )}
                {/* Permissões de Visualização */}
                <div className="pt-2">
                  <label className="font-semibold">Permissões de Visualização</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {CARD_PERMISSIONS.map(card => (
                      <label key={card.key} className="flex items-center gap-2 text-sm">
                        <Switch checked={!!editPermissions[card.key]} onCheckedChange={() => setEditPermissions((prev: any) => ({ ...prev, [card.key]: !prev[card.key] }))} />
                        {card.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" type="button" onClick={() => setEditMember(null)} disabled={editLoading}>Cancelar</Button>
                  <Button variant="default" type="submit" disabled={editLoading}>{editLoading ? 'Salvando...' : 'Salvar'}</Button>
                </div>
                {editError && <div className="text-red-600 text-sm mt-2">{editError}</div>}
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <AppFooter />
    </>
  );
};

export default TeamMembersList; 