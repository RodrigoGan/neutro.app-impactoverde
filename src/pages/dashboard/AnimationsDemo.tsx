import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AchievementAnimation } from '@/components/animations/AchievementAnimation';
import { Trophy, Medal, Award, CalendarCheck, Package, User, Star, CheckCircle2, Ticket, DollarSign } from 'lucide-react';
import AchievementSolicitanteRating from '@/components/animations/AchievementSolicitanteRating';

const AnimationsDemo: React.FC = () => {
  const [showAchievement, setShowAchievement] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [showScheduleConfirmed, setShowScheduleConfirmed] = useState(false);
  const [showManualCollection, setShowManualCollection] = useState(false);
  const [showCoopRegister, setShowCoopRegister] = useState(false);
  const [showCollectorRating, setShowCollectorRating] = useState(false);
  const [showColetaConfirmada, setShowColetaConfirmada] = useState(false);
  const [showCouponCreated, setShowCouponCreated] = useState(false);
  const [showSolicitanteRating, setShowSolicitanteRating] = useState(false);
  const [showBuyRecyclablesAnimation, setShowBuyRecyclablesAnimation] = useState(false);
  const [showRegisterSuccess, setShowRegisterSuccess] = useState(false);
  const [showColetaSolicitada, setShowColetaSolicitada] = useState(false);
  const [showColetaAceita, setShowColetaAceita] = useState(false);

  return (
    <div className="container mx-auto max-w-md p-4 flex flex-col gap-6 items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-2">Teste de Animações</h1>
      <p className="text-center text-muted-foreground mb-4">
        Clique nos botões abaixo para visualizar cada animação antes de integrar ao app.
      </p>

      <div className="flex flex-col gap-3 w-full">
        <Button 
          variant="outline" 
          onClick={() => setShowAchievement(true)}
          className="h-12"
        >
          <Trophy className="mr-2 h-5 w-5" />
          Animação de Conquista
        </Button>

        <Button 
          variant="outline" 
          onClick={() => setShowLevelUp(true)}
          className="h-12"
        >
          <Medal className="mr-2 h-5 w-5" />
          Subida de Nível
        </Button>

        <Button 
          variant="outline" 
          onClick={() => setShowBadge(true)}
          className="h-12"
        >
          <Award className="mr-2 h-5 w-5" />
          Badge Animado
        </Button>

        <Button 
          variant="outline" 
          onClick={() => setShowScheduleConfirmed(true)}
          className="h-12"
        >
          <CalendarCheck className="mr-2 h-5 w-5 text-green-600" />
          Agendamento Confirmado
        </Button>

        <Button 
          variant="outline" 
          onClick={() => setShowManualCollection(true)}
          className="h-12"
        >
          <Package className="mr-2 h-5 w-5 text-green-600" />
          Coleta Manual Registrada
        </Button>

        <Button 
          variant="outline" 
          onClick={() => setShowCoopRegister(true)}
          className="h-12"
        >
          <User className="mr-2 h-5 w-5 text-green-600" />
          Cadastro de Cooperado/Funcionário
        </Button>

        <Button
          onClick={() => setShowCollectorRating(true)}
          variant="outline"
          className="w-full"
        >
          <Star className="mr-2 h-4 w-4" />
          Avaliação do Coletor
        </Button>

        <Button
          variant="default"
          onClick={() => setShowColetaConfirmada(true)}
          className="w-full md:w-auto"
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Confirmar Coleta
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowCouponCreated(true)}
          className="h-12"
        >
          <Ticket className="mr-2 h-5 w-5 text-neutro" />
          Cupom Criado
        </Button>

        <Button
          onClick={() => setShowSolicitanteRating(true)}
          variant="outline"
          className="w-full"
        >
          <Star className="mr-2 h-4 w-4" />
          Avaliação do Solicitante
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowBuyRecyclablesAnimation(true)}
          className="h-12"
        >
          <DollarSign className="mr-2 h-5 w-5 text-green-600" />
          Compra de Materiais
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowRegisterSuccess(true)}
          className="h-12"
        >
          <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" />
          Cadastro Concluído
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowColetaSolicitada(true)}
          className="h-12"
        >
          <Package className="mr-2 h-5 w-5 text-green-600" />
          Coleta Solicitada
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowColetaAceita(true)}
          className="h-12"
        >
          <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" />
          Coleta Aceita
        </Button>
      </div>

      {showAchievement && (
        <AchievementAnimation
          title="Nova Conquista!"
          description="Você reciclou mais de 100kg de materiais"
          soundType="achievement"
          onComplete={() => setShowAchievement(false)}
        />
      )}

      {showLevelUp && (
        <AchievementAnimation
          title="Nível Ouro Alcançado!"
          description="Parabéns por atingir o nível máximo"
          icon={<Medal className="w-16 h-16 text-yellow-500" />}
          soundType="levelUp"
          onComplete={() => setShowLevelUp(false)}
        />
      )}

      {showBadge && (
        <AchievementAnimation
          title="Novo Badge Desbloqueado!"
          description="Mestre da Reciclagem"
          icon={<Award className="w-16 h-16 text-blue-500" />}
          soundType="badge"
          onComplete={() => setShowBadge(false)}
        />
      )}

      {showScheduleConfirmed && (
        <AchievementAnimation
          title="Agendamento Confirmado!"
          description="Sua coleta foi agendada com sucesso e o coletor notificado."
          icon={<CalendarCheck className="w-16 h-16 text-green-600" />}
          soundType="scheduleConfirmed"
          onComplete={() => setShowScheduleConfirmed(false)}
        />
      )}

      {showManualCollection && (
        <AchievementAnimation
          title="Coleta Registrada!"
          description="Sua coleta manual foi registrada com sucesso."
          icon={<Package className="w-16 h-16 text-green-600" />}
          soundType="achievement"
          onComplete={() => setShowManualCollection(false)}
        />
      )}

      {showCoopRegister && (
        <AchievementAnimation
          title="Cadastro realizado!"
          description="Cooperado/Funcionário cadastrado com sucesso."
          icon={<User className="w-16 h-16 text-green-600" />}
          soundType="achievement"
          onComplete={() => setShowCoopRegister(false)}
        />
      )}

      {showCollectorRating && (
        <AchievementAnimation
          title="Avaliação Enviada!"
          description="Obrigado por avaliar o coletor. Sua opinião é muito importante!"
          icon={<Star className="w-16 h-16 text-yellow-500" />}
          soundType="avaliarstar"
          onComplete={() => setShowCollectorRating(false)}
        />
      )}

      {showColetaConfirmada && (
        <AchievementAnimation
          title="Coleta Confirmada!"
          description="A coleta foi confirmada com sucesso. Você pode iniciar a coleta quando chegar ao local."
          icon={<Package className="w-16 h-16 text-green-600" />}
          soundType="scheduleConfirmed"
          onComplete={() => setShowColetaConfirmada(false)}
        />
      )}

      {showCouponCreated && (
        <AchievementAnimation
          title="Cupom Criado!"
          description="Seu cupom foi criado com sucesso e já está disponível para os usuários."
          icon={<Ticket className="w-16 h-16 text-neutro" />}
          soundType="achievement"
          onComplete={() => setShowCouponCreated(false)}
        />
      )}

      {showSolicitanteRating && (
        <AchievementSolicitanteRating onComplete={() => setShowSolicitanteRating(false)} />
      )}

      {showBuyRecyclablesAnimation && (
        <AchievementAnimation
          title="Compra Registrada!"
          description="A compra de materiais foi registrada com sucesso."
          icon={<DollarSign className="w-16 h-16 text-green-600" />}
          soundType="money"
          onComplete={() => setShowBuyRecyclablesAnimation(false)}
        />
      )}

      {showRegisterSuccess && (
        <AchievementAnimation
          title="Cadastro concluído!"
          description="Seu cadastro foi realizado com sucesso."
          icon={<CheckCircle2 className="w-16 h-16 text-green-600" />}
          soundType="achievement"
          onComplete={() => setShowRegisterSuccess(false)}
        />
      )}

      {showColetaSolicitada && (
        <AchievementAnimation
          title="Coleta Solicitada!"
          description="Sua solicitação de coleta foi registrada com sucesso."
          icon={<Package className="w-16 h-16 text-green-600" />}
          soundType="scheduleConfirmed"
          onComplete={() => setShowColetaSolicitada(false)}
        />
      )}

      {showColetaAceita && (
        <AchievementAnimation
          title="Coleta Aceita!"
          description="A coleta foi aceita com sucesso. Você pode iniciar a coleta quando chegar ao local."
          icon={<CheckCircle2 className="w-16 h-16 text-green-600" />}
          soundType="scheduleConfirmed"
          onComplete={() => setShowColetaAceita(false)}
        />
      )}
    </div>
  );
};

export default AnimationsDemo; 