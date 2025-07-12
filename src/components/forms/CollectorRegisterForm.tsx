import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar } from '@/components/ui/avatar';
import { Camera, X, Battery, Lightbulb, Archive, Package, Recycle, GlassWater, Leaf, CircleDashed, Cpu, Droplets, TrashIcon } from 'lucide-react';
import { TRANSPORT_TYPES } from '@/constants/transportTypes';
import { getAllMaterials } from '@/lib/collectorService';
import StandardCollectorVehicle from '@/components/dashboard/standard/StandardCollectorVehicle';
import { cn } from "@/lib/utils";
import { Badge } from '@/components/ui/badge';
import { materialDisplayData } from '@/config/materialDisplayData';

interface CollectorRegisterFormProps {
  mode: 'individual' | 'company';
  companyId?: string;
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
  initialValues?: any;
}

export const CollectorRegisterForm: React.FC<CollectorRegisterFormProps> = ({
  mode,
  companyId,
  onSuccess,
  onCancel,
  initialValues
}) => {
  const [photo, setPhoto] = useState<string | null>(initialValues?.photo || null);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(initialValues?.materiaisAceitos || []);
  const [outrosDescricao, setOutrosDescricao] = useState<string>(
    Array.isArray(initialValues?.materiaisAceitos)
      ? (initialValues.materiaisAceitos.find((m: any) => typeof m === 'object' && m.id && m.descricao) || {}).descricao || ''
      : ''
  );
  const [materialsFromDB, setMaterialsFromDB] = useState<any[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);
  const [formData, setFormData] = useState({
    name: initialValues?.name || '',
    cpf: initialValues?.cpf || '',
    email: initialValues?.email || '',
    phone: initialValues?.phone || '',
    address: initialValues?.address || '',
    neighborhood: initialValues?.neighborhood || '',
    city: initialValues?.city || '',
    state: initialValues?.state || '',
    bairrosAtuacao: initialValues?.bairrosAtuacao || [],
    hasSmartphone: initialValues?.hasSmartphone || false,
    vehicleType: initialValues?.vehicleType || '',
  });
  const [novoBairro, setNovoBairro] = useState('');
  const [bairrosSugeridos, setBairrosSugeridos] = useState([
    'Centro', 'Jardins', 'Vila Mariana', 'Moema', 'Pinheiros', 'Bela Vista', 'Liberdade', 'Santana', 'Tatuapé', 'Ipiranga'
  ]);
  const [bairrosFiltrados, setBairrosFiltrados] = useState<string[]>([]);

  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [cep, setCep] = useState(initialValues?.cep || '');
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  const [periodosDisponiveis, setPeriodosDisponiveis] = useState<string[]>(initialValues?.periodosDisponiveis || []);

  useEffect(() => {
    async function fetchMaterials() {
      try {
        const materials = await getAllMaterials();
        const sortedMaterials = materials.sort((a, b) => {
          if (a.identificador === 'outros') return 1;
          if (b.identificador === 'outros') return -1;
          
          const displayA = materialDisplayData[a.identificador as keyof typeof materialDisplayData];
          const displayB = materialDisplayData[b.identificador as keyof typeof materialDisplayData];

          const nameA = displayA ? displayA.nome : a.identificador;
          const nameB = displayB ? displayB.nome : b.identificador;

          return nameA.localeCompare(nameB);
        });
        setMaterialsFromDB(sortedMaterials);
      } catch (error) {
        console.error("Failed to fetch materials", error);
        // Optionally, show a toast to the user
      } finally {
        setIsLoadingMaterials(false);
      }
    }
    fetchMaterials();
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMaterialChange = (materialId: string) => {
    setSelectedMaterials(prev => {
      const newSelection = prev.includes(materialId)
        ? prev.filter(m => m !== materialId)
        : [...prev, materialId];

      const outrosMaterialId = materialsFromDB.find(m => m.identificador === 'outros')?.id;
      if (outrosMaterialId && !newSelection.includes(outrosMaterialId)) {
        setOutrosDescricao('');
      }
      
      return newSelection;
    });
  };

  const handlePeriodoToggle = (periodo: string) => {
    setPeriodosDisponiveis(prev =>
      prev.includes(periodo)
        ? prev.filter(p => p !== periodo)
        : [...prev, periodo]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const outrosMaterialId = materialsFromDB.find(m => m.identificador === 'outros')?.id;

    const data = {
      ...formData,
      photo,
      materiaisAceitos: selectedMaterials.map(materialId => 
        (outrosMaterialId && materialId === outrosMaterialId) 
          ? { id: outrosMaterialId, descricao: outrosDescricao } 
          : materialId
      ),
      periodosDisponiveis,
      companyId: mode === 'company' ? companyId : null
    };
    onSuccess?.(data);
  };

  const handleCepBlur = async () => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;
    setIsLoadingCep(true);
    setAddressErrors({});
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      if (data.erro) {
        setAddressErrors({ cep: 'CEP não encontrado.' });
        return;
      }
      setFormData(prev => ({
        ...prev,
        address: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || prev.state || '',
      }));
    } catch (e) {
      setAddressErrors({ cep: 'Erro ao buscar CEP.' });
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleAddBairro = () => {
    const bairroValido = bairrosSugeridos.find(
      b => b.toLowerCase() === novoBairro.trim().toLowerCase()
    );
    if (!bairroValido) return;
    if (formData.bairrosAtuacao.includes(bairroValido)) return;
    setFormData(prev => ({ ...prev, bairrosAtuacao: [...prev.bairrosAtuacao, bairroValido] }));
    setNovoBairro('');
  };

  const handleRemoveBairro = (bairro: string) => {
    setFormData(prev => ({ ...prev, bairrosAtuacao: prev.bairrosAtuacao.filter(b => b !== bairro) }));
  };

  React.useEffect(() => {
    if (novoBairro) {
      const filtrados = bairrosSugeridos.filter(bairro =>
        bairro.toLowerCase().includes(novoBairro.toLowerCase())
      );
      setBairrosFiltrados(filtrados);
    } else {
      setBairrosFiltrados([]);
    }
  }, [novoBairro, bairrosSugeridos]);

  // Opções de regiões padronizadas
  const REGIOES_OPCOES = [
    { id: 'zona-sul', nome: 'Zona Sul' },
    { id: 'zona-norte', nome: 'Zona Norte' },
    { id: 'zona-leste', nome: 'Zona Leste' },
    { id: 'zona-oeste', nome: 'Zona Oeste' },
    { id: 'centro', nome: 'Centro' },
  ];

  // Opções de períodos do dia
  const PERIODOS_OPCOES = [
    { id: 'manha', nome: 'Manhã (08:00 - 12:00)' },
    { id: 'tarde', nome: 'Tarde (13:00 - 18:00)' },
    { id: 'noite', nome: 'Noite (19:00 - 22:00)' },
  ];

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        {mode === 'individual' && (
          <CardTitle className="text-2xl font-bold text-center">
            Cadastro de Coletor
          </CardTitle>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Foto */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-32 h-32">
              {photo ? (
                <img src={photo} alt="Foto do coletor" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </Avatar>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                Adicionar Foto
              </Button>
              {photo && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPhoto(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          {/* Informações Pessoais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail (opcional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (opcional)</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="cep">CEP *</Label>
              <Input
                id="cep"
                value={cep}
                onChange={e => setCep(e.target.value.replace(/\D/g, '').replace(/(\d{5})(\d{0,3})/, '$1-$2'))}
                onBlur={handleCepBlur}
                maxLength={9}
                placeholder="00000-000"
                className={addressErrors.cep ? 'border-red-500' : ''}
                disabled={isLoadingCep}
              />
              {isLoadingCep && <p className="text-xs text-muted-foreground mt-1">Buscando endereço...</p>}
              {addressErrors.cep && <p className="text-xs text-red-500 mt-1">{addressErrors.cep}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereço *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro *</Label>
              <Input
                id="neighborhood"
                value={formData.neighborhood}
                onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Bairros de Atuação *</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.bairrosAtuacao.map((bairro) => (
                  <Badge key={bairro} variant="secondary" className="flex items-center gap-1 pr-1">
                    {bairro}
                    <button
                      onClick={() => handleRemoveBairro(bairro)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-1"
                      type="button"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 relative">
                <input
                  type="text"
                  className="border rounded px-2 py-1 flex-1"
                  placeholder="Busque ou digite o nome do bairro"
                  value={novoBairro}
                  onChange={e => setNovoBairro(e.target.value)}
                  onFocus={() => setBairrosFiltrados(bairrosSugeridos.filter(bairro => bairro.toLowerCase().includes(novoBairro.toLowerCase())))}
                  autoComplete="off"
                />
                <Button type="button" variant="outline" onClick={handleAddBairro}>+ Adicionar</Button>
                {bairrosFiltrados.length > 0 && novoBairro && (
                  <div className="absolute left-0 top-full z-10 w-full bg-white border rounded shadow mt-1 max-h-40 overflow-y-auto">
                    {bairrosFiltrados.map(bairro => (
                      <div
                        key={bairro}
                        className="px-3 py-1 cursor-pointer hover:bg-muted"
                        onMouseDown={() => {
                          setNovoBairro(bairro);
                          setBairrosFiltrados([]);
                        }}
                      >
                        {bairro}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground">Adicione os bairros onde você realiza coletas.</span>
            </div>
          </div>

          {/* Materiais Aceitos */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Materiais Aceitos</CardTitle>
              </CardHeader>
              <CardContent>
                <Label>Materiais que Coleta *</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {isLoadingMaterials ? (
                    <p>Carregando materiais...</p>
                  ) : (
                    materialsFromDB.map((material) => {
                      const displayInfo = materialDisplayData[material.identificador as keyof typeof materialDisplayData];
                      if (!displayInfo) return null;
                      const isSelected = selectedMaterials.includes(material.id);
                      return (
                        <button
                          type="button"
                          key={material.id}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-full border transition-colors text-sm font-medium focus:outline-none',
                            isSelected
                              ? `bg-green-100 border-green-500 ${displayInfo.cor}`
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          )}
                          onClick={() => handleMaterialChange(material.id)}
                        >
                          <displayInfo.icone className={cn('h-5 w-5', displayInfo.cor)} />
                          {displayInfo.nome}
                        </button>
                      );
                    })
                  )}
                </div>
                {selectedMaterials.includes(materialsFromDB.find(m => m.identificador === 'outros')?.id) && (
                  <div className="mt-4">
                    <Label htmlFor="outros-descricao">Descrição para "Outros"</Label>
                    <Input
                      id="outros-descricao"
                      value={outrosDescricao}
                      onChange={(e) => setOutrosDescricao(e.target.value)}
                      placeholder="Especifique outros materiais que você coleta"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Períodos Disponíveis */}
          <div className="space-y-4">
            <Label>Períodos Disponíveis *</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PERIODOS_OPCOES.map((periodo) => (
                <div key={periodo.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`periodo-${periodo.id}`}
                    checked={periodosDisponiveis.includes(periodo.id)}
                    onCheckedChange={() => handlePeriodoToggle(periodo.id)}
                  />
                  <Label htmlFor={`periodo-${periodo.id}`} className="cursor-pointer">
                    {periodo.nome}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Tipo de Veículo */}
          <div className="space-y-4">
            <Label>Tipo de Veículo *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TRANSPORT_TYPES.map((tipo) => (
                <div 
                  key={tipo.value} 
                  className={cn(
                    "flex items-center space-x-2 p-4 rounded-lg border cursor-pointer transition-colors",
                    formData.vehicleType === tipo.value 
                      ? "border-neutro bg-neutro/5" 
                      : "border-border hover:border-neutro/50"
                  )}
                  onClick={() => setFormData({...formData, vehicleType: tipo.value})}
                >
                  <div className="flex items-center gap-2">
                    <StandardCollectorVehicle 
                      vehicleType={tipo.value} 
                      size="md"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Smartphone */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasSmartphone"
              checked={formData.hasSmartphone}
              onCheckedChange={(checked) => setFormData({...formData, hasSmartphone: checked as boolean})}
            />
            <Label htmlFor="hasSmartphone">Possui smartphone para uso do aplicativo</Label>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              {mode === 'individual' ? 'Cadastrar' : 'Cadastrar Coletor'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 