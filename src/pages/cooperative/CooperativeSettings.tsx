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
  X
} from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileTabs } from '@/components/ui/mobile-tabs';
import { NotificationsSection } from '@/components/profile/NotificationsSection';
import { NotificationPreference } from '@/types/user';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { materialDisplayData } from '@/config/materialDisplayData';
import { getMaterialIdentificador } from '@/lib/utils';
import { getAllMaterials } from '@/lib/collectorService';

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
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [outrosDescricao, setOutrosDescricao] = useState('');
  const [bairros, setBairros] = useState<string[]>([]);
  const [novoBairro, setNovoBairro] = useState('');
  const [materiaisDb, setMateriaisDb] = useState<any[]>([]);
  const [materiaisLoading, setMateriaisLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('Carbon Free');

  // Busca userId igual ao dashboard
  let userId = '4';
  if (window.history.state && window.history.state.usr && window.history.state.usr.userId) {
    userId = window.history.state.usr.userId.toString();
  } else {
    const params = new URLSearchParams(location.search);
    userId = params.get('userId') || '4';
  }
  
  // Hook para buscar dados reais do usuário
  const { profile: user, loading, error: profileError } = useUserProfile(userId);

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
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = () => {
    setHasUnsavedChanges(false);
    // Aqui você implementaria a lógica para salvar as alterações
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Aqui você implementaria a lógica para atualizar a imagem
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
    setHasUnsavedChanges(true);
  };

  const handleAddBairro = () => {
    if (novoBairro.trim() && !bairros.includes(novoBairro.trim())) {
      setBairros([...bairros, novoBairro.trim()]);
      setNovoBairro('');
    }
  };

  const handleRemoveBairro = (bairro: string) => {
    setBairros(bairros.filter(b => b !== bairro));
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Configurações</h1>
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
                      <AvatarImage src="" alt="Logo da Cooperativa" />
                      <AvatarFallback>CV</AvatarFallback>
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
                        -
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Telefone</label>
                      <Input 
                        value={''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">CNPJ</label>
                      <div className="w-full p-2 bg-gray-50 border rounded-md text-muted-foreground">
                        -
                      </div>
                    </div>
                  </div>
                  {hasUnsavedChanges && (
                    <Alert className="mt-4">
                      <AlertDescription>Você tem alterações não salvas.</AlertDescription>
                    </Alert>
                  )}
                  <div className="flex gap-2 justify-end mt-4">
                    <Button variant="outline" onClick={() => setHasUnsavedChanges(false)}>Cancelar</Button>
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
                  {hasUnsavedChanges && (
                    <Alert className="mt-4">
                      <AlertDescription>Você tem alterações não salvas.</AlertDescription>
                    </Alert>
                  )}
                  <div className="flex gap-2 justify-end mt-4">
                    <Button variant="outline" onClick={() => setHasUnsavedChanges(false)}>Cancelar</Button>
                  </div>
                </div>
              )}
              {activeSection === 'materiais' && (
                <div className="space-y-6">
                  <div className="grid gap-4">
                    <div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {materiaisDb.map((material) => {
                          const displayInfo = materialDisplayData[material.identificador];
                          if (!displayInfo) return null;
                          return (
                            <div key={material.id} className="flex items-center space-x-2">
                              <div className="relative">
                                <Switch id={material.identificador} />
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
                              <Switch id="outros" />
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
                </div>
              )}
              {activeSection === 'notificacoes' && (
                <NotificationsSection
                  preferences={notificationPreferences}
                  onUpdatePreferences={setNotificationPreferences}
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
                  </div>
                </div>
              )}
              {activeSection === 'regiao' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label>Bairros de Atuação</Label>
                    <div className="flex flex-wrap gap-2">
                      {bairros.map((bairro) => (
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
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button 
            className="bg-[#8DC63F] hover:bg-[#8DC63F]/90 text-white"
            onClick={handleSaveChanges}
          >
            Salvar Alterações
          </Button>
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