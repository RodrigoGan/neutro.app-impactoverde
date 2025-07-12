import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, CalendarCheck2, ChevronLeft } from 'lucide-react';
import StandardCollectionHistoryCard from '@/components/collection/StandardCollectionHistoryCard';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useActiveSchedules, UserType } from '@/hooks/useActiveSchedules';
import { collectionActionsService, CollectionActionData } from '@/services/CollectionActionsService';

const ActiveSchedules: React.FC = () => {
  const [tab, setTab] = useState<'simples' | 'recorrente'>('simples');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Recebendo informações do perfil
  const userType = location.state?.userType as UserType || "common_user";
  const userId = location.state?.userId;
  const entityId = location.state?.entityId;

  // Hook para buscar agendamentos ativos reais
  const { schedules, total, loading, error, refresh } = useActiveSchedules({
    userType,
    userId,
    entityId,
    filters: {
      tipoColeta: tab,
    },
  });

  // Mapear dados do banco para o formato esperado pelo card
  const mappedSchedules = schedules.map(schedule => ({
    id: schedule.id,
    status: schedule.status,
    tipoColeta: schedule.collection_type,
    data: new Date(schedule.date),
    hora: schedule.time,
    endereco: schedule.address || 'Endereço não informado',
    bairro: schedule.neighborhood || 'Bairro não informado',
    cidade: schedule.city || 'Cidade não informada',
    estado: schedule.state || 'Estado não informado',
    materiais: schedule.materials || schedule.collected_materials || [],
    fotos: schedule.photos || [],
    observacoes: schedule.observations,
    frequencia: schedule.recurring_pattern?.frequency,
    diasSemana: schedule.recurring_pattern?.days,
    coletor: schedule.collector_info ? {
      nome: schedule.collector_info.name || 'Coletor não informado',
      foto: schedule.collector_info.photo,
      avaliacaoMedia: schedule.collector_info.rating_average,
      totalColetas: schedule.collector_info.total_collections,
      veiculoType: schedule.collector_info.vehicle_type,
    } : undefined,
    solicitante: schedule.solicitante_info ? {
      nome: schedule.solicitante_info.name || 'Solicitante não informado',
      foto: schedule.solicitante_info.photo,
      avaliacaoMedia: schedule.solicitante_info.rating_average,
      totalColetas: schedule.solicitante_info.total_collections,
    } : undefined,
    cancellationReason: schedule.cancellation_reason,
    quemCancelou: schedule.cancelled_by,
    ocorrencias: schedule.occurrences || [],
  }));

  // Funções de ação implementadas para atualizar o banco
  const handleRegister = async (id: string | number) => {
    const success = await collectionActionsService.registerCollection(
      id.toString(),
      {
        materials: [],
        photos: [],
        observations: '',
      }
    );
    
    if (success) {
      // Recarregar os dados após a ação
      refresh();
    }
  };

  const handleEdit = async (id: string | number, dados: CollectionActionData) => {
    const success = await collectionActionsService.editCollection(
      id.toString(),
      dados
    );
    
    if (success) {
      // Recarregar os dados após a ação
      refresh();
    }
  };

  const handleCancel = async (id: string | number, motivo: string) => {
    // Verificar se é uma coleta recorrente
    const schedule = schedules.find(s => s.id === id);
    if (schedule?.collection_type === 'recorrente') {
      // Para coletas recorrentes, cancelar apenas a próxima ocorrência
      const success = await collectionActionsService.cancelNextOccurrence(
        id.toString(),
        motivo
      );
      
      if (success) {
        // Recarregar os dados após a ação
        refresh();
      }
    } else {
      // Para coletas simples, cancelar a coleta inteira
      const success = await collectionActionsService.cancelCollection(
        id.toString(),
        motivo
      );
      
      if (success) {
        // Recarregar os dados após a ação
        refresh();
      }
    }
  };

  const handleAccept = async (id: string | number, observations?: string) => {
    const success = await collectionActionsService.acceptCollection(
      id.toString(),
      observations
    );
    
    if (success) {
      // Recarregar os dados após a ação
      refresh();
    }
  };

  const handleReject = async (id: string | number, reason: string) => {
    const success = await collectionActionsService.rejectCollection(
      id.toString(),
      reason
    );
    
    if (success) {
      // Recarregar os dados após a ação
      refresh();
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => window.history.back()} className="flex items-center gap-2 mr-4">
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarCheck2 className="h-6 w-6 text-green-600" /> Agendamentos Ativos
          </h1>
          <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Solicitar Nova Coleta
          </Button>
        </div>
        <Tabs value={tab} onValueChange={v => setTab(v as 'simples' | 'recorrente')}>
          <TabsList>
            <TabsTrigger value="simples">Simples</TabsTrigger>
            <TabsTrigger value="recorrente">Recorrente</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="mt-6 space-y-6">
          {loading ? (
            <div className="text-center text-muted-foreground py-8">Carregando agendamentos ativos...</div>
          ) : error ? (
            <div className="text-center text-red-600 py-8">Erro ao carregar agendamentos: {error}</div>
          ) : mappedSchedules.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">Nenhum agendamento ativo encontrado.</div>
          ) : (
            mappedSchedules.map(schedule => (
              <StandardCollectionHistoryCard
                key={schedule.id}
                {...schedule}
                userType={userType}
                onRegister={() => handleRegister(schedule.id)}
                onEdit={dados => handleEdit(schedule.id, dados)}
                onCancel={motivo => handleCancel(schedule.id, motivo)}
                onConfirm={() => handleAccept(schedule.id)}
              />
            ))
          )}
        </div>
        {/* Modal para escolher tipo de coleta */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Escolha o tipo de coleta</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 mt-4">
              <Button variant="default" onClick={() => { setShowModal(false); navigate('/collection/simple'); }}>Simples</Button>
              <Button variant="outline" onClick={() => { setShowModal(false); navigate('/collection/recurring'); }}>Recorrente</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ActiveSchedules; 