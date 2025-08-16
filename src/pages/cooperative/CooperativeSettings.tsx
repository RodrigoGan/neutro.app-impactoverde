import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { BackButton } from '@/components/ui/back-button';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Info, 
  Upload,
  Users,
  Package,
  Calendar,
  Star,
  Bell,
  ArrowLeft,
  Archive,
  Recycle,
  GlassWater,
  Leaf,
  CircleDashed,
  Battery,
  Lightbulb,
  TrashIcon,
  Cpu,
  Droplets,
  X,
  ChevronLeft
} from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileTabs } from '@/components/ui/mobile-tabs';
import { NotificationsSection } from '@/components/profile/NotificationsSection';
import { NotificationPreference } from '@/types/user';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { materialDisplayData } from '@/config/materialDisplayData';
import { getMaterialIdentificador } from '@/lib/utils';
import { getAllMaterials, saveCollectorNeighborhoods, saveCollectorMaterials } from '@/lib/collectorService';
import LogoutButton from '@/components/ui/LogoutButton';
import { supabase } from '@/lib/supabaseClient';

type SettingsSection = 'perfil' | 'endereco' | 'materiais' | 'plano' | 'seguranca' | 'notificacoes' | 'regiao';

const tabs = [
  { id: 'perfil', label: 'Perfil', icon: <Building2 className="h-4 w-4" /> },
  { id: 'endereco', label: 'Endereço', icon: <MapPin className="h-4 w-4" /> },
  { id: 'materiais', label: 'Materiais', icon: <Package className="h-4 w-4" /> },
  { id: 'regiao', label: 'Região', icon: <MapPin className="h-4 w-4" /> },
  { id: 'plano', label: 'Plano', icon: <Star className="h-4 w-4" /> },
  { id: 'notificacoes', label: 'Notificações', icon: <Bell className="h-4 w-4" /> },
  { id: 'seguranca', label: 'Segurança', icon: <Lock className="h-4 w-4" /> },
];

const getTabTitle = (tabId: SettingsSection) => {
  switch (tabId) {
    case 'perfil':
      return 'Perfil da Cooperativa';
    case 'endereco':
      return 'Endereço';
    case 'materiais':
      return 'Materiais Aceitos';
    case 'plano':
      return 'Plano e Cobrança';
    case 'notificacoes':
      return 'Notificações';
    case 'seguranca':
      return 'Segurança da Conta';
    case 'regiao':
      return 'Região de Atuação';
    default:
      return '';
  }
};

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

const MATERIAIS_DISPONIVEIS = [
  'Papel/Papelão',
  'Plástico',
  'Alumínio',
  'Vidro',
  'Orgânico',
  'Cobre',
  'Latinha',
  'Eletrônico',
  'Óleo',
  'Pilhas e Baterias',
  'Lâmpadas Fluorescentes',
];

const CooperativeSettings: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<SettingsSection>('perfil');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [hasUnsavedMaterials, setHasUnsavedMaterials] = useState(false);
  const [hasUnsavedNeighborhoods, setHasUnsavedNeighborhoods] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [address, setAddress] = useState({
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    referencia: '',
    bairro: '',
    cidade: '',
    estado: ''
  });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [bairro, setBairro] = useState('Centro');
  const [changePlanPassword, setChangePlanPassword] = useState('');
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreference[]>([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [outrosDescricao, setOutrosDescricao] = useState('');
  
  // Log para debug do estado outrosDescricao
  useEffect(() => {
    console.log('📝 [CooperativeSettings] Estado outrosDescricao mudou para:', outrosDescricao);
  }, [outrosDescricao]);
  const [bairros, setBairros] = useState<string[]>([]);
  const [novoBairro, setNovoBairro] = useState('');
  const [materiaisDb, setMateriaisDb] = useState<any[]>([]);
  const [materiaisLoading, setMateriaisLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('Carbon Free');

  // Estados para exclusão de conta
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Busca userId igual ao dashboard
  let userId = '4';
  if (window.history.state && window.history.state.usr && window.history.state.usr.userId) {
    userId = window.history.state.usr.userId.toString();
  } else {
    const params = new URLSearchParams(location.search);
    userId = params.get('userId') || '4';
  }
  
  // Log para debug
  console.log('🔍 [CooperativeSettings] userId obtido:', userId);
  console.log('🔍 [CooperativeSettings] window.history.state:', window.history.state);
  console.log('🔍 [CooperativeSettings] location.search:', location.search);
  
  // Hook para buscar dados reais do usuário
  const { userProfile: userProfileData, loading, error: profileError } = useUserProfile(userId);
  
  // Estado local para o usuário (para permitir edição)
  const [user, setUser] = useState(userProfileData);
  
  // Log para debug
  console.log('🔍 [CooperativeSettings] useUserProfile result:', { user, loading, profileError });

  // Buscar materiais do banco de dados
  useEffect(() => {
    const fetchMateriais = async () => {
      setMateriaisLoading(true);
      try {
        console.log('🔄 [CooperativeSettings] Iniciando busca de materiais...');
        const materiaisData = await getAllMaterials();
        console.log('✅ [CooperativeSettings] Materiais carregados:', materiaisData);
        console.log('✅ [CooperativeSettings] Quantidade de materiais:', materiaisData?.length || 0);
        setMateriaisDb(materiaisData);
      } catch (error) {
        console.error('❌ [CooperativeSettings] Erro ao carregar materiais:', error);
      } finally {
        setMateriaisLoading(false);
      }
    };

    fetchMateriais();
  }, []);

  // Atualizar estado local quando dados do perfil mudarem
  useEffect(() => {
    if (userProfileData) {
      setUser(userProfileData);
    }
  }, [userProfileData]);

  // Carregar dados do usuário quando disponível
  useEffect(() => {
    if (user) {
      console.log('✅ [CooperativeSettings] Dados do usuário carregados:', user);
      console.log('🏠 [CooperativeSettings] Endereços:', user.addresses);
      console.log('📦 [CooperativeSettings] Materiais:', user.materials);
      console.log('🏘️ [CooperativeSettings] Bairros:', user.neighborhoods);
      
      // Log detalhado dos dados
      if (user.addresses && user.addresses.length > 0) {
        console.log('🏠 [CooperativeSettings] Detalhes do endereço:', JSON.stringify(user.addresses[0], null, 2));
      }
      if (user.materials && user.materials.length > 0) {
        console.log('📦 [CooperativeSettings] Detalhes dos materiais:', JSON.stringify(user.materials, null, 2));
      }
      if (user.neighborhoods && user.neighborhoods.length > 0) {
        console.log('🏘️ [CooperativeSettings] Detalhes dos bairros:', JSON.stringify(user.neighborhoods, null, 2));
      }
      
      // Carregar notificações se disponível (apenas na primeira vez)
      if (user.notificationPreferences && user.notificationPreferences.length > 0 && notificationPreferences.length === 0) {
        console.log('🔔 [CooperativeSettings] Notificações carregadas:', user.notificationPreferences);
        setNotificationPreferences(user.notificationPreferences);
      }
      
      // Carregar endereço se disponível
      if (user.addresses && user.addresses.length > 0) {
        const mainAddress = user.addresses.find(addr => addr.isMain) || user.addresses[0];
        console.log('🏠 [CooperativeSettings] Endereço principal:', mainAddress);
        setAddress({
          cep: mainAddress.zipCode || '',
          logradouro: mainAddress.street || '',
          numero: mainAddress.number || '',
          complemento: mainAddress.complement || '',
          referencia: '', // Campo não existe no tipo Address
          bairro: mainAddress.neighborhood || '',
          cidade: mainAddress.city || '',
          estado: mainAddress.state || ''
        });
      }
      
      // Carregar materiais selecionados se disponível
      if (user.materials && user.materials.length > 0) {
        const materialNames = user.materials.map(material => material.name);
        console.log('📦 [CooperativeSettings] Nomes dos materiais:', materialNames);
        setSelectedMaterials(materialNames);
        
        // Carregar descrição de "Outros" se existir
        const outrosMaterial = user.materials.find(material => material.name === 'Outros');
        if (outrosMaterial && (outrosMaterial as any).description) {
          console.log('📦 [CooperativeSettings] Descrição de Outros encontrada:', (outrosMaterial as any).description);
          setOutrosDescricao((outrosMaterial as any).description);
        } else {
          console.log('📦 [CooperativeSettings] Nenhuma descrição de Outros encontrada');
          setOutrosDescricao('');
        }
      } else {
        console.log('📦 [CooperativeSettings] Nenhum material encontrado');
        setSelectedMaterials([]);
        setOutrosDescricao('');
      }
      
      // Carregar bairros se disponível
      if (user.neighborhoods && user.neighborhoods.length > 0) {
        const bairroNames = user.neighborhoods.map(neighborhood => neighborhood.name);
        console.log('🏘️ [CooperativeSettings] Nomes dos bairros:', bairroNames);
        setBairros(bairroNames);
      } else {
        console.log('🏘️ [CooperativeSettings] Nenhum bairro encontrado');
        setBairros([]);
      }
    }
  }, [user]);

  // Planos disponíveis para cooperativas
  const availablePlans = [
    { name: 'Eco+', price: 'Gratuito' },
    { name: 'Impacto Verde', price: 'R$ 99,90/mês' },
    { name: 'Carbon Free', price: 'R$ 249,90/mês' }
  ];

  // Função para determinar o plano
  const getUserPlan = () => {
    // Mock - substituir por lógica real
    return { name: 'Carbon Free', price: 'R$ 249,90/mês' };
  };
  const userPlan = getUserPlan();

  // Se não encontrar o usuário, exibe alerta
  if (loading) {
    console.log('🔄 [CooperativeSettings] Carregando dados...');
    return (
      <Layout>
        <div className="container max-w-[600px] py-8 px-4">
          <BackButton />
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Carregando...</h2>
            <p className="text-muted-foreground">Carregando dados da cooperativa.</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (profileError || !user) {
    console.log('❌ [CooperativeSettings] Erro ou usuário não encontrado:', { profileError, user });
    return (
      <Layout>
        <div className="container max-w-[600px] py-8 px-4">
          <BackButton />
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Configurações não encontradas</h2>
            <p className="text-muted-foreground mb-6">
              Não foi possível carregar os dados da cooperativa.<br />
              {profileError ? `Erro: ${profileError}` : ''}
              Acesse as configurações a partir do dashboard para garantir a exibição correta do plano e dos dados.
            </p>
            <Button variant="default" onClick={() => navigate('/dashboard/standard')}>Ir para o Dashboard</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    if (!user) return;
    
    // Atualizar o estado do usuário
    let updatedUser = { ...user };
    
    // Lidar com campos aninhados (ex: representative.name)
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      
      // Garantir que o objeto pai existe
      const parentObj = updatedUser[parent as keyof typeof user] || {};
      
      updatedUser = {
        ...updatedUser,
        [parent]: {
          ...parentObj,
          [child]: value
        }
      };
      
      console.log(`📝 [CooperativeSettings] Campo aninhado ${field} alterado:`, {
        parent,
        child,
        value,
        parentObj,
        updatedParent: updatedUser[parent as keyof typeof user]
      });
    } else {
      updatedUser = { ...updatedUser, [field]: value };
      console.log(`📝 [CooperativeSettings] Campo simples ${field} alterado para: ${value}`);
    }
    
    // Atualizar o estado local do usuário
    setUser(updatedUser);
    setHasUnsavedChanges(true);
  };

  const handleNotificationChange = async (preference: NotificationPreference) => {
    try {
      console.log('🔔 [CooperativeSettings] Salvando notificação:', preference);
      console.log('🔔 [CooperativeSettings] userId:', userId);
      
      // Verificar se temos um userId válido
      if (!userId) {
        console.error('❌ [CooperativeSettings] User ID não encontrado');
        return;
      }
      
      console.log('🔔 [CooperativeSettings] Executando UPSERT...');
      
      // Executar UPSERT na tabela user_notification_settings (igual ao usuário comum)
      const { data, error } = await supabase
        .from('user_notification_settings')
        .upsert({
          user_id: userId,
          channel: preference.type,
          enabled: preference.enabled,
          collections: preference.categories.collections,
          achievements: preference.categories.achievements,
          promotions: preference.categories.promotions,
          system: preference.categories.system,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,channel'
        })
        .select();

      if (error) {
        console.error('❌ [CooperativeSettings] Erro no UPSERT:', error);
        console.error('❌ [CooperativeSettings] Código do erro:', error.code);
        console.error('❌ [CooperativeSettings] Mensagem do erro:', error.message);
        throw error;
      }

      console.log('✅ [CooperativeSettings] Notificação salva com sucesso no banco:', data);
    } catch (error) {
      console.error('❌ [CooperativeSettings] Erro ao salvar notificação:', error);
      // Não reverter a mudança, apenas mostrar erro
      // O usuário pode tentar novamente
    }
  };



  const handleSavePerfil = async () => {
    try {
      console.log('👤 [CooperativeSettings] Salvando perfil:', user);
      console.log('👤 [CooperativeSettings] Dados do representante:', user?.representative);
      
      if (!user) {
        throw new Error('Dados do usuário não encontrados');
      }
      
      // 1. Salvar dados básicos do usuário na tabela users
      const { error: userError } = await supabase
        .from('users')
        .update({
          name: user.name,
          phone: user.phone
        })
        .eq('id', user.id);
      
      if (userError) {
        console.error('❌ [CooperativeSettings] Erro ao salvar dados do usuário:', userError);
        throw userError;
      }
      
      console.log('✅ [CooperativeSettings] Dados do usuário salvos com sucesso');
      
      // 2. Salvar dados do representante na tabela representatives
      if (user.representative) {
        console.log('👤 [CooperativeSettings] Salvando dados do representante:', user.representative);
        
        // Verificar se já existe um representante para este usuário
        const { data: existingRepresentative } = await supabase
          .from('representatives')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        const representativeData = {
          user_id: user.id,
          name: user.representative.name || '',
          cpf: user.representative.cpf || '',
          email: user.representative.email || '',
          phone: user.representative.phone || '',
          position: user.representative.position || 'Representante',
          avatar_url: user.representative.avatar_url || null
        };
        
        console.log('👤 [CooperativeSettings] Dados do representante para salvar:', representativeData);
        
        let representativeError;
        
        if (existingRepresentative) {
          // Atualizar representante existente
          const { error } = await supabase
            .from('representatives')
            .update(representativeData)
            .eq('user_id', user.id);
          representativeError = error;
          console.log('👤 [CooperativeSettings] Atualizando representante existente');
        } else {
          // Inserir novo representante
          const { error } = await supabase
            .from('representatives')
            .insert(representativeData);
          representativeError = error;
          console.log('👤 [CooperativeSettings] Inserindo novo representante');
        }
        
        if (representativeError) {
          console.error('❌ [CooperativeSettings] Erro ao salvar representante:', representativeError);
          throw representativeError;
        }
        
        console.log('✅ [CooperativeSettings] Dados do representante salvos com sucesso');
      } else {
        console.log('👤 [CooperativeSettings] Nenhum dado do representante para salvar');
      }
      
      console.log('✅ [CooperativeSettings] Perfil salvo com sucesso');
      setHasUnsavedChanges(false);
      toast({
        title: 'Sucesso',
        description: 'Perfil salvo com sucesso!'
      });
    } catch (error) {
      console.error('❌ [CooperativeSettings] Erro ao salvar perfil:', error);
      toast({
        title: 'Erro',
        description: `Erro ao salvar perfil: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: 'destructive'
      });
    }
  };

  const handleSaveEndereco = async () => {
    try {
      console.log('🏠 [CooperativeSettings] Salvando endereço:', address);
      
      if (!user.addresses || user.addresses.length === 0) {
        throw new Error('Nenhum endereço encontrado para atualizar');
      }
      
      const mainAddress = user.addresses.find(addr => addr.isMain) || user.addresses[0];
      
      console.log('🏠 [CooperativeSettings] Dados para atualizar:', {
        logradouro: address.logradouro,
        numero: address.numero,
        complemento: address.complemento,
        bairro: address.bairro,
        cidade: address.cidade,
        estado: address.estado,
        cep: address.cep
      });
      
      const { error: addressError } = await supabase
        .from('addresses')
        .update({
          logradouro: address.logradouro,
          numero: address.numero,
          complemento: address.complemento,
          bairro: address.bairro,
          cidade: address.cidade,
          estado: address.estado,
          cep: address.cep
        })
        .eq('id', mainAddress.id);
      
      if (addressError) {
        console.error('❌ [CooperativeSettings] Erro ao salvar endereço:', addressError);
        console.error('❌ [CooperativeSettings] Detalhes do erro:', {
          code: addressError.code,
          message: addressError.message,
          details: addressError.details,
          hint: addressError.hint
        });
        throw addressError;
      }
      
      console.log('✅ [CooperativeSettings] Endereço salvo com sucesso');
      setHasUnsavedChanges(false);
      toast({
        title: 'Sucesso',
        description: 'Endereço salvo com sucesso!'
      });
    } catch (error) {
      console.error('❌ [CooperativeSettings] Erro ao salvar endereço:', error);
      toast({
        title: 'Erro',
        description: `Erro ao salvar endereço: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: 'destructive'
      });
    }
  };

  const handleSaveBairros = async () => {
    try {
      console.log('🏘️ [CooperativeSettings] Salvando bairros:', bairros);
      
      // Usar a mesma função do coletor individual
      await saveCollectorNeighborhoods(userId, bairros);
      
      console.log('✅ [CooperativeSettings] Bairros salvos com sucesso');
      setHasUnsavedNeighborhoods(false);
      toast({
        title: 'Sucesso',
        description: 'Bairros salvos com sucesso!'
      });
    } catch (error) {
      console.error('❌ [CooperativeSettings] Erro ao salvar bairros:', error);
      toast({
        title: 'Erro',
        description: `Erro ao salvar bairros: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: 'destructive'
      });
    }
  };

  const handleSaveMateriais = async () => {
    try {
      console.log('📦 [CooperativeSettings] Salvando materiais:', selectedMaterials);
      
      // Mapear nomes dos materiais para identificadores
      const materiaisParaSalvar = selectedMaterials.map((materialName) => {
        // Mapear nomes para identificadores
        const materialMap: Record<string, string> = {
          'Alumínio': 'aluminio',
          'Cobre': 'cobre',
          'Eletrônico': 'eletronico',
          'Latinha': 'latinha',
          'Lâmpadas': 'lampadas',
          'Metal': 'metal',
          'Óleo': 'oleo',
          'Orgânico': 'organico',
          'Outros': 'outros',
          'Papel/Papelão': 'papel',
          'Pilhas e Baterias': 'pilhas',
          'Plástico': 'plastico',
          'Vidro': 'vidro'
        };
        
        const identificador = materialMap[materialName];
        if (!identificador) {
          throw new Error(`Material não mapeado: ${materialName}`);
        }
        
        return {
          material_id: identificador,
          description: materialName === 'Outros' ? outrosDescricao : undefined
        };
      });
      
      console.log('📦 [CooperativeSettings] materiaisParaSalvar:', materiaisParaSalvar);
      
      // Usar a mesma função do coletor individual
      await saveCollectorMaterials(userId, materiaisParaSalvar);
      
      console.log('✅ [CooperativeSettings] Materiais salvos com sucesso');
      setHasUnsavedMaterials(false);
      toast({
        title: 'Sucesso',
        description: 'Materiais salvos com sucesso!'
      });
    } catch (error) {
      console.error('❌ [CooperativeSettings] Erro ao salvar materiais:', error);
      toast({
        title: 'Erro',
        description: `Erro ao salvar materiais: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: 'destructive'
      });
    }
  };

  const handleSaveChanges = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setSaveError('');
    
    try {
      console.log('💾 [CooperativeSettings] Salvando alterações...');
      
      // Salvar dados básicos do usuário
      const { error: userError } = await supabase
        .from('users')
        .update({
          name: user.name,
          phone: user.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (userError) {
        console.error('❌ [CooperativeSettings] Erro ao salvar dados do usuário:', userError);
        throw userError;
      }
      

      

      
      console.log('✅ [CooperativeSettings] Alterações salvas com sucesso!');
    setHasUnsavedChanges(false);
      
      // Recarregar dados do usuário
      // window.location.reload();
      
    } catch (error) {
      console.error('❌ [CooperativeSettings] Erro ao salvar:', error);
      setSaveError(error instanceof Error ? error.message : 'Erro ao salvar alterações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Aqui você implementaria a lógica para atualizar a imagem
    }
  };

  const handleRepresentativeImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      console.log('📸 [CooperativeSettings] Iniciando upload da imagem do representante');
      
      // Upload da imagem para o Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-representative-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('lovable-uploads')
        .upload(filePath, file);

      if (uploadError) {
        console.error('❌ [CooperativeSettings] Erro no upload do representante:', uploadError);
        throw uploadError;
      }

      // Obter URL pública da imagem
      const { data: { publicUrl } } = supabase.storage
        .from('lovable-uploads')
        .getPublicUrl(filePath);

      console.log('✅ [CooperativeSettings] Imagem do representante enviada com sucesso:', publicUrl);

      // Atualizar o avatar do representante na tabela representatives
      const { error: updateError } = await supabase
        .from('representatives')
        .update({ 
          avatar_url: publicUrl
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('❌ [CooperativeSettings] Erro ao atualizar avatar do representante:', updateError);
        throw updateError;
      }

      // Atualizar o estado local
      setUser({ 
        ...user, 
        representative: {
          ...user.representative,
          avatar_url: publicUrl
        }
      });
      setHasUnsavedChanges(false);

      console.log('✅ [CooperativeSettings] Avatar do representante atualizado com sucesso');
      toast({
        title: 'Sucesso',
        description: 'Imagem do representante atualizada com sucesso!'
      });

    } catch (error) {
      console.error('❌ [CooperativeSettings] Erro ao processar imagem do representante:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar imagem do representante',
        variant: 'destructive'
      });
    }
  };

  const handleAddressChange = (field: keyof typeof address, value: string) => {
    setAddress(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    handleAddressChange('cep', cep);
    
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setAddress(prev => ({
            ...prev,
            logradouro: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf
          }));
          setHasUnsavedChanges(true);
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  // Filtra planos disponíveis para troca (não mostra o atual)
  const availablePlansFiltered = availablePlans.filter(plan => plan.name !== currentPlan);

  const handleChangePlan = () => {
    setShowUpgradeModal(true);
    setChangePlanPassword('');
  };
  const handleConfirmChangePlan = () => {
    if (!selectedPlan || !changePlanPassword) return;
    setCurrentPlan(selectedPlan);
    setShowUpgradeModal(false);
    setSelectedPlan('');
    setChangePlanPassword('');
  };

  const handleCancelPlan = () => setShowCancelModal(true);
  const handleConfirmUpgrade = () => {
    setIsLoading(true);
    setSaveError('');
    setTimeout(() => {
      setIsLoading(false);
      setShowUpgradeModal(false);
      // Aqui você pode atualizar o plano no estado local se desejar
    }, 1000);
  };
  const handleConfirmCancel = () => {
    if (!password) {
      setSaveError('Por favor, insira sua senha');
      return;
    }
    setIsLoading(true);
    setSaveError('');
    setTimeout(() => {
      setIsLoading(false);
      setShowCancelModal(false);
      setPassword('');
    }, 1000);
  };

  const handleSaveNewPassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) return;
    // Aqui você pode adicionar validação real
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordForm(false);
  };

  const handleMaterialToggle = (material: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(material)
        ? prev.filter((m) => m !== material)
        : [...prev, material]
    );
    setHasUnsavedMaterials(true);
  };

  const handleAddBairro = () => {
    if (novoBairro.trim() && !bairros.includes(novoBairro.trim())) {
      setBairros([...bairros, novoBairro.trim()]);
      setNovoBairro('');
      setHasUnsavedNeighborhoods(true);
    }
  };

  const handleRemoveBairro = (bairro: string) => {
    setBairros(bairros.filter(b => b !== bairro));
    setHasUnsavedNeighborhoods(true);
  };

  const handleOpenDeleteModal = () => {
    setShowDeleteModal(true);
    setDeletePassword('');
    setDeleteConfirm('');
    setDeleteError('');
  };
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletePassword('');
    setDeleteConfirm('');
    setDeleteError('');
  };
  const handleDeleteAccount = () => {
    if (!deletePassword) {
      setDeleteError('Digite sua senha.');
      return;
    }
    if (deleteConfirm !== 'EXCLUIR') {
      setDeleteError('Digite EXCLUIR para confirmar.');
      return;
    }
    setDeleteError('');
    // Aqui entraria a lógica real de exclusão
    // Por enquanto, só fecha o modal
    setShowDeleteModal(false);
    alert('Conta excluída (simulação).');
  };

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

        <MobileTabs
          tabs={tabs}
          activeTab={activeSection}
          onTabChange={tab => setActiveSection(tab as SettingsSection)}
          className="mb-6"
        />

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-6 pt-6">
              <h2 className="text-lg font-semibold mb-2">{getTabTitle(activeSection)}</h2>
            </div>
            <div className="px-6 pb-6">
              {/* Avatar, nome e subtítulo só na aba de perfil */}
              {activeSection === 'perfil' && (
                <div className="flex flex-col items-center mb-8">
                  <div className="relative">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={user?.avatar} alt="Logo da Cooperativa" />
                      <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white text-2xl font-bold">
                        {user?.name?.charAt(0)?.toUpperCase() || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <label 
                      htmlFor="avatar-upload" 
                      className="absolute bottom-4 right-0 p-1 bg-white rounded-full border cursor-pointer hover:bg-gray-50"
                    >
                      <Upload className="h-4 w-4" />
                      <input
                        id="avatar-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                  <h2 className="text-2xl font-bold">{user?.name}</h2>
                  <p className="text-muted-foreground">Gerenciar Perfil da Cooperativa</p>
                </div>
              )}

              {/* Conteúdo das abas (mantendo todos os dados e funcionalidades) */}
              {activeSection === 'perfil' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Nome da Cooperativa</label>
                      <Input 
                        value={user?.name || 'Cooperativa'}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">E-mail</label>
                      <div className="w-full p-2 bg-gray-50 border rounded-md text-muted-foreground">
                        {user?.email || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Telefone</label>
                      <Input 
                        value={user?.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">CNPJ</label>
                      <div className="w-full p-2 bg-gray-50 border rounded-md text-muted-foreground">
                        {user?.document || '-'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Seção Dados do Representante */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Dados do Representante</h3>
                    
                    {/* Avatar do Representante */}
                    <div className="flex flex-col items-center mb-6">
                      <div className="relative">
                        <Avatar className="h-20 w-20 mb-3">
                          <AvatarImage src={user?.representative?.avatar_url} alt="Foto do Representante" />
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-lg font-bold">
                            {user?.representative?.name?.charAt(0)?.toUpperCase() || 'R'}
                          </AvatarFallback>
                        </Avatar>
                        <label 
                          htmlFor="representative-avatar-upload" 
                          className="absolute bottom-2 right-0 p-1 bg-white rounded-full border cursor-pointer hover:bg-gray-50"
                        >
                          <Upload className="h-3 w-3" />
                          <input
                            id="representative-avatar-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleRepresentativeImageChange}
                          />
                        </label>
                      </div>
                      <p className="text-sm text-muted-foreground">Foto do Representante</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Nome do Representante</label>
                        <Input 
                          value={user?.representative?.name || ''}
                          onChange={(e) => handleInputChange('representative.name', e.target.value)}
                          className="w-full"
                          placeholder="Nome completo do representante"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">CPF do Representante</label>
                        <Input 
                          value={user?.representative?.cpf || ''}
                          onChange={(e) => handleInputChange('representative.cpf', e.target.value)}
                          className="w-full"
                          placeholder="000.000.000-00"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Telefone do Representante</label>
                        <Input 
                          value={user?.representative?.phone || ''}
                          onChange={(e) => handleInputChange('representative.phone', e.target.value)}
                          className="w-full"
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">E-mail do Representante</label>
                        <Input 
                          value={user?.representative?.email || ''}
                          onChange={(e) => handleInputChange('representative.email', e.target.value)}
                          className="w-full"
                          placeholder="email@exemplo.com"
                        />
                      </div>
                    </div>
                  </div>
                  {saveError && (
                    <Alert className="mt-4 border-red-200 bg-red-50">
                      <AlertDescription className="text-red-700">{saveError}</AlertDescription>
                    </Alert>
                  )}
                  {hasUnsavedChanges && (
                    <Alert className="mt-4">
                      <AlertDescription>Você tem alterações não salvas.</AlertDescription>
                    </Alert>
                  )}
                  <div className="flex gap-2 justify-end mt-4">
                    <Button variant="outline" onClick={() => setHasUnsavedChanges(false)} disabled={isLoading}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSavePerfil} 
                      disabled={!hasUnsavedChanges || isLoading}
                      className="bg-neutro hover:bg-neutro/90"
                    >
                      {isLoading ? 'Salvando...' : 'Salvar Perfil'}
                    </Button>
                  </div>
                </div>
              )}
              {activeSection === 'endereco' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">CEP</label>
                      <Input 
                        value={address.cep}
                        onChange={handleCepChange}
                        className="w-full"
                        maxLength={9}
                        placeholder="00000-000"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Logradouro</label>
                      <Input 
                        value={address.logradouro}
                        onChange={e => handleAddressChange('logradouro', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-sm font-medium mb-1 block">Número</label>
                        <Input 
                          value={address.numero}
                          onChange={e => handleAddressChange('numero', e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-medium mb-1 block">Complemento</label>
                        <Input 
                          value={address.complemento}
                          onChange={e => handleAddressChange('complemento', e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Referência</label>
                      <Input 
                        value={address.referencia}
                        onChange={e => handleAddressChange('referencia', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-sm font-medium mb-1 block">Bairro</label>
                        <Input 
                          value={address.bairro}
                          onChange={e => handleAddressChange('bairro', e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-medium mb-1 block">Cidade</label>
                        <Input 
                          value={address.cidade}
                          onChange={e => handleAddressChange('cidade', e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-medium mb-1 block">Estado</label>
                        <Input 
                          value={address.estado}
                          onChange={e => handleAddressChange('estado', e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                  {saveError && (
                    <Alert className="mt-4 border-red-200 bg-red-50">
                      <AlertDescription className="text-red-700">{saveError}</AlertDescription>
                    </Alert>
                  )}
                  {hasUnsavedChanges && (
                    <Alert className="mt-4">
                      <AlertDescription>Você tem alterações não salvas.</AlertDescription>
                    </Alert>
                  )}
                  <div className="flex gap-2 justify-end mt-4">
                    <Button variant="outline" onClick={() => setHasUnsavedChanges(false)} disabled={isLoading}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSaveEndereco} 
                      disabled={!hasUnsavedChanges || isLoading}
                      className="bg-neutro hover:bg-neutro/90"
                    >
                      {isLoading ? 'Salvando...' : 'Salvar Endereço'}
                    </Button>
                  </div>
                </div>
              )}
              {activeSection === 'materiais' && (
                <div className="space-y-6">
                  {console.log('📦 [CooperativeSettings] Renderizando aba materiais')}
                  {console.log('📦 [CooperativeSettings] materiaisDb:', materiaisDb)}
                  {console.log('📦 [CooperativeSettings] selectedMaterials:', selectedMaterials)}
                  <div className="grid gap-4">
                    <div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {materiaisDb.map((material) => {
                          if (!material) {
                            console.log('⚠️ [CooperativeSettings] Material undefined encontrado');
                            return null;
                          }
                          console.log('📦 [CooperativeSettings] Processando material:', material);
                          console.log('📦 [CooperativeSettings] material.identificador:', material.identificador);
                          console.log('📦 [CooperativeSettings] materialDisplayData keys:', Object.keys(materialDisplayData));
                          
                          const displayInfo = materialDisplayData[material.identificador];
                          if (!displayInfo) {
                            console.log('⚠️ [CooperativeSettings] DisplayInfo não encontrado para:', material.identificador);
                            return null;
                          }
                          const isSelected = selectedMaterials.includes(material.name);
                          console.log(`📦 [CooperativeSettings] Material: ${material.name}, Selecionado: ${isSelected}`);
                          return (
                            <div key={material.id} className="flex items-center space-x-2">
                              <div className="relative">
                                <Switch 
                                  id={material.identificador} 
                                  checked={isSelected}
                                  onCheckedChange={() => handleMaterialToggle(material.name)}
                                />
                              </div>
                              <Label htmlFor={material.identificador} className="flex items-center">
                                <displayInfo.icone className={`inline-block mr-1 h-4 w-4 ${displayInfo.cor}`} />
                                {displayInfo.nome}
                              </Label>
                            </div>
                          );
                        }).filter(Boolean)}
                        {/* Só renderiza manualmente se não vier do banco */}
                        {!materiaisDb.some(mat => mat.identificador === 'outros') && (
                          <div className="flex items-center space-x-2">
                            <div className="relative">
                              <Switch 
                                id="outros" 
                                checked={selectedMaterials.includes('Outros')}
                                onCheckedChange={() => handleMaterialToggle('Outros')}
                              />
                            </div>
                            <Label htmlFor="outros" className="flex items-center">
                              <Package className="inline-block mr-1 text-neutral-500 h-4 w-4" />
                              Outros
                            </Label>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Campo de descrição para "Outros" */}
                    {selectedMaterials.includes('Outros') && (
                    <div className="space-y-2">
                      <Label htmlFor="outros-descricao">Descrição dos Outros Materiais</Label>
                      {console.log('📝 [CooperativeSettings] Renderizando campo Outros, valor:', outrosDescricao)}
                      <Textarea
                        id="outros-descricao"
                          value={outrosDescricao}
                          onChange={(e) => {
                            console.log('📝 [CooperativeSettings] Alterando descrição de Outros para:', e.target.value);
                            setOutrosDescricao(e.target.value);
                          }}
                        placeholder="Descreva quais outros tipos de materiais você aceita coletar..."
                        className="h-24"
                      />
                    </div>
                    )}
                  </div>
                  {/* Botões de ação para materiais */}
                  <div className="flex gap-2 justify-end mt-6">
                    <Button 
                      onClick={handleSaveMateriais}
                      className="bg-neutro hover:bg-neutro/90"
                      disabled={!hasUnsavedMaterials}
                    >
                      Salvar Materiais
                    </Button>
                  </div>
                </div>
              )}
              {activeSection === 'plano' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Plano Atual</label>
                      <div className="w-full p-2 bg-gray-50 border rounded-md text-muted-foreground">
                        {currentPlan}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Valor</label>
                      <div className="w-full p-2 bg-gray-50 border rounded-md text-muted-foreground">
                        {availablePlans.find(p => p.name === currentPlan)?.price}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Status</label>
                      <Badge variant="outline" className="text-green-700 bg-green-100 border-green-200">Ativo</Badge>
                    </div>
                    <div className="flex gap-2 justify-end mt-4">
                      <Button variant="outline" onClick={handleChangePlan}>Mudar de Plano</Button>
                      <Button variant="outline" onClick={handleCancelPlan}>Cancelar Plano</Button>
                    </div>
                  </div>
                  {saveError && (
                    <Alert className="mt-4 border-red-200 bg-red-50">
                      <AlertDescription className="text-red-700">{saveError}</AlertDescription>
                    </Alert>
                  )}
                  {hasUnsavedChanges && (
                    <Alert className="mt-4">
                      <AlertDescription>Você tem alterações não salvas.</AlertDescription>
                    </Alert>
                  )}
                  <div className="flex gap-2 justify-end mt-4">
                    <Button variant="outline" onClick={() => setHasUnsavedChanges(false)} disabled={isLoading}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSaveChanges} 
                      disabled={!hasUnsavedChanges || isLoading}
                      className="bg-neutro hover:bg-neutro/90"
                    >
                      {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </div>
                </div>
              )}
              {activeSection === 'notificacoes' && (
                <NotificationsSection
                  preferences={notificationPreferences}
                  onUpdatePreferences={setNotificationPreferences}
                  onNotificationChange={handleNotificationChange}
                />
              )}
              {activeSection === 'seguranca' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Senha Atual</label>
                      <Input
                        type="password"
                        placeholder="Digite sua senha atual"
                        className="w-full"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Nova Senha</label>
                      <Input
                        type="password"
                        placeholder="Digite a nova senha"
                        className="w-full"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Confirmar Nova Senha</label>
                      <Input
                        type="password"
                        placeholder="Confirme a nova senha"
                        className="w-full"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 justify-end mt-4">
                      <Button variant="outline" onClick={() => { setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}>Cancelar</Button>
                      <Button variant="default" onClick={handleSaveNewPassword} disabled={!currentPassword || !newPassword || !confirmPassword}>Salvar Nova Senha</Button>
                    </div>
                    {/* Seção de exclusão de conta padronizada */}
                    <div className="border-t mt-8 pt-8">
                      <h3 className="text-lg font-semibold text-destructive mb-2">Excluir Conta</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Esta ação é <span className="font-bold text-destructive">irreversível</span>. Todos os dados da cooperativa, histórico, cupons e configurações serão apagados permanentemente.<br />Para confirmar, clique no botão abaixo.
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
                            Todos os dados da cooperativa serão apagados.
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
                          <Button variant="outline" onClick={handleCloseDeleteModal}>
                            Cancelar
                          </Button>
                          <Button variant="destructive" onClick={handleDeleteAccount}>
                            Confirmar exclusão
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              )}
              {activeSection === 'regiao' && (
                <div className="space-y-6">
                  {console.log('🏘️ [CooperativeSettings] Renderizando aba região')}
                  {console.log('🏘️ [CooperativeSettings] bairros state:', bairros)}
                  <div className="space-y-4">
                    <Label>Bairros de Atuação</Label>
                    <div className="flex flex-wrap gap-2">
                      {console.log('🏘️ [CooperativeSettings] Renderizando bairros:', bairros)}
                      {bairros.map((bairro) => {
                        console.log('🏘️ [CooperativeSettings] Renderizando bairro:', bairro);
                        return (
                        <Badge 
                          key={bairro} 
                          variant="secondary"
                          className="flex items-center gap-1 pr-1"
                        >
                          {bairro}
                          <button
                            onClick={() => handleRemoveBairro(bairro)}
                            className="ml-1 hover:bg-destructive/20 rounded-full p-1"
                            type="button"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                        );
                      })}
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
                            }
                          }}
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={handleAddBairro}
                      >
                        + Adicionar
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Adicione os bairros onde a cooperativa atua.
                    </p>
                  </div>
                  {/* Botões de ação para bairros */}
                  <div className="flex gap-2 justify-end mt-6">
                    <Button 
                      onClick={handleSaveBairros}
                      className="bg-neutro hover:bg-neutro/90"
                      disabled={!hasUnsavedNeighborhoods}
                    >
                      Salvar Bairros
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Upgrade de Plano */}
      <Dialog open={showUpgradeModal} onOpenChange={(open) => {
        setShowUpgradeModal(open);
        if (!open) setChangePlanPassword('');
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mudar de Plano</DialogTitle>
            <DialogDescription>
              Selecione o novo plano para sua cooperativa
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Plano Atual</Label>
              <div className="p-2 bg-gray-50 border rounded-md text-muted-foreground">
                {currentPlan}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Novo Plano</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  {availablePlansFiltered.map((plan) => (
                    <SelectItem key={plan.name} value={plan.name}>
                      {plan.name} - {plan.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <Input
                type="password"
                value={changePlanPassword}
                onChange={e => setChangePlanPassword(e.target.value)}
                placeholder="Digite sua senha"
              />
            </div>
            {saveError && <p className="text-sm text-red-500">{saveError}</p>}
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmChangePlan} disabled={!selectedPlan || !changePlanPassword || isLoading}>
              {isLoading ? 'Atualizando...' : 'Confirmar Troca'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Cancelamento de Plano */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancelar Plano</DialogTitle>
            <DialogDescription>
              Para cancelar seu plano, por favor, confirme sua senha
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Plano Atual</Label>
              <div className="p-2 bg-gray-50 border rounded-md text-muted-foreground">
                {userPlan.name}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
              />
            </div>
            {saveError && <p className="text-sm text-red-500">{saveError}</p>}
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowCancelModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmCancel} disabled={isLoading}>
              {isLoading ? 'Cancelando...' : 'Confirmar Cancelamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default CooperativeSettings; 