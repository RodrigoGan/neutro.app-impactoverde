import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, ChevronLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import StandardCollectionHistoryCard from '@/components/collection/StandardCollectionHistoryCard';
import { Badge } from "@/components/ui/badge";
import { materialDisplayData } from '@/config/materialDisplayData';
import { getMaterialIdentificador } from '@/lib/utils';
import { useCollectionHistory, UserType } from '@/hooks/useCollectionHistory';

// Tipagem explícita para garantir compatibilidade
export type Status = 'pending' | 'scheduled' | 'collected' | 'cancelled';
export type TipoColeta = 'simples' | 'recorrente';
export interface CardMock {
  id: number;
  status: Status;
  tipoColeta: TipoColeta;
  data: Date;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  coletor?: { nome: string; foto: string; avaliacaoMedia: number; totalColetas: number; veiculoType: string; };
  solicitante?: { nome: string; foto: string; avaliacaoMedia: number; totalColetas: number; };
  materiais: { type: string; quantity: number; unit: string; }[];
  frequencia?: 'semanal' | 'mensal' | 'quinzenal';
  diasSemana?: string[];
  observacoes?: string;
  cancellationReason?: string;
  quemCancelou?: string;
  ocorrencias: any[];
}

const StandardCollectionHistory: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tipoColetaFilter, setTipoColetaFilter] = useState<string>('all');
  const [date, setDate] = useState<Date | undefined>();
  const [openCalendar, setOpenCalendar] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Recebendo informações do perfil
  const userType = location.state?.userType as UserType || "common_user";
  const userId = location.state?.userId;
  const entityId = location.state?.entityId;

  // Hook para buscar coletas reais
  const { collections, total, loading, error } = useCollectionHistory({
    userType,
    userId,
    entityId,
    filters: {
      status: statusFilter,
      tipoColeta: tipoColetaFilter,
      date,
    },
    page,
    pageSize,
  });

  // Função para limpar todos os filtros
  const handleLimparFiltros = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTipoColetaFilter('all');
    setDate(undefined);
    setPage(1);
  };

  // Função para obter o título da página baseado no tipo de perfil
  const getPageTitle = () => {
    switch (userType) {
      case "common_user":
        return "Minhas Coletas";
      case "individual_collector":
        return "Coletas Realizadas";
      case "cooperative":
      case "cooperative_owner":
        return "Coletas da Cooperativa";
      case "collector_company_owner":
        return "Coletas da Empresa";
      case "restaurant_partner":
      case "store_partner":
      case "educational_partner":
      case "partner_owner":
        return "Coletas do Parceiro";
      default:
        return "Histórico de Coletas";
    }
  };

  // Função para obter o subtítulo da página baseado no tipo de perfil
  const getPageSubtitle = () => {
    switch (userType) {
      case "common_user":
        return "Acompanhe o histórico de todas as suas coletas";
      case "individual_collector":
        return "Visualize todas as coletas que você realizou";
      case "cooperative":
      case "cooperative_owner":
        return "Acompanhe todas as coletas realizadas pela cooperativa";
      case "collector_company_owner":
        return "Acompanhe todas as coletas realizadas pela empresa";
      case "restaurant_partner":
      case "store_partner":
      case "educational_partner":
      case "partner_owner":
        return "Acompanhe todas as coletas realizadas pelo parceiro";
      default:
        return "Visualize o histórico de coletas";
    }
  };

  // Função para obter as opções de status baseado no tipo de perfil
  const getStatusOptions = () => {
    return [
      { value: "all", label: "Todos" },
      { value: "pending", label: "Pendente" },
      { value: "scheduled", label: "Agendada" },
      { value: "collected", label: "Realizada" },
      { value: "cancelled", label: "Cancelada" }
    ];
  };

  // Função para obter as opções de tipo de coleta baseado no tipo de perfil
  const getTipoColetaOptions = () => {
    return [
      { value: "all", label: "Todos" },
      { value: "simples", label: "Simples" },
      { value: "recorrente", label: "Recorrente" }
    ];
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
            <p className="text-muted-foreground">{getPageSubtitle()}</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6 pb-2">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 sm:gap-2 items-end">
              <div className="col-span-1">
                <Label>Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground select-none pointer-events-none" />
                  <Input
                    placeholder="Buscar por endereço, coletor, empresa ou material..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="col-span-1">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    {getStatusOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-1">
                <Label>Tipo de Coleta</Label>
                <Select value={tipoColetaFilter} onValueChange={setTipoColetaFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {getTipoColetaOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-1">
                <Label>Data</Label>
                <div className="flex gap-2 items-center">
                  <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                    <PopoverTrigger asChild>
                      <Button
                        variant={date ? "default" : "outline"}
                        className="w-32 h-12 justify-start text-left font-normal"
                      >
                        {date ? format(date, "dd 'de' MMMM yyyy", { locale: ptBR }) : <span>Filtrar por data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d) => {
                          setDate(d);
                          setOpenCalendar(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLimparFiltros}
                  >
                    Limpar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exemplos de Cards de Histórico de Coleta */}
        {/* Lista de cards com dados reais do banco */}
        {(() => {
          // Mapear dados do banco para o formato esperado pelo card
          const mappedCollections = collections.map(collection => ({
            id: collection.id,
            status: collection.status,
            tipoColeta: collection.collection_type,
            data: new Date(collection.date),
            hora: collection.time,
            endereco: collection.address || 'Endereço não informado',
            bairro: collection.neighborhood || 'Bairro não informado',
            cidade: collection.city || 'Cidade não informada',
            estado: collection.state || 'Estado não informado',
            materiais: collection.materials || collection.collected_materials || [],
            fotos: collection.photos || [], // Campo de fotos da coleta
            observacoes: collection.observations,
            frequencia: collection.recurring_pattern?.frequency,
            diasSemana: collection.recurring_pattern?.days,
            coletor: collection.collector_info ? {
              nome: collection.collector_info.name || 'Coletor não informado',
              foto: collection.collector_info.photo,
              avaliacaoMedia: collection.collector_info.rating_average,
              totalColetas: collection.collector_info.total_collections,
              veiculoType: collection.collector_info.vehicle_type,
            } : undefined,
            solicitante: collection.solicitante_info ? {
              nome: collection.solicitante_info.name || 'Solicitante não informado',
              foto: collection.solicitante_info.photo,
              avaliacaoMedia: collection.solicitante_info.rating_average,
              totalColetas: collection.solicitante_info.total_collections,
            } : undefined,
            cancellationReason: collection.cancellation_reason,
            quemCancelou: collection.cancelled_by,
            ocorrencias: collection.occurrences || [],
          }));

          const filtered = mappedCollections.filter(card => {
            // Mostrar apenas coletas concluídas ou canceladas no histórico
            if (!(card.status === 'collected' || card.status === 'cancelled')) return false;
            if (statusFilter !== 'all' && card.status !== statusFilter) return false;
            if (tipoColetaFilter !== 'all' && card.tipoColeta !== tipoColetaFilter) return false;
            if (date && (card.data.toDateString() !== date.toDateString())) return false;
            if (searchTerm && !(
              card.endereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
              card.bairro.toLowerCase().includes(searchTerm.toLowerCase()) ||
              card.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
              card.estado.toLowerCase().includes(searchTerm.toLowerCase()) ||
              card.coletor?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
              card.materiais.some(m => {
                // Buscar por identificador do material
                const matchByIdentificador = m.type.toLowerCase().includes(searchTerm.toLowerCase());
                // Buscar por nome do material usando materialDisplayData
                const displayInfo = materialDisplayData[m.type];
                const matchByNome = displayInfo?.nome.toLowerCase().includes(searchTerm.toLowerCase());
                return matchByIdentificador || matchByNome;
              })
            )) return false;
            return true;
          });

          return (
            <div className="space-y-6">
              {loading ? (
                <div className="text-center text-muted-foreground py-8">Carregando histórico de coletas...</div>
              ) : error ? (
                <div className="text-center text-red-600 py-8">Erro ao carregar histórico: {error}</div>
              ) : filtered.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">Nenhuma coleta encontrada com os filtros selecionados.</div>
              ) : (
                filtered.map(card => (
                  <StandardCollectionHistoryCard 
                    key={card.id} 
                    {...card} 
                    userType={userType}
                  />
                ))
              )}
            </div>
          );
        })()}
      </div>
    </Layout>
  );
};

export default StandardCollectionHistory; 