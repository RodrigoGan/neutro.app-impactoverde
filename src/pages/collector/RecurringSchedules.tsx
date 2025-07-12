import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, MapPin, Package, ChevronLeft, Star, AlertTriangle, Check, X, ChevronDown, List, User, ChevronUp, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { materialDisplayData } from '@/config/materialDisplayData';
import { getAllMaterials } from '@/lib/collectorService';
// Importar os modais necessários
import StandardRegisterCollectionModal from '@/components/collection/StandardRegisterCollectionModal';
import StandardEditCollectionModal from '@/components/collection/StandardEditCollectionModal';
import StandardRatingModal from '@/components/collection/StandardRatingModal';
import StandardMaterialList from '@/components/collection/StandardMaterialList';
import StandardPhotoGallery from '@/components/collection/StandardPhotoGallery';
import StandardRatingStars from '@/components/collection/StandardRatingStars';
import AchievementSolicitanteRating from '@/components/animations/AchievementSolicitanteRating';
import { AchievementAnimation } from '@/components/animations/AchievementAnimation';
import { supabase } from '@/lib/supabaseClient';

// Interface Material compatível com os modais
interface Material {
  id: string;
  materialId: string;
  quantidade: string;
  unidade: string;
  fotos?: string[];
}

// Interface para materiais dos modais
interface MaterialModal {
  type: string;
  quantity: string | number;
  unit: string;
  fotos?: string[];
}

interface Solicitante {
  id: string;
  nome: string;
  foto: string;
  avaliacaoMedia: number;
  totalColetas: number;
  telefone: string;
}

// Helper para períodos
const PERIODOS: Record<'manha' | 'tarde' | 'noite', string> = {
  manha: 'Manhã (08:00 - 12:00)',
  tarde: 'Tarde (13:00 - 18:00)',
  noite: 'Noite (19:00 - 22:00)'
};

interface AgendamentoRecorrente {
  id: string;
  status: 'pendente' | 'aceito' | 'recusado' | 'cancelado';
  frequencia: 'semanal' | 'quinzenal' | 'mensal';
  diasSemana: string[];
  periodo: 'manha' | 'tarde' | 'noite';
  endereco: {
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  materiais: Material[];
  solicitante: Solicitante;
  dataSolicitacao: Date;
  proximaColeta?: {
    data: Date;
    materiais: Material[];
    observacoes?: string;
    fotos?: string[];
  };
  motivoRecusa?: string;
  motivoCancelamento?: string;
  ocorrencias?: Array<{
    id: string;
    data: Date;
    horario: string;
    status: string;
    materiais?: Material[];
    observacao?: string;
    avaliacao?: {
      estrelas: number;
      comentario: string;
      avaliadoPor: string;
    };
  }>;
}

const MOTIVOS_RECUSA = [
  { value: 'horario_incompativel', label: 'Horário incompatível' },
  { value: 'fora_area', label: 'Região fora da área de atendimento' },
  { value: 'volume_alto', label: 'Volume de materiais acima da capacidade' },
  { value: 'agenda_cheia', label: 'Já possui muitos compromissos no horário' },
  { value: 'material_nao_coletado', label: 'Tipo de material não coletado' },
  { value: 'outro', label: 'Outro motivo' }
];

const MOTIVOS_CANCELAMENTO = [
  { value: 'mudanca_agenda', label: 'Mudança na agenda' },
  { value: 'fora_area', label: 'Região fora da área de atendimento' },
  { value: 'volume_alto', label: 'Volume de materiais acima da capacidade' },
  { value: 'agenda_cheia', label: 'Já possui muitos compromissos no horário' },
  { value: 'material_nao_coletado', label: 'Tipo de material não coletado' },
  { value: 'outro', label: 'Outro motivo' }
];

const getDiasSemana = (dias: string[]) => {
  const diasMap: Record<string, string> = {
    dom: 'Domingo',
    seg: 'Segunda',
    ter: 'Terça',
    qua: 'Quarta',
    qui: 'Quinta',
    sex: 'Sexta',
    sab: 'Sábado'
  };
  return dias.map(dia => diasMap[dia]).join(', ');
};

// Função para gerar ocorrências recorrentes (igual ao histórico)
function gerarOcorrenciasRecorrentes(data: Date, frequencia: string): Array<{
  id: string;
  data: Date;
  horario: string;
  status: string;
  materiais: any[];
  fotos: string[];
  avaliacao?: {
    estrelas: number;
    comentario: string;
    avaliadoPor: string;
  };
  observacao?: string;
}> {
  const ocorrencias = [];
  const hoje = new Date();
  let dataAtual = new Date(data);
  
  for (let i = 0; i < 12; i++) { // Gerar 12 ocorrências
    if (dataAtual > hoje) {
      ocorrencias.push({
        id: `ocorrencia-${i}`,
        data: new Date(dataAtual),
        horario: '14:00',
        status: 'agendada',
        materiais: [],
        fotos: [],
        avaliacao: undefined,
        observacao: undefined,
      });
    }
    
    // Avançar para próxima data baseado na frequência
    switch (frequencia) {
      case 'semanal':
        dataAtual.setDate(dataAtual.getDate() + 7);
        break;
      case 'quinzenal':
        dataAtual.setDate(dataAtual.getDate() + 15);
        break;
      case 'mensal':
        dataAtual.setMonth(dataAtual.getMonth() + 1);
        break;
    }
  }
  
  return ocorrencias;
}

// Função para obter informações do material (movida para antes do componente)
const getMaterialInfo = (materialId: string, materiaisDb: any[]) => {
  // Buscar pelo identificador, não pelo id do banco
  const materialDb = materiaisDb.find(m => m.identificador === materialId);
  
  if (materialDb) {
    const identificador = materialDb.identificador;
    const displayInfo = materialDisplayData[identificador];
    return {
      nome: displayInfo?.nome || materialDb.nome,
      icone: displayInfo?.icone,
      cor: displayInfo?.cor || materialDb.cor
    };
  }
  // Fallback: tentar buscar diretamente no materialDisplayData
  const displayInfo = materialDisplayData[materialId];
  if (displayInfo) {
    return {
      nome: displayInfo.nome,
      icone: displayInfo.icone,
      cor: displayInfo.cor
    };
  }
  return { nome: 'Material não encontrado', icone: null, cor: 'text-gray-500' };
};

// Componente para o card expandido nas abas Aceitos e Recusados
const HistoryCardExpanded: React.FC<{
  agendamento: AgendamentoRecorrente,
  setFotoSelecionada: (foto: string) => void,
  setFotoModalAberto: (aberto: boolean) => void,
  materiaisDb: any[],
  onOcorrenciasChange: (agendamentoId: string, novasOcorrencias: any[]) => void,
  onAvaliar: (tipo: 'coletor' | 'solicitante', avaliacao: { estrelas: number; comentario?: string }) => void,
  expandedOccurrences: Record<string, boolean>,
  setExpandedOccurrences: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
}> = ({ agendamento, setFotoSelecionada, setFotoModalAberto, materiaisDb, onOcorrenciasChange, onAvaliar, expandedOccurrences, setExpandedOccurrences }) => {
  const [mostrarTodasColetas, setMostrarTodasColetas] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingType, setRatingType] = useState<'coletor' | 'solicitante' | null>(null);
  
  // Usar ocorrências reais do agendamento se existirem, senão gerar fictícias
  const ocorrencias = agendamento.ocorrencias && agendamento.ocorrencias.length > 0 
    ? agendamento.ocorrencias 
    : gerarOcorrenciasRecorrentes(agendamento.dataSolicitacao, agendamento.frequencia);
  
  const coletasRealizadas = ocorrencias.filter(o => o.status === 'collected' || o.status === 'realizada');
  const coletasCanceladas = ocorrencias.filter(o => o.status === 'cancelled' || o.status === 'cancelada');
  const todasOcorrencias = [...coletasRealizadas, ...coletasCanceladas].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  const ultimasOcorrencias = mostrarTodasColetas ? todasOcorrencias : todasOcorrencias.slice(0, 3);

  // Função para registrar coleta
  const handleRegisterCollection = (dados: any) => {
    setShowRegisterModal(false);
    
    // Atualizar ocorrência agendada mais próxima para 'collected' e criar próxima futura
    const hoje = new Date(); hoje.setHours(0,0,0,0);
    const futuras = ocorrencias.filter(o => o.status === 'scheduled' && new Date(o.data) >= hoje);
    const proxima = futuras.length > 0 ? futuras.reduce((prev, curr) => new Date(curr.data) < new Date(prev.data) ? curr : prev) : null;
    
    if (!proxima) {
      toast.error('Nenhuma próxima coleta agendada encontrada.');
      return;
    }

    let novasOcorrencias = ocorrencias.map(o =>
      o.id === proxima.id
        ? { 
            ...o, 
            materiais: dados.materiais, 
            fotos: dados.fotos, 
            observacao: dados.observacoes, 
            status: 'collected' 
          }
        : o
    );

    // Gera próxima futura
    const freq = agendamento.frequencia;
    let diasIntervalo = 7;
    if (freq === 'quinzenal') diasIntervalo = 14;
    if (freq === 'mensal') diasIntervalo = 30;
    
    const ultimaData = new Date(proxima.data);
    ultimaData.setDate(ultimaData.getDate() + diasIntervalo);
    
    const novaFutura = {
      ...proxima,
      id: `${proxima.id}-next-${ultimaData.getTime()}`,
      data: ultimaData,
      status: 'scheduled',
      observacao: undefined,
      fotos: [],
      avaliacao: undefined,
      materiais: dados.materiais.map((m: any) => ({ ...m, fotos: [] })),
    };
    
    novasOcorrencias = [...novasOcorrencias, novaFutura];
    onOcorrenciasChange(agendamento.id, novasOcorrencias);
    toast.success('Coleta registrada com sucesso!');
  };

  // Função para editar coleta
  const handleEditCollection = (dados: any) => {
    setShowEditModal(false);
    
    // Atualizar os materiais da ocorrência agendada mais próxima
    const hoje = new Date(); hoje.setHours(0,0,0,0);
    const futuras = ocorrencias.filter(o => o.status === 'scheduled' && new Date(o.data) >= hoje);
    const proxima = futuras.length > 0 ? futuras.reduce((prev, curr) => new Date(curr.data) < new Date(prev.data) ? curr : prev) : null;
    
    if (!proxima) {
      toast.error('Nenhuma próxima coleta agendada encontrada.');
      return;
    }

    const novasOcorrencias = ocorrencias.map(o =>
      o.id === proxima.id
        ? { ...o, materiais: dados.materiais, fotos: dados.fotos, observacao: dados.observacoes }
        : o
    );
    
    onOcorrenciasChange(agendamento.id, novasOcorrencias);
    toast.success('Coleta editada com sucesso!');
  };

  // Função para avaliar
  const handleRating = (avaliacao: { estrelas: number; comentario?: string }) => {
    setShowRatingModal(false);
    if (ratingType) {
      // Encontrar qual ocorrência está sendo avaliada (a que está expandida)
      const ocorrenciaAvaliada = ultimasOcorrencias.find(ocorrencia => 
        expandedOccurrences[ocorrencia.id] && 
        (ocorrencia.status === 'collected' || ocorrencia.status === 'realizada') && 
        !ocorrencia.avaliacao
      );

      if (ocorrenciaAvaliada) {
        // Atualizar apenas a ocorrência específica
        const novasOcorrencias = agendamento.ocorrencias?.map(ocorrencia => 
          ocorrencia.id === ocorrenciaAvaliada.id
            ? {
                ...ocorrencia,
                avaliacao: {
                  estrelas: avaliacao.estrelas,
                  comentario: avaliacao.comentario || '',
                  avaliadoPor: 'Coletor'
                }
              }
            : ocorrencia
        ) || [];

        onOcorrenciasChange(agendamento.id, novasOcorrencias);
      }

      onAvaliar(ratingType, avaliacao);
      toast.success('Avaliação enviada com sucesso!');
    }
  };

  // Verificar se há próxima coleta para registrar
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const proximaColeta = agendamento.proximaColeta && new Date(agendamento.proximaColeta.data) <= hoje;

  // Converter materiais para formato compatível com os modais
  const converterMateriaisParaModal = (materiais: Material[]): MaterialModal[] => {
    return materiais.map(m => ({
      type: m.materialId,
      quantity: m.quantidade,
      unit: m.unidade,
      fotos: m.fotos || []
    }));
  };

  return (
    <>
      <Separator className="my-4" />
      <div className="space-y-3 mb-4">
        {agendamento.proximaColeta ? (
          <>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-neutro" />
              <span>Próxima coleta: {format(agendamento.proximaColeta.data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-neutro" />
              <span>Período: {PERIODOS[agendamento.periodo] || 'Não informado'}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-neutro mt-1" />
              <div>
                <p>{agendamento.endereco.rua}, {agendamento.endereco.numero}</p>
                <p className="text-sm text-muted-foreground">
                  {agendamento.endereco.bairro}, {agendamento.endereco.cidade} - {agendamento.endereco.estado}
                </p>
              </div>
            </div>
          </>
        ) : (
          <span className="text-muted-foreground">Nenhuma coleta agendada</span>
        )}
      </div>
      
      <div className="space-y-3">
        <h4 className="font-medium mb-2">Materiais da próxima coleta</h4>
        {agendamento.proximaColeta?.materiais && agendamento.proximaColeta.materiais.map((material, index) => {
          const materialInfo = getMaterialInfo(material.materialId, materiaisDb);
          const MaterialIcon = materialInfo.icone;
          return (
            <div key={index} className="mb-2">
              <div className="flex items-center gap-2">
                {MaterialIcon ? (
                  <MaterialIcon className={`h-4 w-4 ${materialInfo.cor}`} />
                ) : (
                  <Package className={`h-4 w-4 ${materialInfo.cor}`} />
                )}
                <p className="font-medium">{materialInfo.nome}</p>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                {material.quantidade} {material.unidade}
              </p>
            </div>
          );
        })}

        {/* Fotos dos Materiais */}
        {agendamento.proximaColeta?.fotos && agendamento.proximaColeta.fotos.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Fotos dos Materiais</h4>
            <StandardPhotoGallery fotos={agendamento.proximaColeta.fotos} />
          </div>
        )}

        {/* Observações */}
        {agendamento.proximaColeta?.observacoes && (
          <div className="p-4 bg-muted/50 rounded-lg mt-4">
            <p className="text-sm font-medium mb-1">Observações:</p>
            <p className="text-sm">{agendamento.proximaColeta.observacoes}</p>
          </div>
        )}
      </div>

      {/* Botões de Ação para Próxima Coleta */}
      {proximaColeta && (
        <div className="flex gap-2 mt-4">
          <Button 
            variant="default"
            onClick={() => setShowRegisterModal(true)}
            className="flex-1"
          >
            Registrar Coleta
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowEditModal(true)}
            className="flex-1"
          >
            Editar
          </Button>
        </div>
      )}

      {/* Últimas Coletas */}
      <div className="col-span-2 mt-4">
        <h4 className="font-medium mb-2">Últimas Coletas</h4>
        <div className="space-y-2">
          {ultimasOcorrencias.map((ocorrencia) => {
            // Garantir que todas as propriedades existam
            const materiaisValidos = (Array.isArray(ocorrencia.materiais) ? ocorrencia.materiais : [])
              .map(m => ({
                type: m.materialId || m.type,
                quantity: m.quantidade || m.quantity,
                unit: m.unidade || m.unit,
                fotos: m.fotos || []
              }))
              .filter(m => typeof m.type === 'string');
            const fotos = ('fotos' in ocorrencia && Array.isArray((ocorrencia as any).fotos)) ? (ocorrencia as any).fotos : [];
            const avaliacao = ('avaliacao' in ocorrencia) ? (ocorrencia as any).avaliacao : undefined;
            return (
              <div
                key={ocorrencia.id}
                className="flex flex-col gap-1 border-b pb-2 last:border-b-0 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation(); // Impede que o clique afete o card principal
                  setExpandedOccurrences(prev => ({ ...prev, [ocorrencia.id]: !prev[ocorrencia.id] }));
                }}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span>{format(ocorrencia.data, "dd 'de' MMMM yyyy", { locale: ptBR })}{ocorrencia.horario ? ` às ${ocorrencia.horario}` : ''}</span>
                  <Badge variant={ocorrencia.status === 'cancelled' || ocorrencia.status === 'cancelada' ? 'destructive' : 'default'}>
                    {ocorrencia.status === 'cancelled' || ocorrencia.status === 'cancelada' ? 'Cancelada' : 'Realizada'}
                  </Badge>
                  {/* Estrela de avaliação */}
                  {(ocorrencia.status === 'collected' || ocorrencia.status === 'realizada') && (
                    <Star className={`h-5 w-5 ${avaliacao ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
                  )}
                </div>
                {expandedOccurrences[ocorrencia.id] && (
                  <div className="pl-8 pt-2 pb-1 flex flex-col gap-2 bg-muted/30 rounded">
                    <div>
                      <h5 className="font-medium mb-1">Materiais</h5>
                      <StandardMaterialList materiais={materiaisValidos} />
                    </div>
                    <div>
                      <h5 className="font-medium mb-1">Fotos</h5>
                      <StandardPhotoGallery fotos={fotos} />
                    </div>
                    {ocorrencia.observacao && (
                      <div className="bg-white p-2 rounded border">
                        <span className="text-sm text-muted-foreground">
                          {['cancelada', 'cancelled'].includes(ocorrencia.status)
                            ? <>Motivo do cancelamento: {ocorrencia.observacao}</>
                            : <>Observação: {ocorrencia.observacao}</>
                          }
                        </span>
                      </div>
                    )}
                    {/* Botão de avaliação para ocorrências realizadas não avaliadas */}
                    {(ocorrencia.status === 'collected' || ocorrencia.status === 'realizada') && !avaliacao && (
                      <Button 
                        variant="outline" 
                        className="flex-1 mt-2"
                        onClick={e => { e.stopPropagation(); setRatingType('solicitante'); setShowRatingModal(true); }}
                      >
                        Avaliar Solicitante
                      </Button>
                    )}
                    {/* Avaliações */}
                    {avaliacao && (
                      <div className="bg-white p-2 rounded border space-y-4">
                        <StandardRatingStars 
                          estrelas={avaliacao.estrelas} 
                          comentario={avaliacao.comentario}
                          tipo="solicitante"
                          avaliadoPor={avaliacao.avaliadoPor}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {todasOcorrencias.length > 3 && (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => setMostrarTodasColetas((v) => !v)}
              >
                {mostrarTodasColetas ? 'Ver Menos' : 'Ver Todas'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modais */}
      <StandardRegisterCollectionModal
        open={showRegisterModal}
        onOpenChange={setShowRegisterModal}
        coleta={{
          materiais: converterMateriaisParaModal(agendamento.proximaColeta?.materiais || []),
          fotos: agendamento.proximaColeta?.fotos || [],
          observacoes: agendamento.proximaColeta?.observacoes || '',
        }}
        onSave={handleRegisterCollection}
      />
      
      <StandardEditCollectionModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        coleta={{
          materiais: converterMateriaisParaModal(agendamento.proximaColeta?.materiais || []),
          fotos: agendamento.proximaColeta?.fotos || [],
          observacoes: agendamento.proximaColeta?.observacoes || '',
        }}
        onSave={handleEditCollection}
      />
      
      <StandardRatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        tipo="solicitante"
        avaliadoPor="Coletor"
        nomeSolicitante={agendamento.solicitante.nome}
        fotoSolicitante={agendamento.solicitante.foto}
        onSubmit={handleRating}
      />
    </>
  );
};

const RecurringSchedules: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Definir o state de agendamentos ANTES de qualquer uso
  const [agendamentos, setAgendamentos] = useState<AgendamentoRecorrente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Inicializar selectedTab como 'pendente' por padrão
  const [selectedTab, setSelectedTab] = useState<string>('pendente');
  // Depois, ajustar selectedTab via useEffect se necessário
  useEffect(() => {
    if (agendamentos.some(a => a.status === 'pendente')) {
      setSelectedTab('pendente');
    } else if (agendamentos.some(a => a.status === 'aceito')) {
      setSelectedTab('aceito');
    }
  }, [agendamentos]);
  const [showRecusaDialog, setShowRecusaDialog] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<AgendamentoRecorrente | null>(null);
  const [motivoRecusa, setMotivoRecusa] = useState('');
  const [observacoesRecusa, setObservacoesRecusa] = useState('');
  const [showAceiteDialog, setShowAceiteDialog] = useState(false);
  const [observacoesAceite, setObservacoesAceite] = useState('');
  const [showCancelamentoDialog, setShowCancelamentoDialog] = useState(false);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const [observacoesCancelamento, setObservacoesCancelamento] = useState('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [expandedOccurrences, setExpandedOccurrences] = useState<Record<string, boolean>>({});
  const [observacoesPorAgendamento, setObservacoesPorAgendamento] = useState<Record<string, string>>({});
  // Definir o estado de materiaisDb uma única vez, antes de qualquer uso
  const [materiaisDb, setMateriaisDb] = useState<any[]>([]);
  // Remover qualquer duplicidade dessas definições ao longo do componente.
  const [loadingMateriais, setLoadingMateriais] = useState(true);
  const [erroMateriais, setErroMateriais] = useState<string | null>(null);
  const [fotoModalAberto, setFotoModalAberto] = useState(false);
  const [fotoSelecionada, setFotoSelecionada] = useState<string | null>(null);
  const [showRatingAnimation, setShowRatingAnimation] = useState(false);
  const [showColetaAceita, setShowColetaAceita] = useState(false);

  // Novo estado para cancelar apenas a próxima coleta
  const [showCancelamentoProximaDialog, setShowCancelamentoProximaDialog] = useState(false);
  const [motivoCancelamentoProxima, setMotivoCancelamentoProxima] = useState('');

  // Novos estados para controle dos modais e avaliações
  const [agendamentosState, setAgendamentosState] = useState<AgendamentoRecorrente[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Buscar materiais do banco ao montar o componente
  useEffect(() => {
    async function fetchMateriais() {
      setLoadingMateriais(true);
      setErroMateriais(null);
      try {
        const data = await getAllMaterials();
        setMateriaisDb(data || []);
        if (!data || data.length === 0) {
          setErroMateriais('Nenhum material cadastrado no sistema.');
        }
        console.log('DEBUG: Materiais recebidos do banco:', data);
        console.log('DEBUG: Identificadores dos materiais:', data.map(m => m.identificador));
      } catch (err) {
        setErroMateriais('Erro ao carregar materiais.');
        setMateriaisDb([]);
        console.error('ERRO AO CARREGAR MATERIAIS:', err);
      } finally {
        setLoadingMateriais(false);
      }
    }

    fetchMateriais();
  }, []);

  // Buscar agendamentos recorrentes reais do banco
  useEffect(() => {
    async function fetchAgendamentos() {
      setLoading(true);
      setError(null);
      try {
        // Substitua pelo id real do coletor logado, se necessário
        const collectorId = /* obter id do coletor logado ou da rota */ '';
        if (!collectorId) {
          setAgendamentos([]);
          setLoading(false);
          return;
        }
        const { data, error } = await supabase
          .from('collections')
          .select('*')
          .eq('collector_id', collectorId)
          .eq('is_recurring', true)
          .eq('collection_type', 'recurring');
        if (error) throw error;
        // Mapear os dados do banco para o formato AgendamentoRecorrente
        const mapped = (data || []).map((item: any) => ({
          id: item.id,
          status: item.status || 'pendente',
          frequencia: item.recurring_pattern?.frequencia || 'semanal',
          diasSemana: item.recurring_pattern?.diasSemana || [],
          periodo: item.time || 'manha',
          endereco: {
            rua: item.address || 'Rua não informada',
            numero: '',
            bairro: '',
            cidade: '',
            estado: '',
          },
          materiais: item.materials || [],
          solicitante: {
            id: item.solicitante_id || '',
            nome: 'Solicitante',
            foto: '',
            avaliacaoMedia: 0,
            totalColetas: 0,
            telefone: '',
          },
          dataSolicitacao: item.date ? new Date(item.date) : new Date(),
          proximaColeta: undefined,
          motivoRecusa: undefined,
          motivoCancelamento: undefined,
          ocorrencias: item.occurrences || [],
        }));
        setAgendamentos(mapped);
      } catch (err: any) {
        setError('Erro ao carregar agendamentos.');
        setAgendamentos([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAgendamentos();
  }, []); // Adicione dependências se necessário

  // Função para lidar com a recusa de um agendamento
  const handleRecusar = (agendamento: AgendamentoRecorrente) => {
    setSelectedAgendamento(agendamento);
    setShowRecusaDialog(true);
  };

  // Função para lidar com a aceitação de um agendamento
  const handleAceitar = (agendamento: AgendamentoRecorrente) => {
    setSelectedAgendamento(agendamento);
    setShowAceiteDialog(true);
  };

  const handleCancelar = (agendamento: AgendamentoRecorrente) => {
    setSelectedAgendamento(agendamento);
    setShowCancelamentoDialog(true);
  };

  const confirmarAceite = () => {
    if (!selectedAgendamento) return;
    setAgendamentos(prev =>
      prev.map(a => {
        if (a.id === selectedAgendamento.id) {
          // Gerar próxima coleta ao aceitar
          const proximaColeta = {
            data: a.dataSolicitacao,
            materiais: a.materiais,
            observacoes: observacoesPorAgendamento[a.id] || '',
            fotos: a.materiais.flatMap(m => m.fotos || [])
          };
          return {
            ...a,
            status: 'aceito',
            observacoes: observacoesPorAgendamento[a.id] || '',
            proximaColeta
          };
        }
        return a;
      })
    );
    setExpandedCard(null);
    setMotivoRecusa('');
    setObservacoesRecusa('');
    setShowAceiteDialog(false);
    
    // Mostrar animação de sucesso
    setShowColetaAceita(true);
  };

  const confirmarRecusa = () => {
    if (!selectedAgendamento || !motivoRecusa) return;
    setAgendamentos(prev =>
      prev.map(a =>
        a.id === selectedAgendamento.id
          ? { 
              ...a, 
              status: 'recusado',
              motivoRecusa,
              observacoes: observacoesPorAgendamento[a.id] || ''
            }
          : a
      )
    );
    setExpandedCard(null);
    setMotivoRecusa('');
    setObservacoesRecusa('');
    toast.success('Agendamento recorrente recusado.');
  };

  const confirmarCancelamento = () => {
    if (!selectedAgendamento || !motivoCancelamento) return;
    setAgendamentos(prev =>
      prev.map(a =>
        a.id === selectedAgendamento.id
          ? { 
              ...a, 
              status: 'cancelado',
              motivoCancelamento,
              observacoes: observacoesPorAgendamento[a.id] || ''
            }
          : a
      )
    );
    setExpandedCard(null);
    setMotivoCancelamento('');
    setObservacoesCancelamento('');
    toast.success('Agendamento recorrente cancelado com sucesso.');
    setShowCancelamentoDialog(false);
  };

  // Função para cancelar apenas a próxima coleta
  const confirmarCancelamentoProxima = () => {
    if (!selectedAgendamento || !selectedAgendamento.proximaColeta) return;
    // Calcular próxima data da recorrência
    const dataAtual = selectedAgendamento.proximaColeta.data;
    let novaData = new Date(dataAtual);
    if (selectedAgendamento.frequencia === 'semanal') {
      novaData.setDate(novaData.getDate() + 7);
    } else if (selectedAgendamento.frequencia === 'quinzenal') {
      novaData.setDate(dataAtual.getDate() + 14);
    } else if (selectedAgendamento.frequencia === 'mensal') {
      novaData.setMonth(dataAtual.getMonth() + 1);
    }
    setAgendamentos(prev =>
      prev.map(a => {
        if (a.id === selectedAgendamento.id) {
          // Adiciona ocorrência cancelada
          const ocorrencias = a.ocorrencias ? [...a.ocorrencias] : [];
          ocorrencias.push({
            id: `cancelada-${dataAtual.getTime()}`,
            data: dataAtual,
            horario: '',
            status: 'cancelled',
            materiais: a.proximaColeta.materiais,
            observacao: motivoCancelamentoProxima,
          });
          return {
            ...a,
            ocorrencias,
            proximaColeta: {
              ...a.proximaColeta,
              data: novaData,
            },
            motivoCancelamento: motivoCancelamentoProxima,
          };
        }
        return a;
      })
    );
    setExpandedCard(null);
    setMotivoCancelamentoProxima('');
    setShowCancelamentoProximaDialog(false);
    toast.success('Próxima coleta recorrente cancelada com sucesso.');
  };

  const getStatusBadge = (status: AgendamentoRecorrente['status']) => {
    switch (status) {
      case 'pendente':
        return <Badge className="bg-yellow-500">Pendente</Badge>;
      case 'aceito':
        return <Badge className="bg-green-500">Aceito</Badge>;
      case 'recusado':
        return <Badge variant="destructive">Recusado</Badge>;
      case 'cancelado':
        return <Badge variant="destructive">Cancelado</Badge>;
    }
  };

  const filteredAgendamentos = agendamentos.filter(a => {
    switch (selectedTab) {
      case 'pendente':
        return a.status === 'pendente';
      case 'aceito':
        return a.status === 'aceito';
      case 'recusado':
        return a.status === 'recusado';
      case 'cancelado':
        return a.status === 'cancelado';
      default:
        return true;
    }
  });

  // Função para atualizar ocorrências de um agendamento
  const handleOcorrenciasChange = (agendamentoId: string, novasOcorrencias: any[]) => {
    setAgendamentosState(prev => prev.map(ag => 
      ag.id === agendamentoId 
        ? { ...ag, ocorrencias: novasOcorrencias }
        : ag
    ));
  };

  // Função para lidar com avaliações
  const handleAvaliar = (tipo: 'coletor' | 'solicitante', avaliacao: { estrelas: number; comentario?: string }) => {
    // Atualizar o estado dos agendamentos com a avaliação
    setAgendamentos(prev => prev.map(agendamento => {
      if (agendamento.ocorrencias) {
        // Encontrar a ocorrência mais recente que não tem avaliação
        const ocorrenciasAtualizadas = agendamento.ocorrencias.map(ocorrencia => {
          if ((ocorrencia.status === 'collected' || ocorrencia.status === 'realizada') && !ocorrencia.avaliacao) {
            return {
              ...ocorrencia,
              avaliacao: {
                estrelas: avaliacao.estrelas,
                comentario: avaliacao.comentario || '',
                avaliadoPor: 'Coletor'
              }
            };
          }
          return ocorrencia;
        });
        
        return {
          ...agendamento,
          ocorrencias: ocorrenciasAtualizadas
        };
      }
      return agendamento;
    }));

    // Atualizar também o estado local dos agendamentos
    setAgendamentosState(prev => prev.map(agendamento => {
      if (agendamento.ocorrencias) {
        const ocorrenciasAtualizadas = agendamento.ocorrencias.map(ocorrencia => {
          if ((ocorrencia.status === 'collected' || ocorrencia.status === 'realizada') && !ocorrencia.avaliacao) {
            return {
              ...ocorrencia,
              avaliacao: {
                estrelas: avaliacao.estrelas,
                comentario: avaliacao.comentario || '',
                avaliadoPor: 'Coletor'
              }
            };
          }
          return ocorrencia;
        });
        
        return {
          ...agendamento,
          ocorrencias: ocorrenciasAtualizadas
        };
      }
      return agendamento;
    }));

    toast.success('Avaliação enviada com sucesso!');
    setShowRatingAnimation(true);
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <Button variant="ghost" onClick={() => navigate('/dashboard/standard', { state: { userId: location.state?.userId } })} className="flex items-center gap-2 mb-4">
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </Button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Agendamentos Recorrentes</h1>
            <p className="text-muted-foreground">
              Gerencie suas solicitações de coletas recorrentes
            </p>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="pendente" className="relative">
              Pendentes
              {agendamentos.filter(a => a.status === 'pendente').length > 0 && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-2 -right-2 bg-red-500 text-white h-5 w-5 flex items-center justify-center p-0 rounded-full"
                >
                  {agendamentos.filter(a => a.status === 'pendente').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="aceito">Aceitos</TabsTrigger>
            <TabsTrigger value="recusado">Recusados</TabsTrigger>
            <TabsTrigger value="cancelado">Cancelados</TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-4">
            {loading ? (
              <div className="text-center text-muted-foreground py-8">Carregando agendamentos...</div>
            ) : error ? (
              <div className="text-center text-red-600 py-8">{error}</div>
            ) : agendamentos.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                Nenhum agendamento recorrente encontrado.
              </div>
            ) : filteredAgendamentos.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                Nenhum agendamento {selectedTab === 'pendente' ? 'pendente' : selectedTab === 'aceito' ? 'aceito' : selectedTab === 'recusado' ? 'recusado' : 'cancelado'} encontrado
              </div>
            ) : (
              filteredAgendamentos.map(agendamento => (
                <Card key={agendamento.id}>
                  <CardContent 
                    className="pt-6 cursor-pointer" 
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      // Verificar se o clique foi em elementos que não devem fechar o card
                      if (
                        target.tagName === 'IMG' || 
                        target.closest('button') ||
                        target.closest('[role="dialog"]') ||
                        target.closest('form') ||
                        target.closest('textarea') ||
                        target.closest('input') ||
                        target.closest('[data-radix-popper-content-wrapper]') ||
                        target.closest('.modal') ||
                        target.closest('[data-state="open"]') ||
                        target.closest('select') ||
                        target.closest('[data-radix-select-trigger]') ||
                        target.closest('[data-radix-select-content]') ||
                        target.closest('[data-radix-select-item]')
                      ) {
                        return;
                      }
                      setExpandedCard(expandedCard === agendamento.id ? null : agendamento.id);
                    }}
                  >
                    <div className="flex flex-col gap-4">
                      {/* Cabeçalho do Card - sempre visível */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(agendamento.status)}
                          <Badge variant="outline" className="font-normal">
                            {agendamento.frequencia.charAt(0).toUpperCase() + agendamento.frequencia.slice(1)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Solicitado em {format(agendamento.dataSolicitacao, "dd/MM/yyyy")}
                          </span>
                        </div>
                        {/* Nome e foto do solicitante logo abaixo do badge */}
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={agendamento.solicitante.foto} alt={agendamento.solicitante.nome} />
                            <AvatarFallback>{agendamento.solicitante.nome.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{agendamento.solicitante.nome}</span>
                          {/* Estrelas e total de coletas */}
                          <span className="flex items-center gap-1 text-sm text-muted-foreground ml-2">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            {agendamento.solicitante.avaliacaoMedia}
                            <span className="ml-2">• {agendamento.solicitante.totalColetas} coletas</span>
                          </span>
                        </div>
                      </div>

                      {/* Detalhes expandidos */}
                      {expandedCard === agendamento.id && agendamento.status === 'pendente' && (
                        <>
                          <Separator className="my-4" />
                          {/* Data de Início no topo */}
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-neutro" />
                            <span>Data de Início: {format(agendamento.dataSolicitacao, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Coluna 1: Materiais e Informações de Coleta */}
                            <div className="space-y-6">
                              {/* Informações de Coleta */}
                              <div className="space-y-3">
                                {/* Dias da semana */}
                                <div className="flex items-center gap-2">
                                  <List className="h-4 w-4 text-neutro" />
                                  <span>Dias: {getDiasSemana(agendamento.diasSemana)}</span>
                                </div>
                                {/* Período */}
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-neutro" />
                                  <span>Período: {PERIODOS[agendamento.periodo] || 'Não informado'}</span>
                                </div>
                                {/* Endereço */}
                                <div className="flex items-start gap-2">
                                  <MapPin className="h-4 w-4 text-neutro mt-1" />
                                  <div>
                                    <p>{agendamento.endereco.rua}, {agendamento.endereco.numero}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {agendamento.endereco.bairro}, {agendamento.endereco.cidade} - {agendamento.endereco.estado}
                                    </p>
                                  </div>
                                </div>

                                {/* Materiais */}
                                <div className="space-y-3">
                                  <div className="flex items-start gap-2">
                                    <Package className="h-4 w-4 text-neutro mt-1" />
                                    <div>
                                      <h4 className="font-medium mb-2">Materiais da primeira coleta</h4>
                                      {agendamento.materiais.map((material, index) => {
                                        const materialInfo = getMaterialInfo(material.materialId, materiaisDb);
                                        const MaterialIcon = materialInfo.icone;
                                        return (
                                          <div key={index} className="mb-2">
                                            <div className="flex items-center gap-2">
                                              {MaterialIcon ? (
                                                <MaterialIcon className={`h-4 w-4 ${materialInfo.cor}`} />
                                              ) : (
                                                <Package className={`h-4 w-4 ${materialInfo.cor}`} />
                                              )}
                                              <p className="font-medium">{materialInfo.nome}</p>
                                            </div>
                                            <p className="text-sm text-muted-foreground ml-6">
                                              {material.quantidade} {material.unidade}
                                            </p>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* Fotos dos Materiais */}
                                  {agendamento.materiais.some(m => m.fotos && m.fotos.length > 0) && (
                                    <div className="mt-4">
                                      <h4 className="font-medium mb-2">Fotos dos Materiais</h4>
                                      <div className="flex gap-2 flex-wrap">
                                        {agendamento.materiais.flatMap((m, idx) =>
                                          (m.fotos || []).map((foto, fidx) => (
                                            <img
                                              key={idx + '-' + fidx}
                                              src={foto}
                                              alt="Foto do material"
                                              className="w-20 h-20 object-cover rounded border cursor-pointer"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setFotoSelecionada(foto);
                                                setFotoModalAberto(true);
                                              }}
                                            />
                                          ))
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Coluna 2: Informações Adicionais */}
                            <div className="space-y-4">
                              {agendamento.proximaColeta?.observacoes && (
                                <div className="p-4 bg-muted/50 rounded-lg">
                                  <p className="text-sm font-medium mb-1">Observações do Solicitante:</p>
                                  <p className="text-sm">{agendamento.proximaColeta.observacoes}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Botões de Ação */}
                          <div className="flex items-center justify-end gap-2 mt-4">
                            <Button
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRecusar(agendamento);
                              }}
                              className="text-red-500 border-red-500 hover:bg-red-50"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Recusar
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAceitar(agendamento);
                              }}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Aceitar
                            </Button>
                          </div>
                        </>
                      )}

                      {expandedCard === agendamento.id && agendamento.status !== 'pendente' && agendamento.status !== 'recusado' && agendamento.status !== 'cancelado' && (
                        <>
                          <HistoryCardExpanded 
                            agendamento={agendamento} 
                            setFotoSelecionada={setFotoSelecionada}
                            setFotoModalAberto={setFotoModalAberto}
                            materiaisDb={materiaisDb}
                            onOcorrenciasChange={handleOcorrenciasChange}
                            onAvaliar={handleAvaliar}
                            expandedOccurrences={expandedOccurrences}
                            setExpandedOccurrences={setExpandedOccurrences}
                          />
                          {/* Botões de ação para recorrência aceita (dentro da expansão) */}
                          {agendamento.status === 'aceito' && (
                            <div className="flex gap-2 mt-6">
                              <Button
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAgendamento(agendamento);
                                  setShowCancelamentoDialog(true);
                                }}
                              >
                                Cancelar recorrência
                              </Button>
                              <Button
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAgendamento(agendamento);
                                  setShowCancelamentoProximaDialog(true);
                                }}
                              >
                                Cancelar próxima coleta
                              </Button>
                            </div>
                          )}
                        </>
                      )}

                      {/* Seção específica para agendamentos recusados */}
                      {expandedCard === agendamento.id && agendamento.status === 'recusado' && (
                        <>
                          <Separator className="my-4" />
                          {/* Data de Início no topo */}
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-neutro" />
                            <span>Data de Início: {format(agendamento.dataSolicitacao, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Coluna 1: Materiais e Informações de Coleta */}
                            <div className="space-y-6">
                              {/* Informações de Coleta */}
                              <div className="space-y-3">
                                {/* Dias da semana */}
                                <div className="flex items-center gap-2">
                                  <List className="h-4 w-4 text-neutro" />
                                  <span>Dias: {getDiasSemana(agendamento.diasSemana)}</span>
                                </div>
                                {/* Período */}
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-neutro" />
                                  <span>Período: {PERIODOS[agendamento.periodo] || 'Não informado'}</span>
                                </div>
                                {/* Endereço */}
                                <div className="flex items-start gap-2">
                                  <MapPin className="h-4 w-4 text-neutro mt-1" />
                                  <div>
                                    <p>{agendamento.endereco.rua}, {agendamento.endereco.numero}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {agendamento.endereco.bairro}, {agendamento.endereco.cidade} - {agendamento.endereco.estado}
                                    </p>
                                  </div>
                                </div>

                                {/* Materiais */}
                                <div className="space-y-3">
                                  <div className="flex items-start gap-2">
                                    <Package className="h-4 w-4 text-neutro mt-1" />
                                    <div>
                                      <h4 className="font-medium mb-2">Materiais da primeira coleta</h4>
                                      {agendamento.materiais.map((material, index) => {
                                        const materialInfo = getMaterialInfo(material.materialId, materiaisDb);
                                        const MaterialIcon = materialInfo.icone;
                                        return (
                                          <div key={index} className="mb-2">
                                            <div className="flex items-center gap-2">
                                              {MaterialIcon ? (
                                                <MaterialIcon className={`h-4 w-4 ${materialInfo.cor}`} />
                                              ) : (
                                                <Package className={`h-4 w-4 ${materialInfo.cor}`} />
                                              )}
                                              <p className="font-medium">{materialInfo.nome}</p>
                                            </div>
                                            <p className="text-sm text-muted-foreground ml-6">
                                              {material.quantidade} {material.unidade}
                                            </p>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* Fotos dos Materiais */}
                                  {agendamento.materiais.some(m => m.fotos && m.fotos.length > 0) && (
                                    <div className="mt-4">
                                      <h4 className="font-medium mb-2">Fotos dos Materiais</h4>
                                      <div className="flex gap-2 flex-wrap">
                                        {agendamento.materiais.flatMap((m, idx) =>
                                          (m.fotos || []).map((foto, fidx) => (
                                            <img
                                              key={idx + '-' + fidx}
                                              src={foto}
                                              alt="Foto do material"
                                              className="w-20 h-20 object-cover rounded border cursor-pointer"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setFotoSelecionada(foto);
                                                setFotoModalAberto(true);
                                              }}
                                            />
                                          ))
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Coluna 2: Informações Adicionais */}
                            <div className="space-y-4">
                              {agendamento.proximaColeta?.observacoes && (
                                <div className="p-4 bg-muted/50 rounded-lg">
                                  <p className="text-sm font-medium mb-1">Observações do Solicitante:</p>
                                  <p className="text-sm">{agendamento.proximaColeta.observacoes}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Motivo da Recusa */}
                          {agendamento.motivoRecusa && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-red-800 mb-1">Motivo da Recusa:</p>
                                  <p className="text-sm text-red-700">{agendamento.motivoRecusa}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Seção específica para agendamentos cancelados */}
                      {expandedCard === agendamento.id && agendamento.status === 'cancelado' && (
                        <>
                          <Separator className="my-4" />
                          {/* Data de Início no topo */}
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-neutro" />
                            <span>Data de Início: {format(agendamento.dataSolicitacao, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Coluna 1: Materiais e Informações de Coleta */}
                            <div className="space-y-6">
                              {/* Informações de Coleta */}
                              <div className="space-y-3">
                                {/* Dias da semana */}
                                <div className="flex items-center gap-2">
                                  <List className="h-4 w-4 text-neutro" />
                                  <span>Dias: {getDiasSemana(agendamento.diasSemana)}</span>
                                </div>
                                {/* Período */}
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-neutro" />
                                  <span>Período: {PERIODOS[agendamento.periodo] || 'Não informado'}</span>
                                </div>
                                {/* Endereço */}
                                <div className="flex items-start gap-2">
                                  <MapPin className="h-4 w-4 text-neutro mt-1" />
                                  <div>
                                    <p>{agendamento.endereco.rua}, {agendamento.endereco.numero}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {agendamento.endereco.bairro}, {agendamento.endereco.cidade} - {agendamento.endereco.estado}
                                    </p>
                                  </div>
                                </div>

                                {/* Materiais */}
                                <div className="space-y-3">
                                  <div className="flex items-start gap-2">
                                    <Package className="h-4 w-4 text-neutro mt-1" />
                                    <div>
                                      <h4 className="font-medium mb-2">Materiais da primeira coleta</h4>
                                      {agendamento.materiais.map((material, index) => {
                                        const materialInfo = getMaterialInfo(material.materialId, materiaisDb);
                                        const MaterialIcon = materialInfo.icone;
                                        return (
                                          <div key={index} className="mb-2">
                                            <div className="flex items-center gap-2">
                                              {MaterialIcon ? (
                                                <MaterialIcon className={`h-4 w-4 ${materialInfo.cor}`} />
                                              ) : (
                                                <Package className={`h-4 w-4 ${materialInfo.cor}`} />
                                              )}
                                              <p className="font-medium">{materialInfo.nome}</p>
                                            </div>
                                            <p className="text-sm text-muted-foreground ml-6">
                                              {material.quantidade} {material.unidade}
                                            </p>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* Fotos dos Materiais */}
                                  {agendamento.materiais.some(m => m.fotos && m.fotos.length > 0) && (
                                    <div className="mt-4">
                                      <h4 className="font-medium mb-2">Fotos dos Materiais</h4>
                                      <div className="flex gap-2 flex-wrap">
                                        {agendamento.materiais.flatMap((m, idx) =>
                                          (m.fotos || []).map((foto, fidx) => (
                                            <img
                                              key={idx + '-' + fidx}
                                              src={foto}
                                              alt="Foto do material"
                                              className="w-20 h-20 object-cover rounded border cursor-pointer"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setFotoSelecionada(foto);
                                                setFotoModalAberto(true);
                                              }}
                                            />
                                          ))
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Coluna 2: Informações Adicionais */}
                            <div className="space-y-4">
                              {agendamento.proximaColeta?.observacoes && (
                                <div className="p-4 bg-muted/50 rounded-lg">
                                  <p className="text-sm font-medium mb-1">Observações do Solicitante:</p>
                                  <p className="text-sm">{agendamento.proximaColeta.observacoes}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Motivo do Cancelamento */}
                          {agendamento.motivoCancelamento && (
                            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-orange-800 mb-1">Motivo do Cancelamento:</p>
                                  <p className="text-sm text-orange-700">
                                    {(() => {
                                      const motivo = MOTIVOS_CANCELAMENTO.find(m => m.value === agendamento.motivoCancelamento);
                                      return motivo ? motivo.label : agendamento.motivoCancelamento;
                                    })()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </Tabs>

        {/* Dialog de Aceite */}
        <Dialog open={showAceiteDialog} onOpenChange={(open) => {
          if (!open) {
            setShowAceiteDialog(false);
            setMotivoRecusa('');
            setObservacoesRecusa('');
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                Confirmar Aceite
              </DialogTitle>
              <DialogDescription>
                Você está aceitando um agendamento recorrente. 
                Deseja adicionar alguma observação para o solicitante?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea
                placeholder="Exemplo: Preciso chegar 10 minutos antes para facilitar o acesso..."
                value={observacoesPorAgendamento[selectedAgendamento?.id || ''] || ''}
                onChange={(e) => setObservacoesPorAgendamento({ ...observacoesPorAgendamento, [selectedAgendamento?.id || '']: e.target.value })}
              />
            </div>
            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAceiteDialog(false);
                  setMotivoRecusa('');
                  setObservacoesRecusa('');
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmarAceite}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                Confirmar Aceite
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Recusa */}
        <Dialog open={showRecusaDialog} onOpenChange={(open) => {
          if (!open) {
            setShowRecusaDialog(false);
            setMotivoRecusa('');
            setObservacoesRecusa('');
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Confirmar Recusa
              </DialogTitle>
              <DialogDescription>
                Por favor, selecione o motivo da recusa e adicione observações se necessário.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Select value={motivoRecusa} onValueChange={setMotivoRecusa}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o motivo" />
                </SelectTrigger>
                <SelectContent>
                  {MOTIVOS_RECUSA.map((motivo) => (
                    <SelectItem key={motivo.value} value={motivo.value}>
                      {motivo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Observações adicionais..."
                value={observacoesRecusa}
                onChange={(e) => setObservacoesRecusa(e.target.value)}
              />
            </div>
            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRecusaDialog(false);
                  setMotivoRecusa('');
                  setObservacoesRecusa('');
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmarRecusa}
                className="flex-1"
                disabled={!motivoRecusa}
              >
                Confirmar Recusa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Cancelamento */}
        <Dialog open={showCancelamentoDialog} onOpenChange={(open) => {
          if (!open) {
            setShowCancelamentoDialog(false);
            setMotivoCancelamento('');
            setObservacoesCancelamento('');
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Confirmar Cancelamento
              </DialogTitle>
              <DialogDescription>
                Por favor, selecione o motivo do cancelamento e adicione observações se necessário.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Select value={motivoCancelamento} onValueChange={setMotivoCancelamento}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o motivo" />
                </SelectTrigger>
                <SelectContent>
                  {MOTIVOS_CANCELAMENTO.map((motivo) => (
                    <SelectItem key={motivo.value} value={motivo.value}>
                      {motivo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Observações adicionais..."
                value={observacoesCancelamento}
                onChange={(e) => setObservacoesCancelamento(e.target.value)}
              />
            </div>
            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCancelamentoDialog(false);
                  setMotivoCancelamento('');
                  setObservacoesCancelamento('');
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmarCancelamento}
                className="flex-1"
                disabled={!motivoCancelamento}
              >
                Confirmar Cancelamento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal para cancelar apenas a próxima coleta */}
        <Dialog open={showCancelamentoProximaDialog} onOpenChange={setShowCancelamentoProximaDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancelar Próxima Coleta</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja cancelar apenas a próxima coleta recorrente? Informe o motivo abaixo.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Motivo do cancelamento"
              value={motivoCancelamentoProxima}
              onChange={e => setMotivoCancelamentoProxima(e.target.value)}
              className="min-h-[100px]"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCancelamentoProximaDialog(false)}>Voltar</Button>
              <Button onClick={confirmarCancelamentoProxima} disabled={!motivoCancelamentoProxima.trim()} className="bg-red-600 text-white hover:bg-red-700">Confirmar Cancelamento</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal para visualização da foto em tamanho maior */}
        <Dialog open={fotoModalAberto} onOpenChange={setFotoModalAberto}>
          <DialogContent className="flex flex-col items-center justify-center">
            <DialogHeader>
              <DialogTitle>Visualizar Foto</DialogTitle>
              <DialogDescription>
                Foto do material selecionado
              </DialogDescription>
            </DialogHeader>
            {fotoSelecionada && (
              <img
                src={fotoSelecionada}
                alt="Foto ampliada"
                className="max-w-full max-h-[70vh] rounded shadow-lg"
                style={{ objectFit: 'contain' }}
              />
            )}
          </DialogContent>
        </Dialog>
        {/* Animação de avaliação enviada */}
        {showRatingAnimation && (
          <AchievementSolicitanteRating onComplete={() => setShowRatingAnimation(false)} />
        )}

        {/* Animação de Coleta Aceita */}
        {showColetaAceita && (
          <AchievementAnimation
            title="Coleta Aceita!"
            description="O agendamento recorrente foi aceito com sucesso."
            icon={<CheckCircle2 className="w-16 h-16 text-green-600" />}
            soundType="scheduleConfirmed"
            onComplete={() => setShowColetaAceita(false)}
          />
        )}
      </div>
    </Layout>
  );
};

export default RecurringSchedules; 