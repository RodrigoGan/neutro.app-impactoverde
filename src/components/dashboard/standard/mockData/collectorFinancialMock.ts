export interface MaterialSale {
  material: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
  date: string;
}

export const independentCollectorFinancialMock = {
  monthlyEarnings: 850.50,
  monthlyGoal: 1000.00,
  materialSales: [
    {
      material: 'Papelão',
      quantity: 50,
      unit: 'kg',
      price: 0.80,
      total: 40.00,
      date: 'Hoje, 14:30'
    },
    {
      material: 'Plástico',
      quantity: 30,
      unit: 'kg',
      price: 1.20,
      total: 36.00,
      date: 'Hoje, 11:15'
    },
    {
      material: 'Alumínio',
      quantity: 15,
      unit: 'kg',
      price: 2.00,
      total: 30.00,
      date: 'Ontem, 16:45'
    },
    {
      material: 'Papelão',
      quantity: 45,
      unit: 'kg',
      price: 0.80,
      total: 36.00,
      date: 'Ontem, 10:30'
    },
    {
      material: 'Plástico',
      quantity: 25,
      unit: 'kg',
      price: 1.20,
      total: 30.00,
      date: '23/03, 15:20'
    }
  ]
};

export const linkedCollectorFinancialMock = {
  monthlyEarnings: 920.75,
  monthlyGoal: 1000.00,
  materialSales: [
    {
      material: 'Papelão',
      quantity: 55,
      unit: 'kg',
      price: 0.80,
      total: 44.00,
      date: 'Hoje, 14:30'
    },
    {
      material: 'Plástico',
      quantity: 35,
      unit: 'kg',
      price: 1.20,
      total: 42.00,
      date: 'Hoje, 11:15'
    },
    {
      material: 'Alumínio',
      quantity: 20,
      unit: 'kg',
      price: 2.00,
      total: 40.00,
      date: 'Ontem, 16:45'
    },
    {
      material: 'Papelão',
      quantity: 50,
      unit: 'kg',
      price: 0.80,
      total: 40.00,
      date: 'Ontem, 10:30'
    },
    {
      material: 'Plástico',
      quantity: 30,
      unit: 'kg',
      price: 1.20,
      total: 36.00,
      date: '23/03, 15:20'
    }
  ]
}; 