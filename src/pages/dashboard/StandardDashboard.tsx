import React, { useState, useEffect, useRef } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StandardDashboardHeader from '@/components/dashboard/StandardDashboardHeader';
import StandardQuickActionCard from '@/components/dashboard/StandardQuickActionCard';
import StandardCouponsCard from '@/components/dashboard/StandardCouponsCard';
import StandardGoalsProgressCard from '@/components/dashboard/StandardGoalsProgressCard';
import { StandardEnvironmentalImpactCard } from '@/components/dashboard/standard/StandardEnvironmentalImpactCard';
import { useNavigate } from 'react-router-dom';
import StandardNotificationCard from '@/components/dashboard/standard/StandardNotificationCard';
import StandardTeamManagementCard from '@/components/dashboard/standard/StandardTeamManagementCard';
import StandardCommunityCard from '@/components/dashboard/StandardCommunityCard';
import StandardCooperativeUpcomingActionsCard from '@/components/dashboard/StandardCooperativeUpcomingActionsCard';
import ValidateCouponModal from '@/components/coupons/ValidateCouponModal';
import { QrCode, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StandardCollectorCompanyPricingCard from '@/components/dashboard/cards/CollectorCompanyPricingCard';
import { StandardFinancialCard } from "@/components/dashboard/standard/StandardFinancialCard";
import { StandardPartnerFinancialCard } from "@/components/dashboard/standard/StandardPartnerFinancialCard";
import { supabase } from '@/lib/supabaseClient';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useMaterialPricing } from '@/hooks/useMaterialPricing';
import { useEnvironmentalImpact } from '@/hooks/useEnvironmentalImpact';
import { useFinancialGoal } from '@/hooks/useFinancialGoal';
import { getMonthlyCouponLimit, getCurrentMonthKey } from '@/lib/couponUtils';
import { useAuth } from '@/contexts/AuthContext';

const mockUsers = [
  {
    id: '2863a918-7e01-42ec-95b4-35891c4321ee',
    name: 'Maria Silva',
    userType: 'common_user',
    level: { value: 3, label: 'Bronze', color: 'bg-amber-500' },
    avatar: { src: '', fallback: 'MS' },
    email: 'maria.silva@email.com',
    stats: [
      { icon: 'Package', value: '45kg', label: 'Total Reciclado' },
      { icon: 'Star', value: '4.7', label: 'Avaliação' },
      { icon: 'Clock', value: '3', label: 'Coletas Agendadas' },
      { icon: 'Gift', value: '5', label: 'Cupons Disponíveis' }
    ]
  },
  {
    id: 'b7e1c2d3-4f5a-6789-0abc-def123456789',
    name: 'João Santos',
    userType: 'individual_collector',
    level: { value: 5, label: 'Ouro', color: 'bg-yellow-400' },
    avatar: { src: '', fallback: 'JS' },
    email: 'joao.santos@email.com',
    collectorMetrics: {
      totalCollected: '2.5t',
      rating: 4.8,
      coverageAreas: ['Centro', 'Zona Sul'],
      activeSince: '2022-01-15'
    },
    companyAffiliation: {
      companyId: 'f1b5c6d7-8d9e-0123-4ef0-567890123456',
      companyName: 'Recicla Mais',
      since: '2022-03-01',
      role: 'Coletor Sênior',
      company: {
        id: 'f1b5c6d7-8d9e-0123-4ef0-567890123456',
        type: 'collector_company',
        activeSince: '2020-05-10',
        name: 'Recicla Mais',
        logo: '/public/Image/loja1.jpg',
        email: 'contato@reciclamais.com',
        cnpj: '12.345.678/0001-99',
        phone: '(11) 99999-9999',
        address: 'Rua das Flores, 123, Centro, São Paulo - SP',
        status: 'Ativa',
        stats: [
          { icon: 'Package', value: '120t', label: 'Total Coletado' },
          { icon: 'Users', value: '15', label: 'Coletores' }
        ],
        metrics: {
          activeSince: '2020-05-10',
          rating: 4.7
        }
      }
    },
    isActive: true,
    isAvailable: true,
    isBlocked: false,
    status: 'Ativo'
  },
  {
    id: 'c8f2d3e4-5a6b-7890-1bcd-ef2345678901',
    name: 'Maria Oliveira',
    userType: 'individual_collector',
    level: { value: 4, label: 'Prata', color: 'bg-gray-400' },
    avatar: { src: '', fallback: 'MO' },
    email: 'maria.oliveira@email.com',
    collectorMetrics: {
      totalCollected: '1.8t',
      rating: 4.9,
      coverageAreas: ['Zona Norte', 'Zona Leste', 'Zona Oeste'],
      activeSince: '2021-11-20'
    },
    isActive: true,
    isAvailable: true,
    isBlocked: false,
    status: 'Ativo'
  },
  {
    id: 'd9f3e4a5-6b7c-8901-2cde-f34567890123',
    name: 'Carlos Mendes',
    userType: 'cooperative_owner',
    level: { value: 6, label: 'Ouro', color: 'bg-yellow-400' },
    avatar: { src: '', fallback: 'CM' },
    email: 'carlos.mendes@email.com',
    entity: { id: '301', name: 'Cooperativa Verde', type: 'cooperative', isVerified: true },
    stats: [
      { icon: 'Users', value: '45', label: 'Cooperados' },
      { icon: 'Star', value: '4.8', label: 'Avaliação' },
      { icon: 'Package', value: '15.2t', label: 'Volume Mensal' },
      { icon: 'Calendar', value: '3 anos', label: 'Na Plataforma' }
    ],
    role: 'Presidente'
  },
  {
    id: 'e0a4b5c6-7c8d-9012-3def-456789012345',
    name: 'Ana Costa',
    userType: 'collector_company_owner',
    level: { value: 7, label: 'Ouro', color: 'bg-yellow-400' },
    avatar: { src: '', fallback: 'AC' },
    email: 'ana.costa@email.com',
    entity: { id: '401', name: 'Coleta Fácil', type: 'collector_company', isVerified: true },
    stats: [
      { icon: 'Users', value: '35', label: 'Coletores' },
      { icon: 'Star', value: '4.9', label: 'Avaliação' },
      { icon: 'Package', value: '25.5t', label: 'Volume Mensal' },
      { icon: 'Calendar', value: '2 anos', label: 'Na Plataforma' }
    ],
    role: 'Proprietária'
  },
  {
    id: 'f1b5c6d7-8d9e-0123-4ef0-567890123456',
    name: 'Roberto Almeida',
    userType: 'partner_owner',
    level: { value: 5, label: 'Ouro', color: 'bg-yellow-400' },
    avatar: { src: '', fallback: 'RA' },
    email: 'roberto.almeida@email.com',
    entity: { id: '201', name: 'Restaurante Bom Sabor', type: 'restaurant', isVerified: true },
    stats: [
      { icon: 'Users', value: '1500', label: 'Clientes/Mês' },
      { icon: 'Leaf', value: '450kg', label: 'Desperdício Evitado' },
      { icon: 'Ticket', value: '15', label: 'Cupons Ativos' },
      { icon: 'Star', value: '4.8', label: 'Avaliação' }
    ],
    role: 'Proprietário'
  },
  {
    id: 'a2c6d7e8-9e0f-1234-5f01-678901234567',
    name: 'Patrícia Lima',
    userType: 'partner_owner',
    level: { value: 4, label: 'Prata', color: 'bg-gray-400' },
    avatar: { src: '', fallback: 'PL' },
    email: 'patricia.lima@email.com',
    entity: { id: '202', name: 'Loja Sustentável', type: 'store', isVerified: true },
    stats: [
      { icon: 'Users', value: '2500', label: 'Clientes/Mês' },
      { icon: 'Package', value: '1200kg', label: 'Embalagens Recicladas' },
      { icon: 'Ticket', value: '25', label: 'Cupons Ativos' },
      { icon: 'Star', value: '4.6', label: 'Avaliação' }
    ],
    role: 'Proprietária'
  },
  {
    id: 'b3d7e8f9-0f1a-2345-6012-789012345678',
    name: 'Fernando Santos',
    userType: 'partner_owner',
    level: { value: 5, label: 'Ouro', color: 'bg-yellow-400' },
    avatar: { src: '', fallback: 'FS' },
    email: 'fernando.santos@email.com',
    entity: { id: '203', name: 'Escola Verde', type: 'educational', isVerified: true },
    stats: [
      { icon: 'Users', value: '500', label: 'Alunos Impactados' },
      { icon: 'Book', value: '3', label: 'Programas Ativos' },
      { icon: 'Ticket', value: '10', label: 'Cupons Ativos' },
      { icon: 'Star', value: '4.9', label: 'Avaliação' }
    ],
    role: 'Diretor'
  }
];

const StandardDashboard: React.FC = () => {
  // Estado para controlar o usuário selecionado
  const { user: authUser, loading: authLoading, setUser } = useAuth();
  const initialUserId = React.useMemo(() => {
    // Sempre força o usuário comum como padrão, independente do authUser
    const commonUser = mockUsers.find(u => u.userType === 'common_user');
    return commonUser ? commonUser.id : mockUsers[0].id;
  }, []);
  const [selectedUserId, setSelectedUserId] = useState<string>(initialUserId);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [linkedEntity, setLinkedEntity] = useState<any>(null);
  const hasInitialized = useRef(false);
  const [showValidateCouponModal, setShowValidateCouponModal] = useState(false);
  const [realCoupons, setRealCoupons] = useState(null);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [progressData, setProgressData] = useState(null);
  const [monthlyGoals, setMonthlyGoals] = useState([]);
  const [progressLoading, setProgressLoading] = useState(true);
  const [realNotifications, setRealNotifications] = useState(null);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  // Hooks para dados reais
  const { teamData, loading: teamLoading } = useTeamManagement(
    linkedEntity?.id?.toString(),
    linkedEntity?.type
  );
  
  const { financialData, loading: financialLoading } = useFinancialData(
    typeof selectedUser?.id === 'string' ? selectedUser.id : undefined,
    typeof selectedUser?.userType === 'string' ? selectedUser.userType : undefined,
    typeof linkedEntity?.id === 'string' ? linkedEntity.id : undefined
  );
  
  const { pricingData, loading: pricingLoading } = useMaterialPricing(
    linkedEntity?.id?.toString()
  );
  
  const { impactData, loading: impactLoading } = useEnvironmentalImpact(
    selectedUser?.id?.toString(),
    linkedEntity?.id?.toString()
  );

  // Hook para meta financeira real
  const { goal, loading: goalLoading, error: goalError, fetchGoal, saveGoal } = useFinancialGoal();

  const navigate = useNavigate();

  // Efeito para carregar o usuário selecionado
  useEffect(() => {
    const navState = window.history.state && window.history.state.usr;
    
    // Se houver um userId no estado da navegação e ele for diferente do selecionado
    if (navState?.userId && navState.userId !== selectedUserId) {
      setSelectedUserId(navState.userId);
    }
  }, [window.history.state]);

  // Resetar para o usuário comum sempre que não houver usuário autenticado
  useEffect(() => {
    if (!authUser) {
      const commonUser = mockUsers.find(u => u.userType === 'common_user');
      setSelectedUserId(commonUser ? commonUser.id : mockUsers[0].id);
    }
  }, [authUser]);

  // Efeito separado para atualizar o usuário e entidade vinculada
  useEffect(() => {
    const user = mockUsers.find(u => u.id === selectedUserId) || mockUsers[0];
    setSelectedUser(user);
    setLinkedEntity(user.entity || user.companyAffiliation || null);
  }, [selectedUserId]);

  // Adicionar log detalhado para depuração
  console.log('selectedUser', selectedUser && JSON.stringify(selectedUser, null, 2));

  // Buscar cupons reais do banco
  useEffect(() => {
    async function fetchCoupons() {
      if (!selectedUser) return;
      setCouponsLoading(true);
      try {
        console.log('🔄 Buscando cupons reais do banco...');
        // Buscar cupons ativos do banco
        const { data: coupons, error } = await supabase
          .from('coupons')
          .select('*, coupon:coupons(*)')
          .eq('is_active', true)
          .gte('valid_until', new Date().toISOString());
        if (error) throw error;
        console.log('✅ Cupons encontrados no banco:', coupons?.length || 0, coupons);
        // Buscar nomes dos parceiros
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
        // Mapear cupons para incluir partnerName
        const couponsWithPartner = (coupons || []).map(c => ({ ...c, partnerName: partnersMap[c.partner_id] || 'Parceiro' }));
        setRealCoupons(couponsWithPartner);
      } catch (error) {
        console.error('❌ Erro ao buscar cupons:', error);
        console.log('🔄 Usando fallback para mocks...');
        setRealCoupons(null); // Usar mocks em caso de erro
      } finally {
        setCouponsLoading(false);
      }
    }
    fetchCoupons();
  }, [selectedUser]);

  // Buscar progresso e metas reais do banco
  useEffect(() => {
    async function fetchProgress() {
      if (!selectedUser) return;
      setProgressLoading(true);
      try {
        // Buscar progresso do usuário
        const { data: progress, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', selectedUser.id)
          .single();
        // Buscar metas mensais
        const { data: goals, error: goalsError } = await supabase
          .from('monthly_goals')
          .select('*')
          .eq('user_id', selectedUser.id)
          .order('month_year', { ascending: false });
        if (progressError) throw progressError;
        if (goalsError) throw goalsError;
        setProgressData(progress);
        setMonthlyGoals(goals || []);
      } catch (error) {
        setProgressData(null);
        setMonthlyGoals([]);
      } finally {
        setProgressLoading(false);
      }
    }
    fetchProgress();
  }, [selectedUser]);

  // Buscar notificações reais do banco
  useEffect(() => {
    async function fetchNotifications() {
      if (!selectedUser) return;
      setNotificationsLoading(true);
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .contains('user_types', [selectedUser.userType]);
        if (error) throw error;
        setRealNotifications(data);
      } catch (error) {
        setRealNotifications(null);
      } finally {
        setNotificationsLoading(false);
      }
    }
    fetchNotifications();
  }, [selectedUser]);

  useEffect(() => {
    if (selectedUser?.id) fetchGoal(selectedUser.id);
  }, [selectedUser?.id]);

  const handleUpdateGoal = (newGoal: number) => {
    if (selectedUser?.id) saveGoal(selectedUser.id, newGoal);
  };

  // Função para lidar com a mudança de usuário
  const handleUserChange = (value: string) => {
    const newUserId = value;
    setSelectedUserId(newUserId);
    const newUser = mockUsers.find(u => u.id === newUserId);
    if (newUser) setUser(newUser); // Força o AuthContext a usar o mock selecionado
    // Atualiza o estado da navegação para manter o usuário selecionado
    window.history.replaceState(
      { ...window.history.state, usr: { userId: newUserId } },
      '',
      window.location.href
    );
  };

  // Função para determinar o cargo do usuário
  const getUserRole = (user: any) => {
    switch (user.userType) {
      case 'cooperative_owner':
        return 'Presidente';
      case 'collector_company_owner':
      case 'partner_owner':
        return 'Proprietário';
      case 'individual_collector':
        return user.companyAffiliation ? 'Coletor' : 'Coletor Independente';
      default:
        return 'Usuário';
    }
  };

  // Função para determinar o plano do usuário
  const getUserPlan = (user: any) => {
    // Coletores individuais e usuários comuns não possuem plano pago
    if (user.userType === 'individual_collector' || user.userType === 'common_user') {
      return null;
    }

    // Exemplo de lógica para determinar o plano
    // Aqui você pode implementar a lógica real baseada nos dados do usuário
    if (user.level?.label === 'Ouro') {
      return { name: 'Carbon Free', price: 'R$ 249,90/mês' };
    } else if (user.level?.label === 'Prata') {
      return { name: 'Impacto Verde', price: 'R$ 99,90/mês' };
    } else {
      return { name: 'Eco+', price: 'Gratuito' };
    }
  };

  // Função para formatar a opção do seletor
  const formatUserOption = (userId: string) => {
    return `Usuário ${userId}`;
  };

  // Função utilitária para decidir qual ID usar nas queries
  function getEffectiveUserId(selectedUser, authUser) {
    if (
      authUser &&
      selectedUser &&
      selectedUser.userType === authUser.user_type
    ) {
      return authUser.id;
    }
    return selectedUser?.id;
  }

  // Buscar cupons resgatados pelo usuário logado (coupon_usage)
  useEffect(() => {
    if (!selectedUser || !authUser || authLoading) {
      console.log('[Dashboard] Aguardando selectedUser e authUser estarem prontos:', { selectedUser, authUser, authLoading });
      return;
    }
    async function fetchUserCoupons() {
      setCouponsLoading(true);
      try {
        const effectiveUserId = getEffectiveUserId(selectedUser, authUser);
        console.log('[Dashboard] Buscando cupons para userId:', effectiveUserId, '| selectedUser:', selectedUser.id, '| authUser:', authUser.id, '| Tipo:', selectedUser.userType, authUser.user_type);
        const { data: usage, error } = await supabase
          .from('coupon_usage')
          .select('*, coupon:coupons(*), partner:users(name)')
          .eq('user_id', effectiveUserId)
          .order('used_at', { ascending: false });
        if (error) throw error;
        const mapped = (usage || []).map(u => ({
          id: u.coupon?.id || u.id,
          name: u.coupon?.title || '',
          value: u.coupon?.discount_type === 'percentage'
            ? (u.coupon?.discount_value ? `${u.coupon?.discount_value}%` : '')
            : (u.coupon?.discount_value ? `R$ ${u.coupon?.discount_value}` : ''),
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
        console.log('[Dashboard] Cupons mapeados:', mapped);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const activeCoupons = mapped
          .filter(coupon =>
            (!coupon.status || coupon.status === 'ativo' || coupon.status === 'active') &&
            coupon.expiresAt >= today
          )
          .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime())
          .slice(0, 3);
        console.log('[Dashboard] Cupons ativos filtrados:', activeCoupons);
        setRealCoupons(activeCoupons);
      } catch (error) {
        setRealCoupons([]);
      } finally {
        setCouponsLoading(false);
      }
    }
    fetchUserCoupons();
  }, [selectedUser, authUser, authLoading]);

  // Mock de precificação
  const mockBasePrices = [
    { materialId: '1', name: 'Papelão', price: 0.50, unit: 'kg', isActive: true },
    { materialId: '2', name: 'Plástico', price: 0.30, unit: 'kg', isActive: true },
    { materialId: '3', name: 'Alumínio', price: 2.00, unit: 'kg', isActive: true },
  ];
  const mockAdjustments = [
    { partnerId: '10', partnerType: 'collector' as const, partnerName: 'João Coletor', materialId: '1', adjustmentType: 'percentage' as const, adjustmentValue: 10, createdAt: new Date(), updatedAt: new Date() },
    { partnerId: '20', partnerType: 'cooperative' as const, partnerName: 'Cooperativa Verde', materialId: '2', adjustmentType: 'fixed' as const, adjustmentValue: 0.05, createdAt: new Date(), updatedAt: new Date() },
  ];

  // Função utilitária para mapear userType para o tipo correto da URL
  const getPartnerTypeForUrl = (userType: string) => {
    if (userType === 'restaurant_partner') return 'restaurant';
    if (userType === 'store_partner') return 'store';
    if (userType === 'educational_partner') return 'educational';
    return 'restaurant'; // fallback
  };

  const getCouponsData = (userType: string, user: any) => {
    const userLevel = (user.level?.label || 'bronze').toLowerCase();
    const normalizedUserType = (userType || 'common_user').replace('_user', 'common').replace('_owner', '').replace('individual_collector', 'collector');
    if (realCoupons && realCoupons.length > 0) {
      // Calcular limite e usados no mês
      const currentMonthKey = getCurrentMonthKey();
      const redeemedThisMonth = realCoupons.filter(coupon => {
        const usedAt = coupon.expiresAt instanceof Date ? coupon.expiresAt : new Date(coupon.expiresAt);
        const month = usedAt.toISOString().slice(0, 7);
        return month === currentMonthKey;
      }).length;
      const availableCoupons = Math.max(0, getMonthlyCouponLimit(normalizedUserType, userLevel) - redeemedThisMonth);
      return {
        userLevel: { label: user.level?.label || 'Bronze', color: user.level?.color },
        monthlyLimit: getMonthlyCouponLimit(normalizedUserType, userLevel),
        availableCoupons,
        activeCoupons: realCoupons
      };
    }
    // Retorno padrão: usar o limite correto mesmo sem cupons resgatados
    const monthlyLimit = getMonthlyCouponLimit(normalizedUserType, userLevel);
    return {
      userLevel: { label: user.level?.label || 'Bronze', color: user.level?.color },
      monthlyLimit,
      availableCoupons: monthlyLimit,
      activeCoupons: []
    };
  };

  // Adicionar loading global para usuário
  if (!authUser && authLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Carregando usuário...</div>;
  }

  if (!selectedUser) {
    return <div className="p-8 text-center text-red-500">Nenhum usuário de teste selecionado. Tente recarregar a página ou selecione um perfil.</div>;
  }

  // Adicionar mapeamento de nível correto
  const levelMap = {
    1: 'Bronze',
    2: 'Prata',
    3: 'Ouro'
  };
  const levelLabel = progressData?.current_level
    ? levelMap[progressData.current_level] || String(progressData.current_level)
    : selectedUser?.level?.label || 'Bronze';
  const levelColor = selectedUser?.level?.color;

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Seletor de Usuário */}
      <Card>
        <CardHeader>
          <CardTitle>Selecione um Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedUserId}
            onValueChange={handleUserChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um perfil" />
            </SelectTrigger>
            <SelectContent>
              {mockUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name} ({user.userType.replace('_', ' ')})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Card de Perfil */}
      {selectedUser && (
        <>
          {/* stats só para usuário comum */}
          {selectedUser.userType === 'common_user' && (
            <StandardDashboardHeader
              user={{
                ...selectedUser,
                level: { label: levelLabel, color: levelColor }
              }}
              entity={linkedEntity || undefined}
              role={getUserRole(selectedUser)}
              plan={getUserPlan(selectedUser)}
              isVerified={linkedEntity?.isVerified || false}
              userId={selectedUserId}
              stats={selectedUser.stats}
            />
          )}
          {selectedUser.userType !== 'common_user' && (
            <StandardDashboardHeader
              user={{
                ...selectedUser,
                level: { label: progressData?.current_level || selectedUser.level?.label || 'Bronze', color: selectedUser.level?.color }
              }}
              entity={selectedUser.userType === 'individual_collector' && selectedUser.companyAffiliation?.company ? selectedUser.companyAffiliation.company : linkedEntity || undefined}
              role={getUserRole(selectedUser)}
              plan={getUserPlan(selectedUser)}
              isVerified={linkedEntity?.isVerified || false}
              userId={selectedUserId}
            />
          )}

          {/* Ações Rápidas - Sempre presente */}
          <StandardQuickActionCard 
            userType={selectedUser.userType} 
            user={{
              ...selectedUser,
              entity: selectedUser.userType === 'partner_owner' ? linkedEntity : undefined,
              entityType: linkedEntity?.type
            }}
            onValidateCoupon={() => setShowValidateCouponModal(true)}
          />

          {/* Notificações - Sempre presente */}
          <StandardNotificationCard 
            notifications={realNotifications && realNotifications.length > 0
              ? realNotifications
              : []}
            showCounters={true}
            onSeeAll={() => {
              navigate('/notifications', {
                state: {
                  userId: selectedUserId,
                  userType: selectedUser.userType
                }
              });
            }}
          />
          
          {/* Cupons - Para usuário comum e outros perfis específicos */}
          {(['common_user', 'cooperative_owner', 'collector_company_owner', 'partner_owner', 'individual_collector'].includes(selectedUser.userType)) && (
            <StandardCouponsCard 
              userLevel={{ label: levelLabel, color: levelColor }}
              monthlyLimit={getCouponsData(selectedUser.userType, selectedUser).monthlyLimit}
              availableCoupons={getCouponsData(selectedUser.userType, selectedUser).availableCoupons}
              activeCoupons={getCouponsData(selectedUser.userType, selectedUser).activeCoupons}
              userName={selectedUser.name}
              entityName={linkedEntity?.name}
              userType={selectedUser.userType}
              userId={selectedUserId?.toString()}
              user={selectedUser}
            />
          )}

          {/* Próximas Ações - Apenas para cooperativa */}
          {selectedUser.userType === 'cooperative_owner' && (
            <StandardCooperativeUpcomingActionsCard />
          )}

          {/* Comunidade - Apenas para usuário comum */}
          {selectedUser.userType === 'common_user' && (
            <StandardCommunityCard
              user={selectedUser}
              onSeeAll={() => navigate('/user/achievements', { state: { userId: selectedUser?.id } })}
            />
          )}

          {/* Metas e Progressos - Sempre presente */}
          <StandardGoalsProgressCard
            title="Metas e Progresso"
            userLevel={{ label: progressData?.current_level || 'Bronze', color: selectedUser.level?.color }}
            currentPoints={progressData?.total_points ?? 0}
            nextLevelPoints={progressData?.next_level_points ?? 100}
            monthlyGoals={monthlyGoals.length > 0 ? monthlyGoals.map(goal => ({
              id: goal.id,
              title: goal.goal_type,
              description: goal.goal_type,
              currentProgress: goal.current_value,
              total: goal.target_value,
              points: goal.points_reward,
              icon: 'Target'
            })) : []}
            userName={selectedUser.name}
            maxLevelMessage={progressData?.max_level_message}
            maintenanceRequirements={progressData?.maintenance_requirements}
            benefits={progressData?.benefits}
            userType={selectedUser.userType}
          />

          {/* Gestão de Equipe - Apenas para perfis específicos */}
          {['cooperative_owner', 'collector_company_owner', 'partner_owner'].includes(selectedUser.userType) && (
            <StandardTeamManagementCard 
              companyType={
                selectedUser.userType === 'cooperative_owner'
                  ? 'cooperative'
                  : selectedUser.userType === 'collector_company_owner'
                    ? 'collector_company'
                    : 'partner'
              }
              team={
                teamData && !teamLoading
                  ? teamData.members.map(member => ({
                      id: member.id,
                      name: member.name,
                      email: member.email,
                      role: member.role,
                      avatar: member.avatar,
                      status: member.status,
                      joinDate: member.joinDate,
                      performance: member.performance
                    }))
                  : []
              }
              teamAverageLabel={
                selectedUser.userType === 'cooperative_owner'
                  ? 'Média geral da equipe'
                  : selectedUser.userType === 'collector_company_owner'
                    ? 'Tempo médio de empresa'
                    : linkedEntity?.type === 'restaurant'
                      ? 'Cupons servidos/mês'
                      : linkedEntity?.type === 'store'
                        ? 'Cupons validados/mês'
                        : 'Aulas verdes/mês'
              }
              teamAverageValue={
                teamData && !teamLoading
                  ? selectedUser.userType === 'cooperative_owner'
                    ? `${teamData.averageRating?.toFixed(1) || '0'} estrelas`
                    : selectedUser.userType === 'collector_company_owner'
                      ? `${teamData.averagePoints?.toFixed(0) || '0'} pontos`
                      : `${teamData.totalMembers || 0} membros`
                  : selectedUser.userType === 'cooperative_owner'
                    ? '4.7 estrelas'
                    : selectedUser.userType === 'collector_company_owner'
                      ? '3,2 anos'
                      : linkedEntity?.type === 'restaurant'
                        ? '12 cupons'
                        : linkedEntity?.type === 'store'
                          ? '8 cupons'
                          : '20 aulas'
              }
              onViewAll={() => {
                if (selectedUser.userType === 'collector_company_owner') {
                  navigate('/company/team-members', {
                    state: {
                      entityId: linkedEntity?.id,
                      type: linkedEntity?.type,
                      entityName: linkedEntity?.name
                    }
                  });
                } else {
                  navigate('/partner/team-members-list?type=' + (linkedEntity?.type || 'restaurant'), {
                    state: {
                      entityId: linkedEntity?.id,
                      type: linkedEntity?.type,
                      entityName: linkedEntity?.name
                    }
                  });
                }
              }}
            />
          )}

          {/* Renderizar o modal sempre que o perfil for de parceiro */}
          {(selectedUser?.userType === 'partner_owner' && ['restaurant', 'store', 'educational'].includes(linkedEntity?.type)) && (
            <ValidateCouponModal open={showValidateCouponModal} onOpenChange={setShowValidateCouponModal} />
          )}

          {/* Card de Precificação */}
          {['collector_company_owner', 'individual_collector', 'cooperative_owner'].includes(selectedUser.userType) && (() => {
            // Usar dados reais se disponíveis, senão fallback para mocks
            const companyName = pricingData && !pricingLoading ? pricingData.companyName : undefined;
            const basePrices = pricingData && !pricingLoading ? pricingData.basePrices : mockBasePrices;
            const adjustments = pricingData && !pricingLoading ? pricingData.adjustments : mockAdjustments;
            
            return (
              <StandardCollectorCompanyPricingCard
                userType={selectedUser.userType as 'collector_company_owner' | 'individual_collector' | 'cooperative_owner'}
                companyName={companyName}
                basePrices={basePrices}
                adjustments={adjustments}
                isLinked={!!linkedEntity}
                linkedCompanyName={linkedEntity?.name}
              />
            );
          })()}

          {/* Card Financeiro - Para perfis específicos */}
          {['individual_collector', 'cooperative_owner', 'collector_company_owner'].includes(selectedUser?.userType) && (
            <StandardFinancialCard
              monthlyEarnings={financialData && !financialLoading ? financialData.monthlyRevenue : 0}
              monthlyGoal={typeof goal === 'number' ? goal : 0}
              materialSales={Array.isArray(financialData?.monthlyCollections) ? financialData.monthlyCollections : []}
              userType={selectedUser?.userType as 'individual_collector' | 'cooperative_owner' | 'collector_company_owner'}
              isLinked={selectedUser?.userType === 'individual_collector' && !!selectedUser.companyAffiliation}
              onViewFullReport={() => {
                let perfil: 'coletor' | 'cooperativa' | 'empresa' = 'coletor';
                if (selectedUser?.userType === 'individual_collector') perfil = 'coletor';
                else if (selectedUser?.userType === 'cooperative_owner') perfil = 'cooperativa';
                else if (selectedUser?.userType === 'collector_company_owner') perfil = 'empresa';
                navigate('/financial-overview', { state: { perfil } });
              }}
              onUpdateGoal={handleUpdateGoal}
              totalMembers={typeof teamData?.totalMembers === 'number' ? teamData.totalMembers : undefined}
              activeMembers={typeof teamData?.activeMembers === 'number' ? teamData.activeMembers : undefined}
            />
          )}

          {/* Card de Financiamento - Para perfis de parceiros */}
          {(
            (selectedUser?.userType === 'partner_owner' && ['restaurant', 'store', 'educational'].includes(linkedEntity?.type))
          ) && (
            <StandardPartnerFinancialCard
              {...{
                partnerType: (linkedEntity?.type as 'restaurant' | 'store' | 'educational') || 'restaurant',
                distributedCoupons: 0,
                validatedCoupons: 0,
                engagementRate: 0,
                recentCoupons: []
              }}
              userLevelLabel={selectedUser?.level?.label as 'Bronze' | 'Prata' | 'Ouro' || 'Bronze'}
            />
          )}

          {/* Impacto Ambiental - Sempre ao final */}
          <StandardEnvironmentalImpactCard 
            {...(impactData && !impactLoading
              ? {
                  co2: {
                    total: impactData.totalCO2Saved,
                    unit: 'kg'
                  },
                  trees: {
                    total: impactData.totalTreesSaved
                  },
                  water: {
                    total: impactData.totalWaterSaved,
                    unit: 'L'
                  },
                  energy: {
                    total: impactData.totalEnergySaved,
                    unit: 'kWh'
                  }
                }
              : {
                  co2: { total: 0, unit: 'kg' },
                  trees: { total: 0 },
                  water: { total: 0, unit: 'L' },
                  energy: { total: 0, unit: 'kWh' }
                }
            )}
            onDetailsClick={() => navigate(`/dashboard/impacto-ambiental/${selectedUserId}`)}
          />
        </>
      )}
    </div>
  );
};

export default StandardDashboard; 