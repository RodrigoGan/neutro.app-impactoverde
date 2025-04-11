
import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, Bell } from 'lucide-react';
import Logo from './Logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

const AppHeader: React.FC = () => {
  const isMobile = useIsMobile();

  const navLinks = [
    { name: 'Início', path: '/' },
    { name: 'Calculadora', path: '/calculator' },
    { name: 'Agendamentos', path: '/schedule' },
    { name: 'Parceiros', path: '/partners' },
  ];

  const NavLinks = () => (
    <nav className="flex gap-6">
      {navLinks.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className="font-medium text-neutral-700 hover:text-neutro transition-colors"
        >
          {link.name}
        </Link>
      ))}
    </nav>
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
            <Button variant="ghost" size="icon" asChild>
              <Link to="/notifications">
                <Bell className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/profile">
                <User className="h-5 w-5" />
              </Link>
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-6 mt-8">
                  <NavLinks />
                  <div className="space-y-2">
                    <Button asChild className="w-full">
                      <Link to="/register">Cadastre-se</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/login">Entrar</Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <NavLinks />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/notifications">
                  <Bell className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/profile">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/login">Entrar</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Cadastre-se</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
