
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
              d="M366.9,350.72c0-98-75.66-188.34-167.45-188.34h-2.42c8.07,3.22,27.12,15.38,45.93,47.34,22.13,37.64,25.69,74.9,25.69,140.92l98.25.08Z"
              fill="#fff"
            />
            <path
              d="M268.68,350.72c0-98-57.75-127.11-72.41-127.11h-.1c5.37,8.86,22.41,45.6,22.41,127.06l50.11.05Z"
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
