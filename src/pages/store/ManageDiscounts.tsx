import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Percent, Users, Calendar, Target, Store } from 'lucide-react';

const ManageDiscounts: React.FC = () => {
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

      <h1 className="text-2xl font-bold mb-6">Gestão de Descontos da Loja</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Descontos Ativos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-neutro" />
              Descontos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">Desconto Cliente Verde</p>
                  <p className="text-sm text-muted-foreground">12% para clientes sustentáveis</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Ativo
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Desconto Volume</p>
                  <p className="text-sm text-muted-foreground">18% em grandes volumes</p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Ativo
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium">Desconto Fidelidade</p>
                  <p className="text-sm text-muted-foreground">8% para clientes recorrentes</p>
                </div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                  Ativo
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Criar Novo Desconto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-neutro" />
              Criar Novo Desconto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="discountName">Nome do Desconto</Label>
              <Input 
                id="discountName" 
                placeholder="Ex: Desconto Especial"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="discountType">Tipo de Desconto</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentual (%)</SelectItem>
                  <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                  <SelectItem value="free">Coleta Gratuita</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="discountValue">Valor do Desconto</Label>
              <Input 
                id="discountValue" 
                type="number"
                placeholder="12"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="targetAudience">Público-Alvo</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o público" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clients">Clientes</SelectItem>
                  <SelectItem value="partners">Parceiros</SelectItem>
                  <SelectItem value="volume">Grandes Volumes</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Desconto Ativo</Label>
                <p className="text-sm text-muted-foreground">Ativar imediatamente</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas de Uso */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-neutro" />
              Estatísticas de Uso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">1,156</p>
                <p className="text-sm text-muted-foreground">Descontos Utilizados</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">R$ 4,230</p>
                <p className="text-sm text-muted-foreground">Economia Total</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Cliente Verde</span>
                <span className="font-medium">567 usos</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Volume</span>
                <span className="font-medium">345 usos</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Fidelidade</span>
                <span className="font-medium">244 usos</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Validade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-neutro" />
              Configurações de Validade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="validFrom">Válido a partir de</Label>
              <Input 
                id="validFrom" 
                type="date"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="validUntil">Válido até</Label>
              <Input 
                id="validUntil" 
                type="date"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="maxUses">Uso Máximo por Cliente</Label>
              <Input 
                id="maxUses" 
                type="number"
                placeholder="4"
                className="mt-1"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Renovação Automática</Label>
                <p className="text-sm text-muted-foreground">Renovar automaticamente</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex justify-end gap-4">
        <Button variant="outline">Cancelar</Button>
        <Button className="bg-neutro hover:bg-neutro/90">
          Salvar Desconto
        </Button>
      </div>
    </div>
  );
};

export default ManageDiscounts; 