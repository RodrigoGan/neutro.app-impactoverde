import { useState, useCallback } from 'react';
import { Notification } from '@/components/dashboard/standard/StandardNotificationCard';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

interface UseNotificationActionsProps {
  notifications: Notification[];
  onUpdate: (updatedNotifications: Notification[]) => void;
}

export const useNotificationActions = ({ notifications, onUpdate }: UseNotificationActionsProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const updateNotification = useCallback(async (id: string, updates: Partial<Notification>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
      const updated = notifications.map(n => 
        n.id === id ? { ...n, ...updates } : n
      );
      onUpdate(updated);
      toast({
        title: "Notificação atualizada",
        description: "Status alterado com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a notificação.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [notifications, onUpdate]);

  const updateMultiple = useCallback(async (ids: string[], updates: Partial<Notification>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .update(updates)
        .in('id', ids);
      if (error) throw error;
      const updated = notifications.map(n => 
        ids.includes(n.id) ? { ...n, ...updates } : n
      );
      onUpdate(updated);
      toast({
        title: "Notificações atualizadas",
        description: `${ids.length} notificação(ões) atualizada(s) com sucesso.`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as notificações.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [notifications, onUpdate]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(notifications.map(n => n.id));
  }, [notifications]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    updateNotification(id, { read: true });
  }, [updateNotification]);

  const markAsUnread = useCallback((id: string) => {
    updateNotification(id, { read: false });
  }, [updateNotification]);

  const markAsResolved = useCallback((id: string) => {
    updateNotification(id, { status: 'resolvida' });
  }, [updateNotification]);

  const markAsUrgent = useCallback((id: string) => {
    updateNotification(id, { status: 'urgente' });
  }, [updateNotification]);

  const archive = useCallback((id: string) => {
    updateNotification(id, { status: 'arquivada' });
  }, [updateNotification]);

  const deleteNotification = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      if (error) throw error;
      const updated = notifications.filter(n => n.id !== id);
      onUpdate(updated);
      toast({
        title: "Notificação excluída",
        description: "Notificação removida com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a notificação.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [notifications, onUpdate]);

  const markSelectedAsRead = useCallback(() => {
    updateMultiple(selectedIds, { read: true });
    clearSelection();
  }, [selectedIds, updateMultiple, clearSelection]);

  const markSelectedAsUnread = useCallback(() => {
    updateMultiple(selectedIds, { read: false });
    clearSelection();
  }, [selectedIds, updateMultiple, clearSelection]);

  const archiveSelected = useCallback(() => {
    updateMultiple(selectedIds, { status: 'arquivada' });
    clearSelection();
  }, [selectedIds, updateMultiple, clearSelection]);

  const deleteSelected = useCallback(async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .in('id', selectedIds);
      if (error) throw error;
      const updated = notifications.filter(n => !selectedIds.includes(n.id));
      onUpdate(updated);
      toast({
        title: "Notificações excluídas",
        description: `${selectedIds.length} notificação(ões) removida(s) com sucesso.`
      });
      clearSelection();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir as notificações.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [notifications, selectedIds, onUpdate, clearSelection]);

  return {
    selectedIds,
    isLoading,
    toggleSelect,
    selectAll,
    clearSelection,
    markAsRead,
    markAsUnread,
    markAsResolved,
    markAsUrgent,
    archive,
    deleteNotification,
    markSelectedAsRead,
    markSelectedAsUnread,
    archiveSelected,
    deleteSelected
  };
}; 