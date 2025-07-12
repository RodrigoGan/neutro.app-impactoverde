import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { validateImage, compressImage } from '@/utils/imageUtils';
import { materialDisplayData } from '@/config/materialDisplayData';
import { getAllMaterials } from '@/lib/collectorService';

const UNIDADES_PADRAO = ['kg', 'un', 'sacos', 'L'];

interface Material {
  type: string;
  quantity: string | number;
  unit: string;
  fotos?: string[];
}

interface StandardRegisterCollectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coleta: {
    materiais: Material[];
    fotos?: string[];
    observacoes?: string;
    observacaoCooperativa?: string;
  };
  onSave: (dados: { materiais: Material[]; fotos: string[]; observacoes: string }) => void;
}

const StandardRegisterCollectionModal: React.FC<StandardRegisterCollectionModalProps> = ({ open, onOpenChange, coleta, onSave }) => {
  const [materiais, setMateriais] = useState<Material[]>(coleta.materiais && coleta.materiais.length > 0 ? coleta.materiais : []);
  const [observacoes, setObservacoes] = useState(coleta.observacaoCooperativa || '');
  const [fotos, setFotos] = useState<string[]>(coleta.fotos || []);
  const [loading, setLoading] = useState(false);
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
    // Remover materiais totalmente vazios ao abrir (mas permitir quantidade zero)
    const materiaisFiltrados = (coleta.materiais || []).filter(mat => mat.type && mat.unit);
    setMateriais(materiaisFiltrados);
    setObservacoes(coleta.observacaoCooperativa || '');
    setFotos(coleta.fotos || []);
  }, [coleta, open]);

  const handleMaterialChange = (index: number, field: keyof Material, value: string) => {
    setMateriais(materiais.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };

  const handleAddMaterial = () => {
    // Não permite adicionar novo se o último está incompleto
    if (materiais.length > 0) {
      const ultimo = materiais[materiais.length - 1];
      if (!ultimo.type || !ultimo.quantity || !ultimo.unit) {
        toast.error('Preencha o material anterior antes de adicionar outro.');
        return;
      }
    }
    setMateriais([...materiais, { type: '', quantity: '', unit: 'kg' }]);
  };

  const handleRemoveMaterial = (index: number) => {
    setMateriais(materiais.filter((_, i) => i !== index));
  };

  const handleFotosChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    try {
      setLoading(true);
      const newFotos: string[] = [];

      for (let i = 0; i < e.target.files.length && fotos.length + newFotos.length < 3; i++) {
        const file = e.target.files[i];
        
        // Validar imagem
        const validation = validateImage(file);
        if (!validation.isValid) {
          toast.error(validation.error);
          continue;
        }

        // Comprimir imagem
        const compressedBlob = await compressImage(file);
        const reader = new FileReader();
        
        reader.onloadend = () => {
          newFotos.push(reader.result as string);
          if (newFotos.length === e.target.files!.length) {
            setFotos(prev => [...prev, ...newFotos].slice(0, 3));
          }
        };

        reader.readAsDataURL(compressedBlob);
      }
    } catch (error) {
      console.error('Erro ao processar imagens:', error);
      toast.error('Erro ao processar imagens. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const algumInvalido = materiais.some(mat => !mat.type || !mat.quantity);

  const handleSave = () => {
    const materiaisValidos = materiais.filter(mat => mat.type || mat.quantity || mat.unit);
    if (algumInvalido) {
      toast.error('Preencha o tipo e a quantidade de todos os materiais antes de registrar.');
      return;
    }
    onSave({ materiais: materiaisValidos, fotos, observacoes });
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
          <DialogTitle>Registrar Coleta</DialogTitle>
          <DialogDescription>
            Preencha os materiais coletados e adicione fotos se necessário.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Materiais */}
          <div>
            <Label>Materiais</Label>
            {materiais.map((mat, idx) => (
              <div key={idx} className="flex gap-2 items-center mb-2">
                <Select value={mat.type} onValueChange={v => handleMaterialChange(idx, 'type', v)}>
                  <SelectTrigger className="h-9 px-2 text-sm w-2/5">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {renderMaterialOptions()}
                  </SelectContent>
                </Select>
                <Input
                  value={mat.quantity}
                  onChange={e => handleMaterialChange(idx, 'quantity', e.target.value)}
                  placeholder="Quant."
                  className="h-9 px-2 text-sm w-1/4"
                  inputMode="numeric"
                />
                <Select value={mat.unit} onValueChange={v => handleMaterialChange(idx, 'unit', v)}>
                  <SelectTrigger className="h-9 px-2 text-sm w-1/4">
                    <SelectValue placeholder="Unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIDADES_PADRAO.map((unidade) => (
                      <SelectItem key={unidade} value={unidade}>{unidade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveMaterial(idx)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={handleAddMaterial} className="mt-1">Adicionar Material</Button>
          </div>
          {/* Fotos */}
          <div>
            <Label>Fotos (máx. 3)</Label>
            <div className="flex gap-2 mb-2">
              {fotos.map((foto, idx) => (
                <div key={idx} className="relative group">
                  <img src={foto} alt={`Foto ${idx + 1}`} className="w-20 h-20 object-cover rounded border" />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-white bg-opacity-80 rounded-full p-1 m-1 text-destructive opacity-0 group-hover:opacity-100 transition"
                    onClick={() => setFotos(fotos.filter((_, i) => i !== idx))}
                    title="Excluir foto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            {fotos.length < 3 && (
              <Input type="file" multiple accept="image/*" onChange={handleFotosChange} disabled={loading} />
            )}
            <div className="text-xs text-muted-foreground mt-1">{loading ? 'Processando imagens...' : fotos.length > 0 ? `${fotos.length} foto(s) selecionada(s)` : 'Nenhuma foto enviada ainda.'}</div>
          </div>
          {/* Observação do solicitante (somente leitura) */}
          {coleta.observacoes && (
            <div>
              <Label>Observação do Solicitante</Label>
              <Textarea value={coleta.observacoes} readOnly className="bg-muted" />
            </div>
          )}
          {/* Observação do coletor (editável) */}
          <div>
            <Label>Observação do Coletor</Label>
            <Textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Adicionar observação do coletor..." />
          </div>
        </div>
        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white" disabled={algumInvalido || loading || materiaisLoading}>Registrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StandardRegisterCollectionModal; 