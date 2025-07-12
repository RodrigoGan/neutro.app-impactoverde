import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, DollarSign, PlusCircle, Trash2, Share2, Printer, ChevronUp, ChevronDown, Loader2, Package } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { AchievementAnimation } from '@/components/animations/AchievementAnimation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import html2canvas from 'html2canvas';
import { materialDisplayData } from '@/config/materialDisplayData';
import { getAllMaterials } from '@/lib/collectorService';
import { getMaterialIdentificador } from '@/lib/utils';

// Mock de vendedores (para MVP)
const mockVendors: Array<{ id: string; name: string; type: string; isLinked: boolean; linkedEntityId?: string; document?: string }>= [
  { id: 'v1', name: 'Coletor João Silva', type: 'individual_collector', isLinked: false },
  { id: 'v2', name: 'Cooperativa Recicla Bem', type: 'cooperative', isLinked: true, linkedEntityId: 'coop101' },
  { id: 'v3', name: 'Maria Souza (Não Vinculado)', type: 'individual', isLinked: false },
];

// Atualizar mocks e funções para usar identificadores
const mockBuyingPrices: Record<string, number> = {
  'papel': 0.50,
  'plastico': 1.20,
  'aluminio': 4.50,
  'vidro': 0.30,
  'organico': 0.10,
  'outros': 0.20,
};

// Mock de acréscimos para cooperativas vinculadas (exemplo: +10% no preço base)
const mockCooperativeIncrements: Record<string, number> = {
    'coop101': 0.10, // 10% de acréscimo para cooperativa com ID 'coop101'
};

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

// Interface para uma entrada no resumo de compras do dia
interface DailyPurchaseEntry {
    id: number; // Timestamp or unique ID
    vendor: { // Simplified vendor info for the summary
        id: string | null;
        name: string;
        type?: string;
        isLinked?: boolean;
        document?: string;
        // Add photo/avatar and rating fields if available in mock/real data
        // photo?: string;
        // rating?: number;
    };
    materials: MaterialEntry[];
    totalAmount: number;
    notes?: string;
    purchaseDate: Date;
    receiptStatus: 'pending' | 'generated';
}

// Função utilitária para obter o ícone do material
function getMaterialIcon(identificador) {
  const Icon = materialDisplayData[identificador]?.icone;
  const cor = materialDisplayData[identificador]?.cor || 'text-neutral-400';
  return Icon ? <Icon className={`inline-block mr-1 ${cor} h-4 w-4`} /> : null;
}

const BuyRecyclables: React.FC = () => {
  const navigate = useNavigate();

  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [vendorInput, setVendorInput] = useState<string>('');
  const [materials, setMaterials] = useState<MaterialEntry[]>([{ id: Date.now(), type: '', quantity: 0, unit: '', pricePerUnit: 0, subtotal: 0 }]);
  const [notes, setNotes] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [dailyPurchases, setDailyPurchases] = useState<DailyPurchaseEntry[]>([]);
  const [materiaisLoading, setMateriaisLoading] = useState(false);
  const [materiaisError, setMateriaisError] = useState<string | null>(null);
  const [materiaisDb, setMateriaisDb] = useState<any[]>([]);

  const isInitialMount = React.useRef(true);

  const selectedVendor = mockVendors.find(vendor => vendor.id === selectedVendorId);

  // Novo estado para controlar edição manual do preço por material
  const [editablePrices, setEditablePrices] = useState<Record<number, boolean>>({});

  // Buscar materiais do banco de dados
  useEffect(() => {
    const fetchMateriais = async () => {
      setMateriaisLoading(true);
      setMateriaisError(null);
      try {
        console.log('DEBUG - Buscando materiais do banco...');
        const materiaisData = await getAllMaterials();
        console.log('DEBUG - Materiais carregados:', materiaisData);
        setMateriaisDb(materiaisData);
      } catch (error) {
        console.error('Erro ao carregar materiais:', error);
        setMateriaisError('Erro ao carregar materiais. Tente novamente.');
        toast.error('Erro ao carregar materiais. Tente novamente.');
      } finally {
        setMateriaisLoading(false);
      }
    };

    fetchMateriais();
  }, []);

  // Zera os materiais ao trocar de vendedor
  useEffect(() => {
    // Só execute a lógica de reset após a montagem inicial
    if (isInitialMount.current) {
        isInitialMount.current = false;
    } else {
        // Reseta os materiais para uma nova entrada padrão sempre que o vendedor muda
        // Isso cobre a seleção de um vendedor registrado, mudança para novo vendedor, ou limpeza do campo.
        setMaterials([{ id: Date.now(), type: '', quantity: 0, unit: '', pricePerUnit: 0, subtotal: 0 }]);
    }

    // Reset vendor input when selected vendor changes, unless it's a new vendor
    if (selectedVendorId !== 'new-vendor') {
        const vendor = mockVendors.find(v => v.id === selectedVendorId);
        setVendorInput(vendor ? vendor.name : '');
    } else if (selectedVendorId === null) {
        setVendorInput('');
    }
  }, [selectedVendorId]);

  const getPriceWithIncrement = (materialType: string, vendor: typeof mockVendors[0] | undefined) => {
      const basePrice = mockBuyingPrices[materialType] || 0;
      if (vendor?.type === 'cooperative' && vendor.isLinked && vendor.linkedEntityId) {
          const incrementRate = mockCooperativeIncrements[vendor.linkedEntityId] || 0;
          return basePrice * (1 + incrementRate);
      }
      return basePrice;
  };

  const handleAddMaterial = () => {
    setMaterials([...materials, { id: Date.now(), type: '', quantity: 0, unit: '', pricePerUnit: 0, subtotal: 0 }]);
  };

  const handleMaterialChange = (id: number, field: keyof MaterialEntry, value: any) => {
    setMaterials(materials.map(mat => {
      if (mat.id === id) {
        const updatedMat = { ...mat, [field]: value };
        const unit = materiaisDb.find(opt => opt.identificador === updatedMat.type)?.unit || 'kg';
        let calculatedPrice = mat.pricePerUnit;
        // Sempre recalcular o preço sugerido ao trocar tipo ou vendedor
        if (field === 'type' || field === 'pricePerUnit' || selectedVendorId !== selectedVendor?.id) {
          calculatedPrice = getPriceWithIncrement(updatedMat.type, selectedVendor);
          updatedMat.pricePerUnit = calculatedPrice;
          // Resetar edição manual ao trocar tipo/vendedor
          setEditablePrices(prev => ({ ...prev, [id]: false }));
        }
        const quantity = parseFloat(updatedMat.quantity as any) || 0;
        const subtotal = calculatedPrice * quantity;
        return { ...updatedMat, unit, pricePerUnit: calculatedPrice, subtotal };
      }
      return mat;
    }));
  };

  const handleRemoveMaterial = (id: number) => {
    setMaterials(materials.filter(mat => mat.id !== id));
  };

  const totalAmount = materials.reduce((sum, mat) => sum + mat.subtotal, 0);

  const handleSubmit = () => {
    if (materials.length === 0 || materials.some(mat => !mat.type || mat.quantity <= 0 || mat.pricePerUnit <= 0)) {
      toast.error('Por favor, adicione materiais válidos com quantidade e preço.');
      return;
    }
    
    // Validação para garantir que um vendedor foi selecionado ou digitado
    if (selectedVendorId === null && vendorInput.trim() === '') {
        toast.error('Por favor, selecione ou digite o nome do vendedor.');
        return;
    }

    // Lógica para registrar a compra (usando mock por enquanto)
    const newPurchase: DailyPurchaseEntry = {
        id: Date.now(),
        vendor: 
            selectedVendorId === 'new-vendor' 
                ? { id: null, name: vendorInput.trim() || 'Vendedor Não Registrado' } 
                : selectedVendorId !== null && selectedVendor 
                    ? { // Caso um vendedor registrado foi selecionado
                        id: selectedVendor.id,
                        name: selectedVendor.name,
                        type: selectedVendor.type,
                        isLinked: selectedVendor.isLinked,
                        document: selectedVendor.document,
                        // Add photo/rating from selectedVendor if they exist
                        // photo: selectedVendor?.photo,
                        // rating: selectedVendor?.rating,
                      }
                    : { // Caso o nome foi digitado manualmente (selectedVendorId é null)
                        id: null,
                        name: vendorInput.trim() || 'Vendedor Não Informado', // Usa o nome digitado
                      },
        materials: [...materials], // Clone materials to store their state at time of purchase
        totalAmount,
        notes,
        purchaseDate: new Date(),
        receiptStatus: 'pending',
    };

    console.log('Compra registrada:', newPurchase);
    
    // Adiciona a nova compra ao resumo do dia
    setDailyPurchases(prevPurchases => [newPurchase, ...prevPurchases]);

    toast.success('Compra registrada com sucesso!');
    setShowSuccessAnimation(true);
    
    // Limpar formulário após registrar (opcional, dependendo do fluxo desejado)
    setMaterials([]);
    setVendorInput('');
    setSelectedVendorId(null);
    setNotes('');
  };

  

  const filteredVendors = vendorInput.length > 0
    ? mockVendors.filter(vendor =>
        vendor.name.toLowerCase().includes(vendorInput.toLowerCase())
      )
    : [];

  // Renderizar conteúdo do select de materiais
  const renderMaterialOptions = () => {
    if (materiaisLoading) {
      return (
        <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Carregando materiais...</span>
        </div>
      );
    }

    if (materiaisError) {
      return (
        <div className="p-2 text-sm text-red-500">
          Erro ao carregar materiais
        </div>
      );
    }

    return materiaisDb.map((material) => {
      const displayInfo = materialDisplayData[material.identificador];
      if (!displayInfo) {
        console.warn(`Material ${material.identificador} não encontrado no materialDisplayData`);
        return null;
      }

      return (
        <SelectItem key={material.id} value={material.identificador}>
          <div className="flex items-center gap-2">
            {displayInfo?.icone ? (
              <displayInfo.icone className={`h-4 w-4 ${displayInfo.cor}`} />
            ) : (
              <Package className={`h-4 w-4 text-muted-foreground`} />
            )}
            <span>{displayInfo?.nome || material.nome}</span>
          </div>
        </SelectItem>
      );
    }).filter(Boolean);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {showSuccessAnimation && (
        <AchievementAnimation
          title="Compra Registrada!"
          description="A compra de materiais foi registrada com sucesso."
          icon={<DollarSign className="w-16 h-16 text-green-600" />}
          soundType="money"
          onComplete={() => setShowSuccessAnimation(false)}
        />
      )}
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
          <h1 className="text-2xl font-bold">Registrar Compra de Recicláveis</h1>
        </div>

        <Card className="p-4">
          <CardHeader>
            <CardTitle className="text-xl">Detalhes da Compra</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 px-2 sm:px-6">
            {/* Seleção do Vendedor */}
            <div>
              <Label htmlFor="vendor">Vendedor (Busque por nome ou digite)</Label>
              <div className="relative">
                <Input
                  id="vendor"
                  placeholder="Buscar por nome ou digitar nome do vendedor"
                  value={vendorInput}
                  onChange={(e) => {
                    setVendorInput(e.target.value);
                    setSelectedVendorId(null); // Clear selected vendor when typing
                    setShowSuggestions(true); // Show suggestions when typing
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                />
                {showSuggestions && filteredVendors.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
                    {filteredVendors.map(vendor => (
                      <div
                        key={vendor.id}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                        onMouseDown={() => {
                          setVendorInput(vendor.name);
                          setSelectedVendorId(vendor.id);
                          setShowSuggestions(false);
                        }}
                      >
                        {vendor.name} ({vendor.isLinked ? 'Vinculado' : 'Não Vinculado'})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tabela de Preços (visível ao selecionar um vendedor registrado) */}
            {(selectedVendorId || vendorInput.trim()) && (
                <div className="border rounded-md p-2">
                    <h3 className="text-lg font-semibold mb-3">Tabela de Preços {selectedVendor?.name ? `para ${selectedVendor.name}` : '(Padrão da Empresa)'}</h3>
                    <div className="grid grid-cols-3 gap-2 text-sm font-medium border-b pb-2">
                        <div>Material</div>
                        <div className="text-center">Preço Base (kg)</div>
                        <div className="text-right">Preço Aplicado ({selectedVendor?.isLinked && selectedVendor.type === 'cooperative' ? '+ Acréscimo' : 'Padrão'}) (kg)</div>
                    </div>
                    <div className="space-y-2 pt-2">
                        {materiaisDb.map(material => {
                            const basePrice = mockBuyingPrices[material.identificador] || 0;
                            const priceToShow = selectedVendorId === 'new-vendor' 
                                ? basePrice
                                : getPriceWithIncrement(material.identificador, selectedVendor);
                            const displayInfo = materialDisplayData[material.identificador];
                            
                            if (!displayInfo) return null;
                            
                            return (
                                <div key={material.identificador} className="grid grid-cols-3 gap-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        {displayInfo?.icone ? (
                                            <displayInfo.icone className={`h-4 w-4 ${displayInfo.cor}`} />
                                        ) : (
                                            <Package className={`h-4 w-4 text-muted-foreground`} />
                                        )}
                                        <span>{displayInfo?.nome || material.nome}</span>
                                    </div>
                                    <div className="text-center">R$ {basePrice.toFixed(2)}/kg</div>
                                    <div className="text-right font-semibold text-green-600">R$ {priceToShow.toFixed(2)}/kg</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Lista de Materiais */}
            <div>
              <Label>Materiais Comprados</Label>
              <div className="grid grid-cols-[180px_70px_50px_90px_40px] gap-2 items-center text-sm font-medium mt-2 border-b pb-2">
                <div className="text-left">Tipo</div>
                <div className="text-center">Qtd</div>
                <div className="text-center">Unid.</div>
                <div className="text-right">Preço/Unid.</div>
                <div></div>
              </div>
              <div className="space-y-3 pt-2 px-2 sm:px-4">
                {materials.map(mat => (
                  <div key={mat.id} className="grid grid-cols-[180px_70px_50px_90px_40px] gap-2 items-end">
                    <div>
                      <Label htmlFor={`material-${mat.id}`} className="sr-only">Tipo de Material</Label>
                      <Select 
                        value={mat.type}
                        onValueChange={(value) => handleMaterialChange(mat.id, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {renderMaterialOptions()}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-center">
                      <Label htmlFor={`quantity-${mat.id}`} className="sr-only">Quantidade</Label>
                      <Input 
                        id={`quantity-${mat.id}`}
                        type="number"
                        placeholder="Qtd"
                        value={mat.quantity <= 0 ? '' : mat.quantity}
                        onChange={(e) => handleMaterialChange(mat.id, 'quantity', e.target.value)}
                        className="text-center"
                      />
                    </div>
                    <div className="text-center text-sm text-muted-foreground flex items-center justify-center h-10">
                      <Label className="sr-only">Unidade</Label>
                      {mat.unit || '-'}
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      <Label htmlFor={`pricePerUnit-${mat.id}`} className="sr-only">Preço/Unid. Negociado</Label>
                      <Input 
                        id={`pricePerUnit-${mat.id}`}
                        type="number"
                        placeholder="Preço"
                        value={mat.pricePerUnit}
                        readOnly={!editablePrices[mat.id]}
                        onChange={e => handleMaterialChange(mat.id, 'pricePerUnit', parseFloat(e.target.value))}
                        step="0.01"
                        min="0"
                        className="text-right"
                      />
                      {!editablePrices[mat.id] && (
                        <Button type="button" size="icon" variant="ghost" onClick={() => setEditablePrices(prev => ({ ...prev, [mat.id]: true }))} title="Editar preço manualmente">
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h6v-2H5a2 2 0 01-2-2v-6H3v8a2 2 0 002 2z"></path></svg>
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center justify-center">
                      <Button 
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveMaterial(mat.id)}
                        className="flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="mt-4 w-full" onClick={handleAddMaterial}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Material
              </Button>
            </div>

            {/* Observações (Opcional) */}
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea 
                id="notes"
                placeholder="Adicione observações sobre a compra..." 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Resumo Total */}
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-lg font-semibold">Total da Compra:</span>
              <span className="text-lg font-bold text-green-600">R$ {totalAmount.toFixed(2)}</span>
            </div>

          </CardContent>
          <CardFooter className="flex justify-end gap-4">
            <Button 
              className="text-base font-semibold"
              onClick={handleSubmit}
              disabled={materials.length === 0 || materials.some(mat => !mat.type || mat.quantity <= 0 || mat.pricePerUnit <= 0)}
            >
              Registrar Compra
            </Button>
          </CardFooter>
        </Card>

        {/* Seção de Resumo de Compras do Dia */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Resumo de Compras do Dia</h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/company/receipt-history')}>
              Ver Histórico de Recibos
            </Button>
          </div>
          {dailyPurchases.length > 0 ? (
              <div className="space-y-4">
                  {dailyPurchases.map(purchase => (
                      <PurchaseSummaryCard 
                        key={purchase.id} 
                        purchase={purchase} 
                        setDailyPurchases={setDailyPurchases}
                        handlePrintSpecificReceipt={handlePrintSpecificReceipt}
                      />
                  ))}
              </div>
          ) : (
              <div className="text-center text-muted-foreground py-8">
                  Nenhuma compra registrada para o dia de hoje.
              </div>
          )}
        </div>

      </div>
    </div>
  );
};

// Componente de Card para o Resumo de Compra (simplificado)
const PurchaseSummaryCard: React.FC<{ 
    purchase: DailyPurchaseEntry;
    setDailyPurchases: React.Dispatch<React.SetStateAction<DailyPurchaseEntry[]>>;
    handlePrintSpecificReceipt: (purchase: DailyPurchaseEntry) => void;
}> = ({ purchase, setDailyPurchases, handlePrintSpecificReceipt }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [copied, setCopied] = useState(false);
    const receiptRef = useRef<HTMLDivElement>(null);

    const handleGenerateReceipt = () => {
        setDailyPurchases(prevPurchases => 
            prevPurchases.map(item => 
                item.id === purchase.id ? { ...item, receiptStatus: 'generated' } : item
            )
        );
        toast.success('Recibo gerado com sucesso!');
    };

    const handleViewReceipt = () => {
        setShowReceiptModal(true);
    };

    const handleShare = async () => {
        setIsSharing(true);
        try {
            if (receiptRef.current) {
                const canvas = await html2canvas(receiptRef.current, { backgroundColor: '#fff', scale: 2 });
                const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
                if (blob) {
                    const file = new File([blob], 'recibo.jpg', { type: 'image/jpeg' });
                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        await navigator.share({
                            files: [file],
                            title: 'Recibo de Compra de Recicláveis',
                            text: 'Confira o recibo da sua compra de recicláveis.'
                        });
                    } else {
                        // Download automático se não suportar compartilhamento
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'recibo.jpg';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    }
                    setIsSharing(false);
                    return;
                }
            }
        } catch (e) {
            // fallback para texto
        }
        // fallback para texto
        const receiptText = generateReceiptText(purchase);
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Recibo de Compra de Recicláveis',
                    text: receiptText
                });
            } catch (e) {}
        } else {
            await navigator.clipboard.writeText(receiptText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
        setIsSharing(false);
    };

    const handlePrint = () => {
        handlePrintSpecificReceipt(purchase);
    };

    return (
        <>
        <Card className="border shadow-sm">
            <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <Avatar>
                         <AvatarFallback>{purchase.vendor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-semibold">{purchase.vendor.name}</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge className={
                        purchase.receiptStatus === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                    }>
                        {purchase.receiptStatus === 'pending' ? 'Recibo Pendente' : 'Recibo Gerado'}
                    </Badge>
                    <span className="text-lg font-bold text-green-600">R$ {purchase.totalAmount.toFixed(2)}</span>
                    <Button variant="ghost" size="icon">
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </Button>
                </div>
            </div>
            
            {isExpanded && (
                <CardContent className="p-4 border-t bg-gray-50">
                    <div className="text-sm text-muted-foreground mb-4">
                         Compra realizada em: {purchase.purchaseDate.toLocaleDateString()} às {purchase.purchaseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="font-semibold mb-2">Materiais:</div>
                    <ul className="list-disc pl-5 text-sm">
                        {purchase.materials.map(mat => {
                            const identificador = getMaterialIdentificador(mat.type);
                            const displayInfo = materialDisplayData[identificador];
                            const nome = displayInfo?.nome || mat.type;
                            return (
                                <li key={mat.id}>
                                    {displayInfo?.icone ? (
                                        <displayInfo.icone className={`inline-block mr-1 h-4 w-4 ${displayInfo.cor}`} />
                                    ) : (
                                        <Package className={`inline-block mr-1 h-4 w-4 text-muted-foreground`} />
                                    )}
                                    {nome} a R$ {mat.pricePerUnit.toFixed(2)}/{mat.unit} (Subtotal: R$ {mat.subtotal.toFixed(2)})
                                </li>
                            );
                        })}
                    </ul>
                    {purchase.notes && (
                         <div className="mt-4 text-sm text-muted-foreground">
                             <b>Observações:</b> {purchase.notes}
                         </div>
                    )}

                    {/* Botões de Recibo */}
                    <div className="mt-4 flex justify-end">
                        {purchase.receiptStatus === 'pending' ? (
                            <Button size="sm" onClick={handleGenerateReceipt}>
                                Gerar Recibo
                            </Button>
                        ) : (
                            <Button size="sm" variant="outline" onClick={handleViewReceipt}>
                                <Printer className="mr-2 h-4 w-4" />
                                Visualizar Recibo
                            </Button>
                        )}
                    </div>
                </CardContent>
            )}
        </Card>
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
                            <div>Empresa Coletora Exemplo</div>
                            <div className="text-xs text-muted-foreground">Rua da Empresa, 456 - Bairro - Cidade</div>
                            <div className="text-xs text-muted-foreground">CNPJ: YY.YYY.YYY/YYYY-YY</div>
                        </div>
                        <div className="border-b pb-2 mb-2">
                            <div className="font-semibold">Vendedor</div>
                            <div className="flex items-center gap-2">
                                <span>{purchase.vendor.name}</span>
                                <span className="text-xs text-muted-foreground">{purchase.vendor.type === 'cooperative' ? 'Cooperativa' : 'Coletor'}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">Data: {purchase.purchaseDate.toLocaleDateString()} às {purchase.purchaseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                        <div className="mb-2">
                            <div className="font-semibold mb-1">Materiais Comprados</div>
                            <div className="rounded-xl border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="p-2 text-left font-semibold">Material</th>
                                            <th className="p-2 text-center font-semibold">Qtd (kg)</th>
                                            <th className="p-2 text-right font-semibold">Preço/{purchase.materials[0]?.unit || 'un'}</th>
                                            <th className="p-2 text-right font-semibold">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {purchase.materials.map((mat, idx) => {
                                            const identificador = getMaterialIdentificador(mat.type);
                                            const displayInfo = materialDisplayData[identificador];
                                            const nome = displayInfo?.nome || mat.type;
                                            return (
                                                <tr key={mat.id} className={idx !== purchase.materials.length - 1 ? 'border-b' : ''}>
                                                    <td className="p-2">
                                                        {displayInfo?.icone ? (
                                                            <displayInfo.icone className={`inline-block mr-1 h-4 w-4 ${displayInfo.cor}`} />
                                                        ) : (
                                                            <Package className={`h-4 w-4 text-muted-foreground`} />
                                                        )}
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
                            <span className="font-bold text-green-700 text-lg">R$ {purchase.totalAmount.toFixed(2)}</span>
                        </div>
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
                            <Share2 className="w-4 h-4 mr-2" /> Compartilhar
                        </Button>
                        <Button onClick={() => handlePrintSpecificReceipt(purchase)} variant="destructive" className="flex-1 flex items-center justify-center gap-2">
                            <Printer className="w-4 h-4 mr-2" /> Imprimir Recibo
                        </Button>
                    </div>
                    <DialogClose asChild>
                        <button className="w-full mt-2 text-center text-base">Fechar</button>
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
        </>
    );
};

function generateReceiptText(purchase: DailyPurchaseEntry) {
    let text = `Recibo de Compra de Recicláveis\nvia Neutro Impacto Verde\n\nEmpresa Compradora:\nEmpresa Coletora Exemplo\nRua da Empresa, 456 - Bairro - Cidade\nCNPJ: YY.YYY.YYY/YYYY-YY\n\nVendedor: ${purchase.vendor.name}\n${purchase.vendor.type === 'cooperative' ? 'Cooperativa' : 'Coletor'}\nData: ${purchase.purchaseDate.toLocaleDateString()} às ${purchase.purchaseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n\nMateriais Comprados:`;
    purchase.materials.forEach(mat => {
        const identificador = getMaterialIdentificador(mat.type);
        const displayInfo = materialDisplayData[identificador];
        const nome = displayInfo?.nome || mat.type;
        text += `\n- ${nome}: ${mat.quantity}kg x R$ ${mat.pricePerUnit.toFixed(2)} = R$ ${mat.subtotal.toFixed(2)}`;
    });
    text += `\n\nTotal: R$ ${purchase.totalAmount.toFixed(2)}`;
    if (purchase.notes) text += `\n\nObservações: ${purchase.notes}`;
    text += `\n\nGerado via Neutro Impacto Verde`;
    return text;
}

export function handlePrintSpecificReceipt(purchase: DailyPurchaseEntry) {
    if (purchase.materials.length === 0) return;

    const vendorName = purchase.vendor.name || 'Não Informado';
    const vendorDetails = purchase.vendor.type
        ? `<div style='font-size: 14px; color: #4b5563;'>${purchase.vendor.type === 'cooperative' ? 'Cooperativa' : 'Coletor'}${purchase.vendor.document ? ' - ' + purchase.vendor.document : ''}</div>`
        : '';

    const buyerName = "Empresa Coletora Exemplo";
    const buyerAddress = "Rua da Empresa, 456 - Bairro - Cidade";
    const buyerCnpj = "YY.YYY.YYY/YYYY-YY";

    const logoUrl = window.location.origin + '/logo-neutro.png';
    const printContent = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${logoUrl}" alt="Logo da Neutro" style="max-width: 100px; margin-bottom: 10px;"/>
          <h2 style='font-size: 20px; color: #16a34a;'>Recibo de Compra de Recicláveis</h2>
           <div style='font-size: 14px; color: #64748b;'>via Neutro Impacto Verde</div>
        </div>
        <div style='margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px dashed #a3a3a3;'>
            <div style='font-weight: bold; margin-bottom: 4px;'>Empresa Compradora:</div>
            <div style='font-size: 14px;'>${buyerName}</div>
            <div style='font-size: 14px; color: #4b5563;'>${buyerAddress}</div>
            <div style='font-size: 14px; color: #4b5563;'>CNPJ: ${buyerCnpj}</div>
        </div>
        <div style='margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px dashed #a3a3a3;'>
            <div style='font-weight: bold; margin-bottom: 4px;'>Vendedor:</div>
            <div style='font-size: 14px;'>${vendorName}</div>
            ${vendorDetails}
            <div style='font-size: 14px; color: #4b5563; margin-top: 8px;'>Data: ${purchase.purchaseDate.toLocaleDateString()}</div>
        </div>
        <div style='font-weight: bold; margin-bottom: 8px;'>Materiais Comprados:</div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 14px;">
            <thead>
                <tr style="background-color: #f3f4f6; text-align: left;">
                    <th style="padding: 8px; border-bottom: 1px solid #d1d5db;">Material</th>
                    <th style="padding: 8px; border-bottom: 1px solid #d1d5db; text-align: center;">Qtd (${purchase.materials[0]?.unit || 'un'})</th>
                    <th style="padding: 8px; border-bottom: 1px solid #d1d5db; text-align: right;">Preço/${purchase.materials[0]?.unit || 'un'}</th>
                    <th style="padding: 8px; border-bottom: 1px solid #d1d5db; text-align: right;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                ${purchase.materials.map(mat => {
                    const identificador = getMaterialIdentificador(mat.type);
                    const displayInfo = materialDisplayData[identificador];
                    const nome = displayInfo?.nome || mat.type;
                    return `
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${nome}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${mat.quantity}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">R$ ${mat.pricePerUnit.toFixed(2)}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">R$ ${mat.subtotal.toFixed(2)}</td>
                    </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
        <div style='display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #16a34a; border-top: 2px solid #16a34a; padding-top: 10px;'>
          <span>Total:</span>
          <span>R$ ${purchase.totalAmount.toFixed(2)}</span>
        </div>
        ${purchase.notes?.trim() ? `
        <div style='margin-top: 16px; font-size: 14px; color: #374151; border-top: 1px dashed #a3a3a3; padding-top: 10px;'>
          <b>Observações:</b> ${purchase.notes}
        </div>
        ` : ''}
        <div style='margin-top: 24px; font-size: 12px; color: #64748b; text-align: center;'>Documento gerado em ${new Date().toLocaleString()}</div>
         <div style='font-size: 12px; color: #64748b; text-align: center; margin-top: 4px;'>Neutro Impacto Verde - Todos os direitos reservados.</div>
      </div>
    `;

    const printWindow = window.open('', '', 'width=600,height=700');
    if (printWindow) {
      printWindow.document.write(`<!DOCTYPE html><html><head><title>Recibo de Compra</title><style>body { margin: 0; } @media print { @page { size: auto; margin: 0mm; } body { margin: 10mm; } }</style></head><body>${printContent}</body></html>`);
      printWindow.document.close();
      printWindow.print();
    }
}

// Função para imprimir recibo de Transaction (para histórico de recibos)
export function handlePrintSpecificReceiptTransaction(receipt: Transaction) {
    if (receipt.materials.length === 0) return;
    const vendorName = receipt.receiver.name || 'Não Informado';
    const vendorType = receipt.receiver.type === 'cooperative' ? 'Cooperativa' : 'Coletor';
    const buyerName = receipt.initiator.name;
    const printContent = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="/logo-neutro.png" alt="Logo da Neutro" style="max-width: 100px; margin-bottom: 10px;"/>
          <h2 style='font-size: 20px; color: #16a34a;'>Recibo de Compra de Recicláveis</h2>
           <div style='font-size: 14px; color: #64748b;'>via Neutro Impacto Verde</div>
        </div>
        <div style='margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px dashed #a3a3a3;'>
            <div style='font-weight: bold; margin-bottom: 4px;'>Empresa Compradora:</div>
            <div style='font-size: 14px;'>${buyerName}</div>
        </div>
        <div style='margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px dashed #a3a3a3;'>
            <div style='font-weight: bold; margin-bottom: 4px;'>Vendedor:</div>
            <div style='font-size: 14px;'>${vendorName}</div>
            <div style='font-size: 14px; color: #4b5563;'>${vendorType}</div>
            <div style='font-size: 14px; color: #4b5563; margin-top: 8px;'>Data: ${new Date(receipt.createdAt).toLocaleDateString()}</div>
        </div>
        <div style='font-weight: bold; margin-bottom: 8px;'>Materiais Comprados:</div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 14px;">
            <thead>
                <tr style="background-color: #f3f4f6; text-align: left;">
                    <th style="padding: 8px; border-bottom: 1px solid #d1d5db;">Material</th>
                    <th style="padding: 8px; border-bottom: 1px solid #d1d5db; text-align: center;">Qtd (kg)</th>
                    <th style="padding: 8px; border-bottom: 1px solid #d1d5db; text-align: right;">Preço/kg</th>
                    <th style="padding: 8px; border-bottom: 1px solid #d1d5db; text-align: right;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                ${receipt.materials.map(mat => {
                    const identificador = getMaterialIdentificador(mat.type);
                    const displayInfo = materialDisplayData[identificador];
                    const nome = displayInfo?.nome || mat.type;
                    return `
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${nome}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${mat.quantity}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">R$ ${mat.pricePerUnit.toFixed(2)}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">R$ ${mat.subtotal.toFixed(2)}</td>
                </tr>
                `;
                }).join('')}
            </tbody>
        </table>
        <div style='display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #16a34a; border-top: 2px solid #16a34a; padding-top: 10px;'>
          <span>Total:</span>
          <span>R$ ${receipt.totalAmount.toFixed(2)}</span>
        </div>
        <div style='margin-top: 16px; font-size: 14px; color: #374151; border-top: 1px dashed #a3a3a3; padding-top: 10px;'>
          <b>Observações:</b> ${receipt.notes || ''}
        </div>
        <div style='margin-top: 24px; font-size: 12px; color: #64748b; text-align: center;'>Documento gerado em ${new Date().toLocaleString()}</div>
         <div style='font-size: 12px; color: #64748b; text-align: center; margin-top: 4px;'>Neutro Impacto Verde - Todos os direitos reservados.</div>
      </div>
    `;
    const printWindow = window.open('', '', 'width=600,height=700');
    if (printWindow) {
      printWindow.document.write(`<!DOCTYPE html><html><head><title>Recibo de Compra</title><style>body { margin: 0; } @media print { @page { size: auto; margin: 0mm; } body { margin: 10mm; } }</style></head><body>${printContent}</body></html>`);
      printWindow.document.close();
      printWindow.print();
    }
}

export default BuyRecyclables;