import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface Material {
  id: string;
  nome: string;
  tipo: string;
  materialId: string;
  quantidade: number | string;
  unidade: string;
  tipoMaterial: 'separado' | 'misturado';
  descricao?: string;
  estimativaKg?: number;
}

interface MaterialListProps {
  materiais: Material[];
  onRemove: (index: number) => void;
  materiaisDoBanco: any[];
  materialDisplayData: any;
  errors?: Record<string, string>;
}

const MaterialList: React.FC<MaterialListProps> = ({ materiais, onRemove, materiaisDoBanco, materialDisplayData, errors }) => {
  if (materiais.length === 0) return null;

  const getMaterialDisplay = (materialId: string) => {
    const materialInfo = materiaisDoBanco.find(m => m.id === materialId);
    const identificador = materialInfo?.identificador || 'outros';
    const displayInfo = materialDisplayData[identificador] || materialDisplayData.outros;
    return {
      Icon: displayInfo.icone,
      name: displayInfo.nome,
      cor: materialInfo?.cor || displayInfo.cor || 'text-gray-500'
    };
  };

  return (
    <div className="space-y-2">
      {materiais.map((material, index) => {
        const { Icon, name, cor } = getMaterialDisplay(material.materialId);
        return (
          <div key={material.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
            <div className="flex items-center gap-3 flex-1">
              <Icon className={`h-6 w-6 ${cor}`} />
              <div className="flex-1">
                <p className="font-medium">{name}</p>
                <p className="text-sm text-muted-foreground">
                  {material.quantidade} {material.unidade}
                  {material.estimativaKg && (
                    <span className="ml-2 text-xs text-green-600">
                      (≈ {material.estimativaKg.toFixed(1)} kg)
                    </span>
                  )}
                </p>
                {material.descricao && (
                  <p className="text-xs text-muted-foreground">{material.descricao}</p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(index)}
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      })}
    </div>
  );
};

export default MaterialList; 