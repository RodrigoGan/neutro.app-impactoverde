import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinancialData } from '@/hooks/useFinancialData';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Search, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Printer } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import AppFooter from '@/components/AppFooter';

// Remover interfaces Transaction, TransactionParty, MaterialEntry, TransactionStatus
// No SaleReceiptCard, usar apenas os campos reais: sale.collector_id, sale.materials, sale.status, sale.date, sale.created_at, etc.
// Para nome do coletor, exibir sale.collector_id

const ReceiptHistory: React.FC = () => {
  const navigate = useNavigate();
  // TODO: pegar o userId real da empresa logada
  const userId = 'EMPRESA_ID_AQUI';
  const [sales, setSales] = useState<any[]>([]); // Changed to any[] to match the new SaleReceiptCard
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'generated'>('all');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Buscar recibos reais do banco
  React.useEffect(() => {
    async function fetchReceipts() {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('solicitante_id', userId);
      if (!error && data) {
        setSales(data);
      } else {
        setSales([]);
      }
    }
    fetchReceipts();
  }, [userId]);

  // Lista única de compradores para autocomplete
  const uniqueBuyers = Array.from(new Set(sales.map(sale => sale.collector_id)));

  // Filtra as vendas baseado nos critérios
  const filteredSales = sales.filter(sale => {
    const buyerName = typeof sale.collector_id === 'string' ? sale.collector_id : '';
    const matchesSearch = buyerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'pending' && sale.receiptStatus === 'not_available') || (statusFilter === 'generated' && sale.receiptStatus === 'available');
    const saleDate = new Date(sale.createdAt);
    const matchesStartDate = !startDate || saleDate >= new Date(startDate);
    const matchesEndDate = !endDate || saleDate <= new Date(endDate + 'T23:59:59');
    return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
  });

  // Sugestões para o campo de busca
  const searchSuggestions = searchTerm
    ? uniqueBuyers.filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  if (sales.length === 0) {
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
            <h1 className="text-2xl font-bold">Histórico de Recibos de Vendas</h1>
          </div>
          <div className="text-center text-muted-foreground py-12">
            Nenhuma venda registrada ainda.
          </div>
          {/* Rodapé padrão com espaçamento */}
          <div className="mt-8">
            <AppFooter />
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold">Histórico de Recibos de Vendas</h1>
        </div>

        {/* Filtros */}
        <div className="mt-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="col-span-1 md:col-span-2">
              <Label htmlFor="search">Buscar por Comprador</Label>
              <div className="relative">
                <Input
                  id="search"
                  placeholder="Digite o nome do comprador"
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

        {/* Lista de Recibos de Vendas */}
        <div className="mt-8">
          <div className="space-y-4">
            {filteredSales.length > 0 ? (
              filteredSales.map(sale => (
                <SaleReceiptCard
                  key={sale.id}
                  sale={sale}
                  setSales={setSales}
                />
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Nenhum recibo encontrado para os filtros selecionados.
              </div>
            )}
          </div>
        </div>
        {/* Rodapé padrão com espaçamento */}
        <div className="mt-8">
          <AppFooter />
        </div>
      </div>
    </div>
  );
};

const SaleReceiptCard: React.FC<{
  sale: any;
  setSales: React.Dispatch<React.SetStateAction<any[]>>;
}> = ({ sale }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="border shadow-sm">
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{sale.collector_id ? sale.collector_id.charAt(0) : '?'}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">Coletor: {sale.collector_id || 'Desconhecido'}</div>
            <div className="text-sm text-muted-foreground">
              Data: {sale.date ? new Date(sale.date).toLocaleDateString() : '---'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge>{sale.status || 'Sem status'}</Badge>
          <Button variant="ghost" size="icon">
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {isExpanded && (
        <CardContent className="p-4 border-t bg-gray-50">
          <div className="font-semibold mb-2">Materiais:</div>
          <pre className="text-xs bg-gray-100 p-2 rounded">
            {sale.materials ? JSON.stringify(sale.materials, null, 2) : 'Nenhum material registrado.'}
          </pre>
        </CardContent>
      )}
    </Card>
  );
};

export default ReceiptHistory; 