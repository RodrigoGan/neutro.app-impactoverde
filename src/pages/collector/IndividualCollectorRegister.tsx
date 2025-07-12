import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import StepProgress from '@/components/register/common/StepProgress';
import StepNavigation from '@/components/register/common/StepNavigation';
import RegistrationConfirmation from '@/components/register/common/RegistrationConfirmation';
import { BaseUserData, AddressData } from '@/types/register/common.types';
import { AchievementAnimation } from '@/components/animations/AchievementAnimation';
import VehicleSelector from '@/components/forms/VehicleSelector';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Archive, Package, Recycle, GlassWater, Leaf, CircleDashed, Battery, Lightbulb, TrashIcon, Cpu, Droplets, X, Car, Truck, Bike, ShoppingCart, User, MapPin, Clock, Loader2, Home, Building } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  saveCollectorMaterials,
  saveCollectorVehicle,
  saveCollectorSchedules,
  saveCollectorNeighborhoods,
  getAllMaterials,
  getOrCreateCity,
  getOrCreateNeighborhood,
  searchNeighborhoods
} from '@/lib/collectorService';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import BasicInfoForm from '@/components/register/common/BasicInfoForm';
import AddressForm from '@/components/register/common/AddressForm';
import { cn } from "@/lib/utils";
import { BackButton } from '@/components/ui/back-button';
import StandardCollectorVehicle from '@/components/dashboard/standard/StandardCollectorVehicle';
import { materialDisplayData } from '@/config/materialDisplayData';

export const IndividualCollectorRegister: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Estados para os dados do formulário
  const [basicInfo, setBasicInfo] = useState<BaseUserData>({
    image: null,
    name: '',
    document: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [companyId, setCompanyId] = useState<string | null>(location.state?.companyId || null);

  const [address, setAddress] = useState<AddressData>({
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: ''
  });
  
  const [cityId, setCityId] = useState<string | null>(null);
  const [bairrosSelecionados, setBairrosSelecionados] = useState<{ id: string, nome: string }[]>([]);
  const [novoBairro, setNovoBairro] = useState('');
  const [bairrosSugeridos, setBairrosSugeridos] = useState<string[]>(['Centro', 'Jardim América', 'Vila Nova', 'Boa Vista', 'Santa Cruz', 'São José']);
  const [bairrosFiltrados, setBairrosFiltrados] = useState<string[]>([]);
  
  const [collectorMaterials, setCollectorMaterials] = useState<string[]>([]);
  const [outrosDescricao, setOutrosDescricao] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [otherVehicleDescription, setOtherVehicleDescription] = useState('');
  
  const [diasTrabalho, setDiasTrabalho] = useState<string[]>([]);
  const [periodosDisponiveis, setPeriodosDisponiveis] = useState<string[]>([]);
  const [intervalo, setIntervalo] = useState(30);
  const [maxColetas, setMaxColetas] = useState(10);
  
  const [materiaisDb, setMateriaisDb] = useState<any[]>([]);
  const [loadingMateriais, setLoadingMateriais] = useState(true);

  // Erros de validação
  const [basicInfoErrors, setBasicInfoErrors] = useState<Record<string, string>>({});
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [materialsError, setMaterialsError] = useState<string | null>(null);
  const [vehicleError, setVehicleError] = useState<string | null>(null);
  const [diasTrabalhoError, setDiasTrabalhoError] = useState<string | null>(null);
  const [periodosDisponiveisError, setPeriodosDisponiveisError] = useState<string | null>(null);

  const DIAS_SEMANA = [
    { id: 'dom', label: 'Dom' }, { id: 'seg', label: 'Seg' }, { id: 'ter', label: 'Ter' },
    { id: 'qua', label: 'Qua' }, { id: 'qui', label: 'Qui' }, { id: 'sex', label: 'Sex' },
    { id: 'sab', label: 'Sáb' }
  ];
  const PERIODOS_OPCOES = [
    { id: 'morning', nome: 'Manhã (08:00 - 12:00)' },
    { id: 'afternoon', nome: 'Tarde (13:00 - 18:00)' },
    { id: 'night', nome: 'Noite (19:00 - 22:00)' },
  ];

  // Buscar materiais do banco ao montar o componente
  useEffect(() => {
    async function fetchMateriais() {
      setLoadingMateriais(true);
      try {
        const data = await getAllMaterials();
        const sortedData = data.sort((a, b) => {
            if (a.identificador === 'outros') return 1;
            if (b.identificador === 'outros') return -1;
            const nameA = (materialDisplayData[a.identificador as keyof typeof materialDisplayData]?.nome || a.nome) || '';
            const nameB = (materialDisplayData[b.identificador as keyof typeof materialDisplayData]?.nome || b.nome) || '';
            return nameA.localeCompare(nameB);
        });
        setMateriaisDb(sortedData);
      } catch (e) {
        console.error("Erro detalhado ao buscar materiais:", e);
        toast({
          title: "Erro ao carregar materiais",
          description: "Não foi possível buscar a lista de materiais. Tente novamente.",
          variant: "destructive",
        });
        setMateriaisDb([]);
      } finally {
        setLoadingMateriais(false);
      }
    }
    fetchMateriais();
  }, []);

  // Efeito para obter o ID da cidade quando o endereço muda
  useEffect(() => {
    const fetchCityId = async () => {
      if (address.cidade && address.estado) {
        try {
          const fetchedCityId = await getOrCreateCity(address.cidade, address.estado);
          setCityId(fetchedCityId);
        } catch (error) {
          console.error("Falha ao obter ID da cidade:", error);
        }
      }
    };
    fetchCityId();
  }, [address.cidade, address.estado]);
  
  useEffect(() => {
    if (novoBairro) {
      setBairrosFiltrados(
        bairrosSugeridos.filter(bairro =>
          bairro.toLowerCase().includes(novoBairro.toLowerCase())
        )
      );
    } else {
      setBairrosFiltrados([]);
    }
  }, [novoBairro, bairrosSugeridos]);

  const validateBasicInfo = () => {
    const errors: Record<string, string> = {};
    if (!basicInfo.image) errors.image = 'A foto de perfil é obrigatória.';
    if (!basicInfo.name.trim()) errors.name = 'Nome é obrigatório';
    if (!basicInfo.document.trim()) errors.document = 'Documento é obrigatório';
    if (!basicInfo.email.trim()) {
        errors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(basicInfo.email)) {
        errors.email = 'E-mail inválido';
    }
    if (!basicInfo.phone.trim()) errors.phone = 'Telefone é obrigatório';
    if (basicInfo.password.length < 6) errors.password = 'A senha deve ter no mínimo 6 caracteres';
    if (basicInfo.password !== basicInfo.confirmPassword) errors.confirmPassword = 'As senhas não conferem';

    setBasicInfoErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validateAddress = () => {
    const errors: Record<string, string> = {};
    if (!address.cep.trim()) errors.cep = 'CEP é obrigatório';
    if (!address.rua.trim()) errors.rua = 'Rua é obrigatória';
    if (!address.numero.trim()) errors.numero = 'Número é obrigatório';
    if (!address.bairro.trim()) errors.bairro = 'Bairro é obrigatório';
    if (!address.cidade.trim()) errors.cidade = 'Cidade é obrigatória';
    if (!address.estado.trim()) errors.estado = 'Estado é obrigatório';
    
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getSteps = () => [
    { id: 'personal', label: 'Dados Pessoais' },
    { id: 'address', label: 'Endereço' },
    { id: 'materials', label: 'Materiais' },
    { id: 'vehicle', label: 'Veículo' },
    { id: 'neighborhoods', label: 'Bairros/Horários' },
    { id: 'confirmation', label: 'Confirmação' },
  ];

  const steps = getSteps();

  const handleNext = () => {
    // Se estamos na penúltima etapa, o botão "Próximo" age como "Confirmar"
    if (currentStep === steps.length - 1) {
      handleConfirm();
      return;
    }

    let isValid = false;
    switch (currentStep) {
        case 0: // Dados Pessoais
            isValid = validateBasicInfo();
            break;
        case 1: // Endereço
            isValid = validateAddress();
            break;
        case 2: // Materiais
            if (collectorMaterials.length === 0) {
                setMaterialsError('Selecione pelo menos um material.');
                isValid = false;
            } else {
                const outrosMaterialId = materiaisDb.find(m => m.identificador === 'outros')?.id;
                if (collectorMaterials.includes(outrosMaterialId) && !outrosDescricao.trim()) {
                    setMaterialsError('Por favor, descreva os "Outros" materiais.');
                    isValid = false;
                } else {
                    setMaterialsError(null);
                    isValid = true;
                }
            }
            break;
        case 3: // Veículo
            if (!selectedVehicle) {
                setVehicleError('Selecione um tipo de veículo.');
                isValid = false;
            } else if (selectedVehicle === 'other' && !otherVehicleDescription.trim()) {
                setVehicleError('Por favor, descreva o seu veículo.');
                isValid = false;
            } else {
                setVehicleError(null);
                isValid = true;
            }
            break;
        case 4: // Bairros e Horários
            let isStepValid = true;
            if (bairrosSelecionados.length === 0) {
                toast({ title: "Atenção", description: "Adicione pelo menos um bairro de atuação.", variant: "destructive" });
                isStepValid = false;
            }
            if (diasTrabalho.length === 0) {
                setDiasTrabalhoError('Selecione pelo menos um dia.');
                isStepValid = false;
            } else {
                setDiasTrabalhoError(null);
            }
            if (periodosDisponiveis.length === 0) {
                setPeriodosDisponiveisError('Selecione pelo menos um período.');
                isStepValid = false;
            } else {
                setPeriodosDisponiveisError(null);
            }
            isValid = isStepValid;
            break;
        default:
            isValid = true; // Para a etapa de confirmação
            break;
    }

    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };
  
  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
        // 1. Criar usuário no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: basicInfo.email,
            password: basicInfo.password,
            options: {
                data: {
                    user_type: 'collector',
                    full_name: basicInfo.name,
                    phone: basicInfo.phone,
                },
            },
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Usuário não criado.");
        const userId = authData.user.id;

        // 2. Inserir usuário na tabela users
        const { error: userInsertError } = await supabase.from('users').insert({
          id: userId,
          name: basicInfo.name,
          document: basicInfo.document,
          phone: basicInfo.phone,
          user_type: 'collector',
          email: basicInfo.email
        });
        if (userInsertError) throw new Error(userInsertError.message || 'Erro ao salvar usuário');

        // 3. Inserir na tabela collectors
        await supabase.from('collectors').insert({
            user_id: userId,
            cpf: basicInfo.document,
            address_street: address.rua,
            address_number: address.numero,
            address_complement: address.complemento,
            address_neighborhood: address.bairro,
            address_city: address.cidade,
            address_state: address.estado,
            address_zip_code: address.cep,
            company_id: companyId,
        });

        // 4. Salvar veículo, materiais, horários e bairros (em sequência)
        const outrosMaterialId = materiaisDb.find(m => m.identificador === 'outros')?.id;
        const formattedMaterials = collectorMaterials.map(id => ({
          material_id: id,
          ...(id === outrosMaterialId && outrosDescricao ? { description: outrosDescricao } : {})
        }));
        await saveCollectorVehicle(userId, selectedVehicle, otherVehicleDescription);
        await saveCollectorMaterials(userId, formattedMaterials);
        await saveCollectorSchedules(userId, {
            days: diasTrabalho,
            periods: periodosDisponiveis,
            interval_minutes: intervalo,
            max_collections_per_day: maxColetas
        });
        const bairroIds = bairrosSelecionados.map(b => b.id);
        await saveCollectorNeighborhoods(userId, bairroIds);

        setShowSuccessAnimation(true);
        setTimeout(() => {
          navigate('/company-collectors');
        }, 2000);
    } catch (error: any) {
        console.error("Erro no cadastro completo:", error);
        let errorMessage = error.message || "Não foi possível completar seu cadastro. Verifique os dados e tente novamente.";
        if (
          errorMessage.toLowerCase().includes("already registered") ||
          errorMessage.toLowerCase().includes("user already registered")
        ) {
          errorMessage = "Já existe um cadastro com este e-mail. Tente fazer login ou utilize outro e-mail.";
        }
        if (errorMessage.toLowerCase().includes("vehicles_user_id_fkey")) {
          errorMessage = "Erro ao salvar o veículo. Tente novamente em alguns segundos. Se o problema persistir, entre em contato com o suporte.";
        }
        toast({
            title: "Erro no Cadastro",
            description: errorMessage,
            variant: "destructive",
        });
    } finally {
        setIsConfirming(false);
    }
  };
  
  const handleAddBairro = async (bairroName?: string) => {
    const nome = (bairroName || novoBairro).trim();
    if (!nome || !cityId) return;
    if (bairrosSelecionados.some(b => b.nome.toLowerCase() === nome.toLowerCase())) return;

    try {
        const neighborhoodId = await getOrCreateNeighborhood(nome, cityId);
        setBairrosSelecionados(prev => [...prev, { id: neighborhoodId, nome }]);
        setNovoBairro('');
    } catch (error) {
        console.error("Erro ao adicionar bairro:", error);
        toast({ title: "Erro ao salvar bairro", variant: "destructive" });
    }
  };

  const handleRemoveBairro = (bairroId: string) => {
    setBairrosSelecionados(prev => prev.filter(b => b.id !== bairroId));
  };

  const renderStepContent = () => {
    if (currentStep === 0) {
      return <BasicInfoForm
                userType={'collector'}
                data={basicInfo}
                onDataChange={setBasicInfo}
                errors={basicInfoErrors}
             />;
    }
    if (currentStep === 1) {
      return <AddressForm
                data={address}
                onDataChange={setAddress}
                errors={addressErrors}
            />;
    }
    if (currentStep === 2) {
        const handleMaterialToggle = (materialId: string) => {
            setCollectorMaterials(prev =>
                prev.includes(materialId)
                    ? prev.filter(id => id !== materialId)
                    : [...prev, materialId]
            );
        };
        const outrosMaterialId = materiaisDb.find(m => m.identificador === 'outros')?.id;

        return (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart /> Materiais que Coleta</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Selecione todos os tipos de materiais que você está apto a coletar.</p>
                {loadingMateriais ? <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div> : (
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        {materiaisDb.map((material) => {
                            const displayInfo = materialDisplayData[material.identificador as keyof typeof materialDisplayData];
                            if (!displayInfo) return null;
                            return (
                                <div key={material.id} className="flex items-center gap-3">
                                    <Switch id={`material-${material.id}`} checked={collectorMaterials.includes(material.id)} onCheckedChange={() => handleMaterialToggle(material.id)} />
                                    <label htmlFor={`material-${material.id}`} className="flex items-center gap-2 cursor-pointer">
                                        <displayInfo.icone className={cn("h-5 w-5", displayInfo.cor)} />
                                        <span className="font-medium">{displayInfo.nome}</span>
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                )}
                {outrosMaterialId && collectorMaterials.includes(outrosMaterialId) && (
                  <div className="pt-4">
                    <label htmlFor="outros-descricao" className="font-medium text-sm">Descrição dos Outros Materiais</label>
                    <Textarea id="outros-descricao" value={outrosDescricao} onChange={(e) => setOutrosDescricao(e.target.value)} placeholder="Ex: Isopor, tecido, pneus, etc." className="mt-2" />
                  </div>
                )}
                {materialsError && <p className="text-sm text-red-500">{materialsError}</p>}
              </CardContent>
            </Card>
        );
    }
    if (currentStep === 3) {
        return <VehicleSelector 
                    selectedVehicle={selectedVehicle} 
                    onChange={setSelectedVehicle}
                    otherVehicleDescription={otherVehicleDescription}
                    onOtherDescriptionChange={setOtherVehicleDescription} 
                    error={vehicleError} 
                />;
    }
    if (currentStep === 4) {
        return (
          <Card>
            <CardHeader><CardTitle>Área de Atuação e Horários</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Bairros de Atuação</h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                      {bairrosSelecionados.map((bairro) => (
                        <Badge key={bairro.id} variant="secondary" className="flex items-center gap-1 pr-1">
                          {bairro.nome}
                          <button onClick={() => handleRemoveBairro(bairro.id)} className="ml-1 hover:bg-destructive/20 rounded-full p-0.5" type="button"><X className="h-3 w-3" /></button>
                        </Badge>
                      ))}
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        placeholder="Busque ou digite o nome do bairro"
                        value={novoBairro}
                        onChange={e => setNovoBairro(e.target.value)}
                        onKeyPress={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddBairro();
                          }
                        }}
                      />
                      {novoBairro && bairrosFiltrados.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto z-10">
                          {bairrosFiltrados.map((bairro) => (
                            <div
                              key={bairro}
                              className="px-3 py-2 hover:bg-muted cursor-pointer"
                              onClick={() => {
                                handleAddBairro(bairro);
                                setNovoBairro(''); // Limpa o input após a seleção
                              }}
                            >
                              {bairro}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                      <Button type="button" variant="outline" onClick={() => handleAddBairro()}>+ Adicionar</Button>
                  </div>
                   <p className="text-xs text-muted-foreground mt-1">Sua cidade é <strong>{address.cidade || 'Não definida'}</strong>. Os bairros serão associados a ela.</p>
              </div>
              <div>
                   <h3 className="font-medium mb-2">Dias de Trabalho</h3>
                   <div className="flex gap-2 flex-wrap">
                      {DIAS_SEMANA.map(dia => (
                          <Button key={dia.id} variant={diasTrabalho.includes(dia.id) ? 'default' : 'outline'} onClick={() => setDiasTrabalho(p => p.includes(dia.id) ? p.filter(d => d !== dia.id) : [...p, dia.id])}>{dia.label}</Button>
                      ))}
                   </div>
                   {diasTrabalhoError && <p className="text-sm text-red-500 mt-1">{diasTrabalhoError}</p>}
              </div>
               <div>
                   <h3 className="font-medium mb-2">Períodos Disponíveis</h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {PERIODOS_OPCOES.map((periodo) => (
                          <div key={periodo.id} className="flex items-center space-x-2"><Switch id={`p-${periodo.id}`} checked={periodosDisponiveis.includes(periodo.id)} onCheckedChange={() => setPeriodosDisponiveis(p => p.includes(periodo.id) ? p.filter(d => d !== periodo.id) : [...p, periodo.id])} /><label htmlFor={`p-${periodo.id}`}>{periodo.nome}</label></div>
                      ))}
                   </div>
                   {periodosDisponiveisError && <p className="text-sm text-red-500 mt-1">{periodosDisponiveisError}</p>}
              </div>
              <div className="flex items-center justify-between mt-2">
                  <label htmlFor="intervalo">Intervalo entre coletas (minutos)</label>
                  <Input
                    id="intervalo"
                    type="number"
                    className="w-24"
                    value={intervalo}
                    onChange={e => setIntervalo(Number(e.target.value))}
                    min={5}
                  />
              </div>
              <div className="flex items-center justify-between mt-2">
                  <label htmlFor="max-coletas">Máximo de coletas por dia</label>
                  <Input
                    id="max-coletas"
                    type="number"
                    className="w-24"
                    value={maxColetas}
                    onChange={e => setMaxColetas(Number(e.target.value))}
                    min={1}
                  />
              </div>
            </CardContent>
          </Card>
        );
    }
    if (currentStep === 5) {
      const vehicleLabels: { [key: string]: string } = {
        car: 'Carro',
        motorcycle: 'Moto',
        bike: 'Bicicleta',
        walk: 'A pé',
        truck: 'Caminhão',
        other: 'Outro',
        cart: 'Carrinho de mão'
      };

      const vehicleIcons: { [key: string]: React.ReactNode } = {
        car: <Car className="h-4 w-4 text-blue-700" />,
        motorcycle: <Bike className="h-4 w-4 text-orange-700" />,
        bike: <Bike className="h-4 w-4 text-green-700" />,
        walk: <User className="h-4 w-4 text-gray-400" />,
        truck: <Truck className="h-4 w-4 text-gray-700" />,
        other: <TrashIcon className="h-4 w-4 text-neutral-500" />,
        cart: <ShoppingCart className="h-4 w-4 text-yellow-700" />
      };

      return (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-center">Confirme seu Cadastro</h2>
          <p className="text-muted-foreground text-center mb-4">Revise as informações abaixo e confirme seu cadastro</p>
          
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
            
            {/* Bloco de Dados Pessoais */}
            <div>
              <div className="flex flex-col items-center gap-2 mb-4">
                {basicInfo.image ? (
                  <img 
                    src={typeof basicInfo.image === 'string' ? basicInfo.image : URL.createObjectURL(basicInfo.image)} 
                    alt="Foto de perfil" 
                    className="w-24 h-24 rounded-full object-cover" 
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-xl text-center">Seus Dados</h3>
              <div className="mt-4 space-y-1 text-sm">
                <p><strong>Nome:</strong> {basicInfo.name}</p>
                <p><strong>E-mail:</strong> {basicInfo.email}</p>
                <p><strong>Documento:</strong> {basicInfo.document}</p>
                <p><strong>Telefone:</strong> {basicInfo.phone}</p>
                <p><strong>Endereço:</strong> {`${address.rua}, ${address.numero}${address.complemento ? `, ${address.complemento}` : ''}, ${address.bairro}, ${address.cidade} - ${address.estado}`}</p>
              </div>
            </div>

            <hr className="my-4" />

            {/* Bloco de Veículo e Materiais */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg">Veículo Utilizado</h4>
                {selectedVehicle ? (
                  <StandardCollectorVehicle vehicleType={selectedVehicle} otherVehicleDescription={otherVehicleDescription} size="md" showLabel={true} />
                ) : (
                  <span className="text-muted-foreground text-sm">Não informado</span>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-lg mt-4">Materiais que Coleta</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {collectorMaterials.map((matId) => {
                    const material = materiaisDb.find(m => m.id === matId);
                    const displayInfo = material ? materialDisplayData[material.identificador as keyof typeof materialDisplayData] : null;
                    if (!displayInfo) return null;

                    return (
                      <span key={matId} className="flex items-center gap-1 border rounded px-2 py-1 bg-muted text-sm">
                        <displayInfo.icone className={`${displayInfo.cor} h-4 w-4`} />
                        {displayInfo.nome}
                      </span>
                    );
                  })}
                </div>
                {outrosDescricao && <p className="text-xs text-muted-foreground mt-2">Outros: {outrosDescricao}</p>}
              </div>
            </div>

            <hr className="my-4" />

            {/* Bloco de Atuação e Horários */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Área de Atuação e Horários</h3>
              <div>
                <h4 className="font-semibold">Bairros de Atuação</h4>
                <ul className="list-disc ml-5 mt-2 text-sm space-y-1">
                  {bairrosSelecionados.map((bairro) => (
                    <li key={bairro.id}>{bairro.nome}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">Dias:</span>
                  {diasTrabalho.map((dia) => (
                    <span key={dia} className="border rounded px-2 py-0.5 bg-muted text-xs">{DIAS_SEMANA.find(d => d.id === dia)?.label}</span>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">Períodos:</span>
                  {periodosDisponiveis.map((periodo) => (
                    <span key={periodo} className="border rounded px-2 py-0.5 bg-muted text-xs">{PERIODOS_OPCOES.find(p => p.id === periodo)?.nome}</span>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <span><span className="font-semibold">Intervalo:</span> {intervalo} min</span>
                    <span><span className="font-semibold">Máx. coletas/dia:</span> {maxColetas}</span>
                </div>
              </div>
            </div>

            <hr className="my-4" />

            {/* Bloco de Termos e Condições */}
            <div>
              <h4 className="font-semibold text-lg">Termos e Condições</h4>
              <ul className="list-disc ml-5 text-sm space-y-1 mt-2">
                <li>Compromisso com práticas sustentáveis e gestão adequada de resíduos.</li>
                <li>Fornecimento de informações verdadeiras e atualizadas.</li>
                <li>Participação ativa nos programas de sustentabilidade.</li>
                <li>Respeito às políticas de privacidade e proteção de dados.</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-4">Ao confirmar seu cadastro, você concorda com os termos acima.</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {showSuccessAnimation ? (
        <AchievementAnimation 
          title="Cadastro Concluído!"
          description="Seu perfil de coletor foi criado com sucesso. Você será redirecionado em breve."
        />
      ) : (
        <div className="w-full max-w-4xl mx-auto">
          <div className="mb-8">
            <BackButton />
            <h1 className="text-3xl font-bold mt-4">Cadastro de Coletor</h1>
          </div>
          <StepProgress currentStep={currentStep} steps={steps} />
          <div className="mt-8">
            {renderStepContent()}
          </div>
          <div className="mt-8">
            <StepNavigation
              currentStep={currentStep}
              totalSteps={steps.length}
              onBack={handleBack}
              onNext={handleNext}
              nextLabel={currentStep === steps.length - 1 ? 'Finalizar Cadastro' : 'Próximo'}
            />
          </div>
        </div>
      )}
    </div>
  );
}; 