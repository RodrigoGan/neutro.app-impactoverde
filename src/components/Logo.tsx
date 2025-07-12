import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showSlogan?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  showText = true, 
  size = 'md',
  showSlogan = false
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-32 h-32',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-5xl',
  };

  const sloganSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="flex items-center justify-center">
        <div className={`relative ${sizes[size]}`}>
          <img 
            src="/Neutro Logo.png" 
            alt="Neutro Logo"
            className="w-full h-full object-contain"
          />
        </div>
        {showText && (
          <div className={`ml-4 font-philosopher font-bold ${textSizes[size]} text-neutro-dark`}>
            NEUTRO
          </div>
        )}
      </div>
      {showSlogan && (
        <div className={`mt-4 text-center font-philosopher ${sloganSizes[size]} text-neutral-600`}>
          Pequenos Gestos, Grandes Impactos
        </div>
      )}
    </div>
  );
};

export default Logo;
