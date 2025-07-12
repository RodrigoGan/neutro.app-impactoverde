import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, TrendingDown, CheckCircle, Clock } from 'lucide-react';
import { usePoints } from '@/hooks/usePoints';
import { LevelNotification } from '@/services/PointsService';

interface LevelNotificationsProps {
  className?: string;
  limit?: number;
}

export const LevelNotifications: React.FC<LevelNotificationsProps> = ({
  className = '',
  limit = 5
}) => {
  const { getLevelNotifications } = usePoints();
  const [notifications, setNotifications] = useState<LevelNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const notifs = await getLevelNotifications(limit);
      setNotifications(notifs);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'protection':
        return <Shield className="w-5 h-5 text-blue-500" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'drop':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'protection':
        return 'bg-blue-50 border-blue-200';
      case 'alert':
        return 'bg-orange-50 border-orange-200';
      case 'drop':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'protection':
        return <Badge className="bg-blue-100 text-blue-700">Proteção</Badge>;
      case 'alert':
        return <Badge className="bg-orange-100 text-orange-700">Alerta</Badge>;
      case 'drop':
        return <Badge className="bg-red-100 text-red-700">Queda</Badge>;
      default:
        return <Badge variant="outline">Notificação</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-blue-500" />
            Notificações de Nível
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhuma notificação de nível encontrada</p>
          <p className="text-sm text-gray-400 mt-1">
            As notificações aparecerão aqui quando houver mudanças no seu nível
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="w-5 h-5 text-blue-500" />
          Notificações de Nível
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border ${getNotificationColor(notification.notificationType)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getNotificationIcon(notification.notificationType)}
                <span className="font-medium text-sm">
                  {notification.notificationType === 'protection' && 'Proteção Ativada'}
                  {notification.notificationType === 'alert' && 'Alerta de Performance'}
                  {notification.notificationType === 'drop' && 'Queda de Nível'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {getNotificationBadge(notification.notificationType)}
                {notification.readAt && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-700 mb-3">
              {notification.message}
            </p>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {notification.sentAt.toLocaleDateString('pt-BR')} às{' '}
                {notification.sentAt.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
              {!notification.readAt && (
                <span className="text-blue-600 font-medium">Não lida</span>
              )}
            </div>

            {/* Ações requeridas */}
            {notification.actionRequired?.requiredImprovements && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-700 mb-2">Melhorias necessárias:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {notification.actionRequired.requiredImprovements.collections && (
                    <div>
                      <span className="text-gray-600">Coletas:</span>
                      <span className="font-medium ml-1">
                        {notification.actionRequired.requiredImprovements.collections}/mês
                      </span>
                    </div>
                  )}
                  {notification.actionRequired.requiredImprovements.kg && (
                    <div>
                      <span className="text-gray-600">Kg:</span>
                      <span className="font-medium ml-1">
                        {notification.actionRequired.requiredImprovements.kg}/mês
                      </span>
                    </div>
                  )}
                  {notification.actionRequired.requiredImprovements.rating && (
                    <div>
                      <span className="text-gray-600">Avaliação:</span>
                      <span className="font-medium ml-1">
                        {notification.actionRequired.requiredImprovements.rating}+
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {notifications.length >= limit && (
          <div className="text-center pt-2">
            <Button variant="outline" size="sm" onClick={loadNotifications}>
              Ver mais notificações
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 