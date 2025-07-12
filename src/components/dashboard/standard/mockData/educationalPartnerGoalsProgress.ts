import { GoalsProgressData } from '../types';

export const educationalPartnerGoalsProgress: GoalsProgressData = {
  userLevel: {
    label: 'Bronze',
    color: 'bronze'
  },
  currentPoints: 280,
  nextLevelPoints: 500,
  monthlyGoals: [
    {
      id: '1',
      title: 'Cupons Disponibilizados',
      description: 'Distribuir 10 cupons (Bronze)',
      currentProgress: 7,
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
      title: 'Alunos Impactados',
      description: 'Número de alunos participando do programa',
      currentProgress: 85,
      total: 100,
      points: 100,
      icon: 'Users'
    },
    {
      id: '4',
      title: 'Ações Educativas',
      description: 'Realizar ações de conscientização',
      currentProgress: 2,
      total: 3,
      points: 50,
      icon: 'BookOpen'
    }
  ],
  maxLevelMessage: 'Parabéns! Você alcançou o nível máximo',
  maintenanceRequirements: [
    {
      description: 'Distribuir 10 cupons por mês',
      icon: 'Ticket'
    },
    {
      description: 'Impactar 100 alunos por mês',
      icon: 'Users'
    },
    {
      description: 'Realizar 3 ações educativas por mês',
      icon: 'BookOpen'
    }
  ],
  benefits: [
    {
      description: 'Dashboard premium',
      icon: 'LayoutDashboard'
    },
    {
      description: 'Material educativo exclusivo',
      icon: 'BookOpen'
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