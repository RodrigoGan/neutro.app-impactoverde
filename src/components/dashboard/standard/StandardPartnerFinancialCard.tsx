import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Gift, Users, TrendingUp, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userLevels } from '@/components/levels/levelsData';

interface RecentCoupon {
  user: string;
  value: number;
  valorTotalCompra: number;
  date: string;
  type: 'distribuído' | 'validado';
}

interface StandardPartnerFinancialCardProps {
  partnerType: 'restaurant' | 'store' | 'educational';
  monthlyInvestment?: number; // agora opcional
  distributedCoupons: number;
  validatedCoupons: number;
  engagementRate: number; // percentual
  recentCoupons: RecentCoupon[];
  userLevelLabel: 'Bronze' | 'Prata' | 'Ouro';
}

// Ajuste: calcular investimento real em cupons
function calcularInvestimento(cupons: RecentCoupon[]) {
  return cupons.reduce((acc, c) => {
    // Se o valor for percentual (ex: 15), considerar como % se for <= 1, senão R$
    // Aqui, para mock, vamos assumir que se value < 1 é %, senão é R$
    // Mas o ideal é ter um campo tipoDesconto: 'percentual' | 'fixo'
    if (typeof c.value === 'number' && c.valorTotalCompra && c.value > 0 && c.value < 1) {
      // Percentual
      return acc + (c.valorTotalCompra * c.value);
    } else {
      // Fixo em R$
      return acc + (c.value || 0);
    }
  }, 0);
}

export const StandardPartnerFinancialCard: React.FC<StandardPartnerFinancialCardProps> = ({
  partnerType,
  distributedCoupons,
  validatedCoupons,
  engagementRate,
  recentCoupons,
  userLevelLabel
}) => {
  const navigate = useNavigate();

  // Filtrar apenas cupons validados
  const cuponsValidados = recentCoupons.filter(c => c.type === 'validado');

  // Cálculos financeiros
  const totalFaturamento = cuponsValidados.reduce((acc, c) => acc + (c.valorTotalCompra || 0), 0);
  const ticketMedio = cuponsValidados.length > 0 ? totalFaturamento / cuponsValidados.length : 0;
  const investimentoReal = calcularInvestimento(cuponsValidados);
  const roi = investimentoReal > 0 ? totalFaturamento / investimentoReal : 0;

  // Buscar meta de cupons do nível
  const nivel = userLevelLabel.toLowerCase() as 'bronze' | 'prata' | 'ouro';
  const metaCupons = userLevels.partner[nivel]?.requirements?.activeCoupons || 10;
  // Média de desconto dos cupons validados
  const mediaDesconto = cuponsValidados.length > 0 ? cuponsValidados.reduce((acc, c) => acc + (c.value || 0), 0) / cuponsValidados.length : 10;
  // Meta de investimento automática
  const metaInvestimento = metaCupons * mediaDesconto;

  // Título dinâmico
  const getTitle = () => {
    switch (partnerType) {
      case 'restaurant': return 'Demonstração Financeira do Restaurante';
      case 'store': return 'Demonstração Financeira da Loja';
      case 'educational': return 'Demonstração Financeira da Instituição';
      default: return 'Demonstração Financeira do Parceiro';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-neutro" />
          {getTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Meta de cupons */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Meta de Cupons</p>
                <p className="text-2xl font-bold">{validatedCoupons} / {metaCupons}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Meta: {metaCupons} cupons
                </Badge>
                {validatedCoupons >= metaCupons && (
                  <Badge variant="secondary" className="bg-green-600 text-white animate-pulse">Meta Batida!</Badge>
                )}
              </div>
            </div>
            <Progress value={Math.min((validatedCoupons / metaCupons) * 100, 100)} className="h-2" />
          </div>
          {/* Métricas financeiras */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Investimento em Cupons</p>
              <p className="text-lg font-bold">R$ {investimentoReal.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Faturamento via Cupons</p>
              <p className="text-lg font-bold text-green-700">R$ {totalFaturamento.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ticket Médio</p>
              <p className="text-lg font-bold">R$ {ticketMedio.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ROI</p>
              <p className="text-lg font-bold">{roi.toFixed(2)}</p>
            </div>
          </div>
          {/* Cupons distribuídos e validados */}
          <div className="flex justify-between items-center gap-4">
            <div className="flex flex-col items-center flex-1">
              <Gift className="h-6 w-6 text-blue-600 mb-1" />
              <span className="text-lg font-bold">{distributedCoupons}</span>
              <span className="text-xs text-muted-foreground">Cupons Distribuídos</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <TrendingUp className="h-6 w-6 text-green-700 mb-1" />
              <span className="text-lg font-bold">{validatedCoupons}</span>
              <span className="text-xs text-muted-foreground">Cupons Validados</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <Users className="h-6 w-6 text-purple-700 mb-1" />
              <span className="text-lg font-bold">{engagementRate}%</span>
              <span className="text-xs text-muted-foreground">Engajamento</span>
            </div>
          </div>

          {/* Histórico de cupons recentes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Cupons Recentes</h4>
            </div>
            <div className="space-y-2">
              {recentCoupons.slice(0, 3).map((coupon, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Gift className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{coupon.user}</p>
                      <p className="text-xs text-muted-foreground">
                        {coupon.type === 'distribuído' ? 'Distribuído' : 'Validado'} • {coupon.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-700">
                      R$ {coupon.value.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">Compra: R$ {coupon.valorTotalCompra?.toFixed(2) ?? '-'}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Botão Ver histórico no rodapé */}
            <div className="flex justify-end pt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/financial-overview', { state: { perfil: 'parceiro' } })}
                className="flex items-center gap-2 w-full"
              >
                <History className="h-4 w-4 mr-1" />
                Ver histórico
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 