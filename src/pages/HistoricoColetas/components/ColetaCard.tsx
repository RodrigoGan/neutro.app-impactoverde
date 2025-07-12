import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ColetaCard = () => {
  const [coleta, setColeta] = useState({
    status: 'pending',
    collector: null,
    date: '2024-05-01T10:00:00'
  });
  const [showRegistrarColetaModal, setShowRegistrarColetaModal] = useState(false);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [showCancelarModal, setShowCancelarModal] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [loadingRegistrar, setLoadingRegistrar] = useState(false);
  const [loadingEditar, setLoadingEditar] = useState(false);
  const [loadingCancelar, setLoadingCancelar] = useState(false);

  const renderAcoes = () => {
    if (coleta.status === 'cancelled') return null;

    return (
      <div className="flex flex-col gap-2">
        {coleta.status === 'pending' && !coleta.collector && (
          <Button
            variant="default"
            className="w-full"
            onClick={() => setShowRegistrarColetaModal(true)}
            disabled={loadingRegistrar}
          >
            {loadingRegistrar ? 'Registrando...' : 'Registrar Coleta'}
          </Button>
        )}

        {coleta.status === 'pending' && coleta.collector && (
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setShowEditarModal(true)}
            disabled={loadingEditar}
          >
            {loadingEditar ? 'Editando...' : 'Editar'}
          </Button>
        )}

        {coleta.status === 'pending' && (
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => setShowCancelarModal(true)}
            disabled={loadingCancelar}
          >
            {loadingCancelar ? 'Cancelando...' : 'Cancelar Esta Coleta'}
          </Button>
        )}
      </div>
    );
  };

  const handleRegistrarColeta = async () => {
    try {
      setLoadingRegistrar(true);
      // Simular registro de coleta
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowRegistrarColetaModal(false);
      setShowSuccessAnimation(true);
    } catch (error) {
      console.error('Erro ao registrar coleta:', error);
    } finally {
      setLoadingRegistrar(false);
    }
  };

  const renderStatusBadge = () => {
    switch (coleta.status) {
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'scheduled':
        return <Badge variant="default">Agendada</Badge>;
      case 'collected':
        return <Badge variant="default">Coletada</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  const handleEditarColeta = async () => {
    try {
      setLoadingEditar(true);
      // Simular edição de coleta
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowEditarModal(false);
    } catch (error) {
      console.error('Erro ao editar coleta:', error);
    } finally {
      setLoadingEditar(false);
    }
  };

  const handleCancelarColeta = async () => {
    try {
      setLoadingCancelar(true);
      // Simular cancelamento de coleta
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowCancelarModal(false);
    } catch (error) {
      console.error('Erro ao cancelar coleta:', error);
    } finally {
      setLoadingCancelar(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {renderAcoes()}
      {renderStatusBadge()}
      {formatDate(coleta.date)}
    </div>
  );
};

export default ColetaCard; 