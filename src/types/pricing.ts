export interface MaterialPrice {
  materialId: string;
  name: string;
  price: number;
  unit: string;
  isActive: boolean;
}

export interface PriceAdjustment {
  partnerId: string;
  partnerType: 'collector' | 'cooperative';
  partnerName: string;
  materialId: string;
  adjustmentType: 'percentage' | 'fixed';
  adjustmentValue: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PricingState {
  basePrices: MaterialPrice[];
  adjustments: PriceAdjustment[];
  isLoading: boolean;
  error: string | null;
} 