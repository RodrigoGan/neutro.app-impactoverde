import React, { useState } from 'react';
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
  ArrowLeft
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileTabs } from '@/components/ui/mobile-tabs';
import { NotificationsSection } from '@/components/profile/NotificationsSection';
import { NotificationPreference } from '@/types/user';

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

  // Dados mockados da empresa
  const companyData = {
    name: 'Empresa Verde',
    email: 'contato@empresaverde.com',
    phone: '(11) 99999-9999',
    cnpj: '12.345.678/0001-90',
    address: 'Rua das Flores, 123 - Centro',
    city: 'São Paulo',
    state: 'SP',
    plan: 'Carbon Free',
    planValue: 'R$ 249,90/mês',
    verified: true,
    avatar: '/placeholder-avatar.jpg'
  };

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
                      <AvatarImage src={companyData.avatar} alt="Logo da Empresa" />
                      <AvatarFallback>EV</AvatarFallback>
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
                  <h2 className="text-2xl font-bold">{companyData.name}</h2>
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
                        value={companyData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">E-mail</label>
                      <div className="w-full p-2 bg-gray-50 border rounded-md text-muted-foreground">
                        {companyData.email}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Para alterar seu e-mail, entre em contato com o suporte
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">CNPJ</label>
                      <Input 
                        value={companyData.cnpj}
                        onChange={(e) => handleInputChange('cnpj', e.target.value)}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Telefone</label>
                      <Input 
                        value={companyData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full"
                      />
                    </div>
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