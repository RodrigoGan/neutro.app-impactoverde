import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Archive, Package, Recycle, GlassWater, Leaf, CircleDashed, Cpu, Droplets, Battery, Lightbulb, TrashIcon } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useMaterials } from '@/hooks/useMaterials';

const materialDisplayData = {
  papel: { nome: 'Papel/Papelão', icone: Archive, cor: 'text-yellow-700' },
  plastico: { nome: 'Plástico', icone: Package, cor: 'text-blue-600' },
  vidro: { nome: 'Vidro', icone: GlassWater, cor: 'text-green-700' },
  metal: { nome: 'Metal (geral)', icone: Recycle, cor: 'text-gray-500' },
  aluminio: { nome: 'Alumínio (lata, etc)', icone: Recycle, cor: 'text-gray-500' },
  cobre: { nome: 'Cobre', icone: CircleDashed, cor: 'text-orange-700' },
  oleo: { nome: 'Óleo de Cozinha Usado', icone: Droplets, cor: 'text-amber-700' },
  eletronico: { nome: 'Eletrônicos Pequenos', icone: Cpu, cor: 'text-purple-700' },
  pilhas: { nome: 'Pilhas e Baterias', icone: Battery, cor: 'text-red-700' },
  lampadas: { nome: 'Lâmpadas', icone: Lightbulb, cor: 'text-blue-700' },
  organico: { nome: 'Orgânico Compostável', icone: Leaf, cor: 'text-green-500' },
  outros: { nome: 'Outros (especificar)', icone: TrashIcon, cor: 'text-neutral-500' },
};

export interface Material {
  id: string;
  tipo: string;
  quantidade: number;
  unidade: string;
  kg_equivalente?: number;
  descricao?: string;
  material_id: string;
}

interface MaterialFormProps {
  onAddMaterial: (material: Material) => void;
  onClose: () => void;
}

const UNIDADES = [
  { value: 'kg', label: 'Quilogramas (kg)' },
  { value: 'sacos', label: 'Sacos' },
  { value: 'L', label: 'Litros (L)' },
  { value: 'un', label: 'Unidades' }
];

export const MaterialForm: React.FC<MaterialFormProps> = ({ onAddMaterial, onClose }) => {
  const [tipo, setTipo] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [unidade, setUnidade] = useState('');
  const [descricaoOutros, setDescricaoOutros] = useState('');
  
  const { materials, loading, error } = useMaterials();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedMaterial = materials.find(m => m.id === tipo);
    if (!selectedMaterial || !quantidade || !unidade) {
      return;
    }
    if (selectedMaterial.id === 'outros' && !descricaoOutros.trim()) {
      return;
    }

    const displayInfo = materialDisplayData[selectedMaterial.id as keyof typeof materialDisplayData];
    const nomeMaterial = displayInfo ? displayInfo.nome : selectedMaterial.nome;

    const quantidadeNum = Number(quantidade);

    const material: Material = {
      id: Date.now().toString(),
      tipo: nomeMaterial,
      material_id: selectedMaterial.id,
      quantidade: quantidadeNum,
      unidade,
      ...(selectedMaterial.id === 'outros' ? { descricao: descricaoOutros } : {})
    };

    onAddMaterial(material);
    setTipo('');
    setQuantidade('');
    setUnidade('');
    setDescricaoOutros('');
  };

  const selectedMaterialForDesc = materials.find(m => m.id === tipo);

  if (loading) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-10 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-red-500 text-sm">
            Erro ao carregar materiais: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Material</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {materials.map(material => {
                    const displayInfo = materialDisplayData[material.id as keyof typeof materialDisplayData];
                    
                    return (
                      <SelectItem key={material.id} value={material.id}>
                        <div className="flex items-center gap-2">
                          {displayInfo && <displayInfo.icone className={`${displayInfo.cor} h-5 w-5`} />}
                          <span>{displayInfo ? displayInfo.nome : material.nome}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade</Label>
              <Input
                id="quantidade"
                type="number"
                min="0"
                step="0.1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unidade">Unidade</Label>
              <Select value={unidade} onValueChange={setUnidade}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  {UNIDADES.map(unidade => (
                    <SelectItem key={unidade.value} value={unidade.value}>
                      {unidade.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedMaterialForDesc?.id === 'outros' && (
            <div className="space-y-2">
              <Label htmlFor="descricaoOutros">Descreva o material</Label>
              <Input
                id="descricaoOutros"
                value={descricaoOutros}
                onChange={e => setDescricaoOutros(e.target.value)}
                placeholder="Ex: Isopor, madeira, etc."
                required
              />
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button type="submit" className="flex-1">
              Adicionar Material
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 