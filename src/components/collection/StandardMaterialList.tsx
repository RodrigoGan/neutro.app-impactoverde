import React from 'react';
import { Archive, Package, GlassWater, Recycle, Leaf, CircleDashed, Cpu, Droplets, Trash2, Battery, Lightbulb, TrashIcon } from 'lucide-react';
import { materialDisplayData } from '@/config/materialDisplayData';
import { getMaterialIdentificador } from '@/lib/utils';

interface Material {
  type: string; // identificador do material (ex: 'papel', 'plastico', etc)
  quantity: string | number;
  unit: string;
  descricao?: string;
}

interface StandardMaterialListProps {
  materiais: Material[];
}

const StandardMaterialList: React.FC<StandardMaterialListProps> = ({ materiais }) => {
  if (!materiais || materiais.length === 0) {
    return <span className="text-muted-foreground text-sm italic">Nenhum material informado.</span>;
  }
  return (
    <div className="space-y-1">
      {materiais.map((material, idx) => {
        const identificador = getMaterialIdentificador(material.type);
        const displayInfo = materialDisplayData[identificador];
        const Icon = displayInfo?.icone || Package;
        const cor = displayInfo?.cor || 'text-muted-foreground';
        const nome = displayInfo?.nome || material.type;
        return (
          <div key={idx} className="flex items-center gap-2">
            {displayInfo?.icone ? (
              <displayInfo.icone className={`inline-block mr-1 h-4 w-4 ${cor}`} />
            ) : (
              <Package className={`inline-block mr-1 h-4 w-4 ${cor}`} />
            )}
            <span className="font-medium">{nome}</span>
            {identificador === 'outros' && material.descricao && (
              <span className="italic text-xs text-muted-foreground ml-1">({material.descricao})</span>
            )}
            <span className="text-muted-foreground">{material.quantity} {material.unit}</span>
          </div>
        );
      })}
    </div>
  );
};

export default StandardMaterialList; 