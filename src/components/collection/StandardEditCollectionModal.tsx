import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Trash2, X as XIcon, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { validateImage, compressImage } from '@/utils/imageUtils';
import StandardMaterialList from './StandardMaterialList';
import { materialDisplayData } from '@/config/materialDisplayData';
import { getAllMaterials } from '@/lib/collectorService';
import { getMaterialIdentificador } from '@/lib/utils';

const UNIDADES_PADRAO = ['kg', 'un', 'sacos', 'L'];

interface Material {
  type: string;
  quantity: string | number;
  unit: string;
  descricao?: string;
  fotos?: string[];
}

interface StandardEditCollectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coleta: {
    materiais: Material[];
    fotos?: string[];
    observacoes?: string;
    observacaoCooperativa?: string;
  };
  onSave: (dados: { materiais: Material[]; fotos: string[]; observacaoCooperativa: string }) => void;
}

const StandardEditCollectionModal: React.FC<StandardEditCollectionModalProps> = ({ open, onOpenChange, coleta, onSave }) => {
  const [materiais, setMateriais] = useState<Material[]>(Array.isArray(coleta.materiais) ? coleta.materiais : []);
  const [observacaoCooperativa, setObservacaoCooperativa] = useState(coleta.observacaoCooperativa || '');
  const [fotos, setFotos] = useState<string[]>(coleta.fotos || []);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ type: '', quantity: '', unit: 'kg', descricao: '' });
  const [materiaisInvalidos, setMateriaisInvalidos] = useState<number[]>([]);
  const [materiaisLoading, setMateriaisLoading] = useState(false);
  const [materiaisError, setMateriaisError] = useState<string | null>(null);
  const [materiaisDb, setMateriaisDb] = useState<any[]>([]);

  // Buscar materiais do banco de dados
  useEffect(() => {
    const fetchMateriais = async () => {
      setMateriaisLoading(true);
      setMateriaisError(null);
      try {
        console.log('DEBUG - Buscando materiais do banco...');
        const materiaisData = await getAllMaterials();
        console.log('DEBUG - Materiais carregados:', materiaisData);
        setMateriaisDb(materiaisData);
      } catch (error) {
        console.error('Erro ao carregar materiais:', error);
        setMateriaisError('Erro ao carregar materiais. Tente novamente.');
        toast.error('Erro ao carregar materiais. Tente novamente.');
      } finally {
        setMateriaisLoading(false);
      }
    };

    if (open) {
      fetchMateriais();
    }
  }, [open]);

  useEffect(() => {
    // Normaliza os materiais recebidos para garantir que type seja sempre o identificador do banco
    const materiaisNormalizados = Array.isArray(coleta.materiais)
      ? coleta.materiais.map(mat => ({ ...mat, type: getMaterialIdentificador(mat.type) }))
      : [];
    setMateriais(materiaisNormalizados);
    setObservacaoCooperativa(coleta.observacaoCooperativa || '');
    setFotos(Array.isArray(coleta.fotos) ? coleta.fotos : []);
  }, [coleta, open]);

  const handleMaterialChange = (index: number, field: keyof Material, value: string) => {
    setMateriais(materiais.map((m, i) =>
      i === index
        ? {
            ...m,
            [field]: field === 'type' ? getMaterialIdentificador(value) : value
          }
        : m
    ));
  };

  const handleAddMaterial = () => {
    setMateriais([...materiais, { type: '', quantity: '', unit: 'kg' }]);
  };

  const handleRemoveMaterial = (index: number) => {
    setMateriais(materiais.filter((_, i) => i !== index));
  };

  const handleFotosChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    // Converter para base64 para visualização
      const newFotos: string[] = [];
    for (let i = 0; i < files.length && fotos.length + newFotos.length < 3; i++) {
      const file = files[i];
        const reader = new FileReader();
        reader.onloadend = () => {
          newFotos.push(reader.result as string);
        if (newFotos.length === files.length || fotos.length + newFotos.length === 3) {
            setFotos(prev => [...prev, ...newFotos].slice(0, 3));
          }
        };
      reader.readAsDataURL(file);
    }
  };

  const algumInvalido = materiais.some(mat => !mat.type || !mat.quantity);

  const handleSave = () => {
    // Normaliza os materiais antes de salvar
    const materiaisValidos = materiais
      .filter(mat => mat.type && mat.quantity && mat.unit)
      .map(mat => ({ ...mat, type: getMaterialIdentificador(mat.type) }));
    const indicesInvalidos = materiais.map((mat, idx) => (!mat.type || !mat.quantity) ? idx : -1).filter(idx => idx !== -1);
    setMateriaisInvalidos(indicesInvalidos);
    if (indicesInvalidos.length > 0) {
      toast.error('Preencha o tipo e a quantidade de todos os materiais antes de registrar.');
      return;
    }
    
    // Distribuir fotos entre os materiais (se houver fotos e materiais)
    const materiaisComFotos = materiaisValidos.map((mat, index) => {
      if (fotos.length > 0 && index < fotos.length) {
        return { ...mat, fotos: [fotos[index]] };
      }
      return { ...mat, fotos: mat.fotos || [] };
    });
    
    onSave({ materiais: materiaisComFotos, fotos, observacaoCooperativa });
    onOpenChange(false);
  };

  // Renderizar conteúdo do select de materiais
  const renderMaterialOptions = () => {
    if (materiaisLoading) {
      return (
        <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Carregando materiais...</span>
        </div>
      );
    }

    if (materiaisError) {
      return (
        <div className="p-2 text-sm text-red-500">
          Erro ao carregar materiais
        </div>
      );
    }

    return materiaisDb.map((material) => {
      const displayInfo = materialDisplayData[material.identificador];
      if (!displayInfo) {
        console.warn(`Material ${material.identificador} não encontrado no materialDisplayData`);
        return null;
      }

      return (
        <SelectItem key={material.id} value={material.identificador}>
          <div className="flex items-center gap-2">
            <displayInfo.icone className={`h-4 w-4 ${displayInfo.cor}`} />
            <span>{displayInfo.nome}</span>
          </div>
        </SelectItem>
      );
    }).filter(Boolean);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Coleta</DialogTitle>
          <DialogDescription>
            Edite os materiais coletados e adicione observações da cooperativa.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Materiais */}
          <div>
            <Label>Materiais</Label>
            {/* Lista visual dos materiais já cadastrados */}
            <div className="space-y-1 mb-2">
            {materiais.map((mat, idx) => (
              <div key={idx} className="flex flex-col gap-1 w-full">
                <div className="flex items-center gap-2 w-full">
                  <StandardMaterialList materiais={[mat]} />
                  <button type="button" className="ml-2" onClick={() => handleRemoveMaterial(idx)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
                {mat.type === 'outros' && (
                  <Input
                    className="ml-6 mt-1"
                    placeholder="Descreva o material..."
                    value={mat.descricao || ''}
                    onChange={e => handleMaterialChange(idx, 'descricao', e.target.value)}
                  />
                )}
                {materiaisInvalidos.includes(idx) && (
                  <span className="text-xs text-red-500 ml-2">Preencha todos os campos</span>
                )}
              </div>
            ))}
            </div>
            {/* Formulário para adicionar novo material */}
            {showAddForm ? (
              <div className="flex flex-col gap-2 mb-2 w-full">
                <div className="flex gap-2 items-center w-full">
                  <Select value={newMaterial.type} onValueChange={v => setNewMaterial(m => ({ ...m, type: v }))}>
                    <SelectTrigger className="h-9 px-2 text-sm w-2/5">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {renderMaterialOptions()}
                    </SelectContent>
                  </Select>
                  <Input
                    value={newMaterial.quantity}
                    onChange={e => setNewMaterial(m => ({ ...m, quantity: e.target.value }))}
                    placeholder="Quant."
                    className="h-9 px-2 text-sm w-1/4"
                    inputMode="numeric"
                  />
                  <Select value={newMaterial.unit} onValueChange={v => setNewMaterial(m => ({ ...m, unit: v }))}>
                    <SelectTrigger className="h-9 px-2 text-sm w-1/4">
                      <SelectValue placeholder="Unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIDADES_PADRAO.map((unidade) => (
                        <SelectItem key={unidade} value={unidade}>{unidade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {newMaterial.type === 'outros' && (
                  <Input
                    className="w-full mt-1"
                    placeholder="Descreva o material..."
                    value={newMaterial.descricao || ''}
                    onChange={e => setNewMaterial(m => ({ ...m, descricao: e.target.value }))}
                  />
                )}
                <Button variant="default" size="sm" className="self-end mt-1" onClick={() => {
                  if (newMaterial.type && newMaterial.quantity) {
                    setMateriais([
                      ...materiais,
                      {
                        ...newMaterial,
                        type: getMaterialIdentificador(newMaterial.type),
                        descricao: newMaterial.type === 'outros' ? newMaterial.descricao || '' : undefined
                      }
                    ]);
                    setNewMaterial({ type: '', quantity: '', unit: 'kg', descricao: '' });
                    setShowAddForm(false);
                  }
                }}>
                  Adicionar Material
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)} className="mt-1">Adicionar Material</Button>
            )}
          </div>
          {/* Fotos */}
          <div>
            <Label className="flex items-center gap-2"><ImageIcon className="h-4 w-4 text-green-700" />Fotos dos Materiais (máx. 3)</Label>
            <div className="text-xs text-muted-foreground mb-2">
              As fotos serão associadas aos materiais na ordem: 1ª foto → 1º material, 2ª foto → 2º material, etc.
            </div>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleFotosChange}
              disabled={fotos.length >= 3}
              className="mt-1"
            />
            <div className="flex gap-2 mt-2">
              {fotos.map((foto, idx) => (
                <div key={idx} className="relative">
                  <img src={foto} alt={`Foto ${idx+1}`} className="w-16 h-16 object-cover rounded" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-1">
                    Material {idx + 1}
                  </div>
                  <button type="button" className="absolute top-0 right-0 bg-white rounded-full p-0.5" onClick={() => setFotos(fotos.filter((_, i) => i !== idx))}>
                    <XIcon className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {fotos.length > 0 ? `${fotos.length} foto(s) selecionada(s)` : 'Nenhuma foto enviada ainda.'}
            </div>
          </div>
          {/* Observação do solicitante (somente leitura) */}
          <div>
            <Label>Observação do Solicitante</Label>
            <Textarea value={coleta.observacoes || ''} readOnly className="bg-muted" />
          </div>
          {/* Observação do coletor (editável) */}
          <div>
            <Label>Observação do Coletor</Label>
            <Textarea value={observacaoCooperativa} onChange={e => setObservacaoCooperativa(e.target.value)} placeholder="Adicionar observação do coletor..." />
          </div>
        </div>
        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button 
            onClick={handleSave} 
            className="bg-green-500 hover:bg-green-600 text-white" 
            disabled={loading || materiaisLoading}
          >
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StandardEditCollectionModal; 