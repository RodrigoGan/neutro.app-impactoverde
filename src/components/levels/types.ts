export type Level = 'bronze' | 'silver' | 'gold';

export interface LevelRequirements {
  months: number;
  collections?: number;
  kg?: number;
  sales?: number;
  ratings?: number;
  activeCollectors?: number;
  activeCoupons?: number;
  points?: number;
  averageRating?: number;
}

export interface LevelBenefits {
  coupons?: number;
  logins?: number;
  features: string[];
  notes?: string[];
}

export interface UserLevel {
  name: string;
  description: string;
  requirements: LevelRequirements;
  benefits: LevelBenefits;
}

export interface UserLevels {
  common: {
    bronze: UserLevel;
    silver: UserLevel;
    gold: UserLevel;
  };
  collector: {
    bronze: UserLevel;
    silver: UserLevel;
    gold: UserLevel;
  };
  partner: {
    bronze: UserLevel;
    silver: UserLevel;
    gold: UserLevel;
  };
  cooperative: {
    bronze: UserLevel;
    silver: UserLevel;
    gold: UserLevel;
  };
  company: {
    bronze: UserLevel;
    silver: UserLevel;
    gold: UserLevel;
  };
}

export interface LevelSystem {
  common: {
    bronze: UserLevel;
    silver: UserLevel;
    gold: UserLevel;
  };
  collector: {
    bronze: UserLevel;
    silver: UserLevel;
    gold: UserLevel;
  };
  partner: {
    bronze: UserLevel;
    silver: UserLevel;
    gold: UserLevel;
  };
  cooperative: {
    bronze: UserLevel;
    silver: UserLevel;
    gold: UserLevel;
  };
  company: {
    bronze: UserLevel;
    silver: UserLevel;
    gold: UserLevel;
  };
} 