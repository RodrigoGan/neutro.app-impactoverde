import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Bell, 
  Clock, 
  MapPin, 
  Package, 
  User, 
  Camera, 
  KeyRound, 
  Shield, 
  AlertCircle,
  Truck,
  X,
  Save,
  AlertTriangle,
  Archive,
  Recycle,
  GlassWater,
  CircleDashed,
  Cpu,
  Droplets,
  TrashIcon,
  Leaf,
  Battery,
  Lightbulb,
  ChevronLeft
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from "@/lib/utils";
import { TRANSPORT_TYPES } from '@/constants/transportTypes';
import StandardCollectorVehicle from '@/components/dashboard/standard/StandardCollectorVehicle';
import { NotificationsSection } from '@/components/profile/NotificationsSection';
import { NotificationPreference } from '@/types/user';
import { MobileTabs } from '@/components/ui/mobile-tabs';
import { getCollectorMaterials, saveCollectorMaterials, getCollectorVehicle, saveCollectorVehicle, getCollectorProfile, saveCollectorProfile, getCollectorAddress, saveCollectorAddress, getCollectorNeighborhoods, saveCollectorNeighborhoods, getCollectorSchedules, saveCollectorSchedules } from '@/lib/collectorService';
import { useAuth } from '@/contexts/AuthContext';
import { materialDisplayData } from '@/config/materialDisplayData';
import { getMaterialIdentificador } from '@/lib/utils';
import { getAllMaterials } from '@/lib/collectorService';
import LogoutButton from '@/components/ui/LogoutButton';

// Dados mockados - substituir por dados reais da API
const MATERIAIS_DISPONIVEIS = [
  'Papel/Papelão',
  'Plástico',
  'Vidro',
  'Metal',
  'Orgânico',
  'Óleo',
  'Eletrônico',
  'Cobre',
  'Alumínio',
  'Latinha',
  'Pilhas e Baterias',
  'Lâmpadas Fluorescentes'
];

const HORARIOS_DISPONIVEIS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00'
];

const DIAS_SEMANA = [
  { id: 'dom', label: 'Domingo', shortLabel: 'Dom' },
  { id: 'seg', label: 'Segunda', shortLabel: 'Seg' },
  { id: 'ter', label: 'Terça', shortLabel: 'Ter' },
  { id: 'qua', label: 'Quarta', shortLabel: 'Qua' },
  { id: 'qui', label: 'Quinta', shortLabel: 'Qui' },
  { id: 'sex', label: 'Sexta', shortLabel: 'Sex' },
  { id: 'sab', label: 'Sábado', shortLabel: 'Sáb' }
];

// Opções de períodos do dia
const PERIODOS_OPCOES = [
  { id: 'manha', nome: 'Manhã (08:00 - 12:00)' },
  { id: 'tarde', nome: 'Tarde (13:00 - 18:00)' },
  { id: 'noite', nome: 'Noite (19:00 - 22:00)' },
];

const ZONAS_OPCOES = [
  { id: 'centro', nome: 'Centro' },
  { id: 'zona-norte', nome: 'Zona Norte' },
  { id: 'zona-sul', nome: 'Zona Sul' },
  { id: 'zona-leste', nome: 'Zona Leste' },
  { id: 'zona-oeste', nome: 'Zona Oeste' },
];

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  endereco: {
    cep: string;
    rua: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  veiculo: {
    tipo: string;
    outroTipo?: string;
  };
  seguranca: {
    senhaAtual: string;
    novaSenha: string;
    confirmarSenha: string;
  };
  regioes: {
    raioMaximo: number;
    bairroBase: string;
    bairrosPreferenciais: string[];
  };
}

// Mapeamento de ícones para materiais
const materialIcons: Record<string, React.ReactNode> = {
  'Papel/Papelão': <Archive className="inline-block mr-1 text-yellow-700 h-4 w-4" />, 
  'Plástico': <Package className="inline-block mr-1 text-blue-600 h-4 w-4" />, 
  'Alumínio': <Recycle className="inline-block mr-1 text-gray-500 h-4 w-4" />, 
  'Vidro': <GlassWater className="inline-block mr-1 text-green-700 h-4 w-4" />, 
  'Orgânico': <Leaf className="inline-block mr-1 text-green-500 h-4 w-4" />, 
  'Cobre': <CircleDashed className="inline-block mr-1 text-orange-700 h-4 w-4" />,
  'Latinha': <Recycle className="inline-block mr-1 text-yellow-500 h-4 w-4" />,
  'Eletrônico': <Cpu className="inline-block mr-1 text-purple-700 h-4 w-4" />,
  'Óleo': <Droplets className="inline-block mr-1 text-amber-700 h-4 w-4" />,
  'Pilhas e Baterias': <Battery className="inline-block mr-1 text-red-700 h-4 w-4" />,
  'Lâmpadas Fluorescentes': <Lightbulb className="inline-block mr-1 text-blue-700 h-4 w-4" />,
  'Outros': <TrashIcon className="inline-block mr-1 text-neutral-500 h-4 w-4" />,
};

const CollectorSettings: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('perfil');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [novoBairro, setNovoBairro] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [bairrosSugeridos, setBairrosSugeridos] = useState<string[]>([]);
  const [bairrosFiltrados, setBairrosFiltrados] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>({
    nome: 'João da Silva',
    email: 'joao.silva@email.com',
    telefone: '(11) 99999-9999',
    cpf: '123.456.789-00',
    endereco: {
      cep: '12345-678',
      rua: 'Rua das Flores',
      numero: '123',
      complemento: 'Apto 45',
      bairro: 'Jardim Primavera',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    veiculo: {
      tipo: 'truck',
      outroTipo: ''
    },
    seguranca: {
      senhaAtual: '',
      novaSenha: '',
      confirmarSenha: ''
    },
    regioes: {
      raioMaximo: 10,
      bairroBase: 'Centro',
      bairrosPreferenciais: ['Centro', 'Jardins', 'Vila Mariana']
    }
  });
  const [periodosDisponiveis, setPeriodosDisponiveis] = useState<string[]>([]);
  const [zonasAtuacao, setZonasAtuacao] = useState<string[]>(['Centro']);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreference[]>([
    {
      type: 'email',
      enabled: true,
      categories: {
        collections: true,
        achievements: true,
        promotions: false,
        system: true,
      },
    },
    {
      type: 'push',
      enabled: true,
      categories: {
        collections: true,
        achievements: true,
        promotions: true,
        system: true,
      },
    },
  ]);
  const [diasTrabalho, setDiasTrabalho] = useState<string[]>([]);
  const [materiaisAceitos, setMateriaisAceitos] = useState<string[]>([]);
  const [materiaisDb, setMateriaisDb] = useState<any[]>([]);
  const [materiaisLoading, setMateriaisLoading] = useState(false);
  const { user } = useAuth();
  const userId = user?.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para horários do coletor
  const [horarios, setHorarios] = useState<any[]>([]);
  const [intervalo, setIntervalo] = useState(30);
  const [maxColetas, setMaxColetas] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const handleOpenDeleteModal = () => {
    setShowDeleteModal(true);
    setDeletePassword('');
    setDeleteConfirm('');
    setDeleteError('');
  };

  const handleConfirmDelete = () => {
    if (!deletePassword) {
      setDeleteError('Digite sua senha.');
      return;
    }
    if (deleteConfirm !== 'EXCLUIR') {
      setDeleteError('Digite EXCLUIR para confirmar.');
      return;
    }
    setDeleteError('');
    // Aqui você implementaria a exclusão real
    setShowDeleteModal(false);
    toast({ title: 'Conta excluída (simulação)', description: 'Aqui você faria a exclusão real.' });
  };

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: <User className="h-4 w-4" /> },
    { id: 'veiculo', label: 'Veículo', icon: <Truck className="h-4 w-4" /> },
    { id: 'regiao', label: 'Região', icon: <MapPin className="h-4 w-4" /> },
    { id: 'horarios', label: 'Horários', icon: <Clock className="h-4 w-4" /> },
    { id: 'materiais', label: 'Materiais', icon: <Package className="h-4 w-4" /> },
    { id: 'seguranca', label: 'Segurança', icon: <Shield className="h-4 w-4" /> },
    { id: 'notificacoes', label: 'Notificações', icon: <Bell className="h-4 w-4" /> },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Buscar dados reais do banco ao carregar
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      getCollectorProfile(userId),
      getCollectorAddress(userId),
      getCollectorMaterials(userId),
      getCollectorVehicle(userId),
      getCollectorNeighborhoods(userId)
    ]).then(([profile, address, materials, vehicle, neighborhoods]) => {
      if (!profile || !address || !materials || !neighborhoods) {
        setError('Nenhum dado encontrado para este coletor. Complete o cadastro ou entre em contato com o suporte.');
        setLoading(false);
        return;
      }
      setFormData({
        nome: profile.name || '',
        email: profile.email || '',
        telefone: profile.phone || '',
        cpf: profile.document || '',
        endereco: {
          cep: address?.zip_code || '',
          rua: address?.street || '',
          numero: address?.number || '',
          complemento: address?.complement || '',
          bairro: address?.neighborhood || '',
          cidade: address?.city || '',
          estado: address?.state || ''
        },
        veiculo: {
          tipo: vehicle?.type || '',
          outroTipo: vehicle?.description || ''
        },
        seguranca: {
          senhaAtual: '',
          novaSenha: '',
          confirmarSenha: ''
        },
        regioes: {
          raioMaximo: 10, // ajuste se houver campo real
          bairroBase: address?.neighborhood || '',
          bairrosPreferenciais: neighborhoods || []
        }
      });
      setMateriaisAceitos(Array.isArray(materials) ? materials.map((m: any) => m.material_id) : []);
      setBairrosSugeridos(neighborhoods || []);
      setLoading(false);
    }).catch((err) => {
      setError('Erro ao carregar dados do coletor.');
      setLoading(false);
    });
  }, [userId]);

  // Buscar horários do banco ao carregar a aba de horários
  useEffect(() => {
    if (!userId || activeTab !== 'horarios') return;
    getCollectorSchedules(userId).then((data) => {
      if (data) {
        // Preencher arrays de dias e períodos
        setDiasTrabalho(data.days || []);
        setPeriodosDisponiveis(data.periods || []);
        setIntervalo(data.interval_minutes || 30);
        setMaxColetas(data.max_collections_per_day || 5);
      }
    }).catch(() => {
      // Se não encontrar dados, usar valores padrão
      setDiasTrabalho([]);
      setPeriodosDisponiveis([]);
      setIntervalo(30);
      setMaxColetas(5);
    });
  }, [userId, activeTab]);

  // Buscar materiais do banco de dados
  useEffect(() => {
    const fetchMateriais = async () => {
      setMateriaisLoading(true);
      try {
        const materiaisData = await getAllMaterials();
        setMateriaisDb(materiaisData);
      } catch (error) {
        console.error('Erro ao carregar materiais:', error);
      } finally {
        setMateriaisLoading(false);
      }
    };

    fetchMateriais();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: "Erro ao carregar imagem",
          description: "A imagem deve ter no máximo 5MB",
          variant: "destructive"
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        toast({
          title: "Sucesso",
          description: "Foto de perfil atualizada com sucesso!"
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof FormData] as Record<string, string>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    setHasUnsavedChanges(true);
  };

  // Salvar alterações de perfil, endereço, bairros, materiais e veículo
  const handleSaveProfile = async () => {
    if (!userId) return;
    // Salvar perfil
    await saveCollectorProfile(userId, {
      name: formData.nome,
      phone: formData.telefone,
      document: formData.cpf
    });
    // Salvar endereço principal
    await saveCollectorAddress(userId, {
      street: formData.endereco.rua,
      number: formData.endereco.numero,
      complement: formData.endereco.complemento,
      neighborhood: formData.endereco.bairro,
      city: formData.endereco.cidade,
      state: formData.endereco.estado,
      zip_code: formData.endereco.cep,
      is_main: true
    });
    // Salvar bairros de atuação
    await saveCollectorNeighborhoods(userId, formData.regioes.bairrosPreferenciais);
    // Salvar materiais
    await saveCollectorMaterials(userId, materiaisAceitos.map((mat) => ({
      material_id: mat,
      description: mat === 'Outros' ? '' : undefined // Adapte para pegar descrição se houver campo
    })));
    // Salvar veículo
    await saveCollectorVehicle(
      userId,
      formData.veiculo.tipo,
      formData.veiculo.tipo === 'other' ? formData.veiculo.outroTipo : undefined
    );
    setHasUnsavedChanges(false);
    toast({
      title: 'Sucesso',
      description: 'Dados salvos com sucesso!'
    });
  };

  const handlePasswordChange = () => {
    const { senhaAtual, novaSenha, confirmarSenha } = formData.seguranca;
    
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos de senha",
        variant: "destructive"
      });
      return;
    }

    if (novaSenha !== confirmarSenha) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }

    if (novaSenha.length < 8) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 8 caracteres",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Senha alterada com sucesso!"
    });
    setShowPasswordDialog(false);
  };

  const handleAddBairro = () => {
    const bairroValido = bairrosSugeridos.find(
      b => b.toLowerCase() === novoBairro.trim().toLowerCase()
    );
    if (!bairroValido) {
      toast({
        title: "Erro",
        description: "Selecione um bairro válido da lista.",
        variant: "destructive"
      });
      return;
    }
    if (formData.regioes.bairrosPreferenciais.includes(bairroValido)) {
      toast({
        title: "Erro",
        description: "Este bairro já está na lista",
        variant: "destructive"
      });
      return;
    }
    setFormData(prev => ({
      ...prev,
      regioes: {
        ...prev.regioes,
        bairrosPreferenciais: [...prev.regioes.bairrosPreferenciais, bairroValido]
      }
    }));
    setNovoBairro('');
    toast({
      title: "Sucesso",
      description: "Bairro adicionado com sucesso"
    });
  };

  const handleRemoveBairro = (bairro: string) => {
    setFormData(prev => ({
      ...prev,
      regioes: {
        ...prev.regioes,
        bairrosPreferenciais: prev.regioes.bairrosPreferenciais.filter(b => b !== bairro)
      }
    }));
    toast({
      title: "Sucesso",
      description: "Bairro removido com sucesso"
    });
  };

  const handleTabChange = (value: string) => {
    if (hasUnsavedChanges) {
      if (window.confirm('Você tem alterações não salvas. Deseja continuar?')) {
        setActiveTab(value);
        setHasUnsavedChanges(false);
      }
    } else {
      setActiveTab(value);
    }
  };

  const handlePeriodoToggle = (periodo: string) => {
    setPeriodosDisponiveis(prev =>
      prev.includes(periodo)
        ? prev.filter(p => p !== periodo)
        : [...prev, periodo]
    );
    setHasUnsavedChanges(true);
  };

  const getTabTitle = (tabId: string) => {
    switch (tabId) {
      case 'perfil':
        return 'Informações Pessoais';
      case 'veiculo':
        return 'Configurações do Veículo';
      case 'regiao':
        return 'Áreas de Atuação';
      case 'horarios':
        return 'Disponibilidade';
      case 'materiais':
        return 'Materiais Aceitos';
      case 'seguranca':
        return 'Segurança da Conta';
      case 'notificacoes':
        return 'Preferências de Notificação';
      default:
        return '';
    }
  };

  // Função para buscar bairros baseado no CEP
  const buscarBairrosPorCep = async (cep: string) => {
    try {
      // Aqui você faria a chamada para a API que retorna os bairros da cidade
      // Por enquanto, vamos usar dados mockados
      const bairrosMock = [
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
      ];
      setBairrosSugeridos(bairrosMock);
    } catch (error) {
      console.error('Erro ao buscar bairros:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os bairros. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Efeito para buscar bairros quando o CEP mudar
  useEffect(() => {
    if (formData.endereco.cep && formData.endereco.cep.length === 9) {
      buscarBairrosPorCep(formData.endereco.cep);
    }
  }, [formData.endereco.cep]);

  // Efeito para filtrar bairros quando digitar
  useEffect(() => {
    if (novoBairro) {
      const filtrados = bairrosSugeridos.filter(bairro =>
        bairro.toLowerCase().includes(novoBairro.toLowerCase())
      );
      setBairrosFiltrados(filtrados);
    } else {
      setBairrosFiltrados([]);
    }
  }, [novoBairro, bairrosSugeridos]);

  // Função para salvar horários
  const handleSaveHorarios = async () => {
    if (!userId) return;
    
    await saveCollectorSchedules(userId, {
      days: diasTrabalho,
      periods: periodosDisponiveis,
      max_collections_per_day: maxColetas,
      interval_minutes: intervalo
    });
    
    toast({ title: 'Horários salvos com sucesso!' });
    setHasUnsavedChanges(false);
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando dados do coletor...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4 mb-6 justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold">Configurações</h1>
          </div>
          <LogoutButton />
        </div>

        {/* Mobile Tabs Navigation */}
        <MobileTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          className="mb-6"
        />

        {/* Content */}
        <div className="space-y-6">
          {hasUnsavedChanges && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Você tem alterações não salvas. Clique em "Salvar Alterações" para confirmar.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{getTabTitle(activeTab)}</CardTitle>
            </CardHeader>
            <CardContent>
              {activeTab === 'perfil' && (
                <div className="flex flex-col items-center mb-8">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profileImage || "/placeholder-avatar.jpg"} alt="Foto do perfil" />
                      <AvatarFallback>{formData.nome.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <label 
                      htmlFor="profile-image" 
                      className="absolute bottom-0 right-0 p-1 bg-neutro text-white rounded-full cursor-pointer hover:bg-neutro/90"
                    >
                      <Camera className="h-4 w-4" />
                      <input
                        type="file"
                        id="profile-image"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                  <h2 className="text-2xl font-bold mt-4">{formData.nome}</h2>
                  <p className="text-muted-foreground">Gerenciar Perfil</p>
                </div>
              )}

              <div className="mt-6">
                {activeTab === 'perfil' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="nome">Nome Completo *</Label>
                          <Input
                            id="nome"
                            name="nome"
                            value={formData.nome}
                            onChange={handleFormChange}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            disabled
                            className="bg-muted"
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            Para alterar seu e-mail, entre em contato com o suporte
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="telefone">Telefone *</Label>
                          <Input
                            id="telefone"
                            name="telefone"
                            value={formData.telefone}
                            onChange={handleFormChange}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cpf">CPF *</Label>
                          <Input
                            id="cpf"
                            name="cpf"
                            value={formData.cpf}
                            onChange={handleFormChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="endereco.cep">CEP *</Label>
                          <Input
                            id="endereco.cep"
                            name="endereco.cep"
                            value={formData.endereco.cep}
                            onChange={handleFormChange}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="endereco.rua">Rua *</Label>
                          <Input
                            id="endereco.rua"
                            name="endereco.rua"
                            value={formData.endereco.rua}
                            onChange={handleFormChange}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="endereco.numero">Número *</Label>
                            <Input
                              id="endereco.numero"
                              name="endereco.numero"
                              value={formData.endereco.numero}
                              onChange={handleFormChange}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="endereco.complemento">Complemento</Label>
                            <Input
                              id="endereco.complemento"
                              name="endereco.complemento"
                              value={formData.endereco.complemento}
                              onChange={handleFormChange}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="endereco.bairro">Bairro *</Label>
                          <Input
                            id="endereco.bairro"
                            name="endereco.bairro"
                            value={formData.endereco.bairro}
                            onChange={handleFormChange}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="endereco.cidade">Cidade *</Label>
                            <Input
                              id="endereco.cidade"
                              name="endereco.cidade"
                              value={formData.endereco.cidade}
                              onChange={handleFormChange}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="endereco.estado">Estado *</Label>
                            <Input
                              id="endereco.estado"
                              name="endereco.estado"
                              value={formData.endereco.estado}
                              onChange={handleFormChange}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'veiculo' && (
                  <div className="space-y-6">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Selecione o tipo de veículo que você utiliza para realizar as coletas.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {TRANSPORT_TYPES.map((tipo) => (
                          <div 
                            key={tipo.value} 
                            className={cn(
                              "flex items-center space-x-2 p-4 rounded-lg border cursor-pointer transition-colors",
                              formData.veiculo.tipo === tipo.value 
                                ? "border-neutro bg-neutro/5" 
                                : "border-border hover:border-neutro/50"
                            )}
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                veiculo: {
                                  ...prev.veiculo,
                                  tipo: tipo.value
                                }
                              }));
                              setHasUnsavedChanges(true);
                            }}
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

                      {formData.veiculo.tipo === 'other' && (
                        <div className="space-y-2">
                          <Label htmlFor="outroTipo">Especifique o tipo de veículo</Label>
                          <Input
                            id="outroTipo"
                            name="veiculo.outroTipo"
                            value={formData.veiculo.outroTipo}
                            onChange={handleFormChange}
                            placeholder="Digite o tipo de veículo"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {activeTab === 'horarios' && (
                  <div className="space-y-6">
                    <div className="grid gap-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Dias de Trabalho</h3>
                        <div className="grid grid-cols-7 gap-2">
                          {DIAS_SEMANA.map((dia) => (
                            <div key={dia.id} className="flex flex-col items-center">
                              <Label htmlFor={dia.id} className="text-center">
                                <span className="hidden sm:inline">{dia.label}</span>
                                <span className="sm:hidden">{dia.shortLabel}</span>
                              </Label>
                              <Switch
                                id={dia.id}
                                checked={diasTrabalho.includes(dia.id)}
                                onCheckedChange={() => {
                                  setDiasTrabalho(prev => prev.includes(dia.id)
                                    ? prev.filter(d => d !== dia.id)
                                    : [...prev, dia.id]);
                                  setHasUnsavedChanges(true);
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-2">Períodos Disponíveis</h3>
                        <div className="flex gap-4">
                          {PERIODOS_OPCOES.map(periodo => (
                            <div key={periodo.id} className="flex items-center space-x-2">
                              <Switch
                                id={periodo.id}
                                checked={periodosDisponiveis.includes(periodo.id)}
                                onCheckedChange={() => handlePeriodoToggle(periodo.id)}
                              />
                              <Label htmlFor={periodo.id}>{periodo.nome}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-2">Configurações Adicionais</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="intervalo">Intervalo entre coletas (minutos)</Label>
                            <Input 
                              id="intervalo" 
                              type="number" 
                              className="w-24" 
                              defaultValue="30"
                              value={intervalo}
                              onChange={(e) => setIntervalo(Number(e.target.value))}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="max-coletas">Máximo de coletas por dia</Label>
                            <Input 
                              id="max-coletas" 
                              type="number" 
                              className="w-24" 
                              defaultValue="10"
                              value={maxColetas}
                              onChange={(e) => setMaxColetas(Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'materiais' && (
                  <div className="space-y-6">
                    <div className="grid gap-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Materiais Aceitos</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {materiaisDb.map((material) => {
                            const displayInfo = materialDisplayData[material.identificador];
                            if (!displayInfo) return null;
                            
                            return (
                              <div key={material.id} className="flex items-center space-x-2">
                                <div className="relative">
                                  <Switch
                                    id={material.identificador}
                                    checked={materiaisAceitos.includes(material.identificador)}
                                    onCheckedChange={() => {
                                      setMateriaisAceitos(prev => prev.includes(material.identificador)
                                        ? prev.filter(m => m !== material.identificador)
                                        : [...prev, material.identificador]);
                                      setHasUnsavedChanges(true);
                                    }}
                                  />
                                </div>
                                <Label htmlFor={material.identificador} className="flex items-center">
                                  <displayInfo.icone className={`inline-block mr-1 h-4 w-4 ${displayInfo.cor}`} />
                                  {displayInfo.nome}
                                </Label>
                              </div>
                            );
                          }).filter(Boolean)}
                          <div className="flex items-center space-x-2">
                            <div className="relative">
                              <Switch
                                id="outros"
                                checked={materiaisAceitos.includes('outros')}
                                onCheckedChange={() => {
                                  setMateriaisAceitos(prev => prev.includes('outros')
                                    ? prev.filter(m => m !== 'outros')
                                    : [...prev, 'outros']);
                                  setHasUnsavedChanges(true);
                                }}
                              />
                            </div>
                            <Label htmlFor="outros" className="flex items-center">
                              <Package className="inline-block mr-1 text-neutral-500 h-4 w-4" />
                              Outros
                            </Label>
                          </div>
                        </div>
                      </div>

                      {/* Campo de descrição para "Outros" */}
                      <div className="space-y-2">
                        <Label htmlFor="outros-descricao">Descrição dos Outros Materiais</Label>
                        <Textarea
                          id="outros-descricao"
                          placeholder="Descreva quais outros tipos de materiais você aceita coletar..."
                          className="h-24"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'regiao' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Label>Bairros de Atuação</Label>
                      <div className="flex flex-wrap gap-2">
                        {formData.regioes.bairrosPreferenciais.map((bairro) => (
                          <Badge 
                            key={bairro} 
                            variant="secondary"
                            className="flex items-center gap-1 pr-1"
                          >
                            {bairro}
                            <button
                              onClick={() => {
                                handleRemoveBairro(bairro);
                                setHasUnsavedChanges(true);
                              }}
                              className="ml-1 hover:bg-destructive/20 rounded-full p-1"
                              type="button"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            placeholder="Busque ou digite o nome do bairro"
                            value={novoBairro}
                            onChange={(e) => setNovoBairro(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddBairro();
                                setHasUnsavedChanges(true);
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
                                    setNovoBairro(bairro);
                                    handleAddBairro();
                                    setHasUnsavedChanges(true);
                                  }}
                                >
                                  {bairro}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            handleAddBairro();
                            setHasUnsavedChanges(true);
                          }}
                        >
                          + Adicionar
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Adicione os bairros onde você realiza coletas.
                      </p>
                    </div>
                  </div>
                )}
                
                {activeTab === 'seguranca' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="senhaAtual">Senha Atual</Label>
                        <Input
                          id="senhaAtual"
                          name="seguranca.senhaAtual"
                          type="password"
                          value={formData.seguranca.senhaAtual}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="novaSenha">Nova Senha</Label>
                        <Input
                          id="novaSenha"
                          name="seguranca.novaSenha"
                          type="password"
                          value={formData.seguranca.novaSenha}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                        <Input
                          id="confirmarSenha"
                          name="seguranca.confirmarSenha"
                          type="password"
                          value={formData.seguranca.confirmarSenha}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div className="flex gap-2 justify-end mt-4">
                        <Button 
                          variant="outline"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            seguranca: { senhaAtual: '', novaSenha: '', confirmarSenha: '' }
                          }))}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          className="bg-[#8DC63F] hover:bg-[#8DC63F]/90 text-white"
                          onClick={handlePasswordChange}
                        >
                          Salvar Nova Senha
                        </Button>
                      </div>
                    </div>
                    <div className="border-t mt-8 pt-8">
                      <h3 className="text-lg font-semibold text-destructive mb-2">Excluir Conta</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Esta ação é <span className="font-bold text-destructive">irreversível</span>. Todos os seus dados, histórico, cupons e informações pessoais serão apagados permanentemente.
                        <br />Para confirmar, clique no botão abaixo.
                      </p>
                      <Button variant="destructive" onClick={handleOpenDeleteModal}>
                        Excluir minha conta
                      </Button>
                    </div>
                    <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Excluir Conta</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-destructive font-medium">
                            Tem certeza que deseja excluir sua conta? Esta ação é irreversível.<br />
                            Todos os seus dados serão apagados.
                          </p>
                          <div>
                            <Label htmlFor="delete-password">Senha atual</Label>
                            <Input
                              id="delete-password"
                              type="password"
                              value={deletePassword}
                              onChange={e => setDeletePassword(e.target.value)}
                              placeholder="Digite sua senha"
                            />
                          </div>
                          <div>
                            <Label htmlFor="delete-confirm">Confirmação</Label>
                            <Input
                              id="delete-confirm"
                              value={deleteConfirm}
                              onChange={e => setDeleteConfirm(e.target.value)}
                              placeholder="Digite EXCLUIR para confirmar"
                            />
                          </div>
                          {deleteError && <p className="text-destructive text-sm font-medium">{deleteError}</p>}
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                            Cancelar
                          </Button>
                          <Button variant="destructive" onClick={handleConfirmDelete}>
                            Confirmar exclusão
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
                {activeTab === 'notificacoes' && (
                  <div className="space-y-6">
                    <NotificationsSection
                      preferences={notificationPreferences}
                      onUpdatePreferences={prefs => {
                        setNotificationPreferences(prefs);
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              onClick={handleSaveProfile}
              className="flex items-center gap-2"
              disabled={!hasUnsavedChanges}
            >
              <Save className="h-4 w-4" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CollectorSettings; 