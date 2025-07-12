import { GoalsProgressData } from '../types';

export const cooperativeGoalsProgress: GoalsProgressData = {
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
      description: 'Realizar 16 coletas no mês',
      currentProgress: 16,
      total: 16,
      points: 0,
      icon: 'Package'
    },
    {
      id: '2',
      title: 'Volume Processado',
      description: 'Processar 501kg de materiais',
      currentProgress: 501,
      total: 501,
      points: 0,
      icon: 'Recycle'
    },
    {
      id: '3',
      title: 'Vendas Realizadas',
      description: 'Realizar 9 vendas no mês',
      currentProgress: 9,
      total: 9,
      points: 0,
      icon: 'DollarSign'
    },
    {
      id: '4',
      title: 'Tempo de Atividade',
      description: 'Manter 5 meses de atividade contínua',
      currentProgress: 5,
      total: 5,
      points: 0,
      icon: 'Clock'
    },
    {
      id: '5',
      title: 'Avaliação da Cooperativa',
      description: 'Manter avaliação acima de 4.5 estrelas',
      currentProgress: 4.8,
      total: 5,
      points: 0,
      icon: 'Star'
    }
  ],
  maxLevelMessage: 'Parabéns! Você alcançou o nível máximo',
  maintenanceRequirements: [
    {
      description: 'Manter 16 coletas por mês',
      icon: 'Package'
    },
    {
      description: 'Processar 501kg de materiais por mês',
      icon: 'Recycle'
    },
    {
      description: 'Realizar 9 vendas por mês',
      icon: 'DollarSign'
    },
    {
      description: 'Manter 5 meses de atividade',
      icon: 'Clock'
    },
    {
      description: 'Manter avaliação 4.5+',
      icon: 'Star'
    }
  ],
  benefits: [
    {
      description: 'Dashboard premium',
      icon: 'LayoutDashboard'
    },
    {
      description: 'Gestão completa de cooperados',
      icon: 'Users'
    },
    {
      description: 'Relatórios personalizados',
      icon: 'FileText'
    },
    {
      description: 'Suporte 24/7',
      icon: 'HeadsetIcon'
    }
  ]
}; 