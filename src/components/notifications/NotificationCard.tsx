import React, { useState } from 'react';
import { Notification } from '@/components/dashboard/standard/StandardNotificationCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Bell, MapPin, Calendar, Clock, Check, Archive, Pin, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { SolicitarColetaBairroModal } from '@/components/collection/SolicitarColetaBairroModal';

interface NotificationCardProps {
  notification: Notification;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
  onResolve: (id: string) => void;
  onUrgent: (id: string) => void;
}

const badgeColors = {
  urgente: 'bg-red-100 text-red-700',
  alerta: 'bg-yellow-100 text-yellow-700',
  info: 'bg-blue-100 text-blue-700',
  novo: 'bg-green-100 text-green-700',
  coleta_bairro: 'bg-purple-100 text-purple-700',
};

const statusColors = {
  urgente: 'bg-red-50 text-red-700',
  pendente: 'bg-yellow-50 text-yellow-700',
  resolvida: 'bg-green-50 text-green-700',
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  isSelected,
  onSelect,
  onMarkAsRead,
  onMarkAsUnread,
  onArchive,
  onDelete,
  onPin,
  onResolve,
  onUrgent
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showColetaBairroModal, setShowColetaBairroModal] = useState(false);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'coleta_bairro':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Previne a propagação do clique se o clique foi no checkbox ou nos botões
    if (
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('input[type="checkbox"]')
    ) {
      return;
    }

    if (notification.type === 'coleta_bairro') {
      setShowColetaBairroModal(true);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          "relative rounded-lg border p-4 transition-all",
          statusColors[notification.status],
          !notification.read && "bg-muted/20",
          isExpanded && "shadow-lg",
          notification.type === 'coleta_bairro' && "cursor-pointer hover:bg-muted/50"
        )}
        onClick={handleCardClick}
      >
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(notification.id)}
            className="mt-1"
            aria-label={`Selecionar notificação ${notification.title}`}
          />
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-full ${badgeColors[notification.type]}`}>
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{notification.title}</h3>
                  <Badge variant="secondary" className={badgeColors[notification.type]}>
                    {notification.type === 'coleta_bairro' ? 'Coleta no Bairro' : notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
              </div>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 space-y-4"
                >
                  {notification.type === 'coleta_bairro' && notification.neighborhood && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{notification.neighborhood.name}</span>
                    </div>
                  )}
                  
                  {notification.collectionDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(notification.collectionDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  {notification.collectionPeriod && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{notification.collectionPeriod.charAt(0).toUpperCase() + notification.collectionPeriod.slice(1)}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    {!notification.read ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onMarkAsRead(notification.id)}
                        className="flex items-center gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Marcar como lida
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onMarkAsUnread(notification.id)}
                        className="flex items-center gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Marcar como não lida
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onArchive(notification.id)}
                      className="flex items-center gap-2"
                    >
                      <Archive className="h-4 w-4" />
                      Arquivar
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPin(notification.id)}
                      className="flex items-center gap-2"
                    >
                      <Pin className="h-4 w-4" />
                      Fixar
                    </Button>
                    
                    {notification.status !== 'resolvida' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onResolve(notification.id)}
                        className="flex items-center gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Resolver
                      </Button>
                    )}
                    
                    {notification.status !== 'urgente' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUrgent(notification.id)}
                        className="flex items-center gap-2"
                      >
                        <Bell className="h-4 w-4" />
                        Marcar como urgente
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(notification.id)}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={statusColors[notification.status]}>
              {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
            </Badge>
            {notification.type !== 'coleta_bairro' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8"
                aria-label={isExpanded ? "Recolher detalhes" : "Expandir detalhes"}
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {showColetaBairroModal && (
        <SolicitarColetaBairroModal
          open={showColetaBairroModal}
          onClose={() => setShowColetaBairroModal(false)}
          notification={notification}
        />
      )}
    </>
  );
}; 