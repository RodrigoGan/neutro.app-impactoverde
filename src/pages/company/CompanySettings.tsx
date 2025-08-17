import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ChevronLeft
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileTabs } from '@/components/ui/mobile-tabs';
import { NotificationsSection } from '@/components/profile/NotificationsSection';
import { NotificationPreference } from '@/types/user';
import LogoutButton from '@/components/ui/LogoutButton';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

type SettingsSection = 'perfil' | 'endereco' | 'plano' | 'seguranca' | 'notificacoes';

const tabs = [
  { id: 'perfil', label: 'Perfil', icon: <Building2 className="h-4 w-4" /> },
  { id: 'endereco', label: 'Endereço', icon: <MapPin className="h-4 w-4" /> },
  { id: 'plano', label: 'Plano', icon: <Star className="h-4 w-4" /> },
  { id: 'notificacoes', label: 'Notificações', icon: <Bell className="h-4 w-4" /> },
  { id: 'seguranca', label: 'Segurança', icon: <Lock className="h-4 w-4" /> },
];

const getTabTitle = (tabId: string) => {
  switch (tabId) {
    case 'perfil':
      return 'Dados da Empresa';
    case 'endereco':
      return 'Endereço da Empresa';
    case 'plano':
      return 'Plano Atual';
    case 'notificacoes':
      return 'Preferências de Notificação';
    case 'seguranca':
      return 'Segurança da Conta';
    default:
      return '';
  }
};

const CompanySettings: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { userProfile, loading, error } = useUserProfile(authUser?.id);
  
  const [activeSection, setActiveSection] = useState<SettingsSection>('perfil');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  // Estado local para dados editáveis
  const [user, setUser] = useState(userProfile);
  
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
  
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreference[]>([]);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Estados para exclusão de conta
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Carregar dados reais quando userProfile mudar
  useEffect(() => {
    if (userProfile) {
      console.log('🔄 [CompanySettings] Carregando dados do userProfile:', userProfile);
      setUser(userProfile);
      
      // Carregar endereço principal
      if (userProfile.addresses && userProfile.addresses.length > 0) {
        const mainAddress = userProfile.addresses.find(addr => addr.isMain) || userProfile.addresses[0];
        console.log('🏠 [CompanySettings] Endereço principal carregado:', mainAddress);
        setAddress({
          cep: mainAddress.zipCode || '',
          logradouro: mainAddress.street || '',
          numero: mainAddress.number || '',
          complemento: mainAddress.complement || '',
          referencia: '',
          bairro: mainAddress.neighborhood || '',
          cidade: mainAddress.city || '',
          estado: mainAddress.state || ''
        });
      }
      
      // Carregar preferências de notificação
      if (userProfile.notificationPreferences) {
        console.log('🔔 [CompanySettings] Preferências de notificação carregadas:', userProfile.notificationPreferences);
        setNotificationPreferences(userProfile.notificationPreferences);
      } else {
        console.log('⚠️ [CompanySettings] Nenhuma preferência de notificação encontrada, usando padrão');
        setNotificationPreferences([]);
      }
    }
  }, [userProfile]);

  // Planos disponíveis para empresas
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

  const handleInputChange = (field: string, value: string) => {
    if (user) {
      setUser(prev => prev ? { ...prev, [field]: value } : null);
      setHasUnsavedChanges(true);
    }
  };

  const handleSavePerfil = async () => {
    if (!user) return;
    
    try {
      console.log('💾 [CompanySettings] Salvando dados do perfil...');
      
      // Salvar dados básicos da empresa
      const { error: userError } = await supabase
        .from('users')
        .update({
          name: user.name,
          phone: user.phone,
          avatar_url: user.avatar
        })
        .eq('id', user.id);
      
      if (userError) throw userError;
      
      // Salvar dados do representante se existir
      if (user.representative) {
        console.log('👨‍💼 [CompanySettings] Salvando dados do representante...');
        const { error: repError } = await supabase
          .from('representatives')
          .upsert({
            user_id: user.id,
            name: user.representative.name,
            cpf: user.representative.cpf,
            email: user.representative.email,
            phone: user.representative.phone,
            position: user.representative.position,
            avatar_url: user.representative.avatar_url
          }, {
            onConflict: 'user_id'
          });
        
        if (repError) throw repError;
      }
      
      console.log('✅ [CompanySettings] Perfil salvo com sucesso');
      setHasUnsavedChanges(false);
      toast({
        title: 'Sucesso',
        description: 'Dados do perfil salvos com sucesso!',
      });
    } catch (error) {
      console.error('❌ [CompanySettings] Erro ao salvar perfil:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar dados do perfil.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveEndereco = async () => {
    try {
      console.log('🏠 [CompanySettings] Salvando endereço...');
      
      const { error } = await supabase
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
        .eq('user_id', user?.id)
        .eq('is_main', true);
      
      if (error) throw error;
      
      console.log('✅ [CompanySettings] Endereço salvo com sucesso');
      setHasUnsavedChanges(false);
      toast({
        title: 'Sucesso',
        description: 'Endereço salvo com sucesso!',
      });
    } catch (error) {
      console.error('❌ [CompanySettings] Erro ao salvar endereço:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar endereço.',
        variant: 'destructive',
      });
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && user) {
      try {
        const file = e.target.files[0];
        const fileName = `company_logo_${user.id}_${Date.now()}.jpg`;
        
        // Upload da imagem
        const { data, error } = await supabase.storage
          .from('logotipo')
          .upload(fileName, file, { upsert: true });
        
        if (error) throw error;
        
        // Gerar URL pública
        const { data: publicUrlData } = supabase.storage
          .from('logotipo')
          .getPublicUrl(fileName);
        
        // Atualizar no banco
        const { error: updateError } = await supabase
          .from('users')
          .update({ logo: publicUrlData.publicUrl })
          .eq('id', user.id);
        
        if (updateError) throw updateError;
        
        // Atualizar estado local
        setUser(prev => prev ? { ...prev, avatar: publicUrlData.publicUrl } : null);
        
        toast({
          title: 'Sucesso',
          description: 'Logo da empresa atualizada com sucesso!',
        });
      } catch (error) {
        console.error('❌ [CompanySettings] Erro ao fazer upload da imagem:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao fazer upload da imagem.',
          variant: 'destructive',
        });
      }
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

  const handleUpgradePlan = () => setShowUpgradeModal(true);
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
    // Implemente a lógica para salvar a nova senha
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
    setShowDeleteModal(false);
    alert('Conta excluída (simulação).');
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p>Carregando dados da empresa...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !user) {
    return (
      <Layout>
        <div className="container mx-auto p-4">
          <Alert variant="destructive">
            <AlertDescription>
              Erro ao carregar dados da empresa: {error || 'Usuário não encontrado'}
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
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
                      <AvatarImage src={user.avatar} alt="Logo da Empresa" />
                      <AvatarFallback>{user.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
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
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <p className="text-muted-foreground">Gerenciar Perfil</p>
                </div>
              )}
              {/* Conteúdo das abas */}
              {activeSection === 'perfil' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Nome da Empresa</label>
                      <Input 
                        value={user.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">E-mail</label>
                      <div className="w-full p-2 bg-gray-50 border rounded-md text-muted-foreground">
                        {user.email}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Para alterar seu e-mail, entre em contato com o suporte
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">CNPJ</label>
                      <Input 
                        value={user.document}
                        onChange={(e) => handleInputChange('document', e.target.value)}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Telefone</label>
                      <Input 
                        value={user.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Seção Dados do Representante */}
                  {user.representative && (
                    <div className="border-t pt-6 mt-6">
                      <h3 className="text-lg font-semibold mb-4">Dados do Representante</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Nome do Representante</label>
                          <Input 
                            value={user.representative.name}
                            onChange={(e) => setUser(prev => prev ? {
                              ...prev,
                              representative: prev.representative ? {
                                ...prev.representative,
                                name: e.target.value
                              } : undefined
                            } : null)}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">CPF</label>
                          <Input 
                            value={user.representative.cpf}
                            onChange={(e) => setUser(prev => prev ? {
                              ...prev,
                              representative: prev.representative ? {
                                ...prev.representative,
                                cpf: e.target.value
                              } : undefined
                            } : null)}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">E-mail</label>
                          <Input 
                            value={user.representative.email}
                            onChange={(e) => setUser(prev => prev ? {
                              ...prev,
                              representative: prev.representative ? {
                                ...prev.representative,
                                email: e.target.value
                              } : undefined
                            } : null)}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Telefone</label>
                          <Input 
                            value={user.representative.phone}
                            onChange={(e) => setUser(prev => prev ? {
                              ...prev,
                              representative: prev.representative ? {
                                ...prev.representative,
                                phone: e.target.value
                              } : undefined
                            } : null)}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Cargo</label>
                          <Input 
                            value={user.representative.position}
                            onChange={(e) => setUser(prev => prev ? {
                              ...prev,
                              representative: prev.representative ? {
                                ...prev.representative,
                                position: e.target.value
                              } : undefined
                            } : null)}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}
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
                    <Button onClick={handleSaveEndereco} disabled={!hasUnsavedChanges}>Salvar Endereço</Button>
                  </div>
                </div>
              )}
              {activeSection === 'plano' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Plano Atual</label>
                      <div className="w-full p-2 bg-gray-50 border rounded-md text-muted-foreground">
                        {userPlan.name}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Valor</label>
                      <div className="w-full p-2 bg-gray-50 border rounded-md text-muted-foreground">
                        {userPlan.price}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Status</label>
                      <Badge variant="outline" className="text-green-700 bg-green-100 border-green-200">Ativo</Badge>
                    </div>
                    <div className="flex gap-2 justify-end mt-4">
                      <Button variant="outline" onClick={handleUpgradePlan}>Alterar Plano</Button>
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
                  {/* Seção de exclusão de conta padronizada */}
                  <div className="border-t mt-8 pt-8">
                    <h3 className="text-lg font-semibold text-destructive mb-2">Excluir Conta</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Esta ação é <span className="font-bold text-destructive">irreversível</span>. Todos os dados da empresa, histórico, cupons e configurações serão apagados permanentemente.<br />Para confirmar, clique no botão abaixo.
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
                          Todos os dados da empresa serão apagados.
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
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          {activeSection === 'perfil' && hasUnsavedChanges && (
            <Button 
              className="bg-[#8DC63F] hover:bg-[#8DC63F]/90 text-white"
              onClick={handleSavePerfil}
            >
              Salvar Perfil
            </Button>
          )}
        </div>
      </div>

      {/* Modal de Upgrade de Plano */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Plano</DialogTitle>
            <DialogDescription>
              Selecione o novo plano para sua empresa coletora
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
              <Label>Novo Plano</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  {availablePlans.map((plan) => (
                    <SelectItem key={plan.name} value={plan.name.toLowerCase().replace(/\s+/g, '-')}>
                      {plan.name} - {plan.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {saveError && <p className="text-sm text-red-500">{saveError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmUpgrade} disabled={!selectedPlan || isLoading}>
              {isLoading ? 'Atualizando...' : 'Confirmar Upgrade'}
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
          <DialogFooter>
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

export default CompanySettings; 