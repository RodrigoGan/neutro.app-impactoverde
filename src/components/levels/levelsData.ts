import { UserLevels } from './types';

export const userLevels: UserLevels = {
  partner: {
    bronze: {
      name: 'Bronze',
      description: 'Para pequenos comércios iniciando no programa.',
      requirements: {
        activeCoupons: 15,
        points: 200,
        ratings: 4,
        months: 2
      },
      benefits: {
        features: [
          'Certificado Bronze (download/compartilhar)',
          'Badge Bronze no perfil',
          'Participação em sorteios/campanhas (quando disponível)',
          'Divulgação em lista de parceiros',
          'Pode resgatar até 5 cupons de desconto por mês'
        ]
      }
    },
    silver: {
      name: 'Prata',
      description: 'Para empresas com engajamento médio.',
      requirements: {
        activeCoupons: 50,
        points: 600,
        ratings: 8,
        months: 4
      },
      benefits: {
        features: [
          'Certificado Prata',
          'Badge Prata no perfil',
          'Participação em sorteios/campanhas (quando disponível)',
          'Destaque em lista de parceiros',
          'Convite para campanhas de marketing (quando disponível)',
          'Pode resgatar até 10 cupons de desconto por mês'
        ]
      }
    },
    gold: {
      name: 'Ouro',
      description: 'Para empresas com alto engajamento.',
      requirements: {
        activeCoupons: 120,
        points: 1500,
        ratings: 15,
        months: 6
      },
      benefits: {
        features: [
          'Certificado Ouro',
          'Badge Ouro no perfil',
          'Participação em sorteios/campanhas (quando disponível)',
          'Destaque premium em lista',
          'Convite para campanhas de marketing especiais (quando disponível)',
          'Pode resgatar até 20 cupons de desconto por mês'
        ]
      }
    }
  },
  cooperative: {
    bronze: {
      name: 'Bronze',
      description: 'Nível inicial para cooperativas',
      requirements: {
        collections: 12,
        kg: 300,
        sales: 6,
        months: 2
      },
      benefits: {
        features: [
          'Certificado Bronze (download/compartilhar)',
          'Badge Bronze no perfil',
          'Participação em sorteios/campanhas (quando disponível)',
          'Divulgação em lista de cooperativas',
          'Pode resgatar até 5 cupons de desconto por mês'
        ]
      }
    },
    silver: {
      name: 'Prata',
      description: 'Nível intermediário para cooperativas',
      requirements: {
        collections: 35,
        kg: 800,
        sales: 15,
        months: 4
      },
      benefits: {
        features: [
          'Certificado Prata',
          'Badge Prata no perfil',
          'Participação em sorteios/campanhas (quando disponível)',
          'Destaque em lista de cooperativas',
          'Convite para eventos/treinamentos (quando disponível)',
          'Pode resgatar até 10 cupons de desconto por mês'
        ]
      }
    },
    gold: {
      name: 'Ouro',
      description: 'Nível avançado para cooperativas',
      requirements: {
        collections: 80,
        kg: 2000,
        sales: 35,
        months: 6
      },
      benefits: {
        features: [
          'Certificado Ouro',
          'Badge Ouro no perfil',
          'Participação em sorteios/campanhas (quando disponível)',
          'Destaque premium em lista',
          'Convite para eventos/treinamentos especiais (quando disponível)',
          'Pode resgatar até 20 cupons de desconto por mês'
        ]
      }
    }
  },
  common: {
    bronze: {
      name: 'Bronze',
      description: 'Ideal para quem está começando sua jornada sustentável.',
      requirements: {
        collections: 6,
        kg: 15,
        ratings: 4,
        months: 2
      },
      benefits: {
        features: [
          'Certificado Bronze (download/compartilhar)',
          'Badge Bronze no perfil',
          'Participação em sorteios/campanhas (quando disponível)',
          'Pode resgatar até 5 cupons de desconto por mês'
        ]
      }
    },
    silver: {
      name: 'Prata',
      description: 'Para usuários com rotina estabelecida de reciclagem.',
      requirements: {
        collections: 20,
        kg: 50,
        ratings: 10,
        months: 4
      },
      benefits: {
        features: [
          'Certificado Prata',
          'Badge Prata no perfil',
          'Participação em sorteios/campanhas (quando disponível)',
          'Destaque em ranking local',
          'Pode resgatar até 10 cupons de desconto por mês'
        ]
      }
    },
    gold: {
      name: 'Ouro',
      description: 'Para usuários com alto comprometimento com a sustentabilidade.',
      requirements: {
        collections: 50,
        kg: 120,
        ratings: 20,
        months: 6
      },
      benefits: {
        features: [
          'Certificado Ouro',
          'Badge Ouro no perfil',
          'Participação em sorteios/campanhas (quando disponível)',
          'Destaque em ranking geral',
          'Convite para desafios mensais (quando disponível)',
          'Pode resgatar até 20 cupons de desconto por mês'
        ]
      }
    }
  },
  collector: {
    bronze: {
      name: 'Bronze',
      description: 'Nível inicial para coletores individuais',
      requirements: {
        collections: 12,
        kg: 30,
        ratings: 7,
        months: 2
      },
      benefits: {
        features: [
          'Certificado Bronze (download/compartilhar)',
          'Badge Bronze no perfil',
          'Participação em sorteios/campanhas (quando disponível)',
          'Pode resgatar até 5 cupons de desconto por mês'
        ]
      }
    },
    silver: {
      name: 'Prata',
      description: 'Nível intermediário para coletores experientes',
      requirements: {
        collections: 35,
        kg: 80,
        ratings: 12,
        months: 4
      },
      benefits: {
        features: [
          'Certificado Prata',
          'Badge Prata no perfil',
          'Participação em sorteios/campanhas (quando disponível)',
          'Destaque em ranking de coletores',
          'Pode resgatar até 10 cupons de desconto por mês'
        ]
      }
    },
    gold: {
      name: 'Ouro',
      description: 'Nível avançado para coletores',
      requirements: {
        collections: 80,
        kg: 200,
        ratings: 25,
        months: 6
      },
      benefits: {
        features: [
          'Certificado Ouro',
          'Badge Ouro no perfil',
          'Participação em sorteios/campanhas (quando disponível)',
          'Destaque em ranking geral',
          'Convite para campanhas especiais (quando disponível)',
          'Pode resgatar até 20 cupons de desconto por mês'
        ]
      }
    }
  },
  company: {
    bronze: {
      name: 'Bronze',
      description: 'Nível inicial para empresas coletoras',
      requirements: {
        activeCollectors: 3,
        kg: 300,
        sales: 15,
        months: 2
      },
      benefits: {
        features: [
          'Certificado Bronze (download/compartilhar)',
          'Badge Bronze no perfil',
          'Participação em sorteios/campanhas (quando disponível)',
          'Divulgação em lista de empresas',
          'Pode resgatar até 5 cupons de desconto por mês'
        ]
      }
    },
    silver: {
      name: 'Prata',
      description: 'Nível intermediário para empresas coletoras',
      requirements: {
        activeCollectors: 8,
        kg: 800,
        sales: 30,
        months: 4
      },
      benefits: {
        features: [
          'Certificado Prata',
          'Badge Prata no perfil',
          'Participação em sorteios/campanhas (quando disponível)',
          'Destaque em lista de empresas',
          'Convite para campanhas de marketing (quando disponível)',
          'Pode resgatar até 10 cupons de desconto por mês'
        ]
      }
    },
    gold: {
      name: 'Ouro',
      description: 'Nível avançado para empresas coletoras',
      requirements: {
        activeCollectors: 20,
        kg: 2000,
        sales: 80,
        months: 6
      },
      benefits: {
        features: [
          'Certificado Ouro',
          'Badge Ouro no perfil',
          'Participação em sorteios/campanhas (quando disponível)',
          'Destaque premium em lista',
          'Convite para campanhas de marketing especiais (quando disponível)',
          'Pode resgatar até 20 cupons de desconto por mês'
        ]
      }
    }
  }
}; 