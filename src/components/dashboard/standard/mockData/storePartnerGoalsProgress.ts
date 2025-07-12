import { GoalsProgressData } from '../types';

export const storePartnerGoalsProgress: GoalsProgressData = {
  userLevel: {
    label: 'Bronze',
    color: 'bronze'
  },
  currentPoints: 350,
  nextLevelPoints: 500,
  monthlyGoals: [
    {
      id: '1',
      title: 'Cupons Disponibilizados',
      description: 'Distribuir 10 cupons (Bronze)',
      currentProgress: 8,
      total: 10,
      points: 200,
      icon: 'Ticket'
    },
    {
      id: '2',
      title: 'Tempo de Atividade',
      description: 'Iniciar atividade no programa',
      currentProgress: 1,
      total: 3,
      points: 150,
      icon: 'Calendar'
    },
    {
      id: '3',
      title: 'Avaliações 5 Estrelas',
      description: 'Manter média acima de 4.5 estrelas',
      currentProgress: 4.6,
      total: 5,
      points: 100,
      icon: 'Star'
    },
    {
      id: '4',
      title: 'Funcionários Ativos',
      description: 'Manter 1 funcionário ativo (Bronze)',
      currentProgress: 1,
      total: 1,
      points: 50,
      icon: 'Users'
    }
  ]
}; 