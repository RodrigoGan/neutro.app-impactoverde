import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { FileText, Printer, ArrowLeft, CheckCircle, X, ChevronUp, ChevronDown, MessageSquare, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import { Separator } from '@/components/ui/separator';
import StandardMaterialList from '@/components/collection/StandardMaterialList';
import StandardPhotoGallery from '@/components/collection/StandardPhotoGallery';
import { materialDisplayData } from '@/config/materialDisplayData';
import { AchievementAnimation } from '@/components/animations/AchievementAnimation';
import AppFooter from '@/components/AppFooter';

const statusBadge = {
  'Pendente': 'bg-yellow-100 text-yellow-700',
};

const CompanyRequests: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const companyId = authUser?.entity?.id || 'f1b5c6d7-8d9e-0123-4ef0-567890123456';
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [showColetaAceita, setShowColetaAceita] = useState(false);

  // Buscar solicitações reais do banco
  React.useEffect(() => {
    async function fetchRequests() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('collections')
          .select('*')
          .eq('collector_id', companyId)
          .eq('status', 'Pendente')
          .order('date', { ascending: false });
        // Só lança erro se não for apenas ausência de dados
        if (error && !data) throw error;
        setRequests(data || []);
      } catch (err: any) {
        console.log('ERRO SUPABASE:', err);
        // Trata qualquer erro 404 (Supabase REST) como vazio
        const is404 = err?.status === 404 || (typeof err?.message === 'string' && err.message.includes('404'));
        if (is404) {
          setRequests([]);
          setError(null);
        } else {
          setError('Erro ao buscar solicitações.');
          setRequests([]);
        }
      } finally {
        setLoading(false);
      }
    }
    if (companyId) fetchRequests();
  }, [companyId]);

  const handlePrint = (request) => {
    if (!request) return;
    const getMaterialIdentificador = (nome) => {
      for (const [identificador, material] of Object.entries(materialDisplayData)) {
        if (
          material.nome.toLowerCase() === nome.toLowerCase() ||
          identificador.toLowerCase() === nome.toLowerCase()
        ) {
          return identificador;
        }
      }
      return 'outros';
    };
    const printContent = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <img src='/logo-neutro.png' alt='Neutro Impacto Logo' style='height: 40px;' />
          <span style='font-size: 22px; font-weight: bold; color: #1e293b;'>Neutro Impacto Verde</span>
        </div>
        <h2 style='font-size: 20px; margin-bottom: 12px; color: #16a34a;'>Solicitação de Coleta</h2>
        <hr style='margin-bottom: 16px; border: none; border-top: 2px solid #e5e7eb;' />
        <div style='margin-bottom: 8px;'><b>Cliente:</b> ${request.company}</div>
        <div style='margin-bottom: 8px;'><b>Status:</b> ${request.status}</div>
        <div style='margin-bottom: 8px;'><b>Data:</b> ${new Date(request.date).toLocaleDateString()}</div>
        <div style='margin-bottom: 8px;'><b>Materiais:</b></div>
        ${request.materiais.map(material => {
          const identificador = getMaterialIdentificador(material.type);
          const nomePadrao = materialDisplayData[identificador]?.nome || material.type;
          return `<div style='margin-left: 16px; margin-bottom: 4px;'>• ${nomePadrao}: ${material.quantity}${material.unit}</div>`;
        }).join('')}
        <div style='margin-bottom: 8px;'><b>Prioridade:</b> ${request.priority}</div>
        <div style='margin-bottom: 8px;'><b>Endereço:</b> ${request.address}</div>
        <hr style='margin: 24px 0 12px 0; border: none; border-top: 1px dashed #a3a3a3;' />
        <div style='font-size: 13px; color: #64748b;'>Documento gerado em ${new Date().toLocaleString()}</div>
        <div style='font-size: 11px; color: #ef4444; margin-top: 8px; font-style: italic;'>⚠️ Considere o impacto ambiental antes de imprimir este documento</div>
      </div>
    `;
    const printWindow = window.open('', '', 'width=600,height=700');
    if (printWindow) {
      printWindow.document.write(`<!DOCTYPE html><html><head><title>Imprimir Solicitação</title></head><body>${printContent}</body></html>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleReject = () => {
    if (!selectedRequest || !rejectReason.trim()) return;
    setRequests(prevRequests =>
      prevRequests.filter(request => request.id !== selectedRequest.id)
    );
    toast.success('Solicitação recusada com sucesso!');
    setShowRejectDialog(false);
    setSelectedRequest(null);
    setRejectReason('');
  };

  const handleAccept = () => {
    if (!selectedRequest) return;
    setRequests(prevRequests =>
      prevRequests.filter(request => request.id !== selectedRequest.id)
    );
    // Aqui você pode adicionar a lógica para criar uma nova coleta (mock)
    setShowAcceptDialog(false);
    setSelectedRequest(null);
    
    // Mostrar animação de sucesso
    setShowColetaAceita(true);
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
          <h1 className="text-2xl font-bold">Solicitações de Coleta</h1>
        </div>
        <div className="space-y-4">
          {loading && <Card><CardContent className="py-8 text-center text-muted-foreground">Carregando solicitações...</CardContent></Card>}
          {error && <Card><CardContent className="py-8 text-center text-red-500">{error}</CardContent></Card>}
          {!loading && !error && requests.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma solicitação pendente.
              </CardContent>
            </Card>
          )}
          {!loading && !error && requests.length > 0 && requests.map(request => (
            <Card key={request.id}>
              <CardHeader
                className="cursor-pointer"
                onClick={() => setExpandedCardId(expandedCardId === request.id ? null : request.id)}
              >
                <CardTitle className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={request.avatar} />
                    <AvatarFallback>{request.company.slice(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-base">{request.company}</span>
                      <Badge className={statusBadge[request.status] || ''}>{request.status}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground flex flex-col gap-0.5">
                      <span><b>Endereço:</b> {request.address}</span>
                      <span><b>Data:</b> {new Date(request.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    className="ml-2"
                    onClick={e => { e.stopPropagation(); setExpandedCardId(expandedCardId === request.id ? null : request.id); }}
                    aria-label={expandedCardId === request.id ? 'Recolher' : 'Expandir'}
                  >
                    {expandedCardId === request.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                </CardTitle>
              </CardHeader>
              {expandedCardId === request.id && (
                <div className="px-4 pb-4 border-t bg-muted/50 animate-fade-in">
                  <Separator className="mb-4" />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Cliente</h4>
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={request.avatar} />
                          <AvatarFallback>{request.company.slice(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p>{request.company}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Badge className={statusBadge[request.status] || ''}>{request.status}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Prioridade</h4>
                      <span>{request.priority}</span>
                    </div>
                    <div className="col-span-2">
                      <h4 className="font-medium mb-2">Materiais</h4>
                      <StandardMaterialList materiais={request.materiais} />
                    </div>
                    <div className="col-span-2">
                      <h4 className="font-medium mb-2">Fotos dos Materiais</h4>
                      <StandardPhotoGallery fotos={request.fotos || []} />
                    </div>
                    <div className="col-span-2">
                      <h4 className="font-medium mb-2">Observações</h4>
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MessageSquare className="h-4 w-4 mt-0.5" />
                        <p className="whitespace-pre-line">{request.observacoes}</p>
                      </div>
                    </div>
                    <div className="col-span-2 flex flex-col sm:flex-row items-stretch gap-4 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowAcceptDialog(true);
                        }}
                        className="flex items-center gap-2 text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Aceitar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowRejectDialog(true);
                        }}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                        Recusar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
      {/* Modal de Recusa */}
      <AlertDialog 
        open={showRejectDialog} 
        onOpenChange={(open) => {
          setShowRejectDialog(open);
          if (!open) {
            setSelectedRequest(null);
            setRejectReason('');
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Recusar Solicitação</AlertDialogTitle>
            <AlertDialogDescription>
              Por favor, informe o motivo da recusa para que o solicitante seja notificado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="rejectReason" className="mb-2 block">
              Motivo da Recusa
            </Label>
            <Textarea
              id="rejectReason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Digite o motivo da recusa..."
              className="min-h-[100px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReject}
              disabled={!rejectReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirmar Recusa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Modal de Aceite */}
      <AlertDialog 
        open={showAcceptDialog} 
        onOpenChange={(open) => {
          setShowAcceptDialog(open);
          if (!open) {
            setSelectedRequest(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aceitar Solicitação</AlertDialogTitle>
            <AlertDialogDescription>
              Ao aceitar esta solicitação, ela será convertida em uma coleta agendada.
              Você poderá definir o motorista e outros detalhes na página de Coletas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAccept}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirmar Aceite
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Animação de Coleta Aceita */}
      {showColetaAceita && (
        <AchievementAnimation
          title="Solicitação Aceita!"
          description="A solicitação foi aceita com sucesso e convertida em coleta."
          icon={<CheckCircle2 className="w-16 h-16 text-green-600" />}
          soundType="scheduleConfirmed"
          onComplete={() => setShowColetaAceita(false)}
        />
      )}
      {/* Rodapé padrão com espaçamento */}
      <div className="mt-8">
        <AppFooter />
      </div>
    </div>
  );
};

export default CompanyRequests; 