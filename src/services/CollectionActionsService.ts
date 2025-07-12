import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export interface CollectionActionData {
  materials?: any[];
  photos?: string[];
  observations?: string;
  cancellationReason?: string;
  cancellationNote?: string;
}

export interface CollectionOccurrence {
  id: string | number;
  data: Date;
  horario: string;
  status: 'scheduled' | 'collected' | 'cancelled';
  materiais: any[];
  observacao?: string;
  fotos?: string[];
  avaliacao?: {
    estrelas: number;
    comentario: string;
    avaliadoPor: string;
  };
}

export interface CollectionActionsService {
  registerCollection: (collectionId: string, data: CollectionActionData) => Promise<boolean>;
  editCollection: (collectionId: string, data: CollectionActionData) => Promise<boolean>;
  cancelCollection: (collectionId: string, reason: string, note?: string) => Promise<boolean>;
  cancelNextOccurrence: (collectionId: string, reason: string, note?: string) => Promise<boolean>;
  acceptCollection: (collectionId: string, observations?: string) => Promise<boolean>;
  rejectCollection: (collectionId: string, reason: string) => Promise<boolean>;
}

class CollectionActionsServiceImpl implements CollectionActionsService {
  async registerCollection(collectionId: string, data: CollectionActionData): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('collections')
        .update({
          status: 'collected',
          collected_materials: data.materials || [],
          photos: data.photos || [],
          observations: data.observations,
          collected_at: new Date().toISOString(),
        })
        .eq('id', collectionId);

      if (error) {
        console.error('Erro ao registrar coleta:', error);
        toast.error('Erro ao registrar coleta');
        return false;
      }

      toast.success('Coleta registrada com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao registrar coleta:', error);
      toast.error('Erro ao registrar coleta');
      return false;
    }
  }

  async editCollection(collectionId: string, data: CollectionActionData): Promise<boolean> {
    try {
      const updateData: any = {};
      
      if (data.materials) {
        updateData.collected_materials = data.materials;
      }
      if (data.photos) {
        updateData.photos = data.photos;
      }
      if (data.observations) {
        updateData.observations = data.observations;
      }

      const { error } = await supabase
        .from('collections')
        .update(updateData)
        .eq('id', collectionId);

      if (error) {
        console.error('Erro ao editar coleta:', error);
        toast.error('Erro ao editar coleta');
        return false;
      }

      toast.success('Coleta editada com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao editar coleta:', error);
      toast.error('Erro ao editar coleta');
      return false;
    }
  }

  async cancelCollection(collectionId: string, reason: string, note?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('collections')
        .update({
          status: 'cancelled',
          cancellation_reason: reason,
          cancellation_note: note,
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', collectionId);

      if (error) {
        console.error('Erro ao cancelar coleta:', error);
        toast.error('Erro ao cancelar coleta');
        return false;
      }

      toast.success('Coleta cancelada com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao cancelar coleta:', error);
      toast.error('Erro ao cancelar coleta');
      return false;
    }
  }

  async cancelNextOccurrence(collectionId: string, reason: string, note?: string): Promise<boolean> {
    try {
      // Primeiro, buscar a coleta atual para obter as ocorrências
      const { data: collection, error: fetchError } = await supabase
        .from('collections')
        .select('occurrences, recurring_pattern, collection_type')
        .eq('id', collectionId)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar coleta:', fetchError);
        toast.error('Erro ao buscar coleta');
        return false;
      }

      if (collection.collection_type !== 'recorrente') {
        toast.error('Esta função é apenas para coletas recorrentes');
        return false;
      }

      // Processar ocorrências
      let occurrences: CollectionOccurrence[] = collection.occurrences || [];
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      // Encontrar próxima ocorrência agendada
      const proximas = occurrences.filter(o => 
        o.status === 'scheduled' && new Date(o.data) >= hoje
      );

      if (proximas.length === 0) {
        toast.error('Nenhuma próxima coleta agendada encontrada');
        return false;
      }

      // Ordenar por data e pegar a mais próxima
      proximas.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
      const proximaOcorrencia = proximas[0];

      // Cancelar a próxima ocorrência
      const novasOcorrencias = occurrences.map(o =>
        o.id === proximaOcorrencia.id
          ? { ...o, status: 'cancelled' as const, observacao: reason }
          : o
      );

      // Gerar nova ocorrência futura baseada na frequência
      const recurringPattern = collection.recurring_pattern || {};
      const frequencia = recurringPattern.frequency || 'semanal';
      
      let novaData = new Date(proximaOcorrencia.data);
      if (frequencia === 'semanal') {
        novaData.setDate(novaData.getDate() + 7);
      } else if (frequencia === 'quinzenal') {
        novaData.setDate(novaData.getDate() + 14);
      } else if (frequencia === 'mensal') {
        novaData.setMonth(novaData.getMonth() + 1);
      }

      const novaOcorrencia: CollectionOccurrence = {
        ...proximaOcorrencia,
        id: `${proximaOcorrencia.id}-next-${novaData.getTime()}`,
        data: novaData,
        status: 'scheduled',
        observacao: undefined,
        fotos: [],
        avaliacao: undefined,
        materiais: proximaOcorrencia.materiais.map(m => ({ ...m, fotos: [] })),
      };

      const todasOcorrencias = [...novasOcorrencias, novaOcorrencia];

      // Atualizar a coleta com as novas ocorrências
      const { error: updateError } = await supabase
        .from('collections')
        .update({
          occurrences: todasOcorrencias,
        })
        .eq('id', collectionId);

      if (updateError) {
        console.error('Erro ao atualizar ocorrências:', updateError);
        toast.error('Erro ao cancelar próxima coleta');
        return false;
      }

      toast.success('Próxima coleta cancelada com sucesso! Nova ocorrência agendada.');
      return true;
    } catch (error) {
      console.error('Erro ao cancelar próxima ocorrência:', error);
      toast.error('Erro ao cancelar próxima coleta');
      return false;
    }
  }

  async acceptCollection(collectionId: string, observations?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('collections')
        .update({
          status: 'scheduled',
          collector_observations: observations,
          accepted_at: new Date().toISOString(),
        })
        .eq('id', collectionId);

      if (error) {
        console.error('Erro ao aceitar coleta:', error);
        toast.error('Erro ao aceitar coleta');
        return false;
      }

      toast.success('Coleta aceita com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao aceitar coleta:', error);
      toast.error('Erro ao aceitar coleta');
      return false;
    }
  }

  async rejectCollection(collectionId: string, reason: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('collections')
        .update({
          status: 'cancelled',
          cancellation_reason: reason,
          cancelled_by: 'collector',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', collectionId);

      if (error) {
        console.error('Erro ao recusar coleta:', error);
        toast.error('Erro ao recusar coleta');
        return false;
      }

      toast.success('Coleta recusada com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao recusar coleta:', error);
      toast.error('Erro ao recusar coleta');
      return false;
    }
  }
}

export const collectionActionsService = new CollectionActionsServiceImpl(); 