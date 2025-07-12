import { UserProfile } from '@/types/user';

export const mockUserProfile: UserProfile = {
  id: '1',
  name: 'Maria Silva',
  email: 'maria.silva@email.com',
  cpf: '123.456.789-00',
  phone: '(11) 98765-4321',
  avatar: '/placeholder-avatar.jpg',
  level: 3,
  points: 750,
  nextLevelPoints: 1000,
  addresses: [
    {
      id: '1',
      street: 'Rua das Flores',
      number: '123',
      complement: 'Apto 42',
      neighborhood: 'Jardim Primavera',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      isMain: true
    },
    {
      id: '2',
      street: 'Avenida Principal',
      number: '456',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '04567-890',
      isMain: false
    }
  ],
  achievements: [
    {
      id: '1',
      title: 'Primeira Coleta',
      description: 'Realizou sua primeira coleta',
      icon: '🌱',
      unlockedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      title: 'Mestre da Reciclagem',
      description: 'Reciclou mais de 100kg de materiais',
      icon: '♻️',
      progress: 75
    }
  ],
  collectionSummary: {
    totalCollections: 15,
    completedCollections: 12,
    pendingCollections: 3,
    mostRecycledMaterials: [
      {
        material: 'Papel',
        quantity: 50,
        unit: 'kg'
      },
      {
        material: 'Plástico',
        quantity: 30,
        unit: 'kg'
      }
    ],
    environmentalImpact: {
      co2Saved: 75.5,
      waterSaved: 1500,
      energySaved: 250
    }
  },
  notificationPreferences: [
    {
      type: 'email',
      enabled: true,
      categories: {
        collections: true,
        achievements: true,
        promotions: false,
        system: true
      }
    },
    {
      type: 'push',
      enabled: true,
      categories: {
        collections: true,
        achievements: true,
        promotions: true,
        system: true
      }
    }
  ],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-03-15')
}; 