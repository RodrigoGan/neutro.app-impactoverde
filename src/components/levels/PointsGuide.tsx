import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PointAction {
  icon: string;
  action: string;
  points: number;
  description: string;
}

const pointsData = {
  common: [
    { icon: '♻️', action: 'Solicitar Coleta', points: 10, description: 'Solicitação de coleta de recicláveis' },
    { icon: '⭐', action: 'Avaliar Coletor', points: 5, description: 'Avaliação de coletor após coleta' },
    { icon: '📱', action: 'Login Diário', points: 1, description: 'Login diário na plataforma' },
    { icon: '🤝', action: 'Indicar Usuário', points: 50, description: 'Indicação de novo usuário' },
    { icon: '⚠️', action: 'Cancelamento em Cima da Hora', points: -5, description: 'Cancelou coleta em cima da hora' },
    { icon: '🚫', action: 'Falso Agendamento', points: -10, description: 'Solicitou coleta e não entregou materiais' }
  ],
  collector: [
    { icon: '✅', action: 'Aceitar Coleta', points: 15, description: 'Aceitar solicitação de coleta' },
    { icon: '🚚', action: 'Completar Coleta', points: 25, description: 'Completar coleta com sucesso' },
    { icon: '⭐', action: 'Avaliação Alta', points: 10, description: 'Receber avaliação 4-5 estrelas' },
    { icon: '⏰', action: 'Pontualidade', points: 5, description: 'Chegar no horário agendado' },
    { icon: '⚠️', action: 'Atraso', points: -10, description: 'Chegar atrasado na coleta' }
  ],
  partner: [
    { icon: '🎫', action: 'Criar Cupom', points: 20, description: 'Criar cupom de desconto' },
    { icon: '✅', action: 'Cupom Utilizado', points: 15, description: 'Cupom utilizado por cliente' },
    { icon: '⭐', action: 'Avaliação Alta', points: 10, description: 'Receber avaliação alta de cliente' },
    { icon: '🚫', action: 'Cupom Não Honrado / Promoção Falsa', points: -20, description: 'Cliente denunciou cupom não aceito, promoção falsa ou outro motivo' }
  ],
  cooperative: [
    { icon: '♻️', action: 'Completar Coleta', points: 25, description: 'Completar coleta de recicláveis' },
    { icon: '💰', action: 'Vender para Empresa', points: 30, description: 'Vender materiais para empresa coletora' },
    { icon: '📦', action: 'Processar Volume', points: 2, description: 'Processar 1kg de material' },
    { icon: '⚠️', action: 'Cancelamento de Venda Após Acordo', points: -15, description: 'Cancelou venda após acordo fechado' },
    { icon: '🚫', action: 'Volume Não Entregue', points: -10, description: 'Não entregou o volume prometido' }
  ],
  company: [
    { icon: '👤', action: 'Cadastrar Coletor', points: 50, description: 'Cadastrar novo coletor individual na plataforma' },
    { icon: '🤝', action: 'Comprar do Coletor', points: 20, description: 'Comprar materiais de coletor individual' },
    { icon: '🏢', action: 'Comprar de Cooperativa', points: 30, description: 'Comprar materiais de cooperativa' },
    { icon: '✅', action: 'Realizar Coleta', points: 15, description: 'Realizar coleta de recicláveis' },
    { icon: '⚠️', action: 'Cancelamento de Compra Após Negociação', points: -15, description: 'Cancelou compra após negociação fechada' }
  ]
};

const PointsTable: React.FC<{ actions: PointAction[] }> = ({ actions }) => {
  return (
    <div className="space-y-4">
      {actions.map((action, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <span className="text-2xl">{action.icon}</span>
            <div>
              <h4 className="font-medium">{action.action}</h4>
              <p className="text-sm text-gray-600">{action.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <span className={`font-bold ${action.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {action.points >= 0 ? '+' : ''}{action.points}
            </span>
            <span className="text-sm text-gray-600">pts</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export const PointsGuide: React.FC = () => {
  return (
    <div className="w-full flex justify-center mb-8">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="lg" className="font-medium">
            Veja como ganhar pontos
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sistema de Pontuação</DialogTitle>
            <DialogDescription>
              Escolha seu perfil para ver como você pode ganhar pontos. Os pontos são baseados no sistema real implementado.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="common" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="common">Usuário</TabsTrigger>
              <TabsTrigger value="collector">Coletor</TabsTrigger>
              <TabsTrigger value="partner">Parceiro</TabsTrigger>
              <TabsTrigger value="cooperative">Cooperativa</TabsTrigger>
              <TabsTrigger value="company">Empresa</TabsTrigger>
            </TabsList>

            <TabsContent value="common">
              <PointsTable actions={pointsData.common} />
            </TabsContent>

            <TabsContent value="collector">
              <PointsTable actions={pointsData.collector} />
            </TabsContent>

            <TabsContent value="partner">
              <PointsTable actions={pointsData.partner} />
            </TabsContent>

            <TabsContent value="cooperative">
              <PointsTable actions={pointsData.cooperative} />
            </TabsContent>

            <TabsContent value="company">
              <PointsTable actions={pointsData.company} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { pointsData, PointsTable }; 