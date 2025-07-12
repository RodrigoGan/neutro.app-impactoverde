import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Package, TrendingUp, History, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MaterialSale {
  material: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
  date: string;
}

interface StandardCooperativeFinancialCardProps {
  monthlyEarnings: number;
  monthlyGoal: number;
  materialSales: MaterialSale[];
  totalMembers: number;
  activeMembers: number;
}

export const StandardCooperativeFinancialCard: React.FC<StandardCooperativeFinancialCardProps> = ({
  monthlyEarnings,
  monthlyGoal,
  materialSales,
  totalMembers,
  activeMembers
}) => {
  const navigate = useNavigate();

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-neutro" />
          Demonstração Financeira
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Ganhos do Mês */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Ganhos do Mês</p>
                <p className="text-2xl font-bold">R$ {monthlyEarnings.toFixed(2)}</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Meta: R$ {monthlyGoal.toFixed(2)}
              </Badge>
            </div>
            <Progress 
              value={(monthlyEarnings / monthlyGoal) * 100} 
              className="h-2"
            />
          </div>

          {/* Membros Ativos */}
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

          {/* Valores por Material */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Valores por Material</h4>
            {Object.entries(materialTotals).map(([material, data]) => (
              <div key={material} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
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
                  className="h-1"
                />
              </div>
            ))}
          </div>

          {/* Histórico de Vendas Recentes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Vendas Recentes</h4>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/cooperative/sales-history')}
              >
                <History className="h-4 w-4 mr-1" />
                Ver histórico
              </Button>
            </div>
            <div className="space-y-2">
              {materialSales.slice(0, 3).map((sale, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <TrendingUp className="h-4 w-4 text-green-700" />
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 