import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StandardCollectorVehicle from './StandardCollectorVehicle';

export const StandardCollectorVehicleExample: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Exemplos de Veículos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Tamanho Pequeno (sm)</h3>
          <div className="flex flex-wrap gap-2">
            <StandardCollectorVehicle vehicleType="foot" size="sm" />
            <StandardCollectorVehicle vehicleType="bicycle" size="sm" />
            <StandardCollectorVehicle vehicleType="motorcycle" size="sm" />
            <StandardCollectorVehicle vehicleType="car" size="sm" />
            <StandardCollectorVehicle vehicleType="truck" size="sm" />
            <StandardCollectorVehicle vehicleType="cart" size="sm" />
            <StandardCollectorVehicle 
              vehicleType="other" 
              otherVehicleDescription="Carroça" 
              size="sm" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Tamanho Médio (md) - Padrão</h3>
          <div className="flex flex-wrap gap-2">
            <StandardCollectorVehicle vehicleType="foot" />
            <StandardCollectorVehicle vehicleType="bicycle" />
            <StandardCollectorVehicle vehicleType="motorcycle" />
            <StandardCollectorVehicle vehicleType="car" />
            <StandardCollectorVehicle vehicleType="truck" />
            <StandardCollectorVehicle vehicleType="cart" />
            <StandardCollectorVehicle 
              vehicleType="other" 
              otherVehicleDescription="Carroça" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Tamanho Grande (lg)</h3>
          <div className="flex flex-wrap gap-2">
            <StandardCollectorVehicle vehicleType="foot" size="lg" />
            <StandardCollectorVehicle vehicleType="bicycle" size="lg" />
            <StandardCollectorVehicle vehicleType="motorcycle" size="lg" />
            <StandardCollectorVehicle vehicleType="car" size="lg" />
            <StandardCollectorVehicle vehicleType="truck" size="lg" />
            <StandardCollectorVehicle vehicleType="cart" size="lg" />
            <StandardCollectorVehicle 
              vehicleType="other" 
              otherVehicleDescription="Carroça" 
              size="lg" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Apenas Ícones (sem texto)</h3>
          <div className="flex flex-wrap gap-2">
            <StandardCollectorVehicle vehicleType="foot" showLabel={false} />
            <StandardCollectorVehicle vehicleType="bicycle" showLabel={false} />
            <StandardCollectorVehicle vehicleType="motorcycle" showLabel={false} />
            <StandardCollectorVehicle vehicleType="car" showLabel={false} />
            <StandardCollectorVehicle vehicleType="truck" showLabel={false} />
            <StandardCollectorVehicle vehicleType="cart" showLabel={false} />
            <StandardCollectorVehicle 
              vehicleType="other" 
              otherVehicleDescription="Carroça" 
              showLabel={false} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StandardCollectorVehicleExample; 