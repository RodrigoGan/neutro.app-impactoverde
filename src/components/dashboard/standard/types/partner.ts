export type PartnerType = 'restaurant' | 'store' | 'educational';

export interface PartnerGoal {
  id: string;
  title: string;
  description: string;
  currentProgress: number;
  total: number;
  points: number;
  icon: string;
}

export interface RestaurantMetrics {
  couponsUsed: number;
  wasteReduced: number;
  fiveStarRatings: number;
  customersImpacted: number;
  activePromotions: number;
}

export interface StoreMetrics {
  couponsUsed: number;
  packagingRecycled: number;
  fiveStarRatings: number;
  customersImpacted: number;
  activePromotions: number;
}

export interface EducationalMetrics {
  studentsImpacted: number;
  activePrograms: number;
  wasteRecycled: number;
  fiveStarRatings: number;
  environmentalProjects: number;
}

export interface PartnerLevelRequirements {
  bronze: {
    coupons: number;
    months: number;
  };
  silver: {
    coupons: number;
    months: number;
  };
  gold: {
    coupons: number;
    months: number;
  };
} 