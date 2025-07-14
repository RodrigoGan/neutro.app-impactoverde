import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  History, Clock, Gift, User, Package, ListTodo, Settings, MapPin, Building2,
  Users, DollarSign, ClipboardList, UserPlus, Handshake, Truck, Bell, Calendar, Percent, Zap, QrCode, Ticket, Share
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useUserProfile } from '@/hooks/useUserProfile';

interface StandardQuickActionCardProps {
  userType: "common_user" | "individual_collector" | "cooperative" | "cooperative_owner" | "collector_company_owner" | "restaurant_partner" | "partner_owner" | "store_partner" | "educational_partner" | string;
  user?: any;
  onValidateCoupon?: () => void;
}

const StandardQuickActionCard: React.FC<StandardQuickActionCardProps> = ({ userType, user, onValidateCoupon }) => {
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState(3); // Exemplo: 3 solicitações pendentes
  const [pendingSchedules, setPendingSchedules] = useState(2); // Exemplo: 2 agendamentos pendentes

  // Hook para dados reais do usuário
  const { profile, loading } = useUserProfile(user?.id);

  // Função para navegação
  const handleNavigate = (path: string, stateData?: object) => {
    if (user?.id) {
      window.history.replaceState(
        { ...window.history.state, usr: { userId: user.id } },
        '',
        window.location.href
      );
      window.scrollTo(0, 0);
      // Se for rota de criar cupom (com ou sem query string), envia userId no state
      if (path.startsWith('/partner/coupons/create')) {
        navigate(path, { state: { userId: user.id, ...stateData } });
      } else if (path === '/user/request-collection' || path === '/collection/simple' || path === '/collection/recurring') {
        navigate(path, { state: { user: user, ...stateData } });
      } else {
        navigate(path, { state: { userId: user.id, ...stateData } });
      }
    } else {
      window.scrollTo(0, 0);
      navigate(path, { state: stateData });
    }
  };

  // Função utilitária para mapear userType/entityType para o tipo correto da URL
  const getPartnerTypeForUrl = (userType: string, entityType?: string) => {
    if (userType === 'restaurant_partner' || entityType === 'restaurant') return 'restaurant';
    if (userType === 'store_partner' || entityType === 'store') return 'store';
    if (userType === 'educational_partner' || entityType === 'educational') return 'educational';
    return 'restaurant'; // fallback
  };

  // Definição das ações rápidas para o usuário comum
  if (userType === "common_user") {
    // Usar dados reais se disponíveis, senão usar fallback
    const pendingCount = profile?.stats?.scheduled_collections || 0;
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <Zap className="h-5 w-5 text-neutro" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm relative"
                onClick={() => handleNavigate("/collection-history")}
              >
                <History className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Histórico</span>
                {pendingCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {pendingCount}
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate("/collection/recurring", { profileType: 'user' })}
              >
                <Clock className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Recorrentes</span>
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate("/user/coupons")}
              >
                <Gift className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Meus Cupons</span>
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate("/user/profile")}
              >
                <User className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Configurações</span>
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate("/user/referral")}
              >
                <UserPlus className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Indicações</span>
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm relative"
                onClick={() => handleNavigate("/active-schedules")}
              >
                <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Agendamentos Ativos</span>
                {pendingSchedules > 0 && (
                  <span className="absolute top-1 right-1 bg-green-600 text-white text-xs rounded-full px-2 py-0.5">
                    {pendingSchedules}
                  </span>
                )}
              </Button>
            </div>
            <Button
              variant="default"
              className="w-full bg-neutro hover:bg-neutro/90 mt-2"
              onClick={() => handleNavigate("/collection/simple", { profileType: 'user' })}
            >
              <Package className="mr-2 h-5 w-5" />
              Solicitar Nova Coleta
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Definição das ações rápidas para o coletor individual
  if (userType === "individual_collector") {
    // Usar dados reais se disponíveis, senão usar fallback
    const pendingCount = profile?.stats?.scheduled_collections || 0;
    const isLinked = user?.companyAffiliation;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <Zap className="h-5 w-5 text-neutro" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button 
                variant="outline" 
                className="h-[48px] text-sm relative"
                onClick={() => {
                  setPendingSchedules(0);
                  handleNavigate(`/collector/schedule/${user?.id}`);
                }}
              >
                <ListTodo className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Agendamentos</span>
                {pendingSchedules > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {pendingSchedules}
                  </span>
                )}
              </Button>
              <Button 
                variant="outline" 
                className="h-[48px] text-sm"
                onClick={() => handleNavigate('/collector/recurring-schedules')}
              >
                <Clock className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Recorrentes</span>
              </Button>
              {!isLinked && (
                <Button 
                  variant="outline" 
                  className="h-[48px] text-sm"
                  onClick={() => handleNavigate('/collector/active-clients')}
                >
                  <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">Clientes Ativos</span>
                </Button>
              )}
              {isLinked && (
                <Button 
                  variant="outline" 
                  className="h-[48px] text-sm"
                  onClick={() => handleNavigate('/collector/active-clients')}
                >
                  <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">Meus Clientes</span>
                </Button>
              )}
              <Button 
                variant="outline" 
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate('/collector/settings')}
              >
                <Settings className="mr-2 h-4 w-4 flex-shrink-0" />
                Configurações
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-[48px] text-sm relative"
                onClick={() => handleNavigate('/collection-history', { userId: user?.id, userType: userType })}
              >
                <History className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Histórico de Coletas</span>
                {pendingCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {pendingCount}
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                className="h-[48px] text-sm"
                onClick={() => handleNavigate('/collector/sell-recyclables')}
              >
                <DollarSign className="mr-2 h-4 w-4 flex-shrink-0" />
                Vender Reciclado
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate("/user/referral")}
              >
                <UserPlus className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Indicações</span>
              </Button>
            </div>
            <Button
              variant="default"
              className="w-full h-[56px] bg-neutro hover:bg-neutro/90 text-base"
              onClick={() => handleNavigate("/collector/register-collection", { userType: 'cooperative_owner', user, userId: user?.id })}
            >
              <Package className="mr-2 h-5 w-5 flex-shrink-0" />
              <span className="whitespace-nowrap">Registrar Coleta</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Definição das ações rápidas para a cooperativa
  if (userType === "cooperative" || userType === "cooperative_owner") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <Zap className="h-5 w-5 text-neutro" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate("/financial-overview", { perfil: 'cooperativa' })}
              >
                <DollarSign className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Financeiro</span>
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate("/cooperative-settings", { userId: user?.id })}
              >
                <Settings className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Configurações</span>
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate("/cooperative-fleet")}
              >
                <Truck className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Gerenciar Frota</span>
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm relative"
                onClick={() => {
                  setPendingRequests(0);
                  handleNavigate("/cooperative/requests");
                }}
              >
                <ClipboardList className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Solicitações</span>
                {pendingRequests > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {pendingRequests}
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate("/cooperativa/equipe/novo")}
              >
                <UserPlus className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Novo Cooperado</span>
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate("/cooperative/sell-recyclables", { userType })}
              >
                <Handshake className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Registrar Venda</span>
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate("/cooperative/collections")}
              >
                <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Coletas</span>
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate('/collection-history', { userId: user?.id, userType: userType })}
              >
                <History className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Histórico de Coletas</span>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate("/user/referral")}
              >
                <UserPlus className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Indicações</span>
              </Button>
            </div>
            <Button
              variant="default"
              className="w-full h-[56px] bg-neutro hover:bg-neutro/90 text-base"
              onClick={() => handleNavigate("/collector/register-collection", { userType: 'cooperative_owner', user, userId: user?.id })}
            >
              <Package className="mr-2 h-5 w-5 flex-shrink-0" />
              <span className="whitespace-nowrap">Registrar Coleta</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Definição das ações rápidas para a empresa coletora
  if (userType === "collector_company_owner") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <Zap className="h-5 w-5 text-neutro" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate("/company-collectors")}
              >
                <Users className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Coletores</span>
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate("/company/team-members")}
              >
                <UserPlus className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Novo Funcionário</span>
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate("/company-fleet")}
              >
                <Truck className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Gerenciar Frota</span>
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate("/company/settings")}
              >
                <Settings className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Configurações</span>
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm relative"
                onClick={() => {
                  setPendingRequests(0);
                  handleNavigate("/company/requests");
                }}
              >
                <ClipboardList className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Solicitações</span>
                {pendingRequests > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {pendingRequests}
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate("/company/daily-collections")}
              >
                <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Coletas</span>
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate('/collection-history', { userId: user?.id, userType: userType })}
              >
                <History className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Histórico de Coletas</span>
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate("/user/referral")}
              >
                <UserPlus className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Indicações</span>
              </Button>
            </div>
            <Button
              variant="default"
              className="w-full h-[56px] bg-neutro hover:bg-neutro/90 text-base"
              onClick={() => handleNavigate("/company/buy-recyclables")}
            >
              <Package className="mr-2 h-5 w-5 flex-shrink-0" />
              <span className="whitespace-nowrap">Comprar Recicláveis</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Definição das ações rápidas para restaurante parceiro
  if (
    userType === "restaurant_partner" ||
    (userType === "partner_owner" && user?.entity?.type === "restaurant")
  ) {
    const partnerTypeForUrl = getPartnerTypeForUrl(userType, user?.entityType);
    const entityId = user?.entity?.id;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <Zap className="h-5 w-5 text-neutro" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate(`/collection/simple`, { profileType: 'partner', entityId, partnerType: partnerTypeForUrl })}
              >
                <Package className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Solicitar Coleta</span>
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate(`/collection/recurring`, { profileType: 'partner', entityId, partnerType: partnerTypeForUrl })}
              >
                <Clock className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Coleta Recorrente</span>
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate(`/collection-history`, { profileType: 'partner', entityId, partnerTypeForUrl: partnerTypeForUrl })}
              >
                <History className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Histórico de Coletas</span>
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate(`/parceiro/equipe/novo?type=${partnerTypeForUrl}`)}
              >
                <UserPlus className="mr-2 h-4 w-4 flex-shrink-0" />
                Novo Funcionário
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate(`/partner-settings?type=${partnerTypeForUrl}`)}
              >
                <Settings className="mr-2 h-4 w-4 flex-shrink-0" />
                Configurações
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate(`/partner/coupons-management?type=${partnerTypeForUrl}`)}
              >
                <Ticket className="mr-2 h-4 w-4 flex-shrink-0" />
                Gestão de Cupons
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate("/user/referral")}
              >
                <UserPlus className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Indicações</span>
              </Button>
            </div>
            <Button
              variant="default"
              className="w-full h-[56px] bg-neutro hover:bg-neutro/90 text-base"
              onClick={onValidateCoupon}
            >
              <QrCode className="mr-2 h-5 w-5 flex-shrink-0" />
              <span className="whitespace-nowrap">Validar Cupom</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Definição das ações rápidas para loja parceira
  if (
    userType === "store_partner" ||
    (userType === "partner_owner" && user?.entity?.type === "store")
  ) {
    const partnerTypeForUrl = getPartnerTypeForUrl(userType, user?.entityType);
    const entityId = user?.entity?.id;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <Zap className="h-5 w-5 text-neutro" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate(`/collection/simple`, { profileType: 'partner', entityId, partnerType: partnerTypeForUrl })}
              >
                <Package className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Solicitar Coleta</span>
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate(`/collection/recurring`, { profileType: 'partner', entityId, partnerType: partnerTypeForUrl })}
              >
                <Clock className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Coleta Recorrente</span>
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate(`/collection-history`, { profileType: 'partner', entityId, partnerTypeForUrl: partnerTypeForUrl })}
              >
                <History className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Histórico de Coletas</span>
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate(`/parceiro/equipe/novo?type=${partnerTypeForUrl}`)}
              >
                <UserPlus className="mr-2 h-4 w-4 flex-shrink-0" />
                Novo Funcionário
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate(`/partner-settings?type=${partnerTypeForUrl}`)}
              >
                <Settings className="mr-2 h-4 w-4 flex-shrink-0" />
                Configurações
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate(`/partner/coupons-management?type=${partnerTypeForUrl}`)}
              >
                <Ticket className="mr-2 h-4 w-4 flex-shrink-0" />
                Gestão de Cupons
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate("/user/referral")}
              >
                <UserPlus className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Indicações</span>
              </Button>
            </div>
            <Button
              variant="default"
              className="w-full h-[56px] bg-neutro hover:bg-neutro/90 text-base"
              onClick={onValidateCoupon}
            >
              <QrCode className="mr-2 h-5 w-5 flex-shrink-0" />
              <span className="whitespace-nowrap">Validar Cupom</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Definição das ações rápidas para parceiro educacional
  if (
    userType === "educational_partner" ||
    (userType === "partner_owner" && user?.entity?.type === "educational")
  ) {
    const partnerTypeForUrl = getPartnerTypeForUrl(userType, user?.entityType);
    const entityId = user?.entity?.id;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <Zap className="h-5 w-5 text-neutro" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate(`/collection/simple`, { profileType: 'partner', entityId, partnerType: partnerTypeForUrl })}
              >
                <Package className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Solicitar Coleta</span>
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate(`/collection/recurring`, { profileType: 'partner', entityId, partnerType: partnerTypeForUrl })}
              >
                <Clock className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Coleta Recorrente</span>
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate(`/collection-history`, { profileType: 'partner', entityId, partnerTypeForUrl: partnerTypeForUrl })}
              >
                <History className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Histórico de Coletas</span>
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate(`/parceiro/equipe/novo?type=${partnerTypeForUrl}`)}
              >
                <UserPlus className="mr-2 h-4 w-4 flex-shrink-0" />
                Novo Funcionário
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate(`/partner-settings?type=${partnerTypeForUrl}`)}
              >
                <Settings className="mr-2 h-4 w-4 flex-shrink-0" />
                Configurações
              </Button>
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate(`/partner/coupons-management?type=${partnerTypeForUrl}`)}
              >
                <Ticket className="mr-2 h-4 w-4 flex-shrink-0" />
                Gestão de Cupons
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full h-[48px] text-sm"
                onClick={() => handleNavigate("/user/referral")}
              >
                <UserPlus className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Indicações</span>
              </Button>
            </div>
            <Button
              variant="default"
              className="w-full h-[56px] bg-neutro hover:bg-neutro/90 text-base"
              onClick={onValidateCoupon}
            >
              <QrCode className="mr-2 h-5 w-5 flex-shrink-0" />
              <span className="whitespace-nowrap">Validar Cupom</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default StandardQuickActionCard; 