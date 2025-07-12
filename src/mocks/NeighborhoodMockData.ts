import { NeighborhoodNotificationService } from '@/services/NeighborhoodNotificationService';

// Mock de usuários por bairro
const mockUsers = [
  {
    id: '1',
    userType: 'common_user' as const,
    neighborhoodId: '1',
    notificationPreferences: {
      email: true,
      push: true,
      sms: false
    }
  },
  {
    id: '2',
    userType: 'common_user' as const,
    neighborhoodId: '1',
    notificationPreferences: {
      email: false,
      push: true,
      sms: true
    }
  },
  {
    id: '3',
    userType: 'common_user' as const,
    neighborhoodId: '2',
    notificationPreferences: {
      email: true,
      push: false,
      sms: true
    }
  }
];

// Mock de horários de coleta
const mockSchedules = [
  {
    id: '1',
    collectorId: '1',
    neighborhoodId: '1',
    date: '2024-06-11',
    period: 'tarde' as const,
    status: 'disponivel' as const
  },
  {
    id: '2',
    collectorId: '1',
    neighborhoodId: '2',
    date: '2024-06-12',
    period: 'manha' as const,
    status: 'disponivel' as const
  }
];

// Mock de informações de bairros
const mockNeighborhoods = [
  {
    id: '1',
    name: 'Jardim América'
  },
  {
    id: '2',
    name: 'Vila Nova'
  }
];

// Mock de informações de coletores
const mockCollectors = [
  {
    id: '1',
    name: 'João Silva',
    rating: 4.8
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    rating: 4.9
  }
];

// Função para inicializar o serviço com dados mock
export const initializeNeighborhoodNotificationService = () => {
  const service = NeighborhoodNotificationService.getInstance();

  // Registra os usuários
  mockUsers.forEach(user => {
    service.registerUser(user);
  });

  // Registra os horários
  mockSchedules.forEach(schedule => {
    service.registerSchedule(schedule);
  });

  return {
    service,
    mockUsers,
    mockSchedules,
    mockNeighborhoods,
    mockCollectors
  };
}; 