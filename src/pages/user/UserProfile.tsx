import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BackButton } from '@/components/ui/back-button';
import { 
  User, 
  MapPin, 
  Bell,
  KeyRound,
  Upload,
  ChevronLeft,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

import { UserProfile as UserProfileType, Address, NotificationPreference } from '@/types/user';
import { useLocation, useNavigate } from 'react-router-dom';
import { MobileTabs } from '@/components/ui/mobile-tabs';
import { useUserProfile } from '@/hooks/useUserProfile';
import { AddressSection } from '@/components/profile/AddressSection';
import { NotificationsSection } from '@/components/profile/NotificationsSection';
import LogoutButton from '@/components/ui/LogoutButton';

type ProfileSection = 'personal' | 'address' | 'notifications' | 'security';

const tabs = [
  { id: 'personal', label: 'Dados Pessoais', icon: <User className="h-4 w-4" /> },
  { id: 'address', label: 'Endereços', icon: <MapPin className="h-4 w-4" /> },
  { id: 'notifications', label: 'Notificações', icon: <Bell className="h-4 w-4" /> },
  { id: 'security', label: 'Segurança', icon: <KeyRound className="h-4 w-4" /> },
];

const getTabTitle = (tabId: ProfileSection) => {
  switch (tabId) {
    case 'personal':
      return 'Informações Pessoais';
    case 'address':
      return 'Meus Endereços';
    case 'notifications':
      return 'Preferências de Notificação';
    case 'security':
      return 'Segurança da Conta';
    default:
      return '';
  }
};

const UserProfile: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Buscar o id do usuário logado (ajustar conforme sua lógica de auth)
  const userId = location.state?.userId || '';
  const {
    userData,
    addresses,
    notificationPreferences,
    loading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    setMainAddress,
    updateNotificationPreference,
  } = useUserProfile(userId);
  const [activeSection, setActiveSection] = useState<ProfileSection>('personal');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSaveChanges = () => {
    toast({
      title: "Alterações salvas",
      description: "Suas informações foram atualizadas com sucesso."
    });
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: "Erro ao carregar imagem",
          description: "A imagem deve ter no máximo 5MB",
          variant: "destructive"
        });
        return;
      }
      setSelectedImage(file);
      // Aqui você adicionaria a lógica para fazer upload da imagem
      toast({
        title: "Imagem selecionada",
        description: "A nova foto de perfil será atualizada em breve."
      });
    }
  };

  const handlePasswordChange = (currentPassword: string, newPassword: string) => {
    // Aqui você adicionaria a lógica para alterar a senha
    console.log('Alterando senha...');
    setShowPasswordForm(false);
    toast({
      title: "Senha alterada",
      description: "Sua senha foi atualizada com sucesso."
    });
  };

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

  if (loading) {
    return <div className="p-8 text-center">Carregando perfil...</div>;
  }
  if (error || !userData) {
    return <div className="p-8 text-center text-red-500">Erro ao carregar perfil do usuário.</div>;
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
          onTabChange={tab => setActiveSection(tab as ProfileSection)}
          className="mb-6"
        />

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-6 pt-6">
              <h2 className="text-lg font-semibold mb-2">{getTabTitle(activeSection)}</h2>
            </div>
            <div className="px-6 pb-6">
              {/* Avatar, nome e subtítulo só na aba de dados pessoais */}
              {activeSection === 'personal' && (
                <div className="flex flex-col items-center mb-8">
                  <div className="relative">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={userData.avatar} alt="Foto do perfil" />
                      <AvatarFallback>{userData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <label 
                      htmlFor="avatar-upload" 
                      className="absolute bottom-4 right-0 p-1 bg-white rounded-full border cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        id="avatar-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <span className="sr-only">Alterar foto</span>
                    </label>
                  </div>
                  <h2 className="text-2xl font-bold">{userData.name}</h2>
                  <p className="text-muted-foreground">Gerenciar Perfil</p>
                </div>
              )}

              {/* Conteúdo das abas */}
              {activeSection === 'personal' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Nome Completo</label>
                      <Input 
                        value={userData.name}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">E-mail</label>
                      <div className="w-full p-2 bg-gray-50 border rounded-md text-muted-foreground">
                        {userData.email}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Para alterar seu e-mail, entre em contato com o suporte
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeSection === 'security' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Senha Atual</label>
                      <Input type="password" className="w-full" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Nova Senha</label>
                      <Input type="password" className="w-full" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Confirmar Nova Senha</label>
                      <Input type="password" className="w-full" />
                    </div>
                    <div className="flex gap-2 justify-end mt-4">
                      <Button 
                        variant="outline"
                        onClick={() => {/* Limpar campos se desejar */}}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        className="bg-[#8DC63F] hover:bg-[#8DC63F]/90 text-white"
                        onClick={() => handlePasswordChange('', '')}
                      >
                        Salvar Nova Senha
                      </Button>
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
                            <label htmlFor="delete-password" className="text-sm font-medium mb-1 block">Senha atual</label>
                            <Input
                              id="delete-password"
                              type="password"
                              value={deletePassword}
                              onChange={e => setDeletePassword(e.target.value)}
                              placeholder="Digite sua senha"
                            />
                          </div>
                          <div>
                            <label htmlFor="delete-confirm" className="text-sm font-medium mb-1 block">Confirmação</label>
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
                </div>
              )}
              {activeSection === 'address' && (
                <AddressSection
                  addresses={addresses}
                  onAddAddress={addAddress}
                  onUpdateAddress={updateAddress}
                  onDeleteAddress={deleteAddress}
                  onSetMainAddress={setMainAddress}
                />
              )}
              {activeSection === 'notifications' && (
                <NotificationsSection
                  preferences={notificationPreferences}
                  onUpdatePreferences={prefs => {
                    // Atualize o estado local corretamente
                    // setNotificationPreferences(prefs); // This line was removed as per the edit hint
                  }}
                />
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
    </Layout>
  );
};

export default UserProfile; 