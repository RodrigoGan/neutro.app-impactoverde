import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MaterialPrice } from '@/types/pricing';

interface PricingCardProps {
  materials: MaterialPrice[];
}

export const PricingCard: React.FC<PricingCardProps> = ({ materials }) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-neutro" />
          Precificação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Lista de preços atuais */}
          <div className="space-y-2">
            {materials.map((material) => (
              <div 
                key={material.materialId}
                className="flex justify-between items-center p-2 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{material.name}</span>
                  {!material.isActive && (
                    <Badge variant="secondary">Inativo</Badge>
                  )}
                </div>
                <Badge variant="outline" className="font-mono">
                  R$ {material.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/{material.unit}
                </Badge>
              </div>
            ))}
          </div>
          
          <Button 
            onClick={() => navigate('/company/pricing')}
            className="w-full"
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar Preços
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 