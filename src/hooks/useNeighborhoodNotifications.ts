import { useState, useCallback } from 'react';
import { NeighborhoodNotificationService } from '@/services/NeighborhoodNotificationService';
import { Notification } from '@/components/dashboard/standard/StandardNotificationCard';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

interface SendNeighborhoodNotificationsParams {
  collectorId: string;
  neighborhoodId: string;
  date: string;
  period: 'manha' | 'tarde' | 'noite';
}

export const useNeighborhoodNotifications = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const notificationService = NeighborhoodNotificationService.getInstance();

  const sendNeighborhoodNotifications = useCallback(async ({
    collectorId,
    neighborhoodId,
    date,
    period
  }: SendNeighborhoodNotificationsParams): Promise<number> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Enviando notificações para o bairro:', { collectorId, neighborhoodId, date, period });

      // 1. Buscar usuários do bairro
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('neighborhood_id', neighborhoodId)
        .eq('user_type', 'common_user');

      if (usersError) throw usersError;

      if (!users || users.length === 0) {
        console.log('ℹ️ Nenhum usuário encontrado no bairro');
        return 0;
      }

      // 2. Buscar informações do coletor
      const { data: collector, error: collectorError } = await supabase
        .from('users')
        .select('id, name, rating')
        .eq('id', collectorId)
        .single();

      if (collectorError) throw collectorError;

      // 3. Criar notificação para cada usuário do bairro
      const notificationsToInsert = users.map(user => ({
        title: 'Coleta Agendada no Seu Bairro',
        description: `O coletor ${collector.name} estará no seu bairro ${date} no período da ${period}. Prepare seus reciclados!`,
        type: 'collection_scheduled',
        status: 'pending',
        read: false,
        user_types: ['common_user'],
        recipients: [user.id],
        sender: collectorId,
        neighborhood_id: neighborhoodId,
        collection_date: date,
        collection_period: period,
        collector_id: collectorId
      }));

      // 4. Inserir notificações no banco
      const { data: insertedNotifications, error: insertError } = await supabase
        .from('notifications')
        .insert(notificationsToInsert)
        .select();

      if (insertError) throw insertError;

      const notificationsSent = insertedNotifications?.length || 0;

      console.log('✅ Notificações enviadas com sucesso:', notificationsSent);
      toast.success(`${notificationsSent} notificações enviadas para o bairro`);

      return notificationsSent;

    } catch (err) {
      console.error('❌ Erro ao enviar notificações:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar notificações';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createNeighborhoodNotification = useCallback((
    collectorId: string,
    neighborhoodId: string,
    date: string,
    period: 'manha' | 'tarde' | 'noite'
  ): Notification => {
    return notificationService.createNeighborhoodNotification(
      collectorId,
      neighborhoodId,
      date,
      period
    );
  }, []);

  return {
    isLoading,
    error,
    sendNeighborhoodNotifications,
    createNeighborhoodNotification
  };
}; 