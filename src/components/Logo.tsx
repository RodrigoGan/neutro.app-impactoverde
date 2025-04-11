
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
    lg: 'w-20 h-20',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const sloganSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="flex items-center">
        <div className={`relative ${sizes[size]}`}>
          <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="400" height="400" fill="#a6cf45" />
            <path
              d="M320 200 C 300 100, 200 80, 150 120 C 100 160, 100 240, 150 280 C 200 320, 300 300, 320 200 Z"
              fill="#fff"
            />
            <path
              d="M250 200 C 240 160, 200 160, 180 180 C 160 200, 160 240, 180 260 C 200 280, 240 240, 250 200 Z"
              fill="#a6cf45"
            />
          </svg>
        </div>
        {showText && (
          <div className={`ml-2 font-philosopher font-bold ${textSizes[size]} text-neutro-dark`}>
            NEUTRO
          </div>
        )}
      </div>
      {showSlogan && (
        <div className={`mt-1 text-center font-philosopher ${sloganSizes[size]} text-neutral-600`}>
          Pequenos Gestos, Grandes Impactos
        </div>
      )}
    </div>
  );
};

export default Logo;
