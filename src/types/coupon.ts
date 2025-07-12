export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  discount: string;
  store: string;
  storeAddress: string;
  businessHours: string;
  validUntil: string;
  status: 'active' | 'expired' | 'used';
  category: string;
  conditions: string[];
  motivo?: string;
} 