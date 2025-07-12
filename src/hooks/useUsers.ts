import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface User {
  id: string;
  name: string;
  email: string;
  userType: string;
  level: {
    value: number;
    label: string;
    color: string;
  };
  avatar: {
    src: string;
    fallback: string;
  };
  stats?: any[];
  entity?: any;
  companyAffiliation?: any;
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      
      try {
        // Buscar usuários do banco de dados
        const { data, error } = await supabase
          .from('users')
          .select(`
            id,
            name,
            email,
            user_type,
            user_progress (
              current_level,
              total_points
            )
          `)
          .eq('is_active', true);

        if (error) {
          console.error('Erro ao buscar usuários:', error);
          setError('Erro ao buscar usuários');
          setUsers([]);
          return;
        }

        // Transformar dados para o formato esperado
        const transformedUsers: User[] = (data || []).map(user => {
          const level = user.user_progress?.[0]?.current_level || 1;
          const levelLabel = level <= 3 ? 'Bronze' : level <= 5 ? 'Prata' : 'Ouro';
          const levelColor = levelLabel === 'Bronze' ? 'bg-amber-500' : 
                           levelLabel === 'Prata' ? 'bg-gray-400' : 'bg-yellow-400';

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            userType: user.user_type,
            level: {
              value: level,
              label: levelLabel,
              color: levelColor
            },
            avatar: {
              src: '',
              fallback: user.name.slice(0, 2).toUpperCase()
            }
          };
        });

        setUsers(transformedUsers);
      } catch (err) {
        console.error('Erro inesperado ao buscar usuários:', err);
        setError('Erro inesperado ao buscar usuários');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error
  };
}; 