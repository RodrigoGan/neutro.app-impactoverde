import { GoalsProgressData } from '../types';

export const commonUserGoalsProgress: GoalsProgressData = {
  userLevel: {
    label: 'Bronze',
    color: 'bg-amber-600'
  },
  currentPoints: 250,
  nextLevelPoints: 500,
  monthlyGoals: [
    {
      id: '1',
      title: 'Coletas Mensais',
      description: 'Realize 4 coletas este mês',
      currentProgress: 2,
      total: 4,
      points: 100,
      icon: 'Package'
    },
    {
      id: '2',
      title: 'Volume Reciclado',
      description: 'Recicle 10kg de materiais',
      currentProgress: 5,
      total: 10,
      points: 50,
      icon: 'Recycle'
    },
    {
      id: '3',
      title: 'Avaliações Concedidas',
      description: 'Avalie 4 coletas realizadas',
      currentProgress: 2,
      total: 4,
      points: 40,
      icon: 'Star'
    },
    {
      id: '4',
      title: 'Tempo na Plataforma',
      description: 'Mantenha 2 meses de atividade',
      currentProgress: 1,
      total: 2,
      points: 60,
      icon: 'Calendar'
    }
  ]
}; 