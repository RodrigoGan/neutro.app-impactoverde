import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, DollarSign, PlusCircle, Trash2, Share2, Printer, ChevronUp, ChevronDown, Loader2, ArrowLeft, Plus, Copy, Check, Package } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
import AppFooter from '@/components/AppFooter';

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
    description?: string; // Adicionado para armazenar a descrição
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

// Remover mockBasePrices, mockLinkedIncrements, mockBuyers, mockTransactions
// Adaptar getPriceWithIncrement para retornar 0 ou buscar preço real se disponível
// Adaptar selectedBuyer para buscar de uma lista real (ex: buyersDb)
// Adaptar dailySales para buscar de uma lista real (ex: salesDb)
// Em cada local onde usava mocks, exibir mensagem amigável se o array estiver vazio

const SellRecyclables: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [buyerInput, setBuyerInput] = useState('');
    const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [materials, setMaterials] = useState<MaterialEntry[]>([{
        id: Date.now(),
        type: '',
        quantity: 0,
        unit: '',
        pricePerUnit: 0,
        subtotal: 0
    }]);
    const [notes, setNotes] = useState('');
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
    const [dailySales, setDailySales] = useState<Transaction[]>([]);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [selectedSale, setSelectedSale] = useState<Transaction | null>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [materiaisLoading, setMateriaisLoading] = useState(false);
    const [materiaisError, setMateriaisError] = useState<string | null>(null);
    const [materiaisDb, setMateriaisDb] = useState<any[]>([]);
    const receiptRef = useRef<HTMLDivElement>(null);

    // TODO: Substituir por dados reais do usuário logado
    const userType = location.state?.userType || localStorage.getItem('userType') || 'individual_collector'; // Exemplo: buscar do localStorage, pode ser adaptado para contexto global
    const isLinked = true; // ou false
    const linkedEntityId = 'company1'; // ou undefined

    const selectedBuyer = materiaisDb.find(b => b.identificador === selectedBuyerId);

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

    const getPriceWithIncrement = (materialType: string, buyer: TransactionParty | undefined) => {
        const basePrice = 0; // Mock de preço base, será substituído por dados reais
        if (buyer?.isLinked && buyer.linkedEntityId) {
            const incrementRate = 0; // Mock de incremento, será substituído por dados reais
            return basePrice * (1 + incrementRate);
        }
        return basePrice;
    };

    const handleAddMaterial = () => {
        setMaterials([...materials, { 
            id: Date.now(), 
            type: '', 
            quantity: 0, 
            unit: '', 
            pricePerUnit: 0, 
            subtotal: 0 
        }]);
    };

    const handleMaterialChange = (id: number, field: keyof MaterialEntry, value: any) => {
        setMaterials(materials.map(mat => {
            if (mat.id === id) {
                const updatedMat = { ...mat, [field]: value };
                const unit = materiaisDb.find(opt => opt.identificador === updatedMat.type)?.unidade || 'kg';

                let calculatedPrice = mat.pricePerUnit;
                // Só sugere o preço padrão se o campo estiver vazio OU se o usuário mudou o tipo e o campo estava zerado
                if (field === 'type' && (!mat.pricePerUnit || mat.pricePerUnit === 0)) {
                    calculatedPrice = getPriceWithIncrement(updatedMat.type, selectedBuyer);
                } else if (field === 'pricePerUnit') {
                    calculatedPrice = parseFloat(value) || 0;
                }

                const quantity = parseFloat(updatedMat.quantity as any) || 0;
                const subtotal = calculatedPrice * quantity;

                return {
                    ...updatedMat,
                    unit,
                    pricePerUnit: calculatedPrice,
                    subtotal,
                };
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
        
        if (selectedBuyerId === null && buyerInput.trim() === '') {
            toast.error('Por favor, selecione ou digite o nome do comprador.');
            return;
        }

        const newSale: Transaction = {
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            initiator: { id: 'c1', name: 'Coletor João Silva', type: 'individual_collector' },
            receiver: selectedBuyer!,
            materials: materials.map(mat => ({
                id: mat.id,
                type: mat.type,
                quantity: mat.quantity,
                unit: mat.unit,
                pricePerUnit: mat.pricePerUnit,
                subtotal: mat.subtotal,
                description: mat.description // Adicionado para salvar a descrição
            })),
            totalAmount,
            notes,
            status: 'pending_acceptance',
            origin: 'sale',
            receiptStatus: 'not_available',
        };

        setDailySales([newSale, ...dailySales]);
        setShowSuccessAnimation(true);
        setMaterials([]);
        setNotes('');
        setBuyerInput('');
        setSelectedBuyerId(null);
    };

    const handlePrintSpecificReceipt = (sale: Transaction) => {
        setSelectedSale(sale);
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
                            title: 'Recibo de Venda de Recicláveis',
                            text: 'Confira o recibo da sua venda de recicláveis.'
                        });
                    } else {
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
        setIsSharing(false);
    };

    const filteredBuyers = buyerInput.length > 0
        ? materiaisDb.filter(buyer => {
            // Coletor individual só vende para empresa coletora
            if (userType === 'individual_collector') {
                return buyer.type === 'company' &&
                       buyer.name.toLowerCase().includes(buyerInput.toLowerCase());
            }
            // Cooperativa só vende para empresa coletora
            else if (userType === 'cooperative_owner') {
                return buyer.type === 'company' &&
                       buyer.name.toLowerCase().includes(buyerInput.toLowerCase());
            }
            return false;
        })
        : [];

    // Ordenar compradores: vinculados primeiro, depois os demais
    const sortedBuyers = [...filteredBuyers].sort((a, b) => {
        if (a.isLinked && !b.isLinked) return -1;
        if (!a.isLinked && b.isLinked) return 1;
        return 0;
    });

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

        if (materiaisDb.length === 0) {
            return (
                <div className="p-2 text-sm text-muted-foreground">
                    Nenhum material disponível para venda.
                </div>
            );
        }

        return materiaisDb.map((material) => (
            <SelectItem key={material.identificador} value={material.identificador}>
                <div className="flex items-center gap-2">
                    <span>{material.nome}</span>
                </div>
            </SelectItem>
        ));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {showSuccessAnimation && (
                <AchievementAnimation
                    title="Venda Registrada!"
                    description="A venda de materiais foi registrada com sucesso."
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
                    <h1 className="text-2xl font-bold">Registrar Venda de Recicláveis</h1>
                </div>

                <Card className="p-4">
                    <CardHeader>
                        <CardTitle className="text-xl">Detalhes da Venda</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Seleção do Comprador */}
                        <div>
                            <Label htmlFor="buyer">Comprador (Busque por nome ou digite)</Label>
                             <div className="relative">
                                <Input
                                    id="buyer"
                                    placeholder="Buscar por nome ou digitar nome do comprador"
                                    value={buyerInput}
                                    onChange={(e) => {
                                        setBuyerInput(e.target.value);
                                        setSelectedBuyerId(null);
                                        setShowSuggestions(true);
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                                />
                                 {showSuggestions && filteredBuyers.length > 0 && (
                                    <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
                                        {filteredBuyers.map(buyer => (
                                            <div
                                                key={buyer.id}
                                                className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                                                onMouseDown={() => {
                                                    setBuyerInput(buyer.name);
                                                    setSelectedBuyerId(buyer.id);
                                                    setShowSuggestions(false);
                                                }}
                                            >
                                                {buyer.name} ({buyer.isLinked ? 'Vinculado' : 'Não Vinculado'})
                                            </div>
                                        ))}
                                    </div>
                                )}
                             </div>
                        </div>

                        {/* Tabela de Preços (visível ao selecionar um comprador registrado) */}
                        {selectedBuyer && (
                            <div className="border rounded-md p-2">
                                <h3 className="text-lg font-semibold mb-3">Tabela de Preços para {selectedBuyer.name}</h3>
                                <div className="grid grid-cols-3 gap-2 text-sm font-medium border-b pb-2">
                                    <div>Material</div>
                                    <div className="text-center">Preço Base (kg)</div>
                                    <div className="text-right">Preço Aplicado ({selectedBuyer.isLinked ? '+ Acréscimo' : 'Padrão'}) (kg)</div>
                                </div>
                                <div className="space-y-2 pt-2">
                                    {materiaisDb.map(material => {
                                        const basePrice = 0; // Mock de preço base, será substituído por dados reais
                                        const priceToShow = getPriceWithIncrement(material.identificador, selectedBuyer);
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
                            <Label>Materiais Vendidos</Label>
                            <div className="grid grid-cols-[180px_70px_50px_90px_40px] gap-2 items-center text-sm font-medium mt-2 border-b pb-2">
                                <div className="text-left">Tipo</div>
                                <div className="text-center">Qtd</div>
                                <div className="text-center">Unid.</div>
                                <div className="text-right">Preço/Unid.</div>
                                <div></div>
                            </div>
                            <div className="space-y-3 pt-2 px-2 sm:px-4">
                                {materials.map(mat => (
                                    <React.Fragment key={mat.id}>
                                        <div className="grid grid-cols-[180px_70px_50px_90px_40px] gap-2 items-end">
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
                                                    min="0"
                                                    step="0.1"
                                                    value={mat.quantity}
                                                    onChange={(e) => handleMaterialChange(mat.id, 'quantity', e.target.value)}
                                                    className="text-center"
                                                />
                                            </div>
                                            <div className="text-center text-sm text-gray-500 flex items-center justify-center h-10">
                                                {mat.unit}
                                            </div>
                                            <div className="flex items-center justify-end">
                                                <Label htmlFor={`price-${mat.id}`} className="sr-only">Preço por Unidade</Label>
                                                <Input
                                                    id={`price-${mat.id}`}
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={mat.pricePerUnit}
                                                    onChange={(e) => handleMaterialChange(mat.id, 'pricePerUnit', e.target.value)}
                                                    className="text-right"
                                                />
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
                                        {mat.type === 'outros' && (
                                            <div className="col-span-full mt-2 mb-4">
                                                <Textarea
                                                    placeholder="Descreva quais materiais está vendendo (ex: sucata, resíduos especiais...)"
                                                    value={mat.description || ''}
                                                    onChange={e => handleMaterialChange(mat.id, 'description', e.target.value)}
                                                />
                                            </div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                            <Button variant="outline" className="mt-4 w-full" onClick={handleAddMaterial}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Adicionar Material
                            </Button>
                        </div>

                        {/* Observações */}
                        <div>
                            <Label htmlFor="notes">Observações</Label>
                            <Textarea 
                                id="notes"
                                placeholder="Adicione observações sobre a venda..." 
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        {/* Resumo Total */}
                        <div className="flex justify-between items-center pt-4 border-t">
                            <span className="text-lg font-semibold">Total da Venda:</span>
                            <span className="text-lg font-bold text-green-600">R$ {totalAmount.toFixed(2)}</span>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-4">
                        <Button 
                            className="text-base font-semibold"
                            onClick={handleSubmit}
                            disabled={materials.length === 0 || materials.some(mat => !mat.type || mat.quantity <= 0 || mat.pricePerUnit <= 0)}
                        >
                            Registrar Venda
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Modal de Recibo */}
            {selectedSale && (
                <Dialog open={showReceiptModal} onOpenChange={setShowReceiptModal}>
                    <DialogContent className="max-w-md w-full p-0 rounded-2xl overflow-hidden">
                        <div className="bg-white p-6">
                            <div ref={receiptRef}>
                                {/* Logotipo da Neutro */}
                                <div className="flex justify-center mb-2">
                                    <img src="/logo-neutro.png" alt="Logo Neutro Impacto Verde" className="h-12 w-auto" />
                                </div>
                                <h2 className="text-center text-green-700 text-xl font-bold mb-2">Recibo de Venda de Recicláveis</h2>
                                <div className="flex flex-col items-center mb-4">
                                    <span className="text-xs text-muted-foreground mb-2">via Neutro Impacto Verde</span>
                                </div>
                                <div className="border-t border-b py-4 mb-4">
                                    <div className="font-semibold mb-2">Empresa Compradora</div>
                                    <div>{selectedSale.receiver.name}</div>
                                    <div className="text-sm text-gray-500">
                                        {selectedSale.receiver.type === 'company' ? 'Empresa Coletora' : selectedSale.receiver.type === 'cooperative' ? 'Cooperativa' : 'Coletor Individual'}
                                    </div>
                                </div>
                                <div className="border-b py-4 mb-4">
                                    <div className="font-semibold">Comprador</div>
                                    <div>{selectedSale.receiver.type === 'cooperative' ? 'Cooperativa' : 'Coletor Individual'}</div>
                                    {selectedSale.receiver.isLinked && (
                                        <div className="text-sm text-gray-500">
                                            Vinculado a: {selectedSale.receiver.name}
                                        </div>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <div className="font-semibold mb-2">Materiais Vendidos</div>
                                    <div className="space-y-2">
                                        {selectedSale.materials.map((mat, idx) => {
                                            const identificador = getMaterialIdentificador(mat.type);
                                            const displayInfo = materialDisplayData[identificador];
                                            const nome = displayInfo?.nome || mat.type;
                                            return (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <span className="flex items-center gap-2">
                                                        {displayInfo?.icone ? (
                                                            <displayInfo.icone className={`h-4 w-4 ${displayInfo.cor}`} />
                                                        ) : (
                                                            <Package className={`h-4 w-4 text-muted-foreground`} />
                                                        )}
                                                        {nome}
                                                    </span>
                                                    <span>{mat.quantity} {mat.unit}</span>
                                                    <span>R$ {mat.pricePerUnit.toFixed(2)}</span>
                                                    <span>R$ {mat.subtotal.toFixed(2)}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="border-t pt-2 flex justify-between items-center mb-4">
                                    <span className="font-bold text-lg">Total:</span>
                                    <span className="font-bold text-green-700 text-lg">R$ {selectedSale.totalAmount.toFixed(2)}</span>
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
                                <Button onClick={() => handlePrintSpecificReceipt(selectedSale)} variant="destructive" className="flex-1 flex items-center justify-center gap-2">
                                    <Printer className="w-4 h-4 mr-2" /> Imprimir Recibo
                                </Button>
                            </div>
                            <DialogClose asChild>
                                <button className="w-full mt-2 text-center text-base">Fechar</button>
                            </DialogClose>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Vendas do Dia</h2>
                    <Button variant="outline" size="sm" onClick={() => navigate('/sales/receipt-history')}>
                        Ver Histórico de Recibos
                    </Button>
                </div>
                {dailySales.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        Nenhuma venda registrada para o dia de hoje.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {dailySales.map(sale => (
                            <SaleSummaryCard
                                key={sale.id}
                                sale={sale}
                                setDailySales={setDailySales}
                                userType={userType}
                            />
                        ))}
                    </div>
                )}
            </div>
            {/* Rodapé padrão com espaçamento */}
            <div className="mt-8">
                <AppFooter />
            </div>
        </div>
    );
};

const SaleSummaryCard: React.FC<{
    sale: Transaction;
    setDailySales: React.Dispatch<React.SetStateAction<Transaction[]>>;
    userType: string;
}> = ({ sale, setDailySales, userType }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [copied, setCopied] = useState(false);
    const receiptRef = useRef<HTMLDivElement>(null);

    const handleGenerateReceipt = () => {
        setDailySales(prevSales =>
            prevSales.map(item =>
                item.id === sale.id ? { ...item, receiptStatus: 'available' } : item
            )
        );
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
                            title: 'Recibo de Venda de Recicláveis',
                            text: 'Confira o recibo da sua venda de recicláveis.'
                        });
                    } else {
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
        } catch (e) {}
        setIsSharing(false);
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
                            <AvatarFallback>{sale.receiver.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-semibold">{sale.receiver.name}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge className={
                            sale.receiptStatus === 'not_available'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                        }>
                            {sale.receiptStatus === 'not_available' ? 'Recibo Pendente' : 'Recibo Gerado'}
                        </Badge>
                        <span className="text-lg font-bold text-green-600">R$ {sale.totalAmount.toFixed(2)}</span>
                        <Button variant="ghost" size="icon">
                            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>
                {isExpanded && (
                    <CardContent className="p-4 border-t bg-gray-50">
                        <div className="text-sm text-muted-foreground mb-4">
                            Venda realizada em: {new Date(sale.createdAt).toLocaleDateString()} às {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="font-semibold mb-2">Materiais:</div>
                        <ul className="list-disc pl-5 text-sm">
                            {sale.materials.map((mat, idx) => {
                                const identificador = getMaterialIdentificador(mat.type);
                                const displayInfo = materialDisplayData[identificador];
                                const nome = displayInfo?.nome || mat.type;
                                return (
                                    <li key={idx}>
                                        {displayInfo?.icone ? (
                                            <displayInfo.icone className={`inline-block mr-1 h-4 w-4 ${displayInfo.cor}`} />
                                        ) : (
                                            <Package className={`h-4 w-4 text-muted-foreground`} />
                                        )}
                                        {mat.quantity} {mat.unit} de {nome} a R$ {mat.pricePerUnit.toFixed(2)}/{mat.unit} (Subtotal: R$ {mat.subtotal.toFixed(2)})
                                    </li>
                                );
                            })}
                        </ul>
                        {sale.notes && (
                            <div className="mt-4 text-sm text-muted-foreground">
                                <b>Observações:</b> {sale.notes}
                            </div>
                        )}
                        <div className="mt-4 flex justify-end">
                            {sale.receiptStatus === 'not_available' ? (
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
                            <h2 className="text-center text-green-700 text-xl font-bold mb-2">Recibo de Venda de Recicláveis</h2>
                            <div className="flex flex-col items-center mb-4">
                                <span className="text-xs text-muted-foreground mb-2">via Neutro Impacto Verde</span>
                            </div>
                            <div className="border-b pb-2 mb-2">
                                <div className="font-semibold">Empresa Compradora</div>
                                <div>{sale.receiver.name}</div>
                                <div className="text-xs text-muted-foreground">{sale.receiver.type === 'company' ? 'Empresa Coletora' : sale.receiver.type === 'cooperative' ? 'Cooperativa' : 'Coletor Individual'}</div>
                            </div>
                            <div className="border-b pb-2 mb-2">
                                <div className="font-semibold">Vendedor</div>
                                <div className="flex items-center gap-2">
                                    <span>{sale.receiver.type === 'cooperative' ? 'Cooperativa' : 'Coletor Individual'}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">Data: {new Date(sale.createdAt).toLocaleDateString()} às {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                            <div className="mb-2">
                                <div className="font-semibold mb-1">Materiais Vendidos</div>
                                <div className="rounded-xl border overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="p-2 text-left font-semibold">Material</th>
                                                <th className="p-2 text-center font-semibold">Qtd (kg)</th>
                                                <th className="p-2 text-right font-semibold">Preço/Unid.</th>
                                                <th className="p-2 text-right font-semibold">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sale.materials.map((mat, idx) => {
                                                const identificador = getMaterialIdentificador(mat.type);
                                                const displayInfo = materialDisplayData[identificador];
                                                const nome = displayInfo?.nome || mat.type;
                                                return (
                                                    <tr key={idx} className={idx !== sale.materials.length - 1 ? 'border-b' : ''}>
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
                                <span className="font-bold text-green-700 text-lg">R$ {sale.totalAmount.toFixed(2)}</span>
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
                            <Button onClick={() => window.print()} variant="destructive" className="flex-1 flex items-center justify-center gap-2">
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

export default SellRecyclables; 