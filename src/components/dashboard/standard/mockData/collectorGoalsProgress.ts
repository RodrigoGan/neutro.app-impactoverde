import { GoalsProgressData } from '../types';

// Dados para coletor individual sem vínculo
export const independentCollectorGoalsProgress: GoalsProgressData = {
  userLevel: {
    label: 'Bronze',
    color: 'bg-amber-600'
  },
  currentPoints: 300,
  nextLevelPoints: 500,
  monthlyGoals: [
    {
      id: '1',
      title: 'Coletas Realizadas',
      description: 'Realize 8 coletas este mês',
      currentProgress: 5,
      total: 8,
      points: 160,
      icon: 'Package'
    },
    {
      id: '2',
      title: 'Volume Coletado',
      description: 'Colete 20kg de materiais',
      currentProgress: 12,
      total: 20,
      points: 100,
      icon: 'Recycle'
    },
    {
      id: '3',
      title: 'Avaliações Realizadas',
      description: 'Avalie 7 coletas realizadas',
      currentProgress: 4,
      total: 7,
      points: 70,
      icon: 'Star'
    },
    {
      id: '4',
      title: 'Tempo na Plataforma',
      description: 'Mantenha 2 meses de atividade',
      currentProgress: 1,
      total: 2,
      points: 100,
      icon: 'Calendar'
    }
  ]
};

// Dados para coletor individual com vínculo
export const linkedCollectorGoalsProgress: GoalsProgressData = {
  userLevel: {
    label: 'Ouro',
    color: 'bg-yellow-400'
  },
  currentPoints: 1000,
  nextLevelPoints: 1000,
  monthlyGoals: [
    {
      id: '1',
      title: 'Coletas Realizadas',
      description: 'Realize 16 coletas este mês',
      currentProgress: 16,
      total: 16,
      points: 0,
      icon: 'Package'
    },
    {
      id: '2',
      title: 'Volume Coletado',
      description: 'Colete 41kg de materiais',
      currentProgress: 41,
      total: 41,
      points: 0,
      icon: 'Recycle'
    },
    {
      id: '3',
      title: 'Avaliações Realizadas',
      description: 'Avalie 13 coletas realizadas',
      currentProgress: 13,
      total: 13,
      points: 0,
      icon: 'Star'
    },
    {
      id: '4',
      title: 'Tempo na Plataforma',
      description: 'Mantenha 5 meses de atividade',
      currentProgress: 5,
      total: 5,
      points: 0,
      icon: 'Calendar'
    }
  ],
  maxLevelMessage: 'Parabéns! Você alcançou o nível máximo',
  maintenanceRequirements: [
    {
      description: 'Realizar 16 coletas por mês',
      icon: 'Package'
    },
    {
      description: 'Coletar 41kg de materiais por mês',
      icon: 'Recycle'
    },
    {
      description: 'Manter avaliação 4.5+',
      icon: 'Star'
    },
    {
      description: 'Manter 5 meses de atividade',
      icon: 'Clock'
    }
  ],
  benefits: [
    {
      description: 'Dashboard premium',
      icon: 'LayoutDashboard'
    },
    {
      description: 'Acesso a rotas otimizadas',
      icon: 'Map'
    },
    {
      description: 'Relatórios personalizados',
      icon: 'FileText'
    },
    {
      description: 'Suporte prioritário',
      icon: 'HeadsetIcon'
    }
  ]
}; 