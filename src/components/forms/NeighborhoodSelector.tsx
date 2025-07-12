import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useNeighborhoods } from '@/hooks/useNeighborhoods';

interface NeighborhoodSelectorProps {
  selectedNeighborhoods: string[];
  onChange: (neighborhoods: string[]) => void;
}

const NeighborhoodSelector: React.FC<NeighborhoodSelectorProps> = ({
  selectedNeighborhoods,
  onChange
}) => {
  const { neighborhoods, loading, error } = useNeighborhoods();

  const handleNeighborhoodChange = (neighborhood: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedNeighborhoods, neighborhood]);
    } else {
      onChange(selectedNeighborhoods.filter(n => n !== neighborhood));
    }
  };

  const removeNeighborhood = (neighborhood: string) => {
    onChange(selectedNeighborhoods.filter(n => n !== neighborhood));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm">
        Erro ao carregar bairros: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {neighborhoods.map((neighborhood) => (
          <div key={neighborhood.id} className="flex items-center space-x-2">
            <Checkbox
              id={neighborhood.id}
              checked={selectedNeighborhoods.includes(neighborhood.name)}
              onCheckedChange={(checked) => 
                handleNeighborhoodChange(neighborhood.name, checked as boolean)
              }
            />
            <Label htmlFor={neighborhood.id}>{neighborhood.name}</Label>
          </div>
        ))}
      </div>

      {selectedNeighborhoods.length > 0 && (
        <div className="mt-4">
          <Label>Bairros selecionados:</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedNeighborhoods.map((neighborhood) => (
              <Badge key={neighborhood} variant="secondary">
                {neighborhood}
                <button
                  onClick={() => removeNeighborhood(neighborhood)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NeighborhoodSelector; 