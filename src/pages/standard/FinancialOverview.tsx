import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, PieChart, BarChart2, History, ArrowLeft, Calendar, DollarSign, ListOrdered, Star, Package, Ticket, CheckCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
  LabelList,
} from 'recharts';
import { materialDisplayData } from '@/config/materialDisplayData';
import { getMaterialIdentificador } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';

// Remover mockData e mockParceiroDetalhado

const periodOptions = [
  { value: 'hoje', label: 'Hoje' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mês' },
  { value: 'ano', label: 'Ano' },
  { value: 'personalizado', label: 'Personalizado' },
];

const COLORS = ['#16a34a', '#fbbf24', '#2563eb', '#f87171', '#a21caf', '#0ea5e9'];

const FinancialOverview: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [period, setPeriod] = useState('mes');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const perfil = (location.state?.perfil || 'coletor') as 'coletor' | 'cooperativa' | 'empresa' | 'parceiro';
  const userId = location.state?.userId;

  // Estado para dados reais
  const [resumo, setResumo] = useState<any>(null);
  const [barData, setBarData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  React.useEffect(() => {
    async function fetchFinancialData() {
      setLoading(true);
      setErro(null);
      try {
        if (!userId) throw new Error('Usuário não informado');
        // --- Bloco para parceiros ---
        if ((perfil as string) === 'parceiro') {
          // Buscar cupons ativos
          const { data: cuponsAtivos, error: errorAtivos } = await supabase
            .from('coupons')
            .select('id, created_at')
            .eq('partner_id', userId)
            .eq('is_active', true);
          if (errorAtivos) throw errorAtivos;
          // Buscar cupons utilizados
          const { data: cuponsUtilizados, error: errorUtilizados } = await supabase
            .from('coupon_usage')
            .select('id, used_at')
            .eq('partner_id', userId);
          if (errorUtilizados) throw errorUtilizados;
          setResumo({
            cuponsAtivos: cuponsAtivos?.length ?? 0,
            cuponsUtilizados: cuponsUtilizados?.length ?? 0,
          });
          // Montar barData: contagem de cupons gerados, ativos e utilizados por período
          let barData: any[] = [];
          // Exemplo para período mês
          if (period === 'mes') {
            const diasNoMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
            barData = Array.from({ length: diasNoMes }).map((_, idx) => {
              const dia = String(idx + 1).padStart(2, '0');
              const dataStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${dia}`;
              return {
                name: dia,
                gerados: cuponsAtivos?.filter(c => c.created_at?.slice(0, 10) === dataStr).length || 0,
                ativos: cuponsAtivos?.filter(c => c.created_at?.slice(0, 10) === dataStr).length || 0, // pode ajustar lógica se necessário
                utilizados: cuponsUtilizados?.filter(c => c.used_at?.slice(0, 10) === dataStr).length || 0,
              };
            });
          }
          // TODO: implementar para outros períodos (hoje, semana, ano, personalizado)
          setBarData(barData);
          setPieData([]); // Pie chart real pode ser implementado depois
          return;
        }
        // Exemplo para COLETOR: buscar coletas do período
        let fromDate: string, toDate: string;
        const today = new Date();
        if (period === 'hoje') {
          fromDate = toDate = today.toISOString().slice(0, 10);
        } else if (period === 'semana') {
          const first = new Date(today);
          first.setDate(today.getDate() - today.getDay());
          fromDate = first.toISOString().slice(0, 10);
          toDate = today.toISOString().slice(0, 10);
        } else if (period === 'mes') {
          fromDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
          toDate = today.toISOString().slice(0, 10);
        } else if (period === 'ano') {
          fromDate = new Date(today.getFullYear(), 0, 1).toISOString().slice(0, 10);
          toDate = today.toISOString().slice(0, 10);
        } else if (period === 'personalizado' && startDate && endDate) {
          fromDate = startDate;
          toDate = endDate;
        } else {
          fromDate = toDate = today.toISOString().slice(0, 10);
        }
        // Buscar coletas do coletor no período
        const { data: collections, error } = await supabase
          .from('collections')
          .select('*')
          .eq('collector_id', userId)
          .gte('date', fromDate)
          .lte('date', toDate);
        if (error) throw error;
        // Calcular resumo
        let total = 0, operacoes = 0, materiais: Record<string, number> = {};
        (collections || []).forEach((col: any) => {
          operacoes++;
          if (Array.isArray(col.collected_materials)) {
            col.collected_materials.forEach((mat: any) => {
              materiais[mat.material] = (materiais[mat.material] || 0) + (mat.quantity || 0);
              total += (mat.price || 0) * (mat.quantity || 0);
            });
          }
        });
        const media = operacoes > 0 ? total / operacoes : 0;
        // Material destaque
        let destaque = Object.entries(materiais).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
        setResumo({ total, media, operacoes, destaque });
        // Gráfico de barras: valor por operação
        setBarData((collections || []).map((col: any, idx: number) => ({ name: `${idx + 1}`, valor: (col.collected_materials || []).reduce((acc: number, mat: any) => acc + (mat.price || 0) * (mat.quantity || 0), 0) })));
        // Gráfico de pizza: distribuição por material
        setPieData(Object.entries(materiais).map(([name, value]) => ({ name, value })));
      } catch (err: any) {
        setResumo(null);
        setBarData([]);
        setPieData([]);
        setErro(err.message || 'Erro ao buscar dados financeiros');
      } finally {
        setLoading(false);
      }
    }
    if ((perfil as string) === 'coletor') fetchFinancialData();
    // TODO: implementar para outros perfis
  }, [perfil, userId, period, startDate, endDate]);

  // Textos dinâmicos por perfil e tipo de parceiro
  const textosParceiro = {
    restaurant: {
      titulo: 'Resumo Financeiro do Restaurante',
      total: 'Economia Gerada',
      media: 'Média por Cupom',
      operacoes: 'Cupons Utilizados',
      destaque: 'Prato/Cupom Mais Usado',
      historico: 'Ver Histórico de Cupons',
    },
    store: {
      titulo: 'Resumo Financeiro da Loja',
      total: 'Economia Gerada',
      media: 'Média por Cupom',
      operacoes: 'Cupons Utilizados',
      destaque: 'Produto/Cupom Mais Usado',
      historico: 'Ver Histórico de Cupons',
    },
    educational: {
      titulo: 'Resumo Financeiro da Instituição',
      total: 'Economia Gerada',
      media: 'Média por Cupom',
      operacoes: 'Cupons Utilizados',
      destaque: 'Aula Verde/Benefício Mais Usado',
      historico: 'Ver Histórico de Cupons',
    },
    default: {
      titulo: 'Resumo Financeiro do Parceiro',
      total: 'Economia Gerada',
      media: 'Média por Cupom',
      operacoes: 'Cupons Utilizados',
      destaque: 'Benefício Mais Usado',
      historico: 'Ver Histórico de Cupons',
    }
  };

  // Textos dinâmicos por perfil
  const textos = {
    coletor: {
      titulo: 'Resumo Financeiro do Coletor',
      total: 'Total Vendido',
      media: 'Média por Venda',
      operacoes: 'Vendas Realizadas',
      destaque: 'Material Mais Vendido',
      historico: 'Ver Histórico de Vendas',
    },
    cooperativa: {
      titulo: 'Resumo Financeiro da Cooperativa',
      total: 'Total Vendido',
      media: 'Média por Venda',
      operacoes: 'Vendas Realizadas',
      destaque: 'Material Mais Vendido',
      historico: 'Ver Histórico de Vendas',
    },
    empresa: {
      titulo: 'Resumo Financeiro da Empresa Coletora',
      total: 'Total Comprado',
      media: 'Média por Compra',
      operacoes: 'Compras Realizadas',
      destaque: 'Material Mais Comprado',
      historico: 'Ver Histórico de Compras',
    },
    parceiro: {
      titulo: 'Resumo Financeiro do Parceiro',
      total: 'Economia Gerada',
      media: 'Média por Cupom',
      operacoes: 'Cupons Utilizados',
      destaque: 'Benefício Mais Usado',
      historico: 'Ver Histórico de Cupons',
    },
  };

  // Detectar tipo de parceiro se perfil for parceiro
  const partnerType = perfil === 'parceiro' ? (location.state?.partnerType || 'default') : undefined;
  const t = perfil === 'parceiro' ? (textosParceiro[partnerType] || textosParceiro.default) : textos[perfil as keyof typeof textos];

  // Se período personalizado, filtrar dados do mês pelo intervalo selecionado
  let data = { resumo: { total: 0, media: 0, operacoes: 0, destaque: '' }, barras: [], pizza: [] };
  if (period === 'personalizado') {
    // Usar dados do mês como base
    const base = { resumo: { total: 0, media: 0, operacoes: 0, destaque: '' }, barras: [], pizza: [] };
    // Determinar o range de dias selecionado
    let start = 1;
    let end = base.barras.length;
    if (startDate) start = Math.max(1, new Date(startDate).getDate());
    if (endDate) end = Math.min(base.barras.length, new Date(endDate).getDate());
    // Filtrar barras e labels
    const barras = base.barras.slice(start - 1, end);
    // Para pizza, recalcular proporcionalmente (mock):
    const total = barras.reduce((acc, v) => acc + v, 0);
    // Simular pizza proporcional ao total do período
    const pizza = base.pizza.map(v => Math.round(v * (total / base.barras.reduce((a, b) => a + b, 0))));
    // Labels iguais
    const resumo = {
      total: total,
      media: barras.length > 0 ? total / barras.length : 0,
      operacoes: barras.length,
      destaque: base.resumo.destaque
    };
    data = { resumo, barras, pizza };
  } else {
    data = { resumo, barras: barData, pizza: pieData };
  }

  // Preparar dados para os gráficos
  // Gráfico de barras: cada valor é um dia/semana/mês
  let barDataForChart = [];
  let pieDataForChart = [];
  if ((perfil as string) === 'parceiro') {
    barDataForChart = barData;
    pieDataForChart = [];
  } else {
    barDataForChart = data.barras.map((valor: number, idx: number) => ({
      name: `${idx + 1}`,
      valor,
    }));
    pieDataForChart = data.pizza.map((valor: number, idx: number) => ({
      name: data.resumo.destaque,
      value: valor,
      displayInfo: materialDisplayData[getMaterialIdentificador(data.resumo.destaque)] || materialDisplayData.outros
    }));
  }

  // Se perfil parceiro, usar mock detalhado
  const parceiroData = (perfil as string) === 'parceiro' ? null : null; // No mock detalhado para parceiro

  // Exibir destaque padronizado
  const destaqueInfo = resumo && resumo.destaque ? (materialDisplayData[getMaterialIdentificador(resumo.destaque)] || materialDisplayData.outros) : null;

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-green-700" />
          {t.titulo}
        </h1>
      </div>
      {/* Filtros de perfil e período - responsivo mobile/desktop */}
      <div className="mb-4">
        {/* Linha 1: Hoje, Semana, Mês (mobile) ou todos (desktop) */}
        <div className="flex justify-center gap-2 mb-2 md:hidden">
          {periodOptions.filter(opt => ['hoje', 'semana', 'mes'].includes(opt.value)).map(opt => (
            <Button
              key={opt.value}
              variant={period === opt.value ? 'default' : 'outline'}
              className="text-sm min-w-[90px]"
              onClick={() => setPeriod(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
        {/* Linha 2: Personalizado (mobile) */}
        <div className="flex justify-center gap-2 mb-2 md:hidden">
          <Button
            variant={period === 'personalizado' ? 'default' : 'outline'}
            className="text-sm min-w-[120px]"
            onClick={() => setPeriod('personalizado')}
          >
            Personalizado
          </Button>
        </div>
        {/* Linha 3: Datas (mobile, só se personalizado) */}
        {period === 'personalizado' && (
          <div className="flex items-center justify-center gap-2 mt-1 md:hidden">
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm w-28 min-w-[110px]"
              placeholder="Data inicial"
              style={{ minWidth: 110 }}
            />
            <span className="mx-1 text-xs flex items-center">a</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm w-28 min-w-[110px]"
              placeholder="Data final"
              style={{ minWidth: 110 }}
            />
          </div>
        )}
        {/* Desktop: todos os botões em uma linha */}
        <div className="hidden md:flex flex-wrap gap-2 mb-2">
          {periodOptions.map(opt => (
            <Button
              key={opt.value}
              variant={period === opt.value ? 'default' : 'outline'}
              className="text-sm min-w-[90px]"
              onClick={() => setPeriod(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
        {/* Desktop: datas se personalizado */}
        {period === 'personalizado' && (
          <div className="hidden md:flex items-center gap-2 mt-1">
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm w-28 min-w-[110px]"
              placeholder="Data inicial"
              style={{ minWidth: 110 }}
            />
            <span className="mx-1 text-xs flex items-center">a</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm w-28 min-w-[110px]"
              placeholder="Data final"
              style={{ minWidth: 110 }}
            />
          </div>
        )}
      </div>
      {/* Cards de resumo - UX melhorado */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {(perfil as string) === 'parceiro' ? (
          <>
          <div className="flex flex-col items-start bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1 text-xs text-green-800 font-medium">
                <Ticket className="h-4 w-4" /> Cupons Ativos
            </div>
              <div className="text-xl md:text-2xl font-bold text-green-900">{resumo?.cuponsAtivos ?? 0}</div>
              {(!resumo?.cuponsAtivos || resumo.cuponsAtivos === 0) && (
                <span className="text-gray-400 text-center mt-2 text-xs">Você ainda não ativou nenhum cupom. Crie cupons para atrair mais clientes!</span>
              )}
          </div>
          <div className="flex flex-col items-start bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1 text-xs text-blue-800 font-medium">
                <CheckCircle className="h-4 w-4" /> Cupons Utilizados
            </div>
              <div className="text-xl md:text-2xl font-bold text-blue-900">{resumo?.cuponsUtilizados ?? 0}</div>
              {(!resumo?.cuponsUtilizados || resumo.cuponsUtilizados === 0) && (
                <span className="text-gray-400 text-center mt-2 text-xs">Nenhum cupom foi utilizado neste período.</span>
              )}
            </div>
          </>
      ) : (
          <>
          <div className="flex flex-col items-start bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1 text-xs text-green-800 font-medium">
              <DollarSign className="h-4 w-4" /> {t.total}
            </div>
              <div className="text-xl md:text-2xl font-bold text-green-900">R$ {(data.resumo?.total ?? 0).toFixed(2)}</div>
          </div>
          <div className="flex flex-col items-start bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1 text-xs text-blue-800 font-medium">
              <BarChart2 className="h-4 w-4" /> {t.media}
            </div>
              <div className="text-xl md:text-2xl font-bold text-blue-900">R$ {(data.resumo?.media ?? 0).toFixed(2)}</div>
          </div>
          <div className="flex flex-col items-start bg-yellow-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1 text-xs text-yellow-800 font-medium">
              <ListOrdered className="h-4 w-4" /> {t.operacoes}
            </div>
              <div className="text-xl md:text-2xl font-bold text-yellow-900">{data.resumo?.operacoes ?? 0}</div>
          </div>
          <div className="flex flex-col items-start bg-purple-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1 text-xs text-purple-800 font-medium">
              <Star className="h-4 w-4" /> {t.destaque}
            </div>
            <div className="text-xl md:text-2xl font-bold text-purple-900">
                {destaqueInfo ? (
                  <destaqueInfo.icone className={`h-5 w-5 ${destaqueInfo?.cor ?? 'text-gray-400'} mr-1`} />
              ) : (
                  <Package className={`h-5 w-5 ${destaqueInfo?.cor ?? 'text-gray-400'} mr-1`} />
              )}
                {destaqueInfo ? destaqueInfo.nome : 'Nenhum destaque'}
              </div>
            </div>
          </>
        )}
          </div>
      {/* Gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="p-4 flex flex-col items-center justify-center">
          <div className="text-xs text-muted-foreground mb-2">
            {(perfil as string) === 'parceiro' ? `Evolução de Cupons (${periodOptions.find(p => p.value === period)?.label})` : `Evolução Financeira (${periodOptions.find(p => p.value === period)?.label})`}
          </div>
            <div className="w-full h-64 bg-muted/50 rounded flex items-center justify-center text-muted-foreground">
            {barDataForChart?.length === 0 ? (
              <span className="text-gray-400 text-center">
                {(perfil as string) === 'parceiro'
                  ? 'Nenhum cupom registrado neste período ainda. Assim que houver cupons, sua evolução aparecerá aqui!'
                  : 'Nenhuma venda registrada neste período ainda. Assim que houver vendas, sua evolução aparecerá aqui!'}
              </span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barDataForChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  {(perfil as string) === 'parceiro' ? (
                    <>
                  <Bar dataKey="gerados" fill="#16a34a" radius={[4, 4, 0, 0]} name="Gerados" />
                  <Bar dataKey="ativos" fill="#2563eb" radius={[4, 4, 0, 0]} name="Ativos" />
                  <Bar dataKey="utilizados" fill="#fbbf24" radius={[4, 4, 0, 0]} name="Utilizados" />
                    </>
                  ) : (
                    <Bar dataKey="valor" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  )}
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="text-xs text-center text-muted-foreground mt-2">
            {(perfil as string) === 'parceiro'
              ? 'Evolução de cupons gerados, ativos e utilizados'
              : 'Evolução dos ganhos ao longo do tempo'}
            </div>
          </Card>
          <Card className="p-4 flex flex-col items-center justify-center">
          <div className="text-xs text-muted-foreground mb-2">
            {(perfil as string) === 'parceiro' ? 'Tipos de Cupons Utilizados' : `Distribuição dos Materiais/Benefícios (${periodOptions.find(p => p.value === period)?.label})`}
          </div>
          <div className="relative min-h-[180px] flex items-center justify-center">
            {pieDataForChart?.length === 0 ? (
              <span className="text-gray-400 text-center">
                {(perfil as string) === 'parceiro'
                  ? 'Nenhum cupom utilizado neste período. Quando houver utilizações, a distribuição aparecerá aqui!'
                  : 'Nenhum material vendido neste período. Quando houver vendas, a distribuição aparecerá aqui!'}
              </span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={pieDataForChart}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    label={({ name, value }) => {
                      if ((perfil as string) === 'parceiro') {
                        return `${name}: ${value}`;
                      }
                      const info = materialDisplayData[getMaterialIdentificador(name)] || materialDisplayData.outros;
                      return `${info.nome}: ${value}`;
                    }}
                  >
                    {pieDataForChart.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            )}
            </div>
          <div className="text-xs text-center text-muted-foreground mt-2">
            {(perfil as string) === 'parceiro'
              ? 'Distribuição por tipo de cupom'
              : 'Distribuição dos materiais vendidos ou benefícios utilizados'}
            </div>
          </Card>
        </div>
      <Button className="mt-8 w-full max-w-xs" variant="outline" onClick={() => {
        if ((perfil as string) === 'parceiro') {
          const entity = location.state?.entity;
          navigate('/partner/coupons-history', { state: { partnerId: entity?.id } });
            } else {
          navigate('/sales/receipt-history', { state: { userId } });
            }
      }}>
        {(perfil as string) === 'parceiro' ? 'Ver histórico de cupons' : 'Ver Histórico de Vendas'}
        </Button>
    </div>
  );
};

export default FinancialOverview; 