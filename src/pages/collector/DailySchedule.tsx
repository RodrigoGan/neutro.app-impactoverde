import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Calendar, Clock, MapPin, Phone, MessageSquare, ChevronDown, Star, CheckCircle2, Camera, Printer, ChevronLeft, Package, Upload, X, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabaseClient';

type StatusColeta = 'pending' | 'confirmed' | 'collected' | 'cancelled';

interface MaterialColeta {
  type: string;
  quantity: string;
  unit: string;
}

interface Collection {
  id: number;
  requesterName: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  time: string;
  materials: MaterialColeta[];
  status: StatusColeta;
  notes?: string;
  rating: number;
  totalCollections: number;
  cancellationReason?: string;
}

const DailySchedule: React.FC = () => {
  const navigate = useNavigate();
  const [expandedColeta, setExpandedColeta] = useState<string | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para o modal de registro de coleta
  const [showRegistroModal, setShowRegistroModal] = useState(false);
  const [tipoColeta, setTipoColeta] = useState<'selecionados' | 'misturados'>('selecionados');
  const [materiaisColetados, setMateriaisColetados] = useState<MaterialColeta[]>([]);
  const [quantidadeMisturada, setQuantidadeMisturada] = useState({ quantity: '', unit: 'sacos' });
  const [fotoMaterial, setFotoMaterial] = useState<string | null>(null);
  const [observacoes, setObservacoes] = useState('');
  
  // Estados para o modal de cancelamento
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const [observacoesCancelamento, setObservacoesCancelamento] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Buscar coletas reais do banco ao carregar a página
  useEffect(() => {
    async function fetchCollections() {
      setLoading(true);
      setError(null);
      try {
        // Substitua pelo id real do coletor logado
        const collectorId = '';
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        if (!collectorId) {
          setCollections([]);
          setLoading(false);
          return;
        }
        const { data, error } = await supabase
          .from('collections')
          .select('*')
          .eq('collector_id', collectorId)
          .eq('date', todayStr);
        if (error) throw error;
        // Mapear para o formato Collection
        const mapped = (data || []).map((item: any) => ({
          id: item.id,
          requesterName: item.solicitante_name || 'Solicitante',
          address: item.address || '',
          neighborhood: item.neighborhood || '',
          city: item.city || '',
          state: item.state || '',
          zipCode: item.zip_code || '',
          phone: item.solicitante_phone || '',
          time: item.time || '',
          materials: item.materials || [],
          status: item.status || 'pending',
          notes: item.observations || '',
          rating: item.rating || 0,
          totalCollections: item.total_collections || 0,
          cancellationReason: item.cancellation_reason || '',
        }));
        setCollections(mapped);
      } catch (err: any) {
        setError('Erro ao carregar coletas do dia.');
        setCollections([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCollections();
  }, []);

  const handleExpandColeta = (id: string) => {
    setExpandedColeta(expandedColeta === id ? null : id);
  };

  const handleVerNoMapa = (collection: Collection) => {
    const enderecoCompleto = `${collection.address}, ${collection.neighborhood}, ${collection.city}, ${collection.state}, ${collection.zipCode}`;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto)}`);
  };

  const handleConfirmarColeta = (collection: Collection) => {
    const updatedCollections = collections.map(c => 
      c.id === collection.id ? { ...c, status: 'confirmed' as StatusColeta } : c
    );
    setCollections(updatedCollections);
    toast.success('Coleta confirmada com sucesso!');
  };

  const handleIniciarColeta = (collection: Collection) => {
    setSelectedCollection(collection);
    setMateriaisColetados(collection.materials);
    setShowRegistroModal(true);
  };

  const handleCancelarColeta = (collection: Collection) => {
    setSelectedCollection(collection);
    setShowCancelModal(true);
  };

  const handleConfirmarCancelamento = () => {
    if (!selectedCollection || !motivoCancelamento) return;

    const updatedCollections = collections.map(c => 
      c.id === selectedCollection.id 
        ? { 
            ...c, 
            status: 'cancelled' as StatusColeta, 
            cancellationReason: motivoCancelamento,
            notes: observacoesCancelamento ? `${c.notes ? c.notes + '\n' : ''}Motivo do cancelamento: ${observacoesCancelamento}` : c.notes
          } 
        : c
    );
    
    setCollections(updatedCollections);
    setShowCancelModal(false);
    setMotivoCancelamento('');
    setObservacoesCancelamento('');
    setSelectedCollection(null);
    toast.success('Coleta cancelada com sucesso!');
  };

  const handleFinalizarColeta = () => {
    if (!selectedCollection) return;

    const updatedCollections = collections.map(c => 
      c.id === selectedCollection.id 
        ? { 
            ...c, 
            status: 'collected' as StatusColeta,
            materials: tipoColeta === 'selecionados' ? materiaisColetados : [{ type: 'Misturado', quantity: quantidadeMisturada.quantity, unit: quantidadeMisturada.unit }],
            notes: observacoes ? `${c.notes ? c.notes + '\n' : ''}Observações da coleta: ${observacoes}` : c.notes
          } 
        : c
    );
    
    setCollections(updatedCollections);
    setShowRegistroModal(false);
    resetRegistroState();
    toast.success('Coleta finalizada com sucesso!');
  };

  const resetRegistroState = () => {
    setTipoColeta('selecionados');
    setMateriaisColetados([]);
    setQuantidadeMisturada({ quantity: '', unit: 'sacos' });
    setFotoMaterial(null);
    setObservacoes('');
    setSelectedCollection(null);
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoMaterial(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getStatusBadge = (status: StatusColeta) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'confirmed':
        return <Badge variant="default">Confirmada</Badge>;
      case 'collected':
        return <Badge variant="default" className="bg-green-600 hover:bg-green-600/90">Realizada</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelada</Badge>;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              const navState = window.history.state?.usr;
              const userId = navState?.userId || 1;
              navigate('/collection-history', { state: { userId } });
            }} className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Histórico
            </Button>
            <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Imprimir Coletas do Dia
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              Agenda do Dia - {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
            </CardTitle>
            <p className="text-muted-foreground">
              Total de {collections.length} coletas agendadas para hoje
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-muted-foreground py-8">Carregando coletas...</div>
            ) : error ? (
              <div className="text-center text-red-600 py-8">{error}</div>
            ) : collections.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">Nenhuma coleta agendada para hoje.</div>
            ) : (
              collections.map((collection, index) => (
                <div key={collection.id}>
                  <div className="flex items-start justify-between p-4 cursor-pointer" onClick={() => handleExpandColeta(collection.id.toString())}>
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{collection.time}</span>
                        {getStatusBadge(collection.status)}
                      </div>
                      <div className="flex items-start gap-4">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="font-medium">{collection.address}</p>
                          <p className="text-sm text-muted-foreground">{collection.neighborhood}, {collection.city} - {collection.state}</p>
                        </div>
                      </div>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", expandedColeta === collection.id.toString() && "transform rotate-180")} />
                  </div>

                  {expandedColeta === collection.id.toString() && (
                    <div className="px-4 pb-4">
                      <Separator className="mb-4" />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Solicitante</h4>
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(collection.requesterName)}&background=random`} />
                              <AvatarFallback>{collection.requesterName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p>{collection.requesterName}</p>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>{collection.rating}</span>
                                <span>•</span>
                                <span>{collection.totalCollections} coletas</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Contato</h4>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{collection.phone}</span>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <h4 className="font-medium mb-2">Materiais</h4>
                          <div className="space-y-2">
                            {collection.materials.map((material, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-muted/50 p-2 rounded">
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                  <span>{material.type}</span>
                                </div>
                                <Badge variant="secondary">
                                  {material.quantity} {material.unit}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                        {collection.notes && (
                          <div className="col-span-2">
                            <h4 className="font-medium mb-2">Observações</h4>
                            <div className="flex items-start gap-2 text-sm text-muted-foreground">
                              <MessageSquare className="h-4 w-4 mt-0.5" />
                              <p className="whitespace-pre-line">{collection.notes}</p>
                            </div>
                          </div>
                        )}
                        {collection.status === 'cancelled' && collection.cancellationReason && (
                          <div className="col-span-2">
                            <h4 className="font-medium mb-2 text-destructive">Motivo do Cancelamento</h4>
                            <div className="flex items-start gap-2 text-sm text-destructive">
                              <AlertCircle className="h-4 w-4 mt-0.5" />
                              <p>{collection.cancellationReason}</p>
                            </div>
                          </div>
                        )}
                        <div className="col-span-2 space-y-4">
                          <div className="flex items-center gap-4">
                            <Button variant="outline" onClick={() => handleVerNoMapa(collection)} className="flex-1">
                              <MapPin className="h-4 w-4 mr-2" />
                              Ver no Mapa
                            </Button>
                            {(collection.status === 'pending' || collection.status === 'confirmed') && (
                              <Button variant="destructive" onClick={() => handleCancelarColeta(collection)} className="flex-1">
                                <X className="h-4 w-4 mr-2" />
                                Cancelar Coleta
                              </Button>
                            )}
                          </div>
                          {collection.status === 'pending' && (
                            <Button variant="default" onClick={() => handleConfirmarColeta(collection)} className="w-full h-[56px]">
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Confirmar Coleta
                            </Button>
                          )}
                          {collection.status === 'confirmed' && (
                            <Button variant="default" onClick={() => handleIniciarColeta(collection)} className="w-full h-[56px]">
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Iniciar Coleta
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {index < collections.length - 1 && <Separator />}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Modal de Cancelamento */}
        <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Cancelar Coleta
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo do Cancelamento<span className="text-destructive">*</span></Label>
                <Select value={motivoCancelamento} onValueChange={setMotivoCancelamento}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solicitante_ausente">Solicitante Ausente</SelectItem>
                    <SelectItem value="local_fechado">Local Fechado</SelectItem>
                    <SelectItem value="material_nao_disponivel">Material Não Disponível</SelectItem>
                    <SelectItem value="endereco_nao_encontrado">Endereço Não Encontrado</SelectItem>
                    <SelectItem value="problema_veiculo">Problema com Veículo</SelectItem>
                    <SelectItem value="clima">Condições Climáticas</SelectItem>
                    <SelectItem value="outro">Outro Motivo</SelectItem>
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
              <Button variant="outline" onClick={() => setShowCancelModal(false)}>
                Voltar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleConfirmarCancelamento}
                disabled={!motivoCancelamento}
              >
                Confirmar Cancelamento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Registro de Coleta */}
        <Dialog open={showRegistroModal} onOpenChange={setShowRegistroModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Registrar Coleta</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Tipo de Coleta</Label>
                <RadioGroup
                  value={tipoColeta}
                  onValueChange={(value) => setTipoColeta(value as 'selecionados' | 'misturados')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="selecionados" id="selecionados" />
                    <Label htmlFor="selecionados">Produtos Selecionados</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="misturados" id="misturados" />
                    <Label htmlFor="misturados">Produtos Misturados</Label>
                  </div>
                </RadioGroup>
              </div>

              {tipoColeta === 'selecionados' ? (
                <div className="space-y-4">
                  {materiaisColetados.map((material, index) => (
                    <div key={index} className="flex gap-4 items-end">
                      <div className="flex-1">
                        <Label>Material</Label>
                        <Input
                          value={material.type}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div className="flex-1">
                        <Label>Quantidade</Label>
                        <Input
                          type="number"
                          value={material.quantity}
                          onChange={(e) => {
                            const newMaterials = [...materiaisColetados];
                            newMaterials[index] = { ...material, quantity: e.target.value };
                            setMateriaisColetados(newMaterials);
                          }}
                          placeholder="Quantidade"
                        />
                      </div>
                      <div className="w-32">
                        <Label>Unidade</Label>
                        <Select
                          value={material.unit}
                          onValueChange={(value) => {
                            const newMaterials = [...materiaisColetados];
                            newMaterials[index] = { ...material, unit: value };
                            setMateriaisColetados(newMaterials);
                          }}
                        >
                          <SelectTrigger>
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
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label>Quantidade Total</Label>
                      <Input
                        type="number"
                        value={quantidadeMisturada.quantity}
                        onChange={(e) => setQuantidadeMisturada({
                          ...quantidadeMisturada,
                          quantity: e.target.value
                        })}
                        placeholder="Quantidade"
                      />
                    </div>
                    <div className="w-32">
                      <Label>Unidade</Label>
                      <Select
                        value={quantidadeMisturada.unit}
                        onValueChange={(value) => setQuantidadeMisturada({
                          ...quantidadeMisturada,
                          unit: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Unidade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sacos">Sacos</SelectItem>
                          <SelectItem value="kg">Kg</SelectItem>
                          <SelectItem value="litros">Litros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Foto do Material</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('foto-input')?.click()}
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
                <input
                  id="foto-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  className="hidden"
                />
                {fotoMaterial && (
                  <div className="relative mt-2">
                    <img
                      src={fotoMaterial}
                      alt="Material coletado"
                      className="max-h-32 rounded-md"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => setFotoMaterial(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Adicione observações sobre a coleta..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowRegistroModal(false);
                resetRegistroState();
              }}>
                Cancelar
              </Button>
              <Button 
                onClick={handleFinalizarColeta}
                disabled={
                  tipoColeta === 'selecionados' 
                    ? materiaisColetados.some(m => !m.quantity) 
                    : !quantidadeMisturada.quantity
                }
              >
                Finalizar Coleta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default DailySchedule; 