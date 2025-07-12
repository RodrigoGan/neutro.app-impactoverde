import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { TRANSPORT_TYPES } from '@/constants/transportTypes';
import StandardCollectorVehicle from '@/components/dashboard/standard/StandardCollectorVehicle';
import { useVehicles } from '@/hooks/useVehicles';

export type VehicleType = 'car' | 'truck' | 'bike' | 'motorcycle' | 'cart' | 'other';

interface VehicleSelectorProps {
  selectedVehicle: string;
  onChange: (vehicle: string) => void;
  otherVehicleDescription: string;
  onOtherDescriptionChange: (description: string) => void;
  error?: string | null;
  userId?: string;
}

const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  selectedVehicle,
  onChange,
  otherVehicleDescription,
  onOtherDescriptionChange,
  error,
  userId
}) => {
  const { vehicles, loading, error: vehiclesError } = useVehicles(userId);

  // Usa veículos do banco se disponíveis, senão usa os tipos de transporte padrão
  const availableVehicles = vehicles.length > 0 ? vehicles : TRANSPORT_TYPES.map((type, index) => ({
    id: String(index + 1),
    type: type.value,
    description: type.label
  }));

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (vehiclesError) {
    return (
      <div className="text-red-500 text-sm">
        Erro ao carregar veículos: {vehiclesError}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {availableVehicles.map((vehicle) => (
          <button
            type="button"
            key={vehicle.id}
            className={`flex items-center gap-3 p-4 rounded-lg border transition-colors w-full text-left ${selectedVehicle === vehicle.type ? 'border-neutro bg-neutro/10 ring-2 ring-neutro' : 'border-border hover:border-neutro/50'}`}
            onClick={() => onChange(vehicle.type)}
          >
            <StandardCollectorVehicle vehicleType={vehicle.type} showLabel={true} />
          </button>
        ))}
      </div>
      {selectedVehicle === 'other' && (
        <div className="mt-2">
          <Label>Descreva o veículo</Label>
          <Input
            value={otherVehicleDescription}
            onChange={(e) => onOtherDescriptionChange(e.target.value)}
            placeholder="Descreva o tipo de veículo que você utiliza"
          />
        </div>
      )}
      {error && (
        <p className="text-red-500 text-xs mt-2">{error}</p>
      )}
    </div>
  );
};

export default VehicleSelector;