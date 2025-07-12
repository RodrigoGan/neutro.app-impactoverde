import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';

export interface Material {
  id: string;
  tipo: string;
  quantidade: number;
  unidade: string;
}

interface MaterialFormProps {
  onAddMaterial: (material: Material) => void;
  onClose: () => void;
  materiaisDoBanco: any[];
}

export const MaterialForm: React.FC<MaterialFormProps> = ({ onAddMaterial, onClose, materiaisDoBanco }) => {
  const [selectedMaterialType, setSelectedMaterialType] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [unidade, setUnidade] = useState('');

  const handleSubmit = () => {
    if (selectedMaterialType && quantidade && unidade) {
      const materialInfo = materiaisDoBanco.find(m => m.id === selectedMaterialType);
      onAddMaterial({
        id: Date.now().toString(),
        tipo: materialInfo?.nome || 'Desconhecido',
        quantidade: Number(quantidade),
        unidade
      });
      setSelectedMaterialType('');
      setQuantidade('');
      setUnidade('');
      onClose();
    }
  };

  return (
    <Card className="border-dashed">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Material</Label>
              <Select value={selectedMaterialType} onValueChange={setSelectedMaterialType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o material" />
                </SelectTrigger>
                <SelectContent>
                  {materiaisDoBanco.map((material) => (
                    <SelectItem key={material.id} value={material.id}>
                      {material.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade</Label>
              <Input
                id="quantidade"
                type="number"
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
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="sacos">sacos</SelectItem>
                  <SelectItem value="un">un</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleSubmit}>
              Adicionar Material
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 