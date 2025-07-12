import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, Clock, Package, ChevronDown, ChevronUp, Star, Star as StarFilled, Star as StarOutline, Trash2, List, CheckCircle, XCircle, Repeat, User } from 'lucide-react';
import StandardCollectorVehicle from '@/components/dashboard/standard/StandardCollectorVehicle';
import StandardMaterialList from './StandardMaterialList';
import StandardPhotoGallery from './StandardPhotoGallery';
import StandardCollectionOccurrencesList from './StandardCollectionOccurrencesList';
import StandardRatingStars from './StandardRatingStars';
import StandardRatingModal from './StandardRatingModal';
import StandardEditCollectionModal from './StandardEditCollectionModal';
import StandardCancelCollectionModal from './StandardCancelCollectionModal';
import StandardRegisterCollectionModal from './StandardRegisterCollectionModal';
import StandardAcceptCollectionModal from './StandardAcceptCollectionModal';
import StandardRejectCollectionModal from './StandardRejectCollectionModal';
import { toast } from 'sonner';
import { AchievementAnimation } from '@/components/animations/AchievementAnimation';
import AchievementSolicitanteRating from '@/components/animations/AchievementSolicitanteRating';
import { materialDisplayData } from '@/config/materialDisplayData';
import { usePoints } from '@/hooks/usePoints';

interface Coletor {
  nome: string;
  foto?: string;
  telefone?: string;
  avaliacaoMedia?: number;
  totalColetas?: number;
  verificado?: boolean;
  modalidadeTransporte?: string;
  veiculoType?: string;
  veiculoDescricao?: string;
}

interface Solicitante {
  nome: string;
  foto?: string;
  avaliacaoMedia?: number;
  totalColetas?: number;
}

interface Material {
  type: string;
  quantity: string | number;
  unit: string;
  fotos?: string[];
}

interface Ocorrencia {
  id: string | number;
  data: Date;
  horario: string;
  status: 'scheduled' | 'collected' | 'cancelled';
  materiais: Material[];
  observacao?: string;
  fotos?: string[];
  avaliacao?: {
    estrelas: number;
    comentario: string;
    avaliadoPor: string;
  };
}

interface StandardCollectionHistoryCardProps {
  id: number | string;
  status: 'pending' | 'scheduled' | 'collected' | 'cancelled';
  tipoColeta: 'simples' | 'recorrente';
  data: Date;
  hora?: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  coletor?: Coletor;
  solicitante?: Solicitante;
  userType?: string;
  materiais: Material[];
  frequencia?: 'semanal' | 'quinzenal' | 'mensal';
  diasSemana?: string[];
  ocorrencias?: Ocorrencia[];
  observacoes?: string;
  observacaoCooperativa?: string;
  avaliacaoColetor?: {
    estrelas: number;
    comentario?: string;
    avaliadoPor?: string;
  };
  avaliacaoSolicitante?: {
    estrelas: number;
    comentario?: string;
    avaliadoPor?: string;
  };
  cancellationReason?: string;
  quemCancelou?: string;
  onAvaliar?: (tipo: 'coletor' | 'solicitante', avaliacao: { estrelas: number; comentario?: string }) => void;
  registradaPor?: 'coletor' | 'solicitante' | null;
  hideActions?: boolean;
  expanded?: boolean;
  onExpand?: () => void;
  onRegister?: () => void;
  onEdit?: (dados: any) => void;
  onCancel?: (motivo: string) => void;
  onConfirm?: () => void;
  fotos?: string[];
}

// Função utilitária para verificar se o cancelamento está dentro do período agendado
function isNowWithinPeriod(period: string, date: Date): boolean {
  const now = new Date();
  if (now.toDateString() !== date.toDateString()) return false;
  const hour = now.getHours();
  if (period === 'morning') return hour >= 8 && hour < 12;
  if (period === 'afternoon') return hour >= 12 && hour < 18;
  if (period === 'night') return hour >= 18 && hour < 23;
  return false;
}

// Função para determinar o período a partir do horário
function getPeriodFromTime(time?: string): 'Manhã' | 'Tarde' | 'Noite' {
  if (!time) return 'Tarde';
  const hour = parseInt(time.split(':')[0]);
  if (hour >= 5 && hour < 12) return 'Manhã';
  if (hour >= 12 && hour < 18) return 'Tarde';
  return 'Noite';
}

const StandardCollectionHistoryCard: React.FC<StandardCollectionHistoryCardProps> = (props) => {
  const {
    id, status, tipoColeta, data, hora, endereco, bairro, cidade, estado,
    coletor, solicitante, userType, materiais: materiaisProp, frequencia, diasSemana, ocorrencias,
    observacoes, observacaoCooperativa, avaliacaoColetor, avaliacaoSolicitante, cancellationReason, quemCancelou,
    onAvaliar, registradaPor = null, hideActions = false, expanded, onExpand,
    onRegister, onEdit, onCancel, onConfirm,
    fotos,
  } = props;

  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = expanded !== undefined ? expanded : internalExpanded;
  const [mostrarFormAvaliacao, setMostrarFormAvaliacao] = useState<'coletor' | 'solicitante' | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [ocorrenciasState, setOcorrenciasState] = useState(ocorrencias || []);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showRatingAnimation, setShowRatingAnimation] = useState(false);
  const [materiais, setMateriais] = useState(materiaisProp);
  const { addPoints } = usePoints();

  // Sincronizar dados principais do card com a próxima ocorrência agendada
  useEffect(() => {
    if (tipoColeta === 'recorrente' && ocorrenciasState.length > 0) {
      // Próxima ocorrência agendada
      const hoje = new Date(); hoje.setHours(0,0,0,0);
      const futuras = ocorrenciasState.filter(o => o.status === 'scheduled' && new Date(o.data) >= hoje);
      const proxima = futuras.length > 0 ? futuras.reduce((prev, curr) => new Date(curr.data) < new Date(prev.data) ? curr : prev) : null;
      if (proxima) {
        // Atualiza status, data, materiais, etc do card
        if (proxima.data && proxima.materiais) {
          // Atualiza data e materiais do card
          setMateriais(proxima.materiais);
        }
      }
    }
  }, [ocorrenciasState, tipoColeta]);

  // Sincronizar materiais internos com a prop sempre que ela mudar
  useEffect(() => {
    setMateriais(materiaisProp);
  }, [materiaisProp]);

  // Determinar data e motivo do cancelamento para recorrentes
  let dataCancelamento: Date | undefined = undefined;
  let motivoCancelamento: string | undefined = undefined;

  if (status === 'cancelled' && tipoColeta === 'recorrente' && ocorrenciasState.length > 0) {
    // Busca a última ocorrência cancelada
    const ocorrenciasCanceladas = ocorrenciasState.filter(o => o.status === 'cancelled');
    if (ocorrenciasCanceladas.length > 0) {
      // Pega a mais recente
      const ultima = ocorrenciasCanceladas.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0];
      dataCancelamento = ultima.data;
      motivoCancelamento = ultima.observacao || cancellationReason;
    } else {
      // fallback para o campo principal
      dataCancelamento = data;
      motivoCancelamento = cancellationReason;
    }
  } else if (status === 'cancelled') {
    // Para não recorrente
    dataCancelamento = data;
    motivoCancelamento = cancellationReason;
  }

  // Funções auxiliares para badges, datas, etc
  const getStatusBadge = () => {
    const statusConfig = {
      pending: {
        label: 'Pendente',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        icon: <Clock className="h-4 w-4" />
      },
      scheduled: {
        label: 'Agendada',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        icon: <Calendar className="h-4 w-4" />
      },
      collected: {
        label: 'Realizada',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        icon: <CheckCircle className="h-4 w-4" />
      },
      cancelled: {
        label: 'Cancelada',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        icon: <XCircle className="h-4 w-4" />
      }
    };

    const config = statusConfig[status];
    return (
      <Badge className={`${config.bgColor} ${config.textColor} flex items-center gap-1 px-3 py-1`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getFrequenciaBadge = () => {
    if (tipoColeta === 'recorrente' && frequencia) {
      const frequenciaConfig = {
        semanal: {
          label: 'Semanal',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-800',
          icon: <Repeat className="h-4 w-4" />
        },
        quinzenal: {
          label: 'Quinzenal',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-800',
          icon: <Repeat className="h-4 w-4" />
        },
        mensal: {
          label: 'Mensal',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-800',
          icon: <Repeat className="h-4 w-4" />
        }
      };

      const config = frequenciaConfig[frequencia];
      return (
        <Badge className={`${config.bgColor} ${config.textColor} flex items-center gap-1 px-3 py-1`}>
          {config.icon}
          {config.label}
        </Badge>
      );
    }
    return null;
  };

  // Exemplo de formatação de data
  const formatDate = (date: Date) =>
    date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const handleAvaliar = (tipo: 'coletor' | 'solicitante', avaliacao: { estrelas: number; comentario?: string }) => {
    onAvaliar?.(tipo, avaliacao);
    setMostrarFormAvaliacao(null);
  };

  // Função para renderizar o cabeçalho do card
  const renderCardHeader = () => {
    // Se for coletor individual, mostra sempre dados do solicitante
    if (userType === 'individual_collector') {
      return (
        <div className="flex items-center gap-2 mb-2">
          {solicitante?.foto ? (
            <Avatar className="h-6 w-6">
              <AvatarImage src={solicitante.foto} alt={solicitante.nome} />
              <AvatarFallback>{solicitante.nome.charAt(0)}</AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="h-6 w-6"><AvatarFallback>?</AvatarFallback></Avatar>
          )}
          <span className="font-medium">{solicitante?.nome || 'Solicitante não definido'}</span>
          {solicitante?.avaliacaoMedia && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground ml-2">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              {solicitante.avaliacaoMedia}
              {solicitante.totalColetas && <span className="ml-2">• {solicitante.totalColetas} coletas</span>}
            </span>
          )}
        </div>
      );
    }
    // Caso contrário, mantém a lógica original para mostrar dados do coletor
    return (
      <div className="flex items-center gap-2 mb-2">
        {status === 'pending' && tipoColeta === 'simples' && !coletor ? (
          <>
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="italic text-muted-foreground">Aguardando um coletor aceitar a coleta</span>
          </>
        ) : (
          <>
            {coletor?.foto ? (
              <Avatar className="h-6 w-6">
                <AvatarImage src={coletor.foto} alt={coletor.nome} />
                <AvatarFallback>{coletor.nome.charAt(0)}</AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="h-6 w-6"><AvatarFallback>?</AvatarFallback></Avatar>
            )}
            <span className="font-medium">{coletor?.nome || 'Coletor não definido'}</span>
            {coletor?.avaliacaoMedia && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground ml-2">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                {coletor.avaliacaoMedia}
                {coletor.totalColetas && <span className="ml-2">• {coletor.totalColetas} coletas</span>}
              </span>
            )}
            {coletor?.veiculoType && (
              <StandardCollectorVehicle 
                vehicleType={coletor.veiculoType} 
                otherVehicleDescription={coletor.veiculoDescricao} 
                size="sm" 
                showLabel={false} 
              />
            )}
          </>
        )}
      </div>
    );
  };

  // Função para renderizar botões de ação principais
  const renderAcoesPrincipais = () => {
    if (hideActions) return null;
    // Não exibe botões de ação para coletas realizadas, apenas Avaliar se aplicável
    if (status === 'collected') {
      if (!avaliacaoColetor) {
        return (
          <Button 
            variant="outline" 
            onClick={() => setMostrarFormAvaliacao([
              'individual_collector',
              'cooperative',
              'cooperative_owner',
              'collector_company_owner',
            ].includes(userType) ? 'solicitante' : 'coletor')}
            className="flex-1"
          >
            {[
              'individual_collector',
              'cooperative',
              'cooperative_owner',
              'collector_company_owner',
            ].includes(userType)
              ? 'Avaliar Solicitante'
              : 'Avaliar Coletor'}
          </Button>
        );
      }
      // Se já avaliou, não mostra nada
      return null;
    }
    // Se for coletor individual e a coleta estiver pendente
    if (userType === 'individual_collector' && status === 'pending') {
      return (
        <div className="flex gap-2">
          <Button 
            variant="default"
            onClick={() => setShowAcceptModal(true)}
            className="flex-1"
          >
            Aceitar
          </Button>
          <Button 
            variant="destructive"
            onClick={() => setShowRejectModal(true)}
            className="flex-1"
          >
            Recusar
          </Button>
        </div>
      );
    }
    // Para outros perfis e status pending: só Editar e Cancelar
    if (status === 'pending') {
      return (
        <div className="flex gap-2">
          <Button 
            variant="outline"
            className="flex-1"
            onClick={e => { e.stopPropagation(); setShowEditModal(true); }}
          >
            Editar
          </Button>
          <Button 
            variant="destructive"
            className="flex-1"
            onClick={() => setShowCancelModal(true)}
          >
            Cancelar
          </Button>
        </div>
      );
    }
    // Se a coleta já foi registrada por coletor ou solicitante
    if (registradaPor) {
      // Só pode avaliar se ainda não avaliou
      if (!avaliacaoColetor) {
        return (
          <Button 
            variant="outline" 
            onClick={() => setMostrarFormAvaliacao('coletor')}
            className="flex-1"
          >
            Avaliar Coletor
          </Button>
        );
      }
      // Se já avaliou, não mostra nada
      return null;
    }
    // Se não está pendente, mostra Registrar Coleta, Editar e Cancelar
    return (
      <div className="flex gap-2">
        <Button 
          variant="default"
          onClick={() => setShowRegisterModal(true)}
          className="flex-1"
        >
          Registrar Coleta
        </Button>
        <Button 
          variant="outline"
          className="flex-1"
          onClick={e => { e.stopPropagation(); setShowEditModal(true); }}
        >
          Editar
        </Button>
        <Button 
          variant="destructive"
          className="flex-1"
          onClick={() => setShowCancelModal(true)}
        >
          Cancelar
        </Button>
      </div>
    );
  };

  let registrarColetaProxima = null;
  if (tipoColeta === 'recorrente') {
    const hoje = new Date();
    const dataProxima = new Date(data); // Ajuste se necessário para pegar a data correta da próxima coleta
    dataProxima.setHours(0,0,0,0);
    hoje.setHours(0,0,0,0);
    if (status === 'scheduled' && dataProxima <= hoje) {
      registrarColetaProxima = (
        <div className="ml-6 mt-2">
          <Button variant="default">Registrar Coleta</Button>
        </div>
      );
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2 cursor-pointer" onClick={() => {
            if (onExpand) onExpand();
            else setInternalExpanded(e => !e);
          }}>
            {getStatusBadge()}
            {getFrequenciaBadge()}
            {/* Estrela de avaliação para status Realizada (collected) quando card fechado */}
            {status === 'collected' && !isExpanded && (
              avaliacaoColetor || avaliacaoSolicitante ? (
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              ) : (
                <Star className="h-5 w-5 text-muted-foreground" />
              )
            )}
            <span className="text-sm text-muted-foreground">
              Solicitado em {formatDate(data)}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground"
              onClick={e => { e.stopPropagation(); if (onExpand) onExpand(); else setInternalExpanded(e => !e); }}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
          {renderCardHeader()}
          <Separator className="mb-2" />
          {isExpanded && status === 'cancelled' && tipoColeta === 'recorrente' ? (
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-700" />
                  <span className="text-green-700 font-medium">Data de Início: {formatDate(data)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-red-700" />
                  <span className="text-red-700 font-medium">Data do Cancelamento: {formatDate(dataCancelamento || data)}</span>
                </div>
              </div>
              {motivoCancelamento && (
                <div className="bg-red-100 rounded p-3 mt-2 mb-6">
                  <span className="block font-medium text-red-700 mb-1">Motivo do Cancelamento:</span>
                  <span className="text-red-800">{motivoCancelamento}</span>
                </div>
              )}
            </div>
          ) : isExpanded && status === 'cancelled' && tipoColeta === 'simples' ? (
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-700" />
                  <span className="text-green-700 font-medium">Data da Coleta: {formatDate(data)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-red-700" />
                  <span className="text-red-700 font-medium">Data do Cancelamento: {formatDate(dataCancelamento || data)}</span>
                </div>
              </div>
              {motivoCancelamento && (
                <div className="bg-red-100 rounded p-3 mt-2 mb-6">
                  <span className="block font-medium text-red-700 mb-1">Motivo do Cancelamento:</span>
                  <span className="text-red-800">{motivoCancelamento}</span>
                </div>
              )}
            </div>
          ) : isExpanded && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-neutro" />
                <span>Data de Início: {formatDate(data)}</span>
              </div>
              {tipoColeta === 'recorrente' && (
                <div className="mb-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold">Próxima coleta:</span>
                  </div>
                  <div className="ml-6 mb-2">
                    <span className="font-semibold text-base text-blue-900">30 de dezembro de 2025</span>
                  </div>
                </div>
              )}
              {tipoColeta === 'recorrente' && diasSemana && (
                <div className="flex items-center gap-2">
                  <List className="h-4 w-4 text-neutro" />
                  <span>Dias: {diasSemana.join(', ')}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-neutro" />
                <span>Período: {getPeriodFromTime(hora)} {getPeriodFromTime(hora) === 'Manhã' ? '(08:00 - 12:00)' : getPeriodFromTime(hora) === 'Tarde' ? '(13:00 - 18:00)' : '(19:00 - 22:00)'}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-neutro mt-1" />
                <div>
                  <p>{endereco}</p>
                  <p className="text-sm text-muted-foreground">{bairro}, {cidade} - {estado}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 mt-2">
                <Package className="h-4 w-4 text-neutro mt-1" />
                <div>
                  <h4 className="font-medium mb-2">Materiais da próxima coleta</h4>
                  <StandardMaterialList materiais={materiais} />
                </div>
              </div>
              <div className="mt-2">
                <h4 className="font-medium mb-2">Fotos dos Materiais</h4>
                <StandardPhotoGallery fotos={props.fotos || materiais.flatMap(m => m.fotos || [])} />
              </div>
              <div className="p-4 bg-muted/50 rounded-lg mt-2">
                <p className="text-sm font-medium mb-1">Observações do Solicitante:</p>
                <p className="text-sm">{observacoes || 'Nenhuma observação adicionada.'}</p>
              </div>
              {observacaoCooperativa && (
                <div className="p-4 bg-blue-50 rounded-lg mt-2">
                  <p className="text-sm font-medium mb-1 text-blue-800">Observações do Coletor:</p>
                  <p className="text-sm text-blue-900">{observacaoCooperativa}</p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2 mt-3">
                {renderAcoesPrincipais()}
              </div>
              <div className="mt-2 space-y-4">
                {avaliacaoColetor && (
                  <StandardRatingStars 
                    estrelas={avaliacaoColetor.estrelas} 
                    comentario={avaliacaoColetor.comentario}
                    tipo="coletor"
                    avaliadoPor={avaliacaoColetor.avaliadoPor}
                  />
                )}
                {avaliacaoSolicitante && (
                  <StandardRatingStars 
                    estrelas={avaliacaoSolicitante.estrelas} 
                    comentario={avaliacaoSolicitante.comentario}
                    tipo="solicitante"
                    avaliadoPor={avaliacaoSolicitante.avaliadoPor}
                  />
                )}
              </div>
              {tipoColeta === 'recorrente' && status !== 'pending' && ocorrencias && (
                <div className="mt-4">
                  <StandardCollectionOccurrencesList 
                    ocorrencias={ocorrenciasState} 
                    userType={userType} 
                    coletor={coletor} 
                    frequencia={frequencia}
                    onOcorrenciasChange={setOcorrenciasState}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <StandardEditCollectionModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        coleta={{
          materiais,
          fotos: materiais.flatMap(m => m.fotos || []),
          observacoes,
        }}
        onSave={(dados) => {
          // Atualizar os materiais da ocorrência agendada mais próxima
          const hoje = new Date(); hoje.setHours(0,0,0,0);
          setOcorrenciasState(prev => {
            const futuras = prev.filter(o => o.status === 'scheduled' && new Date(o.data) >= hoje);
            const proxima = futuras.length > 0 ? futuras.reduce((prevO, curr) => new Date(curr.data) < new Date(prevO.data) ? curr : prevO) : null;
            if (!proxima) return prev;
            const novas = prev.map(o =>
              o.id === proxima.id
                ? { ...o, materiais: dados.materiais, fotos: dados.fotos, observacao: dados.observacaoCooperativa }
                : o
            );
            // Atualiza materiais do card para refletir edição
            setMateriais(dados.materiais);
            return novas;
          });
          toast.success('Coleta editada com sucesso!');
          if (onEdit) onEdit(dados);
        }}
      />
      <StandardCancelCollectionModal
        open={showCancelModal}
        onOpenChange={setShowCancelModal}
        onConfirm={async (motivo) => {
          if (tipoColeta === 'recorrente') {
            const hoje = new Date(); hoje.setHours(0,0,0,0);
            const proximas = ocorrenciasState.filter(o => o.status === 'scheduled' && new Date(o.data) >= hoje);
            if (proximas.length === 0) {
              toast.error('Nenhuma próxima coleta agendada encontrada.');
              setShowCancelModal(false);
              return;
            }
            proximas.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
            const proximaOcorrencia = proximas[0];
            // Penalidade será aplicada no modal, não aqui
            const novasOcorrencias = ocorrenciasState.map(o =>
              o.id === proximaOcorrencia.id
                ? { ...o, status: 'cancelled' as const, observacao: motivo }
                : o
            );
            let novaData = new Date(proximaOcorrencia.data);
            if (frequencia === 'semanal') {
              novaData.setDate(novaData.getDate() + 7);
            } else if (frequencia === 'quinzenal') {
              novaData.setDate(novaData.getDate() + 14);
            } else if (frequencia === 'mensal') {
              novaData.setMonth(novaData.getMonth() + 1);
            }
            const novaOcorrencia = {
              ...proximaOcorrencia,
              id: `${proximaOcorrencia.id}-next-${novaData.getTime()}`,
              data: novaData,
              status: 'scheduled' as const,
              observacao: undefined,
              fotos: [],
              avaliacao: undefined,
              materiais: proximaOcorrencia.materiais.map(m => ({ ...m, fotos: [] })),
            };
            setOcorrenciasState([...novasOcorrencias, novaOcorrencia]);
            toast.success('Coleta cancelada com sucesso! Nova ocorrência agendada.');
            setShowCancelModal(false);
            if (onCancel) onCancel(motivo);
          } else {
            // Coleta simples: penalidade já tratada no modal
            if (onCancel) onCancel(motivo);
            setShowCancelModal(false);
            toast.success('Coleta cancelada com sucesso!');
          }
        }}
        hora={tipoColeta === 'recorrente' ? (() => {
          const hoje = new Date(); hoje.setHours(0,0,0,0);
          const proximas = ocorrenciasState.filter(o => o.status === 'scheduled' && new Date(o.data) >= hoje);
          if (proximas.length === 0) return undefined;
          proximas.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
          return proximas[0].horario;
        })() : hora}
        data={tipoColeta === 'recorrente' ? (() => {
          const hoje = new Date(); hoje.setHours(0,0,0,0);
          const proximas = ocorrenciasState.filter(o => o.status === 'scheduled' && new Date(o.data) >= hoje);
          if (proximas.length === 0) return undefined;
          proximas.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
          return new Date(proximas[0].data);
        })() : data}
      />
      <StandardRegisterCollectionModal
        open={showRegisterModal}
        onOpenChange={setShowRegisterModal}
        coleta={{
          materiais: materiais.map(mat => {
            // Normaliza o type para o identificador correto
            let identificador = mat.type;
            if (typeof identificador !== 'string' || !identificador) {
              identificador = 'outros';
            }
            if (!Object.keys(materialDisplayData).includes(identificador)) {
              const found = typeof mat.type === 'string' && mat.type ?
                Object.entries(materialDisplayData).find(([, v]) => (v as any).nome && (v as any).nome.toLowerCase() === mat.type.toLowerCase()) : undefined;
              if (found) identificador = found[0];
            }
            return { ...mat, type: identificador };
          }),
          fotos: materiais.flatMap(m => m.fotos || []),
          observacoes,
        }}
        onSave={(dados) => {
          setShowRegisterModal(false);
          setShowSuccessAnimation(true);
          // Atualizar ocorrência agendada mais próxima para 'collected' e criar próxima futura
          setOcorrenciasState(prev => {
            const hoje = new Date(); hoje.setHours(0,0,0,0);
            const futuras = prev.filter(o => o.status === 'scheduled' && new Date(o.data) >= hoje);
            const proxima = futuras.length > 0 ? futuras.reduce((prevO, curr) => new Date(curr.data) < new Date(prevO.data) ? curr : prevO) : null;
            if (!proxima) return prev;
            let novas = prev.map(o =>
              o.id === proxima.id
                ? { ...o, materiais: dados.materiais, fotos: dados.fotos, observacao: dados.observacoes, status: 'collected' as const }
                : o
            );
            // Gera próxima futura
            const freq = frequencia || 'semanal';
            let diasIntervalo = 7;
            if (freq === 'quinzenal') diasIntervalo = 14;
            if (freq === 'mensal') diasIntervalo = 30;
            const ultimaData = new Date(proxima.data);
            ultimaData.setDate(ultimaData.getDate() + diasIntervalo);
            const novaFutura = {
              ...proxima,
              id: `${proxima.id}-next-${ultimaData.getTime()}`,
              data: ultimaData,
              status: 'scheduled' as const,
              observacao: undefined,
              fotos: [],
              avaliacao: undefined,
              materiais: dados.materiais.map(m => ({ ...m, fotos: [] })),
            };
            novas = [...novas, novaFutura];
            // Atualiza materiais do card para refletir próxima coleta
            setMateriais(novaFutura.materiais);
            return novas;
          });
          if (onRegister) onRegister();
        }}
      />
      <StandardAcceptCollectionModal
        open={showAcceptModal}
        onOpenChange={setShowAcceptModal}
        onConfirm={(observacao) => {
          toast.success('Coleta aceita com sucesso!');
          setShowAcceptModal(false);
          if (onConfirm) onConfirm();
        }}
      />
      <StandardRejectCollectionModal
        open={showRejectModal}
        onOpenChange={setShowRejectModal}
        onConfirm={(motivo) => {
          toast.success('Coleta recusada com sucesso!');
          setShowRejectModal(false);
        }}
      />
      <StandardRatingModal
        isOpen={!!mostrarFormAvaliacao}
        onClose={() => setMostrarFormAvaliacao(null)}
        tipo={userType === 'individual_collector' ? 'solicitante' : 'coletor'}
        avaliadoPor={userType === 'individual_collector' ? 'Coletor' : 'Solicitante'}
        nomeColetor={userType !== 'individual_collector' && coletor ? coletor.nome : undefined}
        fotoColetor={userType !== 'individual_collector' && coletor ? coletor.foto : undefined}
        nomeSolicitante={userType === 'individual_collector' && solicitante ? solicitante.nome : undefined}
        fotoSolicitante={userType === 'individual_collector' && solicitante ? solicitante.foto : undefined}
        onSubmit={(avaliacao) => {
          toast.success('Avaliação enviada com sucesso!');
          setMostrarFormAvaliacao(null);
          setShowRatingAnimation(true);
        }}
      />
      {showRatingAnimation && (
        userType === 'individual_collector' ? (
          <AchievementSolicitanteRating onComplete={() => setShowRatingAnimation(false)} />
        ) : (
          <AchievementAnimation
            title="Avaliação Enviada!"
            description="Obrigado por avaliar o coletor. Sua opinião é muito importante!"
            icon={<Star className="w-16 h-16 text-yellow-500" />}
            soundType="avaliarstar"
            onComplete={() => setShowRatingAnimation(false)}
          />
        )
      )}
      {showSuccessAnimation && (
        <AchievementAnimation
          title="Coleta Registrada!"
          description="Sua coleta foi registrada com sucesso."
          icon={<Package className="w-16 h-16 text-green-600" />}
          soundType="achievement"
          onComplete={() => {
            setShowSuccessAnimation(false);
            toast.success('Coleta registrada com sucesso!');
          }}
        />
      )}
    </Card>
  );
};

export default StandardCollectionHistoryCard; 