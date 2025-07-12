import { userLevels } from '@/components/levels/levelsData';

export type UserLevel = 'bronze' | 'silver' | 'gold';

export function getMonthlyCouponLimitByLevel(userLevel: string): number {
  switch (userLevel.toLowerCase()) {
    case 'bronze': return 5;
    case 'silver': return 10;
    case 'gold': return 20;
    default: return 5;
  }
}

export function getMonthlyCouponLimit(userType: string, userLevel: string): number {
  try {
    const type = userType.toLowerCase();
    const level = userLevel.toLowerCase();
    // Busca o array de features do nível
    const features = userLevels[type]?.[level]?.benefits?.features || [];
    // Procura por um texto do tipo 'Pode resgatar até X cupons'
    const match = features.find(f => /pode resgatar até \d+ cupons?/i.test(f));
    if (match) {
      const num = match.match(/(\d+)/);
      if (num) return parseInt(num[1], 10);
    }
    // Fallback: retorna 5 se não encontrar
    return 5;
  } catch {
    return 5;
  }
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getRemainingCouponsForMonth(userLevel: string, couponsRedeemedThisMonth: number): number {
  const monthlyLimit = getMonthlyCouponLimitByLevel(userLevel);
  const remaining = monthlyLimit - couponsRedeemedThisMonth;
  return Math.max(0, remaining);
}

export function canRedeemCoupon(userLevel: string, couponsRedeemedThisMonth: number): boolean {
  return getRemainingCouponsForMonth(userLevel, couponsRedeemedThisMonth) > 0;
}

export const mockCouponsRedeemed: Record<string, Record<string, number>> = {
  'user123': { '2024-03': 3, '2024-04': 0 },
  'user456': { '2024-03': 5, '2024-04': 2 },
  'user789': { '2024-03': 8, '2024-04': 0 }
};

export function getCouponsRedeemedThisMonth(userId: string, monthKey?: string): number {
  const currentMonth = monthKey || getCurrentMonthKey();
  return mockCouponsRedeemed[userId]?.[currentMonth] || 0;
}

export function simulateCouponRedeem(userId: string, monthKey?: string): void {
  const currentMonth = monthKey || getCurrentMonthKey();
  if (!mockCouponsRedeemed[userId]) mockCouponsRedeemed[userId] = {};
  if (!mockCouponsRedeemed[userId][currentMonth]) mockCouponsRedeemed[userId][currentMonth] = 0;
  mockCouponsRedeemed[userId][currentMonth]++;
}
