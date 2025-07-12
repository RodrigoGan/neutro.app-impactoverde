import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserType } from '@/types/register/common.types';
import BasicInfoForm from '@/components/register/common/BasicInfoForm';
import AddressForm from '@/components/register/common/AddressForm';
import RepresentativeForm from '@/components/register/common/RepresentativeForm';
import PartnerTypeSelector from '@/components/register/partner/PartnerTypeSelector';
import PartnerTypeForm from '@/components/register/partner/PartnerTypeForm';
import StepProgress from '@/components/register/common/StepProgress';
import StepNavigation from '@/components/register/common/StepNavigation';
import RegistrationConfirmation from '@/components/register/common/RegistrationConfirmation';
import { BaseUserData, AddressData, RepresentativeData } from '@/types/register/common.types';
import { AchievementAnimation } from '@/components/animations/AchievementAnimation';
import VehicleSelector from '@/components/forms/VehicleSelector';
import NeighborhoodSelector from '@/components/forms/NeighborhoodSelector';
import { MaterialForm, Material } from '@/components/forms/MaterialForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Archive, Package, Recycle, GlassWater, Leaf, CircleDashed, Battery, Lightbulb, TrashIcon, Cpu, Droplets, X, Car, Truck, Bike, ShoppingCart, User, MapPin, Clock, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AttendTypeSwitch, AttendType } from '@/components/restaurant/AttendTypeSwitch';
import { StoreSegmentSwitch } from '@/components/store/StoreSegmentSwitch';
import { SEGMENTS as STORE_SEGMENTS } from '@/components/store/StoreSegmentSwitch';
import EducationTypeSwitch from '@/components/register/educational/EducationTypeSwitch';
import EducationLevelSwitch, { EDUCATION_LEVELS } from '@/components/register/educational/EducationLevelSwitch';
import { ReferralInput } from '@/components/referral/ReferralInput';
import {
  saveCollectorMaterials,
  saveCollectorVehicle,
  saveCollectorSchedules,
  saveCollectorNeighborhoods,
  getAllMaterials,
  getOrCreateCity,
  getOrCreateNeighborhood
} from '@/lib/collectorService';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { TRANSPORT_TYPES } from '@/constants/transportTypes';
import { materialDisplayData } from '@/config/materialDisplayData';

const NewRegister: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [partnerType, setPartnerType] = useState<'restaurant' | 'store' | 'educational' | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);

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

  const [address, setAddress] = useState<AddressData>({
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: ''
  });

  const [cityId, setCityId] = useState<string | null>(null); // <-- Novo state para o ID da cidade
  const [bairrosSelecionados, setBairrosSelecionados] = useState<{ id: string, nome: string }[]>([]); // <-- Armazenar ID e nome
  const [novoBairro, setNovoBairro] = useState('');

  const [representative, setRepresentative] = useState<RepresentativeData>({
    name: '',
    cpf: '',
    email: '',
    phone: '',
    position: ''
  });

  const [partnerData, setPartnerData] = useState<any>({});

  // Estados para erros de validação
  const [basicInfoErrors, setBasicInfoErrors] = useState<Record<string, string>>({});
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [representativeErrors, setRepresentativeErrors] = useState<Record<string, string>>({});
  const [partnerErrors, setPartnerErrors] = useState<Record<string, string>>({});

  // Estado para materiais do coletor
  const [collectorMaterials, setCollectorMaterials] = useState<string[]>([]);
  const [outrosDescricao, setOutrosDescricao] = useState('');
  const [materialsError, setMaterialsError] = useState<string | null>(null);

  // Estado de erro para veículo do coletor
  const [vehicleError, setVehicleError] = useState<string | null>(null);

  // Estados para bairros de atuação do coletor
  const [bairrosSugeridos, setBairrosSugeridos] = useState<string[]>([
    'Centro',
    'Jardim América',
    'Vila Nova',
    'Boa Vista',
    'Santa Cruz',
    'São José',
    'Bela Vista',
    'Vila Maria',
    'Jardim Europa',
    'Vila São Paulo'
  ]);
  const [bairrosFiltrados, setBairrosFiltrados] = useState<string[]>([]);

  // Estados para o perfil do restaurante
  const [attendType, setAttendType] = useState<AttendType>({
    delivery: false,
    presencial: false,
    buffet: false,
    marmitex: false,
    other: false,
    otherDesc: '',
  });
  const [priceRange, setPriceRange] = useState('');
  const [cuisineTypes, setCuisineTypes] = useState('');
  const [openingHours, setOpeningHours] = useState('');

  // Erros do perfil do restaurante
  const [restaurantProfileErrors, setRestaurantProfileErrors] = useState<Record<string, string>>({});

  // Estados para o perfil da loja
  const [storeBusinessType, setStoreBusinessType] = useState('');
  const [storeSize, setStoreSize] = useState('');
  const [storeSegments, setStoreSegments] = useState<string[]>([]);
  const [storeOtherSegment, setStoreOtherSegment] = useState('');
  const [storeOpeningHours, setStoreOpeningHours] = useState('');
  const [isSustainableStore, setIsSustainableStore] = useState(false);
  const [storeProfileErrors, setStoreProfileErrors] = useState<Record<string, string>>({});

  // Dados dos tipos de atendimento para badge
  const attendTypesData = [
    { key: 'delivery', label: 'Delivery', icon: <span role="img" aria-label="Delivery">🛵</span>, color: 'bg-blue-100 text-blue-700' },
    { key: 'presencial', label: 'Presencial', icon: <span role="img" aria-label="Presencial">🍽️</span>, color: 'bg-green-100 text-green-700' },
    { key: 'buffet', label: 'Buffet', icon: <span role="img" aria-label="Buffet">🥗</span>, color: 'bg-lime-100 text-lime-700' },
    { key: 'marmitex', label: 'Marmitex', icon: <span role="img" aria-label="Marmitex">🍱</span>, color: 'bg-yellow-100 text-yellow-700' },
    { key: 'other', label: '', icon: <span role="img" aria-label="Outros">✨</span>, color: 'bg-purple-100 text-purple-700' },
  ];

  // Estados para horários do coletor (apenas para coletor)
  const [diasTrabalho, setDiasTrabalho] = useState<string[]>([]);
  const [periodosDisponiveis, setPeriodosDisponiveis] = useState<string[]>([]);
  const [intervalo, setIntervalo] = useState(30);
  const [maxColetas, setMaxColetas] = useState(10);

  // Adicionar estados de erro para horários
  const [diasTrabalhoError, setDiasTrabalhoError] = useState<string | null>(null);
  const [periodosDisponiveisError, setPeriodosDisponiveisError] = useState<string | null>(null);

  const DIAS_SEMANA = [
    { id: 'dom', label: 'Domingo', shortLabel: 'Dom' },
    { id: 'seg', label: 'Segunda', shortLabel: 'Seg' },
    { id: 'ter', label: 'Terça', shortLabel: 'Ter' },
    { id: 'qua', label: 'Quarta', shortLabel: 'Qua' },
    { id: 'qui', label: 'Quinta', shortLabel: 'Qui' },
    { id: 'sex', label: 'Sexta', shortLabel: 'Sex' },
    { id: 'sab', label: 'Sábado', shortLabel: 'Sáb' }
  ];
  const PERIODOS_OPCOES = [
    { id: 'morning', nome: 'Manhã (08:00 - 12:00)' },
    { id: 'afternoon', nome: 'Tarde (13:00 - 18:00)' },
    { id: 'night', nome: 'Noite (19:00 - 22:00)' },
  ];

  // 2. Estado para armazenar os materiais vindos do banco
  const [materiaisDb, setMateriaisDb] = useState<any[]>([]);
  const [loadingMateriais, setLoadingMateriais] = useState(true);

  const { toast } = useToast();

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

  // Ao montar, definir o tipo de usuário pela query string
  useEffect(() => {
    const type = searchParams.get('type');
    const ref = searchParams.get('ref'); // Código de indicação
    const validTypes = ['common', 'collector', 'cooperative', 'company', 'partner'];
    
    if (type && validTypes.includes(type)) {
      setUserType(type as UserType);
    } else {
    
    // Definir código de indicação se presente na URL
    if (ref) {
      setReferralCode(ref.toUpperCase());
    }
      navigate('/register', { replace: true });
    }
  }, [searchParams, navigate]);

  // 3. Buscar materiais do banco ao montar o componente
  useEffect(() => {
    async function fetchMateriais() {
      setLoadingMateriais(true);
      try {
        const data = await getAllMaterials();
        console.log('MATERIAIS DO BANCO:', data); // <-- log para depuração
        setMateriaisDb(data);
      } catch (e) {
        setMateriaisDb([]);
      } finally {
        setLoadingMateriais(false);
      }
    }
    if (userType === 'collector' || userType === 'cooperative' || userType === 'company') fetchMateriais();
  }, [userType]);

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

  // Funções de validação
  const validateBasicInfo = () => {
    const errors: Record<string, string> = {};

    if (!basicInfo.name) {
      errors.name = 'Nome é obrigatório';
    }

    if (!basicInfo.document) {
      errors.document = 'Documento é obrigatório';
    }

    if (!basicInfo.email) {
      errors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(basicInfo.email)) {
      errors.email = 'E-mail inválido';
    }

    if (!basicInfo.phone) {
      errors.phone = 'Telefone é obrigatório';
    }

    if (!basicInfo.password) {
      errors.password = 'Senha é obrigatória';
    } else if (basicInfo.password.length < 6) {
      errors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    if (!basicInfo.confirmPassword) {
      errors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (basicInfo.password !== basicInfo.confirmPassword) {
      errors.confirmPassword = 'Senhas não conferem';
    }

    // FOTO OBRIGATÓRIA
    if (!basicInfo.image) {
      errors.image = 'Foto de perfil é obrigatória';
    }

    setBasicInfoErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAddress = () => {
    const errors: Record<string, string> = {};

    if (!address.cep) {
      errors.cep = 'CEP é obrigatório';
    }

    if (!address.rua) {
      errors.rua = 'Rua é obrigatória';
    }

    if (!address.numero) {
      errors.numero = 'Número é obrigatório';
    }

    if (!address.bairro) {
      errors.bairro = 'Bairro é obrigatório';
    }

    if (!address.cidade) {
      errors.cidade = 'Cidade é obrigatória';
    }

    if (!address.estado) {
      errors.estado = 'Estado é obrigatório';
    }

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRepresentative = () => {
    const errors: Record<string, string> = {};

    if (!representative.name) {
      errors.name = 'Nome é obrigatório';
    }

    if (!representative.cpf) {
      errors.cpf = 'CPF é obrigatório';
    }

    if (!representative.email) {
      errors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(representative.email)) {
      errors.email = 'E-mail inválido';
    }

    if (!representative.phone) {
      errors.phone = 'Telefone é obrigatório';
    }

    if (!representative.position) {
      errors.position = 'Cargo é obrigatório';
    }

    // FOTO OBRIGATÓRIA
    if (!representative.image) {
      errors.image = 'Foto do responsável é obrigatória';
    }

    setRepresentativeErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePartnerData = () => {
    const errors: Record<string, string> = {};

    if (partnerType === 'restaurant') {
      if (!partnerData.cuisineType) {
        errors.cuisineType = 'Tipo de cozinha é obrigatório';
      }

      if (!partnerData.capacity) {
        errors.capacity = 'Capacidade é obrigatória';
      }

      if (!partnerData.openingHours) {
        errors.openingHours = 'Horário de funcionamento é obrigatório';
      }

      if (!partnerData.priceRange) {
        errors.priceRange = 'Faixa de preço é obrigatória';
      }

      const hasAttendType = partnerData.attendDelivery || 
        partnerData.attendPresencial || 
        partnerData.attendBuffet || 
        partnerData.attendMarmitex;

      if (!hasAttendType) {
        errors.attendTypes = 'Selecione pelo menos um tipo de atendimento';
      }
    }

    if (partnerType === 'store') {
      if (!partnerData.businessType) {
        errors.businessType = 'Tipo de negócio é obrigatório';
      }

      if (!partnerData.size) {
        errors.size = 'Tamanho do estabelecimento é obrigatório';
      }

      if (!partnerData.openingHours) {
        errors.openingHours = 'Horário de funcionamento é obrigatório';
      }

      if (!partnerData.segments?.length) {
        errors.segments = 'Selecione pelo menos um segmento de loja';
      }
    }

    if (partnerType === 'educational') {
      if (!partnerData.institutionType) {
        errors.institutionType = 'Tipo de instituição é obrigatório';
      }

      if (!partnerData.educationLevels?.length) {
        errors.educationLevels = 'Selecione pelo menos um nível de ensino';
      }

      // Se 'outros' for selecionado, descrição é obrigatória
      if (partnerData.institutionType === 'outros' && !partnerData.institutionTypeOtherDesc?.trim()) {
        errors.institutionType = 'Descreva o tipo de instituição em "Outros"';
      }

      // Se 'outros' estiver selecionado nos níveis de ensino, descrição é obrigatória
      if (partnerData.educationLevels?.includes('outros') && !partnerData.educationLevelsOtherDesc?.trim()) {
        errors.educationLevels = 'Descreva o(s) outro(s) nível(is) de ensino';
      }
    }

    setPartnerErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validação do perfil do restaurante
  const validateRestaurantProfile = () => {
    const errors: Record<string, string> = {};
    if (!attendType.delivery && !attendType.presencial && !attendType.buffet && !attendType.marmitex && !attendType.other) {
      errors.attendTypes = 'Selecione pelo menos um tipo de atendimento';
    }
    if (attendType.other && !(attendType.otherDesc || '').trim()) {
      errors.attendOtherDesc = 'Descreva o tipo de atendimento em "Outros"';
    }
    if (!priceRange) {
      errors.priceRange = 'Selecione a faixa de preço';
    }
    if (!cuisineTypes.trim()) {
      errors.cuisineTypes = 'Informe pelo menos um tipo de culinária';
    }
    if (!openingHours.trim()) {
      errors.openingHours = 'Informe os horários de funcionamento';
    }
    setRestaurantProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validação do perfil da loja
  const validateStoreProfile = () => {
    const errors: Record<string, string> = {};
    if (!storeBusinessType) {
      errors.businessType = 'Informe o tipo de negócio';
    }
    if (!storeSize) {
      errors.size = 'Informe o tamanho da loja';
    }
    if (!storeSegments.length) {
      errors.segments = 'Selecione pelo menos um segmento de loja';
    }
    if (!storeOpeningHours.trim()) {
      errors.openingHours = 'Informe os horários de funcionamento';
    }
    setStoreProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Funções de navegação
  const handleNext = () => {
    // Validação para restaurante
    if (userType === 'partner' && partnerType === 'restaurant' && currentStep === 3) {
      if (!validateRestaurantProfile()) {
        return;
      }
    }
    // Validação para loja
    if (userType === 'partner' && partnerType === 'store' && currentStep === 3) {
      if (!validateStoreProfile()) {
        return;
      }
    }
    // Validação para educacional
    if (userType === 'partner' && partnerType === 'educational' && currentStep === 3) {
      if (!validatePartnerData()) {
        return;
      }
    }
    let isValid = false;

    // Validação especial para etapa de veículo do coletor
    if (userType === 'collector' && currentStep === 2) {
      if (!basicInfo.vehicleType) {
        setVehicleError('Selecione um tipo de veículo para continuar');
        return;
      }
      if (basicInfo.vehicleType === 'other' && !basicInfo.otherVehicleDescription) {
        setVehicleError('Descreva o veículo para continuar');
        return;
      }
      setVehicleError(null);
      setCurrentStep(prev => prev + 1);
      return;
    }

    // Validação especial para etapa de materiais do coletor
    if (userType === 'collector' && currentStep === 3) {
      if (collectorMaterials.length === 0) {
        setMaterialsError('Selecione pelo menos um material para continuar');
        return;
      }
      // Verificar se "outros" está selecionado usando o identificador do banco
      const outrosMaterial = materiaisDb.find(m => m.identificador === 'outros');
      if (outrosMaterial && collectorMaterials.includes(outrosMaterial.id) && !outrosDescricao) {
        setMaterialsError('Descreva os outros materiais para continuar');
        return;
      }
      setMaterialsError(null);
      setCurrentStep(prev => prev + 1);
      return;
    }

    // Se for usuário comum e última etapa, finalize direto
    if (userType === 'common' && currentStep === steps.length - 1) {
      handleConfirm();
      return;
    }

    switch (currentStep) {
      case 0:
        isValid = validateBasicInfo();
        break;
      case 1:
        if (userType === 'common' || userType === 'collector') {
          isValid = validateAddress();
        } else {
          isValid = validateRepresentative();
        }
        break;
      case 2:
        if (userType === 'partner' && partnerType === 'restaurant') {
          isValid = true; // Já validou o perfil do restaurante acima
        } else if (userType === 'partner' && partnerType === 'store') {
          isValid = true; // Já validou o perfil da loja acima
        } else {
          isValid = validateAddress();
        }
        break;
      case 3:
        if (userType === 'partner') {
          isValid = true;
        } else {
          isValid = true;
        }
        break;
      case 4:
        if (userType === 'collector') {
          let valid = true;
          if (bairrosSelecionados.length === 0) {
            setAddressErrors(prev => ({ ...prev, selectedNeighborhoods: 'Adicione pelo menos um bairro para continuar' }));
            valid = false;
          } else {
            setAddressErrors(prev => ({ ...prev, selectedNeighborhoods: undefined }));
          }
          if (diasTrabalho.length === 0) {
            setDiasTrabalhoError('Selecione pelo menos um dia de trabalho');
            valid = false;
          } else {
            setDiasTrabalhoError(null);
          }
          if (periodosDisponiveis.length === 0) {
            setPeriodosDisponiveisError('Selecione pelo menos um período de trabalho');
            valid = false;
          } else {
            setPeriodosDisponiveisError(null);
          }
          if (!valid) return;
          setCurrentStep(prev => prev + 1);
          return;
        }
        // Para cooperativa e empresa coletora, validar só bairros
        if (userType === 'cooperative' || userType === 'company') {
          if (bairrosSelecionados.length === 0) {
            setAddressErrors(prev => ({ ...prev, selectedNeighborhoods: 'Adicione pelo menos um bairro para continuar' }));
            return;
          } else {
            setAddressErrors(prev => ({ ...prev, selectedNeighborhoods: undefined }));
            setCurrentStep(prev => prev + 1);
            return;
          }
        }
        return;
      case 5:
        isValid = true;
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      // Se for a última etapa, mostrar animação de sucesso
      if (currentStep === steps.length - 1) {
        handleConfirm();
      } else {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      // Validação básica antes de enviar
      if (!basicInfo.email || !basicInfo.password || !basicInfo.name || !basicInfo.document || !basicInfo.phone) {
        setBasicInfoErrors({ geral: 'Preencha todos os campos obrigatórios.' });
        setIsConfirming(false);
        return;
      }

      // 1. Criar usuário no Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: basicInfo.email,
        password: basicInfo.password,
        options: {
          data: {
            name: basicInfo.name,
            document: basicInfo.document,
            phone: basicInfo.phone,
            user_type: userType,
          }
        }
      });
      if (signUpError) {
        // Tratamento robusto para diferentes mensagens de e-mail já cadastrado
        const msg = signUpError.message?.toLowerCase() || '';
        if (
          msg.includes('already registered') ||
          msg.includes('already exists') ||
          msg.includes('já existe') ||
          msg.includes('email has already been taken') ||
          msg.includes('email address is already in use')
        ) {
          setBasicInfoErrors({ geral: 'Este e-mail já está cadastrado. Faça login ou use outro e-mail.' });
          setIsConfirming(false);
          toast({
            title: 'E-mail já cadastrado',
            description: 'Este e-mail já está cadastrado. Faça login ou use outro e-mail.',
            variant: 'destructive',
          });
          return;
        }
        throw new Error(signUpError.message || 'Erro ao criar usuário');
      }
      if (!signUpData.user) {
        throw new Error('Erro ao criar usuário: dados inválidos');
      }
      const userId = signUpData.user.id;

      // 2. Inserir usuário na tabela users
      const { error: userInsertError } = await supabase.from('users').insert({
        id: userId,
        name: basicInfo.name,
        document: basicInfo.document,
        phone: basicInfo.phone,
        user_type: userType,
        email: basicInfo.email // Corrigido: agora inclui o campo email
      });
      if (userInsertError) throw new Error(userInsertError.message || 'Erro ao salvar usuário');

      // 3. Salvar endereço
      const { error: addressError } = await supabase.from('addresses').insert({
        user_id: userId,
        street: address.rua,
        number: address.numero,
        complement: address.complemento,
        neighborhood: address.bairro,
        city: address.cidade,
        state: address.estado,
        zip_code: address.cep,
        reference: '',
        is_main: true
      });
      if (addressError) throw new Error(addressError.message || 'Erro ao salvar endereço');

      // 3.1 Salvar representante se for cooperativa ou empresa coletora
      if (userType === 'cooperative' || userType === 'company') {
        const { error: repError } = await supabase.from('representatives').insert({
          user_id: userId,
          name: representative.name,
          cpf: representative.cpf,
          email: representative.email,
          phone: representative.phone,
          position: representative.position || null
        });
        if (repError) throw new Error(repError.message || 'Erro ao salvar representante');
      }

      // 3.2 Salvar parceiro e representante se for parceiro
      if (userType === 'partner') {
        // Salvar representante
        const { error: repError } = await supabase.from('representatives').insert({
          user_id: userId,
          name: representative.name,
          cpf: representative.cpf,
          email: representative.email,
          phone: representative.phone,
          position: representative.position || null
        });
        if (repError) throw new Error(repError.message || 'Erro ao salvar representante');

        // Salvar parceiro
        const { error: partnerError } = await supabase.from('partners').insert({
          user_id: userId,
          partner_type: partnerType
        });
        if (partnerError) throw new Error(partnerError.message || 'Erro ao salvar parceiro');
      }

      // 4. Salvar veículo e materiais se for coletor
      if (userType === 'collector') {
        await saveCollectorVehicle(
          userId,
          basicInfo.vehicleType,
          basicInfo.vehicleType === 'other' ? basicInfo.otherVehicleDescription : undefined
        );
        // Montar array de materiais aceitos com UUID
        const materiaisToSave = collectorMaterials.map(matId => {
          const material = materiaisDb.find(m => m.id === matId);
          return {
            material_id: matId, // UUID do material
            description: material && material.identificador === 'outros' ? outrosDescricao : null
          };
        });
        console.log('DEBUG - Materiais a serem salvos:', materiaisToSave);
        await saveCollectorMaterials(userId, materiaisToSave);

        await saveCollectorSchedules(userId, {
          days: diasTrabalho,
          periods: periodosDisponiveis,
          max_collections_per_day: maxColetas,
          interval_minutes: intervalo
        });
        
        // Salvar bairros (agora com IDs)
        const neighborhoodIds = bairrosSelecionados.map(b => b.id);
        await saveCollectorNeighborhoods(userId, neighborhoodIds);

      }

      // Processar indicação se houver código
      if (referralCode) {
        try {
          const { ReferralService } = await import('@/services/ReferralService');
          const success = await ReferralService.processReferral(referralCode, userId);
          if (success) {
            console.log('✅ Indicação processada com sucesso');
          } else {
            console.log('⚠️ Código de indicação inválido ou já usado');
          }
        } catch (error) {
          console.error('❌ Erro ao processar indicação:', error);
        }
      }

      setShowSuccessAnimation(true);
      setTimeout(() => {
        navigate('/dashboard/standard');
      }, 2000);
    } catch (error: any) {
      setBasicInfoErrors({ geral: error.message || 'Erro ao registrar usuário' });
      console.error('Erro ao registrar:', error);
      toast({
        title: "Erro ao registrar usuário",
        description: error.message || "Ocorreu um erro ao registrar o usuário. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  // Função para definir os passos de acordo com o tipo de usuário
  const getSteps = () => {
    if (userType === 'common') {
      return [
        { label: 'Dados Pessoais' },
        { label: 'Endereço' },
        { label: 'Confirmação' }
      ];
    }
    if (userType === 'collector') {
      return [
        { label: 'Dados Pessoais' },
        { label: 'Endereço' },
        { label: 'Veículo' },
        { label: 'Materiais' },
        { label: 'Bairro / Horários' },
        { label: 'Confirmação' }
      ];
    }
    if (userType === 'cooperative') {
      return [
        { label: 'Dados da Empresa' },
        { label: 'Dados do Responsável' },
        { label: 'Endereço' },
        { label: 'Materiais' },
        { label: 'Bairros de Atuação' },
        { label: 'Confirmação do Cadastro' }
      ];
    }
    if (userType === 'company') {
      return [
        { label: 'Dados da Empresa' },
        { label: 'Dados do Responsável' },
        { label: 'Endereço' },
        { label: 'Materiais' },
        { label: 'Bairros de Atuação' },
        { label: 'Confirmação do Cadastro' }
      ];
    }
    if (userType === 'partner' && partnerType === 'restaurant') {
      return [
        { label: 'Dados da Empresa' },
        { label: 'Dados do Responsável' },
        { label: 'Endereço' },
        { label: 'Perfil do Restaurante' },
        { label: 'Confirmação do Cadastro' }
      ];
    }
    if (userType === 'partner' && partnerType === 'store') {
      return [
        { label: 'Dados da Empresa' },
        { label: 'Dados do Responsável' },
        { label: 'Endereço' },
        { label: 'Perfil da Loja' },
        { label: 'Confirmação do Cadastro' }
      ];
    }
    if (userType === 'partner' && partnerType === 'educational') {
      return [
        { label: 'Dados da Empresa' },
        { label: 'Dados do Responsável' },
        { label: 'Endereço' },
        { label: 'Perfil da Instituição' },
        { label: 'Confirmação do Cadastro' }
      ];
    }
    // Outros tipos de usuário...
    return [
      { label: 'Dados da Empresa' },
      { label: 'Dados do Responsável' },
      { label: 'Endereço' },
      { label: 'Materiais' },
      { label: 'Bairros de Atuação' },
      { label: 'Confirmação do Cadastro' }
    ];
  };

  const steps = getSteps();

  // Funções para adicionar/remover bairro
  const handleAddBairro = async (bairroName?: string) => {
    const nomeBairro = (bairroName || novoBairro).trim();
    if (!nomeBairro || !cityId) return;
    try {
      const neighborhoodId = await getOrCreateNeighborhood(nomeBairro, cityId);
      if (!bairrosSelecionados.some(b => b.id === neighborhoodId)) {
        setBairrosSelecionados([...bairrosSelecionados, { id: neighborhoodId, nome: nomeBairro }]);
      }
      setNovoBairro('');
    } catch (error) {
      console.error("Falha ao adicionar bairro:", error);
    }
  };
  const handleRemoveBairro = (bairroId: string) => {
    setBairrosSelecionados(bairrosSelecionados.filter(b => b.id !== bairroId));
  };

  // MAPA DE TRADUÇÃO E ORDEM (removido - agora usando importação global)
  // const materialDisplayData = {
  //   papel: { nome: 'Papel/Papelão', icone: Archive, order: 1, cor: 'text-yellow-700' },
  //   plastico: { nome: 'Plástico', icone: Package, order: 2, cor: 'text-blue-600' },
  //   vidro: { nome: 'Vidro', icone: GlassWater, order: 3, cor: 'text-green-700' },
  //   organico: { nome: 'Orgânico', icone: Leaf, order: 4, cor: 'text-green-500' },
  //   eletronico: { nome: 'Eletrônico', icone: Cpu, order: 5, cor: 'text-purple-700' },
  //   aluminio: { nome: 'Alumínio', icone: Recycle, order: 6, cor: 'text-gray-500' },
  //   pilhas: { nome: 'Pilhas e Baterias', icone: Battery, order: 7, cor: 'text-red-700' },
  //   cobre: { nome: 'Cobre', icone: CircleDashed, order: 8, cor: 'text-orange-700' },
  //   latinha: { nome: 'Latinha', icone: Recycle, order: 9, cor: 'text-yellow-500' },
  //   lampadas: { nome: 'Lâmpadas', icone: Lightbulb, order: 10, cor: 'text-blue-700' },
  //   oleo: { nome: 'Óleo', icone: Droplets, order: 11, cor: 'text-amber-700' },
  //   metal: { nome: 'Metal', icone: Recycle, order: 12, cor: 'text-gray-500' },
  //   outros: { nome: 'Outros', icone: TrashIcon, order: 99, cor: 'text-neutral-500' }, // 'Outros' sempre por último
  // };

  // MAPA DE ÍCONES PARA COOPERATIVA (corrigindo o erro de materialIcons não definido)
  const materialIcons: Record<string, React.ReactNode> = {
    'Papel/Papelão': <Archive className="h-4 w-4 text-yellow-700" />,
    'Plástico': <Package className="h-4 w-4 text-blue-600" />,
    'Vidro': <GlassWater className="h-4 w-4 text-green-700" />,
    'Orgânico': <Leaf className="h-4 w-4 text-green-500" />,
    'Eletrônico': <Cpu className="h-4 w-4 text-purple-700" />,
    'Alumínio': <Recycle className="h-4 w-4 text-gray-500" />,
    'Pilhas e Baterias': <Battery className="h-4 w-4 text-red-700" />,
    'Cobre': <CircleDashed className="h-4 w-4 text-orange-700" />,
    'Latinha': <Recycle className="h-4 w-4 text-yellow-500" />,
    'Lâmpadas': <Lightbulb className="h-4 w-4 text-blue-700" />,
    'Óleo': <Droplets className="h-4 w-4 text-amber-700" />,
    'Metal': <Recycle className="h-4 w-4 text-gray-500" />,
    'Outros': <TrashIcon className="h-4 w-4 text-neutral-500" />,
  };

  // Funções de máscara e validação de documento
  function maskCPF(value: string) {
    const cleaned = value.replace(/\D/g, '').slice(0, 11);
    return cleaned
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  function maskCNPJ(value: string) {
    const cleaned = value.replace(/\D/g, '').slice(0, 14);
    return cleaned
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }
  function isValidCPF(value: string) {
    return value.replace(/\D/g, '').length === 11;
  }
  function isValidCNPJ(value: string) {
    return value.replace(/\D/g, '').length === 14;
  }

  // Renderização do conteúdo da etapa atual
  const renderStepContent = () => {
    if (userType === 'common') {
      switch (currentStep) {
        case 0:
          return (
            <div className="space-y-6">
            <BasicInfoForm
              data={basicInfo}
              onDataChange={setBasicInfo}
              errors={basicInfoErrors}
              userType={userType}
            />
              <ReferralInput
                onReferralCodeChange={setReferralCode}
                initialCode={referralCode}
              />
            </div>
          );
        case 1:
          return (
            <AddressForm
              data={address}
              onDataChange={setAddress}
              errors={addressErrors}
            />
          );
        case 2:
          return (
            <RegistrationConfirmation
              name={basicInfo.name}
              email={basicInfo.email}
              document={basicInfo.document}
              phone={basicInfo.phone}
              address={{
                rua: address?.rua || '',
                numero: address?.numero || '',
                complemento: address?.complemento || '',
                bairro: address?.bairro || '',
                cidade: address?.cidade || '',
                estado: address?.estado || '',
                cep: address?.cep || ''
              }}
              image={basicInfo.image}
            />
          );
        default:
          return null;
      }
    }
    if (userType === 'collector') {
      switch (currentStep) {
        case 0:
          return (
            <div className="space-y-6">
            <BasicInfoForm
              data={basicInfo}
              onDataChange={setBasicInfo}
              errors={basicInfoErrors}
              userType={userType}
            />
              <ReferralInput
                onReferralCodeChange={setReferralCode}
                initialCode={referralCode}
              />
            </div>
          );
        case 1:
          return (
            <AddressForm
              data={address}
              onDataChange={setAddress}
              errors={addressErrors}
            />
          );
        case 2:
          return (
            <VehicleSelector
              selectedVehicle={basicInfo.vehicleType || ''}
              onChange={vehicle => {
                setBasicInfo(prev => ({ ...prev, vehicleType: vehicle }));
                setVehicleError(null);
              }}
              otherVehicleDescription={basicInfo.otherVehicleDescription || ''}
              onOtherDescriptionChange={desc => setBasicInfo(prev => ({ ...prev, otherVehicleDescription: desc }))}
              error={vehicleError}
            />
          );
        case 3:
          if (loadingMateriais) return <div>Carregando materiais...</div>;
          if (!materiaisDb || materiaisDb.length === 0) return <div className="text-red-500">Nenhum material cadastrado.</div>;
          
          const sortedMateriais = [...materiaisDb].sort((a, b) => {
            const orderA = materialDisplayData[a.identificador]?.order || 999;
            const orderB = materialDisplayData[b.identificador]?.order || 999;
            return orderA - orderB;
          });

          return (
            <div className="space-y-4">
              <h3 className="font-semibold mb-2">Materiais que Coleta</h3>
              <p className="text-muted-foreground text-sm mb-2">Selecione os materiais que você coleta.</p>
              
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-4">
                {sortedMateriais.map((material) => {
                  const displayData = materialDisplayData[material.identificador];
                  if (!displayData) return null;

                  return (
                    <label key={material.id} htmlFor={material.id} className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Switch
                          id={material.id}
                          checked={collectorMaterials.includes(material.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setCollectorMaterials([...collectorMaterials, material.id]);
                            } else {
                              setCollectorMaterials(collectorMaterials.filter(m => m !== material.id));
                              if (material.identificador === 'outros') {
                                setOutrosDescricao('');
                              }
                            }
                            setMaterialsError(null);
                          }}
                        />
                        {React.createElement(displayData.icone, { className: `${displayData.cor} h-5 w-5` })}
                        <span className="ml-2">{displayData.nome}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
              
              {(() => {
                const outrosMaterial = materiaisDb.find(m => m.identificador === 'outros');
                return outrosMaterial && collectorMaterials.includes(outrosMaterial.id);
              })() && (
                <div className="space-y-2">
                  <label htmlFor="outros-descricao">Descrição dos Outros Materiais</label>
                  <Textarea
                    id="outros-descricao"
                    placeholder="Descreva quais outros tipos de materiais você aceita coletar..."
                    className="h-24"
                    value={outrosDescricao}
                    onChange={e => setOutrosDescricao(e.target.value)}
                  />
                </div>
              )}

              {materialsError && (
                <p className="text-red-500 text-xs mt-2">{materialsError}</p>
              )}
            </div>
          );
        case 4:
          if (userType === 'collector') {
            return (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Adicione os bairros onde você realiza coletas.
                </p>
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
                            onClick={() => handleAddBairro(bairro)}
                          >
                            {bairro}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button variant="outline" onClick={() => handleAddBairro()}>
                    + Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {bairrosSelecionados.map((bairro) => (
                    <Badge
                      key={bairro.id}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                    >
                      {bairro.nome}
                      <button
                        onClick={() => handleRemoveBairro(bairro.id)}
                        className="ml-1 hover:bg-destructive/20 rounded-full p-1"
                        type="button"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {/* Exibir erro se necessário */}
                {addressErrors.selectedNeighborhoods && (
                  <p className="text-red-500 text-xs mt-2">{addressErrors.selectedNeighborhoods}</p>
                )}
                {/* Campos de horários do coletor */}
                <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-medium mb-2">Disponibilidade de Horários</h3>
                  <div>
                    <label className="block mb-1 font-medium">Dias de Trabalho</label>
                    <div className="grid grid-cols-7 gap-2">
                      {DIAS_SEMANA.map((dia) => (
                        <div key={dia.id} className="flex flex-col items-center">
                          <label htmlFor={dia.id} className="text-center">{dia.shortLabel}</label>
                          <Switch
                            id={dia.id}
                            checked={diasTrabalho.includes(dia.id)}
                            onCheckedChange={() => {
                              setDiasTrabalho(prev => prev.includes(dia.id)
                                ? prev.filter(d => d !== dia.id)
                                : [...prev, dia.id]);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    {diasTrabalhoError && (
                      <p className="text-red-500 text-xs mt-1">{diasTrabalhoError}</p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Períodos Disponíveis</label>
                    <div className="flex gap-4">
                      {PERIODOS_OPCOES.map(periodo => (
                        <div key={periodo.id} className="flex items-center space-x-2">
                          <Switch
                            id={periodo.id}
                            checked={periodosDisponiveis.includes(periodo.id)}
                            onCheckedChange={() => {
                              setPeriodosDisponiveis(prev => prev.includes(periodo.id)
                                ? prev.filter(p => p !== periodo.id)
                                : [...prev, periodo.id]);
                            }}
                          />
                          <label htmlFor={periodo.id}>{periodo.nome}</label>
                        </div>
                      ))}
                    </div>
                    {periodosDisponiveisError && (
                      <p className="text-red-500 text-xs mt-1">{periodosDisponiveisError}</p>
                    )}
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
                </div>
              </div>
            );
          }
          // Para outros tipos de usuário, manter apenas o formulário de bairros
          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Adicione os bairros onde a cooperativa realiza coletas.
              </p>
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
                          onClick={() => handleAddBairro(bairro)}
                        >
                          {bairro}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button variant="outline" onClick={() => handleAddBairro()}>
                  + Adicionar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {bairrosSelecionados.map((bairro) => (
                  <Badge
                    key={bairro.id}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1"
                  >
                    {bairro.nome}
                    <button
                      onClick={() => handleRemoveBairro(bairro.id)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-1"
                      type="button"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              {/* Exibir erro se necessário */}
              {addressErrors.selectedNeighborhoods && (
                <p className="text-red-500 text-xs mt-2">{addressErrors.selectedNeighborhoods}</p>
              )}
            </div>
          );
        case 5:
          // Etapa de confirmação para coletor
          // Ícones de veículos e materiais (reutilizar os mesmos das etapas anteriores)
          const vehicleIcons = {
            car: <Car className="inline-block mr-1 text-blue-700 h-5 w-5" />, 
            truck: <Truck className="inline-block mr-1 text-gray-700 h-5 w-5" />, 
            bike: <Bike className="inline-block mr-1 text-green-700 h-5 w-5" />, 
            motorcycle: <ShoppingCart className="inline-block mr-1 text-orange-700 h-5 w-5" />, 
            cart: <ShoppingCart className="inline-block mr-1 text-yellow-700 h-5 w-5" />, 
            other: <ShoppingCart className="inline-block mr-1 text-neutral-500 h-5 w-5" />,
            walk: <User className="inline-block mr-1 text-gray-400 h-5 w-5" />
          };
          return (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Confirmação</h2>
              <p className="text-muted-foreground mb-2">Revise as informações abaixo e confirme seu cadastro</p>
              <div className="bg-white rounded-lg shadow p-4 space-y-4">
                <div className="flex flex-col items-center gap-2 mb-2">
                  {basicInfo.image ? (
                    <img src={typeof basicInfo.image === 'string' ? basicInfo.image : URL.createObjectURL(basicInfo.image)} alt="Foto de perfil" className="w-24 h-24 rounded-full object-cover" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-3xl">
                      <span>+</span>
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-2">Seus Dados</h3>
                <div className="flex flex-col gap-1 mb-2">
                  <span><b>Nome:</b> {basicInfo.name}</span>
                  <span><b>E-mail:</b> {basicInfo.email}</span>
                  <span><b>Documento:</b> {basicInfo.document}</span>
                  <span><b>Telefone:</b> {basicInfo.phone}</span>
                  <span><b>Endereço:</b> {address.rua}, {address.numero} {address.complemento && `- ${address.complemento}`}, {address.bairro}, {address.cidade} - {address.estado}</span>
                </div>
                <div className="mb-2">
                  <h4 className="font-semibold">Veículo Utilizado</h4>
                  {basicInfo.vehicleType ? (
                    <span className="flex items-center mt-1">
                      {vehicleIcons[basicInfo.vehicleType] || vehicleIcons['other']}
                      {basicInfo.vehicleType === 'other' ? basicInfo.otherVehicleDescription : basicInfo.vehicleType.charAt(0).toUpperCase() + basicInfo.vehicleType.slice(1)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Não informado</span>
                  )}
                </div>
                <div className="mb-2">
                  <h4 className="font-semibold">Materiais que Coleta</h4>
                  <div className="flex flex-wrap gap-2">
                    {collectorMaterials.map((materialId) => {
                      const materialObj = materiaisDb.find(m => m.id === materialId);
                      const identificador = materialObj?.identificador;
                      const displayData = identificador ? materialDisplayData[identificador] : undefined;
                      return (
                        <span key={materialId} className="flex items-center gap-1 border rounded px-2 py-1 bg-muted">
                          {displayData ? (
                            React.createElement(displayData.icone, { className: `h-5 w-5 ${displayData.cor}` })
                          ) : (
                            <TrashIcon className="h-5 w-5 text-neutral-500" />
                          )}
                          {displayData ? displayData.nome : materialObj?.nome || materialId}
                        </span>
                      )
                    })}
                  </div>
                  {(() => {
                    const outrosMaterial = materiaisDb.find(m => m.identificador === 'outros');
                    return outrosMaterial && collectorMaterials.includes(outrosMaterial.id) && outrosDescricao && (
                      <p className="text-sm text-muted-foreground mt-1">Outros: {outrosDescricao}</p>
                    );
                  })()}
                </div>
                <div className="mb-2">
                  <h4 className="font-semibold">Bairros de Atuação</h4>
                  <ul className="list-disc ml-6">
                    {bairrosSelecionados.map((bairro) => (
                      <li key={bairro.id}>{bairro.nome}</li>
                    ))}
                  </ul>
                </div>
                <div className="mb-2">
                  <h4 className="font-semibold">Horários de Trabalho</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="font-medium">Dias:</span>
                    {diasTrabalho.map((dia) => (
                      <span key={dia} className="border rounded px-2 py-1 bg-muted text-xs">{DIAS_SEMANA.find(d => d.id === dia)?.shortLabel}</span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="font-medium">Períodos:</span>
                    {periodosDisponiveis.map((periodo) => (
                      <span key={periodo} className="border rounded px-2 py-1 bg-muted text-xs">{PERIODOS_OPCOES.find(p => p.id === periodo)?.nome}</span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="font-medium">Intervalo:</span>
                    <span className="border rounded px-2 py-1 bg-muted text-xs">{intervalo} min</span>
                    <span className="font-medium ml-2">Máx. coletas/dia:</span>
                    <span className="border rounded px-2 py-1 bg-muted text-xs">{maxColetas}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 mt-4">
                <h4 className="font-semibold mb-2">Termos e Condições</h4>
                <ul className="list-disc ml-6 text-sm mb-2">
                  <li>Compromisso com práticas sustentáveis e gestão adequada de resíduos</li>
                  <li>Fornecimento de informações verdadeiras e atualizadas</li>
                  <li>Participação ativa nos programas de sustentabilidade</li>
                  <li>Respeito às políticas de privacidade e proteção de dados</li>
                </ul>
                <span className="text-xs text-muted-foreground">Ao confirmar seu cadastro, você concorda com os termos acima.</span>
              </div>
            </div>
          );
        default:
          return null;
      }
    }
    if (userType === 'partner' && partnerType === 'restaurant') {
      switch (currentStep) {
        case 0:
          return (
            <BasicInfoForm
              data={basicInfo}
              onDataChange={setBasicInfo}
              errors={basicInfoErrors}
              userType={userType}
            />
          );
        case 1:
          return (
            <RepresentativeForm
              data={representative}
              onDataChange={setRepresentative}
              errors={representativeErrors}
            />
          );
        case 2:
          return (
            <AddressForm
              data={address}
              onDataChange={setAddress}
              errors={addressErrors}
            />
          );
        case 3:
          // Perfil do Restaurante
          return (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Perfil do Restaurante</h2>
              <div>
                <label className="block mb-1 font-medium">Tipos de atendimento *</label>
                <AttendTypeSwitch
                  value={attendType}
                  onChange={setAttendType}
                  error={restaurantProfileErrors.attendTypes}
                  otherDescError={restaurantProfileErrors.attendOtherDesc}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Faixa de preço *</label>
                <select className="w-full border rounded p-2" value={priceRange} onChange={e => setPriceRange(e.target.value)}>
                  <option value="">Selecione</option>
                  <option value="baixo">Baixo</option>
                  <option value="medio">Médio</option>
                  <option value="alto">Alto</option>
                </select>
                {restaurantProfileErrors.priceRange && (
                  <p className="text-red-500 text-xs mt-1">{restaurantProfileErrors.priceRange}</p>
                )}
              </div>
              <div>
                <label className="block mb-1 font-medium">Tipos de culinária *</label>
                <Input
                  placeholder="Ex: Brasileira, Italiana, Japonesa..."
                  value={cuisineTypes}
                  onChange={e => setCuisineTypes(e.target.value)}
                />
                {restaurantProfileErrors.cuisineTypes && (
                  <p className="text-red-500 text-xs mt-1">{restaurantProfileErrors.cuisineTypes}</p>
                )}
              </div>
              <div>
                <label className="block mb-1 font-medium">Horários de funcionamento *</label>
                <Input
                  placeholder="Ex: Segunda a Sexta, 11h-15h e 18h-22h"
                  value={openingHours}
                  onChange={e => setOpeningHours(e.target.value)}
                />
                {restaurantProfileErrors.openingHours && (
                  <p className="text-red-500 text-xs mt-1">{restaurantProfileErrors.openingHours}</p>
                )}
              </div>
            </div>
          );
        case 4:
          // Confirmação do Cadastro
          return (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-center">Confirme seu Cadastro</h2>
              <p className="text-muted-foreground text-center mb-4">Revise as informações abaixo e confirme seu cadastro</p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2 text-center">Dados da Empresa</h3>
                {basicInfo.image && (
                  <div className="flex justify-center mb-2">
                    <img
                      src={typeof basicInfo.image === 'string' ? basicInfo.image : URL.createObjectURL(basicInfo.image)}
                      alt="Foto da empresa"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  </div>
                )}
                <div className="space-y-1 text-sm text-center">
                  <div><strong>Nome:</strong> {basicInfo.name}</div>
                  <div><strong>CNPJ:</strong> {basicInfo.document}</div>
                  <div><strong>E-mail:</strong> {basicInfo.email}</div>
                  <div><strong>Telefone:</strong> {basicInfo.phone}</div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2 text-center">Dados do Responsável</h3>
                {representative.image ? (
                  <div className="flex justify-center mb-2">
                    <img
                      src={typeof representative.image === 'string' ? representative.image : URL.createObjectURL(representative.image)}
                      alt="Foto do responsável"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex justify-center mb-2">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-3xl">
                      <span>+</span>
                    </div>
                  </div>
                )}
                <div className="space-y-1 text-sm text-center">
                  <div><strong>Nome:</strong> {representative.name}</div>
                  <div><strong>Cargo:</strong> {representative.position}</div>
                  <div><strong>E-mail:</strong> {representative.email}</div>
                  <div><strong>Telefone:</strong> {representative.phone}</div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2 text-center">Endereço</h3>
                <div className="space-y-1 text-sm text-center">
                  <div><strong>Rua:</strong> {address.rua}, {address.numero}{address.complemento ? `, ${address.complemento}` : ''}</div>
                  <div><strong>Bairro:</strong> {address.bairro}</div>
                  <div><strong>Cidade:</strong> {address.cidade} - {address.estado}</div>
                  <div><strong>CEP:</strong> {address.cep}</div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2 text-center">Perfil do Restaurante</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {attendTypesData.map(type => (
                    attendType[type.key] && (
                      <span key={type.key} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${type.color}`}>
                        {type.icon}
                        {type.key === 'other' ? (attendType.otherDesc || 'Outros') : type.label}
                      </span>
                    )
                  ))}
                </div>
                <div className="mt-3 space-y-1 text-sm text-center">
                  <div><strong>Faixa de Preço:</strong> {priceRange ? (priceRange === 'baixo' ? 'Baixo' : priceRange === 'medio' ? 'Médio' : 'Alto') : '-'}</div>
                  <div><strong>Tipos de Culinária:</strong> {cuisineTypes || '-'}</div>
                  <div><strong>Horários de Funcionamento:</strong> {openingHours || '-'}</div>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Termos e Condições</h3>
                <ul className="list-disc ml-6 text-sm mb-2">
                  <li>Compromisso com práticas sustentáveis e gestão adequada de resíduos</li>
                  <li>Fornecimento de informações verdadeiras e atualizadas</li>
                  <li>Participação ativa nos programas de sustentabilidade</li>
                  <li>Respeito às políticas de privacidade e proteção de dados</li>
                </ul>
                <p className="text-xs text-muted-foreground">Ao confirmar seu cadastro, você concorda com os termos acima.</p>
              </div>
            </div>
          );
        default:
          return null;
      }
    }
    if (userType === 'partner' && partnerType === 'store') {
      switch (currentStep) {
        case 0:
          return (
            <BasicInfoForm
              data={basicInfo}
              onDataChange={setBasicInfo}
              errors={basicInfoErrors}
              userType={userType}
            />
          );
        case 1:
          return (
            <RepresentativeForm
              data={representative}
              onDataChange={setRepresentative}
              errors={representativeErrors}
            />
          );
        case 2:
          return (
            <AddressForm
              data={address}
              onDataChange={setAddress}
              errors={addressErrors}
            />
          );
        case 3:
          // Perfil da Loja
          return (
            <div className="space-y-6">
              <div>
                <label className="block mb-1 font-medium">Tipo de negócio *</label>
                <input
                  className="w-full border rounded p-2"
                  placeholder="Ex: Roupas, Eletrônicos, Mercado..."
                  value={storeBusinessType}
                  onChange={e => setStoreBusinessType(e.target.value)}
                />
                {storeProfileErrors.businessType && (
                  <p className="text-red-500 text-xs mt-1">{storeProfileErrors.businessType}</p>
                )}
              </div>
              <div>
                <label className="block mb-1 font-medium">Tamanho da loja *</label>
                <select
                  className="w-full border rounded p-2"
                  value={storeSize}
                  onChange={e => setStoreSize(e.target.value)}
                >
                  <option value="">Selecione</option>
                  <option value="pequena">Pequena</option>
                  <option value="media">Média</option>
                  <option value="grande">Grande</option>
                </select>
                {storeProfileErrors.size && (
                  <p className="text-red-500 text-xs mt-1">{storeProfileErrors.size}</p>
                )}
              </div>
              <div>
                <label className="block mb-1 font-medium">Segmentos da loja *</label>
                <StoreSegmentSwitch
                  value={storeSegments as any}
                  onChange={setStoreSegments}
                  error={storeProfileErrors.segments}
                  otherDesc={storeOtherSegment}
                  onOtherDescChange={setStoreOtherSegment}
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="sustainable-store"
                  checked={isSustainableStore}
                  onChange={e => setIsSustainableStore(e.target.checked)}
                />
                <label htmlFor="sustainable-store" className="font-medium flex items-center gap-1">
                  <span role="img" aria-label="Sustentável">♻️</span> Loja Sustentável
                </label>
              </div>
              <div>
                <label className="block mb-1 font-medium">Horários de funcionamento *</label>
                <input
                  className="w-full border rounded p-2"
                  placeholder="Ex: Segunda a Sábado, 9h-18h"
                  value={storeOpeningHours}
                  onChange={e => setStoreOpeningHours(e.target.value)}
                />
                {storeProfileErrors.openingHours && (
                  <p className="text-red-500 text-xs mt-1">{storeProfileErrors.openingHours}</p>
                )}
              </div>
            </div>
          );
        case 4:
          // Confirmação do Cadastro
          return (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-center">Confirme seu Cadastro</h2>
              <p className="text-muted-foreground text-center mb-4">Revise as informações abaixo e confirme seu cadastro</p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2 text-center">Dados da Empresa</h3>
                {basicInfo.image && (
                  <div className="flex justify-center mb-2">
                    <img
                      src={typeof basicInfo.image === 'string' ? basicInfo.image : URL.createObjectURL(basicInfo.image)}
                      alt="Foto da empresa"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  </div>
                )}
                <div className="space-y-1 text-sm text-center">
                  <div><strong>Nome:</strong> {basicInfo.name}</div>
                  <div><strong>CNPJ:</strong> {basicInfo.document}</div>
                  <div><strong>E-mail:</strong> {basicInfo.email}</div>
                  <div><strong>Telefone:</strong> {basicInfo.phone}</div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2 text-center">Dados do Responsável</h3>
                {representative.image ? (
                  <div className="flex justify-center mb-2">
                    <img
                      src={typeof representative.image === 'string' ? representative.image : URL.createObjectURL(representative.image)}
                      alt="Foto do responsável"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex justify-center mb-2">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-3xl">
                      <span>+</span>
                    </div>
                  </div>
                )}
                <div className="space-y-1 text-sm text-center">
                  <div><strong>Nome:</strong> {representative.name}</div>
                  <div><strong>Cargo:</strong> {representative.position}</div>
                  <div><strong>E-mail:</strong> {representative.email}</div>
                  <div><strong>Telefone:</strong> {representative.phone}</div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2 text-center">Endereço</h3>
                <div className="space-y-1 text-sm text-center">
                  <div><strong>Rua:</strong> {address.rua}, {address.numero}{address.complemento ? `, ${address.complemento}` : ''}</div>
                  <div><strong>Bairro:</strong> {address.bairro}</div>
                  <div><strong>Cidade:</strong> {address.cidade} - {address.estado}</div>
                  <div><strong>CEP:</strong> {address.cep}</div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2 text-center">Perfil da Loja</h3>
                <div className="flex flex-col gap-2 text-sm">
                  <div>
                    <strong>Tipo de negócio:</strong> {storeBusinessType || <span className="text-muted-foreground">Não informado</span>}
                  </div>
                  <div>
                    <strong>Tamanho:</strong> {storeSize === 'pequena' ? 'Pequena' : storeSize === 'media' ? 'Média' : storeSize === 'grande' ? 'Grande' : <span className="text-muted-foreground">Não informado</span>}
                  </div>
                  <div>
                    <strong>Horário de funcionamento:</strong> {storeOpeningHours || <span className="text-muted-foreground">Não informado</span>}
                  </div>
                  <div>
                    <strong>Segmentos:</strong>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {storeSegments.map(seg => {
                        const segData = STORE_SEGMENTS.find(s => s.key === seg);
                        if (!segData) return null;
                        return (
                          <span key={seg} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${segData.color}`}>
                            {segData.icon} {segData.label === 'Outros' ? (storeOtherSegment || 'Outros') : segData.label}
                          </span>
                        );
                      })}
                      {isSustainableStore && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-200 text-green-800 border border-green-400">
                          ♻️ Loja Sustentável
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Termos e Condições</h3>
                <ul className="list-disc ml-6 text-sm mb-2">
                  <li>Compromisso com práticas sustentáveis e gestão adequada de resíduos</li>
                  <li>Fornecimento de informações verdadeiras e atualizadas</li>
                  <li>Participação ativa nos programas de sustentabilidade</li>
                  <li>Respeito às políticas de privacidade e proteção de dados</li>
                </ul>
                <p className="text-xs text-muted-foreground">Ao confirmar seu cadastro, você concorda com os termos acima.</p>
              </div>
            </div>
          );
        default:
          return null;
      }
    }
    if (userType === 'partner' && partnerType === 'educational') {
      switch (currentStep) {
        case 0:
          return (
            <BasicInfoForm
              data={basicInfo}
              onDataChange={setBasicInfo}
              errors={basicInfoErrors}
              userType={userType}
            />
          );
        case 1:
          return (
            <RepresentativeForm
              data={representative}
              onDataChange={setRepresentative}
              errors={representativeErrors}
            />
          );
        case 2:
          return (
            <AddressForm
              data={address}
              onDataChange={setAddress}
              errors={addressErrors}
            />
          );
        case 3:
          // Perfil da Instituição
          return (
            <div className="space-y-6">
              {/* Título principal já existe no Card, não repetir subtítulo */}
              <div>
                <label className="block mb-1 font-medium">Tipo de instituição *</label>
                <EducationTypeSwitch
                  value={partnerData.institutionType}
                  onChange={val => setPartnerData(prev => ({ ...prev, institutionType: val }))}
                  otherInstitutionTypeDesc={partnerData.institutionTypeOtherDesc || ''}
                  onOtherInstitutionTypeDescChange={desc => setPartnerData(prev => ({ ...prev, institutionTypeOtherDesc: desc }))}
                  error={partnerErrors.institutionType}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Níveis de ensino *</label>
                <EducationLevelSwitch
                  value={partnerData.educationLevels || []}
                  onChange={levels => setPartnerData(prev => ({ ...prev, educationLevels: levels }))}
                  otherEducationLevelDesc={partnerData.educationLevelsOtherDesc || ''}
                  onOtherEducationLevelDescChange={desc => setPartnerData(prev => ({ ...prev, educationLevelsOtherDesc: desc }))}
                  error={partnerErrors.educationLevels}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Programas ativos</label>
                <input
                  className="w-full border rounded p-2"
                  placeholder="Ex: Educação Ambiental, Projetos de Sustentabilidade..."
                  value={partnerData.activePrograms}
                  onChange={e => setPartnerData(prev => ({ ...prev, activePrograms: e.target.value }))}
                />
              </div>
            </div>
          );
        case 4:
          // Confirmação do Cadastro
          return (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-center">Confirme seu Cadastro</h2>
              <p className="text-muted-foreground text-center mb-4">Revise as informações abaixo e confirme seu cadastro</p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2 text-center">Dados da Empresa</h3>
                {basicInfo.image && (
                  <div className="flex justify-center mb-2">
                    <img
                      src={typeof basicInfo.image === 'string' ? basicInfo.image : URL.createObjectURL(basicInfo.image)}
                      alt="Foto da empresa"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  </div>
                )}
                <div className="space-y-1 text-sm text-center">
                  <div><strong>Nome:</strong> {basicInfo.name}</div>
                  <div><strong>CNPJ:</strong> {basicInfo.document}</div>
                  <div><strong>E-mail:</strong> {basicInfo.email}</div>
                  <div><strong>Telefone:</strong> {basicInfo.phone}</div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2 text-center">Dados do Responsável</h3>
                {representative.image ? (
                  <div className="flex justify-center mb-2">
                    <img
                      src={typeof representative.image === 'string' ? representative.image : URL.createObjectURL(representative.image)}
                      alt="Foto do responsável"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex justify-center mb-2">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-3xl">
                      <span>+</span>
                    </div>
                  </div>
                )}
                <div className="space-y-1 text-sm text-center">
                  <div><strong>Nome:</strong> {representative.name}</div>
                  <div><strong>Cargo:</strong> {representative.position}</div>
                  <div><strong>E-mail:</strong> {representative.email}</div>
                  <div><strong>Telefone:</strong> {representative.phone}</div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2 text-center">Endereço</h3>
                <div className="space-y-1 text-sm text-center">
                  <div><strong>Rua:</strong> {address.rua}, {address.numero}{address.complemento ? `, ${address.complemento}` : ''}</div>
                  <div><strong>Bairro:</strong> {address.bairro}</div>
                  <div><strong>Cidade:</strong> {address.cidade} - {address.estado}</div>
                  <div><strong>CEP:</strong> {address.cep}</div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2 text-center">Perfil da Instituição</h3>
                <div className="flex flex-col gap-2 text-sm">
                  <div>
                    <strong>Tipo de instituição:</strong> {partnerData.institutionType === 'outros'
                      ? `outros${partnerData.institutionTypeOtherDesc ? ` (${partnerData.institutionTypeOtherDesc})` : ''}`
                      : partnerData.institutionType || <span className="text-muted-foreground">Não informado</span>}
                  </div>
                  <div>
                     <strong>Níveis de ensino:</strong>
                     <div className="flex flex-wrap gap-2 mt-1">
                       {(partnerData.educationLevels || []).map(level => {
                         const levelData = EDUCATION_LEVELS.find(l => l.key === level);
                         if (!levelData) return null;
                         return (
                           <span key={level} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${levelData.color} bg-gray-100`}>
                             {levelData.icon} {levelData.label}
                             {level === 'outros' && partnerData.educationLevelsOtherDesc && (
                               <span className="ml-1 text-gray-700">({partnerData.educationLevelsOtherDesc})</span>
                             )}
                           </span>
                         );
                       })}
                       {(!partnerData.educationLevels || partnerData.educationLevels.length === 0) && (
                         <span className="text-muted-foreground">Não informado</span>
                       )}
                     </div>
                  </div>
                  <div>
                    <strong>Programas ativos:</strong> {partnerData.activePrograms || <span className="text-muted-foreground">Não informado</span>}
                  </div>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Termos e Condições</h3>
                <ul className="list-disc ml-6 text-sm mb-2">
                  <li>Compromisso com práticas sustentáveis e gestão adequada de resíduos</li>
                  <li>Fornecimento de informações verdadeiras e atualizadas</li>
                  <li>Participação ativa nos programas de sustentabilidade</li>
                  <li>Respeito às políticas de privacidade e proteção de dados</li>
                </ul>
                <p className="text-xs text-muted-foreground">Ao confirmar seu cadastro, você concorda com os termos acima.</p>
              </div>
            </div>
          );
        default:
          return null;
      }
    }
    // ... restante do renderStepContent para outros tipos
    switch (currentStep) {
      case 0:
        return (
          <BasicInfoForm
            data={basicInfo}
            onDataChange={setBasicInfo}
            errors={basicInfoErrors}
            userType={userType}
          />
        );
      case 1:
        return (
          <RepresentativeForm
            data={representative}
            onDataChange={setRepresentative}
            errors={representativeErrors}
          />
        );
      case 2:
        return (
          <AddressForm
            data={address}
            onDataChange={setAddress}
            errors={addressErrors}
          />
        );
      case 3:
        if (userType === 'partner') {
          return (
            <PartnerTypeForm
              type={partnerType}
              data={partnerData}
              onChange={setPartnerData}
              errors={partnerErrors}
            />
          );
        }
        // Materiais para cooperativa (igual ao coletor)
        if (loadingMateriais) return <div>Carregando materiais...</div>;
        if (!materiaisDb || materiaisDb.length === 0) return <div className="text-red-500">Nenhum material cadastrado.</div>;
        
        const sortedMateriais = [...materiaisDb].sort((a, b) => {
          const orderA = materialDisplayData[a.identificador]?.order || 999;
          const orderB = materialDisplayData[b.identificador]?.order || 999;
          return orderA - orderB;
        });

        return (
          <div className="space-y-4">
            <h3 className="font-semibold mb-2">Materiais que Coleta</h3>
            <p className="text-muted-foreground text-sm mb-2">Selecione os materiais que a cooperativa coleta.</p>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-4">
              {sortedMateriais.map((material) => {
                const displayData = materialDisplayData[material.identificador];
                if (!displayData) return null;

                return (
                  <label key={material.id} htmlFor={material.id} className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Switch
                        id={material.id}
                        checked={collectorMaterials.includes(material.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setCollectorMaterials([...collectorMaterials, material.id]);
                          } else {
                            setCollectorMaterials(collectorMaterials.filter(m => m !== material.id));
                            if (material.identificador === 'outros') {
                              setOutrosDescricao('');
                            }
                          }
                          setMaterialsError(null);
                        }}
                      />
                      {React.createElement(displayData.icone, { className: `${displayData.cor} h-5 w-5` })}
                      <span className="ml-2">{displayData.nome}</span>
                    </div>
                  </label>
                );
              })}
            </div>
            {(() => {
              const outrosMaterial = materiaisDb.find(m => m.identificador === 'outros');
              return outrosMaterial && collectorMaterials.includes(outrosMaterial.id);
            })() && (
              <div className="space-y-2">
                <label htmlFor="outros-descricao">Descrição dos Outros Materiais</label>
                <Textarea
                  id="outros-descricao"
                  placeholder="Descreva quais outros tipos de materiais a cooperativa aceita coletar..."
                  className="h-24"
                  value={outrosDescricao}
                  onChange={e => setOutrosDescricao(e.target.value)}
                />
              </div>
            )}
            {materialsError && (
              <p className="text-red-500 text-xs mt-2">{materialsError}</p>
            )}
          </div>
        );
      case 4:
        // Formulário de bairros igual ao do coletor
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Adicione os bairros onde a cooperativa atua.
            </p>
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
                        onClick={() => handleAddBairro(bairro)}
                      >
                        {bairro}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button variant="outline" onClick={() => handleAddBairro()}>
                + Adicionar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {bairrosSelecionados.map((bairro) => (
                <Badge
                  key={bairro.id}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1"
                >
                  {bairro.nome}
                  <button
                    onClick={() => handleRemoveBairro(bairro.id)}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-1"
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            {/* Exibir erro se necessário */}
            {addressErrors.selectedNeighborhoods && (
              <p className="text-red-500 text-xs mt-2">{addressErrors.selectedNeighborhoods}</p>
            )}
            {/* Campos de horários do coletor */}
            <div className="space-y-4 mt-6">
              <h3 className="text-lg font-medium mb-2">Disponibilidade de Horários</h3>
              <div>
                <label className="block mb-1 font-medium">Dias de Trabalho</label>
                <div className="grid grid-cols-7 gap-2">
                  {DIAS_SEMANA.map((dia) => (
                    <div key={dia.id} className="flex flex-col items-center">
                      <label htmlFor={dia.id} className="text-center">{dia.shortLabel}</label>
                      <Switch
                        id={dia.id}
                        checked={diasTrabalho.includes(dia.id)}
                        onCheckedChange={() => {
                          setDiasTrabalho(prev => prev.includes(dia.id)
                            ? prev.filter(d => d !== dia.id)
                            : [...prev, dia.id]);
                        }}
                      />
                    </div>
                  ))}
                </div>
                {diasTrabalhoError && (
                  <p className="text-red-500 text-xs mt-1">{diasTrabalhoError}</p>
                )}
              </div>
              <div>
                <label className="block mb-1 font-medium">Períodos Disponíveis</label>
                <div className="flex gap-4">
                  {PERIODOS_OPCOES.map(periodo => (
                    <div key={periodo.id} className="flex items-center space-x-2">
                      <Switch
                        id={periodo.id}
                        checked={periodosDisponiveis.includes(periodo.id)}
                        onCheckedChange={() => {
                          setPeriodosDisponiveis(prev => prev.includes(periodo.id)
                            ? prev.filter(p => p !== periodo.id)
                            : [...prev, periodo.id]);
                        }}
                      />
                      <label htmlFor={periodo.id}>{periodo.nome}</label>
                    </div>
                  ))}
                </div>
                {periodosDisponiveisError && (
                  <p className="text-red-500 text-xs mt-1">{periodosDisponiveisError}</p>
                )}
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
            </div>
            {diasTrabalhoError && (
              <p className="text-red-500 text-xs mt-1">{diasTrabalhoError}</p>
            )}
            {periodosDisponiveisError && (
              <p className="text-red-500 text-xs mt-1">{periodosDisponiveisError}</p>
            )}
          </div>
        );
      case 5:
        // Etapa de confirmação para cooperativa
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-center">Confirme seu Cadastro</h2>
            <p className="text-muted-foreground text-center mb-4">Revise as informações abaixo e confirme seu cadastro</p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold mb-2 text-center">Dados da Cooperativa</h3>
              {basicInfo.image && (
                <div className="flex justify-center mb-2">
                  <img
                    src={typeof basicInfo.image === 'string' ? basicInfo.image : URL.createObjectURL(basicInfo.image)}
                    alt="Foto da cooperativa"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                </div>
              )}
              <div className="space-y-1 text-sm text-center">
                <div><strong>Nome:</strong> {basicInfo.name}</div>
                <div><strong>E-mail:</strong> {basicInfo.email}</div>
                <div><strong>CNPJ:</strong> {basicInfo.document}</div>
                <div><strong>Telefone:</strong> {basicInfo.phone}</div>
                <div><strong>Endereço:</strong> {address.rua}, {address.numero}{address.complemento ? `, ${address.complemento}` : ''}, {address.bairro}, {address.cidade} - {address.estado}</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold mb-2 text-center">Dados do Representante</h3>
              {representative.image ? (
                <div className="flex justify-center mb-2">
                  <img
                    src={typeof representative.image === 'string' ? representative.image : URL.createObjectURL(representative.image)}
                    alt="Foto do representante"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex justify-center mb-2">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-3xl">
                    <span>+</span>
                  </div>
                </div>
              )}
              <div className="space-y-1 text-sm text-center">
                <div><strong>Nome:</strong> {representative.name}</div>
                <div><strong>Cargo:</strong> {representative.position}</div>
                <div><strong>E-mail:</strong> {representative.email}</div>
                <div><strong>Telefone:</strong> {representative.phone}</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold mb-2 text-center">Materiais que Coleta</h3>
              <div className="flex flex-wrap gap-2">
                {collectorMaterials.map((materialId) => {
                  const materialObj = materiaisDb.find(m => m.id === materialId);
                  const identificador = materialObj?.identificador;
                  const displayData = identificador ? materialDisplayData[identificador] : undefined;
                  return (
                    <span key={materialId} className="flex items-center gap-1 border rounded px-2 py-1 bg-muted">
                      {displayData ? (
                        React.createElement(displayData.icone, { className: `h-5 w-5 ${displayData.cor}` })
                      ) : (
                        <TrashIcon className="h-5 w-5 text-neutral-500" />
                      )}
                      {displayData ? displayData.nome : materialObj?.nome || materialId}
                    </span>
                  )
                })}
              </div>
              {(() => {
                const outrosMaterial = materiaisDb.find(m => m.identificador === 'outros');
                return outrosMaterial && collectorMaterials.includes(outrosMaterial.id) && outrosDescricao && (
                  <p className="text-sm text-muted-foreground mt-1">Outros: {outrosDescricao}</p>
                );
              })()}
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold mb-2 text-center">Bairros de Atuação</h3>
              <ul className="list-disc ml-6 text-sm">
                {bairrosSelecionados.map((bairro) => (
                  <li key={bairro.id}>{bairro.nome}</li>
                ))}
              </ul>
            </div>
            <div className="mb-2">
              <h4 className="font-semibold">Horários de Trabalho</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="font-medium">Dias:</span>
                {diasTrabalho.map((dia) => (
                  <span key={dia} className="border rounded px-2 py-1 bg-muted text-xs">{DIAS_SEMANA.find(d => d.id === dia)?.shortLabel}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="font-medium">Períodos:</span>
                {periodosDisponiveis.map((periodo) => (
                  <span key={periodo} className="border rounded px-2 py-1 bg-muted text-xs">{PERIODOS_OPCOES.find(p => p.id === periodo)?.nome}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="font-medium">Intervalo:</span>
                <span className="border rounded px-2 py-1 bg-muted text-xs">{intervalo} min</span>
                <span className="font-medium ml-2">Máx. coletas/dia:</span>
                <span className="border rounded px-2 py-1 bg-muted text-xs">{maxColetas}</span>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Termos e Condições</h3>
              <ul className="list-disc ml-6 text-sm mb-2">
                <li>Compromisso com práticas sustentáveis e gestão adequada de resíduos</li>
                <li>Fornecimento de informações verdadeiras e atualizadas</li>
                <li>Participação ativa nos programas de sustentabilidade</li>
                <li>Respeito às políticas de privacidade e proteção de dados</li>
              </ul>
              <p className="text-xs text-muted-foreground">Ao confirmar seu cadastro, você concorda com os termos acima.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Na etapa de confirmação, mostrar os horários selecionados
  const renderConfirmationStep = () => {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Confirme seus dados</h3>
          <p className="text-muted-foreground">Verifique se todas as informações estão corretas</p>
        </div>

        {/* Dados pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><strong>Nome:</strong> {basicInfo.name}</div>
            <div><strong>Email:</strong> {basicInfo.email}</div>
            <div><strong>Telefone:</strong> {basicInfo.phone}</div>
            <div><strong>Documento:</strong> {basicInfo.document}</div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>{address.rua}, {address.numero}</div>
            {address.complemento && <div>{address.complemento}</div>}
            <div>{address.bairro}, {address.cidade} - {address.estado}</div>
            <div>CEP: {address.cep}</div>
          </CardContent>
        </Card>

        {/* Dados específicos do coletor */}
        {userType === 'collector' && (
          <>
            {/* Veículo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Veículo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div><strong>Tipo:</strong> {TRANSPORT_TYPES.find(t => t.value === basicInfo.vehicleType)?.label}</div>
                {basicInfo.vehicleType === 'other' && basicInfo.otherVehicleDescription && (
                  <div><strong>Descrição:</strong> {basicInfo.otherVehicleDescription}</div>
                )}
              </CardContent>
            </Card>

            {/* Materiais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Materiais Aceitos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {collectorMaterials.map((matId) => {
                    const materialObj = materiaisDb.find(m => m.id === matId);
                    return (
                      <span key={matId} className="flex items-center gap-1 border rounded px-2 py-1 bg-muted">
                        {materialObj?.icone && <span className="mr-1" dangerouslySetInnerHTML={{ __html: materialObj.icone }} />}
                        {materialObj?.nome || matId}
                      </span>
                    );
                  })}
                </div>
                {(() => {
                  const outrosMaterial = materiaisDb.find(m => m.identificador === 'outros');
                  return outrosMaterial && collectorMaterials.includes(outrosMaterial.id) && outrosDescricao && (
                    <p className="text-sm text-muted-foreground mt-1">Outros: {outrosDescricao}</p>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Horários */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Horários de Trabalho
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <strong>Dias:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {diasTrabalho.map((dia) => (
                      <Badge key={dia} variant="outline" className="text-xs">
                        {DIAS_SEMANA.find(d => d.id === dia)?.shortLabel}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <strong>Períodos:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {periodosDisponiveis.map((periodo) => (
                      <Badge key={periodo} variant="outline" className="text-xs">
                        {PERIODOS_OPCOES.find(p => p.id === periodo)?.nome}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><strong>Máx. coletas/dia:</strong> {maxColetas}</div>
                  <div><strong>Intervalo:</strong> {intervalo} min</div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Botão de confirmação */}
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleBack} className="flex-1">
            Voltar
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isConfirming}
            className="flex-1"
          >
            {isConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando conta...
              </>
            ) : (
              'Criar conta'
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <button
          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-1"
          onClick={() => window.history.back()}
        >
          <span className="text-lg">←</span> Voltar
        </button>
        <h1 className="text-2xl font-bold">
          {userType === 'company' && 'Cadastro de Empresa Coletora'}
          {userType === 'cooperative' && 'Cadastro de Cooperativa'}
          {userType === 'collector' && 'Cadastro de Coletor'}
          {userType === 'partner' && !partnerType && 'Selecione o Tipo de Parceiro'}
          {userType === 'partner' && partnerType === 'restaurant' && 'Cadastro de Restaurante Parceiro'}
          {userType === 'partner' && partnerType === 'store' && 'Cadastro de Loja Parceira'}
          {userType === 'partner' && partnerType === 'educational' && 'Cadastro de Instituição de Ensino Parceira'}
          {userType === 'common' && 'Cadastro de Usuário Comum'}
        </h1>
      </div>
      {userType === 'partner' && !partnerType ? (
        <div className="max-w-md mx-auto space-y-4">
          {[
            {
              key: 'restaurant',
              image: '/Image/restaurante.jpg',
              icon: <span className="text-orange-500 mr-2">🍽️</span>,
              title: 'Restaurante',
              description: 'Estabelecimentos do ramo alimentício que desejam ser parceiros ambientais.'
            },
            {
              key: 'store',
              image: '/Image/store.jpg',
              icon: <span className="text-blue-600 mr-2">🛒</span>,
              title: 'Loja',
              description: 'Comércios em geral que querem fortalecer sua marca sustentável.'
            },
            {
              key: 'educational',
              image: '/Image/education.jpg',
              icon: <span className="text-green-600 mr-2">📚</span>,
              title: 'Educacional',
              description: 'Escolas, cursos e instituições de ensino que promovem educação ambiental.'
            }
          ].map((type) => (
            <button
              key={type.key}
              className={`w-full flex flex-row items-stretch rounded-2xl overflow-hidden shadow-lg group focus:outline-none transition-transform active:scale-95 hover:scale-105 bg-white border border-transparent hover:border-green-300 focus:border-green-500`}
              style={{ minHeight: '7rem' }}
              onClick={() => { setPartnerType(type.key as 'restaurant' | 'store' | 'educational'); setCurrentStep(0); }}
              type="button"
            >
              <div className="w-1/3 h-28 overflow-hidden flex-shrink-0">
                <img
                  src={type.image}
                  alt={type.title}
                  className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col gap-1 p-4 items-start flex-1 justify-center">
                <span className="flex items-center text-base font-bold text-neutral-800">{type.icon}{type.title}</span>
                <span className="text-xs text-neutral-600 font-normal leading-tight">{type.description}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>
              {steps[currentStep].label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StepProgress steps={steps} currentStep={currentStep} />
            {showSuccessAnimation ? (
              <AchievementAnimation
                title="Cadastro concluído!"
                description="Seu cadastro foi realizado com sucesso."
                icon={<span className="text-green-600 text-6xl">✔</span>}
                soundType="achievement"
              />
            ) : (
              <>
                {renderStepContent()}
                <StepNavigation
                  currentStep={currentStep}
                  totalSteps={steps.length}
                  onNext={currentStep === steps.length - 1 ? handleConfirm : handleNext}
                  onBack={handleBack}
                  isNextDisabled={false}
                  nextLabel={currentStep === steps.length - 1 ? 'Finalizar' : 'Próximo'}
                  backLabel={currentStep === 0 ? 'Voltar' : 'Anterior'}
                />
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NewRegister; 