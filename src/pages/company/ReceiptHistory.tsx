import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Search, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Printer } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { handlePrintSpecificReceiptTransaction } from './BuyRecyclables';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { materialDisplayData } from '@/config/materialDisplayData';

// Nova interface unificada para transações
interface TransactionParty {
  id: string;
  name: string;
  type: 'company' | 'cooperative' | 'individual_collector';
  isLinked?: boolean;
  linkedEntityId?: string;
}

interface MaterialEntry {
  id: number;
  type: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  subtotal: number;
}

type TransactionStatus =
  | 'pending_acceptance'
  | 'accepted'
  | 'rejected'
  | 'disputed'
  | 'forced_accepted'
  | 'cancelled'
  | 'completed';

interface Transaction {
  id: string;
  createdAt: string;
  updatedAt: string;
  initiator: TransactionParty;
  receiver: TransactionParty;
  materials: MaterialEntry[];
  totalAmount: number;
  notes?: string;
  status: TransactionStatus;
  origin: 'purchase' | 'sale';
  receiptStatus: 'not_available' | 'available';
  disputeReason?: string;
  forcedBy?: string;
}

// Exemplo de mock para transações
const mockTransactions: Transaction[] = [
  {
    id: 't1',
    createdAt: new Date('2024-05-01T10:00:00Z').toISOString(),
    updatedAt: new Date('2024-05-01T10:00:00Z').toISOString(),
    initiator: { id: 'company1', name: 'Empresa Coletora Exemplo', type: 'company' },
    receiver: { id: 'v1', name: 'Coletor João Silva', type: 'individual_collector' },
    materials: [
      { id: 1, type: 'Papelão', quantity: 10, unit: 'kg', pricePerUnit: 0.80, subtotal: 8.00 },
    ],
    totalAmount: 8.00,
    notes: 'Compra regular',
    status: 'pending_acceptance',
    origin: 'purchase',
    receiptStatus: 'not_available',
  },
];

// Função utilitária para normalizar materiais (copiada de BuyRecyclables)
function getMaterialIdentificador(nome: string) {
  if (materialDisplayData[nome]) {
    return nome;
  }
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

const ReceiptHistory: React.FC = () => {
    const navigate = useNavigate();

    const [receipts, setReceipts] = useState<Transaction[]>(mockTransactions);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'generated'>('all');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [receipt, setReceipt] = useState<Transaction | null>(null);
    const receiptRef = useRef<HTMLDivElement>(null);
    const [isSharing, setIsSharing] = useState(false);

    // Lista única de vendedores para autocomplete
    const uniqueVendors = Array.from(new Set(mockTransactions.map(receipt => receipt.receiver.name)));

    // Filtra os recibos baseado nos critérios
    const filteredReceipts = receipts.filter(receipt => {
        const matchesSearch = receipt.receiver.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || (statusFilter === 'pending' && receipt.receiptStatus === 'not_available') || (statusFilter === 'generated' && receipt.receiptStatus === 'available');
        
        const purchaseDate = new Date(receipt.createdAt);
        const matchesStartDate = !startDate || purchaseDate >= new Date(startDate);
        const matchesEndDate = !endDate || purchaseDate <= new Date(endDate + 'T23:59:59');

        return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
    });

    // Sugestões para o campo de busca
    const searchSuggestions = searchTerm
        ? uniqueVendors.filter(name => 
            name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : [];

    const handleReceiptClick = (receipt: Transaction) => {
        setReceipt(receipt);
        setShowReceiptModal(true);
    };

    const handleShare = () => {
        setIsSharing(true);
        toast.success('Recibo compartilhado com sucesso!');
    };

    const handlePrint = () => {
        if (receipt) {
            handlePrintSpecificReceiptTransaction(receipt);
        }
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
                        <ChevronLeft className="h-5 w-5" />
                        Voltar
                    </Button>
                    <h1 className="text-2xl font-bold">Histórico de Recibos</h1>
                </div>

                {/* Filtros */}
                <div className="mt-8 space-y-4">
                    {/* Nova estrutura de grid para os filtros */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        {/* Campo de Busca (Maior) */}
                        <div className="col-span-1 md:col-span-2">
                            <Label htmlFor="search">Buscar por Vendedor</Label>
                            <div className="relative">
                                <Input
                                    id="search"
                                    placeholder="Digite o nome do vendedor"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setShowSuggestions(true);
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                />
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                {showSuggestions && searchSuggestions.length > 0 && (
                                    <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
                                        {searchSuggestions.map((name, index) => (
                                            <div
                                                key={index}
                                                className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                                                onMouseDown={() => {
                                                    setSearchTerm(name);
                                                    setShowSuggestions(false);
                                                }}
                                            >
                                                {name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Filtro de Status (Abas) */}
                        <div className="col-span-1">
                             <Label htmlFor="status">Status do Recibo</Label>
                             <Tabs value={statusFilter} onValueChange={(value: 'all' | 'pending' | 'generated') => setStatusFilter(value)} className="w-full">
                                  <TabsList className="grid w-full grid-cols-3">
                                       <TabsTrigger value="all">Todos</TabsTrigger>
                                       <TabsTrigger value="pending">Pendente</TabsTrigger>
                                       <TabsTrigger value="generated">Gerado</TabsTrigger>
                                  </TabsList>
                             </Tabs>
                        </div>
                    </div>

                    {/* Filtros de Data (Lado a Lado) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="startDate">Data Inicial</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="endDate">Data Final</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                
                {/* Lista de Recibos */}
                <div className="mt-8">
                    <div className="space-y-4">
                        {filteredReceipts.length > 0 ? (
                            filteredReceipts.map(receipt => (
                                <ReceiptCard 
                                    key={receipt.id} 
                                    receipt={receipt} 
                                    setReceipts={setReceipts}
                                    handlePrintSpecificReceipt={handlePrintSpecificReceiptTransaction}
                                    handleReceiptClick={handleReceiptClick}
                                />
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground py-8">
                                Nenhum recibo encontrado para os filtros selecionados.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Dialog open={showReceiptModal} onOpenChange={setShowReceiptModal}>
                <DialogContent className="max-w-md w-full p-0 rounded-2xl overflow-hidden">
                    <div className="bg-white p-6">
                        <div ref={receiptRef}>
                            {/* Logotipo da Neutro */}
                            <div className="flex justify-center mb-2">
                                <img src="/logo-neutro.png" alt="Logo Neutro Impacto Verde" className="h-12 w-auto" />
                            </div>
                            <h2 className="text-center text-green-700 text-xl font-bold mb-2">Recibo de Compra de Recicláveis</h2>
                            <div className="flex flex-col items-center mb-4">
                                <span className="text-xs text-muted-foreground mb-2">via Neutro Impacto Verde</span>
                            </div>
                            <div className="border-b pb-2 mb-2">
                                <div className="font-semibold">Empresa Compradora</div>
                                <div>{receipt?.initiator.name}</div>
                                <div className="text-xs text-muted-foreground">{receipt?.initiator.type === 'company' ? 'Empresa Coletora' : receipt?.initiator.type === 'cooperative' ? 'Cooperativa' : 'Coletor Individual'}</div>
                            </div>
                            <div className="border-b pb-2 mb-2">
                                <div className="font-semibold">Vendedor</div>
                                <div className="flex items-center gap-2">
                                    <span>{receipt?.receiver.name}</span>
                                    <span className="text-xs text-muted-foreground">({receipt?.receiver.type === 'cooperative' ? 'Cooperativa' : 'Coletor Individual'})</span>
                                </div>
                                <div className="text-xs text-muted-foreground">Data: {new Date(receipt?.createdAt).toLocaleDateString()} às {new Date(receipt?.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                            <div className="mb-2">
                                <div className="font-semibold mb-1">Materiais Comprados</div>
                                <div className="rounded-xl border overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="p-2 text-left font-semibold">Material</th>
                                                <th className="p-2 text-center font-semibold">Qtd ({receipt?.materials[0]?.unit || 'kg'})</th>
                                                <th className="p-2 text-right font-semibold">Preço/Unid.</th>
                                                <th className="p-2 text-right font-semibold">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {receipt?.materials.map((mat, idx) => {
                                                const identificador = getMaterialIdentificador(mat.type);
                                                const displayInfo = materialDisplayData[identificador];
                                                const nome = displayInfo?.nome || mat.type;
                                                return (
                                                    <tr key={mat.id} className={idx !== receipt.materials.length - 1 ? 'border-b' : ''}>
                                                        <td className="p-2">
                                                            {displayInfo && <displayInfo.icone className={`inline-block mr-1 h-4 w-4 ${displayInfo.cor}`} />}
                                                            {nome}
                                                        </td>
                                                        <td className="p-2 text-center">{mat.quantity}</td>
                                                        <td className="p-2 text-right">R$ {mat.pricePerUnit.toFixed(2)}</td>
                                                        <td className="p-2 text-right">R$ {mat.subtotal.toFixed(2)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="border-t pt-2 flex justify-between items-center mb-4">
                                <span className="font-bold text-lg">Total:</span>
                                <span className="font-bold text-green-700 text-lg">R$ {receipt?.totalAmount.toFixed(2)}</span>
                            </div>
                            {receipt?.notes && (
                                <div className="mb-4 p-2 bg-gray-50 rounded text-sm">
                                    <span className="font-semibold">Observações:</span> {receipt.notes}
                                </div>
                            )}
                            <div className="flex items-center justify-center mb-4">
                                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded px-3 py-2 w-full">
                                    <span className="text-red-500 text-lg">⚠️</span>
                                    <span className="text-xs text-red-600 text-center">A impressão de recibos contribui para o desmatamento e emissão de CO2. Considere compartilhar digitalmente ou salvar em seu dispositivo.</span>
                                </div>
                            </div>
                        </div>
                        {/* Botões de ação em linha */}
                        <div className="flex gap-2 w-full mt-4">
                            <Button onClick={handleShare} disabled={isSharing} className="flex-1 flex items-center justify-center gap-2">
                                Compartilhar
                            </Button>
                            <Button onClick={handlePrint} variant="destructive" className="flex-1 flex items-center justify-center gap-2">
                                Imprimir Recibo
                            </Button>
                        </div>
                        <DialogClose asChild>
                            <button className="w-full mt-2 text-center text-base">Fechar</button>
                        </DialogClose>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

// Componente de Card para Recibo no Histórico
const ReceiptCard: React.FC<{ 
    receipt: Transaction;
    setReceipts: React.Dispatch<React.SetStateAction<Transaction[]>>; 
    handlePrintSpecificReceipt: (purchase: Transaction) => void; 
    handleReceiptClick: (receipt: Transaction) => void;
}> = ({ receipt, setReceipts, handlePrintSpecificReceipt, handleReceiptClick }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showDispute, setShowDispute] = useState(false);
    const [disputeReason, setDisputeReason] = useState('');

    // Simulação de usuário logado (receiver)
    const loggedUserId = receipt.receiver.id;

    const handleAccept = () => {
        setReceipts(prevReceipts =>
            prevReceipts.map(item =>
                item.id === receipt.id ? { ...item, status: 'accepted', receiptStatus: 'available' } : item
            )
        );
        toast.success('Compra aceita com sucesso! O recibo está disponível.');
    };

    const handleReject = () => {
        setReceipts(prevReceipts =>
            prevReceipts.map(item =>
                item.id === receipt.id ? { ...item, status: 'rejected' } : item
            )
        );
        toast.error('Compra recusada. O vendedor será notificado.');
    };

    const handleDispute = () => {
        setReceipts(prevReceipts =>
            prevReceipts.map(item =>
                item.id === receipt.id ? { ...item, status: 'disputed', disputeReason } : item
            )
        );
        setShowDispute(false);
        setDisputeReason('');
        toast.warning('Disputa aberta. O vendedor será notificado para análise.');
    };

    const handleGenerateReceipt = () => {
        // Simula a geração do recibo e atualiza o status
        console.log(`Gerando recibo para compra ${receipt.id}`);
        // Encontra a compra no estado e atualiza o status
        setReceipts(prevReceipts => 
            prevReceipts.map(item => 
                item.id === receipt.id ? { ...item, receiptStatus: 'available' } : item
            )
        );
    };

    const handlePrintButtonClick = () => {
        handleReceiptClick(receipt);
    };

    return (
        <Card className="border shadow-sm">
            <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                     {/* Placeholder para Avatar do Vendedor */}
                     <Avatar>
                          {/* <AvatarImage src={receipt.vendor.photo} /> */}
                          <AvatarFallback>{receipt.receiver.name.charAt(0)}</AvatarFallback>
                     </Avatar>
                    <div>
                        <div className="font-semibold">{receipt.receiver.name}</div>
                        <div className="text-sm text-muted-foreground">Data: {new Date(receipt.createdAt).toLocaleDateString()} - Total: R$ {receipt.totalAmount.toFixed(2)}</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Badge de Status do Recibo */}
                    <Badge className={
                        receipt.receiptStatus === 'not_available' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                    }>
                        {receipt.receiptStatus === 'not_available' ? 'Recibo Pendente' : 'Recibo Gerado'}
                    </Badge>
                    <Button variant="ghost" size="icon">
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </Button>
                </div>
            </div>
            
            {isExpanded && (
                <CardContent className="p-4 border-t bg-gray-50">
                    <div className="text-sm text-muted-foreground mb-4">
                         Compra realizada em: {new Date(receipt.createdAt).toLocaleDateString()} às {new Date(receipt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="font-semibold mb-2">Materiais:</div>
                    <ul className="list-disc pl-5 text-sm">
                        {receipt.materials.map(mat => {
                            const identificador = getMaterialIdentificador(mat.type);
                            const displayInfo = materialDisplayData[identificador];
                            const nome = displayInfo?.nome || mat.type;
                            return (
                                <li key={mat.id}>
                                    {displayInfo && <displayInfo.icone className={`inline-block mr-1 h-4 w-4 ${displayInfo.cor}`} />} 
                                    {mat.quantity}{mat.unit} de {nome} a R$ {mat.pricePerUnit.toFixed(2)}/{mat.unit} (Subtotal: R$ {mat.subtotal.toFixed(2)})
                                </li>
                            );
                        })}
                    </ul>
                    {receipt.notes && (
                         <div className="mt-4 text-sm text-muted-foreground">
                             <b>Observações:</b> {receipt.notes}
                         </div>
                    )}
                    {/* Fluxo de aceite, recusa e disputa */}
                    {receipt.status === 'pending_acceptance' && loggedUserId === receipt.receiver.id && (
                        <div className="mt-4 flex flex-col sm:flex-row gap-2">
                            <Button onClick={handleAccept} className="flex-1" variant="default">Aceitar Compra</Button>
                            <Button onClick={handleReject} className="flex-1" variant="destructive">Recusar</Button>
                            <Button onClick={() => setShowDispute(true)} className="flex-1" variant="outline">Abrir Disputa</Button>
                        </div>
                    )}
                    {showDispute && (
                        <div className="mt-2 flex flex-col gap-2">
                            <textarea
                                className="border rounded p-2"
                                placeholder="Descreva o motivo da disputa..."
                                value={disputeReason}
                                onChange={e => setDisputeReason(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <Button onClick={handleDispute} disabled={!disputeReason.trim()} className="flex-1" variant="destructive">Enviar Disputa</Button>
                                <Button onClick={() => setShowDispute(false)} className="flex-1" variant="ghost">Cancelar</Button>
                            </div>
                        </div>
                    )}
                    {/* Visualizar recibo após aceite */}
                    {receipt.status === 'accepted' && receipt.receiptStatus === 'available' && (
                        <div className="mt-4 flex justify-end">
                            <Button onClick={() => handleReceiptClick(receipt)} variant="outline">
                                Visualizar Recibo
                            </Button>
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
};

export default ReceiptHistory; 