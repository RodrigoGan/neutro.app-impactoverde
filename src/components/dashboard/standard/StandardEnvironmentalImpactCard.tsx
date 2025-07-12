import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Droplets, Trees, Zap, ArrowUpRight, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface EnvironmentalImpactData {
  co2: {
    total: number;
    unit?: string;
    label?: string;
  };
  trees: {
    total: number;
    label?: string;
  };
  water: {
    total: number;
    unit?: string;
    label?: string;
  };
  energy: {
    total: number;
    unit?: string;
    label?: string;
  };
  onDetailsClick?: () => void;
}

export const StandardEnvironmentalImpactCard: React.FC<EnvironmentalImpactData> = ({
  co2,
  trees,
  water,
  energy,
  onDetailsClick
}) => {
  const isEmpty =
    co2.total === 0 &&
    trees.total === 0 &&
    water.total === 0 &&
    energy.total === 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-bold">
          <Leaf className="h-5 w-5 text-neutro" />
          Impacto Ambiental
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="text-center text-muted-foreground py-8">
            Nenhum impacto registrado ainda. Recicle para começar a gerar impacto ambiental!
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4 flex flex-col items-center">
              <Wind className="h-6 w-6 text-green-600 mb-1" />
              <span className="text-2xl font-bold text-green-700">{co2.total}{co2.unit || 'kg'}</span>
              <span className="text-xs text-muted-foreground">CO₂ Evitado</span>
            </div>
            <div className="bg-green-50 rounded-lg p-4 flex flex-col items-center">
              <Trees className="h-6 w-6 text-green-600 mb-1" />
              <span className="text-2xl font-bold text-green-700">{trees.total}</span>
              <span className="text-xs text-muted-foreground">Árvores Preservadas</span>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center">
              <Droplets className="h-6 w-6 text-blue-600 mb-1" />
              <span className="text-2xl font-bold text-blue-700">{water.total}{water.unit || 'L'}</span>
              <span className="text-xs text-muted-foreground">Água Economizada</span>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 flex flex-col items-center">
              <Zap className="h-6 w-6 text-yellow-600 mb-1" />
              <span className="text-2xl font-bold text-yellow-700">{energy.total}{energy.unit || 'kWh'}</span>
              <span className="text-xs text-muted-foreground">Energia Poupada</span>
            </div>
            {onDetailsClick && (
              <Button
                variant="outline"
                className="w-full"
                onClick={onDetailsClick}
              >
                Ver Detalhes do Impacto
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 