import { v4 as uuidv4 } from 'uuid';

export interface UserLevel {
  label: string;
  value: 'bronze' | 'silver' | 'gold';
}

export interface Coupon {
  id: string;
  name: string;
  value: string;
  valueNumeric: number;
  valorTotalCompra: number;
  expiresAt: Date;
  partnerName: string;
  status?: string;
  motivo?: string;
  restaurantType?: string;
  storeCategories?: string[];
  educationalType?: string;
  customRestaurantType?: string;
  description?: string;
  rules?: string[];
  cancellationPolicy?: string;
  customerService?: string;
  photo_url?: string;
  couponCode?: string;
}

export interface UserCoupons {
  userLevel: UserLevel;
  monthlyLimit: number;
  availableCoupons: number;
  activeCoupons: Coupon[];
}

export const standardCommonUserCoupons: UserCoupons = {
  userLevel: {
    label: 'Bronze',
    value: 'bronze'
  },
  monthlyLimit: 5,
  availableCoupons: 3,
  activeCoupons: [
    {
      id: uuidv4(),
      name: '10% de desconto em Materiais Recicláveis',
      value: '10% OFF',
      valueNumeric: 10.00,
      valorTotalCompra: 80.00,
      expiresAt: new Date('2024-04-30'),
      partnerName: 'Reciclagem Verde'
    },
    {
      id: uuidv4(),
      name: '15% de desconto em Papel e Papelão',
      value: '15% OFF',
      valueNumeric: 15.00,
      valorTotalCompra: 120.00,
      expiresAt: new Date('2024-04-15'),
      partnerName: 'EcoPapel'
    },
    {
      id: uuidv4(),
      name: 'Desconto Especial Loja X',
      value: '20% OFF',
      valueNumeric: 20.00,
      valorTotalCompra: 160.00,
      expiresAt: new Date('2024-05-10'),
      partnerName: 'Loja X',
      status: 'excluído',
      motivo: 'Cupom removido por solicitação do parceiro.'
    },
    {
      id: uuidv4(),
      name: '10% OFF em Produtos de Limpeza Ecológicos',
      value: '10% OFF',
      valueNumeric: 10.00,
      valorTotalCompra: 80.00,
      expiresAt: new Date('2024-04-10'),
      partnerName: 'LimpaFácil Eco',
      status: 'used',
      motivo: 'Cupom já utilizado em 09/04/2024.'
    },
    {
      id: uuidv4(),
      name: '30% OFF em Moda Sustentável',
      value: '30% OFF',
      valueNumeric: 30.00,
      valorTotalCompra: 240.00,
      expiresAt: new Date('2024-03-31'),
      partnerName: 'EcoFashion',
      status: 'expired',
      motivo: 'Cupom expirado em 31/03/2024.'
    },
    {
      id: uuidv4(),
      name: 'Cupom Cancelado em Compra Sustentável',
      value: '25% OFF',
      valueNumeric: 25.00,
      valorTotalCompra: 100.00,
      expiresAt: new Date('2024-04-05'),
      partnerName: 'EcoMarket',
      status: 'cancelado',
      motivo: 'Cupom cancelado pelo usuário em 04/04/2024.'
    },
    {
      id: uuidv4(),
      name: 'Cupom Inativo para Serviços Verdes',
      value: '5% OFF',
      valueNumeric: 5.00,
      valorTotalCompra: 50.00,
      expiresAt: new Date('2024-02-28'),
      partnerName: 'Serviços Verdes',
      status: 'inativo',
      motivo: 'Cupom inativado por tempo de inatividade.'
    }
  ]
};

export const standardCollectorCoupons: UserCoupons = {
  userLevel: {
    label: 'Prata',
    value: 'silver'
  },
  monthlyLimit: 10,
  availableCoupons: 7,
  activeCoupons: [
    {
      id: uuidv4(),
      name: '20% de desconto em Equipamentos',
      value: '20% OFF',
      valueNumeric: 20.00,
      valorTotalCompra: 160.00,
      expiresAt: new Date('2024-04-25'),
      partnerName: 'Equipamentos Eco'
    },
    {
      id: uuidv4(),
      name: '25% de desconto em EPIs',
      value: '25% OFF',
      valueNumeric: 25.00,
      valorTotalCompra: 200.00,
      expiresAt: new Date('2024-04-20'),
      partnerName: 'Segurança Verde'
    }
  ]
};

export const standardLinkedCollectorCoupons: UserCoupons = {
  userLevel: {
    label: 'Ouro',
    value: 'gold'
  },
  monthlyLimit: 20,
  availableCoupons: 12,
  activeCoupons: [
    {
      id: uuidv4(),
      name: '30% de desconto em Veículos',
      value: '30% OFF',
      valueNumeric: 30.00,
      valorTotalCompra: 240.00,
      expiresAt: new Date('2024-04-28'),
      partnerName: 'AutoVerde'
    },
    {
      id: uuidv4(),
      name: '35% de desconto em Combustível',
      value: '35% OFF',
      valueNumeric: 35.00,
      valorTotalCompra: 280.00,
      expiresAt: new Date('2024-04-22'),
      partnerName: 'Posto EcoVerde'
    }
  ]
};

export const standardCooperativeCoupons = {
  userLevel: {
    label: 'Ouro',
    color: 'bg-yellow-100 text-yellow-700'
  },
  monthlyLimit: 20,
  availableCoupons: 15,
  activeCoupons: [
    {
      id: '1',
      name: 'Desconto em Curso de Gestão',
      value: '40% OFF',
      valueNumeric: 40.00,
      valorTotalCompra: 320.00,
      expiresAt: new Date('2024-04-30'),
      partnerName: 'Escola de Negócios'
    },
    {
      id: '2',
      name: 'Desconto em Software de Gestão',
      value: '30% OFF',
      valueNumeric: 30.00,
      valorTotalCompra: 240.00,
      expiresAt: new Date('2024-04-25'),
      partnerName: 'Tech Solutions'
    },
    {
      id: '3',
      name: 'Desconto em Consultoria',
      value: '25% OFF',
      valueNumeric: 25.00,
      valorTotalCompra: 200.00,
      expiresAt: new Date('2024-04-28'),
      partnerName: 'Consultoria Verde'
    }
  ]
};

export const standardCollectorCompanyCoupons = {
  userLevel: {
    label: 'Ouro',
    color: 'bg-yellow-100 text-yellow-700'
  },
  monthlyLimit: 20,
  availableCoupons: 16,
  activeCoupons: [
    {
      id: '1',
      name: 'Desconto em Curso de Logística',
      value: '35% OFF',
      valueNumeric: 35.00,
      valorTotalCompra: 280.00,
      expiresAt: new Date('2024-04-30'),
      partnerName: 'Escola de Negócios'
    },
    {
      id: '2',
      name: 'Desconto em Software de Rastreamento',
      value: '40% OFF',
      valueNumeric: 40.00,
      valorTotalCompra: 320.00,
      expiresAt: new Date('2024-04-25'),
      partnerName: 'Tech Solutions'
    },
    {
      id: '3',
      name: 'Desconto em Consultoria Ambiental',
      value: '30% OFF',
      valueNumeric: 30.00,
      valorTotalCompra: 240.00,
      expiresAt: new Date('2024-04-28'),
      partnerName: 'Consultoria Verde'
    }
  ]
};

export const standardRestaurantCoupons = {
  userLevel: {
    label: 'Ouro',
    color: 'bg-yellow-100 text-yellow-700'
  },
  monthlyLimit: 20,
  availableCoupons: 18,
  activeCoupons: [
    {
      id: '1',
      name: 'Desconto 10%',
      value: '10',
      valueNumeric: 10.00,
      valorTotalCompra: 80.00,
      discountType: 'percentage',
      expiresAt: new Date('2024-12-31'),
      partnerName: 'Restaurante Bom Prato',
      restaurantType: 'buffet',
      customRestaurantType: '',
      storeCategories: [],
      educationalType: '',
      description: 'Desconto válido para buffet livre de segunda a sexta.',
      rules: ['Válido apenas para almoço', 'Não cumulativo com outras promoções'],
      cancellationPolicy: 'Cancelamento permitido até 24h antes.',
      customerService: '0800 123 4567',
      status: 'Ativo',
      motivo: '',
      photo_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=400&q=80',
      couponCode: 'DE-ABC123',
    },
    {
      id: '2',
      name: 'R$ 20 OFF',
      value: '20',
      valueNumeric: 20.00,
      valorTotalCompra: 180.00,
      discountType: 'fixed',
      expiresAt: new Date('2024-12-31'),
      partnerName: 'Churrascaria Verde',
      restaurantType: 'ala_carte',
      customRestaurantType: '',
      storeCategories: [],
      educationalType: '',
      description: 'Desconto fixo em pratos à la carte.',
      rules: ['Válido para todos os pratos', 'Não cumulativo com outras promoções'],
      cancellationPolicy: 'Cancelamento permitido até 24h antes.',
      customerService: '0800 987 6543',
      status: 'Inativo',
      motivo: 'Falta de estoque',
      photo_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80',
      couponCode: 'R2-DEF456',
    },
    {
      id: '3',
      name: 'Promoção Especial',
      value: '15',
      valueNumeric: 15.00,
      valorTotalCompra: 135.00,
      discountType: 'percentage',
      expiresAt: new Date('2024-12-31'),
      partnerName: 'Restaurante Vegano',
      restaurantType: 'outros',
      customRestaurantType: 'Vegano',
      storeCategories: [],
      educationalType: '',
      description: 'Promoção especial para pratos veganos.',
      rules: ['Válido apenas para pratos veganos', 'Não cumulativo com outras promoções'],
      cancellationPolicy: 'Cancelamento permitido até 24h antes.',
      customerService: '0800 321 4321',
      status: 'Expirado',
      motivo: 'Promoção encerrada',
      photo_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
      couponCode: 'PE-GHI789',
    }
  ]
};

export const standardStoreCoupons = {
  userLevel: {
    label: 'Ouro',
    color: 'bg-yellow-100 text-yellow-700'
  },
  monthlyLimit: 20,
  availableCoupons: 17,
  activeCoupons: [
    {
      id: '1',
      name: 'Desconto em Curso de Varejo',
      value: '30',
      valueNumeric: 30.00,
      valorTotalCompra: 240.00,
      discountType: 'percentage',
      expiresAt: new Date('2024-04-30'),
      partnerName: 'Escola de Negócios',
      storeCategories: ['sustentavel'],
      description: 'Desconto especial em cursos de varejo sustentável.',
      rules: ['Válido para novos alunos', 'Não cumulativo'],
      cancellationPolicy: 'Cancelamento permitido até 7 dias antes.',
      customerService: '0800 123 4567',
      status: 'Ativo',
      photo_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80',
      couponCode: 'DC-JKL012',
    },
    {
      id: '2',
      name: 'Desconto em Software de Gestão',
      value: '35',
      valueNumeric: 35.00,
      valorTotalCompra: 280.00,
      discountType: 'percentage',
      expiresAt: new Date('2024-04-25'),
      partnerName: 'Tech Solutions',
      storeCategories: ['reciclado'],
      description: 'Software completo para gestão de reciclagem.',
      rules: ['Válido para primeira compra', 'Suporte incluído'],
      cancellationPolicy: 'Cancelamento permitido até 30 dias.',
      customerService: '0800 987 6543',
      status: 'Ativo',
      photo_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80',
      couponCode: 'DS-MNO345',
    },
    {
      id: '3',
      name: 'Desconto em Consultoria de Sustentabilidade',
      value: '25',
      valueNumeric: 25.00,
      valorTotalCompra: 200.00,
      discountType: 'percentage',
      expiresAt: new Date('2024-04-28'),
      partnerName: 'Consultoria Verde',
      storeCategories: ['organico'],
      description: 'Consultoria especializada em produtos orgânicos.',
      rules: ['Válido para primeira consulta', 'Relatório incluído'],
      cancellationPolicy: 'Cancelamento permitido até 24h antes.',
      customerService: '0800 321 4321',
      status: 'Inativo',
      motivo: 'Período de férias',
      photo_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=400&q=80',
      couponCode: 'DC-PQR678',
    }
  ]
};

export const standardEducationalCoupons = {
  userLevel: {
    label: 'Ouro',
    color: 'bg-yellow-100 text-yellow-700'
  },
  monthlyLimit: 20,
  availableCoupons: 19,
  activeCoupons: [
    {
      id: '1',
      name: 'Desconto em Curso de Educação Ambiental',
      value: '40',
      valueNumeric: 40.00,
      valorTotalCompra: 320.00,
      discountType: 'percentage',
      expiresAt: new Date('2024-04-30'),
      partnerName: 'Escola de Sustentabilidade',
      educationalType: 'curso_online',
      description: 'Curso completo de educação ambiental online.',
      rules: ['Válido para novos alunos', 'Certificado incluído'],
      cancellationPolicy: 'Cancelamento permitido até 14 dias.',
      customerService: '0800 111 2222',
      status: 'Ativo',
      photo_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9e1?auto=format&fit=crop&w=400&q=80',
      couponCode: 'DE-STU901',
    },
    {
      id: '2',
      name: 'Desconto em Software Educacional',
      value: '35',
      valueNumeric: 35.00,
      valorTotalCompra: 280.00,
      discountType: 'percentage',
      expiresAt: new Date('2024-04-25'),
      partnerName: 'Tech Solutions',
      educationalType: 'workshop',
      description: 'Workshop prático de tecnologia educacional.',
      rules: ['Válido para educadores', 'Material incluído'],
      cancellationPolicy: 'Cancelamento permitido até 7 dias.',
      customerService: '0800 333 4444',
      status: 'Expirado',
      motivo: 'Workshop já realizado',
      photo_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80',
      couponCode: 'DS-VWX234',
    },
    {
      id: '3',
      name: 'Desconto em Consultoria Pedagógica',
      value: '30',
      valueNumeric: 30.00,
      valorTotalCompra: 240.00,
      discountType: 'percentage',
      expiresAt: new Date('2024-04-28'),
      partnerName: 'Consultoria Educacional',
      educationalType: 'consultoria',
      description: 'Consultoria especializada em metodologias pedagógicas.',
      rules: ['Válido para escolas', 'Relatório detalhado'],
      cancellationPolicy: 'Cancelamento permitido até 48h antes.',
      customerService: '0800 555 6666',
      status: 'Ativo',
      photo_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=80',
      couponCode: 'DC-YZA567',
    }
  ]
}; 