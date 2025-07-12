import { Coupon } from '@/types/coupon';

export const mockCoupons: Coupon[] = [
  {
    id: '1',
    code: 'VERDE20',
    title: '20% OFF',
    description: 'Desconto em produtos sustentáveis',
    discount: '20%',
    store: 'Loja Verde',
    storeAddress: 'Rua das Flores, 123 - Centro',
    businessHours: 'Seg a Sex: 9h às 18h, Sáb: 9h às 13h',
    validUntil: '30/04/2024',
    status: 'active',
    category: 'Produtos',
    conditions: ['Válido para compras acima de R$ 100', 'Aplicável em todos os produtos']
  },
  {
    id: '2',
    code: 'ECO15',
    title: 'R$ 15 OFF',
    description: 'Desconto em compras acima de R$ 100',
    discount: 'R$ 15',
    store: 'EcoStore',
    storeAddress: 'Av. Principal, 456 - Jardins',
    businessHours: 'Seg a Sáb: 10h às 22h',
    validUntil: '15/05/2024',
    status: 'active',
    category: 'Produtos',
    conditions: ['Válido para compras acima de R$ 100', 'Não cumulativo']
  }
]; 