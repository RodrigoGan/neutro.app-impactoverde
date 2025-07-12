import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { User, Bell, Shield, Globe } from 'lucide-react';

const Settings: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Usar dados reais do perfil
  const { profile: userProfile, loading } = useUserProfile('1'); // TODO: usar userId real

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando configurações...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/dashboard/standard', { state: { userId: location.state?.userId } })} 
        className="flex items-center gap-2 mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Voltar
      </Button>

      <h1 className="text-2xl font-bold mb-6">Configurações da Instituição Educacional</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Perfil da Instituição */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-neutro" />
              Perfil da Instituição
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="institutionName">Nome da Instituição</Label>
              <Input 
                id="institutionName" 
                defaultValue={userProfile?.institution_name || 'Instituição Educacional'}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Institucional</Label>
              <Input 
                id="email" 
                type="email"
                defaultValue={userProfile?.email || 'contato@instituicao.edu.br'}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input 
                id="phone" 
                defaultValue={userProfile?.phone || '(11) 99999-9999'}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input 
                id="address" 
                defaultValue={userProfile?.address || 'Rua da Educação, 123'}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-neutro" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificações por Email</Label>
                <p className="text-sm text-muted-foreground">Receber relatórios por email</p>
              </div>
              <Switch defaultChecked={userProfile?.email_notifications || true} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificações Push</Label>
                <p className="text-sm text-muted-foreground">Alertas no navegador</p>
              </div>
              <Switch defaultChecked={userProfile?.push_notifications || true} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Relatórios Semanais</Label>
                <p className="text-sm text-muted-foreground">Resumo semanal de atividades</p>
              </div>
              <Switch defaultChecked={userProfile?.weekly_reports || false} />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Privacidade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-neutro" />
              Privacidade e Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Perfil Público</Label>
                <p className="text-sm text-muted-foreground">Mostrar instituição no ranking</p>
              </div>
              <Switch defaultChecked={userProfile?.public_profile || true} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Dados Anônimos</Label>
                <p className="text-sm text-muted-foreground">Compartilhar dados para pesquisa</p>
              </div>
              <Switch defaultChecked={userProfile?.anonymous_data || false} />
            </div>
            <div className="pt-4 border-t">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Conta verificada
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Configurações Regionais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-neutro" />
              Configurações Regionais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="timezone">Fuso Horário</Label>
              <Input 
                id="timezone" 
                defaultValue="America/Sao_Paulo"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="language">Idioma</Label>
              <Input 
                id="language" 
                defaultValue="Português (Brasil)"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="currency">Moeda</Label>
              <Input 
                id="currency" 
                defaultValue="Real (BRL)"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex justify-end">
        <Button className="bg-neutro hover:bg-neutro/90">
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};

export default Settings; 