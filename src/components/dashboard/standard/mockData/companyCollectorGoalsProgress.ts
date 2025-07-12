import { GoalsProgressData } from '../types';

export const companyCollectorGoalsProgress: GoalsProgressData = {
  userLevel: {
    label: 'Ouro',
    color: 'bg-yellow-400'
  },
  currentPoints: 1000,
  nextLevelPoints: 1000,
  monthlyGoals: [
    {
      id: '1',
      title: 'Coletores Ativos',
      description: 'Manter 6 coletores ativos',
      currentProgress: 6,
      total: 6,
      points: 0,
      icon: 'Users'
    },
    {
      id: '2',
      title: 'Volume Coletado',
      description: 'Coletar 501kg de materiais',
      currentProgress: 501,
      total: 501,
      points: 0,
      icon: 'Recycle'
    },
    {
      id: '3',
      title: 'Vendas Registradas',
      description: 'Realizar 20 vendas no mês',
      currentProgress: 20,
      total: 20,
      points: 0,
      icon: 'DollarSign'
    },
    {
      id: '4',
      title: 'Tempo de Atividade',
      description: 'Manter 5 meses de atividade',
      currentProgress: 5,
      total: 5,
      points: 0,
      icon: 'Clock'
    }
  ],
  maxLevelMessage: 'Parabéns! Você alcançou o nível máximo',
  maintenanceRequirements: [
    {
      description: 'Manter 6 coletores ativos',
      icon: 'Users'
    },
    {
      description: 'Processar 501kg de materiais por mês',
      icon: 'Recycle'
    },
    {
      description: 'Realizar 20 vendas por mês',
      icon: 'DollarSign'
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
      description: 'Gestão completa de coletores',
      icon: 'Users'
    },
    {
      description: 'Relatórios personalizados',
      icon: 'FileText'
    },
    {
      description: 'Suporte 24/7',
      icon: 'HeadsetIcon'
    },
    {
      description: 'API de integração',
      icon: 'Code'
    }
  ]
}; 