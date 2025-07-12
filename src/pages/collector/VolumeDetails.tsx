import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ChevronLeft,
  Package,
  Calendar,
  TrendingUp,
  Clock,
  MapPin,
  Trophy,
  Download,
  Leaf,
  Target
} from 'lucide-react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Material {
  tipo: string;
  quantidade: number;
  unidade: string;
  porcentagem: number;
  icon: string;
}

const materiaisData: Material[] = [
  { tipo: 'Papelão', quantidade: 50, unidade: 'kg', porcentagem: 40, icon: '📦' },
  { tipo: 'Plástico', quantidade: 30, unidade: 'kg', porcentagem: 24, icon: '🥤' },
  { tipo: 'Metal', quantidade: 20, unidade: 'kg', porcentagem: 16, icon: '🔧' },
  { tipo: 'Vidro', quantidade: 15, unidade: 'kg', porcentagem: 12, icon: '🍶' },
  { tipo: 'Eletrônicos', quantidade: 10, unidade: 'kg', porcentagem: 8, icon: '📱' },
];

const VolumeDetails: React.FC = () => {
  const navigate = useNavigate();
  const [periodoSelecionado, setPeriodoSelecionado] = useState('atual');
  const volumeTotal = 125;
  const metaMensal = 200;
  const crescimento = 15;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <div className="container mx-auto p-4">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold">Volume Total de Coletas</h1>
          </div>
          <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="atual">Mês Atual</SelectItem>
              <SelectItem value="anterior">Mês Anterior</SelectItem>
              <SelectItem value="trimestre">Último Trimestre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Resumo Geral */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Volume Total do Período</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-3xl font-bold">{volumeTotal} kg</span>
                    <Badge className="ml-2 bg-green-100 text-green-800">+{crescimento}%</Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">Meta: {metaMensal} kg</span>
                </div>
                <Progress value={(volumeTotal / metaMensal) * 100} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {((volumeTotal / metaMensal) * 100).toFixed(1)}% da meta mensal atingida
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Impacto Ambiental</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Árvores Preservadas</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-xs text-muted-foreground">Equivalente à coleta de papel</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 6.5C11.1667 6.5 10.5 7.16667 10.5 8C10.5 8.83333 11.1667 9.5 12 9.5C12.8333 9.5 13.5 8.83333 13.5 8C13.5 7.16667 12.8333 6.5 12 6.5ZM12 3C14.4833 3 16.5 5.01667 16.5 7.5C16.5 11.125 12 15 12 15C12 15 7.5 11.125 7.5 7.5C7.5 5.01667 9.51667 3 12 3ZM12 0C7.85833 0 4.5 3.35833 4.5 7.5C4.5 13.125 12 21 12 21C12 21 19.5 13.125 19.5 7.5C19.5 3.35833 16.1417 0 12 0Z" fill="currentColor"/>
                    </svg>
                    <span className="text-sm font-medium">Água Economizada</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">1.250 L</p>
                    <p className="text-xs text-muted-foreground">Na produção de materiais</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-yellow-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 21H13V23H11V21ZM11 1H13V3H11V1ZM3 13H1V11H3V13ZM23 13H21V11H23V13ZM4.92 19.5L3.5 18.08L5.04 16.54L6.46 17.96L4.92 19.5ZM19.84 4.58L18.42 3.16L19.96 1.62L21.38 3.04L19.84 4.58ZM19.08 18.08L17.54 16.54L18.96 15.12L20.5 16.66L19.08 18.08ZM5.04 7.46L3.5 5.92L4.92 4.5L6.46 6.04L5.04 7.46ZM12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6Z" fill="currentColor"/>
                    </svg>
                    <span className="text-sm font-medium">Energia Poupada</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">450 kWh</p>
                    <p className="text-xs text-muted-foreground">Redução no consumo</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-purple-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.5 9.5C4.5 5.91 7.41 3 11 3C13.93 3 16.43 4.93 17.28 7.5H21C22.1 7.5 23 8.4 23 9.5C23 10.6 22.1 11.5 21 11.5H17.28C16.43 14.07 13.93 16 11 16C7.41 16 4.5 13.09 4.5 9.5ZM11 13C12.38 13 13.5 11.88 13.5 10.5C13.5 9.12 12.38 8 11 8C9.62 8 8.5 9.12 8.5 10.5C8.5 11.88 9.62 13 11 13Z" fill="currentColor"/>
                    </svg>
                    <span className="text-sm font-medium">CO₂ Evitado</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">250 kg</p>
                    <p className="text-xs text-muted-foreground">Redução na emissão</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detalhamento por Material */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Detalhamento por Material</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2 text-sm text-muted-foreground">
                <span>Material</span>
                <span>Porcentagem do volume total</span>
              </div>
              {materiaisData.map((material) => (
                <div key={material.tipo} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{material.icon}</span>
                      <span className="font-medium">{material.tipo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {material.quantidade} {material.unidade}
                      </span>
                      <Badge 
                        variant="secondary" 
                        className="bg-green-100 text-green-800"
                        title="Porcentagem em relação ao volume total coletado"
                      >
                        {material.porcentagem}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={material.porcentagem} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Análise de Desempenho */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Média Diária
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.2 kg</div>
              <p className="text-sm text-muted-foreground">+0.5 kg que o mês anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Melhor Dia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15 kg</div>
              <p className="text-sm text-muted-foreground">Segunda-feira, 15/03</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Recorde Pessoal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">180 kg</div>
              <p className="text-sm text-muted-foreground">Fevereiro/2024</p>
            </CardContent>
          </Card>
        </div>

        {/* Metas e Recomendações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-4 w-4" />
                Metas do Próximo Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Volume Total</span>
                    <span className="font-medium">150/250 kg</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Novos Clientes</span>
                    <span className="font-medium">3/5</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Coletas Semanais</span>
                    <span className="font-medium">12/15</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recomendações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mt-1" />
                  <div>
                    <p className="font-medium">Aumente suas coletas de Papelão</p>
                    <p className="text-sm text-muted-foreground">
                      Alta demanda na região central
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-blue-500 mt-1" />
                  <div>
                    <p className="font-medium">Melhor horário para coletas</p>
                    <p className="text-sm text-muted-foreground">
                      Entre 9h e 11h da manhã
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-purple-500 mt-1" />
                  <div>
                    <p className="font-medium">Jardim Paulista - média de 8kg por coleta</p>
                    <p className="text-sm text-muted-foreground">
                      Zona Sul - média de 8kg por coleta
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-4 mt-6">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => {
              const data = {
                periodo: periodoSelecionado,
                volumeTotal,
                metaMensal,
                crescimento,
                materiaisData,
                impactoAmbiental: {
                  arvoresPreservadas: 12,
                  aguaEconomizada: 1250,
                  energiaPoupada: 450,
                  co2Evitado: 250
                },
                desempenho: {
                  mediaDiaria: 4.2,
                  melhorDia: {
                    volume: 15,
                    data: '15/03'
                  },
                  recordePessoal: {
                    volume: 180,
                    data: 'Fevereiro/2024'
                  }
                }
              };

              // Criar o conteúdo do relatório em formato texto
              const content = `
RELATÓRIO DE VOLUME DE COLETAS
==============================
Período: ${periodoSelecionado === 'atual' ? 'Mês Atual' : periodoSelecionado === 'anterior' ? 'Mês Anterior' : 'Último Trimestre'}

Volume Total: ${volumeTotal} kg
Meta Mensal: ${metaMensal} kg
Crescimento: +${crescimento}%

DETALHAMENTO POR MATERIAL
------------------------
${materiaisData.map(m => `${m.tipo}: ${m.quantidade} ${m.unidade} (${m.porcentagem}%)`).join('\n')}

IMPACTO AMBIENTAL
----------------
Árvores Preservadas: 12
Água Economizada: 1.250 L
Energia Poupada: 450 kWh
CO₂ Evitado: 250 kg

DESEMPENHO
----------
Média Diária: 4.2 kg
Melhor Dia: 15 kg (15/03)
Recorde Pessoal: 180 kg (Fevereiro/2024)
              `.trim();

              // Criar um blob com o conteúdo
              const blob = new Blob([content], { type: 'text/plain' });
              
              // Criar um link para download
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `relatorio-volume-${periodoSelecionado}-${new Date().toISOString().split('T')[0]}.txt`;
              
              // Simular clique para iniciar o download
              document.body.appendChild(a);
              a.click();
              
              // Limpar
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            }}
          >
            <Download className="h-4 w-4" />
            Exportar Relatório
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default VolumeDetails; 