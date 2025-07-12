import { GoalsProgressData } from '../types';

export const restaurantPartnerGoalsProgress: GoalsProgressData = {
  userLevel: {
    label: 'Prata',
    color: 'bg-gray-400'
  },
  currentPoints: 500,
  nextLevelPoints: 1000,
  monthlyGoals: [
    {
      id: '1',
      title: 'Cupons Disponibilizados',
      description: 'Distribuir 30 cupons (Prata)',
      currentProgress: 25,
      total: 30,
      points: 500,
      icon: 'Ticket'
    },
    {
      id: '2',
      title: 'Tempo de Atividade',
      description: 'Manter 3 meses de atividade (Prata)',
      currentProgress: 2,
      total: 3,
      points: 300,
      icon: 'Calendar'
    },
    {
      id: '3',
      title: 'Avaliações 5 Estrelas',
      description: 'Manter média acima de 4.5 estrelas',
      currentProgress: 4.7,
      total: 5,
      points: 200,
      icon: 'Star'
    },
    {
      id: '4',
      title: 'Funcionários Ativos',
      description: 'Manter até 3 funcionários ativos (Prata)',
      currentProgress: 2,
      total: 3,
      points: 200,
      icon: 'Users'
    }
  ],
  maxLevelMessage: 'Parabéns! Você alcançou o nível máximo',
  maintenanceRequirements: [
    { description: 'Distribuir 30 cupons por mês', icon: 'Ticket' },
    { description: 'Manter média acima de 4.5 estrelas', icon: 'Star' },
    { description: 'Manter 3 meses de atividade', icon: 'Calendar' }
  ],
  benefits: [
    { description: 'Dashboard premium', icon: 'LayoutDashboard' },
    { description: 'Relatórios personalizados', icon: 'FileText' },
    { description: 'Suporte prioritário', icon: 'HeadsetIcon' }
  ]
}; 