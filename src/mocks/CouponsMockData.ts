import { Coupon } from '@/types/coupon';

export const mockCoupons: Coupon[] = [
  {
    id: '1',
    code: 'DESC20LOJA1',
    title: 'Desconto de 20% em Produtos Sustentáveis',
    description: 'Aproveite 20% de desconto em toda linha de produtos sustentáveis',
    discount: '20%',
    store: 'EcoStore Brasil',
    storeAddress: 'Av. Paulista, 1000 - São Paulo, SP',
    businessHours: 'Seg. a Sáb. das 10h às 22h',
    validUntil: '2024-04-30',
    status: 'active',
    category: 'Produtos Sustentáveis',
    conditions: [
      'Válido apenas para produtos da linha sustentável',
      'Não cumulativo com outras promoções',
      'Limite de um cupom por CPF'
    ],
    motivo: ''
  },
  {
    id: '2',
    code: 'RECICLA15',
    title: '15% OFF em Material Reciclado',
    description: 'Desconto especial em toda linha de materiais reciclados',
    discount: '15%',
    store: 'Recicla Mais',
    storeAddress: 'Rua Augusta, 500 - São Paulo, SP',
    businessHours: 'Seg. a Sex. das 9h às 18h',
    validUntil: '2024-04-25',
    status: 'active',
    category: 'Materiais Reciclados',
    conditions: [
      'Válido apenas para materiais reciclados',
      'Desconto máximo de R$ 100,00',
      'Necessário apresentar o cupom no caixa'
    ],
    motivo: ''
  },
  {
    id: '3',
    code: 'ECO25OFF',
    title: '25% de desconto em Produtos Orgânicos',
    description: 'Desconto exclusivo para toda linha de produtos orgânicos',
    discount: '25%',
    store: 'Mundo Verde',
    storeAddress: 'Shopping Morumbi - São Paulo, SP',
    businessHours: 'Todos os dias das 10h às 22h',
    validUntil: '2024-05-15',
    status: 'active',
    category: 'Produtos Orgânicos',
    conditions: [
      'Válido apenas para produtos orgânicos certificados',
      'Não aplicável em bebidas',
      'Limite de R$ 150,00 em descontos'
    ],
    motivo: ''
  },
  {
    id: '4',
    code: 'USADO10',
    title: '10% OFF em Produtos de Limpeza Ecológicos',
    description: 'Desconto especial para produtos de limpeza ecológicos',
    discount: '10%',
    store: 'LimpaFácil Eco',
    storeAddress: 'Rua Verde, 200 - São Paulo, SP',
    businessHours: 'Seg. a Sáb. das 8h às 20h',
    validUntil: '2024-04-10',
    status: 'used',
    category: 'Produtos de Limpeza',
    conditions: [
      'Válido apenas para produtos selecionados',
      'Necessário apresentar o cupom no caixa'
    ],
    motivo: 'Cupom já utilizado em 09/04/2024'
  },
  {
    id: '5',
    code: 'EXPIRED30',
    title: '30% OFF em Moda Sustentável',
    description: 'Desconto em peças selecionadas de moda sustentável',
    discount: '30%',
    store: 'EcoFashion',
    storeAddress: 'Av. das Árvores, 321 - São Paulo, SP',
    businessHours: 'Seg. a Dom. das 10h às 21h',
    validUntil: '2024-03-31',
    status: 'expired',
    category: 'Moda Sustentável',
    conditions: [
      'Válido apenas para peças da coleção 2024',
      'Não cumulativo com outras promoções'
    ],
    motivo: 'Cupom expirado em 31/03/2024'
  }
];

export const mockCategories = [
  'Produtos Sustentáveis',
  'Materiais Reciclados',
  'Produtos Orgânicos',
  'Energia Renovável',
  'Moda Sustentável',
  'Alimentos Naturais'
]; 