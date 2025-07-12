import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'urgente' | 'alerta' | 'info' | 'novo' | 'coleta_bairro';
  status: 'urgente' | 'pendente' | 'resolvida' | 'arquivada';
  read: boolean;
  date: string;
  userTypes: Array<'common_user' | 'individual_collector' | 'cooperative_owner' | 'collector_company_owner' | 'partner_owner'>;
  recipients?: string[];
  sender?: string;
  // Campos específicos para notificações de bairro
  neighborhood?: {
    id: string;
    name: string;
  };
  collector?: {
    id: string;
    name: string;
    rating?: number;
  };
  collectionDate?: string;
  collectionPeriod?: 'manha' | 'tarde' | 'noite';
}

interface StandardNotificationCardProps {
  notifications: Notification[];
  showCounters?: boolean;
  onSeeAll?: () => void;
}

const statusColors = {
  urgente: 'bg-red-50 text-red-700',
  pendente: 'bg-yellow-50 text-yellow-700',
  resolvida: 'bg-green-50 text-green-700',
};

const badgeColors = {
  urgente: 'bg-red-100 text-red-700',
  alerta: 'bg-yellow-100 text-yellow-700',
  info: 'bg-blue-100 text-blue-700',
  novo: 'bg-green-100 text-green-700',
  coleta_bairro: 'bg-purple-100 text-purple-700',
};

// Função utilitária para formatar datas mocks dd/mm/aaaa HH:mm
function formatDateBR(dateStr: string) {
  // Tenta dd/mm/aaaa HH:mm
  const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s(\d{2}:\d{2}))?$/);
  if (match) {
    const [_, day, month, year, hour] = match;
    return hour ? `${day}/${month}/${year} ${hour}` : `${day}/${month}/${year}`;
  }
  // Tenta yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }
  // Tenta yyyy-mm-dd HH:mm
  const match2 = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})\s(\d{2}:\d{2})$/);
  if (match2) {
    const [_, year, month, day, hour] = match2;
    return `${day}/${month}/${year} ${hour}`;
  }
  return dateStr;
}

export const StandardNotificationCard: React.FC<StandardNotificationCardProps> = ({
  notifications,
  showCounters = false,
  onSeeAll
}) => {
  const urgentes = notifications.filter(n => n.status === 'urgente').length;
  const pendentes = notifications.filter(n => n.status === 'pendente').length;
  const resolvidas = notifications.filter(n => n.status === 'resolvida').length;
  const recent = notifications.slice(0, 3);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'coleta_bairro':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-neutro" />
          Notificações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {showCounters && (
            <div className="grid grid-cols-3 gap-4">
              <div className="p-2 rounded-lg bg-red-50">
                <p className="text-sm font-medium text-red-700">Urgentes</p>
                <p className="text-2xl font-bold text-red-700">{urgentes}</p>
              </div>
              <div className="p-2 rounded-lg bg-yellow-50">
                <p className="text-sm font-medium text-yellow-700">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-700">{pendentes}</p>
              </div>
              <div className="p-2 rounded-lg bg-green-50">
                <p className="text-sm font-medium text-green-700">Resolvidas</p>
                <p className="text-2xl font-bold text-green-700">{resolvidas}</p>
              </div>
            </div>
          )}
          <div className="space-y-3">
            {recent.length === 0 ? (
              <div className="text-center text-muted-foreground py-6">
                Você está em dia! Nenhuma notificação por aqui.
              </div>
            ) : (
              recent.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${statusColors[n.status]} ${!n.read ? 'bg-muted/20' : ''}`}
                >
                  <div className={`p-2 rounded-full ${badgeColors[n.type]}`}>
                    {getNotificationIcon(n.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{n.title}</p>
                      <Badge variant="secondary" className={`${badgeColors[n.type]} text-xs`}>
                        {n.type === 'coleta_bairro' ? 'Coleta no Bairro' : n.type.charAt(0).toUpperCase() + n.type.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{n.description}</p>
                    {n.type === 'coleta_bairro' && n.neighborhood && (
                      <p className="text-xs text-muted-foreground mt-1">
                        <MapPin className="inline-block h-3 w-3 mr-1" />
                        {n.neighborhood.name}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{formatDateBR(n.date)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <Button variant="outline" className="w-full" onClick={onSeeAll}>
            <Bell className="mr-2 h-4 w-4" />
            Ver Todas as Notificações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StandardNotificationCard; 