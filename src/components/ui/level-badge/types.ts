import { Level } from '@/components/levels/types';

export interface LevelBadgeProps {
  level: Level;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  progress?: number;
  variant?: 'solid' | 'outline';
  className?: string;
}

export interface LevelConfig {
  color: string;
  hoverColor: string;
  textColor: string;
  icon: string;
  label: string;
} 