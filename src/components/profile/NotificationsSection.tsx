import React from 'react';
import { NotificationPreference } from '@/types/user';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface NotificationsSectionProps {
  preferences: NotificationPreference[];
  onUpdatePreferences: (preferences: NotificationPreference[]) => void;
}

export const NotificationsSection: React.FC<NotificationsSectionProps> = ({
  preferences,
  onUpdatePreferences
}) => {
  const handleToggleType = (type: 'email' | 'push', enabled: boolean) => {
    const updatedPreferences = preferences.map(pref => 
      pref.type === type ? { ...pref, enabled } : pref
    );
    onUpdatePreferences(updatedPreferences);
    toast({
      title: "Preferências atualizadas",
      description: `Notificações por ${type} foram ${enabled ? 'ativadas' : 'desativadas'}.`
    });
  };

  const handleToggleCategory = (
    type: 'email' | 'push',
    category: keyof NotificationPreference['categories'],
    enabled: boolean
  ) => {
    const updatedPreferences = preferences.map(pref =>
      pref.type === type
        ? {
            ...pref,
            categories: {
              ...pref.categories,
              [category]: enabled
            }
          }
        : pref
    );
    onUpdatePreferences(updatedPreferences);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-5 w-5" />;
      case 'sms':
        return <MessageSquare className="h-5 w-5" />;
      case 'push':
        return <Bell className="h-5 w-5" />;
      default:
        return <Smartphone className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'email':
        return 'E-mail';
      case 'sms':
        return 'SMS';
      case 'push':
        return 'Notificações Push';
      default:
        return type;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'collections':
        return 'Coletas';
      case 'achievements':
        return 'Conquistas';
      case 'promotions':
        return 'Promoções';
      case 'system':
        return 'Sistema';
      default:
        return category;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {preferences
          .filter((preference) => preference.type === 'email' || preference.type === 'push')
          .map((preference) => (
            <Card key={preference.type}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {getIcon(preference.type)}
                    <span className="font-medium">{getTypeLabel(preference.type)}</span>
                  </div>
                  <Switch
                    checked={preference.enabled}
                    onCheckedChange={(checked) => 
                      handleToggleType(preference.type as 'email' | 'push', checked)
                    }
                  />
                </div>

                <div className="space-y-3 mt-4">
                  {Object.entries(preference.categories).map(([category, enabled]) => (
                    <div key={category} className="flex items-center justify-between">
                      <label className="text-sm text-muted-foreground">
                        {getCategoryLabel(category)}
                      </label>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => 
                          handleToggleCategory(
                            preference.type as 'email' | 'push',
                            category as keyof NotificationPreference['categories'],
                            checked
                          )
                        }
                        disabled={!preference.enabled}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}; 