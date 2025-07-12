import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Plus, Trash2, Search, DollarSign, ShoppingCart } from 'lucide-react';
import { MaterialPrice, PriceAdjustment } from '@/types/pricing';
import { toast } from 'sonner';
import { materialDisplayData } from '@/config/materialDisplayData';

// Mock de dados (em produção, viria do backend) - usando identificadores corretos
const mockMaterials: MaterialPrice[] = [
  { materialId: '1', name: 'papel', price: 0.50, unit: 'kg', isActive: true },
  { materialId: '2', name: 'plastico', price: 0.30, unit: 'kg', isActive: true },
  { materialId: '3', name: 'aluminio', price: 2.00, unit: 'kg', isActive: true },
  { materialId: '4', name: 'vidro', price: 0.20, unit: 'kg', isActive: true },
  { materialId: '5', name: 'organico', price: 0.10, unit: 'kg', isActive: true },
];

const mockPartners = [
  { id: '1', name: 'Cooperativa Verde', type: 'cooperative' },
  { id: '2', name: 'Coletor João Silva', type: 'collector' },
  { id: '3', name: 'Cooperativa Recicla Mais', type: 'cooperative' },
  { id: '4', name: 'Coletor Maria Santos', type: 'collector' },
];

// Função para obter o nome amigável do material
function getMaterialDisplayName(identificador: string): string {
  return materialDisplayData[identificador]?.nome || identificador;
}

// Função para obter o ícone do material
function getMaterialIcon(identificador: string) {
  const Icon = materialDisplayData[identificador]?.icone || ShoppingCart;
  const cor = materialDisplayData[identificador]?.cor || 'text-neutral-400';
  return <Icon className={`inline-block mr-1 ${cor} h-4 w-4`} />;
}

export const CompanyPricing: React.FC = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<MaterialPrice[]>(mockMaterials);
  const [originalMaterials, setOriginalMaterials] = useState<MaterialPrice[]>(mockMaterials);
  const [searchPartner, setSearchPartner] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<any | null>(null);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [newMaterial, setNewMaterial] = useState<Partial<MaterialPrice>>({
    name: '',
    price: 0,
    unit: 'kg',
    isActive: true
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedMaterialType, setSelectedMaterialType] = useState<string>(Object.keys(materialDisplayData)[0]);
  const [partnerAdjustments, setPartnerAdjustments] = useState<Record<string, { [materialId: string]: number }>>({});
  const [originalPartnerAdjustments, setOriginalPartnerAdjustments] = useState<Record<string, { [materialId: string]: number }>>({});
  const [savingAdjustments, setSavingAdjustments] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filtragem de parceiros
  const filteredPartners = mockPartners.filter(partner => 
    partner.name.toLowerCase().includes(searchPartner.toLowerCase())
  );

  // Função para formatar preço no formato brasileiro
  const formatPrice = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Função para converter string formatada em número
  const parsePrice = (value: string): number => {
    return parseFloat(value.replace('.', '').replace(',', '.'));
  };

  // Função para lidar com a mudança no input de preço base (permite digitação livre)
  const handleBasePriceInputChange = (materialId: string, value: string) => {
    // Atualiza o estado do material com o valor bruto do input
    setMaterials(materials.map(m => 
      m.materialId === materialId ? { ...m, price: value as any } : m // Armazena como string temporariamente
    ));
  };

  // Função para formatar o preço base ao perder o foco do input
  const handleBasePriceInputBlur = (materialId: string, value: string) => {
    const numericPrice = parsePrice(value);
    // Se for um número válido, atualiza com o número formatado
    if (!isNaN(numericPrice)) {
      setMaterials(materials.map(m => 
        m.materialId === materialId ? { ...m, price: numericPrice } : m
      ));
    } else {
      // Se não for um número válido (ex: só R$), reverte para o último valor numérico válido ou 0
       setMaterials(materials.map(m => 
        m.materialId === materialId ? { ...m, price: Number(m.price) || 0 } : m // Reverte para o número anterior ou 0
      ));
    }
  };

  // Função para adicionar novo material
  const handleAddMaterial = () => {
    if (!newMaterial.name) return;
    
    const material: MaterialPrice = {
      materialId: Date.now().toString(),
      name: newMaterial.name,
      price: newMaterial.price || 0,
      unit: newMaterial.unit || 'kg',
      isActive: true
    };

    setMaterials([...materials, material]);
    setNewMaterial({ name: '', price: 0, unit: 'kg', isActive: true });
    setShowAddMaterial(false);
  };

  // Função para remover material
  const handleDeleteMaterial = (materialId: string) => {
    setMaterials(materials.filter(m => m.materialId !== materialId));
    setShowDeleteConfirm(null);
  };

  // Atualizar nome do material ao selecionar tipo
  const handleSelectMaterialType = (type: string) => {
    setSelectedMaterialType(type);
    if (type !== 'outros') {
      setNewMaterial({ ...newMaterial, name: type });
    } else {
      setNewMaterial({ ...newMaterial, name: '' });
    }
  };

  // Atualizar ajuste de material para o parceiro selecionado
  const handleAdjustmentChange = (materialId: string, value: any) => {
    if (!selectedPartner) return;
    setPartnerAdjustments(prev => ({
      ...prev,
      [selectedPartner.id]: {
        ...prev[selectedPartner.id],
        [materialId]: value
      }
    }));
  };

  // Função para formatar o valor do ajuste ao perder o foco do input
  const handleAdjustmentInputBlur = (partnerId: string, materialId: string, value: string) => {
    const numericValue = parsePrice(value);
    setPartnerAdjustments(prev => ({
      ...prev,
      [partnerId]: {
        ...prev[partnerId],
        [materialId]: isNaN(numericValue) ? 0 : numericValue
      }
    }));
  };

  // Função para cancelar alterações nos materiais
  const handleCancelMaterials = () => {
    setMaterials(originalMaterials);
  };

  // Função para cancelar alterações nos ajustes de parceiro
  const handleCancelPartnerAdjustments = () => {
    if (selectedPartner) {
      setPartnerAdjustments(prev => ({
        ...prev,
        [selectedPartner.id]: originalPartnerAdjustments[selectedPartner.id] || {}
      }));
    }
  };

  // Atualizar originalMaterials quando materials mudar
  useEffect(() => {
    setOriginalMaterials(materials);
  }, []);

  // Atualizar originalPartnerAdjustments quando partnerAdjustments mudar
  useEffect(() => {
    if (selectedPartner) {
      setOriginalPartnerAdjustments(prev => ({
        ...prev,
        [selectedPartner.id]: partnerAdjustments[selectedPartner.id] || {}
      }));
    }
  }, [selectedPartner]);

  // Salvar ajustes (mock)
  const handleSaveAdjustments = () => {
    setSavingAdjustments(true);
    setTimeout(() => {
      setSavingAdjustments(false);
      toast.success('Ajustes salvos com sucesso!');
      // Atualizar os estados originais após salvar
      setOriginalMaterials(materials);
      if (selectedPartner) {
        setOriginalPartnerAdjustments(prev => ({
          ...prev,
          [selectedPartner.id]: partnerAdjustments[selectedPartner.id] || {}
        }));
      }
    }, 1000);
  };

  // Função para calcular o preço final com ajuste
  const calculateFinalPrice = (basePrice: number, adjustment?: number): number => {
    if (!adjustment) return basePrice;
    return basePrice + adjustment;
  };

  return (
    <Layout>
      <div className="container mx-auto px-1 sm:px-4 py-8 max-w-3xl">
        {/* Cabeçalho */}
        <div className="mb-6">
          <Button variant="ghost" className="flex items-center gap-2 pl-0 mb-4" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" /> Voltar
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-green-700" />
            Precificação de Materiais
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna da Esquerda - Lista de Materiais */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Materiais Recicláveis</CardTitle>
                  <Button onClick={() => setShowAddMaterial(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Material
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {materials.map((material) => (
                    <div key={material.materialId} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getMaterialIcon(material.name)}
                        <div>
                          <p className="font-medium">{getMaterialDisplayName(material.name)}</p>
                          <p className="text-sm text-muted-foreground">Preço base por {material.unit}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">R$</span>
                          <Input
                            type="text"
                            value={typeof material.price === 'number' ? formatPrice(material.price) : material.price}
                            onChange={(e) => handleBasePriceInputChange(material.materialId, e.target.value)}
                            onBlur={(e) => handleBasePriceInputBlur(material.materialId, e.target.value)}
                            className="w-24"
                            placeholder="0,00"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowDeleteConfirm(material.materialId)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" onClick={handleCancelMaterials} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleSaveAdjustments} className="flex-1">
                  Salvar Preços
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Coluna da Direita - Ajustes por Parceiro */}
          <div>
            <Card className="w-full max-w-lg mx-auto sm:max-w-none sm:w-full">
              <CardHeader>
                <CardTitle>Ajustes por Parceiro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Se NÃO houver parceiro selecionado, mostra busca e lista */}
                  {!selectedPartner && (
                    <>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar parceiro..."
                          value={searchPartner}
                          onChange={(e) => setSearchPartner(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <div className="space-y-2">
                        {filteredPartners.map((partner) => (
                          <div
                            key={partner.id}
                            className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50`}
                            onClick={() => setSelectedPartner(partner)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{partner.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {partner.type === 'cooperative' ? 'Cooperativa' : 'Coletor Individual'}
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-green-100 text-green-700">
                                {partner.type === 'cooperative' ? 'Cooperativa' : 'Coletor'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {/* Se houver parceiro selecionado, mostra só ele e botão para trocar */}
                  {selectedPartner && (
                    <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg bg-green-100 border border-green-200">
                      <div>
                        <p className="font-medium">{selectedPartner.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedPartner.type === 'cooperative' ? 'Cooperativa' : 'Coletor Individual'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <Button variant="outline" size="sm" onClick={() => setSelectedPartner(null)}>
                          Trocar parceiro
                        </Button>
                      </div>
                    </div>
                  )}
                  {/* Ajustes de materiais para o parceiro selecionado */}
                  {selectedPartner && (
                    <div className="mt-4 border-t pt-4">
                      <div className="font-semibold mb-2">Ajustar preços para {selectedPartner.name}</div>
                      <div className="space-y-2 pr-2">
                        {materials.map((material) => {
                          const adjustment = partnerAdjustments[selectedPartner.id]?.[material.materialId] || 0;
                          const finalPrice = calculateFinalPrice(Number(material.price), adjustment);
                          return (
                            <div key={material.materialId} className="flex items-center gap-2">
                              <span className="flex items-center min-w-[110px]">
                                {getMaterialIcon(material.name)}
                                {getMaterialDisplayName(material.name)}
                              </span>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <span>Base: R$ {typeof material.price === 'number' ? formatPrice(material.price) : material.price}</span>
                                {adjustment !== 0 && (
                                  <>
                                    <span>|</span>
                                    <span>Final: R$ {formatPrice(finalPrice)}</span>
                                  </>
                                )}
                              </div>
                              <Input
                                type="text"
                                className="w-16 h-7 text-xs ml-auto"
                                value={adjustment !== 0 ? formatPrice(adjustment) : ''}
                                onChange={e => handleAdjustmentChange(material.materialId, e.target.value)}
                                onBlur={e => handleAdjustmentInputBlur(selectedPartner.id, material.materialId, e.target.value)}
                                placeholder="0,00"
                                inputMode="decimal"
                              />
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" onClick={handleCancelPartnerAdjustments} className="flex-1">
                          Cancelar
                        </Button>
                        <Button onClick={handleSaveAdjustments} disabled={savingAdjustments} className="flex-1">
                          {savingAdjustments ? 'Salvando...' : 'Salvar Ajustes'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal de Adicionar Material */}
        <Dialog open={showAddMaterial} onOpenChange={setShowAddMaterial}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Material</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Material</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={selectedMaterialType}
                  onChange={e => handleSelectMaterialType(e.target.value)}
                >
                  {Object.entries(materialDisplayData).map(([identificador, material]) => (
                    <option key={identificador} value={identificador}>
                      {material.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome do Material</label>
                <Input
                  value={newMaterial.name}
                  onChange={e => setNewMaterial({ ...newMaterial, name: e.target.value })}
                  placeholder="Ex: Papelão, Plástico, etc."
                  disabled={selectedMaterialType !== 'outros'}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Preço Base (R$)</label>
                <Input
                  type="text"
                  value={formatPrice(newMaterial.price)}
                  onChange={e => setNewMaterial({ ...newMaterial, price: parsePrice(e.target.value) })}
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Unidade</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={newMaterial.unit}
                  onChange={e => setNewMaterial({ ...newMaterial, unit: e.target.value })}
                >
                  <option value="kg">Quilograma (kg)</option>
                  <option value="un">Unidade (un)</option>
                  <option value="l">Litro (l)</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddMaterial(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddMaterial}>
                Adicionar Material
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Confirmação de Exclusão */}
        <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
            </DialogHeader>
            <p className="py-4">
              Tem certeza que deseja excluir este material? Esta ação não pode ser desfeita.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={() => showDeleteConfirm && handleDeleteMaterial(showDeleteConfirm)}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}; 