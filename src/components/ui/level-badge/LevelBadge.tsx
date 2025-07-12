import React from 'react';
import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';
import { LevelBadgeProps, LevelConfig } from './types';

const levelConfigs: Record<string, LevelConfig> = {
  bronze: {
    color: 'bg-amber-600',
    hoverColor: 'hover:bg-amber-700',
    textColor: 'text-amber-600',
    icon: '🥉',
    label: 'Bronze'
  },
  silver: {
    color: 'bg-gray-400',
    hoverColor: 'hover:bg-gray-500',
    textColor: 'text-gray-400',
    icon: '🥈',
    label: 'Prata'
  },
  gold: {
    color: 'bg-yellow-500',
    hoverColor: 'hover:bg-yellow-600',
    textColor: 'text-yellow-500',
    icon: '🥇',
    label: 'Ouro'
  }
};

const sizeClasses = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1.5',
  lg: 'text-base px-4 py-2'
};

export const LevelBadge: React.FC<LevelBadgeProps> = ({
  level,
  showIcon = true,
  size = 'md',
  showLabel = true,
  progress,
  variant = 'solid',
  className
}) => {
  const config = levelConfigs[level];
  
  if (!config) return null;

  const baseClasses = cn(
    'inline-flex items-center gap-1.5 font-medium rounded-full transition-colors',
    sizeClasses[size],
    variant === 'solid' ? [
      config.color,
      config.hoverColor,
      'text-white'
    ] : [
      'border',
      `border-${level}`,
      'bg-white',
      config.textColor
    ],
    className
  );

  return (
    <div className="relative">
      <div className={baseClasses}>
        {showIcon && (
          <span className="flex items-center">
            {config.icon}
          </span>
        )}
        {showLabel && (
          <span>{config.label}</span>
        )}
      </div>
      {typeof progress === 'number' && (
        <div className="absolute -bottom-1 left-0 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all", config.color)}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
}; 