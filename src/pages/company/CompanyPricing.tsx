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
import { supabase } from '@/lib/supabaseClient';
import AppFooter from '@/components/AppFooter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const CompanyPricing: React.FC = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<MaterialPrice[]>([]);
  const [originalMaterials, setOriginalMaterials] = useState<MaterialPrice[]>([]);
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
  const [partnerAdjustments, setPartnerAdjustments] = useState<Record<string, { [materialId: string]: { price: number, unit?: string, description?: string } }>>({});
  const [originalPartnerAdjustments, setOriginalPartnerAdjustments] = useState<Record<string, { [materialId: string]: { price: number, unit?: string, description?: string } }>>({});
  const [savingAdjustments, setSavingAdjustments] = useState(false);
  const [partners, setPartners] = useState<any[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [loadingAdjustments, setLoadingAdjustments] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Adicionar estado para descrição do material 'outros' por parceiro/material
  const [outrosDescriptions, setOutrosDescriptions] = useState<Record<string, string>>({});
  // Adicionar estado para controlar o foco do input de preço de 'outros'
  const [outrosInputFocused, setOutrosInputFocused] = useState<Record<string, boolean>>({});
  // No estado do componente:
  const [newMaterialDescription, setNewMaterialDescription] = useState('');
  const [addMaterialLoading, setAddMaterialLoading] = useState(false);
  const [addMaterialError, setAddMaterialError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Buscar materiais reais do banco
  useEffect(() => {
    async function fetchMaterials() {
      setLoadingMaterials(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('materials')
          .select('id, name, unit, is_active, identificador')
          .eq('is_active', true)
          .order('name');
        if (error) throw error;
        let mats = (data || []).map(mat => ({
          materialId: mat.id,
          name: mat.name,
          identificador: mat.identificador || 'outros',
          price: 0,
          unit: mat.unit || 'kg',
          isActive: mat.is_active
        }));
        // Ordenar alfabeticamente, exceto 'outros' por último
        mats = mats.sort((a, b) => {
          if (a.identificador === 'outros') return 1;
          if (b.identificador === 'outros') return -1;
          return a.name.localeCompare(b.name, 'pt-BR');
        });
        setMaterials(mats);
        setOriginalMaterials(mats);
      } catch (err) {
        setError('Erro ao buscar materiais.');
        setMaterials([]);
      } finally {
        setLoadingMaterials(false);
      }
    }
    fetchMaterials();
  }, []);

  // Buscar parceiros reais do banco
  useEffect(() => {
    async function fetchPartners() {
      setLoadingPartners(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, user_type')
          .in('user_type', ['individual_collector', 'cooperative_owner']);
        if (error) throw error;
        setPartners(data || []);
      } catch (err) {
        setError('Erro ao buscar parceiros.');
        setPartners([]);
      } finally {
        setLoadingPartners(false);
      }
    }
    fetchPartners();
  }, []);

  // Filtragem de parceiros
  const filteredPartners = partners.filter(partner => 
    partner.name.toLowerCase().includes(searchPartner.toLowerCase())
  );

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

  // Função aprimorada para adicionar novo material
  const handleAddMaterial = async () => {
    setAddMaterialError(null);
    if (!selectedPartner) {
      setAddMaterialError('Selecione um parceiro para adicionar material.');
      return;
    }
    if (!selectedMaterialType || !newMaterial.name || !newMaterial.price || !newMaterial.unit) {
      setAddMaterialError('Preencha todos os campos obrigatórios.');
      return;
    }
    // Verifica se já existe material cadastrado para o parceiro
    const alreadyExists = Object.keys(partnerAdjustments[selectedPartner.id] || {}).includes(selectedMaterialType);
    if (alreadyExists) {
      setAddMaterialError('Este material já está cadastrado para este parceiro.');
      return;
    }
    setAddMaterialLoading(true);
    try {
      const companyId = JSON.parse(localStorage.getItem('authUser') || '{}').entity_id;
      const collectorId = selectedPartner.id;
      const materialId = materials.find(m => m.identificador === selectedMaterialType)?.materialId;
      const description = selectedMaterialType === 'outros' ? newMaterial.name : '';
      // Ao adicionar novo material, garantir que partnerAdjustments salva um objeto { price, unit, description }
      setPartnerAdjustments(prev => ({
        ...prev,
        [collectorId]: {
          ...prev[collectorId],
          [materialId]: {
            price: newMaterial.price,
            unit: newMaterial.unit,
            description: description,
          },
        },
      }));
      if (selectedMaterialType === 'outros') {
        setOutrosDescriptions(prev => ({ ...prev, [collectorId]: newMaterial.name }));
      }
      setShowAddMaterial(false);
      setNewMaterial({ name: '', price: 0, unit: 'kg', isActive: true });
      setNewMaterialDescription('');
      toast.success('Material adicionado com sucesso!');
    } catch (err: any) {
      setAddMaterialError('Erro ao adicionar material.');
    } finally {
      setAddMaterialLoading(false);
    }
  };

  // Função para remover material
  const handleDeleteMaterial = (materialId: string) => {
    if (!selectedPartner) return;
    setPartnerAdjustments(prev => {
      const updated = { ...prev };
      if (updated[selectedPartner.id]) {
        delete updated[selectedPartner.id][materialId];
      }
      return updated;
    });
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
        [materialId]: {
          ...prev[selectedPartner.id]?.[materialId],
          price: value,
        },
      },
    }));
  };

  // Função para formatar o valor do ajuste ao perder o foco do input
  const handleAdjustmentInputBlur = (partnerId: string, materialId: string, value: string) => {
    const numericValue = parsePrice(value);
    setPartnerAdjustments(prev => ({
      ...prev,
      [partnerId]: {
        ...prev[partnerId],
        [materialId]: {
          ...prev[partnerId]?.[materialId],
          price: isNaN(numericValue) ? 0 : numericValue,
        },
      },
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

  // Carregar ajustes do parceiro selecionado
  useEffect(() => {
    if (!selectedPartner) return;
    async function fetchAdjustments() {
      setLoadingAdjustments(true);
      setError(null);
      try {
        const companyId = JSON.parse(localStorage.getItem('authUser') || '{}').entity_id;
        const collectorId = selectedPartner.id;
        const { data, error } = await supabase
          .from('collector_price_adjustments')
          .select('material_id, adjustment_value, description, unit')
          .eq('collector_id', collectorId)
          .eq('company_id', companyId);
        if (error) throw error;
        // Ao carregar ajustes do parceiro, montar objeto com unit, price e description
        const adjustments: Record<string, { price: number, unit?: string, description?: string }> = {};
        const outrosDescs: Record<string, string> = {};
        (data || []).forEach(adj => {
          adjustments[adj.material_id] = {
            price: Number(adj.adjustment_value),
            unit: adj.unit,
            description: adj.description
          };
          if (adj.material_id && adj.description && adj.description.length > 0) {
            outrosDescs[collectorId] = adj.description;
          }
        });
        setPartnerAdjustments(prev => ({ ...prev, [collectorId]: adjustments }));
        setOutrosDescriptions(prev => ({ ...prev, ...outrosDescs }));
      } catch (err: any) {
        setError('Erro ao carregar ajustes.');
      } finally {
        setLoadingAdjustments(false);
      }
    }
    fetchAdjustments();
  }, [selectedPartner]);

  // Salvar ajustes (incluindo descrição de "outros")
  const handleSaveAdjustments = async () => {
    if (!selectedPartner) return;
    setSavingAdjustments(true);
    try {
      const companyId = JSON.parse(localStorage.getItem('authUser') || '{}').entity_id;
      const collectorId = selectedPartner.id;
      const adjustments = partnerAdjustments[collectorId] || {};
      // Garantir que 'updates' está corretamente declarada
      const updates = Object.entries(adjustments).map(async ([materialId, ajuste]) => {
        let description = '';
        let unit = '';
        // Se for material 'outros', pega a descrição
        const material = materials.find(m => m.materialId === materialId);
        if (material?.identificador === 'outros') {
          description = outrosDescriptions[collectorId] || '';
        }
        // Upsert ajuste
        const { error } = await supabase.from('collector_price_adjustments').upsert({
          company_id: companyId,
          collector_id: collectorId,
          material_id: materialId,
          price: ajuste.price,
          description,
          unit: ajuste.unit || '', // Adiciona a unidade do material original
        }, { onConflict: 'company_id,collector_id,material_id' });
        if (error) throw error;
      });
      await Promise.all(updates);
      toast.success('Ajustes salvos com sucesso!');
    } catch (err: any) {
      toast.error('Erro ao salvar ajustes.');
    } finally {
      setSavingAdjustments(false);
    }
  };

  // Função para calcular o preço final com ajuste
  const calculateFinalPrice = (basePrice: number, ajuste?: { price: number }) => {
    if (!ajuste || typeof ajuste !== 'object') return basePrice;
    return basePrice + (ajuste.price || 0);
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
                {/* Renderizar lista de materiais cadastrados para o parceiro selecionado */}
                <div className="space-y-1">
                  {selectedPartner && partnerAdjustments[selectedPartner.id] && Object.keys(partnerAdjustments[selectedPartner.id]).length > 0 ? (
                    Object.entries(partnerAdjustments[selectedPartner.id]).map(([materialId, ajusteRaw]) => {
                      const ajuste = typeof ajusteRaw === 'object' ? ajusteRaw : { price: ajusteRaw };
                      const material = materials.find(m => m.materialId === materialId);
                      if (!material) return null;
                      const isOutros = material.identificador === 'outros';
                      return (
                        <div key={material.materialId} className="flex items-center px-2 py-1 bg-muted/50 rounded-md">
                          {getMaterialIcon(material.identificador)}
                          <span className="ml-2 font-medium">{getMaterialDisplayName(material.identificador)}</span>
                          <span className="ml-2 text-muted-foreground text-xs">{ajuste.unit ? `por ${ajuste.unit}` : (material.unit ? `por ${material.unit}` : '')}</span>
                          <span className="ml-4 font-semibold">R$ {Number(ajuste.price).toFixed(2)}</span>
                          {isOutros && (
                            <span className="ml-4 italic text-xs text-muted-foreground">{ajuste.description || ''}</span>
                          )}
                          <div className="flex-1" />
                          {/* <Button size="sm" variant="outline" className="ml-2 px-2 py-1 text-xs" onClick={() => handleEditMaterial(material)}>
                            Editar
                          </Button> */}
                          <Button size="sm" variant="destructive" className="ml-2 px-2 py-1 text-xs" onClick={() => handleDeleteMaterial(material.materialId)}>
                            Excluir
                          </Button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-muted-foreground py-4">Nenhum material cadastrado para este parceiro.</div>
                  )}
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
                <CardTitle>Acréscimo de Valor para Coletor Vinculado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Se NÃO houver parceiro selecionado, mostra busca e lista */}
                  {!selectedPartner && (
                    <>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar Coletor Vinculado..."
                          value={searchPartner}
                          onChange={(e) => setSearchPartner(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <div className="space-y-2">
                        {loadingPartners ? (
                          <p>Carregando parceiros...</p>
                        ) : error ? (
                          <p className="text-red-500">{error}</p>
                        ) : filteredPartners.length === 0 ? (
                          <div className="text-center text-muted-foreground py-4">Nenhum coletor individual vinculado disponível para acréscimo.</div>
                        ) : (
                          filteredPartners.map((partner) => (
                            <div
                              key={partner.id}
                              className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50`}
                              onClick={() => setSelectedPartner(partner)}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{partner.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {partner.user_type === 'individual_collector' ? 'Coletor Individual' : 'Cooperativa'}
                                  </p>
                                </div>
                                <Badge variant="outline" className="bg-green-100 text-green-700">
                                  {partner.user_type === 'individual_collector' ? 'Coletor' : 'Cooperativa'}
                                </Badge>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                  {/* Se houver parceiro selecionado, mostra só ele e botão para trocar */}
                  {selectedPartner && (
                    <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg bg-green-100 border border-green-200">
                      <div>
                        <p className="font-medium">{selectedPartner.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedPartner.user_type === 'individual_collector' ? 'Coletor Individual' : 'Cooperativa'}
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
                        {loadingAdjustments ? (
                          <p>Carregando ajustes...</p>
                        ) : error ? (
                          <p className="text-red-500">{error}</p>
                        ) : materials.length === 0 ? (
                          <p>Nenhum material disponível para ajustar.</p>
                        ) : (
                          materials.map((material) => {
                            let ajuste = partnerAdjustments[selectedPartner.id]?.[material.materialId];
                            if (ajuste && typeof ajuste !== 'object') {
                              ajuste = { price: ajuste };
                            }
                            const adjustment = ajuste ? ajuste.price : 0;
                            const finalPrice = calculateFinalPrice(Number(material.price), ajuste);
                            return (
                              <div key={material.materialId} className="flex items-center gap-2">
                                <span className="flex items-center min-w-[110px]">
                                  {getMaterialIcon(material.identificador)}
                                  {getMaterialDisplayName(material.identificador)}
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
                                {/* Campo de descrição para 'outros' */}
                                {material.identificador === 'outros' && adjustment !== 0 && (
                                  <Input
                                    type="text"
                                    className="w-64 h-7 text-xs ml-2"
                                    placeholder="Descreva o material..."
                                    value={outrosDescriptions[selectedPartner.id] || ''}
                                    onChange={e => setOutrosDescriptions(prev => ({ ...prev, [selectedPartner.id]: e.target.value }))}
                                    maxLength={100}
                                  />
                                )}
                              </div>
                            )
                          })
                        )}
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
                  {selectedPartner && (!partnerAdjustments[selectedPartner.id] || Object.keys(partnerAdjustments[selectedPartner.id]).length === 0) && (
                    <div className="text-center text-muted-foreground py-4">Nenhum material cadastrado para este parceiro.</div>
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
                <Select
                  value={selectedMaterialType}
                  onValueChange={handleSelectMaterialType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o material" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Ordenar materiais alfabeticamente, exceto 'outros' por último */}
                    {[
                      ...Object.entries(materialDisplayData)
                        .filter(([identificador]) => identificador !== 'outros')
                        .sort((a, b) => a[1].nome.localeCompare(b[1].nome)),
                      ...Object.entries(materialDisplayData).filter(([identificador]) => identificador === 'outros')
                    ].map(([identificador, material]) => (
                      <SelectItem key={identificador} value={identificador}>
                        <div className="flex items-center gap-2">
                          {material.icone && (
                            <material.icone className={`h-4 w-4 ${material.cor || ''}`} />
                          )}
                          <span>{material.nome}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Campo de nome/descrição só para 'outros' */}
              {selectedMaterialType === 'outros' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Descreva o Material</label>
                  <Input
                    value={newMaterial.name}
                    onChange={e => setNewMaterial({ ...newMaterial, name: e.target.value })}
                    placeholder="Ex: Entulho limpo, Pneus, etc."
                    maxLength={100}
                  />
                </div>
              )}
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
              {addMaterialError && <div className="text-red-500 text-sm">{addMaterialError}</div>}
            </div>
            <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-0">
              <Button variant="outline" onClick={() => setShowAddMaterial(false)} disabled={addMaterialLoading}>
                Cancelar
              </Button>
              <Button onClick={handleAddMaterial} disabled={addMaterialLoading}>
                {addMaterialLoading ? 'Adicionando...' : 'Adicionar Material'}
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
      <div className="mt-8">
        <AppFooter />
      </div>
    </Layout>
  );
}; 