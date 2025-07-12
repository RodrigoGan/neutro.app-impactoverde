import React from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NeighborhoodNotificationStatusProps {
  isLoading: boolean;
  error: string | null;
  notificationsSent: number;
  neighborhoodName: string;
  date: string;
  period: 'manha' | 'tarde' | 'noite';
}

const periodLabels = {
  manha: 'Manhã',
  tarde: 'Tarde',
  noite: 'Noite'
};

export const NeighborhoodNotificationStatus: React.FC<NeighborhoodNotificationStatusProps> = ({
  isLoading,
  error,
  notificationsSent,
  neighborhoodName,
  date,
  period
}) => {
  const formattedDate = format(new Date(date), "dd 'de' MMMM", { locale: ptBR });

  if (isLoading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
        <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
        <p className="text-blue-700">
          Enviando notificações para os moradores do bairro {neighborhoodName}...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <p className="text-red-700">
          Erro ao enviar notificações: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-2">
        <CheckCircle2 className="h-5 w-5 text-green-500" />
        <h3 className="text-green-700 font-medium">
          Notificações enviadas com sucesso!
        </h3>
      </div>
      <p className="text-green-600 text-sm">
        {notificationsSent} moradores do bairro {neighborhoodName} foram notificados sobre a coleta do dia {formattedDate} no período da {periodLabels[period]}.
      </p>
    </div>
  );
}; 