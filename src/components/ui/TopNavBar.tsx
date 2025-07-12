import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, UserCircle, Menu as MenuIcon } from 'lucide-react';
import Logo from '../Logo';
import { Button } from './button';
import { useAuth } from '@/contexts/AuthContext';

// Função utilitária para obter itens do menu conforme o perfil
function getMenuItems(userType: string | undefined) {
  switch (userType) {
    case 'common_user':
      return [
        { label: 'Início', to: '/dashboard/standard' },
        { label: 'Solicitar Coleta', to: '/collection/simple' },
        { label: 'Histórico', to: '/collection-history' },
        { label: 'Recorrentes', to: '/collection/recurring' },
        { label: 'Meus Cupons', to: '/user/coupons' },
        { label: 'Agendamentos Ativos', to: '/active-schedules' },
        { label: 'Indicações', to: '/user/referral' },
      ];
    case 'individual_collector':
      return [
        { label: 'Início', to: '/dashboard/standard' },
        { label: 'Agendamentos', to: '/collector/schedule' },
        { label: 'Recorrentes', to: '/collector/recurring-schedules' },
        { label: 'Clientes', to: '/collector/active-clients' },
        { label: 'Indicações', to: '/user/referral' },
      ];
    case 'cooperative_owner':
    case 'collector_company_owner':
    case 'partner_owner':
      return [
        { label: 'Início', to: '/dashboard/standard' },
        { label: 'Equipe', to: '/team' },
        { label: 'Cupons', to: '/partner/coupons/management' },
        { label: 'Validação de Cupom', to: '/partner/coupons/validate' },
        { label: 'Financeiro', to: '/financial' },
        { label: 'Indicações', to: '/user/referral' },
      ];
    default:
      return [
        { label: 'Início', to: '/dashboard/standard' },
        { label: 'Indicações', to: '/user/referral' },
      ];
  }
}

const TopNavBar: React.FC = () => {
  const { user } = useAuth();
  const userType = user?.type;
  const menuItems = getMenuItems(userType);

  // Função para obter rota de configurações conforme o tipo de usuário
  function getSettingsRoute(type: string | undefined) {
    switch (type) {
      case 'common_user': return '/user/profile';
      case 'individual_collector': return '/collector/settings';
      case 'cooperative':
      case 'cooperative_owner': return '/cooperative-settings';
      case 'collector_company_owner': return '/company/settings';
      case 'restaurant_partner':
      case 'partner_owner':
        // Verifica se é restaurante, loja ou educacional
        if (user?.entity?.type === 'restaurant' || type === 'restaurant_partner') return '/partner-settings?type=restaurant';
        if (user?.entity?.type === 'store') return '/partner-settings?type=store';
        if (user?.entity?.type === 'educational') return '/partner-settings?type=educational';
        return '/partner-settings?type=restaurant'; // fallback
      case 'store_partner': return '/partner-settings?type=store';
      case 'educational_partner': return '/partner-settings?type=educational';
      default: return '/user/profile';
    }
  }
  const settingsRoute = getSettingsRoute(userType);

  // Responsivo: menu hambúrguer (simplificado)
  const [open, setOpen] = React.useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/dashboard/standard" className="flex items-center gap-2">
          <Logo size="sm" showText={false} />
        </Link>
        {/* Menu Desktop */}
        <div className="hidden md:flex gap-4 items-center">
          {menuItems.map((item) => (
            <Link key={item.to} to={item.to} className="text-sm font-medium text-gray-700 hover:text-neutro transition-colors">
              {item.label}
            </Link>
          ))}
        </div>
        {/* Ações rápidas */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/notifications" aria-label="Notificações">
              <Bell className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to={settingsRoute} aria-label="Configurações">
              <UserCircle className="h-5 w-5" />
            </Link>
          </Button>
          {/* Menu Mobile */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)}>
            <MenuIcon className="h-6 w-6" />
          </Button>
        </div>
      </div>
      {/* Drawer Mobile */}
      {open && (
        <div className="md:hidden bg-white border-b shadow-sm">
          <div className="flex flex-col gap-2 p-4">
            {menuItems.map((item) => (
              <Link key={item.to} to={item.to} className="text-base font-medium text-gray-700 hover:text-neutro py-2" onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            <Link to="/notifications" className="text-base font-medium text-gray-700 hover:text-neutro py-2" onClick={() => setOpen(false)}>
              Notificações
            </Link>
            <Link to={settingsRoute} className="text-base font-medium text-gray-700 hover:text-neutro py-2" onClick={() => setOpen(false)}>
              Configurações
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default TopNavBar; 