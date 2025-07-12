import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { ReferralCard } from '@/components/referral/ReferralCard';
import { ReferralList } from '@/components/referral/ReferralList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, Trophy, Share2, ArrowLeft } from 'lucide-react';

const ReferralPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Volta para a página anterior
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6">
        {/* Botão Voltar */}
        <div className="flex items-center mb-4">
          <Button
            variant="outline"
            onClick={handleGoBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Indicação</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Compartilhe o Neutro com seus amigos e ganhe pontos por cada indicação! 
            Ajude o planeta e seja recompensado por espalhar a sustentabilidade.
          </p>
        </div>

        {/* Cards de destaque */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Indicações</p>
                  <p className="text-2xl font-bold text-gray-900">50 pontos</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Você ganha 50 pontos para cada indicação completa (quando a pessoa indicada se cadastra e conclui o processo).</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Bônus</p>
                  <p className="text-2xl font-bold text-gray-900">+100 pontos</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Ao atingir 3 indicações completas no mês, você recebe um bônus extra de 100 pontos.</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Limite</p>
                  <p className="text-2xl font-bold text-gray-900">10 por mês</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Você pode indicar até 10 pessoas por mês. O limite é renovado todo mês.</p>
            </CardContent>
          </Card>
        </div>

        {/* Conteúdo principal */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ReferralCard />
            
            {/* Como funciona */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Como Funciona o Sistema de Indicação
                </CardTitle>
                <CardDescription>
                  Entenda como ganhar pontos indicando amigos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-green-600 font-bold text-lg">1</span>
                    </div>
                    <h3 className="font-medium">Compartilhe</h3>
                    <p className="text-sm text-gray-600">
                      Use seu código único para compartilhar o Neutro com amigos e familiares
                    </p>
                  </div>

                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-blue-600 font-bold text-lg">2</span>
                    </div>
                    <h3 className="font-medium">Cadastro</h3>
                    <p className="text-sm text-gray-600">
                      Eles se cadastram usando seu código durante o registro
                    </p>
                  </div>

                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-yellow-600 font-bold text-lg">3</span>
                    </div>
                    <h3 className="font-medium">Ganhe Pontos</h3>
                    <p className="text-sm text-gray-600">
                      Quando completarem o cadastro, ambos ganham pontos!
                    </p>
                  </div>
                </div>

                {/* Regras e benefícios */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-3">Benefícios</h4>
                    <ul className="space-y-2 text-sm text-green-700">
                      <li>• 50 pontos por indicação completa</li>
                      <li>• Bônus de 100 pontos ao indicar 3 pessoas</li>
                      <li>• Progresso mais rápido nos níveis</li>
                      <li>• Acesso a cupons exclusivos</li>
                      <li>• Contribuição para um planeta mais sustentável</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-3">Regras</h4>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li>• Máximo de 10 indicações por mês</li>
                      <li>• Código válido por tempo indeterminado</li>
                      <li>• Pontos concedidos após cadastro completo</li>
                      <li>• Não é possível auto-indicação</li>
                      <li>• Código único por usuário</li>
                      <li>• Indicações fraudulentas ou tentativas de manipulação podem resultar em bloqueio de pontos ou da conta</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <ReferralList />
          </TabsContent>
        </Tabs>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Perguntas Frequentes</CardTitle>
            <CardDescription>
              Tire suas dúvidas sobre o sistema de indicação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Como encontro meu código de indicação?</h4>
                <p className="text-sm text-gray-600">
                  Seu código único é gerado automaticamente quando você se cadastra. 
                  Você pode encontrá-lo no card "Sistema de Indicação" acima.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Quando recebo os pontos?</h4>
                <p className="text-sm text-gray-600">
                  Os pontos são concedidos quando a pessoa que você indicou completa 
                  o cadastro e faz o primeiro login na plataforma.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Posso usar o mesmo código várias vezes?</h4>
                <p className="text-sm text-gray-600">
                  Sim! Seu código pode ser usado até 10 vezes por mês. 
                  Cada indicação bem-sucedida te dá 50 pontos.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">E se eu não tiver um código?</h4>
                <p className="text-sm text-gray-600">
                  Sem problemas! Você pode se cadastrar normalmente sem código. 
                  O sistema de indicação é opcional e não afeta seu uso da plataforma.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Como sei se minha indicação foi bem-sucedida?</h4>
                <p className="text-sm text-gray-600">
                  Você pode acompanhar o status de suas indicações na aba "Histórico". 
                  Indicações completadas aparecem em verde e você recebe uma notificação.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ReferralPage; 