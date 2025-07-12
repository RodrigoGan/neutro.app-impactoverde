export const restaurantPartnerFinancialMock = {
  partnerType: 'restaurant',
  monthlyInvestment: 1200.00,
  monthlyGoal: 1500.00,
  distributedCoupons: 80,
  validatedCoupons: 65,
  engagementRate: 81,
  recentCoupons: [
    { user: 'Maria Souza', value: 20.00, valorTotalCompra: 120.00, date: 'Hoje, 13:10', type: 'distribuído' as 'distribuído' },
    { user: 'Carlos Lima', value: 15.00, valorTotalCompra: 90.00, date: 'Hoje, 11:45', type: 'validado' as 'validado' },
    { user: 'Ana Paula', value: 25.00, valorTotalCompra: 150.00, date: 'Ontem, 19:30', type: 'distribuído' as 'distribuído' },
  ]
};

export const storePartnerFinancialMock = {
  partnerType: 'store',
  monthlyInvestment: 900.00,
  monthlyGoal: 1200.00,
  distributedCoupons: 60,
  validatedCoupons: 48,
  engagementRate: 80,
  recentCoupons: [
    { user: 'João Pedro', value: 10.00, valorTotalCompra: 80.00, date: 'Hoje, 10:20', type: 'validado' as 'validado' },
    { user: 'Fernanda Alves', value: 12.00, valorTotalCompra: 95.00, date: 'Ontem, 17:00', type: 'distribuído' as 'distribuído' },
    { user: 'Lucas Silva', value: 8.00, valorTotalCompra: 60.00, date: 'Ontem, 15:30', type: 'validado' as 'validado' },
  ]
};

export const educationalPartnerFinancialMock = {
  partnerType: 'educational',
  monthlyInvestment: 500.00,
  monthlyGoal: 800.00,
  distributedCoupons: 30,
  validatedCoupons: 22,
  engagementRate: 73,
  recentCoupons: [
    { user: 'Beatriz Costa', value: 5.00, valorTotalCompra: 40.00, date: 'Hoje, 09:00', type: 'distribuído' as 'distribuído' },
    { user: 'Rafael Torres', value: 7.00, valorTotalCompra: 55.00, date: 'Ontem, 14:10', type: 'validado' as 'validado' },
    { user: 'Juliana Dias', value: 6.00, valorTotalCompra: 38.00, date: '23/03, 16:40', type: 'distribuído' as 'distribuído' },
  ]
}; 