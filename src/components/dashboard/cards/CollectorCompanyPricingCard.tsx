import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MaterialPrice, PriceAdjustment } from '@/types/pricing';
import { Recycle, Package, Leaf, GlassWater, Trash2, Archive, ShoppingCart, DollarSign } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { materialDisplayData } from '@/config/materialDisplayData';

interface StandardCollectorCompanyPricingCardProps {
  userType: 'collector_company_owner' | 'individual_collector' | 'cooperative_owner';
  companyName?: string;
  basePrices: MaterialPrice[];
  adjustments?: PriceAdjustment[];
  onEdit?: () => void;
  onCompare?: (companyA: string, companyB: string) => void;
  isLinked?: boolean;
  linkedCompanyName?: string;
}

const StandardCollectorCompanyPricingCard: React.FC<StandardCollectorCompanyPricingCardProps> = ({
  userType,
  companyName,
  basePrices,
  adjustments = [],
  onEdit,
  onCompare,
  isLinked = false,
  linkedCompanyName
}) => {
  const navigate = useNavigate();
  const [compareMode, setCompareMode] = useState(false);
  const [selectedCompanyA, setSelectedCompanyA] = useState<string | null>(null);
  const [selectedCompanyB, setSelectedCompanyB] = useState<string | null>(null);
  const [comparisonData, setComparisonData] = useState<{
    companyA: string;
    companyB: string;
    pricesA: MaterialPrice[];
    pricesB: MaterialPrice[];
  } | null>(null);

  // Exemplo de busca de empresas coletoras (mock)
  const collectorCompanies = [
    { id: '1', name: 'Eco Coleta' },
    { id: '2', name: 'Recicla Mais' },
    { id: '3', name: 'Verde Limpo' },
  ];

  // Mock de preços para empresas (em produção, buscar do backend)
  const companyPrices: Record<string, MaterialPrice[]> = {
    'Eco Coleta': [
      { materialId: '1', name: 'Papelão', price: 0.50, unit: 'kg', isActive: true },
      { materialId: '2', name: 'Plástico', price: 0.30, unit: 'kg', isActive: true },
      { materialId: '3', name: 'Alumínio', price: 2.00, unit: 'kg', isActive: true },
    ],
    'Recicla Mais': [
      { materialId: '1', name: 'Papelão', price: 0.55, unit: 'kg', isActive: true },
      { materialId: '2', name: 'Plástico', price: 0.28, unit: 'kg', isActive: true },
      { materialId: '3', name: 'Alumínio', price: 2.10, unit: 'kg', isActive: true },
    ],
    'Verde Limpo': [
      { materialId: '1', name: 'Papelão', price: 0.48, unit: 'kg', isActive: true },
      { materialId: '2', name: 'Plástico', price: 0.32, unit: 'kg', isActive: true },
      { materialId: '3', name: 'Alumínio', price: 2.05, unit: 'kg', isActive: true },
    ],
  };

  // Função para calcular preço final com acréscimo
  function getFinalPrice(
    material: MaterialPrice,
    adjustments: PriceAdjustment[] | undefined,
    partnerId?: string,
    partnerType?: 'collector' | 'cooperative'
  ) {
    if (!adjustments || !partnerId || !partnerType) return material.price;
    const adj = adjustments.find(
      a => a.materialId === material.materialId && a.partnerId === partnerId && a.partnerType === partnerType
    );
    if (!adj) return material.price;
    if (adj.adjustmentType === 'percentage') {
      return material.price + material.price * (adj.adjustmentValue / 100);
    } else {
      return material.price + adj.adjustmentValue;
    }
  }

  // Função para formatar preço no formato brasileiro
  const formatPrice = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  function getMaterialIdentificador(nome: string) {
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

  // Renderização dos preços
  const renderPrices = (prices: MaterialPrice[], adjustments?: PriceAdjustment[]) => (
    <>
      <table className="w-full text-sm border mt-2">
        <thead>
          <tr className="bg-neutral-100">
            <th className="p-2 text-left">Material</th>
            <th className="p-2 text-right">Preço Base</th>
            {adjustments && <th className="p-2 text-right">Acréscimo</th>}
            <th className="p-2 text-right">Preço Final</th>
          </tr>
        </thead>
        <tbody>
          {prices.map((mat) => {
            const adj = adjustments?.find(a => a.materialId === mat.materialId);
            let finalPrice = mat.price;
            let adjLabel = '-';
            if (adj) {
              if (adj.adjustmentType === 'percentage') {
                finalPrice += mat.price * (adj.adjustmentValue / 100);
                adjLabel = `+${adj.adjustmentValue}%`;
              } else {
                finalPrice += adj.adjustmentValue;
                adjLabel = `+R$ ${formatPrice(adj.adjustmentValue)}`;
              }
            }
            const displayInfo = materialDisplayData[getMaterialIdentificador(mat.name)] || materialDisplayData.outros;
            return (
              <tr key={mat.materialId}>
                <td className="p-2 flex items-center gap-1">
                  <displayInfo.icone className={`inline-block mr-1 ${displayInfo.cor} h-4 w-4`} /> {displayInfo.nome}
                </td>
                <td className="p-2 text-right">R$ {formatPrice(mat.price)}</td>
                {adjustments && <td className="p-2 text-right">{adjLabel}</td>}
                <td className="p-2 text-right font-semibold">R$ {formatPrice(finalPrice)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="text-xs text-muted-foreground mt-2 text-center">
        Se algum preço estiver zerado, significa que ainda não há referência cadastrada para aquele material.
      </div>
    </>
  );

  // Renderização da tabela comparativa
  const renderComparisonTable = () => {
    if (!comparisonData) return null;
    const { companyA, companyB, pricesA, pricesB } = comparisonData;
    const loggedPartnerId = '10';
    const loggedPartnerType: 'collector' | 'cooperative' = userType === 'cooperative_owner' ? 'cooperative' : 'collector';
    return (
      <>
        <table className="w-full text-sm border mt-2">
          <thead>
            <tr className="bg-neutral-100">
              <th className="p-2 text-left">Material</th>
              <th className="p-2 text-right">{companyA}</th>
              <th className="p-2 text-right">{companyB}</th>
            </tr>
          </thead>
          <tbody>
            {pricesA.map((matA, idx) => {
              const matB = pricesB.find(m => m.materialId === matA.materialId);
              const finalA = getFinalPrice(matA, adjustments, loggedPartnerId, loggedPartnerType);
              const finalB = matB ? getFinalPrice(matB, adjustments, loggedPartnerId, loggedPartnerType) : null;
              const displayInfoA = materialDisplayData[getMaterialIdentificador(matA.name)] || materialDisplayData.outros;
              const displayInfoB = matB ? materialDisplayData[getMaterialIdentificador(matB.name)] || materialDisplayData.outros : null;
              return (
                <tr key={matA.materialId}>
                  <td className="p-2 flex items-center gap-1">
                    <displayInfoA.icone className={`inline-block mr-1 ${displayInfoA.cor} h-4 w-4`} /> {displayInfoA.nome}
                  </td>
                  <td className="p-2 text-right">
                    {finalA > matA.price ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-green-700 font-bold cursor-help">R$ {formatPrice(finalA)} *</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            Inclui acréscimo personalizado para sua {userType === 'cooperative_owner' ? 'cooperativa' : 'coleta'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <>R$ {formatPrice(finalA)}</>
                    )}
                  </td>
                  <td className="p-2 text-right">
                    {matB && finalB !== null && finalB > matB.price ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-green-700 font-bold cursor-help">R$ {formatPrice(finalB)} *</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            Inclui acréscimo personalizado para sua {userType === 'cooperative_owner' ? 'cooperativa' : 'coleta'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      matB ? <>R$ {finalB !== null ? formatPrice(finalB) : '-'}</> : '-' 
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="text-xs text-neutral-500 mt-2 flex items-center gap-1">
          <span className="text-green-700 font-bold">*</span> Valor inclui acréscimo personalizado para sua {userType === 'cooperative_owner' ? 'cooperativa' : 'coleta'}
        </div>
      </>
    );
  };

  // Renderização do modo comparação
  const renderComparison = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 mb-2 w-full">
        <Input
          placeholder="Empresa Coletora A"
          value={selectedCompanyA || ''}
          onChange={e => setSelectedCompanyA(e.target.value)}
          list="companiesA"
          className="w-full"
        />
        <Input
          placeholder="Empresa Coletora B"
          value={selectedCompanyB || ''}
          onChange={e => setSelectedCompanyB(e.target.value)}
          list="companiesB"
          className="w-full"
        />
        <datalist id="companiesA">
          {collectorCompanies.map(c => <option key={c.id} value={c.name} />)}
        </datalist>
        <datalist id="companiesB">
          {collectorCompanies.map(c => <option key={c.id} value={c.name} />)}
        </datalist>
        <Button
          disabled={!selectedCompanyA || !selectedCompanyB}
          onClick={() => {
            if (selectedCompanyA && selectedCompanyB) {
              setComparisonData({
                companyA: selectedCompanyA,
                companyB: selectedCompanyB,
                pricesA: companyPrices[selectedCompanyA] || [],
                pricesB: companyPrices[selectedCompanyB] || [],
              });
            }
          }}
          className="w-full sm:w-auto"
        >
          Comparar
        </Button>
      </div>
      {/* Tabela comparativa ou mensagem */}
      {comparisonData ? (
        renderComparisonTable()
      ) : (
        <div className="border rounded p-2 text-center text-neutral-500">
          {userType === 'cooperative_owner' 
            ? 'Selecione duas empresas coletoras para comparar os preços que pagam pelos materiais.'
            : 'Selecione duas empresas para comparar os preços.'}
        </div>
      )}
    </div>
  );

  // Ao sair da comparação, limpar dados
  const handleExitComparison = () => {
    setCompareMode(false);
    setComparisonData(null);
    setSelectedCompanyA(null);
    setSelectedCompanyB(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <DollarSign className="inline-block mr-2 text-green-700 h-5 w-5" />
          {compareMode
            ? 'Precificação'
            : companyName
              ? `Precificação - ${companyName}`
              : 'Precificação'}
          {(userType === 'individual_collector' || userType === 'cooperative_owner') && (
            <Button className="ml-4" size="sm" variant={compareMode ? 'default' : 'outline'} onClick={compareMode ? handleExitComparison : () => setCompareMode(true)}>
              {compareMode ? 'Sair da Comparação' : 'Comparar Preços'}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {compareMode ? (
          renderComparison()
        ) : (
          <>
            {isLinked && linkedCompanyName && (
              <div className="mb-2 text-sm text-neutral-600">
                {userType === 'cooperative_owner' 
                  ? 'Empresa coletora parceira:'
                  : 'Vinculado à empresa:'} <b>{linkedCompanyName}</b>
              </div>
            )}
            {isLinked === false && userType === 'individual_collector' && companyName && (
              <div className="mb-2 text-xs text-blue-700">Os preços exibidos são da empresa coletora cadastrada na Neutro mais próxima de você.</div>
            )}
            {isLinked === false && userType === 'cooperative_owner' && companyName && (
              <div className="mb-2 text-xs text-blue-700">Os preços exibidos são da empresa coletora parceira da Neutro mais próxima.</div>
            )}
            {renderPrices(basePrices, adjustments)}
          </>
        )}
      </CardContent>
      {userType === 'collector_company_owner' && (
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => navigate('/company/pricing')}
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Editar Precificação
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default StandardCollectorCompanyPricingCard; 