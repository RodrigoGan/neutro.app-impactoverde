import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status: 'active' | 'inactive';
  joinDate: string;
  performance?: {
    rating?: number;
    collections?: number;
    points?: number;
  };
}

export interface TeamData {
  members: TeamMember[];
  totalMembers: number;
  activeMembers: number;
  averageRating?: number;
  averageCollections?: number;
  averagePoints?: number;
}

const useTeamManagement = (entityId?: string, entityType?: string) => {
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeamData() {
      if (!entityId || !entityType) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('🔄 Buscando dados de equipe para:', entityType, entityId);

        let members: TeamMember[] = [];

        // Buscar membros baseado no tipo de entidade
        if (entityType === 'cooperative') {
          // Buscar membros da cooperativa
          const { data: cooperativeMembers, error: cooperativeError } = await supabase
            .from('users')
            .select(`
              id,
              name,
              email,
              role,
              avatar_url,
              created_at,
              user_progress (
                total_points,
                current_level
              )
            `)
            .eq('entity_id', entityId)
            .eq('user_type', 'individual_collector');

          if (cooperativeError) {
            setTeamData({ members: [], totalMembers: 0, activeMembers: 0 });
            setLoading(false);
            setError('Erro ao buscar membros da cooperativa.');
            return;
          }

          members = (cooperativeMembers || []).map(member => ({
            id: member.id,
            name: member.name,
            email: member.email,
            role: member.role || 'Coletor',
            avatar: member.avatar_url,
            status: 'active' as const,
            joinDate: member.created_at,
            performance: {
              points: member.user_progress?.[0]?.total_points || 0,
              rating: member.user_progress?.[0]?.current_level || 1
            }
          }));

        } else if (entityType === 'collector_company') {
          // Buscar funcionários da empresa coletora
          const { data: companyEmployees, error: companyError } = await supabase
            .from('users')
            .select(`
              id,
              name,
              email,
              role,
              avatar_url,
              created_at,
              status,
              permissions
            `)
            .eq('entity_id', entityId)
            .eq('user_type', 'employee');

          if (companyError) {
            setTeamData({ members: [], totalMembers: 0, activeMembers: 0 });
            setLoading(false);
            setError('Erro ao buscar funcionários da empresa.');
            return;
          }

          members = (companyEmployees || []).map(member => ({
            id: member.id,
            name: member.name,
            email: member.email,
            role: member.role || 'Funcionário',
            avatar: member.avatar_url,
            status: member.status === 'Ativo' ? 'active' : 'inactive',
            joinDate: member.created_at,
            permissions: member.permissions || {},
          }));

        } else if (entityType === 'partner') {
          // Buscar funcionários do parceiro
          const { data: partnerEmployees, error: partnerError } = await supabase
            .from('users')
            .select(`
              id,
              name,
              email,
              role,
              avatar_url,
              created_at
            `)
            .eq('entity_id', entityId)
            .in('user_type', ['restaurant_employee', 'store_employee', 'educational_employee']);

          if (partnerError) {
            setTeamData({ members: [], totalMembers: 0, activeMembers: 0 });
            setLoading(false);
            setError('Erro ao buscar funcionários do parceiro.');
            return;
          }

          members = (partnerEmployees || []).map(employee => ({
            id: employee.id,
            name: employee.name,
            email: employee.email,
            role: employee.role || 'Funcionário',
            avatar: employee.avatar_url,
            status: 'active' as const,
            joinDate: employee.created_at
          }));
        }

        // Calcular estatísticas da equipe
        const totalMembers = members.length;
        const activeMembers = members.filter(m => m.status === 'active').length;
        const averageRating = members.length > 0 
          ? members.reduce((sum, m) => sum + (m.performance?.rating || 0), 0) / members.length 
          : 0;
        const averagePoints = members.length > 0 
          ? members.reduce((sum, m) => sum + (m.performance?.points || 0), 0) / members.length 
          : 0;

        const teamData: TeamData = {
          members,
          totalMembers,
          activeMembers,
          averageRating,
          averagePoints
        };

        console.log('✅ Dados de equipe carregados:', teamData);
        setTeamData(teamData);

      } catch (err) {
        console.error('❌ Erro ao buscar dados de equipe:', err);
        setTeamData({ members: [], totalMembers: 0, activeMembers: 0 });
        setError('Erro ao buscar dados de equipe.');
      } finally {
        setLoading(false);
      }
    }

    fetchTeamData();
  }, [entityId, entityType]);

  return {
    teamData,
    loading,
    error
  };
};

// Função para editar funcionário (fora do hook!)
async function updateEmployee({ id, name, email, phone, role, status, permissions }: {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  permissions: Record<string, boolean>;
}) {
  const { error } = await supabase.from('users').update({
    name,
    email,
    phone,
    role,
    status,
    permissions
  }).eq('id', id);
  return error;
}

export { useTeamManagement, updateEmployee }; 