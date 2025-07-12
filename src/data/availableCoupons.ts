import { v4 as uuidv4 } from 'uuid';

export interface AvailableCoupon {
  id: string;
  type: 'presential' | 'online' | 'hybrid';
  category: 'restaurant' | 'store' | 'educational';
  discountType: 'percentage' | 'fixed' | 'free';
  name: string;
  partnerName: string;
  value: string;
  expiresAt: Date;
  remainingQuantity: number;
  description: string;
  rules: string[];
  userLimit: number;
  cancellationPolicy: string;
  customerService: string;
  photo_url?: string;
  location?: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    openingHours: string;
    phone: string;
  };
  parkingInfo?: string;
  publicTransport?: string[];
  corporateContact?: string;
  onlineInfo?: {
    url: string;
    instructions: string[];
    validationCode?: string;
  };
}

export const availableCoupons: AvailableCoupon[] = [
  // Cupons de Restaurantes
  {
    id: '1',
    type: 'presential',
    category: 'restaurant',
    discountType: 'percentage',
    name: 'Desconto em Buffet',
    partnerName: 'Restaurante Bom Prato',
    value: '30% OFF',
    expiresAt: new Date('2024-04-30'),
    remainingQuantity: 5,
    description: 'Desconto válido para almoço em buffet livre, de segunda a sexta-feira.',
    rules: [
      'Válido apenas para pagamento em dinheiro ou PIX',
      'Não cumulativo com outras promoções',
      'Necessário apresentar o cupom antes do pagamento'
    ],
    userLimit: 1,
    cancellationPolicy: 'Cupom pode ser cancelado em até 24h após o resgate',
    customerService: '0800 123 4567',
    location: {
      address: 'Rua Exemplo, 123 - Centro',
      coordinates: { lat: -23.550520, lng: -46.633308 },
      openingHours: 'Segunda a Sexta, das 11h às 15h',
      phone: '(11) 1234-5678'
    },
    parkingInfo: 'Estacionamento gratuito para coletores',
    publicTransport: ['Metrô República - 200m', 'Ônibus - Ponto na esquina']
  },
  {
    id: '2',
    type: 'presential',
    category: 'restaurant',
    discountType: 'fixed',
    name: 'Desconto no Rodízio',
    partnerName: 'Churrascaria Verde',
    value: 'R$ 50 OFF',
    expiresAt: new Date('2024-05-15'),
    remainingQuantity: 10,
    description: 'Desconto fixo no valor do rodízio completo.',
    rules: [
      'Válido todos os dias',
      'Necessário reserva prévia',
      'Não válido para bebidas'
    ],
    userLimit: 1,
    cancellationPolicy: 'Cupom pode ser cancelado em até 48h após o resgate',
    customerService: '0800 765 4321',
    location: {
      address: 'Av. Paulista, 1500 - Bela Vista',
      coordinates: { lat: -23.561654, lng: -46.655386 },
      openingHours: 'Todos os dias, das 12h às 23h',
      phone: '(11) 98765-4321'
    }
  },

  // Cupons de Lojas
  {
    id: '3',
    type: 'hybrid',
    category: 'store',
    discountType: 'fixed',
    name: 'Desconto em Produtos Sustentáveis',
    partnerName: 'EcoStore',
    value: 'R$ 100 OFF',
    expiresAt: new Date('2024-05-20'),
    remainingQuantity: 15,
    description: 'Desconto em compras acima de R$ 300 em produtos sustentáveis.',
    rules: [
      'Válido para compras online ou na loja física',
      'Necessário valor mínimo de R$ 300',
      'Válido apenas para produtos da linha eco'
    ],
    userLimit: 2,
    cancellationPolicy: 'Cupom válido por 30 dias após o resgate',
    customerService: '0800 888 9999',
    location: {
      address: 'Shopping Verde, Loja 42 - Pinheiros',
      coordinates: { lat: -23.567894, lng: -46.702341 },
      openingHours: 'Segunda a Sábado, das 10h às 22h',
      phone: '(11) 3456-7890'
    },
    onlineInfo: {
      url: 'https://ecostore.com.br',
      instructions: [
        'Adicione os produtos ao carrinho',
        'Insira o código do cupom no checkout',
        'O desconto será aplicado automaticamente'
      ]
    }
  },
  {
    id: '4',
    type: 'online',
    category: 'store',
    discountType: 'percentage',
    name: 'Desconto em Material Reciclado',
    partnerName: 'Recicla Shop',
    value: '25% OFF',
    expiresAt: new Date('2024-05-10'),
    remainingQuantity: 20,
    description: 'Desconto em toda linha de produtos feitos com material reciclado.',
    rules: [
      'Válido apenas para compras online',
      'Não cumulativo com outras promoções',
      'Frete não incluso'
    ],
    userLimit: 1,
    cancellationPolicy: 'Cupom não pode ser cancelado após o uso',
    customerService: '0800 777 8888',
    onlineInfo: {
      url: 'https://reciclashop.com.br',
      instructions: [
        'Faça seu cadastro no site',
        'Escolha os produtos',
        'Aplique o código no carrinho'
      ],
      validationCode: 'RECICLA25'
    }
  },

  // Cupons Educacionais
  {
    id: '5',
    type: 'hybrid',
    category: 'educational',
    discountType: 'percentage',
    name: 'Curso de Sustentabilidade',
    partnerName: 'EcoLearn',
    value: '40% OFF',
    expiresAt: new Date('2024-06-01'),
    remainingQuantity: 8,
    description: 'Desconto em qualquer curso da plataforma.',
    rules: [
      'Válido para cursos presenciais e online',
      'Matrícula gratuita',
      'Válido por 6 meses após ativação'
    ],
    userLimit: 1,
    cancellationPolicy: 'Reembolso integral em até 7 dias após início',
    customerService: '0800 555 6666',
    location: {
      address: 'Rua do Conhecimento, 500 - Vila Mariana',
      coordinates: { lat: -23.588213, lng: -46.632474 },
      openingHours: 'Segunda a Sexta, das 8h às 22h',
      phone: '(11) 5555-9999'
    },
    onlineInfo: {
      url: 'https://ecolearn.com.br',
      instructions: [
        'Escolha o curso desejado',
        'Faça seu cadastro',
        'Aplique o cupom na matrícula'
      ]
    }
  },
  {
    id: '6',
    type: 'online',
    category: 'educational',
    discountType: 'free',
    name: 'Curso Gratuito de Reciclagem',
    partnerName: 'Instituto Verde',
    value: 'GRÁTIS',
    expiresAt: new Date('2024-05-30'),
    remainingQuantity: 30,
    description: 'Curso online completo sobre técnicas de reciclagem.',
    rules: [
      'Curso 100% online',
      'Certificado incluso',
      'Acesso por 3 meses'
    ],
    userLimit: 1,
    cancellationPolicy: 'Não necessita cancelamento',
    customerService: '0800 444 5555',
    onlineInfo: {
      url: 'https://institutoverde.edu.br',
      instructions: [
        'Faça seu cadastro na plataforma',
        'Ative o cupom',
        'Comece a estudar imediatamente'
      ],
      validationCode: 'RECICLA2024'
    }
  }
]; 