import { LevelRequirements } from '@/components/levels/types';

export interface UserMetrics {
  userType: 'common' | 'collector' | 'partner' | 'cooperative' | 'company';
  primaryMetric: string;
  secondaryMetrics: string[];
  description: string;
  calculationRules: string[];
  bonusConditions: string[];
}

export const userMetricsConfig: UserMetrics[] = [
  {
    userType: 'common',
    primaryMetric: 'collections',
    secondaryMetrics: ['kg', 'ratings', 'months'],
    description: 'Usuários comuns focam em solicitar coletas e avaliar coletores',
    calculationRules: [
      'Pontos por solicitação de coleta: 10',
      'Pontos por avaliação de coletor: 5',
      'Pontos por login diário: 1',
      'Pontos por indicação: 50',
      'Bônus por consistência mensal: +20 pontos'
    ],
    bonusConditions: [
      'Atingir 5 coletas no mês: +20 pontos',
      'Manter avaliação média acima de 4.5: +15 pontos',
      'Indicar 3 novos usuários: +100 pontos'
    ]
  },
  {
    userType: 'collector',
    primaryMetric: 'collections',
    secondaryMetrics: ['kg', 'ratings', 'months', 'punctuality'],
    description: 'Coletores focam em completar coletas com qualidade e pontualidade',
    calculationRules: [
      'Pontos por aceitar coleta: 15',
      'Pontos por completar coleta: 25',
      'Pontos por avaliação alta (4-5 estrelas): 10',
      'Pontos por pontualidade: 5',
      'Bônus por volume alto: +10 pontos por 50kg+'
    ],
    bonusConditions: [
      'Completar 10 coletas no mês: +50 pontos',
      'Manter avaliação média acima de 4.8: +30 pontos',
      'Ser pontual em 95% das coletas: +40 pontos',
      'Vender mais de 200kg no mês: +25 pontos'
    ]
  },
  {
    userType: 'partner',
    primaryMetric: 'activeCoupons',
    secondaryMetrics: ['points', 'ratings', 'months', 'employees'],
    description: 'Parceiros focam em criar cupons e manter alta satisfação',
    calculationRules: [
      'Pontos por criar cupom: 20',
      'Pontos por cupom utilizado: 15',
      'Pontos por avaliação alta: 10',
      'Pontos por funcionário cadastrado: 5',
      'Bônus por engajamento: +25 pontos'
    ],
    bonusConditions: [
      'Criar 10 cupons no mês: +100 pontos',
      'Ter 5+ cupons utilizados: +75 pontos',
      'Manter avaliação média acima de 4.5: +50 pontos'
    ]
  },
  {
    userType: 'cooperative',
    primaryMetric: 'collections',
    secondaryMetrics: ['sales', 'kg', 'months'],
    description: 'Cooperativas focam em realizar coletas, vender para empresas e processar volume',
    calculationRules: [
      'Pontos por coleta realizada: 25',
      'Pontos por venda para empresa: 30',
      'Pontos por volume processado: 2 por kg',
      'Bônus por volume alto: +20 pontos por 100kg+'
    ],
    bonusConditions: [
      'Realizar 15 coletas no mês: +100 pontos',
      'Fazer 8 vendas para empresas: +150 pontos',
      'Processar mais de 500kg no mês: +200 pontos'
    ]
  },
  {
    userType: 'company',
    primaryMetric: 'activeCollectors',
    secondaryMetrics: ['sales', 'kg', 'collections', 'months'],
    description: 'Empresas focam em cadastrar coletores, fazer vendas e processar volume',
    calculationRules: [
      'Pontos por cadastrar coletor: 50',
      'Pontos por venda para coletor: 20',
      'Pontos por venda para cooperativa: 30',
      'Pontos por volume vendido: 3 por kg',
      'Pontos por coleta realizada: 15'
    ],
    bonusConditions: [
      'Cadastrar 5 coletores no mês: +150 pontos',
      'Fazer 10 vendas para coletores: +200 pontos',
      'Fazer 5 vendas para cooperativas: +150 pontos',
      'Vender mais de 1000kg no mês: +300 pontos',
      'Realizar 20 coletas no mês: +250 pontos'
    ]
  }
];

export const getMetricsForUserType = (userType: string): UserMetrics | undefined => {
  return userMetricsConfig.find(metrics => metrics.userType === userType);
};

export const getPrimaryMetric = (userType: string): string => {
  const metrics = getMetricsForUserType(userType);
  return metrics?.primaryMetric || 'collections';
};

export const getSecondaryMetrics = (userType: string): string[] => {
  const metrics = getMetricsForUserType(userType);
  return metrics?.secondaryMetrics || [];
};

export const getMetricLabel = (metric: string): string => {
  const labels: Record<string, string> = {
    collections: 'Coletas',
    kg: 'Quilogramas',
    ratings: 'Avaliações',
    months: 'Meses',
    activeCoupons: 'Cupons Ativos',
    sales: 'Vendas',
    activeCollectors: 'Coletores Ativos',
    averageRating: 'Avaliação Média',
    punctuality: 'Pontualidade',
    employees: 'Funcionários',
    members: 'Membros',
    satisfaction: 'Satisfação'
  };
  
  return labels[metric] || metric;
};

export const getMetricDescription = (metric: string): string => {
  const descriptions: Record<string, string> = {
    collections: 'Número total de coletas realizadas',
    kg: 'Peso total em quilogramas coletados',
    ratings: 'Número de avaliações recebidas',
    months: 'Tempo de atividade na plataforma',
    activeCoupons: 'Cupons de desconto ativos',
    sales: 'Volume de vendas realizadas',
    activeCollectors: 'Coletores ativos na empresa',
    averageRating: 'Avaliação média recebida',
    punctuality: 'Taxa de pontualidade nas coletas',
    employees: 'Funcionários cadastrados',
    members: 'Membros da cooperativa',
    satisfaction: 'Índice de satisfação dos clientes'
  };
  
  return descriptions[metric] || 'Métrica do sistema';
}; 