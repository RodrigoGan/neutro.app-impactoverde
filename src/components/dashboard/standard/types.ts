import { ReactNode } from 'react';

export interface Goal {
  id: string;
  title: string;
  description: string;
  currentProgress: number;
  total: number;
  points: number;
  icon: string;
}

export interface UserLevel {
  label: string;
  color?: string;
}

export interface MaintenanceRequirement {
  description: string;
  icon: string;
}

export interface Benefit {
  description: string;
  icon: string;
}

export interface GoalsProgressData {
  userLevel: {
    label: string;
    color: string;
  };
  currentPoints: number;
  nextLevelPoints: number;
  monthlyGoals: Goal[];
  maxLevelMessage?: string;
  maintenanceRequirements?: MaintenanceRequirement[];
  benefits?: Benefit[];
} 