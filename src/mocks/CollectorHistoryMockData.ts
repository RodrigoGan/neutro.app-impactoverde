import { HistoryCollection } from '@/pages/collector/CollectorHistory';

// Dados mockados para coletor independente
export const independentCollectorHistory: HistoryCollection[] = [
  {
    id: 1,
    date: new Date(2024, 3, 17),
    time: "09:00",
    address: "Rua das Flores, 123",
    neighborhood: "Jardim Primavera",
    city: "São Paulo",
    state: "SP",
    materials: [
      { type: "Papelão", quantity: "3", unit: "sacos", fotos: [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80'
      ] },
      { type: "Plástico", quantity: "2", unit: "kg", fotos: [
        'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80'
      ] }
    ],
    status: "collected",
    tipoColeta: "agendada",
    solicitante: {
      nome: "Maria Silva",
      foto: "https://github.com/shadcn.png",
      telefone: "(11) 98765-4321",
      avaliacaoMedia: 4.5,
      totalColetas: 15,
      verificado: true
    },
    coletor: {
      nome: "João Coletor",
      foto: "https://github.com/shadcn.png",
      telefone: "(11) 91234-5678",
      avaliacaoMedia: 4.8,
      totalColetas: 120,
      verificado: true,
      modalidadeTransporte: "Bicicleta"
    }
  },
  {
    id: 2,
    date: new Date(2024, 3, 16),
    time: "14:30",
    address: "Avenida Principal, 456",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    materials: [
      { type: "Vidro", quantity: "5", unit: "kg", fotos: [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'
      ] }
    ],
    status: "cancelled",
    tipoColeta: "agendada",
    cancellationReason: "Local Fechado",
    solicitante: {
      nome: "João Santos",
      foto: "https://github.com/shadcn.png",
      telefone: "(11) 91234-5678",
      avaliacaoMedia: 4.8,
      totalColetas: 8,
      verificado: true
    },
    coletor: {
      nome: "João Coletor",
      foto: "https://github.com/shadcn.png",
      telefone: "(11) 91234-5678",
      avaliacaoMedia: 4.8,
      totalColetas: 120,
      verificado: true,
      modalidadeTransporte: "Bicicleta"
    }
  },
  // Nova coleta manual
  {
    id: 3,
    date: new Date(2024, 3, 15),
    time: "15:00",
    address: "Rua da Coleta Manual, 789",
    neighborhood: "Vila Nova",
    city: "São Paulo",
    state: "SP",
    materials: [
      { type: "Papel", quantity: "10", unit: "kg", fotos: [] },
      { type: "Plástico", quantity: "5", unit: "kg", fotos: [] }
    ],
    status: "collected",
    tipoColeta: "manual",
    nomeCliente: "Coleta de Rua",
    coletor: {
      nome: "João Coletor",
      foto: "https://github.com/shadcn.png",
      telefone: "(11) 91234-5678",
      avaliacaoMedia: 4.8,
      totalColetas: 120,
      verificado: true,
      modalidadeTransporte: "Bicicleta"
    }
  }
];

// Dados mockados para coletor vinculado a empresa
export const linkedCollectorHistory: HistoryCollection[] = [
  {
    id: 1,
    date: new Date(2024, 3, 17),
    time: "09:00",
    address: "Rua das Flores, 123",
    neighborhood: "Jardim Primavera",
    city: "São Paulo",
    state: "SP",
    materials: [
      { type: "Papelão", quantity: "3", unit: "sacos", fotos: [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80'
      ] },
      { type: "Plástico", quantity: "2", unit: "kg", fotos: [
        'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80'
      ] }
    ],
    status: "collected",
    solicitante: {
      nome: "Maria Silva",
      foto: "https://github.com/shadcn.png",
      telefone: "(11) 98765-4321",
      avaliacaoMedia: 4.5,
      totalColetas: 15,
      verificado: true
    },
    coletor: {
      nome: "João Coletor",
      foto: "https://github.com/shadcn.png",
      telefone: "(11) 91234-5678",
      avaliacaoMedia: 4.8,
      totalColetas: 120,
      verificado: true,
      modalidadeTransporte: "Carro"
    }
  },
  {
    id: 2,
    date: new Date(2024, 3, 16),
    time: "14:30",
    address: "Avenida Principal, 456",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    materials: [
      { type: "Vidro", quantity: "5", unit: "kg", fotos: [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'
      ] }
    ],
    status: "cancelled",
    cancellationReason: "Local Fechado",
    solicitante: {
      nome: "João Santos",
      foto: "https://github.com/shadcn.png",
      telefone: "(11) 91234-5678",
      avaliacaoMedia: 4.8,
      totalColetas: 8,
      verificado: true
    },
    coletor: {
      nome: "João Coletor",
      foto: "https://github.com/shadcn.png",
      telefone: "(11) 91234-5678",
      avaliacaoMedia: 4.8,
      totalColetas: 120,
      verificado: true,
      modalidadeTransporte: "Carro"
    }
  }
];

// Dados mockados para coletor vinculado a cooperativa
export const cooperativeCollectorHistory: HistoryCollection[] = [
  {
    id: 1,
    date: new Date(2024, 3, 17),
    time: "09:00",
    address: "Rua das Flores, 123",
    neighborhood: "Jardim Primavera",
    city: "São Paulo",
    state: "SP",
    materials: [
      { type: "Papelão", quantity: "3", unit: "sacos", fotos: [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80'
      ] },
      { type: "Plástico", quantity: "2", unit: "kg", fotos: [
        'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80'
      ] }
    ],
    status: "collected",
    solicitante: {
      nome: "Maria Silva",
      foto: "https://github.com/shadcn.png",
      telefone: "(11) 98765-4321",
      avaliacaoMedia: 4.5,
      totalColetas: 15,
      verificado: true
    },
    coletor: {
      nome: "João Coletor",
      foto: "https://github.com/shadcn.png",
      telefone: "(11) 91234-5678",
      avaliacaoMedia: 4.8,
      totalColetas: 120,
      verificado: true,
      modalidadeTransporte: "A pé"
    }
  },
  {
    id: 2,
    date: new Date(2024, 3, 16),
    time: "14:30",
    address: "Avenida Principal, 456",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    materials: [
      { type: "Vidro", quantity: "5", unit: "kg", fotos: [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'
      ] }
    ],
    status: "cancelled",
    cancellationReason: "Local Fechado",
    solicitante: {
      nome: "João Santos",
      foto: "https://github.com/shadcn.png",
      telefone: "(11) 91234-5678",
      avaliacaoMedia: 4.8,
      totalColetas: 8,
      verificado: true
    },
    coletor: {
      nome: "João Coletor",
      foto: "https://github.com/shadcn.png",
      telefone: "(11) 91234-5678",
      avaliacaoMedia: 4.8,
      totalColetas: 120,
      verificado: true,
      modalidadeTransporte: "A pé"
    }
  }
]; 