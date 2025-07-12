import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Address } from '@/hooks/useAddress';

interface AddressCardProps {
  address: Address;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  isSelected,
  onSelect,
  onRemove
}) => {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-colors hover:bg-accent",
        isSelected && "border-neutro bg-accent"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-neutro" />
              <h4 className="font-medium">
                {address.logradouro}, {address.numero}
                {address.complemento && ` - ${address.complemento}`}
              </h4>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {address.bairro}, {address.cidade} - {address.estado}
            </p>
            <p className="text-sm text-muted-foreground">
              CEP: {address.cep}
            </p>
            {address.referencia && (
              <p className="text-sm text-muted-foreground mt-1">
                Referência: {address.referencia}
              </p>
            )}
          </div>
          <div className="flex items-start gap-2">
            {isSelected && (
              <Badge variant="secondary">Selecionado</Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 