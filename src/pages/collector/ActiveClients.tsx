import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Search, MapPin, Calendar, Package, ArrowLeft, ChevronLeft } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { supabase } from '../../lib/supabaseClient';
import StandardCollectionHistoryCard from '../../components/collection/StandardCollectionHistoryCard';

interface Cliente {
  id: string;
  nome: string;
  endereco: string;
  ultimaColeta: string;
  proximaColeta: string | null;
  volumeTotal: number;
  materialMaisColetado: string;
  foto?: string;
}

const ActiveClients: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState<Cliente[]>([]);
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<any | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientCollections, setClientCollections] = useState<any[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(false);

  // Buscar clientes reais do banco
  useEffect(() => {
    async function fetchClients() {
      setLoading(true);
      setError(null);
      try {
        // Substitua pelo id real do coletor logado
        const collectorId = '';
        if (!collectorId) {
          setFilteredClients([]);
          setLoading(false);
          return;
        }
        // Buscar todos os solicitantes únicos que já tiveram coleta com o coletor
        const { data: collections, error: collectionsError } = await supabase
          .from('collections')
          .select('solicitante_id, solicitante:profiles!collections_solicitante_id_fkey(id, full_name, addresses)')
          .eq('collector_id', collectorId)
          .neq('solicitante_id', null);
        if (collectionsError) throw collectionsError;
        // Mapear para clientes únicos
        const uniqueClientsMap: Record<string, Cliente> = {};
        (collections || []).forEach((item: any) => {
          if (item.solicitante && item.solicitante.id && !uniqueClientsMap[item.solicitante.id]) {
            uniqueClientsMap[item.solicitante.id] = {
              id: item.solicitante.id,
              nome: item.solicitante.full_name || 'Cliente',
              endereco: item.solicitante.addresses?.[0]?.street || 'Endereço não informado',
              ultimaColeta: '',
              proximaColeta: null,
              volumeTotal: 0,
              materialMaisColetado: '',
              foto: '',
            };
          }
        });
        const clientsArr = Object.values(uniqueClientsMap);
        setFilteredClients(clientsArr);
      } catch (err: any) {
        setError('Erro ao carregar clientes.');
        setFilteredClients([]);
      } finally {
        setLoading(false);
      }
    }
    fetchClients();
  }, []);

  // Buscar coletas reais do cliente selecionado
  useEffect(() => {
    async function fetchClientCollections() {
      if (!selectedClient) return;
      setLoadingCollections(true);
      try {
        // Substitua pelo id real do coletor logado
        const collectorId = '';
        const { data: collections, error: collectionsError } = await supabase
          .from('collections')
          .select('*')
          .eq('collector_id', collectorId)
          .eq('solicitante_id', selectedClient.id);
        if (collectionsError) throw collectionsError;
        setClientCollections(collections || []);
      } catch (err) {
        setClientCollections([]);
      } finally {
        setLoadingCollections(false);
      }
    }
    if (showHistoryModal && selectedClient) fetchClientCollections();
  }, [showHistoryModal, selectedClient]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredClients(prev => prev.filter(cliente =>
      cliente.nome.toLowerCase().includes(term) ||
      cliente.endereco.toLowerCase().includes(term)
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleOpenHistoryModal = (cliente: Cliente) => {
    setSelectedClient(cliente);
    setShowHistoryModal(true);
    setSelectedCollection(null);
  };

  const handleOpenCollectionDetails = (coleta: any) => {
    setSelectedCollection(coleta);
    setShowHistoryModal(false);
  };

  const handleCloseCollectionDetails = () => {
    setSelectedCollection(null);
    if (selectedClient) setShowHistoryModal(true);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard/standard', { state: { userId: location.state?.userId } })}
            className="flex items-center gap-2 mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Clientes Ativos</h1>
        </div>
        
        <div className="mb-6 relative">
          <Input
            type="text"
            placeholder="Buscar por nome ou endereço..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>

        <div className="grid gap-4">
          {loading ? (
            <div className="text-center text-muted-foreground py-8">Carregando clientes...</div>
          ) : error ? (
            <div className="text-center text-red-600 py-8">{error}</div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">Nenhum cliente ativo encontrado.</div>
          ) : (
            filteredClients.map(cliente => (
              <Card key={cliente.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3">
                      {/* Foto do cliente, se houver */}
                      {cliente.foto && (
                        <img src={cliente.foto} alt={cliente.nome} className="w-10 h-10 rounded-full object-cover" />
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{cliente.nome}</h3>
                        <div className="flex items-center gap-2 text-gray-600 mt-1">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{cliente.endereco}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 col-span-1 md:col-span-1 lg:col-span-3">
                      <Button
                        variant="outline"
                        onClick={() => handleOpenHistoryModal(cliente)}
                      >
                        Ver Histórico
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Modal de Histórico do Cliente */}
        <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Histórico de Coletas de {selectedClient?.nome}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {loadingCollections ? (
                <div className="text-center text-muted-foreground py-8">Carregando coletas...</div>
              ) : clientCollections.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">Nenhuma coleta encontrada para este cliente.</div>
              ) : (
                clientCollections.map(coleta => (
                  <div key={coleta.id} className="cursor-pointer">
                    <StandardCollectionHistoryCard
                      id={coleta.id}
                      status={coleta.status}
                      tipoColeta={coleta.collection_type || 'simples'}
                      data={coleta.date}
                      hora={coleta.time}
                      endereco={coleta.address}
                      bairro={coleta.neighborhood}
                      cidade={coleta.city}
                      estado={coleta.state}
                      coletor={{ nome: '' }}
                      solicitante={{ nome: selectedClient?.nome || '' }}
                      materiais={coleta.materials || []}
                      observacoes={coleta.observations}
                      cancellationReason={coleta.cancellation_reason}
                      userType={'individual_collector'}
                      hideActions={true}
                      expanded={expandedCardId === coleta.id}
                      onExpand={() => setExpandedCardId(expandedCardId === coleta.id ? null : coleta.id)}
                    />
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ActiveClients; 