import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ className = '' }) => {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      className={`flex items-center gap-2 mb-4 ${className}`}
      onClick={() => navigate(-1)}
    >
      <ArrowLeft className="h-4 w-4" />
      Voltar
    </Button>
  );
}; 