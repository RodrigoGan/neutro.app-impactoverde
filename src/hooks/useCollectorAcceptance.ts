import { useState, useCallback } from 'react';
import { useNeighborhoodNotifications } from './useNeighborhoodNotifications';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

interface AcceptCollectionParams {
  collectorId: string;
  neighborhoodId: string;
  date: string;
  period: 'manha' | 'tarde' | 'noite';
  collectionId?: string; // ID da coleta específica
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useCollectorAcceptance = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { sendNeighborhoodNotifications, error: notificationError } = useNeighborhoodNotifications();

  const acceptCollection = useCallback(async ({
    collectorId,
    neighborhoodId,
    date,
    period,
    collectionId,
    onSuccess,
    onError
  }: AcceptCollectionParams) => {
    try {
      setIsLoading(true);

      console.log('🔄 Aceitando coleta:', { collectorId, neighborhoodId, date, period, collectionId });

      // 1. Atualizar o status da coleta no banco de dados
      if (collectionId) {
        // Atualizar coleta específica
        const { error: updateError } = await supabase
          .from('collections')
          .update({ 
            status: 'accepted',
            collector_id: collectorId,
            accepted_at: new Date().toISOString()
          })
          .eq('id', collectionId);

        if (updateError) throw updateError;
      } else {
        // Criar nova coleta agendada
        const { error: insertError } = await supabase
          .from('collections')
          .insert({
            collector_id: collectorId,
            neighborhood_id: neighborhoodId,
            date: date,
            period: period,
            status: 'accepted',
            collection_type: 'scheduled',
            created_at: new Date().toISOString(),
            accepted_at: new Date().toISOString()
          });

        if (insertError) throw insertError;
      }

      // 2. Enviar notificações para os usuários do bairro
      const notificationsSent = await sendNeighborhoodNotifications({
        collectorId,
        neighborhoodId,
        date,
        period
      });

      // 3. Registrar log da ação
      const { error: logError } = await supabase
        .from('audit_logs')
        .insert({
          action: 'collection_accepted',
          user_id: collectorId,
          entity_type: 'collection',
          entity_id: collectionId || 'new',
          details: {
            neighborhoodId,
            date,
            period,
            notificationsSent
          },
          created_at: new Date().toISOString()
        });

      if (logError) {
        console.warn('⚠️ Erro ao registrar log:', logError);
      }

      console.log('✅ Coleta aceita com sucesso');
      toast.success('Coleta aceita com sucesso!');
      onSuccess?.();

    } catch (error) {
      console.error('❌ Erro ao aceitar coleta:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao aceitar coleta';
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [sendNeighborhoodNotifications]);

  return {
    acceptCollection,
    isLoading,
    error: notificationError
  };
}; 