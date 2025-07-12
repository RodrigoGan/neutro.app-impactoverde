import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TRANSPORT_TYPES } from '@/constants/transportTypes';
import { 
  User, 
  Bike, 
  Car, 
  Truck, 
  ShoppingCart,
  Truck as OtherIcon
} from 'lucide-react';

interface StandardCollectorVehicleProps {
  vehicleType: string;
  otherVehicleDescription?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const vehicleIcons: Record<string, { icon: React.ReactNode; color: string }> = {
  foot: { 
    icon: <User className="h-4 w-4" />, 
    color: 'text-blue-600 bg-blue-50' 
  },
  bicycle: { 
    icon: <Bike className="h-4 w-4" />, 
    color: 'text-green-600 bg-green-50' 
  },
  motorcycle: { 
    icon: <Bike className="h-4 w-4 -rotate-45" />, 
    color: 'text-orange-600 bg-orange-50' 
  },
  car: { 
    icon: <Car className="h-4 w-4" />, 
    color: 'text-purple-600 bg-purple-50' 
  },
  truck: { 
    icon: <Truck className="h-4 w-4" />, 
    color: 'text-red-600 bg-red-50' 
  },
  cart: { 
    icon: <ShoppingCart className="h-4 w-4" />, 
    color: 'text-yellow-600 bg-yellow-50' 
  },
  other: { 
    icon: <OtherIcon className="h-4 w-4" />, 
    color: 'text-gray-600 bg-gray-50' 
  }
};

const sizeClasses = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1.5',
  lg: 'text-base px-4 py-2'
};

export const StandardCollectorVehicle: React.FC<StandardCollectorVehicleProps> = ({
  vehicleType,
  otherVehicleDescription,
  size = 'md',
  showLabel = true
}) => {
  const vehicle = TRANSPORT_TYPES.find(v => v.value === vehicleType);
  const vehicleIcon = vehicleIcons[vehicleType];

  if (!vehicle || !vehicleIcon) return null;

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="secondary" 
        className={`${vehicleIcon.color} ${sizeClasses[size]} flex items-center gap-1`}
      >
        {vehicleIcon.icon}
        {showLabel && (
          <span>
            {vehicleType === 'other' && otherVehicleDescription 
              ? otherVehicleDescription 
              : vehicle.label}
          </span>
        )}
      </Badge>
    </div>
  );
};

export default StandardCollectorVehicle; 