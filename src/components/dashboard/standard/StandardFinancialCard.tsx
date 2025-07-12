import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Package, TrendingUp, History, Users, Archive, GlassWater, Leaf, Trash2, Recycle, Cpu, Droplets, CircleDashed, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MaterialSale {
  material: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
  date: string;
}

interface StandardFinancialCardProps {
  monthlyEarnings: number;
  monthlyGoal: number;
  materialSales: MaterialSale[];
  userType: 'individual_collector' | 'cooperative_owner' | 'collector_company_owner';
  isLinked?: boolean;
  totalMembers?: number;
  activeMembers?: number;
  onUpdateGoal?: (newGoal: number) => void;
}

// Mapeamento de ícones para materiais (referência exata da precificação)
const materialIcons: Record<string, React.ReactNode> = {
  'Papelão': <Archive className="inline-block mr-1 text-yellow-700 h-4 w-4" />, 
  'Papel': <Archive className="inline-block mr-1 text-yellow-600 h-4 w-4" />,
  'Plástico': <Package className="inline-block mr-1 text-blue-600 h-4 w-4" />, 
  'Alumínio': <Recycle className="inline-block mr-1 text-gray-500 h-4 w-4" />, 
  'Latinha': <Recycle className="inline-block mr-1 text-yellow-500 h-4 w-4" />,
  'Vidro': <GlassWater className="inline-block mr-1 text-green-700 h-4 w-4" />, 
  'Orgânico': <Leaf className="inline-block mr-1 text-green-500 h-4 w-4" />, 
  'Cobre': <CircleDashed className="inline-block mr-1 text-orange-700 h-4 w-4" />,
  'Metal': <Recycle className="inline-block mr-1 text-gray-700 h-4 w-4" />,
  'Eletrônico': <Cpu className="inline-block mr-1 text-purple-700 h-4 w-4" />,
  'Eletrônicos': <Cpu className="inline-block mr-1 text-purple-700 h-4 w-4" />,
  'Óleo': <Droplets className="inline-block mr-1 text-amber-700 h-4 w-4" />,
  'Tampa de Garrafa PET': <CircleDashed className="inline-block mr-1 text-blue-700 h-4 w-4" />,
  'Lacre de Latinha': <CircleDashed className="inline-block mr-1 text-gray-700 h-4 w-4" />,
  'Outros': <Trash2 className="inline-block mr-1 text-neutral-500 h-4 w-4" />,
};

export const StandardFinancialCard: React.FC<StandardFinancialCardProps & { onViewFullReport?: () => void }> = ({
  monthlyEarnings,
  monthlyGoal,
  materialSales,
  userType,
  isLinked = false,
  totalMembers,
  activeMembers,
  onViewFullReport,
  onUpdateGoal
}) => {
  const navigate = useNavigate();
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(monthlyGoal);

  const handleGoalClick = () => setEditingGoal(true);
  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => setGoalInput(Number(e.target.value.replace(/[^0-9,]/g, '').replace(',', '.')));
  const handleGoalSave = () => {
    setEditingGoal(false);
    if (typeof onUpdateGoal === 'function') {
      onUpdateGoal(goalInput);
    }
  };

  // Calcular total por material
  const materialTotals = materialSales.reduce((acc, sale) => {
    if (!acc[sale.material]) {
      acc[sale.material] = {
        total: 0,
        quantity: 0
      };
    }
    acc[sale.material].total += sale.total;
    acc[sale.material].quantity += sale.quantity;
    return acc;
  }, {} as Record<string, { total: number; quantity: number }>);

  // Determinar o título baseado no tipo de usuário
  const getTitle = () => {
    switch (userType) {
      case 'individual_collector':
        return 'Demonstração Financeira';
      case 'cooperative_owner':
        return 'Demonstração Financeira da Cooperativa';
      case 'collector_company_owner':
        return 'Demonstração Financeira da Empresa';
      default:
        return 'Demonstração Financeira';
    }
  };

  // Determinar a rota do histórico baseado no tipo de usuário
  const getHistoryRoute = () => '/financial-overview';

  const isEmpty =
    monthlyEarnings === 0 &&
    monthlyGoal === 0 &&
    totalMembers === 0 &&
    activeMembers === 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-bold">
          <DollarSign className="h-5 w-5 text-green-700" />
          {getTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEmpty && (
          <div className="text-center text-muted-foreground py-6">
            Nenhuma movimentação financeira registrada ainda.
          </div>
        )}
        <div className="space-y-6">
          {/* Ganhos do Mês */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Ganhos do Mês</p>
                <p className="text-2xl font-bold">R$ {monthlyEarnings.toFixed(2)}</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700 cursor-pointer" onClick={handleGoalClick}>
                {editingGoal ? (
                  <span className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={goalInput}
                      onChange={handleGoalChange}
                      className="w-24 px-2 py-1 rounded border border-green-300 text-green-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-200"
                      style={{ fontSize: 14 }}
                    />
                    <button
                      className="ml-2 px-2 py-1 rounded bg-green-600 text-white text-xs font-bold hover:bg-green-700"
                      onClick={handleGoalSave}
                      type="button"
                    >Salvar</button>
                  </span>
                ) : (
                  <>Meta: R$ {monthlyGoal.toFixed(2)}</>
                )}
              </Badge>
            </div>
            <Progress 
              value={(monthlyEarnings / monthlyGoal) * 100} 
              className="h-2"
            />
          </div>

          {/* Membros Ativos - Apenas para cooperativa */}
          {userType === 'cooperative_owner' && totalMembers && activeMembers && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Membros Ativos</p>
                </div>
                <Badge variant="secondary">
                  {activeMembers} de {totalMembers}
                </Badge>
              </div>
              <Progress 
                value={(activeMembers / totalMembers) * 100} 
                className="h-2"
              />
            </div>
          )}

          {/* Valores por Material */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Valores por Material</h4>
            {materialSales.length === 0 ? (
              <div className="text-muted-foreground text-center py-2 text-sm">
                Nenhum valor registrado para materiais neste mês.
              </div>
            ) : (
              Object.entries(materialTotals).map(([material, data]) => (
                <div key={material} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {materialIcons[material] || <Package className="h-4 w-4 text-muted-foreground" />}
                      <span className="text-sm">{material}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">R$ {data.total.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {data.quantity} kg
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={(data.total / monthlyEarnings) * 100} 
                    className="h-2"
                  />
                </div>
              ))
            )}
          </div>

          {/* Histórico de Vendas Recentes */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Vendas Recentes</h4>
            {materialSales.length === 0 ? (
              <div className="text-muted-foreground text-center py-2 text-sm">
                Nenhuma venda registrada neste mês.
              </div>
            ) : (
              <div className="space-y-2">
                {materialSales.slice(0, 3).map((sale, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        {materialIcons[sale.material] || <TrendingUp className="h-4 w-4 text-green-700" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{sale.material}</p>
                        <p className="text-xs text-muted-foreground">
                          {sale.quantity} {sale.unit} • {sale.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-700">
                        + R$ {sale.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={onViewFullReport ? onViewFullReport : () => navigate(getHistoryRoute())}
        >
          <History className="h-4 w-4 mr-1" />
          Ver histórico
        </Button>
      </CardFooter>
    </Card>
  );
}; 