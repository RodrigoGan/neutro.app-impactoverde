import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useFinancialGoal() {
  const [goal, setGoal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchGoal(userId: string) {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('financial_goals')
        .select('goal_value')
        .eq('user_id', userId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      setGoal(data?.goal_value ?? null);
    } catch (err: any) {
      setError('Erro ao buscar meta financeira.');
      setGoal(null);
    } finally {
      setLoading(false);
    }
  }

  async function saveGoal(userId: string, value: number) {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('financial_goals')
        .upsert({ user_id: userId, goal_value: value, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
      if (error) throw error;
      setGoal(value);
    } catch (err: any) {
      setError('Erro ao salvar meta financeira.');
    } finally {
      setLoading(false);
    }
  }

  return { goal, loading, error, fetchGoal, saveGoal };
} 