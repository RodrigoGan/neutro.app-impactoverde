import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
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
  Utensils,
  ShoppingBag,
  GraduationCap,
  ChevronLeft
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

import { MobileTabs } from '@/components/ui/mobile-tabs';
import { NotificationsSection } from '@/components/profile/NotificationsSection';
import { NotificationPreference } from '@/types/user';
import { AttendTypeSwitch } from '@/components/restaurant/AttendTypeSwitch';
import { StoreSegmentSwitch, SEGMENTS } from '@/components/store/StoreSegmentSwitch';
import PerfilEducacionalForm from '@/components/profile/PerfilEducacionalForm';
import { EDUCATION_TYPES } from '@/components/register/educational/EducationTypeSwitch';
import LogoutButton from '@/components/ui/LogoutButton';

type SettingsSection = 'perfil' | 'endereco' | 'plano' | 'seguranca' | 'notificacoes' | 'perfil-restaurante' | 'perfil-loja' | 'perfil-educacional';
type PartnerType = 'restaurant' | 'store' | 'educational';
type SegmentKey = typeof SEGMENTS[number]['key'];

const PartnerSettings: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const partnerType = searchParams.get('type') as PartnerType;
  
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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [password, setPassword] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [notifications, setNotifications] = useState<NotificationPreference[]>([
    { 
      type: 'email', 
      enabled: true,
      categories: {
        collections: true,
        achievements: true,
        promotions: true,
        system: true
      }
    },
    { 
      type: 'push', 
      enabled: false,
      categories: {
        collections: true,
        achievements: true,
        promotions: false,
        system: true
      }
    }
  ]);
  const [bairro, setBairro] = useState('Centro');
  const [attendDelivery, setAttendDelivery] = useState(false);
  const [attendPresencial, setAttendPresencial] = useState(false);
  const [attendBuffet, setAttendBuffet] = useState(false);
  const [attendMarmitex, setAttendMarmitex] = useState(false);
  const [attendOther, setAttendOther] = useState(false);
  const [attendOtherDesc, setAttendOtherDesc] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [cuisineTypes, setCuisineTypes] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [storeBusinessType, setStoreBusinessType] = useState('');
  const [storeSize, setStoreSize] = useState('');
  const [storeSegments, setStoreSegments] = useState<SegmentKey[]>([]);
  const [storeOtherSegment, setStoreOtherSegment] = useState('');
  const [storeOpeningHours, setStoreOpeningHours] = useState('');
  const [institutionType, setInstitutionType] = useState<typeof EDUCATION_TYPES[number]['key'] | null>(null);
  const [educationLevels, setEducationLevels] = useState<string[]>([]);
  const [activePrograms, setActivePrograms] = useState('');
  const [otherInstitutionTypeDesc, setOtherInstitutionTypeDesc] = useState('');
  const [otherEducationLevelDesc, setOtherEducationLevelDesc] = useState('');

  // Dados mockados baseados no tipo de parceiro
  const getPartnerData = (type: PartnerType) => {
    switch (type) {
      case 'restaurant':
        return {
          name: 'Restaurante Sabor & Arte',
          email: 'contato@saborearte.com.br',
          phone: '(11) 99999-9999',
          cnpj: '12.345.678/0001-90',
          address: {
            street: 'Rua das Flores',
            number: '123',
            complement: 'Sala 4',
            neighborhood: 'Jardim Primavera',
            city: 'São Paulo',
            state: 'SP',
            cep: '01234-567'
          },
          icon: <Utensils className="h-4 w-4" />,
          type: 'Restaurante'
        };
      case 'store':
        return {
          name: 'Loja Verde & Sustentável',
          email: 'contato@lojaverde.com.br',
          phone: '(11) 98888-8888',
          cnpj: '98.765.432/0001-10',
          address: {
            street: 'Av. Principal',
            number: '456',
            complement: 'Loja 2',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            cep: '04567-890'
          },
          icon: <ShoppingBag className="h-4 w-4" />,
          type: 'Loja'
        };
      case 'educational':
        return {
          name: 'Escola Sustentável',
          email: 'contato@escolasustentavel.com.br',
          phone: '(11) 97777-7777',
          cnpj: '45.678.901/0001-23',
          address: {
            street: 'Rua da Educação',
            number: '789',
            complement: 'Bloco A',
            neighborhood: 'Vila Nova',
            city: 'São Paulo',
            state: 'SP',
            cep: '07890-123'
          },
          icon: <GraduationCap className="h-4 w-4" />,
          type: 'Instituição Educacional'
        };
      default:
        return null;
    }
  };

  const partnerData = getPartnerData(partnerType);

  // Planos disponíveis para parceiros
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
    toast({
      title: "Alterações salvas",
      description: "Suas alterações foram salvas com sucesso.",
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Implementar lógica de upload de imagem
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
      toast({
        title: "Plano atualizado",
        description: "Seu plano foi atualizado com sucesso.",
      });
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
      toast({
        title: "Plano cancelado",
        description: "Seu plano foi cancelado com sucesso.",
      });
    }, 1000);
  };

  const handleUpdateNotifications = (preferences: NotificationPreference[]) => {
    setNotifications(preferences);
    toast({
      title: "Preferências atualizadas",
      description: "Suas preferências de notificação foram atualizadas com sucesso.",
    });
  };

  const handleEducationalDataChange = (data: any) => {
    if (data.institutionType !== undefined) setInstitutionType(data.institutionType);
    if (data.educationLevels !== undefined) setEducationLevels(data.educationLevels);
    if (data.activePrograms !== undefined) setActivePrograms(data.activePrograms);
    if (data.otherInstitutionTypeDesc !== undefined) setOtherInstitutionTypeDesc(data.otherInstitutionTypeDesc);
    if (data.otherEducationLevelDesc !== undefined) setOtherEducationLevelDesc(data.otherEducationLevelDesc);
  };

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: <Building2 className="h-4 w-4" /> },
    ...(partnerType === 'restaurant' ? [
      { id: 'perfil-restaurante', label: 'Perfil do Restaurante', icon: <Utensils className="h-4 w-4" /> }
    ] : []),
    ...(partnerType === 'store' ? [
      { id: 'perfil-loja', label: 'Perfil da Loja', icon: <ShoppingBag className="h-4 w-4" /> }
    ] : []),
    ...(partnerType === 'educational' ? [
      { id: 'perfil-educacional', label: 'Perfil da Instituição', icon: <GraduationCap className="h-4 w-4" /> }
    ] : []),
    { id: 'endereco', label: 'Endereço', icon: <MapPin className="h-4 w-4" /> },
    { id: 'plano', label: 'Plano', icon: <Star className="h-4 w-4" /> },
    { id: 'notificacoes', label: 'Notificações', icon: <Bell className="h-4 w-4" /> },
    { id: 'seguranca', label: 'Segurança', icon: <Lock className="h-4 w-4" /> },
  ];

  const getTabTitle = (tabId: string) => {
    switch (tabId) {
      case 'perfil':
        return `Dados do ${partnerData?.type}`;
      case 'endereco':
        return `Endereço do ${partnerData?.type}`;
      case 'plano':
        return 'Plano Atual';
      case 'notificacoes':
        return 'Preferências de Notificação';
      case 'seguranca':
        return 'Segurança da Conta';
      case 'perfil-restaurante':
        return 'Perfil do Restaurante';
      case 'perfil-loja':
        return 'Perfil da Loja';
      case 'perfil-educacional':
        return 'Perfil da Instituição';
      default:
        return '';
    }
  };

  if (!partnerData) {
    return (
      <Layout>
        <div className="container mx-auto p-4">
          <Alert>
            <AlertDescription>
              Tipo de parceiro inválido ou não especificado.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  // Estados para exclusão de conta
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
                    <AvatarImage src="/placeholder-avatar.jpg" alt={`Logo do ${partnerData.type}`} />
                    <AvatarFallback>{partnerData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
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
                <h2 className="text-2xl font-bold">{partnerData.name}</h2>
                <p className="text-muted-foreground">Gerenciar Perfil</p>
              </div>
            )}

            {/* Conteúdo das abas */}
            {activeSection === 'perfil' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Nome do {partnerData.type}</label>
                    <Input 
                      value={partnerData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">E-mail</label>
                    <div className="w-full p-2 bg-gray-50 border rounded-md text-muted-foreground">
                      {partnerData.email}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Para alterar seu e-mail, entre em contato com o suporte
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">CNPJ</label>
                    <Input 
                      value={partnerData.cnpj}
                      onChange={(e) => handleInputChange('cnpj', e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Telefone</label>
                    <Input 
                      value={partnerData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {partnerType === 'restaurant' && activeSection === 'perfil-restaurante' && (
              <div className="space-y-6 max-w-xl mx-auto">
                <div>
                  <Label className="block mb-1">Tipos de atendimento *</Label>
                  <AttendTypeSwitch
                    value={{
                      delivery: attendDelivery,
                      presencial: attendPresencial,
                      buffet: attendBuffet,
                      marmitex: attendMarmitex,
                      other: attendOther,
                      otherDesc: attendOtherDesc
                    }}
                    onChange={val => {
                      setAttendDelivery(val.delivery);
                      setAttendPresencial(val.presencial);
                      setAttendBuffet(val.buffet);
                      setAttendMarmitex(val.marmitex);
                      setAttendOther(val.other);
                      setAttendOtherDesc(val.otherDesc || '');
                    }}
                  />
                </div>
                <div>
                  <Label className="block mb-1">Faixa de preço *</Label>
                  <select className="w-full border rounded p-2" value={priceRange} onChange={e => setPriceRange(e.target.value)}>
                    <option value="">Selecione</option>
                    <option value="baixo">Baixo</option>
                    <option value="medio">Médio</option>
                    <option value="alto">Alto</option>
                  </select>
                </div>
                <div>
                  <Label className="block mb-1">Tipos de culinária *</Label>
                  <Input
                    placeholder="Ex: Brasileira, Italiana, Japonesa..."
                    value={cuisineTypes}
                    onChange={e => setCuisineTypes(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="block mb-1">Horários de funcionamento *</Label>
                  <Input
                    placeholder="Ex: Segunda a Sexta, 11h-15h e 18h-22h"
                    value={openingHours}
                    onChange={e => setOpeningHours(e.target.value)}
                  />
                </div>
              </div>
            )}

            {partnerType === 'store' && activeSection === 'perfil-loja' && (
              <div className="space-y-6 max-w-xl mx-auto">
                <div>
                  <Label className="block mb-1">Tipo de negócio *</Label>
                  <Input
                    placeholder="Ex: Roupas, Eletrônicos, Mercado..."
                    value={storeBusinessType}
                    onChange={e => setStoreBusinessType(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="block mb-1">Tamanho da loja *</Label>
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
                </div>
                <div>
                  <Label className="block mb-1">Segmentos da loja *</Label>
                  <StoreSegmentSwitch
                    value={storeSegments}
                    onChange={setStoreSegments}
                    otherDesc={storeOtherSegment}
                    onOtherDescChange={setStoreOtherSegment}
                  />
                </div>
                <div>
                  <Label className="block mb-1">Horários de funcionamento *</Label>
                  <Input
                    placeholder="Ex: Segunda a Sexta, 09h-18h"
                    value={storeOpeningHours}
                    onChange={e => setStoreOpeningHours(e.target.value)}
                  />
                </div>
              </div>
            )}

            {partnerType === 'educational' && activeSection === 'perfil-educacional' && (
              <PerfilEducacionalForm
                data={{
                  institutionType: institutionType,
                  educationLevels: educationLevels,
                  activePrograms: activePrograms,
                  otherInstitutionTypeDesc: otherInstitutionTypeDesc,
                  otherEducationLevelDesc: otherEducationLevelDesc
                }}
                onChange={handleEducationalDataChange}
                errors={{}}
              />
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Número</label>
                      <Input 
                        value={address.numero}
                        onChange={e => handleAddressChange('numero', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div>
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
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Bairro</label>
                      <Input 
                        value={address.bairro}
                        onChange={e => handleAddressChange('bairro', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Cidade</label>
                      <Input 
                        value={address.cidade}
                        onChange={e => handleAddressChange('cidade', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Estado</label>
                      <Input 
                        value={address.estado}
                        onChange={e => handleAddressChange('estado', e.target.value)}
                        className="w-full"
                      />
                    </div>
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
              <div className="space-y-6">
                <NotificationsSection 
                  preferences={notifications}
                  onUpdatePreferences={handleUpdateNotifications}
                />
              </div>
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
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Nova Senha</label>
                    <Input
                      type="password"
                      placeholder="Digite a nova senha"
                      className="w-full"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Confirmar Nova Senha</label>
                    <Input
                      type="password"
                      placeholder="Confirme a nova senha"
                      className="w-full"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 justify-end mt-4">
                    <Button variant="outline" onClick={() => setPassword('')}>Cancelar</Button>
                    <Button variant="default" onClick={handleSaveChanges}>Alterar Senha</Button>
                  </div>
                </div>
                {/* Seção de exclusão de conta padronizada */}
                <div className="border-t mt-8 pt-8">
                  <h3 className="text-lg font-semibold text-destructive mb-2">Excluir Conta</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Esta ação é <span className="font-bold text-destructive">irreversível</span>. Todos os dados do parceiro, histórico, cupons e configurações serão apagados permanentemente.<br />Para confirmar, clique no botão abaixo.
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
                        Todos os dados do parceiro serão apagados.
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

      {/* Modal de Upgrade de Plano */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Plano</DialogTitle>
            <DialogDescription>
              Selecione o novo plano para seu {partnerData.type}
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
      <div className="flex justify-end mt-6">
        <Button 
          className="bg-[#8DC63F] hover:bg-[#8DC63F]/90 text-white"
          onClick={handleSaveChanges}
        >
          Salvar Alterações
        </Button>
      </div>
    </Layout>
  );
};

export default PartnerSettings; 