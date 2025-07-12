interface GoldLevelData {
  maintenanceRequirements: {
    description: string;
    icon: string;
  }[];
  benefits: {
    description: string;
    icon: string;
  }[];
}

interface GoldLevelDataByType {
  [key: string]: GoldLevelData;
}

export const goldLevelData: GoldLevelDataByType = {
  collector_company_owner: {
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
  },
  cooperative_owner: {
    maintenanceRequirements: [
      {
        description: 'Manter 16 coletas por mês',
        icon: 'Package'
      },
      {
        description: 'Processar 501kg de materiais por mês',
        icon: 'Recycle'
      },
      {
        description: 'Realizar 9 vendas por mês',
        icon: 'DollarSign'
      },
      {
        description: 'Manter 5 meses de atividade',
        icon: 'Clock'
      },
      {
        description: 'Manter avaliação 4.5+',
        icon: 'Star'
      }
    ],
    benefits: [
      {
        description: 'Dashboard premium',
        icon: 'LayoutDashboard'
      },
      {
        description: 'Gestão completa de cooperados',
        icon: 'Users'
      },
      {
        description: 'Relatórios personalizados',
        icon: 'FileText'
      },
      {
        description: 'Suporte 24/7',
        icon: 'HeadsetIcon'
      }
    ]
  },
  individual_collector: {
    maintenanceRequirements: [
      {
        description: 'Realizar 16 coletas por mês',
        icon: 'Package'
      },
      {
        description: 'Coletar 41kg de materiais por mês',
        icon: 'Recycle'
      },
      {
        description: 'Manter avaliação 4.5+',
        icon: 'Star'
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
        description: 'Acesso a rotas otimizadas',
        icon: 'Map'
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
  },
  restaurant_partner: {
    maintenanceRequirements: [
      {
        description: 'Realizar 12 descartes por mês',
        icon: 'Package'
      },
      {
        description: 'Descartar 301kg de materiais por mês',
        icon: 'Recycle'
      },
      {
        description: 'Manter avaliação 4.5+',
        icon: 'Star'
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
        description: 'Gestão de resíduos avançada',
        icon: 'Recycle'
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
  },
  store_partner: {
    maintenanceRequirements: [
      {
        description: 'Realizar 8 descartes por mês',
        icon: 'Package'
      },
      {
        description: 'Descartar 201kg de materiais por mês',
        icon: 'Recycle'
      },
      {
        description: 'Manter avaliação 4.5+',
        icon: 'Star'
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
        description: 'Gestão de resíduos avançada',
        icon: 'Recycle'
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
  },
  educational_partner: {
    maintenanceRequirements: [
      {
        description: 'Realizar 4 eventos por mês',
        icon: 'Calendar'
      },
      {
        description: 'Descartar 101kg de materiais por mês',
        icon: 'Recycle'
      },
      {
        description: 'Manter avaliação 4.5+',
        icon: 'Star'
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
  }
}; 