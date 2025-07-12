import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  Calculator, 
  Trophy, 
  Star,
  Target,
  TrendingUp,
  Users,
  Package,
  Calendar,
  Award
} from 'lucide-react';

interface ImprovementItem {
  id: string;
  title: string;
  description: string;
  category: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  priority: number;
  estimatedTime: string;
  points?: number;
  calculations?: string[];
}

interface PointsValidation {
  userType: string;
  action: string;
  currentPoints: number;
  suggestedPoints: number;
  reasoning: string;
  status: 'valid' | 'needs-adjustment' | 'critical';
}

const LevelsImprovementTracker: React.FC = () => {
  const [improvements, setImprovements] = useState<ImprovementItem[]>([
    {
      id: '1',
      title: 'Rebalancear Requisitos dos Niveis',
      description: 'Aumentar gaps entre Prata e Ouro para todos os tipos de usuario',
      category: 'critical',
      status: 'completed',
      priority: 1,
      estimatedTime: '2-3 horas',
      calculations: [
        'Usuario Comum: Prata (20 coletas) -> Ouro (50 coletas) - GAP SIGNIFICATIVO ✓',
        'Coletor: Prata (35 coletas) -> Ouro (80 coletas) - GAP SIGNIFICATIVO ✓',
        'Parceiro: Prata (50 cupons) -> Ouro (120 cupons) - GAP SIGNIFICATIVO ✓',
        'Cooperativa: Prata (35 coletas) -> Ouro (80 coletas) - GAP SIGNIFICATIVO ✓',
        'Empresa: Prata (8 coletores) -> Ouro (20 coletores) - GAP SIGNIFICATIVO ✓'
      ]
    },
    {
      id: '2',
      title: 'Implementar Sistema de Pontuacao Real',
      description: 'Criar servico de calculo e atribuicao automatica de pontos',
      category: 'critical',
      status: 'completed',
      priority: 2,
      estimatedTime: '4-6 horas',
      calculations: [
        'PointsService criado com metodos addPoints(), calculateLevel() ✓',
        'Hook usePoints criado para facilitar uso nas interfaces ✓',
        'Componente UserPointsProgress para exibir progresso ✓',
        'Tabela de pontuacao padronizada implementada ✓',
        'Sistema de logs de acoes implementado ✓',
        'Validacao automatica de requisitos para level up ✓'
      ]
    }
  ]);

  const toggleStatus = (id: string) => {
    setImprovements(prev => prev.map(item => 
      item.id === id 
        ? { ...item, status: item.status === 'completed' ? 'pending' : 'completed' }
        : item
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'in-progress': return <Circle className="w-4 h-4 text-blue-600" />;
      default: return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const completedCount = improvements.filter(item => item.status === 'completed').length;
  const totalCount = improvements.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
          <Target className="w-8 h-8 text-green-600" />
          Rastreador de Melhorias dos Niveis
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Acompanhe o progresso das melhorias no sistema de níveis e pontuação.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Progresso Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progresso Total</span>
              <span className="text-sm text-gray-600">{completedCount}/{totalCount} concluídas</span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
            <div className="text-center">
              <span className="text-2xl font-bold text-green-600">{Math.round(progressPercentage)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Lista de Melhorias
        </h2>
        
        {improvements.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={item.status === 'completed'}
                      onCheckedChange={() => toggleStatus(item.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <Badge className={getCategoryColor(item.category)}>
                          {item.category.toUpperCase()}
                        </Badge>
                        {getStatusIcon(item.status)}
                      </div>
                      <p className="text-gray-600">{item.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                        <span>Prioridade: {item.priority}</span>
                        <span>Tempo estimado: {item.estimatedTime}</span>
                        {item.points && <span>Pontos: {item.points}</span>}
                      </div>
                    </div>
                  </div>

                  {item.calculations && item.calculations.length > 0 && (
                    <div className="ml-8 space-y-2">
                      <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                        <Calculator className="w-4 h-4" />
                        Detalhes da Implementacao:
                      </h4>
                      <div className="space-y-1">
                        {item.calculations.map((calc, index) => (
                          <div key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {calc}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LevelsImprovementTracker; 