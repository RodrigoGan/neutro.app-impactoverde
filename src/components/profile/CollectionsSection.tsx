import React from 'react';
import { CollectionSummary } from '@/types/user';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Truck, Droplet, Zap, TreePine } from 'lucide-react';

interface CollectionsSectionProps {
  summary: CollectionSummary;
}

export const CollectionsSection: React.FC<CollectionsSectionProps> = ({
  summary
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Resumo das Coletas</h2>
        <Button 
          variant="outline"
          onClick={() => navigate('/collection-history')}
        >
          Ver Histórico Completo
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-[#8DC63F]" />
              <h3 className="font-medium">Total de Coletas</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{summary.totalCollections}</p>
            <div className="mt-2 text-sm text-muted-foreground">
              <span className="text-green-600">{summary.completedCollections} realizadas</span>
              {summary.pendingCollections > 0 && (
                <span className="ml-2">• {summary.pendingCollections} pendentes</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Materiais Mais Reciclados</h3>
            <div className="space-y-2">
              {summary.mostRecycledMaterials.map((material, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{material.material}</span>
                  <span className="text-sm font-medium">
                    {material.quantity} {material.unit}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Impacto Ambiental</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TreePine className="h-4 w-4 text-green-600" />
                <span className="text-sm flex-1">CO₂ Evitado</span>
                <span className="text-sm font-medium">{summary.environmentalImpact.co2Saved} kg</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplet className="h-4 w-4 text-blue-600" />
                <span className="text-sm flex-1">Água Economizada</span>
                <span className="text-sm font-medium">{summary.environmentalImpact.waterSaved} L</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                <span className="text-sm flex-1">Energia Economizada</span>
                <span className="text-sm font-medium">{summary.environmentalImpact.energySaved} kWh</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 