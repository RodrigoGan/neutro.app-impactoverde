import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  ChevronLeft, MapPin, Plus, Trash2, Loader2, Package as PackageIcon, 
  Calendar as CalendarIcon, Clock, Users as UsersIcon, Star as StarIcon, 
  CheckCircle2 as CheckIcon, MessageSquare as MessageSquareIcon, CalendarCheck as CalendarCheckIcon,
  Archive, Package, GlassWater, Leaf, Cpu, Recycle, Battery, CircleDashed, Lightbulb, Trash, Droplets, Wrench
} from 'lucide-react';
import MaterialList from '@/components/MaterialList';
import { useAddress } from '@/hooks/useAddress';
import { AddressCard } from '@/components/AddressCard';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { AchievementAnimation } from '@/components/animations/AchievementAnimation';
import { getAllMaterials } from '@/lib/collectorService';
import { materialDisplayData } from '@/config/materialDisplayData';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

// TODO: Importar componentes reutilizáveis (endereços, materiais, coletores, etc)
// import AddressSection from '@/components/AddressSection';
// import MaterialList from '@/components/MaterialList';
// import CollectorSection from '@/components/CollectorSection';

// Tipos do projeto
interface ProjectAddress {
  id: string;
  tipo: 'principal' | 'secundario';
  logradouro: string;
  numero: string;
  complemento?: string;
  referencia?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  regiao: string;
}

// Tipos esperados pelo AddressSection
interface AddressSectionAddress {
  id: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isMain?: boolean;
}

// Tipos de material atualizados
interface MaterialColeta {
  id: string;
  materialId: string;
  nome: string;
  quantidade: number;
  unidade: string;
  tipoMaterial: 'separado' | 'misturado';
  descricao?: string;
}

// Funções utilitárias de conversão
function toSectionAddress(addr: ProjectAddress): AddressSectionAddress {
  return {
    id: addr.id,
    street: addr.logradouro,
    number: addr.numero,
    complement: addr.complemento,
    neighborhood: addr.bairro,
    city: addr.cidade,
    state: addr.estado,
    zipCode: addr.cep,
    isMain: addr.tipo === 'principal',
  };
}
function toProjectAddress(addr: AddressSectionAddress): ProjectAddress {
  return {
    id: addr.id,
    tipo: addr.isMain ? 'principal' : 'secundario',
    logradouro: addr.street,
    numero: addr.number,
    complemento: addr.complement,
    bairro: addr.neighborhood,
    cidade: addr.city,
    estado: addr.state,
    cep: addr.zipCode,
    regiao: '', // Definir conforme necessário
  };
}

// Tipos de Address de user/RequestCollection
interface Address {
  id: string;
  tipo: string; // 'principal' ou 'secundario' ou outro tipo se necessário
  logradouro: string; // Rua, Av, etc.
  numero?: string;
  complemento?: string;
  referencia?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  regiao: string; // Importante para filtrar coletores
}

// Mocks de user/RequestCollection.tsx (para profileType === 'user')
const USER_ENDERECOS_MOCK: Address[] = [
  {
    id: '1',
    tipo: 'principal',
    logradouro: 'Rua das Flores mockadas para usuário',
    numero: '123',
    bairro: 'Jardim Primavera',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567',
    regiao: 'Zona Sul',
  },
  {
    id: '2',
    tipo: 'secundario',
    logradouro: 'Av. Paulista mockada para usuário',
    numero: '1000',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01310-100',
    regiao: 'Zona Oeste',
  },
];

// Constantes de Materiais e Unidades
const UNIDADES_COMUNS = ['kg', 'un', 'sacos', 'L'];

// Constantes de períodos
const PERIODOS_COLETA = [
  { id: 'manha', nome: 'Manhã (08:00 - 12:00)' },
  { id: 'tarde', nome: 'Tarde (13:00 - 18:00)' },
  { id: 'noite', nome: 'Noite (19:00 - 22:00)' }, // Se aplicável
];

// Interface para Coletor
interface Coletor {
  id: string;
  nome: string;
  avatarUrl?: string;
  bairrosAtendidos: string[];
  avaliacaoMedia: number;
  coletasRealizadas: number;
  materiaisAceitos: string[];
  periodosDisponiveis: string[];
  diasDisponiveis: string[];
}

// Mock de Coletores atualizado
const COLETORES_MOCK: Coletor[] = [
  {
    id: 'coletor-001',
    nome: 'João Ambiental',
    avatarUrl: 'https://i.pravatar.cc/150?u=joao',
    bairrosAtendidos: ['Jardim Primavera', 'Vila Mariana', 'Moema'],
    avaliacaoMedia: 4.8,
    coletasRealizadas: 125,
    materiaisAceitos: ['papel', 'plastico', 'vidro', 'metal', 'aluminio'],
    periodosDisponiveis: ['manha', 'tarde'],
    diasDisponiveis: ['seg', 'ter', 'qua', 'qui', 'sex']
  },
  {
    id: 'coletor-002',
    nome: 'Maria Recicla',
    avatarUrl: 'https://i.pravatar.cc/150?u=maria',
    bairrosAtendidos: ['Bela Vista', 'Vila Buarque', 'Consolação'],
    avaliacaoMedia: 4.5,
    coletasRealizadas: 98,
    materiaisAceitos: ['papel', 'plastico', 'vidro', 'metal', 'aluminio', 'cobre', 'oleo'],
    periodosDisponiveis: ['tarde', 'noite'],
    diasDisponiveis: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab']
  },
  {
    id: 'coletor-003',
    nome: 'Pedro Sustentável',
    bairrosAtendidos: ['Tatuapé', 'Vila Formosa', 'Carrão'],
    avaliacaoMedia: 4.2,
    coletasRealizadas: 77,
    materiaisAceitos: ['papel', 'plastico', 'vidro', 'metal', 'aluminio', 'cobre', 'oleo', 'eletronico', 'pilhas', 'lampadas'],
    periodosDisponiveis: ['manha', 'noite'],
    diasDisponiveis: ['seg', 'ter', 'qua', 'qui', 'sex']
  },
  {
    id: 'coletor-004',
    nome: 'Ana Verde',
    avatarUrl: 'https://i.pravatar.cc/150?u=ana',
    bairrosAtendidos: ['Jardim Primavera', 'Vila Mariana', 'Saúde'],
    avaliacaoMedia: 4.9,
    coletasRealizadas: 156,
    materiaisAceitos: ['papel', 'plastico', 'vidro', 'metal', 'aluminio', 'cobre', 'oleo', 'eletronico', 'pilhas', 'lampadas', 'outros', 'outros'],
    periodosDisponiveis: ['manha', 'tarde', 'noite'],
    diasDisponiveis: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']
  },
  {
    id: 'coletor-005',
    nome: 'Carlos Reciclagem',
    avatarUrl: 'https://i.pravatar.cc/150?u=carlos',
    bairrosAtendidos: ['Tatuapé', 'Vila Formosa', 'Carrão', 'Mooca'],
    avaliacaoMedia: 4.6,
    coletasRealizadas: 112,
    materiaisAceitos: ['papel', 'plastico', 'vidro', 'metal', 'aluminio', 'cobre', 'oleo', 'eletronico'],
    periodosDisponiveis: ['tarde'],
    diasDisponiveis: ['seg', 'ter', 'qua', 'qui', 'sex']
  }
];

interface CollectionSimplePageProps {
  profileType?: 'user' | 'partner';
  entityId?: string;
  partnerType?: string;
}

// Mapeamento de identificadores para ícones e nomes amigáveis (ATUALIZADO)
const MATERIAL_OPTIONS = Object.entries(materialDisplayData).map(([key, value]) => ({
  value: key,
  label: value.nome,
  icon: value.icone,
  cor: value.cor,
  unit: 'kg',
}));

const CollectionSimple: React.FC<CollectionSimplePageProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profileType = 'user', entityId, partnerType: partnerRouteParam } = location.state || {} as { profileType: 'user' | 'partner', entityId?: string, partnerType?: string };
  const { user } = useAuth();

  // Estados para materiais
  const [tabMaterial, setTabMaterial] = useState<'separados' | 'misturados'>('separados');
  const [materiaisAdicionados, setMateriaisAdicionados] = useState<MaterialColeta[]>([]);
  const [formMaterialSeparado, setFormMaterialSeparado] = useState<{
    materialId: string;
    quantidade: string;
    unidade: string;
    descricaoOutros: string;
  }>({
    materialId: '', // Começa vazio
    quantidade: '',
    unidade: '',
    descricaoOutros: ''
  });
  const [formMaterialMisturado, setFormMaterialMisturado] = useState<{
    descricao: string;
    quantidade: string;
    unidade: string;
  }>({
    descricao: '',
    quantidade: '',
    unidade: 'sacos'
  });
  const [errosFormMaterial, setErrosFormMaterial] = useState<Record<string, string>>({});

  // Estados para endereços
  const {
    enderecos: userAddresses,
    setEnderecos,
    selectedAddress: selectedUserAddress,
    setSelectedAddress: setSelectedUserAddress,
    showAddressForm: showUserAddressForm,
    setShowAddressForm: setShowUserAddressForm,
    newAddress: newUserAddress,
    setNewAddress: setNewUserAddress,
    isLoadingCep,
    handleAddAddress: handleAddUserAddress,
    handleRemoveEndereco: handleRemoveUserAddress,
    handleSetMainAddress: handleSetUserMainAddress,
    loading: loadingUserAddresses
  } = useAddress(user?.id || '');

  // Para partner (usando useAddress)
  const {
    enderecos: partnerAddresses,
    setEnderecos: setPartnerEnderecos,
    selectedAddress: selectedPartnerAddress,
    setSelectedAddress: setSelectedPartnerAddress,
    showAddressForm: showPartnerAddressForm,
    setShowAddressForm: setShowPartnerAddressForm,
    newAddress: newPartnerAddressDataHook,
    setNewAddress: setNewPartnerAddressDataHook,
    isLoadingCep: isLoadingPartnerCepHook,
    handleAddAddress: addPartnerAddressHandlerHook,
    handleRemoveEndereco: removePartnerAddressHandlerHook,
    handleSetMainAddress: handleSetPartnerMainAddress,
    loading: loadingPartnerAddresses
  } = useAddress(entityId || '');

  // Estados para Data e Horário
  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(undefined);
  const [periodoSelecionado, setPeriodoSelecionado] = useState<string | undefined>(undefined);
  const [errosDataHorario, setErrosDataHorario] = useState<Record<string, string>>({});
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Estados para Seleção de Coletor
  const [coletorSelecionadoId, setColetorSelecionadoId] = useState<string | undefined>(undefined);
  const [listaColetoresFiltrada, setListaColetoresFiltrada] = useState<any[]>([]);
  const [loadingColetores, setLoadingColetores] = useState(false);
  const [erroBuscaColetores, setErroBuscaColetores] = useState<string | null>(null);

  // Estado para Observações
  const [observacoes, setObservacoes] = useState('');

  // Estado para controlar se o usuário tentou submeter o formulário
  const [tentouSubmeter, setTentouSubmeter] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Novo estado para controlar a animação de sucesso
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Estado para tipo de coletor (flag visual)
  const [tipoColetor, setTipoColetor] = useState<'individual' | 'cooperativa'>('individual');

  // Adicionar estado para fotos
  const [fotos, setFotos] = useState<File[]>([]);
  const handleAddFotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const novas = Array.from(e.target.files);
    setFotos(prev => {
      const total = prev.length + novas.length;
      if (total <= 3) return [...prev, ...novas];
      const needed = 3 - prev.length;
      if (needed > 0) return [...prev, ...novas.slice(0, needed)];
      return prev;
    });
    e.target.value = '';
  };
  const handleRemoverFoto = (idx: number) => {
    setFotos(prev => prev.filter((_, i) => i !== idx));
  };

  // Refs para scroll em caso de erro
  const addressSectionRef = useRef<HTMLDivElement>(null);
  const materialsSectionRef = useRef<HTMLDivElement>(null);
  const scheduleSectionRef = useRef<HTMLDivElement>(null);

  // Estados existentes
  // ... (userAddresses, selectedUserAddressId, etc.) ...
  const [scheduleErrors, setScheduleErrors] = useState<Record<string, string>>({});
  // ... (outros estados como dataSelecionada, periodoSelecionado, etc.) ...

  const [materiaisDb, setMateriaisDb] = useState([]);
  const [loadingMateriais, setLoadingMateriais] = useState(true);
  const [erroMateriais, setErroMateriais] = useState<string | null>(null);

  useEffect(() => {
    setLoadingMateriais(true);
    setErroMateriais(null);
    getAllMaterials()
      .then(data => {
        setMateriaisDb(data || []);
        if (!data || data.length === 0) {
          setErroMateriais('Nenhum material cadastrado no sistema.');
        }
        console.log('DEBUG: Materiais recebidos do banco:', data);
        if (data) {
          console.log('DEBUG: Identificadores dos materiais:', data.map(m => m.identificador));
        }
      })
      .catch(err => {
        setErroMateriais('Erro ao carregar materiais.');
        setMateriaisDb([]);
        console.error('ERRO AO CARREGAR MATERIAIS:', err);
      })
      .finally(() => setLoadingMateriais(false));
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (profileType === 'partner' && partnerAddresses.length > 0 && !selectedPartnerAddress) {
      // O hook useAddress já define um selectedAddress inicial, então esta lógica pode não ser necessária
      // ou pode ser ajustada se o AddressCard precisar explicitamente de um isMain ou tipo principal
      // Por ora, vamos confiar no selectedAddress do hook.
      // setSelectedPartnerAddress(partnerAddresses.find(a => a.tipo === 'principal') || partnerAddresses[0]);
    }
  }, [profileType, partnerAddresses, selectedPartnerAddress, setSelectedPartnerAddress]);

  // useEffect para filtrar coletores quando o endereço mudar ou filtros mudam
  useEffect(() => {
    const enderecoParaFiltro = profileType === 'user' ? userAddresses.find(a => a.id === selectedUserAddress?.id) : selectedPartnerAddress;
    if (!enderecoParaFiltro || !enderecoParaFiltro.bairro) {
      setListaColetoresFiltrada([]);
      setErroBuscaColetores('Selecione um endereço com bairro para visualizar coletores específicos. Caso contrário, sua solicitação será enviada aos coletores próximos.');
      setLoadingColetores(false);
      return;
    }
    setLoadingColetores(true);
    setListaColetoresFiltrada([]);
    setErroBuscaColetores(null);
    setColetorSelecionadoId(undefined);
    setTimeout(() => {
      // 1. Começa com todos do bairro
      let coletoresFiltrados = listaColetoresFiltrada; // Usar a lista filtrada do estado
      
      // 2. Filtra por materiais se houver
      if (materiaisAdicionados.length > 0) {
        const materiaisColeta = materiaisAdicionados.map(m => m.materialId);
        coletoresFiltrados = coletoresFiltrados.filter(coletor => 
          materiaisColeta.every(materialId => coletor.materiaisAceitos.includes(materialId))
        );
      }
      
      // 3. Filtra por período se houver
      if (periodoSelecionado) {
        coletoresFiltrados = coletoresFiltrados.filter(coletor => 
          coletor.periodosDisponiveis.includes(periodoSelecionado)
        );
      }
      
      // 4. Filtra por dia da semana se houver data
      if (dataSelecionada) {
        const diaSemana = dataSelecionada.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
        coletoresFiltrados = coletoresFiltrados.filter(coletor => 
          coletor.diasDisponiveis.includes(diaSemana)
        );
      }

      if (coletoresFiltrados.length > 0) {
        setListaColetoresFiltrada(coletoresFiltrados);
      } else {
        setListaColetoresFiltrada([]);
        setErroBuscaColetores('Nenhum coletor disponível encontrado para os critérios selecionados. Você pode prosseguir com a solicitação e os coletores que atendem seu bairro serão notificados.');
      }
      setLoadingColetores(false);
    }, 500);
  }, [profileType, userAddresses, selectedUserAddress, selectedPartnerAddress, tipoColetor, materiaisAdicionados, periodoSelecionado, dataSelecionada, listaColetoresFiltrada]);

  // useEffect para buscar CEP automaticamente para o usuário comum
  useEffect(() => {
    if (profileType === 'user') {
      const cepLimpo = newUserAddress.cep.replace(/\D/g, '');
      if (cepLimpo.length === 8) {
        handleUserCepBlur(); // Chama a função existente que faz a busca e atualiza o estado
      }
    }
  }, [newUserAddress.cep, profileType]); // Depende de newUserAddress.cep e profileType

  const handleUserCepBlur = async () => {
    const cep = newUserAddress.cep.replace(/\D/g, '');
    if (cep.length !== 8) {
      return;
    }
    // setAddressErrors(prev => ({ ...prev, cep: undefined })); // Removido
    // setIsLoadingCep(true); // Removido
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (data.erro) {
        // setAddressErrors(prev => ({ ...prev, cep: 'CEP não encontrado.' })); // Removido
        toast.error('CEP não encontrado.');
        // Limpa campos se o CEP não for encontrado, exceto o próprio CEP digitado
        setNewUserAddress(prev => ({
          ...prev,
          logradouro: '',
          bairro: '',
          cidade: '',
          estado: '',
        }));
      } else {
        setNewUserAddress(prev => ({
          ...prev,
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || '',
        }));
        toast.success('Endereço encontrado!');
      }
    } catch (error) {
      // setAddressErrors(prev => ({ ...prev, cep: 'Erro ao buscar CEP.' })); // Removido
      toast.error('Erro ao buscar CEP. Tente novamente.');
    } finally {
      // setIsLoadingCep(false); // Removido
    }
  };

  // Remover completamente as funções locais duplicadas de endereço
  // Usar apenas as funções do hook useAddress (handleAddAddress, handleRemoveEndereco, handleSetMainAddress), já renomeadas no destructuring
  // Corrigir chamadas para usar os nomes corretos do hook

  const handleBack = () => {
    navigate(-1); // Volta para a página anterior
  };

  // Handlers para Materiais
  const handleAddMaterialToList = () => {
    let novosErros: Record<string, string> = {};
    let novoMaterial: MaterialColeta | null = null;

    const materialSelecionadoInfo = materiaisDb.find(m => m.id === formMaterialSeparado.materialId);

    // VALIDAÇÃO PARA 'OUTROS'
    if (materialSelecionadoInfo?.identificador === 'outros' && !formMaterialSeparado.descricaoOutros.trim()) {
      setErrosFormMaterial(prev => ({ ...prev, descricaoOutros: 'Especifique o material quando "Outros" for selecionado.' }));
      return; // Para a execução
    }

    if (tabMaterial === 'separados') {
      const { materialId: materialSelecionado, quantidade, unidade, descricaoOutros } = formMaterialSeparado;
      const materialInfo = materiaisDb.find(m => m.id === materialSelecionado);

      const novoMaterial: MaterialColeta = {
        id: `mat-${Date.now()}`,
        materialId: materialSelecionado,
        nome: materialInfo?.nome || 'Nome não encontrado',
        quantidade: parseFloat(quantidade),
        unidade: unidade,
        tipoMaterial: 'separado',
        descricao: materialSelecionado === 'outros' ? descricaoOutros : '',
      };
      setMateriaisAdicionados([...materiaisAdicionados, novoMaterial]);
      
      // Limpa apenas os campos de quantidade e descrição
      setFormMaterialSeparado(prev => ({
        ...prev,
        quantidade: '',
        descricaoOutros: ''
      }));
    } else {
      const { descricao, quantidade, unidade } = formMaterialMisturado;
      
      // Validações
      if (!descricao) novosErros.descricaoMisturado = 'Descreva os materiais.';
      if (!quantidade || parseFloat(quantidade) <= 0) novosErros.quantidadeMisturado = 'Quantidade deve ser maior que zero.';
      if (!unidade) novosErros.unidadeMisturado = 'Selecione a unidade.';

      if (Object.keys(novosErros).length === 0) {
        const novoMaterial: MaterialColeta = {
          id: `mat-${Date.now()}`,
          materialId: 'outros',
          nome: descricao,
          quantidade: parseFloat(quantidade),
          unidade,
          tipoMaterial: 'misturado',
          descricao,
        };
        setMateriaisAdicionados([...materiaisAdicionados, novoMaterial]);
        setFormMaterialMisturado({
          descricao: '',
          quantidade: '',
          unidade: '',
        });
      }
    }

    setErrosFormMaterial(novosErros);
    if (novoMaterial && Object.keys(novosErros).length === 0) {
      setMateriaisAdicionados(prev => [...prev, novoMaterial!]);
      toast.success('Material adicionado!');
    }
  };

  const handleRemoveMaterialDaLista = (index: number) => {
    setMateriaisAdicionados(prev => prev.filter((_, i) => i !== index));
    toast.info('Material removido.');
  };

  const handleDataChange = (date: Date | undefined) => {
    setDataSelecionada(date);
    if (date) {
      setErrosDataHorario(prev => ({ ...prev, data: undefined }));
    }
    setIsCalendarOpen(false); // Fecha o popover após selecionar a data
  };

  const handlePeriodoChange = (value: string) => {
    setPeriodoSelecionado(value);
    if (value) {
      setErrosDataHorario(prev => ({ ...prev, periodo: undefined }));
    }
  };

  const handleSelecionarColetor = (coletorId: string) => {
    setColetorSelecionadoId(coletorId);
    toast.success('Coletor selecionado!');
  };

  const handleLimparSelecaoColetor = () => {
    setColetorSelecionadoId(undefined);
    toast.info('Seleção de coletor removida.');
  };

  const handleObservacoesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setObservacoes(event.target.value);
  };

  // Placeholder para a função de submit principal (a ser implementada depois)
  const handleSubmitForm = async () => {
    setIsSubmitting(true);
    setTentouSubmeter(true);

    const novosAddressErrors: Record<string, string> = {};
    const novosAgendamentoErrors: Record<string, string> = {};
    let isValid = true;
    let firstErrorRef: React.RefObject<HTMLDivElement> | null = null;

    // Validação de endereço
    if (profileType === 'user') {
      if (!selectedUserAddress) {
        novosAddressErrors.logradouro = 'Selecione um endereço de coleta.';
        isValid = false;
        if (!firstErrorRef) firstErrorRef = addressSectionRef;
      }
    } else {
      if (!selectedPartnerAddress) {
        novosAddressErrors.logradouro = 'Selecione um endereço de coleta.';
        isValid = false;
        if (!firstErrorRef) firstErrorRef = addressSectionRef;
      }
    }

    // Validação de data e período
    if (!dataSelecionada) {
      novosAgendamentoErrors.data = 'Selecione uma data para a coleta.';
      isValid = false;
      if (!firstErrorRef) firstErrorRef = scheduleSectionRef;
    }
    if (!periodoSelecionado) {
      novosAgendamentoErrors.periodo = 'Selecione um período para a coleta.';
      isValid = false;
      if (!firstErrorRef) firstErrorRef = scheduleSectionRef;
    }
    
    // setAddressErrors(novosAddressErrors); // Removido
    // setScheduleErrors(novosAgendamentoErrors); // Removido

    if (!isValid) {
      toast.error("Por favor, corrija os erros no formulário antes de prosseguir.");
      firstErrorRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setIsSubmitting(false);
      return;
    }

    // [UPLOAD DAS FOTOS]
    let photoUrls: string[] = [];
    if (fotos.length > 0) {
      for (let i = 0; i < fotos.length; i++) {
        const foto = fotos[i];
        const fileExt = foto.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const { data, error } = await supabase.storage.from('collection-photos').upload(fileName, foto);
        if (error) {
          toast.error('Erro ao fazer upload da foto.');
          setIsSubmitting(false);
          return;
        }
        const { data: publicUrlData } = supabase.storage.from('collection-photos').getPublicUrl(fileName);
        if (publicUrlData?.publicUrl) {
          photoUrls.push(publicUrlData.publicUrl);
        }
      }
    }

    // [SALVAR NO BANCO]
    const collectionData: any = {
      solicitante_id: user?.id || null, // Corrigido para pegar do AuthContext
      date: dataSelecionada?.toISOString().split('T')[0],
      time: periodoSelecionado,
      materials: materiaisAdicionados,
      quantity_description: '', // ajuste se necessário
      observations: observacoes,
      status: 'pending',
      collection_type: 'simple',
      photos: photoUrls,
      created_at: new Date().toISOString(),
      collector_id: coletorSelecionadoId || null,
      collector_type: tipoColetor, // 'individual' ou 'cooperativa'
      // outros campos necessários...
    };

    const { error: insertError } = await supabase.from('collections').insert([collectionData]);
    if (insertError) {
      toast.error('Erro ao salvar a coleta no banco de dados.');
      setIsSubmitting(false);
      return;
    }

    toast.success('Coleta agendada com sucesso!');
    setShowSuccessAnimation(true);
    setIsSubmitting(false);
  };

  return (
    <Layout hideFooter={false}>
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={handleBack} aria-label="Voltar">
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-3xl font-bold">
              {profileType === 'partner' ? 'Solicitar Coleta' : 'Agendar Nova Coleta'}
        </h1>
          </div>

          <Card>
            <CardContent className="space-y-8 py-6">

              {/* Seção de Endereço da Coleta */}
              <section ref={addressSectionRef}>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-neutro" />
                  Endereço da Coleta
                </h2>

                {/* Unificação para user e partner */}
                {((profileType === 'user' && userAddresses.length > 0 && !showUserAddressForm) || (profileType === 'partner' && partnerAddresses.length > 0 && !showPartnerAddressForm)) && (
                  <RadioGroup
                    value={profileType === 'user' ? selectedUserAddress?.id : selectedPartnerAddress?.id}
                    onValueChange={id => {
                      if (profileType === 'user') setSelectedUserAddress(userAddresses.find(a => a.id === id));
                      else {
                        const addressToSelect = partnerAddresses.find(a => a.id === id);
                        if (addressToSelect) setSelectedPartnerAddress(addressToSelect);
                      }
                    }}
                    className="space-y-3 mb-4"
                  >
                    {(profileType === 'user' ? userAddresses : partnerAddresses).map((addr) => (
                      <Label
                        key={addr.id}
                        htmlFor={`addr-${addr.id}`}
                        className={`flex flex-col p-4 border rounded-lg cursor-pointer transition-all hover:border-neutro ${
                          (profileType === 'user' ? selectedUserAddress?.id : selectedPartnerAddress?.id) === addr.id
                            ? 'border-neutro ring-2 ring-neutro'
                            : 'border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value={addr.id} id={`addr-${addr.id}`} />
                            <span className="font-medium">{addr.logradouro}, {addr.numero}</span>
                            {addr.tipo === 'principal' && <span className="text-xs bg-neutro/10 text-neutro px-2 py-0.5 rounded-full">Principal</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            {addr.tipo !== 'principal' && (
                              <Button variant="ghost" size="sm" onClick={e => { e.preventDefault(); e.stopPropagation();
                                if (profileType === 'user') handleSetUserMainAddress(addr.id);
                                else handleSetPartnerMainAddress(addr.id);
                              }}>
                                Tornar Principal
                              </Button>
                            )}
                            {profileType === 'user' && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={e => { e.preventDefault(); e.stopPropagation(); handleRemoveUserAddress(addr.id); }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                            {profileType === 'partner' && addr.tipo !== 'principal' && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={e => { e.preventDefault(); e.stopPropagation(); removePartnerAddressHandlerHook(addr.id); }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">{addr.bairro}, {addr.cidade} - {addr.estado}</p>
                        {addr.complemento && <p className="text-sm text-muted-foreground ml-6">Complemento: {addr.complemento}</p>}
                        {addr.referencia && <p className="text-sm text-muted-foreground ml-6">Referência: {addr.referencia}</p>}
                      </Label>
                    ))}
                  </RadioGroup>
                )}

                {/* Botão para abrir formulário de novo endereço */}
                {((profileType === 'user' && !showUserAddressForm) || (profileType === 'partner' && !showPartnerAddressForm)) && (
                  <Button variant="outline" onClick={() => {
                    if (profileType === 'user') setShowUserAddressForm(true);
                    else setShowPartnerAddressForm(true);
                  }} className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> {profileType === 'user' ? 'Adicionar Novo Endereço' : 'Adicionar Novo Endereço (Parceiro)'}
                  </Button>
                )}

                {/* Formulário de novo endereço unificado */}
                {((profileType === 'user' && showUserAddressForm) || (profileType === 'partner' && showPartnerAddressForm)) && (
                  <div className="space-y-4 mt-4 border p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3">Novo Endereço{profileType === 'partner' && ' (Parceiro)'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cep">CEP *</Label>
                        <Input
                          id="cep"
                          value={profileType === 'user' ? newUserAddress.cep : newPartnerAddressDataHook.cep}
                          onChange={e => {
                            const valor = e.target.value;
                            const cepLimpo = valor.replace(/\D/g, '');
                            let cepFormatado = cepLimpo;
                            if (cepLimpo.length > 5) {
                              cepFormatado = `${cepLimpo.substring(0, 5)}-${cepLimpo.substring(5, 8)}`;
                            } else {
                              cepFormatado = cepLimpo;
                            }
                            if (profileType === 'user') setNewUserAddress(prev => ({ ...prev, cep: cepFormatado }));
                            else setNewPartnerAddressDataHook(prev => ({ ...prev, cep: cepFormatado }));
                          }}
                          maxLength={9}
                          placeholder="00000-000"
                          className={/* addressErrors.cep ? 'border-red-500' : */ ''}
                          disabled={profileType === 'user' ? isLoadingCep : isLoadingPartnerCepHook}
                        />
                        {(profileType === 'user' ? isLoadingCep : isLoadingPartnerCepHook) && <p className="text-sm text-muted-foreground mt-1 flex items-center"><Loader2 className="h-4 w-4 animate-spin mr-2" /> Buscando CEP...</p>}
                        {/* {addressErrors.cep && !(profileType === 'user' ? isLoadingCep : isLoadingPartnerCepHook) && <p className="text-sm text-red-500 mt-1">{addressErrors.cep}</p>} */}
                      </div>
                      <div><Label htmlFor="logradouro">Endereço (Rua/Av.) *</Label><Input id="logradouro" value={profileType === 'user' ? newUserAddress.logradouro : newPartnerAddressDataHook.logradouro} onChange={e => { if (profileType === 'user') setNewUserAddress(prev => ({ ...prev, logradouro: e.target.value })); else setNewPartnerAddressDataHook(prev => ({ ...prev, logradouro: e.target.value })); }} disabled={profileType === 'user' ? isLoadingCep : isLoadingPartnerCepHook} className={/* addressErrors.logradouro ? 'border-red-500' : */ ''}/></div>
                      <div><Label htmlFor="numero">Número *</Label><Input id="numero" value={profileType === 'user' ? newUserAddress.numero : newPartnerAddressDataHook.numero} onChange={e => { if (profileType === 'user') setNewUserAddress(prev => ({ ...prev, numero: e.target.value })); else setNewPartnerAddressDataHook(prev => ({ ...prev, numero: e.target.value })); }} className={/* addressErrors.numero ? 'border-red-500' : */ ''}/></div>
                      <div><Label htmlFor="complemento">Complemento</Label><Input id="complemento" value={profileType === 'user' ? newUserAddress.complemento : newPartnerAddressDataHook.complemento} onChange={e => { if (profileType === 'user') setNewUserAddress(prev => ({ ...prev, complemento: e.target.value })); else setNewPartnerAddressDataHook(prev => ({ ...prev, complemento: e.target.value })); }} /></div>
                      <div><Label htmlFor="bairro">Bairro *</Label><Input id="bairro" value={profileType === 'user' ? newUserAddress.bairro : newPartnerAddressDataHook.bairro} onChange={e => { if (profileType === 'user') setNewUserAddress(prev => ({ ...prev, bairro: e.target.value })); else setNewPartnerAddressDataHook(prev => ({ ...prev, bairro: e.target.value })); }} disabled={profileType === 'user' ? isLoadingCep : isLoadingPartnerCepHook} className={/* addressErrors.bairro ? 'border-red-500' : */ ''}/></div>
                      <div><Label htmlFor="cidade">Cidade *</Label><Input id="cidade" value={profileType === 'user' ? newUserAddress.cidade : newPartnerAddressDataHook.cidade} onChange={e => { if (profileType === 'user') setNewUserAddress(prev => ({ ...prev, cidade: e.target.value })); else setNewPartnerAddressDataHook(prev => ({ ...prev, cidade: e.target.value })); }} disabled={profileType === 'user' ? isLoadingCep : isLoadingPartnerCepHook} className={/* addressErrors.cidade ? 'border-red-500' : */ ''}/></div>
                      <div><Label htmlFor="estado">Estado *</Label><Input id="estado" value={profileType === 'user' ? newUserAddress.estado : newPartnerAddressDataHook.estado} onChange={e => { if (profileType === 'user') setNewUserAddress(prev => ({ ...prev, estado: e.target.value })); else setNewPartnerAddressDataHook(prev => ({ ...prev, estado: e.target.value })); }} disabled={profileType === 'user' ? isLoadingCep : isLoadingPartnerCepHook} className={/* addressErrors.estado ? 'border-red-500' : */ ''}/></div>
                      <div><Label htmlFor="referencia">Referência</Label><Input id="referencia" value={profileType === 'user' ? newUserAddress.referencia : newPartnerAddressDataHook.referencia} onChange={e => { if (profileType === 'user') setNewUserAddress(prev => ({ ...prev, referencia: e.target.value })); else setNewPartnerAddressDataHook(prev => ({ ...prev, referencia: e.target.value })); }} /></div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="ghost" onClick={() => { if (profileType === 'user') { setShowUserAddressForm(false); /* setAddressErrors({}); */ } else { setShowPartnerAddressForm(false); /* setAddressErrors({}); */ } }}>Cancelar</Button>
                      <Button onClick={() => {
                        if (profileType === 'user') handleAddUserAddress();
                        else {
                          const success = addPartnerAddressHandlerHook();
                          if (success) toast.success('Endereço adicionado!');
                          else toast.error('Erro.');
                        }
                      }}>Salvar Endereço</Button>
                    </div>
                  </div>
                )}
              </section>

              <Separator />

              {/* Seção de Materiais para Coleta */}
              <section ref={materialsSectionRef}>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <PackageIcon className="h-5 w-5 text-neutro" />
                  Materiais para Coleta
                </h2>
                <Tabs value={tabMaterial} onValueChange={(value) => setTabMaterial(value as 'separados' | 'misturados')} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="separados">Adicionar Separados</TabsTrigger>
                    <TabsTrigger value="misturados">Adicionar Misturados</TabsTrigger>
                  </TabsList>
                  <TabsContent value="separados">
                    <Card>
                      <CardContent className="pt-6 space-y-4">
                        {loadingMateriais ? (
                          <div className="flex justify-center items-center h-24"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
                        ) : erroMateriais ? (
                          <div className="text-red-500 text-center py-4">{erroMateriais}</div>
                        ) : materiaisDb.length === 0 ? (
                          <div className="text-muted-foreground text-center py-4">Nenhum material disponível.</div>
                        ) : (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                              <div>
                                <Label htmlFor="material-tipo">Tipo de Material *</Label>
                                <Select 
                                  value={formMaterialSeparado.materialId} 
                                  onValueChange={(value) => {
                                    const materialSelecionado = materiaisDb.find(m => m.id === value);
                                    setFormMaterialSeparado(prev => ({ 
                                      ...prev, 
                                      materialId: value,
                                      unidade: materialSelecionado?.unidade || ''
                                    }));
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o material" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {materiaisDb.map(material => {
                                      const display = materialDisplayData[material.identificador];
                                      if (!display) {
                                        console.warn('Identificador de material sem displayData:', material.identificador, material);
                                      }
                                      return (
                                        <SelectItem key={material.id} value={material.id}>
                                          <div className="flex items-center gap-2">
                                            {display
                                              ? React.createElement(display.icone, { className: display.cor + ' h-5 w-5' })
                                              : <span className="inline-block w-5 h-5 bg-gray-200 rounded-full" title={material.identificador}>?</span>
                                            }
                                            <span>{display ? display.nome : material.nome || material.identificador}</span>
                                          </div>
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* CAMPO DE DESCRIÇÃO CONDICIONAL */}
                              {formMaterialSeparado.materialId && materiaisDb.find(m => m.id === formMaterialSeparado.materialId)?.identificador === 'outros' && (
                                <div>
                                  <Label htmlFor="material-outros-descricao">Especifique o material "Outros" *</Label>
                                  <Input 
                                    id="material-outros-descricao" 
                                    value={formMaterialSeparado.descricaoOutros} 
                                    onChange={(e) => setFormMaterialSeparado(prev => ({ ...prev, descricaoOutros: e.target.value }))} 
                                    placeholder="Ex: Entulho limpo, Pneus"
                                    className={errosFormMaterial.descricaoOutros ? 'border-red-500' : ''}
                                  />
                                  {errosFormMaterial.descricaoOutros && <p className="text-sm text-red-500 mt-1">{errosFormMaterial.descricaoOutros}</p>}
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                              <div>
                                <Label htmlFor="quantidade">Quantidade *</Label>
                                <Input
                                  id="quantidade"
                                  value={formMaterialSeparado.quantidade}
                                  onChange={(e) => setFormMaterialSeparado(prev => ({ ...prev, quantidade: e.target.value }))}
                                  type="number"
                                  className={errosFormMaterial.quantidade ? 'border-red-500' : ''}
                                />
                                {errosFormMaterial.quantidade && <p className="text-sm text-red-500 mt-1">{errosFormMaterial.quantidade}</p>}
                              </div>
                              <div>
                                <Label htmlFor="unidade">Unidade *</Label>
                                <Select
                                  value={formMaterialSeparado.unidade}
                                  onValueChange={(value) => setFormMaterialSeparado(prev => ({ ...prev, unidade: value }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione a unidade" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {UNIDADES_COMUNS.map((unit) => (
                                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <Button onClick={handleAddMaterialToList} size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Adicionar à Lista
                            </Button>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="misturados">
                    <Card>
                      <CardContent className="pt-6 space-y-4">
                        {loadingMateriais ? (
                          <div className="flex items-center justify-center h-24">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        ) : (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="material-descricao-m">Descrição dos Materiais Misturados *</Label>
                              <Textarea 
                                id="material-descricao-m" 
                                placeholder="Ex: Plásticos diversos, papéis e algumas latas (tudo junto)" 
                                value={formMaterialMisturado.descricao} 
                                onChange={(e) => setFormMaterialMisturado(prev => ({ ...prev, descricao: e.target.value }))}
                                className={errosFormMaterial.descricaoMisturado ? 'border-red-500' : ''}
                              />
                              {errosFormMaterial.descricaoMisturado && <p className="text-sm text-red-500 mt-1">{errosFormMaterial.descricaoMisturado}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="material-quantidade-m">Quantidade Estimada *</Label>
                                <Input 
                                  id="material-quantidade-m" 
                                  type="number" 
                                  min="0.1" 
                                  step="0.1" 
                                  placeholder="Ex: 3" 
                                  value={formMaterialMisturado.quantidade} 
                                  onChange={(e) => setFormMaterialMisturado(prev => ({ ...prev, quantidade: e.target.value }))}
                                  className={errosFormMaterial.quantidadeMisturado ? 'border-red-500' : ''}
                                />
                                {errosFormMaterial.quantidadeMisturado && <p className="text-sm text-red-500 mt-1">{errosFormMaterial.quantidadeMisturado}</p>}
                              </div>
                              <div>
                                <Label htmlFor="material-unidade-m">Unidade *</Label>
                                <Select 
                                  value={formMaterialMisturado.unidade} 
                                  onValueChange={(value) => setFormMaterialMisturado(prev => ({ ...prev, unidade: value }))}
                                >
                                  <SelectTrigger className={errosFormMaterial.unidadeMisturado ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Unidade" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="sacos">Sacos</SelectItem>
                                    <SelectItem value="kg">Kg</SelectItem>
                                    <SelectItem value="un">Unidade</SelectItem>
                                  </SelectContent>
                                </Select>
                                {errosFormMaterial.unidadeMisturado && <p className="text-sm text-red-500 mt-1">{errosFormMaterial.unidadeMisturado}</p>}
                              </div>
                            </div>
                            <Button onClick={handleAddMaterialToList} size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Adicionar à Lista
                            </Button>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {materiaisAdicionados.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-md font-semibold mb-3">Materiais Adicionados:</h3>
                    <MaterialList
                      materiais={materiaisAdicionados.map(m => {
                        // Busca o material do banco pelo materialId
                        const materialBanco = materiaisDb.find(mat => mat.id === m.materialId);
                        // Se não encontrar, mantém como está (cai no fallback 'outros')
                        return {
                          ...m,
                          tipo: materialBanco?.identificador || m.materialId // garante que tipo/identificador seja correto
                        };
                      })}
                      onRemove={handleRemoveMaterialDaLista}
                      materiaisDoBanco={materiaisDb}
                      materialDisplayData={materialDisplayData}
                    />
                  </div>
                )}
                {/* Exibe erro de materiais só após tentativa de submit */}
                {tentouSubmeter && errosFormMaterial.materiais && (
                  <p className="text-sm text-red-500 mt-2">{errosFormMaterial.materiais}</p>
                )}
              </section>

              <Separator />

              {/* Seção de Data e Horário */}
              <section ref={scheduleSectionRef}>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-neutro" />
                  Data e Horário da Coleta
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="data-coleta">Data da Coleta *</Label>
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={`w-full justify-start text-left font-normal ${!dataSelecionada && "text-muted-foreground"}`}
                          onClick={() => setIsCalendarOpen(true)}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dataSelecionada ? format(dataSelecionada, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dataSelecionada}
                          onSelect={handleDataChange}
                          disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {errosDataHorario.data && <p className="text-sm text-red-500 mt-1">{errosDataHorario.data}</p>}
                  </div>

                  <div>
                    <Label htmlFor="periodo-coleta">Período Preferencial *</Label>
                    <Select value={periodoSelecionado} onValueChange={handlePeriodoChange}>
                      <SelectTrigger id="periodo-coleta" className={!periodoSelecionado ? "text-muted-foreground" : ""}>
                        <SelectValue placeholder="Selecione um período" />
                      </SelectTrigger>
                      <SelectContent>
                        {PERIODOS_COLETA.map(periodo => (
                          <SelectItem key={periodo.id} value={periodo.id}>{periodo.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errosDataHorario.periodo && <p className="text-sm text-red-500 mt-1">{errosDataHorario.periodo}</p>}
                  </div>
                </div>
              </section>

              <Separator />

              {/* Seção de Selecionar Coletor */}
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <UsersIcon className="h-5 w-5 text-neutro" />
                  Selecionar Coletor <span className="text-sm font-normal text-muted-foreground">(Opcional)</span>
                </h2>
                {/* Seletor visual de tipo de coletor */}
                <div className="flex gap-2 mb-6 justify-center md:justify-start">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-full border-2 flex items-center gap-2 transition-all text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-neutro/50 ${tipoColetor === 'individual' ? 'bg-neutro text-white border-neutro' : 'bg-white text-neutro border-gray-300 hover:border-neutro'}`}
                    onClick={() => setTipoColetor('individual')}
                  >
                    <span role="img" aria-label="Pessoa">👤</span> Coletor Individual
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-full border-2 flex items-center gap-2 transition-all text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-neutro/50 ${tipoColetor === 'cooperativa' ? 'bg-neutro text-white border-neutro' : 'bg-white text-neutro border-gray-300 hover:border-neutro'}`}
                    onClick={() => setTipoColetor('cooperativa')}
                  >
                    <span role="img" aria-label="Cooperativa">🏢</span> Cooperativa
                  </button>
                </div>
                {loadingColetores && (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-8 w-8 animate-spin text-neutro" />
                    <p className="ml-2 text-muted-foreground">Buscando coletores disponíveis...</p>
                  </div>
                )}

                {!loadingColetores && erroBuscaColetores && (
                  <p className="text-center text-blue-600 bg-blue-50 p-3 rounded-md">{erroBuscaColetores}</p>
                )}

                {!loadingColetores && !erroBuscaColetores && listaColetoresFiltrada.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Encontramos {listaColetoresFiltrada.length} coletor(es) que atendem sua região. A seleção é opcional.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {listaColetoresFiltrada.map(coletor => (
                        <div 
                          key={coletor.id} 
                          className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-neutro/80 hover:shadow-md relative
                            ${coletorSelecionadoId === coletor.id ? 'border-neutro ring-2 ring-neutro bg-neutro/5' : 'border-border'}`}
                          onClick={() => coletorSelecionadoId === coletor.id ? handleLimparSelecaoColetor() : handleSelecionarColetor(coletor.id)}
                        >
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12 border">
                              <AvatarImage src={coletor.avatarUrl} alt={coletor.nome} />
                              <AvatarFallback>{coletor.nome.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-semibold text-md">{coletor.nome}</h4>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <StarIcon className="h-3 w-3 text-yellow-500 fill-yellow-500" /> 
                                <span>{coletor.avaliacaoMedia.toFixed(1)}</span>
                                <span>({coletor.coletasRealizadas} coletas)</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">Bairros atendidos: {coletor.bairrosAtendidos.join(', ')}</p>
                            </div>
                            {coletorSelecionadoId === coletor.id && (
                              <CheckIcon className="h-6 w-6 text-neutro absolute top-3 right-3" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {coletorSelecionadoId && (
                      <Button variant="outline" size="sm" onClick={handleLimparSelecaoColetor} className="mt-3 w-full md:w-auto">
                        Limpar Seleção de Coletor
                      </Button>
                    )}
                  </div>
                )}
              </section>

              <Separator />

              {/* Seção de Observações */}
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <MessageSquareIcon className="h-5 w-5 text-neutro" />
                  Observações <span className="text-sm font-normal text-muted-foreground">(Opcional)</span>
                </h2>
                <Textarea
                  id="observacoes-coleta"
                  value={observacoes}
                  onChange={handleObservacoesChange}
                  placeholder="Deixe aqui qualquer instrução adicional para o coletor. Ex: Deixar na portaria, material está em sacos azuis, cuidado ao manusear vidro, etc."
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {observacoes.length} / 500 caracteres
                </p>
              </section>

              <Separator />

              {/* Seção de Fotos dos Materiais */}
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span role="img" aria-label="camera">📷</span> Fotos dos Materiais <span className="text-sm font-normal text-muted-foreground">(opcional, máx. 3)</span>
                </h2>
                <div className="flex gap-3 flex-wrap items-center mb-2">
                  {fotos.map((foto, idx) => (
                    <div key={idx} className="relative w-20 h-20 border rounded overflow-hidden flex items-center justify-center bg-gray-50">
                      <img
                        src={URL.createObjectURL(foto)}
                        alt={`Foto ${idx + 1}`}
                        className="object-cover w-full h-full"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoverFoto(idx)}
                        className="absolute top-0 right-0 bg-white/80 hover:bg-white text-red-600 rounded-bl px-1 py-0.5 text-xs"
                        title="Remover foto"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {fotos.length < 3 && (
                    <label className="w-20 h-20 border-2 border-dashed rounded flex flex-col items-center justify-center cursor-pointer text-muted-foreground hover:border-neutro/60">
                      <span className="text-2xl">+</span>
                      <span className="text-xs">Adicionar</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        capture="environment"
                        className="hidden"
                        onChange={handleAddFotos}
                        disabled={fotos.length >= 3}
                      />
                    </label>
                  )}
                </div>
                {fotos.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">Clique no X para remover.</p>
                )}
              </section>

              <Separator />

              {/* Botões de Ação no Final do CardContent */}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>Cancelar</Button>
                <Button onClick={handleSubmitForm} size="lg" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <PackageIcon className="mr-2 h-5 w-5" />}
                  Solicitar Coleta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Animação de Sucesso */}
      {showSuccessAnimation && (
        <AchievementAnimation
          title={profileType === 'user' ? "Coleta Solicitada!" : "Solicitação Enviada!"}
          description="Sua solicitação de coleta foi registrada com sucesso."
          icon={<CalendarCheckIcon className="w-16 h-16 text-green-600" />}
          soundType="scheduleConfirmed"
          onComplete={() => {
            setShowSuccessAnimation(false);
            setIsSubmitting(false);

            const dadosColeta = {
              profileType,
              endereco: profileType === 'user' ? userAddresses.find(a => a.id === selectedUserAddress?.id) : selectedPartnerAddress,
              materiais: materiaisAdicionados,
              data: dataSelecionada ? format(dataSelecionada, "yyyy-MM-dd") : undefined,
              periodo: periodoSelecionado,
              coletorId: coletorSelecionadoId,
              observacoes: observacoes,
              fotos: fotos
            };
            console.log("Dados da Coleta Simples:", dadosColeta);
            toast.success(profileType === 'user' ? "Coleta solicitada com sucesso!" : "Solicitação de coleta enviada com sucesso!");
            
            setMateriaisAdicionados([]);
            setObservacoes('');
            setFotos([]);
            setDataSelecionada(undefined); 
            setPeriodoSelecionado(undefined); 
            setColetorSelecionadoId(undefined);
            setTentouSubmeter(false);

            navigate('/dashboard/standard');
          }}
        />
      )}
    </Layout>
  );
};

export default CollectionSimple;