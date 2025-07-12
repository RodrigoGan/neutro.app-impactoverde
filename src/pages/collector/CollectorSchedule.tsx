import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Phone, MessageSquare, ChevronDown, ChevronUp, Star, X, CheckCircle2, AlertCircle, Camera, Upload, Printer, ChevronLeft, Users, Package } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { cn, getMaterialIdentificador } from '@/lib/utils';
import { AchievementAnimation } from '@/components/animations/AchievementAnimation';
import { materialDisplayData } from '@/config/materialDisplayData';
import AchievementSolicitanteRating from '@/components/animations/AchievementSolicitanteRating';
import StandardRegisterCollectionModal from '@/components/collection/StandardRegisterCollectionModal';
import { useCollectorAcceptance } from '@/hooks/useCollectorAcceptance';
import { NeighborhoodNotificationStatus } from '@/components/notifications/NeighborhoodNotificationStatus';
import { useAuth } from '@/contexts/AuthContext';
import { getCollectorCollections } from '@/lib/collectorService';
import StandardPhotoGallery from '@/components/collection/StandardPhotoGallery';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StandardCollectionHistoryCard from '@/components/collection/StandardCollectionHistoryCard';
import StandardEditCollectionModal from '@/components/collection/StandardEditCollectionModal';
import AppFooter from '@/components/AppFooter';

interface Solicitante {
  id: string;
  nome: string;
  foto?: string;
  telefone: string;
  endereco: {
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    referencia?: string;
  };
  tipoLocal: 'residencial' | 'comercial' | 'empresa';
  verificado: boolean;
  avaliacaoMedia?: number;
  totalColetas: number;
}

interface MaterialColetado {
  tipo: string;
  nome?: string;
  quantidade: string;
  unidade: string;
  fotos?: string[];
}

interface Coleta {
  id: string;
  solicitante: Solicitante;
  data: Date;
  horario: string;
  materiais: string[];
  quantidade: string;
  observacoes?: string;
  recorrente: boolean;
  status: 'pendente' | 'confirmada' | 'em_andamento' | 'realizada' | 'cancelada';
  tipoColeta: 'selecionados' | 'misturados';
  materiaisColetados?: MaterialColetado[];
  quantidadeMisturada?: {
    quantidade: string;
    unidade: string;
  };
  avaliacao?: {
    estrelas: number;
    organizacao: number;
    precisao: number;
    pontualidade: number;
    comunicacao: number;
    comentario?: string;
  };
  observacaoCooperativa?: string;
}

interface CancelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (motivo: string, observacoes: string) => void;
  coletaId: string;
}

const MOTIVOS_CANCELAMENTO = [
  { value: 'solicitante_ausente', label: 'Solicitante Ausente' },
  { value: 'local_fechado', label: 'Local Fechado' },
  { value: 'material_nao_disponivel', label: 'Material Não Disponível' },
  { value: 'endereco_nao_encontrado', label: 'Endereço Não Encontrado' },
  { value: 'problema_veiculo', label: 'Problema com Veículo' },
  { value: 'clima', label: 'Condições Climáticas' },
  { value: 'outro', label: 'Outro Motivo' }
];

const CancelDialog: React.FC<CancelDialogProps> = ({ isOpen, onClose, onConfirm, coletaId }): JSX.Element => {
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const [observacoesCancelamento, setObservacoesCancelamento] = useState('');

  const handleConfirm = () => {
    onConfirm(motivoCancelamento, observacoesCancelamento);
    setMotivoCancelamento('');
    setObservacoesCancelamento('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Cancelar Coleta
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo do Cancelamento<span className="text-destructive">*</span></Label>
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações Adicionais</Label>
            <Textarea
              id="observacoes"
              value={observacoesCancelamento}
              onChange={(e) => setObservacoesCancelamento(e.target.value)}
              placeholder="Descreva mais detalhes sobre o cancelamento..."
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter className="flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>
            Voltar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={!motivoCancelamento}
          >
            Confirmar Cancelamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const CollectorSchedule: React.FC = () => {
  const navigate = useNavigate();
  const { collectorId } = useParams();
  const { user } = useAuth();

  const [expandedColetas, setExpandedColetas] = useState<Set<string>>(new Set());
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedColeta, setSelectedColeta] = useState<Coleta | null>(null);
  const [showFinalizarModal, setShowFinalizarModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tipoColeta, setTipoColeta] = useState<'selecionados' | 'misturados'>('selecionados');
  const [materiaisColetados, setMateriaisColetados] = useState<MaterialColetado[]>([]);
  const [quantidadeMisturada, setQuantidadeMisturada] = useState({
    quantidade: '',
    unidade: 'sacos'
  });
  const [fotoMaterial, setFotoMaterial] = useState<string | null>(null);
  const [observacoes, setObservacoes] = useState('');
  const [avaliacao, setAvaliacao] = useState({
    estrelas: 5,
    organizacao: 5,
    precisao: 5,
    pontualidade: 5,
    comunicacao: 5,
    comentario: ''
  });
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [coletaToCancel, setColetaToCancel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string>('');
  const [showConfirmAnimation, setShowConfirmAnimation] = useState<string | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showColetaAceita, setShowColetaAceita] = useState(false);
  // 1. Remover o array mockado de coletas e inicializar como vazio
  const [coletas, setColetas] = useState<Coleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historicoColetas, setHistoricoColetas] = useState<Coleta[]>([]);
  const [showRegisterModal, setShowRegisterModal] = useState<{ open: boolean, coleta: Coleta | null }>({ open: false, coleta: null });
  const { acceptCollection, isLoading: isAccepting, error: acceptanceError } = useCollectorAcceptance();
  const [showNotificationStatus, setShowNotificationStatus] = useState(false);
  const [notificationData, setNotificationData] = useState<{
    neighborhoodName: string;
    date: string;
    period: 'manha' | 'tarde' | 'noite';
    notificationsSent: number;
  } | null>(null);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState<'pendente' | 'confirmada'>('pendente');

  // Adicionar os estados que estavam faltando para corrigir os linter errors
  const [showSolicitanteRatingAnimation, setShowSolicitanteRatingAnimation] = useState(false);
  const [fotosColeta, setFotosColeta] = useState<string[]>([]);
  const [observacaoSolicitante, setObservacaoSolicitante] = useState('');
  const [observacoesColetor, setObservacoesColetor] = useState('');
  const [materialExpandido, setMaterialExpandido] = useState<number | null>(null);

  // 2. Buscar dados reais do banco ao carregar a página
  useEffect(() => {
    async function fetchColetas() {
      setLoading(true);
      setError(null);
      try {
        if (!collectorId) {
          setColetas([]);
          setLoading(false);
          return;
        }
        // Buscar coletas reais do banco
        const data = await getCollectorCollections(collectorId);
        // Mapear para o formato esperado pelo componente
        const mapped = (data || []).map((item: any) => ({
          id: item.id,
          solicitante: item.solicitante ? {
            id: item.solicitante.id,
            nome: item.solicitante.full_name || 'Solicitante não informado',
            foto: item.solicitante.avatar_url || '',
            telefone: item.solicitante.phone || '',
            endereco: item.solicitante.addresses?.[0] ? {
              rua: item.solicitante.addresses[0].street || 'Rua não informada',
              numero: item.solicitante.addresses[0].number || '',
              complemento: item.solicitante.addresses[0].complement || '',
              bairro: item.solicitante.addresses[0].neighborhood || '',
              referencia: item.solicitante.addresses[0].reference || '',
            } : {
              rua: 'Rua não informada', numero: '', complemento: '', bairro: '', referencia: ''
            },
            tipoLocal: item.solicitante.addresses?.[0]?.location_type || 'residencial',
            verificado: true,
            avaliacaoMedia: undefined,
            totalColetas: undefined,
          } : undefined,
          data: item.date ? new Date(item.date) : new Date(),
          horario: item.time || '',
          materiais: item.materials || [],
          quantidade: item.quantity_description || '',
          observacoes: item.observations || '',
          recorrente: item.is_recurring || false,
          status: item.status || 'pendente',
          tipoColeta: item.collection_type || 'selecionados',
          materiaisColetados: item.collected_materials || [],
          quantidadeMisturada: item.mixed_quantity || undefined,
          avaliacao: item.rating || undefined,
          observacaoCooperativa: undefined,
        }));
        setColetas(mapped);
      } catch (err: any) {
        console.error('Erro ao carregar coletas do Supabase:', err);
        setError('Erro ao carregar coletas.');
        setColetas([]);
      } finally {
        setLoading(false);
      }
    }
    fetchColetas();
  }, [collectorId]);

  // Filtro de coletas por status e busca
  const filteredColetas = coletas.filter(coleta =>
    coleta.status === statusTab && (
      search.trim() === '' ||
      coleta.solicitante.nome.toLowerCase().includes(search.toLowerCase()) ||
      coleta.solicitante.endereco.rua.toLowerCase().includes(search.toLowerCase()) ||
      coleta.solicitante.endereco.bairro.toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleFinalizarColeta = () => {
    if (!selectedColeta) return;

    const coletaAtualizada = {
      ...selectedColeta,
      tipoColeta,
      materiaisColetados: tipoColeta === 'selecionados' ? materiaisColetados : undefined,
      quantidadeMisturada: tipoColeta === 'misturados' ? quantidadeMisturada : undefined,
      status: 'realizada'
    };

    // Aqui você implementaria a lógica de finalização
    toast.success('Coleta finalizada com sucesso!');
    setShowFinalizarModal(false);
    setShowSolicitanteRatingAnimation(true);
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotosColeta([...fotosColeta, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMaterial = () => {
    setMateriaisColetados([
      ...materiaisColetados,
      { tipo: 'extra', nome: '', quantidade: '', unidade: 'kg' }
    ]);
  };

  const handleAddMaterialExtra = () => {
    setMateriaisColetados([
      ...materiaisColetados,
      { tipo: '', quantidade: '', unidade: 'kg', fotos: [] }
    ]);
  };

  const handleMaterialChange = (index: number, field: keyof MaterialColetado, value: string) => {
    const novosMateriais = [...materiaisColetados];
    novosMateriais[index] = { ...novosMateriais[index], [field]: value };
    setMateriaisColetados(novosMateriais);
  };

  const handleRemoveMaterial = (index: number) => {
    setMateriaisColetados(materiaisColetados.filter((_, i) => i !== index));
  };

  const handleRemoveFoto = (index: number) => {
    setFotosColeta(fotosColeta.filter((_, i) => i !== index));
  };

  const toggleExpand = (coletaId: string) => {
    const newExpanded = new Set(expandedColetas);
    if (newExpanded.has(coletaId)) {
      newExpanded.delete(coletaId);
    } else {
      newExpanded.add(coletaId);
    }
    setExpandedColetas(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'confirmada':
        return <Badge variant="default">Confirmada</Badge>;
      case 'em_andamento':
        return <Badge variant="secondary">Em Andamento</Badge>;
      case 'realizada':
        return <Badge variant="outline">Realizada</Badge>;
      case 'cancelada':
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return null;
    }
  };

  const getAcoesColeta = (coleta: Coleta) => {
    switch (coleta.status) {
      case 'pendente':
        return (
          <div className="flex gap-2">
            <Button 
              variant="default" 
              size="sm"
              onClick={() => {
                setSelectedColeta(coleta);
                setShowFinalizarModal(true);
              }}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Iniciar Coleta
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => toast.error('Funcionalidade em desenvolvimento')}
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          </div>
        );
      case 'em_andamento':
        return (
          <Button 
            variant="default" 
            size="sm"
            onClick={() => {
              setSelectedColeta(coleta);
              setShowFinalizarModal(true);
            }}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Finalizar Coleta
          </Button>
        );
      case 'realizada':
        return coleta.avaliacao ? (
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">{coleta.avaliacao.estrelas} estrelas</span>
          </div>
        ) : (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setSelectedColeta(coleta);
            }}
          >
            <Star className="mr-2 h-4 w-4" />
            Avaliar
          </Button>
        );
      default:
        return null;
    }
  };

  const renderDetalhesColeta = (coleta: Coleta) => {
    if (!expandedColetas.has(coleta.id)) return null;

    return (
      <div className="space-y-4 p-4 bg-muted/50">
        {/* Seção do Solicitante */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Dados do Solicitante
          </h4>
          <div className="flex items-start gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{coleta.solicitante.telefone}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">
                    {coleta.solicitante.endereco.rua}, {coleta.solicitante.endereco.numero}
                    {coleta.solicitante.endereco.complemento && 
                      ` - ${coleta.solicitante.endereco.complemento}`
                    }
                  </p>
                  <p className="text-muted-foreground">
                    {coleta.solicitante.endereco.bairro}
                    {coleta.solicitante.endereco.referencia && (
                      <span className="block italic">
                        Referência: {coleta.solicitante.endereco.referencia}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção da Coleta */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            Detalhes da Coleta
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Data:</span>
                <span>{format(coleta.data, "PPP", { locale: ptBR })}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Horário:</span>
                <span>{coleta.horario}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-medium text-sm mb-2">Materiais para Coleta:</h5>
              {coleta.tipoColeta === 'selecionados' && coleta.materiaisColetados ? (
                <div className="space-y-2">
                  {coleta.materiaisColetados.map((material, index) => {
                    const displayInfo = materialDisplayData[getMaterialIdentificador(material.tipo)] || materialDisplayData.outros;
                    return (
                      <div key={index} className="flex flex-col gap-1 bg-muted/50 p-2 rounded">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <displayInfo.icone className={`h-4 w-4 ${displayInfo.cor}`} />
                            <span>{displayInfo.nome}</span>
                          </div>
                          <Badge variant="outline">
                            {material.quantidade} {material.unidade}
                          </Badge>
                        </div>
                        {material.fotos && material.fotos.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {material.fotos.map((foto, fidx) => (
                              <img
                                key={fidx}
                                src={foto}
                                alt={`Foto do material ${displayInfo.nome}`}
                                className="w-20 h-20 object-cover rounded border"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : coleta.quantidadeMisturada ? (
                <div className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>Material Misturado</span>
                  </div>
                  <Badge variant="outline">
                    {coleta.quantidadeMisturada.quantidade} {coleta.quantidadeMisturada.unidade}
                  </Badge>
                </div>
              ) : null}
            </div>
          </div>
          <div className="mt-4">
            <h4 className="font-medium mb-2">Fotos dos Materiais</h4>
            <StandardPhotoGallery fotos={coleta.materiaisColetados ? coleta.materiaisColetados.flatMap(m => m.fotos || []) : []} />
          </div>
        </div>

        {coleta.observacoes && (
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              Observações
            </h4>
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
              {coleta.observacoes}
            </p>
          </div>
        )}

        {coleta.status === 'realizada' && coleta.avaliacao && (
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Avaliação
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star 
                    key={index}
                    className={`h-4 w-4 ${
                      index < coleta.avaliacao!.estrelas 
                        ? 'text-yellow-500 fill-yellow-500' 
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
                <span className="text-sm ml-2">{coleta.avaliacao.estrelas} estrelas</span>
              </div>
              {coleta.avaliacao.comentario && (
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                  {coleta.avaliacao.comentario}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="col-span-2">
          <h4 className="font-medium mb-2">Materiais</h4>
          <div className="space-y-2">
            {coleta.materiais.map((material, idx) => {
              const displayInfo = materialDisplayData[getMaterialIdentificador(material)] || materialDisplayData.outros;
              return (
                <div key={idx} className="flex items-center gap-2 bg-muted/50 p-2 rounded">
                  <div className="flex items-center gap-2 flex-1">
                    <displayInfo.icone className={`h-4 w-4 ${displayInfo.cor}`} />
                    <span>{displayInfo.nome}</span>
                  </div>
                  {coleta.materiaisColetados?.[idx]?.quantidade && coleta.materiaisColetados?.[idx]?.unidade && (
                    <span className="text-xs text-muted-foreground">
                      {coleta.materiaisColetados[idx].quantidade} {coleta.materiaisColetados[idx].unidade}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast.error('Não foi possível acessar a câmera');
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const photo = canvasRef.current.toDataURL('image/jpeg');
        setFotoMaterial(photo);
        stopCamera();
        setShowCamera(false);
      }
    }
  };

  const handlePrint = () => {
    const coletasDoDia = coletas.filter(coleta => 
      isSameDay(coleta.data, selectedDate)
    );

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Coletas do Dia - ${format(selectedDate, "PPP", { locale: ptBR })}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                padding: 20px;
                max-width: 800px;
                margin: 0 auto;
              }
              .coleta { 
                margin-bottom: 30px; 
                border: 1px solid #ddd; 
                padding: 15px;
                page-break-inside: avoid;
              }
              .solicitante { 
                display: flex; 
                margin-bottom: 15px;
                align-items: center;
              }
              .foto { 
                width: 100px; 
                height: 100px; 
                margin-right: 15px;
                border-radius: 50%;
                overflow: hidden;
                border: 2px solid #ddd;
              }
              .foto img {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
              .info { flex: 1; }
              .detalhes { margin-top: 15px; }
              .materiais { margin-top: 10px; }
              .observacoes { 
                margin-top: 10px; 
                font-style: italic;
                padding: 10px;
                background-color: #f5f5f5;
                border-radius: 4px;
              }
              .header { 
                text-align: center; 
                margin-bottom: 20px;
                padding-bottom: 20px;
                border-bottom: 2px solid #ddd;
              }
              .data { 
                font-size: 18px; 
                font-weight: bold;
                color: #666;
              }
              .status {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
                margin-left: 10px;
              }
              .status-pendente { background-color: #fff3cd; color: #856404; }
              .status-em_andamento { background-color: #cce5ff; color: #004085; }
              .status-realizada { background-color: #d4edda; color: #155724; }
              .status-cancelada { background-color: #f8d7da; color: #721c24; }
              @media print {
                body { padding: 0; }
                .coleta { border: 1px solid #000; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Coletas do Dia</h1>
              <div class="data">${format(selectedDate, "PPP", { locale: ptBR })}</div>
            </div>
            ${coletasDoDia.map(coleta => `
              <div class="coleta">
                <div class="solicitante">
                  <div class="foto">
                    <img src="${coleta.solicitante.foto || '/placeholder-avatar.jpg'}" alt="Foto do solicitante">
                  </div>
                  <div class="info">
                    <h2>${coleta.solicitante.nome}</h2>
                    <div style="display: flex; align-items: center;">
                      <span>${coleta.solicitante.telefone}</span>
                      <span class="status status-${coleta.status}">${coleta.status.replace('_', ' ')}</span>
                    </div>
                    <p>${coleta.solicitante.endereco.rua}, ${coleta.solicitante.endereco.numero}
                       ${coleta.solicitante.endereco.complemento ? ` - ${coleta.solicitante.endereco.complemento}` : ''}
                       <br>
                       ${coleta.solicitante.endereco.bairro}
                       ${coleta.solicitante.endereco.referencia ? ` (${coleta.solicitante.endereco.referencia})` : ''}
                    </p>
                  </div>
                </div>
                <div class="detalhes">
                  <p><strong>Horário:</strong> ${coleta.horario}</p>
                  <div class="materiais">
                    <strong>Materiais:</strong>
                    ${coleta.tipoColeta === 'selecionados' && coleta.materiaisColetados ? `
                      <ul>
                        ${coleta.materiaisColetados.map(material => {
                          const displayInfo = materialDisplayData[getMaterialIdentificador(material.tipo)] || materialDisplayData.outros;
                          return `<li>${displayInfo.nome}: ${material.quantidade} ${material.unidade}</li>`;
                        }).join('')}
                      </ul>
                    ` : coleta.quantidadeMisturada ? `
                      <p>Total: ${coleta.quantidadeMisturada.quantidade} ${coleta.quantidadeMisturada.unidade}</p>
                    ` : ''}
                  </div>
                  ${coleta.observacoes ? `
                    <div class="observacoes">
                      <strong>Observações:</strong> ${coleta.observacoes}
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleVerNoMapa = (coleta: Coleta) => {
    const endereco = `${coleta.solicitante.endereco.rua}, ${coleta.solicitante.endereco.numero}, ${coleta.solicitante.endereco.bairro}`;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`);
  };

  const handleCancelarColeta = (coleta: Coleta) => {
    setColetaToCancel(coleta.id);
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = (motivo: string, observacoes: string) => {
    if (coletaToCancel) {
      // Aqui você implementaria a lógica para salvar o motivo e observações
      toast.success('Coleta cancelada com sucesso');
      setShowCancelDialog(false);
      setColetaToCancel(null);
    }
  };

  const handleConfirmarColeta = async (coleta: Coleta) => {
    setIsLoading(coleta.id);
    try {
      // Simula uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowColetaAceita(true);
    } catch (error) {
      toast.error('Erro ao confirmar coleta. Tente novamente.');
    } finally {
      setIsLoading('');
    }
  };

  const handleConfirmAnimationComplete = (coletaId: string) => {
    setShowConfirmAnimation(null);
    // Atualiza o status da coleta para 'confirmada'
    setColetas(prevColetas => 
      prevColetas.map(c => 
        c.id === coletaId ? { ...c, status: 'confirmada' } : c
      )
    );
    // Remove a coleta da lista de expandidas
    setExpandedColetas(prev => {
      const newSet = new Set(prev);
      newSet.delete(coletaId);
      return newSet;
    });
    toast.success('Coleta confirmada com sucesso');
  };

  const handleColetaAceitaComplete = () => {
    setShowColetaAceita(false);
    // Atualiza o status da coleta para 'confirmada'
    setColetas(prevColetas => 
      prevColetas.map(c => 
        c.status === 'pendente' ? { ...c, status: 'confirmada' } : c
      )
    );
    toast.success('Coleta aceita com sucesso');
  };

  const handleIniciarColeta = async (coleta: Coleta) => {
    setIsLoading(coleta.id);
    try {
      // Atualiza o status da coleta para 'em_andamento'
      setColetas(prevColetas => 
        prevColetas.map(c => 
          c.id === coleta.id ? { ...c, status: 'em_andamento' } : c
        )
      );

      // Envia notificações para o bairro
      await acceptCollection({
        collectorId: collectorId || '1', // TODO: Usar ID real do coletor
        neighborhoodId: coleta.solicitante.endereco.bairro,
        date: format(coleta.data, 'yyyy-MM-dd'),
        period: getPeriodFromTime(coleta.horario),
        onSuccess: () => {
          setNotificationData({
            neighborhoodName: coleta.solicitante.endereco.bairro,
            date: format(coleta.data, 'yyyy-MM-dd'),
            period: getPeriodFromTime(coleta.horario),
            notificationsSent: 10 // TODO: Usar número real de notificações enviadas
          });
          setShowNotificationStatus(true);
        }
      });

      // Remove a coleta da lista de expandidas
      setExpandedColetas(prev => {
        const newSet = new Set(prev);
        newSet.delete(coleta.id);
        return newSet;
      });
    } catch (error) {
      toast.error('Erro ao iniciar coleta. Tente novamente.');
    } finally {
      setIsLoading('');
    }
  };

  const getPeriodFromTime = (time: string): 'manha' | 'tarde' | 'noite' => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 5 && hour < 12) return 'manha';
    if (hour >= 12 && hour < 18) return 'tarde';
    return 'noite';
  };

  const abrirModalFinalizar = (coleta: Coleta) => {
    setSelectedColeta(coleta);
    // Carregar materiais
    if (coleta.materiaisColetados && coleta.materiaisColetados.length > 0) {
      setMateriaisColetados(coleta.materiaisColetados);
    } else {
      setMateriaisColetados(coleta.materiais.map((mat) => ({ tipo: mat, quantidade: '', unidade: 'kg', fotos: [] })));
    }
    // Carregar fotos
    if (coleta.materiaisColetados && coleta.materiaisColetados.length > 0) {
      const fotos = coleta.materiaisColetados.flatMap(m => m.fotos || []);
      setFotosColeta(fotos);
    } else {
      setFotosColeta([]);
    }
    // Carregar observação do solicitante
    setObservacaoSolicitante(coleta.observacoes || '');
    // Limpar/Manter observação do coletor
    setObservacoesColetor('');
    setShowFinalizarModal(true);
  };

  useEffect(() => {
    if (showCamera) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [showCamera]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Função para registrar coleta (status para realizada)
  const handleRegisterCollection = (coletaId: string, dados: { materiais: any[]; fotos: string[]; observacaoCooperativa: string }) => {
    setColetas(prev => prev.map(coleta =>
      coleta.id === coletaId
        ? {
            ...coleta,
            materiaisColetados: dados.materiais,
            observacoes: dados.observacaoCooperativa,
            status: 'realizada'
          }
        : coleta
    ));
    
    // Mostrar animação de sucesso
    setShowSuccessAnimation(true);
  };

  // Função para editar coleta (atualiza dados no card)
  const handleEditCollection = (coletaId: string, dados: { materiais: any[]; fotos: string[]; observacaoCooperativa: string }) => {
    setColetas(prev => prev.map(coleta =>
      coleta.id === coletaId
        ? {
            ...coleta,
            materiais: dados.materiais.map((mat: any) =>
              typeof mat === 'string'
                ? { type: mat, quantity: '', unit: '', fotos: [] }
                : {
                    ...mat,
                    fotos: mat.fotos || []
                  }
            ),
            observacaoCooperativa: dados.observacaoCooperativa
          }
        : coleta
    ));
  };

  // Função para cancelar coleta (status para cancelada)
  const handleCancelCollection = (coletaId: string, motivo: string) => {
    setColetas(prev => prev.map(coleta =>
      coleta.id === coletaId
        ? {
            ...coleta,
            status: 'cancelada',
            cancellationReason: motivo
          }
        : coleta
    ));
  };

  return (
    <div className="container mx-auto p-4">
      <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4">
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </Button>
      <h1 className="text-2xl font-bold mb-2">Minhas Coletas</h1>
      <p className="text-muted-foreground mb-4">Gerencie suas coletas e acompanhe seus agendamentos</p>
      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
        <Input
          placeholder="Buscar por nome, endereço, bairro..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Tabs value={statusTab} onValueChange={v => setStatusTab(v as 'pendente' | 'confirmada')} className="ml-0 md:ml-4">
          <TabsList>
            <TabsTrigger value="pendente">Pendentes</TabsTrigger>
            <TabsTrigger value="confirmada">Agendadas</TabsTrigger>
          </TabsList>
        </Tabs>
        {/* Seletor de data pode ser mantido aqui, se já existir */}
              </div>
      {/* Listagem das coletas filtradas */}
      {loading ? (
        <div className="text-center text-muted-foreground py-8">Carregando coletas...</div>
      ) : error ? (
        <div className="text-center text-red-600 py-8">{error}</div>
      ) : coletas.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">Nenhuma coleta encontrada para este período.</div>
      ) : (
        filteredColetas.map(coleta => (
          <StandardCollectionHistoryCard
            key={coleta.id}
            id={coleta.id}
            status={
              coleta.status === 'pendente' ? 'pending' :
              coleta.status === 'confirmada' ? 'scheduled' :
              coleta.status === 'realizada' ? 'collected' :
              coleta.status === 'cancelada' ? 'cancelled' :
              'pending'
            }
            tipoColeta="simples"
            data={coleta.data}
            hora={coleta.horario}
            endereco={`${coleta.solicitante.endereco.rua}, ${coleta.solicitante.endereco.numero}`}
            bairro={coleta.solicitante.endereco.bairro}
            cidade={''}
            estado={''}
            solicitante={{
              nome: coleta.solicitante.nome,
              foto: coleta.solicitante.foto,
              avaliacaoMedia: coleta.solicitante.avaliacaoMedia,
              totalColetas: coleta.solicitante.totalColetas
            }}
            materiais={coleta.materiais?.map(m =>
              (typeof m === 'string' ? { type: m, quantity: '', unit: '', fotos: [] } : {
                type: (m as any).type || (m as any).tipo || '',
                quantity: (m as any).quantity || (m as any).quantidade || '',
                unit: (m as any).unit || (m as any).unidade || '',
                fotos: (m as any).fotos || []
              })
            ) || []}
            observacoes={coleta.observacoes}
            observacaoCooperativa={coleta.observacaoCooperativa}
            cancellationReason={coleta.status === 'cancelada' ? 'Cancelada pelo coletor' : undefined}
            avaliacaoSolicitante={coleta.avaliacao ? {
              estrelas: coleta.avaliacao.estrelas,
              comentario: coleta.avaliacao.comentario,
              avaliadoPor: 'Coletor'
            } : undefined}
            userType="individual_collector"
            onRegister={() => handleRegisterCollection(coleta.id, {
              materiais: coleta.materiaisColetados || [],
              fotos: [],
              observacaoCooperativa: coleta.observacoes || ''
            })}
            onEdit={dados => handleEditCollection(coleta.id, dados)}
            onCancel={motivo => handleCancelCollection(coleta.id, motivo)}
            onConfirm={() => handleConfirmarColeta(coleta)}
          />
        ))
      )}

      {/* Modal de Visualização da Foto */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              Foto do Solicitante
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSelectedPhoto(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <img 
              src={selectedPhoto || ''} 
              alt="Foto do solicitante" 
              className="max-h-[70vh] object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Finalização da Coleta */}
      <Dialog open={showFinalizarModal} onOpenChange={setShowFinalizarModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Finalizar Coleta</DialogTitle>
            <DialogDescription>
              Confirme os materiais coletados e adicione observações
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Materiais Coletados */}
            <div className="space-y-4">
              <h4 className="font-medium">Materiais Coletados</h4>
              {materiaisColetados.map((material, index) => {
                const isOpen = materialExpandido === index;
                return (
                  <div key={index} className="bg-white border rounded-lg shadow-sm mb-2">
                    <div
                      className="flex items-center justify-between p-3 cursor-pointer"
                      onClick={() => setMaterialExpandido(isOpen ? null : index)}
                    >
                      <div className="flex-1 flex items-center gap-2 text-sm font-medium">
                        {(() => {
                          const displayInfo = materialDisplayData[material.tipo as keyof typeof materialDisplayData] || materialDisplayData.outros;
                          return (
                            <>
                              <displayInfo.icone className={`h-4 w-4 ${displayInfo.cor}`} />
                              <span>{displayInfo.nome}</span>
                            </>
                          );
                        })()}
                        {material.quantidade && material.unidade ? ` - ${material.quantidade} ${material.unidade}` : ''}
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={e => { e.stopPropagation(); handleRemoveMaterial(index); }}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    {isOpen && (
                      <div className="p-3 pt-0 flex flex-col gap-2 animate-fade-in">
                        <div>
                          <Label className="text-xs">Material</Label>
                          {selectedColeta?.materiais.includes(material.tipo) ? (
                            <Input
                              value={material.tipo}
                              disabled
                              className="bg-muted text-sm py-1 px-2 h-8"
                            />
                          ) : (
                            <Select
                              value={material.tipo}
                              onValueChange={value => handleMaterialChange(index, 'tipo', value)}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Selecione o material" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(materialDisplayData).map((mat) => (
                                  <SelectItem key={mat.nome} value={mat.nome}>{mat.nome}</SelectItem>
                                ))}
                                <SelectItem value="Outro">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Label className="text-xs">Quantidade</Label>
                            <Input
                              type="number"
                              value={material.quantidade}
                              onChange={(e) => handleMaterialChange(index, 'quantidade', e.target.value)}
                              placeholder="Quantidade"
                              className="text-sm py-1 px-2 h-8"
                            />
                          </div>
                          <div className="w-28">
                            <Label className="text-xs">Unidade</Label>
                            <Select
                              value={material.unidade}
                              onValueChange={(value) => handleMaterialChange(index, 'unidade', value)}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Unidade" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="kg">Kg</SelectItem>
                                <SelectItem value="un">Un</SelectItem>
                                <SelectItem value="sacos">Sacos</SelectItem>
                                <SelectItem value="litros">Litros</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <Button
                variant="outline"
                onClick={handleAddMaterialExtra}
                className="w-full mt-2"
              >
                + Adicionar Material
              </Button>
            </div>

            {/* Fotos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Fotos</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('foto-input')?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Adicionar Foto
                  </Button>
                  <input
                    id="foto-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFotoChange}
                    className="hidden"
                  />
                </div>
              </div>
              {fotosColeta.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {fotosColeta.map((foto, index) => (
                    <div key={index} className="relative">
                      <img
                        src={foto}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 bg-opacity-80 bg-red-600"
                        style={{ backgroundColor: 'rgba(220,38,38,0.85)' }}
                        onClick={() => handleRemoveFoto(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Observação do Solicitante */}
            {observacaoSolicitante && (
              <div className="space-y-2">
                <Label>Observação do Solicitante</Label>
                <div className="bg-muted p-2 rounded text-muted-foreground text-sm">
                  {observacaoSolicitante}
                </div>
              </div>
            )}

            {/* Observações do Coletor */}
            <div className="space-y-2">
              <Label>Observações do Coletor</Label>
              <Textarea
                value={observacoesColetor}
                onChange={(e) => setObservacoesColetor(e.target.value)}
                placeholder="Adicione observações sobre a coleta..."
                className="min-h-[100px]"
              />
            </div>

            <div className="flex justify-end gap-2 pb-2">
              <Button variant="outline" onClick={() => setShowFinalizarModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleFinalizarColeta}>
                Finalizar Coleta
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal da Câmera */}
      <Dialog open={showCamera} onOpenChange={setShowCamera}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tirar Foto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCamera(false)}>
                Cancelar
              </Button>
              <Button onClick={takePhoto}>
                <Camera className="mr-2 h-4 w-4" />
                Capturar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CancelDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleConfirmCancel}
        coletaId={coletaToCancel || ''}
      />

      {/* Animação de Confirmação */}
      {showConfirmAnimation && (
        <AchievementAnimation
          title="Coleta Confirmada!"
          description="A coleta foi confirmada com sucesso. Você pode iniciar a coleta quando chegar ao local."
          icon={<Package className="w-16 h-16 text-green-600" />}
          soundType="scheduleConfirmed"
          onComplete={handleColetaAceitaComplete}
        />
      )}

      {/* Animação de Coleta Aceita */}
      {showColetaAceita && (
        <AchievementAnimation
          title="Coleta Aceita!"
          description="A coleta foi aceita com sucesso. Você pode iniciar a coleta quando chegar ao local."
          icon={<CheckCircle2 className="w-16 h-16 text-green-600" />}
          soundType="scheduleConfirmed"
          onComplete={handleColetaAceitaComplete}
        />
      )}

      {/* Animação de Avaliação */}
      {showSolicitanteRatingAnimation && (
        <AchievementSolicitanteRating onComplete={() => setShowSolicitanteRatingAnimation(false)} />
      )}

      {/* Animação de Sucesso do Registro */}
      {showSuccessAnimation && (
        <AchievementAnimation
          title="Coleta Registrada!"
          description="A coleta foi registrada com sucesso."
          icon={<Package className="w-16 h-16 text-green-600" />}
          soundType="achievement"
          onComplete={() => setShowSuccessAnimation(false)}
        />
      )}

      {/* Modal de Registro de Coleta */}
      <StandardRegisterCollectionModal
        open={showRegisterModal.open}
        onOpenChange={(open) => setShowRegisterModal({ open, coleta: open ? showRegisterModal.coleta : null })}
        coleta={showRegisterModal.coleta ? {
          materiais: showRegisterModal.coleta.materiaisColetados && showRegisterModal.coleta.materiaisColetados.length > 0
            ? showRegisterModal.coleta.materiaisColetados.map(mat => ({ type: getMaterialIdentificador(mat.tipo), quantity: mat.quantidade, unit: mat.unidade }))
            : showRegisterModal.coleta.materiais.map(mat => ({ type: getMaterialIdentificador(mat), quantity: '', unit: 'kg' })),
          fotos: showRegisterModal.coleta.materiaisColetados && showRegisterModal.coleta.materiaisColetados.length > 0
            ? showRegisterModal.coleta.materiaisColetados.flatMap(mat => mat.fotos || [])
            : [],
          observacoes: showRegisterModal.coleta.observacoes || '',
          observacaoCooperativa: showRegisterModal.coleta.observacaoCooperativa || ''
        } : { materiais: [], fotos: [], observacoes: '', observacaoCooperativa: '' }}
        onSave={(dados) => {
          if (showRegisterModal.coleta) {
            setIsLoading(showRegisterModal.coleta.id);
            handleRegisterCollection(showRegisterModal.coleta.id, {
              materiais: dados.materiais,
              fotos: dados.fotos,
              observacaoCooperativa: dados.observacoes
            });
            setShowRegisterModal({ open: false, coleta: null });
            setIsLoading('');
          }
        }}
      />

      {showNotificationStatus && notificationData && (
        <div className="mb-6">
          <NeighborhoodNotificationStatus
            isLoading={isAccepting}
            error={acceptanceError}
            notificationsSent={notificationData.notificationsSent}
            neighborhoodName={notificationData.neighborhoodName}
            date={notificationData.date}
            period={notificationData.period}
          />
        </div>
      )}
      {/* Rodapé */}
      <AppFooter />
    </div>
  );
}; 