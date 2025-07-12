import React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'coleta' | 'nivel' | 'cupom' | 'meta';
  read: boolean;
  date: string;
}

const NotificationPopover = () => {
  // Exemplo de notificações
  const notifications: Notification[] = [
    {
      id: '1',
      title: 'Coleta Agendada',
      description: 'Sua coleta está marcada para amanhã às 14:30',
      type: 'coleta',
      read: false,
      date: '2024-03-20'
    },
    {
      id: '2',
      title: 'Novo Nível Próximo',
      description: 'Faltam apenas 50 pontos para o nível Ouro!',
      type: 'nivel',
      read: false,
      date: '2024-03-19'
    },
    {
      id: '3',
      title: 'Cupom Disponível',
      description: 'Você desbloqueou um novo cupom de desconto',
      type: 'cupom',
      read: true,
      date: '2024-03-18'
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-neutro text-white"
              variant="default"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notificações</h4>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="bg-neutro/10 text-neutro">
              {unreadCount} não lidas
            </Badge>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          <div className="space-y-1">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                className={cn(
                  "w-full text-left p-4 hover:bg-muted/50",
                  "border-b last:border-0",
                  !notification.read && "bg-muted/20"
                )}
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {notification.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {notification.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(notification.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPopover; 