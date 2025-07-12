import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Bell } from 'lucide-react';
import Logo from './Logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const AppHeader: React.FC = () => {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();

  const navLinks = [
    { name: 'Início', path: '/' },
    { name: 'Calculadora', path: '/calculator' },
    { name: 'Níveis', path: '/levels' },
    { name: 'Agendamentos', path: '/schedule' },
    { name: 'Parceiros', path: '/partners' },
  ];

  const actionButtons = [
    { name: 'Entrar', path: '/login', variant: 'outline' as const },
    { name: 'Cadastre-se', path: '/register', variant: 'default' as const }
  ];

  const NavLinks = () => (
    <nav className="flex gap-6">
      {navLinks.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className={cn(
            "font-medium transition-colors",
            pathname === link.path 
              ? "text-neutro" 
              : "text-neutral-700 hover:text-neutro"
          )}
          aria-current={pathname === link.path ? "page" : undefined}
        >
          {link.name}
        </Link>
      ))}
    </nav>
  );

  const ActionButtons = () => (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" asChild>
        <Link to="/notifications" aria-label="Notificações">
          <Bell className="h-5 w-5" />
        </Link>
      </Button>
      <Button variant="ghost" size="icon" asChild>
        <Link to="/profile" aria-label="Perfil">
          <User className="h-5 w-5" />
        </Link>
      </Button>
      {actionButtons.map((button) => (
        <Button key={button.path} variant={button.variant} asChild>
          <Link to={button.path}>{button.name}</Link>
        </Button>
      ))}
    </div>
  );

  return (
    <header className="w-full border-b bg-white/80 backdrop-blur-md sticky top-0 z-40">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link to="/">
            <Logo size={isMobile ? 'sm' : 'md'} />
          </Link>
        </div>

        {isMobile ? (
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-6 mt-8">
                  <NavLinks />
                  <div className="space-y-2">
                    {actionButtons.map((button) => (
                      <Button key={button.path} variant={button.variant} className="w-full" asChild>
                        <Link to={button.path}>{button.name}</Link>
                      </Button>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/notifications" aria-label="Notificações">
                <Bell className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/profile" aria-label="Perfil">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <NavLinks />
            <ActionButtons />
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
