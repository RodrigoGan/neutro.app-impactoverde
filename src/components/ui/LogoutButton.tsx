import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const LogoutButton: React.FC<{ className?: string }> = ({ className }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Button
      variant="outline"
      className={className}
      onClick={handleLogout}
      title="Sair da conta"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Sair
    </Button>
  );
};

export default LogoutButton; 