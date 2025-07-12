import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, FileText, Printer, ArrowLeft, PlayCircle, Edit, CheckCircle, X, ChevronDown, ChevronUp, MessageSquare, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Logo from '@/components/Logo';
import { toast } from 'sonner';
import { materialDisplayData } from '@/config/materialDisplayData';
import StandardMaterialList from '@/components/collection/StandardMaterialList';
import { Separator } from '@/components/ui/separator';
import StandardPhotoGallery from '@/components/collection/StandardPhotoGallery';

// Importar o StandardEditCollectionModal
import StandardEditCollectionModal from '@/components/collection/StandardEditCollectionModal';

// Importar o StandardRegisterCollectionModal
import StandardRegisterCollectionModal from '@/components/collection/StandardRegisterCollectionModal';

// Importar o AchievementAnimation
import { AchievementAnimation } from '@/components/animations/AchievementAnimation';

const STATUS_OPTIONS = ['Todas', 'Agendada', 'Em Andamento'];

const statusBadge = {
  'Agendada': 'bg-blue-100 text-blue-700',
  'Em Andamento': 'bg-yellow-100 text-yellow-700',
  'Concluída': 'bg-green-100 text-green-700',
  'Cancelada': 'bg-red-100 text-red-700',
};

// Mock de dados para as coletas da cooperativa
const mockCollections = [
  {
    id: '1',
    client: 'Condomínio Verde',
    avatar: '/avatars/condominio2.jpg',
    status: 'Agendada',
    quantity: '600kg',
    material: 'Plástico e Papelão',
    date: '2024-07-15',
    time: '09:00',
    address: 'Rua das Palmeiras, 150 - Jardim América, São Paulo/SP',
    driver: 'Roberto Santos',
    cancelReason: '',
    fotos: [],
    observacoes: '',
    materiais: [
      { type: 'plastico', quantity: 600, unit: 'kg' },
      { type: 'papel', quantity: 0, unit: 'kg' },
    ],
  },
  {
    id: '2',
    client: 'Escola Municipal',
    avatar: '/avatars/escola1.jpg',
    status: 'Em Andamento',
    quantity: '450kg',
    material: 'Papel e Plástico',
    date: '2024-07-15',
    time: '11:00',
    address: 'Avenida Educação, 500 - Centro, São Paulo/SP',
    driver: 'Maria Oliveira',
    cancelReason: '',
    fotos: [],
    observacoes: '',
    materiais: [
      { type: 'papel', quantity: 450, unit: 'kg' },
      { type: 'plastico', quantity: 0, unit: 'kg' },
    ],
  },
  {
    id: '3',
    client: 'Restaurante Sabor Natural',
    avatar: '/avatars/restaurante1.jpg',
    status: 'Concluída',
    quantity: '300kg',
    material: 'Óleo e Orgânico',
    date: '2024-07-14',
    time: '14:00',
    address: 'Rua Gastronomia, 200 - Vila Nova, São Paulo/SP',
    driver: 'Roberto Santos',
    cancelReason: '',
    fotos: [],
    observacoes: '',
    materiais: [
      { type: 'oleo', quantity: 200, unit: 'L' },
      { type: 'organico', quantity: 100, unit: 'kg' },
    ],
  },
  {
    id: '4',
    client: 'Mercado Local',
    avatar: '/avatars/mercado1.jpg',
    status: 'Agendada',
    quantity: '800kg',
    material: 'Papelão e Plástico',
    date: '2024-07-16',
    time: '08:00',
    address: 'Rua Comercial, 300 - Centro, São Paulo/SP',
    driver: 'Maria Oliveira',
    cancelReason: '',
    fotos: [],
    observacoes: '',
    materiais: [
      { type: 'papel', quantity: 500, unit: 'kg' },
      { type: 'plastico', quantity: 300, unit: 'kg' },
    ],
  },
  {
    id: '5',
    client: 'Padaria Artesanal',
    avatar: '/avatars/padaria1.jpg',
    status: 'Concluída',
    quantity: '200kg',
    material: 'Orgânico',
    date: '2024-07-13',
    time: '10:30',
    address: 'Rua dos Pães, 100 - Vila Nova, São Paulo/SP',
    driver: 'Roberto Santos',
    cancelReason: '',
    fotos: [],
    observacoes: '',
    materiais: [
      { type: 'organico', quantity: 200, unit: 'kg' },
    ],
  },
  {
    id: '6',
    client: 'Loja Sustentável',
    avatar: '/avatars/loja1.jpg',
    status: 'Agendada',
    quantity: '350kg',
    material: 'Vidro',
    date: '2024-07-18',
    time: '15:00',
    address: 'Rua das Lojas, 321 - Centro, São Paulo/SP',
    driver: '',
    cancelReason: '',
    fotos: [],
    observacoes: 'Cliente solicita coleta rápida.',
    observacaoCooperativa: '',
    materiais: [
      { type: 'vidro', quantity: 350, unit: 'kg' },
    ],
  },
];

function getMaterialIdentificador(nome) {
  for (const [identificador, material] of Object.entries(materialDisplayData)) {
    if (
      material.nome.toLowerCase() === nome.toLowerCase() ||
      identificador.toLowerCase() === nome.toLowerCase()
    ) {
      return identificador;
    }
  }
  return 'outros';
}

// Função utilitária para normalizar materiais
function normalizeMateriais(materiais) {
  return materiais.map(mat => {
    let identificador = getMaterialIdentificador(mat.type);
    return { ...mat, type: identificador };
  });
}

const CooperativeCollections: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('Todas');
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [collections, setCollections] = useState(mockCollections);
  const [cancelReason, setCancelReason] = useState('');
  const [driverSearch, setDriverSearch] = useState('');
  const [showDriverSuggestions, setShowDriverSuggestions] = useState(false);
  const driverInputRef = useRef(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [driverSelectCollection, setDriverSelectCollection] = useState<any>(null);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState({ open: false, coleta: null });
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const filteredCollections = statusFilter === 'Todas'
    ? collections.filter(c => c.status === 'Agendada' || c.status === 'Em Andamento')
    : collections.filter(c => c.status === statusFilter && (c.status === 'Agendada' || c.status === 'Em Andamento'));

  // Extrair nomes únicos dos coletores
  const driverOptions = Array.from(new Set(mockCollections.map(c => c.driver)));

  const handlePrint = () => {
    if (!selectedCollection) return;
    const printContent = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <img src='/logo-neutro.png' alt='Neutro Impacto Logo' style='height: 40px;' />
          <span style='font-size: 22px; font-weight: bold; color: #1e293b;'>Neutro Impacto Verde</span>
        </div>
        <h2 style='font-size: 20px; margin-bottom: 12px; color: #16a34a;'>Ficha de Coleta</h2>
        <hr style='margin-bottom: 16px; border: none; border-top: 2px solid #e5e7eb;' />
        <div style='margin-bottom: 8px;'><b>Cliente:</b> ${selectedCollection.client}</div>
        <div style='margin-bottom: 8px;'><b>Status:</b> ${selectedCollection.status}</div>
        <div style='margin-bottom: 8px;'><b>Data:</b> ${new Date(selectedCollection.date).toLocaleDateString()}</div>
        <div style='margin-bottom: 8px;'><b>Horário:</b> ${selectedCollection.time}</div>
        <div style='margin-bottom: 8px;'><b>Materiais:</b></div>
        ${selectedCollection.materiais.map(material => {
          const identificador = getMaterialIdentificador(material.type);
          const nomePadrao = materialDisplayData[identificador]?.nome || material.type;
          return `<div style='margin-left: 16px; margin-bottom: 4px;'>• ${nomePadrao}: ${material.quantity}${material.unit}</div>`;
        }).join('')}
        <div style='margin-bottom: 8px;'><b>Coletor:</b> ${selectedCollection.driver}</div>
        <div style='margin-bottom: 8px;'><b>Endereço:</b> ${selectedCollection.address}</div>
        <hr style='margin: 24px 0 12px 0; border: none; border-top: 1px dashed #a3a3a3;' />
        <div style='font-size: 13px; color: #64748b;'>Imprima esta ficha e entregue ao coletor responsável pela coleta.</div>
      </div>
    `;
    const printWindow = window.open('', '', 'width=600,height=700');
    if (printWindow) {
      printWindow.document.write(`<!DOCTYPE html><html><head><title>Imprimir Coleta</title></head><body>${printContent}</body></html>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleStatusChange = (collectionId: string, newStatus: string, reason?: string) => {
    setCollections(prevCollections =>
      prevCollections.map(collection =>
        collection.id === collectionId
          ? { ...collection, status: newStatus, cancelReason: reason || collection.cancelReason }
          : collection
      )
    );
    toast.success(`Status da coleta atualizado para ${newStatus}`);
    setSelectedCollection(null);
  };

  const handleCancel = () => {
    if (!selectedCollection || !cancelReason.trim()) return;
    handleStatusChange(selectedCollection.id, 'Cancelada', cancelReason);
    setShowCancelDialog(false);
    setSelectedCollection(null);
    setCancelReason('');
  };

  const handleEdit = (collection: any) => {
    const coletaParaModal = {
      ...collection,
      materiais: (collection.materiais && collection.materiais.length > 0)
        ? collection.materiais
        : (Array.isArray(collection.material)
            ? collection.material.map((mat: string) => ({ type: mat, quantity: '', unit: 'kg' }))
            : collection.material
              ? [{ type: collection.material, quantity: '', unit: 'kg' }]
              : []
          ),
      fotos: collection.fotos || [],
      observacoes: collection.observacoes || '', // do solicitante
      observacaoCooperativa: collection.observacaoCooperativa || '', // da cooperativa
    };
    setSelectedCollection(coletaParaModal);
    setShowEditDialog(true);
  };

  const handleSaveEdit = (editedData: { materiais: any[]; fotos?: string[]; observacaoCooperativa: string }) => {
    if (!selectedCollection) return;
    setCollections(prevCollections =>
      prevCollections.map(collection =>
        collection.id === selectedCollection.id
          ? {
              ...collection,
              materiais: editedData.materiais,
              fotos: editedData.fotos || collection.fotos,
              observacaoCooperativa: editedData.observacaoCooperativa,
              date: selectedCollection.date,
              time: selectedCollection.time,
              driver: selectedCollection.driver,
              quantity: selectedCollection.quantity,
              material: selectedCollection.material,
            }
          : collection
      )
    );
    toast.success('Coleta atualizada com sucesso!');
    handleCloseEditModal();
  };

  // Funções para fechar modais
  const handleCloseDetailsModal = () => {
    setSelectedCollection(null);
  };

  const handleCloseEditModal = () => {
    setShowEditDialog(false);
    setSelectedCollection(null);
  };

  const getAvailableActions = (collection: any) => {
    const actions = [];

    if (collection.status === 'Agendada') {
      actions.push(
        <Button
          key="start"
          variant="outline"
          size="sm"
          onClick={() => handleStatusChange(collection.id, 'Em Andamento')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <PlayCircle className="h-4 w-4" />
          Iniciar Coleta
        </Button>
      );
    }

    if (collection.status === 'Em Andamento') {
      actions.push(
        <Button
          key="complete"
          variant="outline"
          size="sm"
          onClick={() => setShowRegisterModal({ open: true, coleta: collection })}
          className="flex items-center gap-2 text-green-600 hover:text-green-700"
        >
          <CheckCircle className="h-4 w-4" />
          Concluir Coleta
        </Button>
      );
    }

    if (['Agendada', 'Em Andamento'].includes(collection.status)) {
      actions.push(
        <Button
          key="edit"
          variant="outline"
          size="sm"
          onClick={() => handleEdit(collection)}
          className="flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          Editar
        </Button>
      );
    }

    if (['Agendada', 'Em Andamento'].includes(collection.status)) {
      actions.push(
        <Button
          key="cancel"
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedCollection(collection);
            setShowCancelDialog(true);
          }}
          className="flex items-center gap-2 text-red-600 hover:text-red-700"
        >
          <X className="h-4 w-4" />
          Cancelar
        </Button>
      );
    }

    return actions.length > 0 ? (
      <div className="flex gap-2">
        {actions}
      </div>
    ) : null;
  };

  const openDriverModal = (collection: any) => {
    setDriverSelectCollection(collection);
    setSelectedDriver('');
    setShowDriverModal(true);
  };

  const handleSaveDriver = () => {
    if (!driverSelectCollection || !selectedDriver) return;
    setCollections(prev => prev.map(c => c.id === driverSelectCollection.id ? { ...c, driver: selectedDriver } : c));
    setShowDriverModal(false);
    setDriverSelectCollection(null);
    setSelectedDriver('');
    toast.success('Motorista definido com sucesso!');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-2 py-1 text-base hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Coletas da Cooperativa</h1>
        </div>

        <div className="flex gap-2 mb-6">
          {STATUS_OPTIONS.map(option => (
            <Button
              key={option}
              variant={statusFilter === option ? 'default' : 'outline'}
              onClick={() => setStatusFilter(option)}
              className="text-sm"
            >
              {option}
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredCollections.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma coleta encontrada.
              </CardContent>
            </Card>
          )}
          {filteredCollections.map(collection => {
            const isAgendadaSemMotorista = collection.status === 'Agendada' && (!collection.driver || collection.driver.trim() === '');
            return (
              <Card key={collection.id} className={isAgendadaSemMotorista ? 'bg-yellow-50 border-yellow-300' : ''}>
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => setExpandedCardId(expandedCardId === collection.id ? null : collection.id)}
                >
                  <CardTitle className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={collection.avatar} />
                      <AvatarFallback>{collection.client.slice(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-base">{collection.client}</span>
                        <Badge className={statusBadge[collection.status] || ''}>{collection.status}</Badge>
                        {isAgendadaSemMotorista && (
                          <Badge className="bg-red-100 text-red-700 border border-red-300 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4 mr-1" /> Motorista pendente
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground flex flex-col gap-0.5">
                        <span><b>Endereço:</b> {collection.address}</span>
                        <span><b>Data:</b> {new Date(collection.date).toLocaleDateString()} <b>Horário:</b> {collection.time}</span>
                      </div>
                    </div>
                    <button
                      className="ml-2"
                      onClick={e => { e.stopPropagation(); setExpandedCardId(expandedCardId === collection.id ? null : collection.id); }}
                      aria-label={expandedCardId === collection.id ? 'Recolher' : 'Expandir'}
                    >
                      {expandedCardId === collection.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                  {/* Remover os botões de ação daqui */}
                </CardContent>
                {expandedCardId === collection.id && (
                  <div className="px-4 pb-4 border-t bg-muted/50 animate-fade-in">
                    <Separator className="mb-4" />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Cliente</h4>
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={collection.avatar} />
                            <AvatarFallback>{collection.client.slice(0,2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p>{collection.client}</p>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Badge className={statusBadge[collection.status] || ''}>{collection.status}</Badge>
                              {isAgendadaSemMotorista && (
                                <Badge className="bg-red-100 text-red-700 border border-red-300 flex items-center gap-1">
                                  <AlertCircle className="h-4 w-4 mr-1" /> Motorista pendente
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Motorista</h4>
                        {isAgendadaSemMotorista ? (
                          <div className="flex items-center gap-2">
                            <span className="text-red-700 font-semibold">Pendente</span>
                            <Button size="sm" variant="outline" className="text-red-700 border-red-300 hover:bg-red-50" onClick={() => openDriverModal(collection)}>
                              Definir Motorista
                            </Button>
                          </div>
                        ) : (
                          <span>{collection.driver}</span>
                        )}
                      </div>
                      <div className="col-span-2">
                        <h4 className="font-medium mb-2">Materiais</h4>
                        <StandardMaterialList materiais={normalizeMateriais(collection.materiais)} />
                      </div>
                      <div className="col-span-2">
                        <h4 className="font-medium mb-2">Fotos dos Materiais</h4>
                        <StandardPhotoGallery fotos={collection.fotos || []} />
                      </div>
                      <div className="col-span-2">
                        <h4 className="font-medium mb-2">Observações do Solicitante</h4>
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MessageSquare className="h-4 w-4 mt-0.5" />
                          <p className="whitespace-pre-line">{collection.observacoes || 'Nenhuma observação.'}</p>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <h4 className="font-medium mb-2">Observações da Cooperativa</h4>
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MessageSquare className="h-4 w-4 mt-0.5" />
                          <p className="whitespace-pre-line">{collection.observacaoCooperativa || 'Nenhuma observação.'}</p>
                        </div>
                      </div>
                      <div className="col-span-2 flex flex-col sm:flex-row items-stretch gap-4 mt-4">
                        {getAvailableActions(collection)}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Modal de Detalhes da Coleta */}
      <Dialog open={selectedCollection !== null && !showEditDialog} onOpenChange={(open) => {
        if (!open) {
          handleCloseDetailsModal();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Coleta</DialogTitle>
            <DialogDescription>
              Veja as informações completas da coleta selecionada.
            </DialogDescription>
          </DialogHeader>
          {selectedCollection && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedCollection.avatar} />
                  <AvatarFallback>{selectedCollection.client.slice(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">{selectedCollection.client}</span>
                    <Badge className={statusBadge[selectedCollection.status] || ''}>{selectedCollection.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{new Date(selectedCollection.date).toLocaleDateString()} {selectedCollection.time}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* Exibir lista de materiais do array materiais */}
                <div className="col-span-2">
                  <span className="block text-xs text-muted-foreground">Materiais</span>
                  <div className="space-y-1 mt-1">
                    {Array.isArray(selectedCollection.materiais) && selectedCollection.materiais.length > 0 ? (
                      normalizeMateriais(selectedCollection.materiais).map((mat, index) => {
                        const identificador = getMaterialIdentificador(mat.type);
                        const nomePadrao = materialDisplayData[identificador]?.nome || mat.type;
                        return (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="font-medium">{nomePadrao}</span>
                            <span>{mat.quantity}{mat.unit}</span>
                          </div>
                        );
                      })
                    ) : (
                      <span className="font-medium text-muted-foreground">Nenhum material registrado</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground">Coletor</span>
                  <span className="font-medium">{selectedCollection.driver}</span>
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground">Status</span>
                  <span className="font-medium">{selectedCollection.status}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-xs text-muted-foreground">Endereço</span>
                  <span className="font-medium">{selectedCollection.address}</span>
                </div>
                {selectedCollection.status === 'Cancelada' && selectedCollection.cancelReason && (
                  <div className="col-span-2">
                    <span className="block text-xs text-muted-foreground">Motivo do Cancelamento</span>
                    <span className="font-medium text-red-600">{selectedCollection.cancelReason}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-row gap-2 justify-end">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="default" onClick={handleCloseDetailsModal}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Cancelamento */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Coleta</AlertDialogTitle>
            <AlertDialogDescription>
              Por favor, informe o motivo do cancelamento para que o cliente seja notificado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="cancelReason" className="mb-2 block">
              Motivo do Cancelamento
            </Label>
            <Textarea
              id="cancelReason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Digite o motivo do cancelamento..."
              className="min-h-[100px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setShowCancelDialog(false); setSelectedCollection(null); }}>Voltar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancel}
              disabled={!cancelReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirmar Cancelamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* StandardEditCollectionModal - Adicionado para funcionalidade de múltiplos materiais */}
      {selectedCollection && (
        <StandardEditCollectionModal
          open={showEditDialog}
          onOpenChange={(open) => {
            if (!open) {
              handleCloseEditModal();
            }
          }}
          coleta={selectedCollection}
          onSave={handleSaveEdit}
        />
      )}

      {/* Modal de seleção de motorista */}
      <Dialog open={showDriverModal} onOpenChange={setShowDriverModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Definir Motorista</DialogTitle>
            <DialogDescription>Selecione o motorista responsável por esta coleta.</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="driverSelect">Motorista</Label>
            <Select value={selectedDriver} onValueChange={setSelectedDriver}>
              <SelectTrigger id="driverSelect" className="mt-1">
                <SelectValue placeholder="Selecione um motorista" />
              </SelectTrigger>
              <SelectContent>
                {driverOptions.filter(d => d && d.trim() !== '').map(driver => (
                  <SelectItem key={driver} value={driver}>{driver}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDriverModal(false)}>Cancelar</Button>
            <Button onClick={handleSaveDriver} disabled={!selectedDriver} className="bg-green-600 text-white hover:bg-green-700">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* StandardRegisterCollectionModal */}
      {showRegisterModal.open && (
        <StandardRegisterCollectionModal
          open={showRegisterModal.open}
          onOpenChange={(open) => setShowRegisterModal({ open, coleta: open ? showRegisterModal.coleta : null })}
          coleta={showRegisterModal.coleta ? {
            materiais: Array.isArray(showRegisterModal.coleta.materiais)
              ? showRegisterModal.coleta.materiais.map(mat => ({
                  type: mat.type,
                  quantity: mat.quantity,
                  unit: mat.unit || 'kg',
                }))
              : [],
            fotos: showRegisterModal.coleta.fotos || [],
            observacoes: showRegisterModal.coleta.observacoes || ''
          } : { materiais: [], fotos: [], observacoes: '' }}
          onSave={(dados) => {
            // Atualizar status da coleta para 'Concluída' e salvar materiais/fotos/observações
            setCollections(prev => prev.map(c => c.id === showRegisterModal.coleta.id ? { ...c, status: 'Concluída', materiais: dados.materiais.map(m => ({ ...m, quantity: Number(m.quantity) })), fotos: dados.fotos, observacoes: dados.observacoes, observacaoCooperativa: c.observacaoCooperativa || '' } : c));
            setShowRegisterModal({ open: false, coleta: null });
            setShowSuccessAnimation(true);
          }}
        />
      )}

      {/* AchievementAnimation */}
      {showSuccessAnimation && (
        <AchievementAnimation
          title="Coleta Concluída!"
          description="A coleta foi registrada com sucesso."
          icon={<CheckCircle className="w-16 h-16 text-green-600" />}
          soundType="money"
          onComplete={() => setShowSuccessAnimation(false)}
        />
      )}
    </div>
  );
};

export default CooperativeCollections; 