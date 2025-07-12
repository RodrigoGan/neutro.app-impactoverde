import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useCollectorPoints } from '@/hooks/useCollectorPoints';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Trophy, Star, Target, Medal, Users, CheckCircle2, TrendingUp, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Points: React.FC = () => {
  const navigate = useNavigate();
  
  // Usar dados reais do hook
  const { pointsData, loading, error } = useCollectorPoints('1'); // TODO: usar collectorId real
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Carregando dados de pontuação...</div>
        </div>
      </Layout>
    );
  }
  
  if (error || !pointsData) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">
            {error || 'Erro ao carregar dados de pontuação'}
          </div>
        </div>
      </Layout>
    );
  }

  // Usar dados reais do hook para o gráfico
  const chartData = pointsData.monthlyProgress.map(item => ({
    month: item.month,
    points: item.points
  }));

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Cabeçalho com botão Voltar */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/collector-dashboard')}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Pontuação</h1>
        </div>

        {/* Visão Geral */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-neutro" />
                Nível Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-bold">{pointsData.currentPoints} pts</span>
                    <Badge variant="secondary" className="bg-neutro/10 text-neutro">
                      Nível {pointsData.currentLevel}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso para {pointsData.nextLevel}</span>
                      <span>{pointsData.currentPoints}/{pointsData.pointsToNextLevel}</span>
                    </div>
                    <Progress 
                      value={(pointsData.currentPoints / pointsData.pointsToNextLevel) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <h4 className="text-sm font-medium mb-2">Benefícios Atuais:</h4>
                  <ul className="space-y-2">
                    {pointsData.currentBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-neutro" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-neutro" />
                Próximo Nível: {pointsData.nextLevel}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Faltam {pointsData.pointsToNextLevel - pointsData.currentPoints} pontos para o próximo nível
                </p>
                <div>
                  <h4 className="text-sm font-medium mb-2">Novos Benefícios:</h4>
                  <ul className="space-y-2">
                    {pointsData.nextLevelBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progresso Mensal */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-neutro" />
              Progresso Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="points" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quests Ativas */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-neutro" />
              Quests Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pointsData.activeQuests.map((quest, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{quest.title}</h4>
                    <Badge variant="outline">{quest.points} pts</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{quest.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Progresso</span>
                      <span>{quest.progress}%</span>
                    </div>
                    <Progress value={quest.progress} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conquistas */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Medal className="h-5 w-5 text-neutro" />
              Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {pointsData.achievements.map((achievement, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "text-center p-4 rounded-lg border",
                    achievement.unlocked 
                      ? "bg-neutro/5 border-neutro/20" 
                      : "bg-muted/50 border-muted"
                  )}
                >
                  <div className="text-2xl mb-2">{achievement.icon}</div>
                  <h4 className="font-medium text-sm mb-1">{achievement.title}</h4>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  {achievement.unlocked && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      Desbloqueada
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ranking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-neutro" />
              Ranking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Posição Global</p>
                  <p className="text-2xl font-bold">{pointsData.ranking.globalPosition}º</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Posição Regional</p>
                  <p className="text-2xl font-bold">{pointsData.ranking.regionalPosition}º</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Coletores</p>
                  <p className="text-2xl font-bold">{pointsData.ranking.totalCollectors}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Top Coletores</h4>
                <div className="space-y-2">
                  {pointsData.ranking.topCollectors.map((collector, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                          index === 0 ? "bg-yellow-100 text-yellow-700" :
                          index === 1 ? "bg-gray-100 text-gray-700" :
                          index === 2 ? "bg-orange-100 text-orange-700" :
                          "bg-muted"
                        )}>
                          {index + 1}
                        </div>
                        <span className="font-medium">{collector.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{collector.points} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Points; 