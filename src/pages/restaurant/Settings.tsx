import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Utensils, Bell, Shield, Clock } from 'lucide-react';

const Settings: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

      <h1 className="text-2xl font-bold mb-6">Configurações do Restaurante</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Perfil do Restaurante */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-neutro" />
              Perfil do Restaurante
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="restaurantName">Nome do Restaurante</Label>
              <Input 
                id="restaurantName" 
                defaultValue="Restaurante Sustentável"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                defaultValue="contato@restaurante.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input 
                id="phone" 
                defaultValue="(11) 99999-9999"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input 
                id="address" 
                defaultValue="Rua da Gastronomia, 456"
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
                <Label>Notificações de Coleta</Label>
                <p className="text-sm text-muted-foreground">Alertas de coleta agendada</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Relatórios de Impacto</Label>
                <p className="text-sm text-muted-foreground">Relatórios mensais</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Promoções</Label>
                <p className="text-sm text-muted-foreground">Ofertas especiais</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Horário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-neutro" />
              Horário de Funcionamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="openTime">Abertura</Label>
                <Input 
                  id="openTime" 
                  type="time"
                  defaultValue="08:00"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="closeTime">Fechamento</Label>
                <Input 
                  id="closeTime" 
                  type="time"
                  defaultValue="22:00"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="daysOpen">Dias de Funcionamento</Label>
              <Input 
                id="daysOpen" 
                defaultValue="Segunda a Domingo"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Privacidade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-neutro" />
              Privacidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Perfil Público</Label>
                <p className="text-sm text-muted-foreground">Aparecer no mapa</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Dados de Impacto</Label>
                <p className="text-sm text-muted-foreground">Compartilhar métricas</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="pt-4 border-t">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Restaurante Verde
              </Badge>
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