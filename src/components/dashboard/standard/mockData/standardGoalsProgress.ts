import { GoalsProgressData } from '../types';

export const standardGoalsProgress: GoalsProgressData = {
  userLevel: {
    label: 'Bronze',
    color: 'bg-amber-600'
  },
  currentPoints: 300,
  nextLevelPoints: 500,
  monthlyGoals: [
    {
      id: 'std-1',
      title: 'Solicitações de Coleta',
      description: 'Solicite 3 coletas de recicláveis este mês',
      currentProgress: 1,
      total: 3,
      points: 100,
      icon: 'Recycle'
    },
    {
      id: 'std-2',
      title: 'Avaliações de Coletor',
      description: 'Avalie 2 coletores após coleta',
      currentProgress: 0,
      total: 2,
      points: 60,
      icon: 'Star'
    },
    {
      id: 'std-3',
      title: 'Indicações de Amigos',
      description: 'Indique 1 novo amigo para a plataforma',
      currentProgress: 0,
      total: 1,
      points: 80,
      icon: 'Users'
    },
    {
      id: 'std-4',
      title: 'Participação em Campanhas',
      description: 'Participe de 1 campanha ou sorteio do mês',
      currentProgress: 0,
      total: 1,
      points: 50,
      icon: 'Award'
    }
  ],
  maxLevelMessage: 'Parabéns! Você alcançou o nível máximo',
  maintenanceRequirements: [
    {
      description: 'Realizar 10 descartes por mês',
      icon: 'Package'
    },
    {
      description: 'Reciclar 30kg de materiais por mês',
      icon: 'Scale'
    },
    {
      description: 'Manter avaliação média 4.5+',
      icon: 'ThumbsUp'
    }
  ],
  benefits: [
    {
      description: 'Acesso a cupons premium',
      icon: 'Ticket'
    },
    {
      description: 'Prioridade nos agendamentos',
      icon: 'Clock'
    },
    {
      description: 'Suporte dedicado',
      icon: 'HeadsetIcon'
    }
  ]
}; 