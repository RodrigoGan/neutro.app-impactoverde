import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useAchievements } from '@/hooks/useAchievements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Trophy,
  Package,
  Star,
  Leaf,
  Trees,
  Droplets,
  Clock,
  Calendar,
  Award,
  Lock,
  CheckCircle2,
  Timer,
  ArrowLeft,
  Wind,
  Zap
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { MATERIAIS } from '@/config/materials';
import { materialDisplayData } from '@/config/materialDisplayData';

interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  category: 'coletas' | 'reciclagem' | 'avaliacoes' | 'impacto' | 'engajamento';
  icon: React.ReactNode;
  unlockedAt?: string;
  progress?: number;
  requirement: string;
}

interface RankingUser {
  id: string;
  position: number;
  name: string;
  points: number;
  avatar?: string;
  isUser: boolean;
  level: 'bronze' | 'silver' | 'gold';
  lastActivity?: string;
  achievementsCount: number;
}

interface ColetasStats {
  individual: {
    total: number;
    esteMes: number;
    mediaMensal: number;
    frequencia: number; // coletas por semana
    ultimaColeta: string;
  };
  bairro: {
    totalUsuarios: number;
    mediaColetas: number;
    mediaMensal: number;
    metaMensal: number;
    progressoMeta: number;
    ranking: Array<{
      nome: string;
      coletas: number;
      avatar: string;
      isUser: boolean;
    }>;
  };
  metasComunitarias: {
    metaAtual: string;
    progresso: number;
    recompensa: string;
    dataLimite: string;
  };
}

interface ReciclagemStats {
  individual: {
    total: number;
    esteMes: number;
    mediaMensal: number;
    materiais: {
      papel: number;
      plastico: number;
      vidro: number;
      metal: number;
    };
  };
  bairro: {
    totalUsuarios: number;
    mediaTotal: number;
    mediaMensal: number;
    metaMensal: number;
    progressoMeta: number;
    ranking: Array<{
      nome: string;
      volume: number;
      avatar: string;
      isUser: boolean;
    }>;
  };
  metasComunitarias: {
    metaAtual: string;
    progresso: number;
    dataLimite: string;
  };
}

const Achievements: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;
  const [levelDist, setLevelDist] = useState<{ bronze: number, silver: number, gold: number } | null>(null);
  const [levelDistLoading, setLevelDistLoading] = useState(true);
  const [levelDistError, setLevelDistError] = useState<string | null>(null);

  // Estado para materiais reais
  const [userMaterials, setUserMaterials] = useState<Record<string, number>>({});
  const [neighMaterials, setNeighMaterials] = useState<Record<string, number>>({});
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [materialsError, setMaterialsError] = useState<string | null>(null);

  // Buscar bairro do usuário e distribuição de níveis
  useEffect(() => {
    async function fetchLevelDist() {
      setLevelDistLoading(true);
      setLevelDistError(null);
      try {
        // Buscar o bairro do usuário
        const { data: userNeighborhoods, error: unError } = await supabase
          .from('user_neighborhoods')
          .select('neighborhood_id')
          .eq('user_id', userId)
          .limit(1);
        if (unError) throw unError;
        const neighborhoodId = userNeighborhoods?.[0]?.neighborhood_id;
        if (!neighborhoodId) {
          setLevelDist({ bronze: 0, silver: 0, gold: 0 });
          setLevelDistLoading(false);
          return;
        }
        // Buscar distribuição de níveis do bairro
        const { data, error: distError } = await supabase
          .from('neighborhood_level_distribution')
          .select('current_level, total')
          .eq('neighborhood_id', neighborhoodId);
        if (distError) throw distError;
        // Mapear para bronze, prata, ouro
        const bronze = data?.find(l => l.current_level === '1' || l.current_level === 'bronze')?.total || 0;
        const silver = data?.find(l => l.current_level === '2' || l.current_level === 'silver')?.total || 0;
        const gold   = data?.find(l => l.current_level === '3' || l.current_level === 'gold')?.total || 0;
        setLevelDist({ bronze, silver, gold });
      } catch (err) {
        setLevelDistError('Erro ao buscar distribuição de níveis do bairro');
        setLevelDist({ bronze: 0, silver: 0, gold: 0 });
      } finally {
        setLevelDistLoading(false);
      }
    }
    if (userId) fetchLevelDist();
  }, [userId]);

  // Buscar materiais coletados do usuário e média do bairro
  useEffect(() => {
    async function fetchMaterials() {
      setMaterialsLoading(true);
      setMaterialsError(null);
      try {
        // Buscar bairro do usuário
        const { data: userNeighborhoods, error: unError } = await supabase
          .from('user_neighborhoods')
          .select('neighborhood_id')
          .eq('user_id', userId)
          .limit(1);
        if (unError) throw unError;
        const neighborhoodId = userNeighborhoods?.[0]?.neighborhood_id;
        // Buscar materiais do usuário
        const { data: userCollections, error: ucError } = await supabase
          .from('collections')
          .select('materials')
          .eq('solicitante_id', userId);
        if (ucError) throw ucError;
        // Somar materiais do usuário
        const userMat: Record<string, number> = {};
        (userCollections || []).forEach(c => {
          (c.materials || []).forEach((m: any) => {
            userMat[m.material_id] = (userMat[m.material_id] || 0) + (m.quantity || 0);
          });
        });
        setUserMaterials(userMat);
        // Buscar materiais do bairro
        if (neighborhoodId) {
          const { data: neighUsers, error: nuError } = await supabase
            .from('user_neighborhoods')
            .select('user_id')
            .eq('neighborhood_id', neighborhoodId);
          if (nuError) throw nuError;
          const userIds = (neighUsers || []).map(u => u.user_id);
          if (userIds.length > 0) {
            const { data: neighCollections, error: ncError } = await supabase
              .from('collections')
              .select('materials,solicitante_id')
              .in('solicitante_id', userIds);
            if (ncError) throw ncError;
            const neighMat: Record<string, number> = {};
            (neighCollections || []).forEach(c => {
              (c.materials || []).forEach((m: any) => {
                neighMat[m.material_id] = (neighMat[m.material_id] || 0) + (m.quantity || 0);
              });
            });
            // Calcular média por usuário do bairro
            Object.keys(neighMat).forEach(k => {
              neighMat[k] = neighMat[k] / userIds.length;
            });
            setNeighMaterials(neighMat);
          } else {
            setNeighMaterials({});
          }
        } else {
          setNeighMaterials({});
        }
      } catch (err) {
        setMaterialsError('Erro ao buscar materiais reciclados');
        setUserMaterials({});
        setNeighMaterials({});
      } finally {
        setMaterialsLoading(false);
      }
    }
    if (userId) fetchMaterials();
  }, [userId]);

  // Se não houver userId, mostrar mensagem de erro
  if (!userId) {
    return (
      <Layout>
        <div className="container py-6 px-4 md:px-6">
          <div className="text-center text-red-500 py-8">
            Nenhum usuário selecionado. Volte ao dashboard e selecione um perfil.
          </div>
        </div>
      </Layout>
    );
  }

  // Usar dados reais
  const { achievements, ranking, coletasStats, reciclagemStats, loading, error } = useAchievements(userId);
  
  // Dados calculados
  const totalUnlocked = achievements.filter(a => a.unlockedAt).length;
  const totalPoints = achievements
    .filter(a => a.unlockedAt)
    .reduce((sum, a) => sum + a.points, 0);

  // Efeito para rolar para o topo quando o componente montar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = {
    coletas: 'Coletas',
    reciclagem: 'Volume de Reciclagem',
    avaliacoes: 'Avaliações',
    impacto: 'Impacto Ambiental',
    engajamento: 'Engajamento'
  };

  const getStatusIcon = (achievement: Achievement) => {
    if (achievement.unlockedAt) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    if (achievement.progress && achievement.progress > 0) {
      return <Timer className="h-4 w-4 text-yellow-500" />;
    }
    return <Lock className="h-4 w-4 text-gray-400" />;
  };

  // Dados mock para estatísticas do bairro (temporário até migrar completamente)
  // Remover mockRanking, mockNeighborhoodStats, mockUserStats

  const totalNiveis = (levelDist?.bronze || 0) + (levelDist?.silver || 0) + (levelDist?.gold || 0);
  const bronze = levelDist?.bronze || 0;
  const prata = levelDist?.silver || 0;
  const ouro = levelDist?.gold || 0;
  const bronzeAngle = (bronze / totalNiveis) * 360;
  const prataAngle = (prata / totalNiveis) * 360;
  const ouroAngle = (ouro / totalNiveis) * 360;
  
  function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    const start = {
      x: cx + r * Math.cos((Math.PI / 180) * (startAngle - 90)),
      y: cy + r * Math.sin((Math.PI / 180) * (startAngle - 90))
    };
    const end = {
      x: cx + r * Math.cos((Math.PI / 180) * (endAngle - 90)),
      y: cy + r * Math.sin((Math.PI / 180) * (endAngle - 90))
    };
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      `M ${cx} ${cy}`,
      `L ${start.x} ${start.y}`,
      `A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
      "Z"
    ].join(" ");
  }
  
  let startPie = 0;
  const piePaths = [
    {
      color: '#FFD700', // Ouro
      value: ouro,
      angle: ouroAngle
    },
    {
      color: '#C0C0C0', // Prata
      value: prata,
      angle: prataAngle
    },
    {
      color: '#CD7F32', // Bronze
      value: bronze,
      angle: bronzeAngle
    }
  ].map((slice, i) => {
    const path = describeArc(20, 20, 18, startPie, startPie + slice.angle);
    const el = <path key={i} d={path} fill={slice.color} fillOpacity="0.85" />;
    startPie += slice.angle;
    return el;
  });

  // Verificar se está carregando
  if (loading) {
    return (
      <Layout>
        <div className="container py-6 px-4 md:px-6">
          <div className="text-center py-8">Carregando conquistas...</div>
        </div>
      </Layout>
    );
  }

  // Verificar se há erro
  if (error) {
    return (
      <Layout>
        <div className="container py-6 px-4 md:px-6">
          <div className="text-center text-red-500 py-8">
            Erro ao carregar conquistas: {error}
          </div>
        </div>
      </Layout>
    );
  }

  // Se não houver conquistas, mostrar mensagem amigável
  // Dentro dos cards, onde exibe conquistas, ranking, estatísticas, etc, adicionar:
  // Se não houver dados, mostrar mensagem amigável específica para aquele card.
  // Exemplo para conquistas:
  // Fatores de impacto padronizados (mesmos da calculadora)
  const impactFactors = {
    papel:    { water: 31, energy: 4.2, trees: 0.017, co2: 2.8 },
    plastico: { water: 35, energy: 6.5, trees: 0,     co2: 3.5 },
    vidro:    { water: 8,  energy: 2.5, trees: 0,     co2: 0.6 },
    metal:    { water: 15, energy: 12,  trees: 0,     co2: 4.5 },
    aluminio: { water: 22, energy: 15,  trees: 0,     co2: 5.2 },
    cobre:    { water: 28, energy: 13,  trees: 0,     co2: 4.2 },
    oleo:     { water: 50, energy: 11,  trees: 0,     co2: 4.8 },
    eletronico: { water: 45, energy: 14, trees: 0,    co2: 5.8 },
    pilhas:   { water: 0,  energy: 0,   trees: 0,     co2: 0 },
    lampadas: { water: 0,  energy: 0,   trees: 0,     co2: 0 },
    organico: { water: 4,  energy: 1,   trees: 0.01,  co2: 0.4 },
    outros:   { water: 0,  energy: 0,   trees: 0,     co2: 0 },
  };

  // Função para calcular impacto total
  function calcularImpacto(materials: Record<string, number>) {
    let co2 = 0, water = 0, energy = 0, trees = 0;
    Object.entries(materials).forEach(([matId, qty]) => {
      const f = impactFactors[matId as keyof typeof impactFactors];
      if (!f) return;
      co2 += (f.co2 || 0) * qty;
      water += (f.water || 0) * qty;
      energy += (f.energy || 0) * qty;
      trees += (f.trees || 0) * qty;
    });
    return { co2, water, energy, trees };
  }

  // Calcular impacto do usuário e do bairro
  const userImpact = calcularImpacto(userMaterials);
  const neighImpact = calcularImpacto(neighMaterials);

  return (
    <Layout>
      <div className="container py-6 px-4 md:px-6">
        {/* Botão Voltar */}
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        {/* Visão Geral */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-neutro" />
              Visão Geral das Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(!achievements || achievements.length === 0) ? (
              <div className="text-center text-muted-foreground py-8">
                Nenhuma conquista encontrada ainda.<br />
                Participe de coletas, recicle materiais e avalie para desbloquear conquistas!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Conquistas Desbloqueadas</p>
                  <p className="text-xl font-bold mt-1">{totalUnlocked}/{achievements.length}</p>
                  <Progress value={(totalUnlocked / achievements.length) * 100} className="h-2 mt-2" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pontos Acumulados</p>
                  <p className="text-xl font-bold mt-1">{totalPoints}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comparativos do Bairro */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Comparativos do Bairro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Distribuição de Níveis */}
              <div>
                <h4 className="text-sm font-semibold mb-4">Distribuição de Níveis</h4>
                <div className="flex items-center gap-6">
                  {levelDistLoading ? (
                    <div>Carregando distribuição de níveis...</div>
                  ) : levelDistError ? (
                    <div className="text-red-500">{levelDistError}</div>
                  ) : (totalNiveis === 0 ? (
                    <div className="text-muted-foreground">Ainda não há usuários com conquistas neste bairro.</div>
                  ) : (
                    // Gráfico de Pizza SVG
                    <svg width="80" height="80" viewBox="0 0 40 40" className="block">
                      {piePaths}
                      <circle cx="20" cy="20" r="10" fill="#fff" />
                    </svg>
                  ))}
                  {/* Legenda */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full" style={{ background: '#CD7F32' }}></span>
                      <span className="text-xs">Bronze</span>
                      <span className="text-xs font-semibold">{levelDistLoading ? '0%' : totalNiveis === 0 ? '0%' : `${(bronze / totalNiveis) * 100}%`}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full" style={{ background: '#C0C0C0' }}></span>
                      <span className="text-xs">Prata</span>
                      <span className="text-xs font-semibold">{levelDistLoading ? '0%' : totalNiveis === 0 ? '0%' : `${(prata / totalNiveis) * 100}%`}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full" style={{ background: '#FFD700' }}></span>
                      <span className="text-xs">Ouro</span>
                      <span className="text-xs font-semibold">{levelDistLoading ? '0%' : totalNiveis === 0 ? '0%' : `${(ouro / totalNiveis) * 100}%`}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Média de Materiais */}
              <div>
                <h4 className="text-sm font-semibold mb-4">Média de Materiais Reciclados (kg)</h4>
                <div className="space-y-3">
                  {/* Legenda */}
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-neutro"></div>
                      <span className="text-xs text-muted-foreground">Sua coleta</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-neutro/20"></div>
                      <span className="text-xs text-muted-foreground">Média do bairro</span>
                    </div>
                  </div>

                  {materialsLoading ? (
                    <div>Carregando materiais reciclados...</div>
                  ) : materialsError ? (
                    <div className="text-red-500">{materialsError}</div>
                  ) : (Object.keys(userMaterials).length === 0 && Object.keys(neighMaterials).length === 0 ? (
                    <div className="text-muted-foreground">Nenhum material reciclado ainda.</div>
                  ) : (
                    Object.entries(materialDisplayData).map(([materialId, mat]) => {
                      const userAmount = userMaterials[materialId] || 0;
                      const average = neighMaterials[materialId] || 0;
                      const userPercentage = average > 0 ? (userAmount / average) * 100 : 0;
                      const Icon = mat.icone;
                      return (
                        <div key={materialId} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-sm flex items-center gap-2 ${mat.cor}`}>
                              <Icon className={`w-4 h-4 ${mat.cor}`} />
                              {mat.nome}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${mat.cor}`}>{userAmount}kg</span>
                              <span className="text-xs text-muted-foreground">de {average}kg</span>
                            </div>
                          </div>
                          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="absolute h-full bg-neutro/20" 
                              style={{ width: '100%' }}
                            />
                            <div 
                              className="absolute h-full bg-neutro" 
                              style={{ width: `${userPercentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas de Impacto */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Métricas de Impacto</CardTitle>
          </CardHeader>
          <CardContent>
            {(Object.keys(userMaterials).length === 0) ? (
              <div className="text-muted-foreground">Nenhuma métrica de impacto disponível ainda.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center">
                  <Droplets className="h-6 w-6 text-blue-400 mb-1" />
                  <span className="text-lg font-bold">{userImpact.water.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}L</span>
                  <span className="text-xs text-muted-foreground">Água Preservada</span>
                </div>
                <div className="flex flex-col items-center">
                  <Zap className="h-6 w-6 text-yellow-400 mb-1" />
                  <span className="text-lg font-bold">{userImpact.energy.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}kWh</span>
                  <span className="text-xs text-muted-foreground">Energia Economizada</span>
                </div>
                <div className="flex flex-col items-center">
                  <Trees className="h-6 w-6 text-green-600 mb-1" />
                  <span className="text-lg font-bold">{userImpact.trees.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</span>
                  <span className="text-xs text-muted-foreground">Árvores Preservadas</span>
                </div>
                <div className="flex flex-col items-center">
                  <Wind className="h-6 w-6 text-cyan-600 mb-1" />
                  <span className="text-lg font-bold">{userImpact.co2.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}kg</span>
                  <span className="text-xs text-muted-foreground">CO₂ Evitado</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ranking e Comparação */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Ranking e Comparação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ranking.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum ranking disponível ainda.
                </div>
              ) : (
                ranking.map((user) => (
                  <div 
                    key={user.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      user.isUser ? 'bg-neutro/5 border border-neutro/20' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        user.position === 1 ? 'bg-yellow-100 text-yellow-700' :
                        user.position === 2 ? 'bg-gray-100 text-gray-700' :
                        user.position === 3 ? 'bg-orange-100 text-orange-700' :
                        user.isUser ? 'bg-neutro/10 text-neutro' : 'bg-muted'
                      }`}>
                        {user.position <= 3 ? user.avatar : user.position}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`font-medium ${user.isUser ? 'text-neutro' : ''}`}>{user.name}</p>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              user.level === 'gold' ? 'bg-yellow-100 text-yellow-700' :
                              user.level === 'silver' ? 'bg-gray-100 text-gray-700' :
                              'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {user.level === 'gold' ? 'Ouro' : user.level === 'silver' ? 'Prata' : 'Bronze'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-muted-foreground">{user.points} pts</p>
                          <span className="text-xs text-muted-foreground">•</span>
                          <p className="text-xs text-muted-foreground">
                            Última atividade: {user.lastActivity ? new Date(user.lastActivity).toLocaleDateString('pt-BR') : 'Nunca'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.position === 1 && <Trophy className="h-4 w-4 text-yellow-500" />}
                      {user.position === 2 && <Trophy className="h-4 w-4 text-gray-500" />}
                      {user.position === 3 && <Trophy className="h-4 w-4 text-orange-500" />}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lista de Conquistas por Categoria */}
        {Object.entries(categories).map(([category, title]) => {
          const categoryAchievements = achievements.filter(a => a.category === category);
          if (categoryAchievements.length === 0) return null;

          if (category === 'coletas') {
            // Verificar se coletasStats existe antes de usar
            if (!coletasStats) {
              return (
                <Card key={category} className="mb-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      Dados de coletas não disponíveis
                    </div>
                  </CardContent>
                </Card>
              );
            }

            return (
              <Card key={category} className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Comparação de Coletas no mês */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg flex flex-col items-center">
                        <p className="text-sm text-muted-foreground mb-1">Coletas no mês</p>
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center">
                            <span className="text-xs text-muted-foreground">Você</span>
                            <span className="text-2xl font-bold text-neutro">{coletasStats.individual.esteMes}</span>
                          </div>
                          <span className="text-lg font-bold text-muted-foreground">|</span>
                          <div className="flex flex-col items-center">
                            <span className="text-xs text-muted-foreground">Bairro</span>
                            <span className="text-2xl font-bold">{coletasStats.bairro.mediaMensal}</span>
                          </div>
                        </div>
                      </div>
                      {/* Comparação de Coletas acumuladas */}
                      <div className="p-4 bg-muted/50 rounded-lg flex flex-col items-center">
                        <p className="text-sm text-muted-foreground mb-1">Coletas acumuladas (média do bairro)</p>
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center">
                            <span className="text-xs text-muted-foreground">Você</span>
                            <span className="text-2xl font-bold text-neutro">{coletasStats.individual.total}</span>
                          </div>
                          <span className="text-lg font-bold text-muted-foreground">|</span>
                          <div className="flex flex-col items-center">
                            <span className="text-xs text-muted-foreground">Média do bairro</span>
                            <span className="text-2xl font-bold">{coletasStats.bairro.mediaColetas}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Meta Comunitária */}
                    <div className="p-4 bg-neutro/5 rounded-lg border border-neutro/20">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Meta Comunitária</h4>
                        <Badge variant="secondary" className="bg-neutro/10 text-neutro">
                          {coletasStats.metasComunitarias.progresso}% completo
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{coletasStats.metasComunitarias.metaAtual}</p>
                      <Progress value={coletasStats.metasComunitarias.progresso} className="h-2" />
                      <div className="flex items-center justify-end mt-2">
                        <p className="text-xs text-muted-foreground">
                          Prazo: {new Date(coletasStats.metasComunitarias.dataLimite).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    {/* Ranking do Bairro */}
                    <div>
                      <h4 className="text-sm font-semibold mb-4">Ranking do Bairro</h4>
                      <div className="space-y-2">
                        {coletasStats.bairro.ranking.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            Nenhum ranking disponível ainda.
                          </div>
                        ) : (
                          coletasStats.bairro.ranking.map((user, index) => (
                            <div 
                              key={index}
                              className={`flex items-center justify-between p-3 rounded-lg ${
                                user.isUser ? 'bg-neutro/5 border border-neutro/20' : 'hover:bg-muted/50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                  index === 1 ? 'bg-gray-100 text-gray-700' :
                                  index === 2 ? 'bg-orange-100 text-orange-700' :
                                  user.isUser ? 'bg-neutro/10 text-neutro' : 'bg-muted'
                                }`}>
                                  {user.avatar}
                                </div>
                                <div>
                                  <p className={`font-medium ${user.isUser ? 'text-neutro' : ''}`}>{user.nome}</p>
                                  <p className="text-xs text-muted-foreground">{user.coletas} coletas</p>
                                </div>
                              </div>
                              {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }
          if (category === 'reciclagem') {
            // Verificar se reciclagemStats existe antes de usar
            if (!reciclagemStats) {
              return (
                <Card key={category} className="mb-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      Dados de reciclagem não disponíveis
                    </div>
                  </CardContent>
                </Card>
              );
            }

            return (
              <Card key={category} className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Comparação de Reciclado no mês */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg flex flex-col items-center">
                        <p className="text-sm text-muted-foreground mb-1">Reciclado no mês</p>
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center">
                            <span className="text-xs text-muted-foreground">Você</span>
                            <span className="text-2xl font-bold text-neutro">{reciclagemStats.individual.esteMes}kg</span>
                          </div>
                          <span className="text-lg font-bold text-muted-foreground">|</span>
                          <div className="flex flex-col items-center">
                            <span className="text-xs text-muted-foreground">Média do bairro</span>
                            <span className="text-2xl font-bold">{reciclagemStats.bairro.mediaMensal}kg</span>
                          </div>
                        </div>
                      </div>
                      {/* Comparação de Reciclado acumulado */}
                      <div className="p-4 bg-muted/50 rounded-lg flex flex-col items-center">
                        <p className="text-sm text-muted-foreground mb-1">Reciclado acumulado (média do bairro)</p>
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center">
                            <span className="text-xs text-muted-foreground">Você</span>
                            <span className="text-2xl font-bold text-neutro">{reciclagemStats.individual.total}kg</span>
                          </div>
                          <span className="text-lg font-bold text-muted-foreground">|</span>
                          <div className="flex flex-col items-center">
                            <span className="text-xs text-muted-foreground">Média do bairro</span>
                            <span className="text-2xl font-bold">{reciclagemStats.bairro.mediaTotal}kg</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Distribuição de Materiais */}
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="text-sm font-semibold mb-4">Distribuição de Materiais</h4>
                      <div className="space-y-3">
                        {Object.entries(reciclagemStats.individual.materiais).length === 0 ? (
                          <div className="text-muted-foreground">Nenhum material reciclado ainda.</div>
                        ) : (
                          Object.entries(reciclagemStats.individual.materiais).map(([material, quantidade]) => {
                            const mediaBairro = reciclagemStats.bairro.mediaMensal / 4; // Exemplo: dividir igualmente
                            return (
                              <div key={material} className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm capitalize">{material}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-neutro">{quantidade}kg</span>
                                    <span className="text-xs text-muted-foreground">de {mediaBairro}kg (média bairro)</span>
                                  </div>
                                </div>
                                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className="absolute h-full bg-neutro/20" 
                                    style={{ width: '100%' }}
                                  />
                                  <div 
                                    className="absolute h-full bg-neutro" 
                                    style={{ width: `${(quantidade / mediaBairro) * 100}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Meta Comunitária */}
                    <div className="p-4 bg-neutro/5 rounded-lg border border-neutro/20">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Meta Comunitária</h4>
                        <Badge variant="secondary" className="bg-neutro/10 text-neutro">
                          {reciclagemStats.metasComunitarias.progresso}% completo
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{reciclagemStats.metasComunitarias.metaAtual}</p>
                      <Progress value={reciclagemStats.metasComunitarias.progresso} className="h-2" />
                      <div className="flex items-center justify-end mt-2">
                        <p className="text-xs text-muted-foreground">
                          Prazo: {new Date(reciclagemStats.metasComunitarias.dataLimite).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    {/* Ranking do Bairro */}
                    <div>
                      <h4 className="text-sm font-semibold mb-4">Ranking do Bairro</h4>
                      <div className="space-y-2">
                        {reciclagemStats.bairro.ranking.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            Nenhum ranking disponível ainda.
                          </div>
                        ) : (
                          reciclagemStats.bairro.ranking.map((user, index) => (
                            <div 
                              key={index}
                              className={`flex items-center justify-between p-3 rounded-lg ${
                                user.isUser ? 'bg-neutro/5 border border-neutro/20' : 'hover:bg-muted/50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                  index === 1 ? 'bg-gray-100 text-gray-700' :
                                  index === 2 ? 'bg-orange-100 text-orange-700' :
                                  user.isUser ? 'bg-neutro/10 text-neutro' : 'bg-muted'
                                }`}>
                                  {user.avatar}
                                </div>
                                <div>
                                  <p className={`font-medium ${user.isUser ? 'text-neutro' : ''}`}>{user.nome}</p>
                                  <p className="text-xs text-muted-foreground">{user.volume}kg reciclados</p>
                                </div>
                              </div>
                              {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }
          if (category === 'impacto') {
            return (
              <Card key={category} className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* CO₂ Evitado */}
                    <div>
                      <h4 className="text-sm font-semibold mb-4">CO₂ Evitado</h4>
                      <div className="space-y-2">
                        {userImpact.co2 === 0 && neighImpact.co2 === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            Ainda não há dados de impacto ambiental disponíveis.
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Média dos usuários do bairro</span>
                              <span className="text-sm">{neighImpact.co2.toFixed(1)}kg</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Seu Impacto</span>
                              <span className="text-sm font-medium text-green-600">{userImpact.co2.toFixed(1)}kg</span>
                            </div>
                            <Progress 
                              value={neighImpact.co2 > 0 ? (userImpact.co2 / neighImpact.co2) * 100 : 0} 
                              className="h-2" 
                            />
                            <p className="text-xs mt-1">
                              {userImpact.co2 > neighImpact.co2
                                ? 'Parabéns! Você está acima da média do bairro.'
                                : userImpact.co2 === neighImpact.co2
                                ? 'Você está na média do bairro.'
                                : 'Continue! Você está abaixo da média do bairro.'}
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Água Economizada */}
                    <div>
                      <h4 className="text-sm font-semibold mb-4">Água Economizada</h4>
                      <div className="space-y-2">
                        {userImpact.water === 0 && neighImpact.water === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            Ainda não há dados de impacto ambiental disponíveis.
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Média dos usuários do bairro</span>
                              <span className="text-sm">{neighImpact.water.toFixed(1)}L</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Seu Impacto</span>
                              <span className="text-sm font-medium text-green-600">{userImpact.water.toFixed(1)}L</span>
                            </div>
                            <Progress 
                              value={neighImpact.water > 0 ? (userImpact.water / neighImpact.water) * 100 : 0} 
                              className="h-2" 
                            />
                            <p className="text-xs mt-1">
                              {userImpact.water > neighImpact.water
                                ? 'Parabéns! Você está acima da média do bairro.'
                                : userImpact.water === neighImpact.water
                                ? 'Você está na média do bairro.'
                                : 'Continue! Você está abaixo da média do bairro.'}
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Energia Economizada */}
                    <div>
                      <h4 className="text-sm font-semibold mb-4">Energia Economizada</h4>
                      <div className="space-y-2">
                        {userImpact.energy === 0 && neighImpact.energy === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            Ainda não há dados de impacto ambiental disponíveis.
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Média dos usuários do bairro</span>
                              <span className="text-sm">{neighImpact.energy.toFixed(1)}kWh</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Seu Impacto</span>
                              <span className="text-sm font-medium text-green-600">{userImpact.energy.toFixed(1)}kWh</span>
                            </div>
                            <Progress 
                              value={neighImpact.energy > 0 ? (userImpact.energy / neighImpact.energy) * 100 : 0} 
                              className="h-2" 
                            />
                            <p className="text-xs mt-1">
                              {userImpact.energy > neighImpact.energy
                                ? 'Parabéns! Você está acima da média do bairro.'
                                : userImpact.energy === neighImpact.energy
                                ? 'Você está na média do bairro.'
                                : 'Continue! Você está abaixo da média do bairro.'}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }
          return null;
        })}
      </div>
    </Layout>
  );
};

export default Achievements; 