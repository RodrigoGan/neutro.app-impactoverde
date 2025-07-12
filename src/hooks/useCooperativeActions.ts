import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface CooperativeAction {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'Agendado' | 'Pendente' | 'Concluído' | 'Cancelado';
  cooperative_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const useCooperativeActions = (cooperativeId?: string) => {
  const [actions, setActions] = useState<CooperativeAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchActions() {
      if (!cooperativeId) {
        setLoading(false);
        setActions([]);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        // Buscar ações da cooperativa do banco de dados
        const { data, error } = await supabase
          .from('cooperative_actions')
          .select(`
            id,
            title,
            description,
            date,
            status,
            cooperative_id,
            created_at,
            updated_at
          `)
          .eq('cooperative_id', cooperativeId)
          .eq('is_active', true)
          .order('date', { ascending: true });

        if (error) {
          console.error('Erro ao buscar ações da cooperativa:', error);
          setError('Erro ao buscar ações da cooperativa');
          setActions([]);
          return;
        }

        // Transformar dados para o formato esperado
        const transformedActions: CooperativeAction[] = (data || []).map(action => ({
          id: action.id,
          title: action.title,
          description: action.description,
          date: action.date,
          status: action.status as 'Agendado' | 'Pendente' | 'Concluído' | 'Cancelado',
          cooperative_id: action.cooperative_id,
          created_at: action.created_at,
          updated_at: action.updated_at
        }));

        setActions(transformedActions);
      } catch (err) {
        console.error('Erro inesperado ao buscar ações:', err);
        setError('Erro inesperado ao buscar ações');
        setActions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchActions();
  }, [cooperativeId]);

  // Função para criar nova ação
  const createAction = async (actionData: Omit<CooperativeAction, 'id' | 'created_at' | 'updated_at'>) => {
    if (!cooperativeId) return { error: 'ID da cooperativa não fornecido' };

    try {
      const { data, error } = await supabase
        .from('cooperative_actions')
        .insert({
          ...actionData,
          cooperative_id: cooperativeId,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar ação:', error);
        return { error: 'Erro ao criar ação' };
      }

      // Atualizar lista local
      setActions(prev => [...prev, data]);
      return { data };
    } catch (err) {
      console.error('Erro inesperado ao criar ação:', err);
      return { error: 'Erro inesperado ao criar ação' };
    }
  };

  // Função para atualizar ação
  const updateAction = async (actionId: string, actionData: Partial<CooperativeAction>) => {
    try {
      const { data, error } = await supabase
        .from('cooperative_actions')
        .update({
          ...actionData,
          updated_at: new Date().toISOString()
        })
        .eq('id', actionId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar ação:', error);
        return { error: 'Erro ao atualizar ação' };
      }

      // Atualizar lista local
      setActions(prev => prev.map(action => 
        action.id === actionId ? { ...action, ...data } : action
      ));
      return { data };
    } catch (err) {
      console.error('Erro inesperado ao atualizar ação:', err);
      return { error: 'Erro inesperado ao atualizar ação' };
    }
  };

  // Função para excluir ação
  const deleteAction = async (actionId: string) => {
    try {
      const { error } = await supabase
        .from('cooperative_actions')
        .update({ is_active: false })
        .eq('id', actionId);

      if (error) {
        console.error('Erro ao excluir ação:', error);
        return { error: 'Erro ao excluir ação' };
      }

      // Atualizar lista local
      setActions(prev => prev.filter(action => action.id !== actionId));
      return { success: true };
    } catch (err) {
      console.error('Erro inesperado ao excluir ação:', err);
      return { error: 'Erro inesperado ao excluir ação' };
    }
  };

  return {
    actions,
    loading,
    error,
    createAction,
    updateAction,
    deleteAction
  };
}; 