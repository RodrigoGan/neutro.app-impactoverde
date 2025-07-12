export interface MaterialSale {
  material: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
  date: string;
}

export const cooperativeFinancialMock = {
  monthlyEarnings: 12500.75,
  monthlyGoal: 15000.00,
  totalMembers: 25,
  activeMembers: 18,
  materialSales: [
    {
      material: 'Papelão',
      quantity: 2500,
      unit: 'kg',
      price: 0.80,
      total: 2000.00,
      date: 'Hoje, 14:30'
    },
    {
      material: 'Plástico',
      quantity: 1800,
      unit: 'kg',
      price: 1.20,
      total: 2160.00,
      date: 'Hoje, 11:15'
    },
    {
      material: 'Alumínio',
      quantity: 950,
      unit: 'kg',
      price: 2.00,
      total: 1900.00,
      date: 'Ontem, 16:45'
    },
    {
      material: 'Vidro',
      quantity: 1200,
      unit: 'kg',
      price: 0.50,
      total: 600.00,
      date: 'Ontem, 10:30'
    },
    {
      material: 'Papel',
      quantity: 3000,
      unit: 'kg',
      price: 0.40,
      total: 1200.00,
      date: '23/03, 15:20'
    },
    {
      material: 'Metal',
      quantity: 800,
      unit: 'kg',
      price: 1.80,
      total: 1440.00,
      date: '22/03, 09:15'
    },
    {
      material: 'Eletrônicos',
      quantity: 150,
      unit: 'kg',
      price: 5.00,
      total: 750.00,
      date: '21/03, 13:45'
    }
  ]
}; 