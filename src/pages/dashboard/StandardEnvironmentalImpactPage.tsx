import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { standardEnvironmentalImpactMockData } from '@/mocks/StandardMockData';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Leaf, Droplets, Zap, Award, Star, Package, Car, ShowerHead, Wind, Trees } from 'lucide-react';

// TODO: importar e usar componentes de gráficos e badges já existentes

// Mock de evolução mensal dos KPIs
const kpiEvolution = [
  { mes: 'Jan', co2: 200, agua: 4000, energia: 600, arvores: 12 },
  { mes: 'Fev', co2: 180, agua: 3500, energia: 500, arvores: 10 },
  { mes: 'Mar', co2: 220, agua: 4200, energia: 700, arvores: 13 },
  { mes: 'Abr', co2: 250, agua: 5000, energia: 800, arvores: 15 },
  { mes: 'Mai', co2: 200, agua: 4000, energia: 600, arvores: 12 },
  { mes: 'Jun', co2: 200, agua: 4300, energia: 700, arvores: 13 },
];

// Mock de detalhamento por material
const materiais = [
  { tipo: 'Papel', quantidade: 50, unidade: 'kg', impacto: 'Água', valor: 1550 },
  { tipo: 'Plástico', quantidade: 30, unidade: 'kg', impacto: 'Energia', valor: 450 },
  { tipo: 'Vidro', quantidade: 20, unidade: 'kg', impacto: 'CO₂', valor: 120 },
  { tipo: 'Metal', quantidade: 10, unidade: 'kg', impacto: 'Árvores', valor: 3 },
];

// Mock de conquistas
const conquistas = [
  { nome: 'Primeira Reciclagem', icone: <Award className="h-6 w-6 text-yellow-500" />, descricao: 'Você realizou sua primeira reciclagem!' },
  { nome: '100kg Reciclados', icone: <Package className="h-6 w-6 text-neutro" />, descricao: 'Você reciclou 100kg de materiais.' },
  { nome: 'Economizou 10mil L de Água', icone: <Droplets className="h-6 w-6 text-blue-500" />, descricao: 'Você economizou 10.000L de água.' },
  { nome: 'CO₂ Evitado', icone: <Wind className="h-6 w-6 text-green-600" />, descricao: 'Você evitou 1 tonelada de CO₂.' },
];

// Mock de dicas
const dicas = [
  'Separe corretamente os resíduos para potencializar seu impacto.',
  'Recicle eletrônicos e pilhas em pontos de coleta específicos.',
  'Reduza o consumo de plástico descartável no dia a dia.'
];

// Ícones para cada impacto
const impactoIcones: Record<string, JSX.Element> = {
  'Água': <Droplets className="h-5 w-5 text-blue-500" />,
  'Energia': <Zap className="h-5 w-5 text-yellow-500" />,
  'CO₂': <Wind className="h-5 w-5 text-green-600" />,
  'Árvores': <Trees className="h-5 w-5 text-green-700" />,
};

// Função para equivalências visuais
function getEquivalencias(impactData: any) {
  return [
    {
      icone: <Car className="h-5 w-5 text-gray-600" />,
      texto: `${Math.round(impactData.co2.total / 120)} viagens de carro evitadas`
    },
    {
      icone: <ShowerHead className="h-5 w-5 text-blue-500" />,
      texto: `${Math.round(impactData.water.total / 120)} banhos de 5 minutos economizados`
    }
  ];
}

const StandardEnvironmentalImpactPage: React.FC = () => {
  // Simulação: pegar o id do usuário pela rota ou props (ajustar conforme integração real)
  const { userId } = useParams();
  const navigate = useNavigate();
  // Fallback para userId 1
  const impactData = standardEnvironmentalImpactMockData[userId ? parseInt(userId) : 1];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Button variant="ghost" onClick={() => navigate('/dashboard/standard', { state: { userId } })} className="flex items-center gap-2 mb-4">
        <ChevronLeft className="h-4 w-4" />
        Voltar
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Seu Impacto Ambiental</CardTitle>
        </CardHeader>
        <CardContent>
          {/* KPIs principais */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-green-600">{impactData.co2.total}{impactData.co2.unit ? impactData.co2.unit : ''}</span>
              <span className="text-xs text-muted-foreground">CO₂ evitado</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-green-600">{impactData.trees.total}</span>
              <span className="text-xs text-muted-foreground">Árvores preservadas</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-blue-600">{impactData.water.total}{impactData.water.unit ? impactData.water.unit : ''}</span>
              <span className="text-xs text-muted-foreground">Água economizada</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-yellow-600">{impactData.energy.total}{impactData.energy.unit ? impactData.energy.unit : ''}</span>
              <span className="text-xs text-muted-foreground">Energia poupada</span>
            </div>
          </div>

          {/* Equivalências Visuais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {getEquivalencias(impactData).map((eq, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                {eq.icone}
                <span className="text-sm">{eq.texto}</span>
              </div>
            ))}
          </div>

          {/* Gráfico de Evolução dos KPIs */}
          <div className="mt-8">
            <h3 className="font-medium mb-2">Evolução dos Indicadores</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={kpiEvolution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="co2" fill="#22c55e" name="CO₂ (kg)" />
                <Bar dataKey="agua" fill="#3b82f6" name="Água (L)" />
                <Bar dataKey="energia" fill="#f59e42" name="Energia (kWh)" />
                <Bar dataKey="arvores" fill="#16a34a" name="Árvores" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detalhamento por Material */}
          <div className="mt-8">
            <h3 className="font-medium mb-2">Impacto por Material Reciclado</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materiais.map((mat, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  {impactoIcones[mat.impacto]}
                  <span className="font-medium">{mat.tipo}:</span>
                  <span className="text-sm">{mat.quantidade}{mat.unidade} - {mat.impacto}: {mat.valor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Conquistas */}
          <div className="mt-8">
            <h3 className="font-medium mb-2">Conquistas de Impacto</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {conquistas.map((c, idx) => (
                <div key={idx} className="flex flex-col items-center p-3 bg-muted rounded-lg">
                  {c.icone}
                  <span className="font-medium mt-2 text-center text-xs">{c.nome}</span>
                  <span className="text-xs text-muted-foreground text-center">{c.descricao}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dicas */}
          <div className="mt-8">
            <h3 className="font-medium mb-2">Dicas para Aumentar seu Impacto</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {dicas.map((dica, idx) => (
                <li key={idx}>{dica}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StandardEnvironmentalImpactPage; 