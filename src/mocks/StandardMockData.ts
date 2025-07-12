import { 
  User, 
  Building2, 
  Users, 
  Package, 
  Calendar, 
  Star, 
  Ticket, 
  Leaf, 
  DollarSign,
  Award,
  Clock,
  MapPin,
  BarChart,
  Target,
  Trophy,
  Utensils,
  ShoppingBag,
  GraduationCap,
  Book
} from 'lucide-react';

// Tipos de usuário
export type StandardUserType = 
  | 'common_user'
  | 'individual_collector'
  | 'cooperative_owner'
  | 'collector_company_owner'
  | 'partner_owner';

// Tipos de entidade
export type StandardEntityType = 
  | 'cooperative'
  | 'collector_company'
  | 'restaurant'
  | 'store'
  | 'educational';

// Interface para usuário padrão
export interface StandardUser {
  id: number;
  name: string;
  avatar?: {
    src?: string;
    fallback: string;
  };
  level?: {
    value: number;
    label: string;
    color?: string;
  };
  userType: StandardUserType;
  stats?: Array<{
    icon: string;
    value: string | number;
    label: string;
  }>;
}

// Interface para coletor individual
export interface StandardCollector extends StandardUser {
  collectorMetrics: {
    totalCollected: string;
    rating: number;
    coverageAreas: string[];
    activeSince: string;
  };
  companyAffiliation?: {
    companyId: number;
    companyName: string;
    since: string;
    role: string;
  };
  cep?: string;
}

// Interface para entidade
export interface StandardEntity {
  id: number;
  name: string;
  type: StandardEntityType;
  avatar?: {
    src?: string;
    fallback: string;
  };
  isVerified: boolean;
  metrics: {
    totalUsers?: number;
    totalCollected?: string;
    rating?: number;
    activeSince?: string;
    monthlyVolume?: string;
    activePrograms?: number;
    customersPerMonth?: number;
    wastePrevented?: string;
    activeCoupons?: number;
    studentsImpacted?: number;
  };
  cep?: string;
}

// Dados mockados para usuários
export const standardUsers: Record<number, StandardUser | StandardCollector> = {
  // 1. Usuário Comum
  1: {
    id: 1,
    name: 'Maria Silva',
    avatar: {
      fallback: 'MS'
    },
    level: {
      value: 3,
      label: 'Bronze'
    },
    userType: 'common_user',
    stats: [
      {
        icon: 'Package',
        value: '450kg',
        label: 'Total Reciclado'
      },
      {
        icon: 'Star',
        value: 4.7,
        label: 'Avaliação'
      },
      {
        icon: 'Calendar',
        value: '3',
        label: 'Coletas Agendadas'
      },
      {
        icon: 'Ticket',
        value: '5',
        label: 'Cupons Disponíveis'
      }
    ]
  },

  // 2. Coletor Individual com Vínculo
  2: {
    id: 2,
    name: 'João Santos',
    avatar: {
      fallback: 'JS'
    },
    level: {
      value: 5,
      label: 'Ouro'
    },
    userType: 'individual_collector',
    collectorMetrics: {
      totalCollected: '2.5t',
      rating: 4.8,
      coverageAreas: ['Centro', 'Zona Sul'],
      activeSince: '2022-01-15'
    },
    companyAffiliation: {
      companyId: 102,
      companyName: 'Recicla Mais',
      since: '2022-03-01',
      role: 'Coletor Sênior'
    }
  },

  // 3. Coletor Individual sem Vínculo
  3: {
    id: 3,
    name: 'Maria Oliveira',
    avatar: {
      fallback: 'MO'
    },
    level: {
      value: 4,
      label: 'Prata'
    },
    userType: 'individual_collector',
    collectorMetrics: {
      totalCollected: '1.8t',
      rating: 4.9,
      coverageAreas: ['Zona Norte', 'Zona Leste', 'Zona Oeste'],
      activeSince: '2021-11-20'
    },
    cep: '01001-000'
  },

  // 4. Cooperativa + Presidente
  4: {
    id: 4,
    name: 'Carlos Mendes',
    avatar: {
      fallback: 'CM'
    },
    level: {
      value: 6,
      label: 'Ouro'
    },
    userType: 'cooperative_owner',
    stats: [
      {
        icon: 'Users',
        value: '45',
        label: 'Cooperados'
      },
      {
        icon: 'Star',
        value: 4.8,
        label: 'Avaliação'
      },
      {
        icon: 'Package',
        value: '15.2t',
        label: 'Volume Mensal'
      },
      {
        icon: 'Calendar',
        value: '3 anos',
        label: 'Na Plataforma'
      }
    ]
  },

  // 5. Empresa Coletora + Proprietário
  5: {
    id: 5,
    name: 'Ana Costa',
    avatar: {
      fallback: 'AC'
    },
    level: {
      value: 7,
      label: 'Ouro'
    },
    userType: 'collector_company_owner',
    stats: [
      {
        icon: 'Users',
        value: '35',
        label: 'Coletores'
      },
      {
        icon: 'Star',
        value: 4.9,
        label: 'Avaliação'
      },
      {
        icon: 'Package',
        value: '25.5t',
        label: 'Volume Mensal'
      },
      {
        icon: 'Calendar',
        value: '2 anos',
        label: 'Na Plataforma'
      }
    ]
  },

  // 6. Restaurante + Proprietário
  6: {
    id: 6,
    name: 'Roberto Almeida',
    avatar: {
      fallback: 'RA'
    },
    level: {
      value: 5,
      label: 'Ouro'
    },
    userType: 'partner_owner',
    stats: [
      {
        icon: 'Users',
        value: '1500',
        label: 'Clientes/Mês'
      },
      {
        icon: 'Leaf',
        value: '450kg',
        label: 'Desperdício Evitado'
      },
      {
        icon: 'Ticket',
        value: '15',
        label: 'Cupons Ativos'
      },
      {
        icon: 'Star',
        value: 4.8,
        label: 'Avaliação'
      }
    ]
  },

  // 7. Loja + Proprietário
  7: {
    id: 7,
    name: 'Patrícia Lima',
    avatar: {
      fallback: 'PL'
    },
    level: {
      value: 4,
      label: 'Prata'
    },
    userType: 'partner_owner',
    stats: [
      {
        icon: 'Users',
        value: '2500',
        label: 'Clientes/Mês'
      },
      {
        icon: 'Package',
        value: '1200kg',
        label: 'Embalagens Recicladas'
      },
      {
        icon: 'Ticket',
        value: '25',
        label: 'Cupons Ativos'
      },
      {
        icon: 'Star',
        value: 4.6,
        label: 'Avaliação'
      }
    ]
  },

  // 8. Educacional + Proprietário
  8: {
    id: 8,
    name: 'Fernando Santos',
    avatar: {
      fallback: 'FS'
    },
    level: {
      value: 5,
      label: 'Ouro'
    },
    userType: 'partner_owner',
    stats: [
      {
        icon: 'Users',
        value: '500',
        label: 'Alunos Impactados'
      },
      {
        icon: 'Book',
        value: '3',
        label: 'Programas Ativos'
      },
      {
        icon: 'Ticket',
        value: '10',
        label: 'Cupons Ativos'
      },
      {
        icon: 'Star',
        value: 4.9,
        label: 'Avaliação'
      }
    ]
  }
};

// Dados mockados para entidades
export const standardEntities: Record<number, StandardEntity> = {
  // Cooperativa
  101: {
    id: 101,
    name: 'Cooperativa Recicla Verde',
    type: 'cooperative',
    avatar: {
      fallback: 'CRV'
    },
    isVerified: true,
    metrics: {
      totalUsers: 45,
      totalCollected: '15.2t',
      rating: 4.8,
      activeSince: '2020-01-15',
      monthlyVolume: '15.2t'
    }
  },

  // Empresa Coletora
  102: {
    id: 102,
    name: 'Recicla Mais',
    type: 'collector_company',
    avatar: {
      fallback: 'RM'
    },
    isVerified: true,
    metrics: {
      totalUsers: 35,
      totalCollected: '25.5t',
      rating: 4.9,
      activeSince: '2021-03-01',
      monthlyVolume: '25.5t'
    },
    cep: '01001-002'
  },

  // Empresa Coletora
  106: {
    id: 106,
    name: 'Eco Coleta',
    type: 'collector_company',
    avatar: {
      fallback: 'EC'
    },
    isVerified: true,
    metrics: {
      totalUsers: 20,
      totalCollected: '10.1t',
      rating: 4.7,
      activeSince: '2022-01-10',
      monthlyVolume: '10.1t'
    },
    cep: '01001-001'
  },

  // Empresa Coletora
  107: {
    id: 107,
    name: 'Verde Limpo',
    type: 'collector_company',
    avatar: {
      fallback: 'VL'
    },
    isVerified: true,
    metrics: {
      totalUsers: 15,
      totalCollected: '7.8t',
      rating: 4.6,
      activeSince: '2023-02-20',
      monthlyVolume: '7.8t'
    },
    cep: '01001-003'
  },

  // Restaurante
  103: {
    id: 103,
    name: 'Restaurante Sabor Natural',
    type: 'restaurant',
    avatar: {
      fallback: 'RSN'
    },
    isVerified: true,
    metrics: {
      customersPerMonth: 1500,
      wastePrevented: '450kg',
      rating: 4.8,
      activeSince: '2021-06-15',
      activeCoupons: 15
    }
  },

  // Loja
  104: {
    id: 104,
    name: 'Supermercado Verde',
    type: 'store',
    avatar: {
      fallback: 'SV'
    },
    isVerified: true,
    metrics: {
      customersPerMonth: 2500,
      wastePrevented: '1200kg',
      rating: 4.6,
      activeSince: '2021-09-20',
      activeCoupons: 25
    }
  },

  // Educacional
  105: {
    id: 105,
    name: 'Escola Sustentável',
    type: 'educational',
    avatar: {
      fallback: 'ES'
    },
    isVerified: true,
    metrics: {
      studentsImpacted: 500,
      activePrograms: 3,
      rating: 4.9,
      activeSince: '2021-12-01',
      activeCoupons: 10
    }
  }
};

// Configuração de métricas por tipo de usuário
export const userTypeMetrics = {
  common_user: {
    icon: User,
    color: 'text-blue-500',
    metrics: ['totalCollected', 'rating', 'scheduledCollections', 'availableCoupons']
  },
  individual_collector: {
    icon: Package,
    color: 'text-green-500',
    metrics: ['totalCollected', 'rating', 'coverageAreas', 'activeSince']
  },
  cooperative_owner: {
    icon: Users,
    color: 'text-purple-500',
    metrics: ['totalUsers', 'rating', 'monthlyVolume', 'activeSince']
  },
  collector_company_owner: {
    icon: Building2,
    color: 'text-orange-500',
    metrics: ['totalUsers', 'rating', 'monthlyVolume', 'activeSince']
  },
  partner_owner: {
    icon: Building2,
    color: 'text-red-500',
    metrics: ['customersPerMonth', 'wastePrevented', 'activeCoupons', 'rating']
  }
};

// Dados mockados de impacto ambiental para cada usuário padrão
export const standardEnvironmentalImpactMockData: Record<number, {
  co2: { total: number; unit?: string; };
  trees: { total: number; };
  water: { total: number; unit?: string; };
  energy: { total: number; unit?: string; };
}> = {
  1: { // Usuário Comum
    co2: { total: 1250, unit: 'kg' },
    trees: { total: 85 },
    water: { total: 25000, unit: 'L' },
    energy: { total: 3500, unit: 'kWh' }
  },
  2: { // Coletor Individual com Vínculo
    co2: { total: 3200, unit: 'kg' },
    trees: { total: 210 },
    water: { total: 60000, unit: 'L' },
    energy: { total: 9000, unit: 'kWh' }
  },
  3: { // Coletor Individual sem Vínculo
    co2: { total: 2100, unit: 'kg' },
    trees: { total: 140 },
    water: { total: 40000, unit: 'L' },
    energy: { total: 6000, unit: 'kWh' }
  },
  4: { // Cooperativa
    co2: { total: 12000, unit: 'kg' },
    trees: { total: 800 },
    water: { total: 200000, unit: 'L' },
    energy: { total: 30000, unit: 'kWh' }
  },
  5: { // Empresa Coletora
    co2: { total: 18000, unit: 'kg' },
    trees: { total: 1200 },
    water: { total: 350000, unit: 'L' },
    energy: { total: 50000, unit: 'kWh' }
  },
  6: { // Restaurante
    co2: { total: 900, unit: 'kg' },
    trees: { total: 60 },
    water: { total: 18000, unit: 'L' },
    energy: { total: 2500, unit: 'kWh' }
  },
  7: { // Loja
    co2: { total: 1100, unit: 'kg' },
    trees: { total: 75 },
    water: { total: 22000, unit: 'L' },
    energy: { total: 3200, unit: 'kWh' }
  },
  8: { // Educacional
    co2: { total: 700, unit: 'kg' },
    trees: { total: 50 },
    water: { total: 15000, unit: 'L' },
    energy: { total: 2000, unit: 'kWh' }
  }
}; 