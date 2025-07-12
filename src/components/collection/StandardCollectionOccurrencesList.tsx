import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, ChevronDown, ChevronUp, BadgeAlert, X, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import StandardMaterialList from './StandardMaterialList';
import StandardPhotoGallery from './StandardPhotoGallery';
import StandardRatingStars from './StandardRatingStars';
import { Button } from '@/components/ui/button';
import StandardEditCollectionModal from './StandardEditCollectionModal';
import StandardRegisterCollectionModal from './StandardRegisterCollectionModal';
import StandardCancelCollectionModal from './StandardCancelCollectionModal';
import StandardRatingModal from './StandardRatingModal';
import { toast } from 'sonner';
import { AchievementAnimation } from '@/components/animations/AchievementAnimation';

interface Ocorrencia {
  id: string | number;
  data: Date;
  horario: string;
  status: 'scheduled' | 'collected' | 'cancelled';
  materiais: {
    type: string;
    quantity: string | number;
    unit: string;
    fotos?: string[];
  }[];
  observacao?: string;
  fotos?: string[];
  avaliacaoColetor?: {
    estrelas: number;
    comentario?: string;
    avaliadoPor: string;
  };
  avaliacaoSolicitante?: {
    estrelas: number;
    comentario?: string;
    avaliadoPor: string;
  };
  coletor?: {
    nome: string;
    foto?: string;
  };
  avaliacao?: {
    estrelas: number;
    comentario: string;
    avaliadoPor: string;
  };
}

interface StandardCollectionOccurrencesListProps {
  ocorrencias: Ocorrencia[];
  userType: string;
  coletor?: {
    nome: string;
    foto?: string;
  };
  frequencia?: string;
  onOcorrenciasChange?: (ocorrencias: Ocorrencia[]) => void;
}

const statusBadge = (status: Ocorrencia['status'], data: Date, avaliacao?: Ocorrencia['avaliacao']) => {
  const hoje = new Date();
  hoje.setHours(0,0,0,0);
  const dataOcorrencia = new Date(data);
  dataOcorrencia.setHours(0,0,0,0);
  if (status === 'scheduled' && dataOcorrencia < hoje) {
    return <Badge className="bg-yellow-400 text-yellow-900">Atrasada</Badge>;
  }
  switch (status) {
    case 'collected':
      return avaliacao ? <Badge className="bg-green-600 text-white">Realizada</Badge> : null;
    case 'cancelled':
      return <Badge className="bg-red-600 text-white">Cancelada</Badge>;
    case 'scheduled':
      return <Badge className="bg-blue-600 text-white">Agendada</Badge>;
    default:
      return null;
  }
};

const StandardCollectionOccurrencesList: React.FC<StandardCollectionOccurrencesListProps> = ({ ocorrencias, userType, coletor, frequencia, onOcorrenciasChange }) => {
  // Estado unificado para UI
  const [uiState, setUiState] = useState({
    expanded: {} as Record<string | number, boolean>,
    modals: {
      registro: false,
      cancelamento: false,
      avaliacao: false,
      editar: false
    },
    ocorrenciaAtual: null as Ocorrencia | null,
    loading: false
  });

  // Estado para animações
  const [animations, setAnimations] = useState({
    rating: false,
    success: false
  });

  // Estado para ocorrências
  const [ocorrenciasState, setOcorrenciasState] = useState(ocorrencias);

  // Estado para ocorrência sendo editada
  const [editingId, setEditingId] = useState<string | number | null>(null);

  // Funções otimizadas com useCallback
  const podeRegistrar = useCallback((ocorrencia: Ocorrencia) => {
    const hoje = new Date();
    const dataOcorrencia = new Date(ocorrencia.data);
    dataOcorrencia.setHours(0,0,0,0);
    hoje.setHours(0,0,0,0);
    return (
      ocorrencia.status === 'scheduled' &&
      dataOcorrencia <= hoje
    );
  }, []);

  const podeCancelar = useCallback((ocorrencia: Ocorrencia) => {
    return ocorrencia.status === 'scheduled';
  }, []);

  const handleOpenCancelModal = useCallback((e: React.MouseEvent, ocorrencia: Ocorrencia) => {
    e.preventDefault();
    e.stopPropagation();
    setUiState(prev => ({
      ...prev,
      modals: { ...prev.modals, cancelamento: true },
      ocorrenciaAtual: ocorrencia
    }));
  }, []);

  const handleCloseCancelModal = useCallback(() => {
    setUiState(prev => ({
      ...prev,
      modals: { ...prev.modals, cancelamento: false },
      ocorrenciaAtual: null
    }));
  }, []);

  const handleConfirmCancelamento = useCallback(async (motivo: string) => {
    if (!uiState.ocorrenciaAtual) return;
    
    try {
      setUiState(prev => ({ ...prev, loading: true }));
      
      setOcorrenciasState(prev => prev.map(o =>
        o.id === uiState.ocorrenciaAtual?.id
          ? { ...o, status: 'cancelled', observacao: motivo }
          : o
      ));
      
      toast.success('Coleta cancelada com sucesso!');
      handleCloseCancelModal();
    } catch (error) {
      console.error('Erro ao cancelar coleta:', error);
      toast.error('Erro ao cancelar coleta. Tente novamente.');
    } finally {
      setUiState(prev => ({ ...prev, loading: false }));
    }
  }, [uiState.ocorrenciaAtual]);

  // Memoização de dados filtrados
  const { proximasOcorrencias, ultimasOcorrencias } = useMemo(() => {
  const hoje = new Date();
  hoje.setHours(0,0,0,0);

    const ocorrenciasFuturas = ocorrenciasState.filter(o => 
      o.status === 'scheduled' && new Date(o.data) >= hoje
    );

    const proximaOcorrenciaAgendada = ocorrenciasFuturas.length > 0
      ? ocorrenciasFuturas.reduce((prev, curr) => 
          new Date(curr.data) < new Date(prev.data) ? curr : prev
        )
      : null;

    const proximas = ocorrenciasState.filter(o =>
    o.status === 'scheduled' &&
    new Date(o.data) > hoje &&
    (!proximaOcorrenciaAgendada || o.id !== proximaOcorrenciaAgendada.id)
  );

    const ultimas = ocorrenciasState.filter(o =>
    o.status === 'collected' ||
    o.status === 'cancelled' ||
    (o.status === 'scheduled' && new Date(o.data) <= hoje)
  );

    return { proximasOcorrencias: proximas, ultimasOcorrencias: ultimas };
  }, [ocorrenciasState]);

  if (!ocorrencias || ocorrencias.length === 0) {
    return <span className="text-muted-foreground text-sm italic">Nenhuma coleta realizada ainda.</span>;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Próximas Coletas */}
      {proximasOcorrencias.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Próximas Coletas</h3>
          {proximasOcorrencias.map((ocorrencia) => (
            <div
              key={ocorrencia.id}
              className="flex flex-col gap-1 border-b pb-2 last:border-b-0 cursor-pointer"
              onClick={() => setUiState(prev => ({
                ...prev,
                expanded: {
                  ...prev.expanded,
                  [ocorrencia.id]: !prev.expanded[ocorrencia.id]
                }
              }))}
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                <span>{ocorrencia.data.toLocaleDateString('pt-BR')} às {ocorrencia.horario}</span>
                {statusBadge(ocorrencia.status, ocorrencia.data, ocorrencia.avaliacao)}
                {/* Estrela de avaliação para realizadas */}
                {ocorrencia.status === 'collected' && (
                  ocorrencia.avaliacao ? (
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  ) : (
                    <Star className="h-5 w-5 text-muted-foreground" />
                  )
                )}
                <span className="ml-auto">
                  {uiState.expanded[ocorrencia.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
              </div>
              {uiState.expanded[ocorrencia.id] && (
                <div className="pl-8 pt-2 pb-1 flex flex-col gap-2 bg-muted/30 rounded">
                  <div>
                    <h5 className="font-medium mb-1">Materiais</h5>
                    <StandardMaterialList materiais={ocorrencia.materiais} />
                  </div>
                  <div>
                    <h5 className="font-medium mb-1">Fotos</h5>
                    <StandardPhotoGallery fotos={ocorrencia.fotos || ocorrencia.materiais.flatMap(m => m.fotos || [])} />
                  </div>
                  {ocorrencia.observacao && (
                    <div className="bg-white p-2 rounded border">
                      <span className="text-sm text-muted-foreground">Observação: {ocorrencia.observacao}</span>
                    </div>
                  )}
                  {/* Botões de ação */}
                  <StandardEditCollectionModal
                    open={editingId === ocorrencia.id}
                    onOpenChange={open => {
                      setEditingId(open ? ocorrencia.id : null);
                      setUiState(prev => ({
                        ...prev,
                        ocorrenciaAtual: open ? ocorrencia : null
                      }));
                    }}
                    coleta={{
                      materiais: ocorrencia.materiais,
                      fotos: ocorrencia.fotos || [],
                      observacoes: ocorrencia.observacao || ''
                    }}
                    onSave={dados => {
                      setOcorrenciasState(prev => prev.map(o =>
                        o.id === ocorrencia.id
                          ? { ...o, materiais: dados.materiais, fotos: dados.fotos, observacao: dados.observacaoCooperativa }
                          : o
                      ));
                      setEditingId(null);
                      toast.success('Coleta editada com sucesso!');
                    }}
                  />
                  <StandardRegisterCollectionModal
                    open={uiState.modals.registro && uiState.ocorrenciaAtual?.id === ocorrencia.id}
                    onOpenChange={open => setUiState(prev => ({
                      ...prev,
                      modals: { ...prev.modals, registro: open },
                      ocorrenciaAtual: open ? ocorrencia : null
                    }))}
                    coleta={{
                      materiais: ocorrencia.materiais,
                      fotos: ocorrencia.fotos || [],
                      observacoes: ocorrencia.observacao || ''
                    }}
                    onSave={dados => {
                      setOcorrenciasState(prev => prev.map(o =>
                        o.id === ocorrencia.id
                          ? { ...o, materiais: dados.materiais, fotos: dados.fotos, observacao: dados.observacoes, status: 'collected' as const }
                          : o
                      ));
                      toast.success('Coleta registrada com sucesso!');
                    }}
                  />
                  {podeRegistrar(ocorrencia) && (
                    <div className="flex gap-2 mt-2">
                      <Button 
                        variant="default" 
                        className="flex-1" 
                        onClick={e => { 
                          e.stopPropagation(); 
                          setUiState(prev => ({
                            ...prev,
                            modals: { ...prev.modals, registro: true },
                            ocorrenciaAtual: ocorrencia
                          }));
                        }}
                      >
                        Registrar Coleta
                      </Button>
                      <Button 
                        variant="outline"
                        className="flex-1"
                        onClick={e => {
                          e.stopPropagation();
                          setEditingId(ocorrencia.id);
                          setUiState(prev => ({
                            ...prev,
                            ocorrenciaAtual: ocorrencia
                          }));
                        }}
                      >
                        Editar
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="flex-1"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOpenCancelModal(e, ocorrencia);
                        }}
                      >
                        Cancelar Esta Coleta
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Últimas Coletas */}
      {ultimasOcorrencias.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Últimas Coletas</h3>
          {ultimasOcorrencias.map((ocorrencia) => (
            <div
              key={ocorrencia.id}
              className="flex flex-col gap-1 border-b pb-2 last:border-b-0 cursor-pointer"
              onClick={() => setUiState(prev => ({
                ...prev,
                expanded: {
                  ...prev.expanded,
                  [ocorrencia.id]: !prev.expanded[ocorrencia.id]
                }
              }))}
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                <span>{ocorrencia.data.toLocaleDateString('pt-BR')} às {ocorrencia.horario}</span>
                {statusBadge(ocorrencia.status, ocorrencia.data, ocorrencia.avaliacao)}
                {/* Estrela de avaliação para realizadas */}
                {ocorrencia.status === 'collected' && (
                  ocorrencia.avaliacao ? (
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  ) : (
                    <Star className="h-5 w-5 text-muted-foreground" />
                  )
                )}
                <span className="ml-auto">
                  {uiState.expanded[ocorrencia.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
              </div>
              {uiState.expanded[ocorrencia.id] && (
                <div className="pl-8 pt-2 pb-1 flex flex-col gap-2 bg-muted/30 rounded">
                  <div>
                    <h5 className="font-medium mb-1">Materiais</h5>
                    <StandardMaterialList materiais={ocorrencia.materiais} />
                  </div>
                  <div>
                    <h5 className="font-medium mb-1">Fotos</h5>
                    <StandardPhotoGallery fotos={ocorrencia.fotos || ocorrencia.materiais.flatMap(m => m.fotos || [])} />
                  </div>
                  {ocorrencia.observacao && (
                    <div className="bg-white p-2 rounded border">
                      <span className="text-sm text-muted-foreground">Observação: {ocorrencia.observacao}</span>
                    </div>
                  )}
                  {/* Coletor responsável */}
                  {ocorrencia.status !== 'scheduled' && !['individual_collector', 'cooperative', 'cooperative_owner', 'collector_company_owner'].includes(userType) && (
                    <div className="bg-white p-2 rounded border flex items-center gap-2">
                      <span className="font-medium">Coletor:</span>
                      <span className="text-sm text-muted-foreground">{ocorrencia.coletor?.nome || 'Não informado'}</span>
                    </div>
                  )}
                  {/* Botões de ação para ocorrências agendadas atrasadas */}
                  {ocorrencia.status === 'scheduled' && (() => {
                    const hoje = new Date();
                    hoje.setHours(0,0,0,0);
                    const dataOcorrencia = new Date(ocorrencia.data);
                    dataOcorrencia.setHours(0,0,0,0);
                    if (dataOcorrencia <= hoje) {
                      return (
                        <div className="flex gap-2 mt-2">
                          <Button 
                            variant="default" 
                            className="flex-1" 
                            onClick={e => { 
                              e.stopPropagation(); 
                              setUiState(prev => ({
                                ...prev,
                                modals: { ...prev.modals, registro: true },
                                ocorrenciaAtual: ocorrencia
                              }));
                            }}
                          >
                            Registrar Coleta
                          </Button>
                          <Button 
                            variant="destructive" 
                            className="flex-1"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleOpenCancelModal(e, ocorrencia);
                            }}
                          >
                            Cancelar Esta Coleta
                          </Button>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  {/* Botão de avaliação para ocorrências realizadas não avaliadas */}
                  {ocorrencia.status === 'collected' && !ocorrencia.avaliacao && (
                    <Button 
                      variant="outline" 
                      className="flex-1 mt-2"
                      onClick={e => { e.stopPropagation(); setUiState(prev => ({
                        ...prev,
                        modals: { ...prev.modals, avaliacao: true },
                        ocorrenciaAtual: ocorrencia
                      })); }}
                    >
                      {['individual_collector', 'cooperative', 'cooperative_owner', 'collector_company_owner'].includes(userType)
                        ? 'Avaliar Solicitante'
                        : 'Avaliar Coletor'}
                    </Button>
                  )}
                  {/* Avaliações */}
                  {(ocorrencia.avaliacaoColetor || ocorrencia.avaliacaoSolicitante) && (
                    <div className="bg-white p-2 rounded border space-y-4">
                      {ocorrencia.avaliacaoColetor && (
                        <StandardRatingStars 
                          estrelas={ocorrencia.avaliacaoColetor.estrelas} 
                          comentario={ocorrencia.avaliacaoColetor.comentario}
                          tipo="coletor"
                          avaliadoPor={ocorrencia.avaliacaoColetor.avaliadoPor}
                        />
                      )}
                      {ocorrencia.avaliacaoSolicitante && (
                        <StandardRatingStars 
                          estrelas={ocorrencia.avaliacaoSolicitante.estrelas} 
                          comentario={ocorrencia.avaliacaoSolicitante.comentario}
                          tipo="solicitante"
                          avaliadoPor={ocorrencia.avaliacaoSolicitante.avaliadoPor}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {/* Modal de avaliação para ocorrências */}
          <StandardRatingModal
            isOpen={uiState.modals.avaliacao}
            onClose={() => setUiState(prev => ({
              ...prev,
              modals: { ...prev.modals, avaliacao: false },
              ocorrenciaAtual: null
            }))}
            tipo={'coletor'}
            avaliadoPor={'Solicitante'}
            nomeColetor={uiState.ocorrenciaAtual?.coletor?.nome || coletor?.nome}
            fotoColetor={uiState.ocorrenciaAtual?.coletor?.foto || coletor?.foto}
            onSubmit={(avaliacao) => {
              if (!uiState.ocorrenciaAtual) return;
              setOcorrenciasState(prev => prev.map(o =>
                o.id === uiState.ocorrenciaAtual.id
                  ? { ...o, avaliacao: { estrelas: avaliacao.estrelas, comentario: avaliacao.comentario || '', avaliadoPor: 'Solicitante' } }
                  : o
              ));
              setAnimations(prev => ({ ...prev, rating: true }));
              toast.success('Avaliação enviada com sucesso!');
            }}
          />
        </div>
      )}

      {/* Modais */}
      <StandardRegisterCollectionModal
        open={uiState.modals.registro}
        onOpenChange={(open) => setUiState(prev => ({
          ...prev,
          modals: { ...prev.modals, registro: open },
          ocorrenciaAtual: null
        }))}
        coleta={uiState.ocorrenciaAtual ? {
          materiais: uiState.ocorrenciaAtual.materiais,
          fotos: uiState.ocorrenciaAtual.fotos,
          observacoes: uiState.ocorrenciaAtual.observacao,
        } : { materiais: [], fotos: [], observacoes: '' }}
        onSave={(dados) => {
          if (!uiState.ocorrenciaAtual) return;
          // Atualiza a ocorrência atual para 'collected'
          let novaOcorrenciaAtual = {
            ...uiState.ocorrenciaAtual,
            materiais: dados.materiais,
            fotos: dados.fotos,
            observacao: dados.observacoes,
            status: 'collected' as const
          };
          // Atualiza o array de ocorrências
          let novasOcorrencias = ocorrenciasState.map(o =>
            o.id === uiState.ocorrenciaAtual!.id ? novaOcorrenciaAtual : o
          );
          // Verifica se já existe uma próxima ocorrência futura 'scheduled'
          const existeFutura = novasOcorrencias.some(o => o.status === 'scheduled' && new Date(o.data) > new Date());
          if (!existeFutura) {
            // Gera próxima ocorrência futura baseada na frequência e dias da semana
            const freq = frequencia || 'semanal';
            let diasIntervalo = 7;
            if (freq === 'quinzenal') diasIntervalo = 14;
            if (freq === 'mensal') diasIntervalo = 30;
            const ultimaData = new Date(novaOcorrenciaAtual.data);
            ultimaData.setDate(ultimaData.getDate() + diasIntervalo);
            const novaFutura = {
              ...novaOcorrenciaAtual,
              id: `${novaOcorrenciaAtual.id}-next-${ultimaData.getTime()}`,
              data: ultimaData,
              status: 'scheduled' as const,
              observacao: undefined,
              fotos: [],
              avaliacao: undefined,
              materiais: novaOcorrenciaAtual.materiais.map(m => ({ ...m, fotos: [] })),
            };
            novasOcorrencias = [...novasOcorrencias, novaFutura];
          }
          setOcorrenciasState(novasOcorrencias);
          if (onOcorrenciasChange) onOcorrenciasChange(novasOcorrencias);
          toast.success('Coleta registrada com sucesso!');
          setUiState(prev => ({
            ...prev,
            modals: { ...prev.modals, registro: false },
            ocorrenciaAtual: null
          }));
          setAnimations(prev => ({ ...prev, success: true }));
        }}
        />
      <StandardCancelCollectionModal
        open={uiState.modals.cancelamento}
        onOpenChange={(open) => setUiState(prev => ({
          ...prev,
          modals: { ...prev.modals, cancelamento: open }
        }))}
        onConfirm={handleConfirmCancelamento}
      />

      {/* Animações */}
      {animations.rating && (
        <AchievementAnimation
          title="Avaliação Enviada!"
          description="Obrigado por avaliar o coletor. Sua opinião é muito importante!"
          icon={<Star className="w-16 h-16 text-yellow-500" />}
          soundType="avaliarstar"
          onComplete={() => setAnimations(prev => ({ ...prev, rating: false }))}
        />
      )}
      {animations.success && (
        <AchievementAnimation
          title="Coleta Registrada!"
          description="Sua coleta foi registrada com sucesso."
          icon={<BadgeAlert className="w-16 h-16 text-green-600" />}
          soundType="achievement"
          onComplete={() => setAnimations(prev => ({ ...prev, success: false }))}
        />
      )}
    </div>
  );
};

export default React.memo(StandardCollectionOccurrencesList); 