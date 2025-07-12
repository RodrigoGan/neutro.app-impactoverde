export interface Address {
  id: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isMain: boolean;
  region: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress?: number;
}

export interface CollectionSummary {
  totalCollections: number;
  completedCollections: number;
  pendingCollections: number;
  mostRecycledMaterials: Array<{
    material: string;
    quantity: number;
    unit: string;
  }>;
  environmentalImpact: {
    co2Saved: number;
    waterSaved: number;
    energySaved: number;
  };
}

export interface NotificationPreference {
  type: 'email' | 'sms' | 'push';
  enabled: boolean;
  categories: {
    collections: boolean;
    achievements: boolean;
    promotions: boolean;
    system: boolean;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  avatar?: string;
  level: number;
  points: number;
  nextLevelPoints: number;
  addresses: Address[];
  achievements: Achievement[];
  collectionSummary: CollectionSummary;
  notificationPreferences: NotificationPreference[];
  createdAt: Date;
  updatedAt: Date;
} 