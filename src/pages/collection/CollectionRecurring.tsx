import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChevronLeft, MapPin, Plus, Trash2, Loader2, Package, Calendar as CalendarIconLucide, Clock, Users as UsersIcon, Star as StarIcon, CheckCircle2 as CheckIcon, MessageSquare as MessageSquareIcon, Battery, Lightbulb, Archive, GlassWater, Leaf, Cpu, Recycle, CircleDashed, Trash, Droplets, Wrench } from 'lucide-react';
import { useAddress } from '@/hooks/useAddress';
import { AddressCard } from '@/components/AddressCard';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import MaterialList from '@/components/MaterialList';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AchievementAnimation } from '@/components/animations/AchievementAnimation';
import { CalendarCheck as CalendarCheckIcon } from 'lucide-react';
import { getAllMaterials } from '@/lib/collectorService';
import { materialDisplayData } from '@/config/materialDisplayData';
import { supabase } from '@/lib/supabaseClient';

interface Endereco {
  id?: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  referencia?: string;
  isDefault?: boolean;
}

interface UserAddress {
  id: string;
  tipo: 'principal' | 'secundario' | string;
  endereco: string;
  numero?: string;
  complemento?: string;
  referencia?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  regiao: string;
}

const USER_ENDERECOS_MOCK: UserAddress[] = [
  {
    id: 'user-addr-1',
    tipo: 'principal',
    endereco: 'Rua Recorrente das Flores',
    numero: '123',
    bairro: 'Jardim Recorrente',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567',
    regiao: 'Zona Sul',
  },
  {
    id: 'user-addr-2',
    tipo: 'secundario',
    endereco: 'Av. Recorrente Paulista',
    numero: '1000',
    bairro: 'Bela Vista Recorrente',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01310-100',
    regiao: 'Zona Oeste',
  },
];

interface MaterialColeta {
  id: string;
  materialId: string;
  nome: string;
  quantidade: number;
  unidade: string;
  tipoMaterial: 'separado' | 'misturado';
  descricao?: string;
}

// Constantes para a Seção de Frequência e Horários
const OPCOES_FREQUENCIA = [
  { id: 'semanal', label: 'Semanal' },
  { id: 'quinzenal', label: 'A Cada 15 Dias' },
  { id: 'mensal', label: 'Mensal' },
  // Adicionar mais se necessário, ex: 'personalizada' que abriria mais campos
];

const DIAS_SEMANA = [
  { id: 'dom', label: 'D', title: 'Domingo' },
  { id: 'seg', label: 'S', title: 'Segunda' },
  { id: 'ter', label: 'T', title: 'Terça' },
  { id: 'qua', label: 'Q', title: 'Quarta' },
  { id: 'qui', label: 'Q', title: 'Quinta' },
  { id: 'sex', label: 'S', title: 'Sexta' },
  { id: 'sab', label: 'S', title: 'Sábado' },
];

// Mantendo o formato simples de string como nas páginas originais
const HORARIOS_RECORRENTES_DISPONIVEIS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

const todayStart = new Date();
todayStart.setHours(0, 0, 0, 0);

// Interface para Coletor
interface Coletor {
  id: string;
  nome: string;
  avatarUrl: string;
  avaliacaoMedia: number;
  coletasRealizadas: number;
  bairrosAtendidos: string[];
  materiais: string[];
  periodos: string[];
  diasSemana: string[];
}

const COLETORES_MOCK: Coletor[] = [
  {
    id: '1',
    nome: 'João Ambiental',
    avatarUrl: '/avatars/coletor1.jpg',
    avaliacaoMedia: 4.8,
    coletasRealizadas: 156,
    bairrosAtendidos: ['Jardim Primavera', 'Vila Mariana', 'Moema'],
    materiais: ['papel', 'plastico', 'vidro', 'metal'],
    periodos: ['manha', 'tarde'],
    diasSemana: ['seg', 'qua', 'sex']
  },
  {
    id: '2',
    nome: 'Maria Recicla',
    avatarUrl: '/avatars/coletor2.jpg',
    avaliacaoMedia: 4.9,
    coletasRealizadas: 203,
    bairrosAtendidos: ['Bela Vista', 'Vila Buarque', 'Consolação'],
    materiais: ['papel', 'plastico', 'vidro', 'metal', 'organico'],
    periodos: ['tarde', 'noite'],
    diasSemana: ['ter', 'qui', 'sab']
  },
  {
    id: '3',
    nome: 'Pedro Sustentável',
    avatarUrl: '/avatars/coletor3.jpg',
    avaliacaoMedia: 4.7,
    coletasRealizadas: 98,
    bairrosAtendidos: ['Pinheiros', 'Vila Madalena', 'Jardins'],
    materiais: ['papel', 'plastico', 'vidro'],
    periodos: ['manha', 'tarde', 'noite'],
    diasSemana: ['seg', 'ter', 'qua', 'qui', 'sex']
  }
];

// Constantes de períodos
const PERIODOS_COLETA = [
  { id: 'manha', nome: 'Manhã (08:00 - 12:00)' },
  { id: 'tarde', nome: 'Tarde (13:00 - 18:00)' },
  { id: 'noite', nome: 'Noite (19:00 - 22:00)' },
];

const CollectionRecurring: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profileType = 'user', entityId, partnerType: partnerRouteParam } = location.state || {} as { profileType: 'user' | 'partner', entityId?: string, partnerType?: string };

  const {
    enderecos: allAddresses,
    setEnderecos,
    selectedAddress,
    setSelectedAddress,
    showAddressForm,
    setShowAddressForm,
    newAddress,
    setNewAddress,
    isLoadingCep: isLoadingCepFromHook,
    handleAddAddress,
    handleRemoveEndereco,
    handleSetMainAddress,
  } = useAddress();

  // Estado para controlar se o usuário tentou submeter o formulário (para erros de endereço)
  const [tentouSubmeter, setTentouSubmeter] = useState(false);
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  // Estados para a Seção de Materiais
  const [tabMaterial, setTabMaterial] = useState<'separados' | 'misturados'>('separados');
  const [materiaisAdicionados, setMateriaisAdicionados] = useState<MaterialColeta[]>([]);
  const [formMaterialSeparado, setFormMaterialSeparado] = useState<{
    materialId: string;
    quantidade: string;
    unidade: string;
    descricaoOutros: string;
  }>({
    materialId: '',
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

  // Handlers para a Seção de Materiais
  const handleAddMaterialToList = () => {
    let novosErros: Record<string, string> = {};
    let novoMaterial: MaterialColeta | null = null;

    if (tabMaterial === 'separados') {
        const { materialId, quantidade, unidade, descricaoOutros } = formMaterialSeparado;

        if (!materialId) novosErros.materialId = 'Selecione o tipo de material.';
        if (!quantidade || parseFloat(quantidade) <= 0) novosErros.quantidadeSeparado = 'Quantidade deve ser maior que zero.';
        if (!unidade) novosErros.unidadeSeparado = 'Selecione a unidade.';
        
        const materialInfo = materiaisDb.find(m => m.id === materialId);
        if (materialInfo?.identificador === 'outros' && !descricaoOutros) {
            novosErros.descricaoOutros = 'Especifique o material quando "Outros" for selecionado.';
        }

        if (Object.keys(novosErros).length === 0) {
            novoMaterial = {
                id: Date.now().toString(),
                materialId,
                nome: materialInfo?.nome || materialDisplayData[materialInfo?.identificador]?.nome || 'Desconhecido',
                quantidade: parseFloat(quantidade),
                unidade,
                tipoMaterial: 'separado',
                descricao: materialInfo?.identificador === 'outros' ? descricaoOutros : undefined,
            };
            setMateriaisAdicionados(prev => [...prev, novoMaterial!]);
            toast.success('Material adicionado!');
        }

    } else { // misturados
        const { descricao, quantidade, unidade } = formMaterialMisturado;
        if (!descricao) novosErros.descricaoMisturado = 'Descrição é obrigatória.';
        if (!quantidade || parseFloat(quantidade) <= 0) novosErros.quantidadeMisturado = 'Quantidade deve ser maior que zero.';
        if (!unidade) novosErros.unidadeMisturado = 'Selecione a unidade.';

        if (Object.keys(novosErros).length === 0) {
            novoMaterial = {
                id: Date.now().toString(),
                materialId: 'outros',
                nome: `Misturados: ${descricao.substring(0, 30)}...`,
                quantidade: parseFloat(quantidade),
                unidade,
                tipoMaterial: 'misturado',
                descricao,
            };
            setMateriaisAdicionados(prev => [...prev, novoMaterial!]);
            toast.success('Material adicionado!');
        }
    }

    setErrosFormMaterial(novosErros);
  };

  const handleRemoveMaterialDaLista = (index: number) => {
    setMateriaisAdicionados(prev => prev.filter((_, i) => i !== index));
    toast.info('Material removido da lista.');
  };

  // Estados para Frequência e Horários
  const [frequenciaSelecionada, setFrequenciaSelecionada] = useState<string | undefined>(undefined);
  const [diasSemanaSelecionados, setDiasSemanaSelecionados] = useState<string[]>([]);
  const [dataInicio, setDataInicio] = useState<Date | undefined>(undefined);
  const [dataFim, setDataFim] = useState<Date | undefined>(undefined); // Opcional
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | undefined>(undefined);
  const [isDataInicioCalendarOpen, setIsDataInicioCalendarOpen] = useState(false);
  const [isDataFimCalendarOpen, setIsDataFimCalendarOpen] = useState(false);
  const [errosAgendamento, setErrosAgendamento] = useState<Record<string, string>>({});
  const [repetirAteDataEspecifica, setRepetirAteDataEspecifica] = useState(false);

  // Handlers para Frequência e Horários
  const handleFrequenciaChange = (value: string | undefined) => {
    setFrequenciaSelecionada(value);
    setErrosAgendamento(prev => ({ ...prev, frequencia: undefined }));
    // Se a frequência não requer dias da semana específicos, limpar seleção de dias
    if (value !== 'semanal' && value !== 'quinzenal') {
      setDiasSemanaSelecionados([]);
      setErrosAgendamento(prev => ({ ...prev, diasSemana: undefined }));
    }
  };

  const handleDiaSemanaToggle = (diaId: string) => {
    setDiasSemanaSelecionados(prev => {
      const isSelected = prev.includes(diaId);
      if (isSelected) {
        return prev.filter(d => d !== diaId);
      } else {
        return [...prev, diaId];
      }
    });
    setErrosAgendamento(prev => ({ ...prev, diasSemana: undefined }));
  };

  const handleDataInicioChange = (date: Date | undefined) => {
    setDataInicio(date);
    setErrosAgendamento(prev => ({ ...prev, dataInicio: undefined }));
    // Validar se dataFim é após dataInicio, se ambas existirem
    if (date && dataFim && dataFim < date) {
      setErrosAgendamento(prev => ({ ...prev, dataFim: 'Data de término deve ser após a data de início.' }));
    } else if (dataFim) {
      setErrosAgendamento(prev => ({ ...prev, dataFim: undefined }));
    }
    setIsDataInicioCalendarOpen(false);
  };

  const handleDataFimChange = (date: Date | undefined) => {
    setDataFim(date);
    if (date && dataInicio && date < dataInicio) {
      setErrosAgendamento(prev => ({ ...prev, dataFim: 'Data de término deve ser após a data de início.' }));
    } else {
      setErrosAgendamento(prev => ({ ...prev, dataFim: undefined }));
    }
    setIsDataFimCalendarOpen(false);
  };

  const handleHorarioChange = (value: string | undefined) => {
    setHorarioSelecionado(value);
    setErrosAgendamento(prev => ({ ...prev, horario: undefined }));
  };

  const handleRepetirAteDataChange = (checked: boolean) => {
    setRepetirAteDataEspecifica(checked);
    if (!checked) {
      setDataFim(undefined);
      setErrosAgendamento(prev => ({ ...prev, dataFim: undefined }));
    }
  };

  const handleBack = () => navigate(-1);

  // Refs para scroll em caso de erro
  const addressSectionRef = useRef<HTMLDivElement>(null);
  const materialsSectionRef = useRef<HTMLDivElement>(null);
  const recurrenceConfigSectionRef = useRef<HTMLDivElement>(null);

  // Adicionar isSubmitting e showSuccessAnimation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const handleAgendarColetaRecorrente = async () => {
    setIsSubmitting(true); // Iniciar submissão
    setTentouSubmeter(true);
    const novosAddressErrors: Record<string, string> = {};
    const novosErrosAgendamento: Record<string, string> = {};
    const novosErrosFormMaterial: Record<string, string> = {};
    let isValid = true;
    let firstErrorRef: React.RefObject<HTMLDivElement> | null = null;

    if (!selectedAddress) {
      novosAddressErrors.endereco = 'Selecione um endereço de coleta.';
      isValid = false;
      if (!firstErrorRef) firstErrorRef = addressSectionRef;
    }

    if (materiaisAdicionados.length === 0) {
      novosErrosFormMaterial.materiais = 'Adicione pelo menos um material para coleta.';
      isValid = false;
      if (!firstErrorRef) firstErrorRef = materialsSectionRef;
    }

    if (!frequenciaSelecionada) {
      novosErrosAgendamento.frequencia = "Selecione a frequência.";
      isValid = false;
      if (!firstErrorRef) firstErrorRef = recurrenceConfigSectionRef;
    }
    if (frequenciaSelecionada === 'semanal' && diasSemanaSelecionados.length === 0) {
      novosErrosAgendamento.diasSemana = "Selecione pelo menos um dia da semana para frequência semanal.";
      isValid = false;
      if (!firstErrorRef) firstErrorRef = recurrenceConfigSectionRef;
    }
    if (!dataInicio) {
      novosErrosAgendamento.dataInicio = "Selecione a data de início.";
      isValid = false;
      if (!firstErrorRef) firstErrorRef = recurrenceConfigSectionRef;
    }
    if (!horarioSelecionado) {
      novosErrosAgendamento.horario = "Selecione um horário.";
      isValid = false;
      if (!firstErrorRef) firstErrorRef = recurrenceConfigSectionRef;
    }
    if (repetirAteDataEspecifica && dataFim && dataInicio && dataFim < dataInicio) {
      novosErrosAgendamento.dataFim = "Data de término não pode ser anterior à data de início.";
      isValid = false;
      if (!firstErrorRef) firstErrorRef = recurrenceConfigSectionRef;
    }

    setAddressErrors(novosAddressErrors);
    setErrosAgendamento(novosErrosAgendamento);
    setErrosFormMaterial(novosErrosFormMaterial);

    if (!isValid) {
      toast.error("Por favor, corrija os erros no formulário antes de prosseguir.");
      firstErrorRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setIsSubmitting(false); // Parar submissão se inválido
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
      // Ajuste os campos conforme necessário
      solicitante_id: userId, // ou o id correto do usuário logado
      address_id: selectedAddress?.id,
      date: dataInicio?.toISOString().split('T')[0],
      time: horarioSelecionado,
      materials: materiaisAdicionados,
      recurring_pattern: {
        frequencia: frequenciaSelecionada,
        diasSemana: diasSemanaSelecionados,
        repetirAteDataEspecifica,
        dataFim: dataFim ? dataFim.toISOString().split('T')[0] : null,
      },
      is_recurring: true,
      observations: observacoes,
      status: 'pending',
      collection_type: 'recurring',
      photos: photoUrls,
      created_at: new Date().toISOString(),
      // outros campos necessários...
    };

    const { error: insertError } = await supabase.from('collections').insert([collectionData]);
    if (insertError) {
      toast.error('Erro ao salvar a coleta no banco de dados.');
      setIsSubmitting(false);
      return;
    }

    toast.success('Coleta recorrente agendada com sucesso!');
    setShowSuccessAnimation(true);
    setIsSubmitting(false);
  };

  // Efeito para limpar dias da semana se a frequência não for semanal
  useEffect(() => {
    if (frequenciaSelecionada !== 'semanal') {
      setDiasSemanaSelecionados([]);
    }
  }, [frequenciaSelecionada]);

  // Função para definir endereço principal (se não estiver totalmente no hook useAddress)
  // Esta função agora utiliza handleSetMainAddress do hook.
  const setMainAddressHandler = (id: string) => {
    if (handleSetMainAddress) {
      handleSetMainAddress(id);
      toast.success('Endereço principal atualizado!');
    } else {
      // Fallback ou erro se handleSetMainAddress não estiver disponível
      // Isso não deve acontecer se o hook estiver correto.
      toast.error('Erro ao definir endereço principal.');
    }
  };

  // Função para verificar se uma data deve ser desabilitada para o calendário de INÍCIO
  const isDateDisabledForInicio = (date: Date): boolean => {
    // 1. Desabilitar datas estritamente anteriores a hoje
    if (date < todayStart) {
      return true;
    }

    // 2. Se dias da semana foram selecionados e a frequência é semanal/quinzenal
    if ( (frequenciaSelecionada === 'semanal' || frequenciaSelecionada === 'quinzenal') && diasSemanaSelecionados.length > 0) {
      const diaDaSemanaDaData = date.getDay(); // Domingo = 0, Segunda = 1, ..., Sábado = 6
      
      const diasSemanaSelecionadosNumeros: number[] = diasSemanaSelecionados.map(idDia => {
        switch (idDia) {
          case 'dom': return 0;
          case 'seg': return 1;
          case 'ter': return 2;
          case 'qua': return 3;
          case 'qui': return 4;
          case 'sex': return 5;
          case 'sab': return 6;
          default: return -1; // Caso improvável
        }
      }).filter(num => num !== -1);

      if (!diasSemanaSelecionadosNumeros.includes(diaDaSemanaDaData)) {
        return true;
      }
    }
    return false;
  };

  // Função para verificar se uma data deve ser desabilitada para o calendário de FIM
  const isDateDisabledForFim = (date: Date): boolean => {
    // 1. Data de término não pode ser anterior a hoje
    if (date < todayStart) return true;
    // 2. Data de término não pode ser anterior ou igual à data de início
    if (dataInicio && date < dataInicio) { // Se dataFim for igual a dataInicio, é permitido
      return true;
    }
    return false;
  };

  // Estados para seleção de coletor
  const [coletorSelecionadoId, setColetorSelecionadoId] = useState<string | undefined>(undefined);
  const [listaColetoresFiltrada, setListaColetoresFiltrada] = useState<Coletor[]>([]);
  const [loadingColetores, setLoadingColetores] = useState(false);
  const [erroBuscaColetores, setErroBuscaColetores] = useState<string | null>(null);
  const [observacoes, setObservacoes] = useState('');
  const [fotos, setFotos] = useState<File[]>([]);

  // useEffect para filtrar coletores quando o endereço ou filtros mudam
  useEffect(() => {
    if (!selectedAddress || !selectedAddress.bairro) {
      setListaColetoresFiltrada([]);
      setErroBuscaColetores('Selecione um endereço com bairro para ver os coletores disponíveis');
      return;
    }

    // Começa com todos do bairro
    let coletoresFiltrados = COLETORES_MOCK.filter(coletor => 
      coletor.bairrosAtendidos.includes(selectedAddress.bairro)
    );

    // Filtra por materiais
    if (materiaisAdicionados.length > 0) {
      coletoresFiltrados = coletoresFiltrados.filter(coletor =>
        materiaisAdicionados.every(m => coletor.materiais.includes(m.materialId))
      );
    }

    // Filtra por período
    if (horarioSelecionado) {
      coletoresFiltrados = coletoresFiltrados.filter(coletor =>
        coletor.periodos.includes(horarioSelecionado)
      );
    }

    // Filtra por dias da semana
    if (dataInicio) {
      const diaSemana = dataInicio.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      coletoresFiltrados = coletoresFiltrados.filter(coletor =>
        coletor.diasSemana.includes(diaSemana)
      );
    }

    setListaColetoresFiltrada(coletoresFiltrados);

    if (coletoresFiltrados.length === 0) {
      setErroBuscaColetores('Nenhum coletor encontrado para os critérios selecionados. Você pode prosseguir com sua solicitação e os coletores que atendem seu bairro serão notificados.');
    } else {
      setErroBuscaColetores(null);
    }
  }, [selectedAddress, materiaisAdicionados, horarioSelecionado, dataInicio]);

  // Handlers de coletor
  const handleSelecionarColetor = (coletorId: string) => {
    setColetorSelecionadoId(coletorId);
    toast.success('Coletor selecionado!');
  };
  const handleLimparSelecaoColetor = () => {
    setColetorSelecionadoId(undefined);
    toast.info('Seleção de coletor removida.');
  };

  // Handler para Observações
  const handleObservacoesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setObservacoes(event.target.value);
  };

  // Handlers para Fotos
  const handleAddFotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const novas = Array.from(e.target.files);
    setFotos(prev => {
      const total = prev.length + novas.length;
      if (total <= 3) return [...prev, ...novas];
      // Se adicionar mais do que o limite, pega apenas as primeiras até completar 3
      const needed = 3 - prev.length;
      if (needed > 0) return [...prev, ...novas.slice(0, needed)];
      return prev; // Se já tem 3, não adiciona mais
    });
    e.target.value = ''; // Limpar o input para permitir adicionar o mesmo arquivo novamente se removido
  };

  const handleRemoverFoto = (idx: number) => {
    setFotos(prev => prev.filter((_, i) => i !== idx));
  };

  const validateAddress = (address: Endereco): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!address.cep) errors.cep = 'CEP é obrigatório';
    else if (!/^\d{5}-\d{3}$/.test(address.cep)) errors.cep = 'CEP inválido';
    
    if (!address.logradouro) errors.logradouro = 'Endereço é obrigatório';
    if (!address.numero) errors.numero = 'Número é obrigatório';
    if (!address.bairro) errors.bairro = 'Bairro é obrigatório';
    if (!address.cidade) errors.cidade = 'Cidade é obrigatória';
    if (!address.estado) errors.estado = 'Estado é obrigatório';
    
    return errors;
  };

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

  return (
    <Layout hideFooter={false}>
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={handleBack} aria-label="Voltar">
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-3xl font-bold">
              Agendar Coleta Recorrente
            </h1>
          </div>

          <Card>
            <CardContent className="space-y-8 py-6">
              {/* Bloco de Endereço da Coleta (Padronizado) */}
              <section ref={addressSectionRef}>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-neutro" />
                  Endereço da Coleta
                </h2>

                {/* Unificação para user e partner */}
                {allAddresses && allAddresses.length > 0 && !showAddressForm && (
                  <RadioGroup
                    value={selectedAddress?.id || ''}
                    onValueChange={id => {
                      const addr = allAddresses.find(a => a.id === id);
                      if (addr) setSelectedAddress(addr);
                    }}
                    className="space-y-3 mb-4"
                  >
                    {allAddresses.map(addr => (
                      <Label
                        key={addr.id}
                        htmlFor={`addr-${addr.id}`}
                        className={`flex flex-col p-4 border rounded-lg cursor-pointer transition-all hover:border-neutro ${selectedAddress?.id === addr.id ? 'border-neutro ring-2 ring-neutro' : 'border-border'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value={addr.id} id={`addr-${addr.id}`} />
                            <span className="font-medium">{addr.logradouro}, {addr.numero}</span>
                            {addr.tipo === 'principal' && <span className="text-xs bg-neutro/10 text-neutro px-2 py-0.5 rounded-full">Principal</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            {addr.tipo !== 'principal' && (
                              <Button variant="ghost" size="sm" onClick={e => { e.preventDefault(); e.stopPropagation(); setMainAddressHandler(addr.id); }}>
                                Tornar Principal
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={e => { e.preventDefault(); e.stopPropagation(); handleRemoveEndereco && handleRemoveEndereco(addr.id); }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
                {!showAddressForm && (
                  <Button variant="outline" onClick={() => { setNewAddress({ logradouro: '', numero: '', complemento: '', referencia: '', bairro: '', cidade: '', estado: '', cep: '', regiao: selectedAddress?.regiao || allAddresses?.[0]?.regiao || '' }); setShowAddressForm(true); }} className="w-full mb-2">
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Novo Endereço
                  </Button>
                )}

                {/* Formulário de novo endereço unificado */}
                {showAddressForm && newAddress && (
                  <div className="space-y-4 mt-4 border p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3">Novo Endereço</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cep">CEP *</Label>
                        <Input
                          id="cep"
                          value={newAddress.cep}
                          onChange={(e) => {
                            const valor = e.target.value;
                            const cepLimpo = valor.replace(/\D/g, '');
                            let cepFormatado = cepLimpo;
                            if (cepLimpo.length > 5) {
                              cepFormatado = `${cepLimpo.substring(0, 5)}-${cepLimpo.substring(5, 8)}`;
                            }
                            setNewAddress({ ...newAddress, cep: cepFormatado });
                          }}
                          maxLength={9}
                          placeholder="00000-000"
                          className={addressErrors.cep ? 'border-red-500' : ''}
                          disabled={isLoadingCepFromHook}
                        />
                        {isLoadingCepFromHook && <p className="text-sm text-muted-foreground mt-1 flex items-center"><Loader2 className="h-4 w-4 animate-spin mr-2" /> Buscando CEP...</p>}
                        {addressErrors.cep && !isLoadingCepFromHook && <p className="text-sm text-red-500 mt-1">{addressErrors.cep}</p>}
                      </div>
                      <div>
                        <Label htmlFor="logradouro">Endereço (Rua/Av.) *</Label>
                        <Input
                          id="logradouro"
                          value={newAddress.logradouro}
                          onChange={(e) => setNewAddress({ ...newAddress, logradouro: e.target.value })}
                          disabled={isLoadingCepFromHook}
                          className={addressErrors.logradouro ? 'border-red-500' : ''}
                        />
                        {addressErrors.logradouro && <p className="text-sm text-red-500 mt-1">{addressErrors.logradouro}</p>}
                      </div>
                      <div>
                        <Label htmlFor="numero">Número *</Label>
                        <Input
                          id="numero"
                          value={newAddress.numero}
                          onChange={(e) => setNewAddress({ ...newAddress, numero: e.target.value })}
                          className={addressErrors.numero ? 'border-red-500' : ''}
                        />
                        {addressErrors.numero && <p className="text-sm text-red-500 mt-1">{addressErrors.numero}</p>}
                      </div>
                      <div>
                        <Label htmlFor="complemento">Complemento</Label>
                        <Input
                          id="complemento"
                          value={newAddress.complemento}
                          onChange={(e) => setNewAddress({ ...newAddress, complemento: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bairro">Bairro *</Label>
                        <Input
                          id="bairro"
                          value={newAddress.bairro}
                          onChange={(e) => setNewAddress({ ...newAddress, bairro: e.target.value })}
                          disabled={isLoadingCepFromHook}
                          className={addressErrors.bairro ? 'border-red-500' : ''}
                        />
                        {addressErrors.bairro && <p className="text-sm text-red-500 mt-1">{addressErrors.bairro}</p>}
                      </div>
                      <div>
                        <Label htmlFor="cidade">Cidade *</Label>
                        <Input
                          id="cidade"
                          value={newAddress.cidade}
                          onChange={(e) => setNewAddress({ ...newAddress, cidade: e.target.value })}
                          disabled={isLoadingCepFromHook}
                          className={addressErrors.cidade ? 'border-red-500' : ''}
                        />
                        {addressErrors.cidade && <p className="text-sm text-red-500 mt-1">{addressErrors.cidade}</p>}
                      </div>
                      <div>
                        <Label htmlFor="estado">Estado *</Label>
                        <Input
                          id="estado"
                          value={newAddress.estado}
                          onChange={(e) => setNewAddress({ ...newAddress, estado: e.target.value })}
                          disabled={isLoadingCepFromHook}
                          className={addressErrors.estado ? 'border-red-500' : ''}
                        />
                        {addressErrors.estado && <p className="text-sm text-red-500 mt-1">{addressErrors.estado}</p>}
                      </div>
                      <div>
                        <Label htmlFor="referencia">Referência</Label>
                        <Input
                          id="referencia"
                          value={newAddress.referencia}
                          onChange={(e) => setNewAddress({ ...newAddress, referencia: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="ghost" onClick={() => { setShowAddressForm(false); setAddressErrors({}); }}>Cancelar</Button>
                      <Button onClick={() => {
                        // Validação simples
                        const localAddressErrors: Record<string, string> = {};
                        if (!newAddress.logradouro) localAddressErrors.logradouro = 'Endereço é obrigatório';
                        if (!newAddress.cep) localAddressErrors.cep = 'CEP é obrigatório';
                        if (!newAddress.cidade) localAddressErrors.cidade = 'Cidade é obrigatória';
                        if (!newAddress.estado) localAddressErrors.estado = 'Estado é obrigatório';
                        if (!newAddress.bairro) localAddressErrors.bairro = 'Bairro é obrigatório';
                        if (!newAddress.numero) localAddressErrors.numero = 'Número é obrigatório';
                        if (!newAddress.regiao) localAddressErrors.regiao = 'Região é obrigatória';
                        setAddressErrors(localAddressErrors);
                        if (Object.keys(localAddressErrors).length === 0) {
                          if (handleAddAddress) {
                            const success = handleAddAddress();
                            if (success) toast.success('Endereço adicionado!');
                            else toast.error('Erro ao salvar endereço. Verifique os campos.');
                          }
                        } else {
                          toast.error('Preencha todos os campos obrigatórios do endereço.');
                        }
                      }}>Salvar Endereço</Button>
                    </div>
                  </div>
                )}
                {tentouSubmeter && addressErrors.endereco && !selectedAddress && (
                  <p className="text-sm text-red-500 mt-2">{addressErrors.endereco}</p>
                )}
              </section>
              <Separator />

              {/* Bloco de Configuração da Recorrência - fiel ao padrão antigo */}
              <div className="space-y-4" ref={recurrenceConfigSectionRef}>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-neutro" />
                  <h3 className="font-semibold">Configuração da Recorrência</h3>
                </div>
                <div className="pl-7 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Frequência *</Label>
                      <Select value={frequenciaSelecionada} onValueChange={setFrequenciaSelecionada}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a frequência" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="semanal">Semanal</SelectItem>
                          <SelectItem value="quinzenal">Quinzenal</SelectItem>
                          <SelectItem value="mensal">Mensal</SelectItem>
                        </SelectContent>
                      </Select>
                      {errosAgendamento.frequencia && <p className="text-xs text-red-500">{errosAgendamento.frequencia}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Horário Fixo *</Label>
                      <Select value={horarioSelecionado} onValueChange={setHorarioSelecionado}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um período" />
                        </SelectTrigger>
                        <SelectContent>
                          {PERIODOS_COLETA.map(periodo => (
                            <SelectItem key={periodo.id} value={periodo.id}>{periodo.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errosAgendamento.horario && <p className="text-xs text-red-500">{errosAgendamento.horario}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Dias da Semana *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {['dom','seg','ter','qua','qui','sex','sab'].map((dia, idx) => (
                        <div key={dia} className="flex items-center space-x-2">
                          <Checkbox
                            id={dia}
                            checked={diasSemanaSelecionados.includes(dia)}
                            onCheckedChange={() => handleDiaSemanaToggle(dia)}
                          />
                          <label
                            htmlFor={dia}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'][idx]}
                          </label>
                        </div>
                      ))}
                    </div>
                    {errosAgendamento.diasSemana && <p className="text-xs text-red-500">{errosAgendamento.diasSemana}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Data de Início *</Label>
                      <Popover open={isDataInicioCalendarOpen} onOpenChange={setIsDataInicioCalendarOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dataInicio && "text-muted-foreground",
                              errosAgendamento.dataInicio && "border-red-500"
                            )}
                            onClick={() => setIsDataInicioCalendarOpen(true)}
                          >
                            <CalendarIconLucide className="mr-2 h-4 w-4" />
                            {dataInicio ? format(dataInicio, "dd 'de' MMMM", { locale: ptBR }) : <span>Selecione uma data</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dataInicio}
                            onSelect={selected => {
                              setDataInicio(selected);
                              setIsDataInicioCalendarOpen(false);
                            }}
                            locale={ptBR}
                            disabled={date => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                      {errosAgendamento.dataInicio && <p className="text-xs text-red-500">{errosAgendamento.dataInicio}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Data de Término (Opcional)</Label>
                      <Popover open={isDataFimCalendarOpen} onOpenChange={setIsDataFimCalendarOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dataFim && "text-muted-foreground"
                            )}
                            onClick={() => setIsDataFimCalendarOpen(true)}
                          >
                            <CalendarIconLucide className="mr-2 h-4 w-4" />
                            {dataFim ? format(dataFim, "dd 'de' MMMM", { locale: ptBR }) : <span>Selecione uma data</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dataFim}
                            onSelect={selected => {
                              setDataFim(selected);
                              setIsDataFimCalendarOpen(false);
                            }}
                            locale={ptBR}
                            disabled={date => !dataInicio || date <= dataInicio}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              </div>
              <Separator />

              {/* Bloco de Materiais */}
              <section ref={materialsSectionRef}>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-neutro" />
                  Materiais para Coleta
                </h2>
                <CardContent className="pt-6 space-y-4">
                  {loadingMateriais ? (
                    <div className="flex justify-center items-center h-24"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
                  ) : erroMateriais ? (
                    <div className="text-red-500 text-center py-4">{erroMateriais}</div>
                  ) : materiaisDb.length === 0 ? (
                    <div className="text-muted-foreground text-center py-4">Nenhum material disponível.</div>
                  ) : (
                    <>
                      <Tabs value={tabMaterial} onValueChange={(value) => setTabMaterial(value as 'separados' | 'misturados')} className="mb-4">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                          <TabsTrigger value="separados">Adicionar Separados</TabsTrigger>
                          <TabsTrigger value="misturados">Adicionar Misturados</TabsTrigger>
                        </TabsList>
                        <TabsContent value="separados">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
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
                                  {materiaisDb.map((material) => {
                                    const displayInfo = materialDisplayData[material.identificador] || materialDisplayData.outros;
                                    return (
                                      <SelectItem key={material.id} value={material.id}>
                                        <div className="flex items-center gap-2">
                                          <displayInfo.icone className={`h-4 w-4 ${displayInfo.cor}`} />
                                          <span>{displayInfo.nome}</span>
                                        </div>
                                      </SelectItem>
                                    )
                                  })}
                                </SelectContent>
                              </Select>
                              {errosFormMaterial.materialId && <p className="text-sm text-red-500 mt-1">{errosFormMaterial.materialId}</p>}
                            </div>
                            {formMaterialSeparado.materialId && materiaisDb.find(m => m.id === formMaterialSeparado.materialId)?.identificador === 'outros' && (
                              <div>
                                <Label htmlFor="material-outros-descricao">Especifique o material "Outros" *</Label>
                                <Input id="material-outros-descricao" value={formMaterialSeparado.descricaoOutros} onChange={(e) => setFormMaterialSeparado(prev => ({ ...prev, descricaoOutros: e.target.value }))} placeholder="Ex: Entulho limpo, Pneus"/>
                                {errosFormMaterial.descricaoOutros && <p className="text-sm text-red-500 mt-1">{errosFormMaterial.descricaoOutros}</p>}
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <Label htmlFor="material-quantidade-s">Quantidade *</Label>
                              <Input id="material-quantidade-s" type="number" min="0.1" step="0.1" placeholder="Ex: 2.5" value={formMaterialSeparado.quantidade} onChange={(e) => setFormMaterialSeparado(prev => ({ ...prev, quantidade: e.target.value }))} />
                              {errosFormMaterial.quantidadeSeparado && <p className="text-sm text-red-500 mt-1">{errosFormMaterial.quantidadeSeparado}</p>}
                            </div>
                            <div>
                              <Label htmlFor="material-unidade-s">Unidade *</Label>
                              <Select value={formMaterialSeparado.unidade} onValueChange={(value) => { setFormMaterialSeparado(prev => ({ ...prev, unidade: value })); }}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Unidade" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="kg">Kg</SelectItem>
                                  <SelectItem value="un">Unidade</SelectItem>
                                  <SelectItem value="L">Litro</SelectItem>
                                  <SelectItem value="sacos">Sacos</SelectItem>
                                </SelectContent>
                              </Select>
                              {errosFormMaterial.unidadeSeparado && <p className="text-sm text-red-500 mt-1">{errosFormMaterial.unidadeSeparado}</p>}
                            </div>
                          </div>
                          <Button onClick={handleAddMaterialToList} size="sm" className="mt-4">
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar à Lista
                          </Button>
                        </TabsContent>
                        <TabsContent value="misturados">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                            <div>
                              <Label htmlFor="material-misturado-descricao">Descrição *</Label>
                              <Input id="material-misturado-descricao" value={formMaterialMisturado.descricao} onChange={(e) => setFormMaterialMisturado(prev => ({ ...prev, descricao: e.target.value }))} placeholder="Ex: Resíduos misturados, entulho, etc."/>
                              {errosFormMaterial.descricaoMisturado && <p className="text-sm text-red-500 mt-1">{errosFormMaterial.descricaoMisturado}</p>}
                            </div>
                            <div>
                              <Label htmlFor="material-quantidade-m">Quantidade *</Label>
                              <Input id="material-quantidade-m" type="number" min="0.1" step="0.1" placeholder="Ex: 2.5" value={formMaterialMisturado.quantidade} onChange={(e) => setFormMaterialMisturado(prev => ({ ...prev, quantidade: e.target.value }))} />
                              {errosFormMaterial.quantidadeMisturado && <p className="text-sm text-red-500 mt-1">{errosFormMaterial.quantidadeMisturado}</p>}
                            </div>
                            <div>
                              <Label htmlFor="material-unidade-m">Unidade *</Label>
                              <Select value={formMaterialMisturado.unidade} onValueChange={(value) => { setFormMaterialMisturado(prev => ({ ...prev, unidade: value })); }}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Unidade" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="kg">Kg</SelectItem>
                                  <SelectItem value="un">Unidade</SelectItem>
                                  <SelectItem value="L">Litro</SelectItem>
                                  <SelectItem value="sacos">Sacos</SelectItem>
                                </SelectContent>
                              </Select>
                              {errosFormMaterial.unidadeMisturado && <p className="text-sm text-red-500 mt-1">{errosFormMaterial.unidadeMisturado}</p>}
                            </div>
                          </div>
                          <Button onClick={handleAddMaterialToList} size="sm" className="mt-4">
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar à Lista
                          </Button>
                        </TabsContent>
                      </Tabs>
                      {/* Lista dos materiais já adicionados */}
                      <div className="mt-6">
                        <MaterialList materiais={materiaisAdicionados as any} onRemove={handleRemoveMaterialDaLista} materiaisDoBanco={materiaisDb} materialDisplayData={materialDisplayData} />
                        {errosFormMaterial.materiais && <p className="text-sm text-red-500 mt-1">{errosFormMaterial.materiais}</p>}
                      </div>
                    </>
                  )}
                </CardContent>
              </section>
              <Separator/>

              {/* Bloco Selecionar Coletor (Opcional) */}
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <UsersIcon className="h-5 w-5 text-neutro" />
                  Selecionar Coletor <span className="text-sm font-normal text-muted-foreground">(Opcional)</span>
                </h2>
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
                          className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-neutro/80 hover:shadow-md relative ${coletorSelecionadoId === coletor.id ? 'border-neutro ring-2 ring-neutro bg-neutro/5' : 'border-border'}`}
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
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>Bairros atendidos: {coletor.bairrosAtendidos.join(', ')}</span>
                              </div>
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

              {/* Outras seções como Observações, Upload de fotos e botão de Agendar viriam aqui */}
              {/* Por enquanto, vamos adicionar o botão de agendar */}
              
              <div className="mt-8 flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>Cancelar</Button>
                <Button onClick={handleAgendarColetaRecorrente} size="lg" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Clock className="mr-2 h-5 w-5" />}
                  Agendar Coleta Recorrente
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>

      {/* Animação de Sucesso */}
      {showSuccessAnimation && (
        <AchievementAnimation
          title="Agendamento Confirmado!"
          description="Sua coleta recorrente foi agendada com sucesso."
          icon={<CalendarCheckIcon className="w-16 h-16 text-green-600" />}
          soundType="scheduleConfirmed"
          onComplete={() => {
            setShowSuccessAnimation(false);
            setIsSubmitting(false); // Parar o estado de submitting

            // Lógica que acontecia após o sucesso ANTES da animação
            const dadosAgendamento = {
              profileType,
              endereco: selectedAddress,
              materiais: materiaisAdicionados.map(m => ({
                id: m.id,
                materialId: m.materialId,
                nome: m.nome,
                quantidade: m.quantidade,
                unidade: m.unidade,
                tipoMaterial: m.tipoMaterial,
                descricao: m.descricao,
              })),
              frequencia: frequenciaSelecionada,
              diasSemana: frequenciaSelecionada === 'semanal' ? diasSemanaSelecionados : undefined,
              dataInicio: dataInicio ? format(dataInicio, "yyyy-MM-dd") : undefined,
              dataFim: repetirAteDataEspecifica && dataFim ? format(dataFim, "yyyy-MM-dd") : undefined,
              horario: horarioSelecionado,
              coletorId: coletorSelecionadoId,
              observacoes: observacoes,
              fotos: fotos
            };
            console.log("Dados da Coleta Recorrente:", dadosAgendamento);
            toast.success("Coleta recorrente solicitada com sucesso! (Dados no console)");
            
            // Limpar formulário (exemplos, adicione os estados relevantes da coleta recorrente)
            setMateriaisAdicionados([]);
            setObservacoes('');
            setFotos([]);
            setFrequenciaSelecionada(undefined);
            setDiasSemanaSelecionados([]);
            setDataInicio(undefined);
            setDataFim(undefined);
            setHorarioSelecionado(undefined);
            setColetorSelecionadoId(undefined);
            setRepetirAteDataEspecifica(false);
            setTentouSubmeter(false); // Resetar tentativa de submissão

            // Redirecionar para o dashboard standard
            navigate('/dashboard/standard');
          }}
        />
      )}
    </Layout>
  );
};

export default CollectionRecurring;
