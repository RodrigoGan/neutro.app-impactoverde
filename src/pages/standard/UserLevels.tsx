import React, { useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Star, Package, Recycle, Calendar, ChevronLeft, Trophy, Award, CheckCircle2, Users, Truck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import { userLevels } from '@/components/levels/levelsData';
import { PointsGuide, pointsData, PointsTable } from '@/components/levels/PointsGuide';
import { supabase } from '@/lib/supabaseClient';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';

interface Goal {
  id: string;
  title: string;
  description: string;
  currentProgress: number;
  total: number;
  points: number;
  icon: string;
}

const getIconComponent = (iconName: string) => {
  const icons: { [key: string]: React.ReactNode } = {
    Package: <Package className="h-5 w-5 text-neutro" />,
    Recycle: <Recycle className="h-5 w-5 text-neutro" />,
    Star: <Star className="h-5 w-5 text-neutro" />,
    Target: <Target className="h-5 w-5 text-neutro" />,
    CheckCircle2: <CheckCircle2 className="h-5 w-5 text-neutro" />,
    Users: <Users className="h-5 w-5 text-neutro" />,
    Truck: <Truck className="h-5 w-5 text-neutro" />,
    Clock: <Clock className="h-5 w-5 text-neutro" />
  };
  return icons[iconName] || <Target className="h-5 w-5 text-neutro" />;
};

// Função utilitária para mapear label para value
const levelLabelToValue = (label: string) => {
  const map: Record<string, string> = {
    'bronze': 'bronze',
    'prata': 'silver',
    'ouro': 'gold',
    'bronzeado': 'bronze',
    'silver': 'silver',
    'gold': 'gold'
  };
  return map[label.trim().toLowerCase()] || 'bronze';
};

// Função para retornar o ícone e cor do avatar conforme o nível
const getLevelAvatar = (levelValue: string) => {
  switch (levelValue) {
    case 'gold':
      return { icon: <Trophy className="h-8 w-8 text-yellow-400" />, bg: 'bg-yellow-100 border-yellow-400' };
    case 'silver':
      return { icon: <Trophy className="h-8 w-8 text-gray-400" />, bg: 'bg-gray-100 border-gray-400' };
    case 'bronze':
    default:
      return { icon: <Trophy className="h-8 w-8 text-orange-500" />, bg: 'bg-orange-100 border-orange-500' };
  }
};

// Função para garantir nome do nível correto
const getLevelName = (label: string | number) => {
  if (typeof label === 'number') {
    switch (label) {
      case 1: return 'Bronze';
      case 2: return 'Prata';
      case 3: return 'Ouro';
      default: return 'Bronze';
    }
  }
  const l = (label || '').toString().toLowerCase();
  if (l.includes('bronze')) return 'Bronze';
  if (l.includes('prata') || l.includes('silver')) return 'Prata';
  if (l.includes('ouro') || l.includes('gold')) return 'Ouro';
  return 'Bronze';
};

// Mapeamento dos requisitos para português
const requisitoLabelPt: Record<string, string> = {
  collections: 'Coletas',
  kg: 'Kg reciclados',
  sales: 'Vendas',
  months: 'Meses de atividade',
  ratings: 'Avaliações',
  activeCoupons: 'Cupons ativos',
  points: 'Pontos',
  activeCollectors: 'Coletores ativos'
};

const UserLevels: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userType, userLevel, currentPoints, nextLevelPoints, monthlyGoals } = location.state || {};

  const [progressData, setProgressData] = React.useState<any>(null);
  const [monthlyGoalsData, setMonthlyGoalsData] = React.useState<Goal[]>([]);
  const [loading, setLoading] = React.useState(true);
  // Adicionar estado para expandir benefícios
  const [showAllBenefits, setShowAllBenefits] = React.useState(false);
  // Adicionar ref para o card a ser capturado
  const shareRef = React.useRef<HTMLDivElement>(null);
  // Adicionar estado para controlar visibilidade do card compartilhável
  const [showShareCard, setShowShareCard] = React.useState(false);
  const { toast } = useToast();

  // Se não houver dados do usuário, redireciona para o dashboard
  useEffect(() => {
    window.scrollTo(0, 0);
    if (!userType || !userLevel) {
      navigate('/dashboard/standard');
    }
  }, [userType, userLevel, navigate]);

  useEffect(() => {
    async function fetchProgress() {
      setLoading(true);
      try {
        if (!location.state?.userId) throw new Error('Usuário não informado');
        // Buscar progresso do usuário
        const { data: progress, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', location.state.userId)
          .single();
        // Buscar metas mensais
        const { data: goals, error: goalsError } = await supabase
          .from('monthly_goals')
          .select('*')
          .eq('user_id', location.state.userId)
          .order('month_year', { ascending: false });
        if (progressError) throw progressError;
        if (goalsError) throw goalsError;
        setProgressData(progress);
        setMonthlyGoalsData((goals || []).map(goal => ({
          id: goal.id,
          title: goal.goal_type,
          description: '', // Adapte se houver descrição no banco
          currentProgress: goal.current_value,
          total: goal.target_value,
          points: goal.points_reward,
          icon: 'Target', // Ou outro ícone conforme o tipo
        })));
      } catch (error) {
        setProgressData(null);
        setMonthlyGoalsData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProgress();
  }, [location.state?.userId]);

  // Função para obter as metas padrão do tipo de usuário (apenas estrutura, progresso zero)
  const getDefaultGoals = () => {
    // Exemplo: pode ser customizado por tipo de usuário
    return [
      { id: 'collections', title: 'Coletas Realizadas', description: 'Realize 8 coletas este mês', currentProgress: 0, total: 8, points: 50, icon: 'Package' },
      { id: 'kg', title: 'Kg Reciclados', description: 'Recicle 50kg de materiais', currentProgress: 0, total: 50, points: 30, icon: 'Recycle' },
      { id: 'ratings', title: 'Avaliações', description: 'Receba 3 avaliações positivas', currentProgress: 0, total: 3, points: 20, icon: 'Star' },
      { id: 'months', title: 'Meses de Atividade', description: 'Mantenha-se ativo por 1 mês', currentProgress: 0, total: 1, points: 10, icon: 'Calendar' }
    ];
  };

  const goalsData = (progressData && monthlyGoalsData.length > 0)
    ? { monthlyGoals: monthlyGoalsData }
    : { monthlyGoals: getDefaultGoals() };

  // Determinar perfil para tabela de pontos
  const pointsProfile = userType === 'individual_collector' ? 'collector' : userType === 'cooperative_owner' ? 'cooperative' : userType === 'collector_company_owner' ? 'company' : userType === 'partner_owner' ? 'partner' : 'common';

  // Função para checar se é o nível máximo
  const isMaxLevel = () => {
    const levels = Object.values(userLevels[pointsProfile] || {});
    if (!levels.length) return false;
    // Considera o último nível do array como o máximo
    const maxLevel = levels[levels.length - 1];
    return maxLevel && maxLevel.name === userLevel.label;
  };

  if (loading) {
    return <Layout><div className="container mx-auto p-4 text-center">Carregando metas e progresso...</div></Layout>;
  }

  return (
    <Layout>
      {/* Bloco oculto para compartilhamento (Jpeg) */}
      {showShareCard && (
        <div
          ref={shareRef}
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 0,
            width: 600,
            background: '#fff',
            zIndex: 9999,
            padding: 24,
            borderRadius: 16,
            boxShadow: '0 2px 16px rgba(0,0,0,0.08)'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
            <img src="/logo-neutro.png" alt="Neutro" style={{ height: 56, marginBottom: 8 }} />
            <span style={{ fontSize: 18, fontWeight: 600, color: '#1a7f37', textAlign: 'center' }}>Pequenos Gestos, Grandes Impactos</span>
          </div>
          {/* Card do Nível (sem botões) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            {(() => {
              const levelValue = userLevel.value || levelLabelToValue(userLevel.label);
              const { icon, bg } = getLevelAvatar(levelValue);
              return (
                <div style={{ padding: 12, borderRadius: '50%', border: '2px solid #e5e7eb', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
              );
            })()}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20, fontWeight: 700 }}>Nível {getLevelName(userLevel.label)}</span>
                <span style={{ background: '#e6f4ea', color: '#1a7f37', borderRadius: 6, padding: '2px 10px', fontWeight: 600, fontSize: 16 }}>{progressData?.total_points ?? currentPoints} pts</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {Array.isArray(userLevels[pointsProfile]?.[userLevel.value || levelLabelToValue(userLevel.label)]?.benefits.features) &&
                  (userLevels[pointsProfile]?.[userLevel.value || levelLabelToValue(userLevel.label)]?.benefits.features as string[]).slice(0, 3).map((feature, idx) => (
                    <span key={idx} style={{ background: '#e6f4ea', color: '#1a7f37', borderRadius: 6, padding: '2px 8px', fontSize: 13, fontWeight: 500 }}>{feature}</span>
                  ))}
                {Array.isArray(userLevels[pointsProfile]?.[userLevel.value || levelLabelToValue(userLevel.label)]?.benefits.features) &&
                  (userLevels[pointsProfile]?.[userLevel.value || levelLabelToValue(userLevel.label)]?.benefits.features as string[]).length > 3 && (
                    <span style={{ color: '#1a7f37', fontSize: 13, textDecoration: 'underline', cursor: 'pointer' }}>+ mais</span>
                  )}
              </div>
            </div>
          </div>
          {/* Metas e Progressos */}
          <div style={{ marginBottom: 8 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Metas e Progressos</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {goalsData.monthlyGoals.map((goal: Goal) => (
                <div key={goal.id} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fafafa' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 16, color: '#1a7f37', marginBottom: 4 }}>
                    {getIconComponent(goal.icon)} {goal.title}
                  </div>
                  <div style={{ fontSize: 14, color: '#444', marginBottom: 6 }}>{goal.description}</div>
                  <div style={{ fontSize: 13, color: '#888', marginBottom: 2 }}>Progresso</div>
                  <div style={{ fontSize: 13, color: '#1a7f37', fontWeight: 600 }}>{goal.currentProgress}/{goal.total}</div>
                  <div style={{ height: 6, background: '#e6f4ea', borderRadius: 3, margin: '6px 0' }}>
                    <div style={{ width: `${(goal.currentProgress / goal.total) * 100}%`, height: 6, background: '#1a7f37', borderRadius: 3 }} />
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 12, color: '#1a7f37', fontWeight: 500 }}>{goal.points} pontos</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Conteúdo visível da página (sem alterações) */}
      <div className="container mx-auto p-4 space-y-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        {/* Card do Nível Atual - COMPACTO (sempre visível) */}
        <div className="flex items-center gap-4 mb-4">
          {(() => {
            const levelValue = userLevel.value || levelLabelToValue(userLevel.label);
            const { icon, bg } = getLevelAvatar(levelValue);
            return (
              <div className={`p-3 rounded-full border-2 shadow ${bg} flex items-center justify-center`}>
                {icon}
              </div>
            );
          })()}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">Nível {getLevelName(userLevel.label)}</span>
              <Badge variant="secondary" className="bg-neutro/10 text-neutro text-base">{progressData?.total_points ?? currentPoints} pts</Badge>
              {nextLevelPoints > (progressData?.total_points ?? currentPoints) && (
                <span className="text-xs text-muted-foreground ml-2">Faltam <b>{nextLevelPoints - (progressData?.total_points ?? currentPoints)}</b> pts</span>
              )}
            </div>
            {nextLevelPoints > (progressData?.total_points ?? currentPoints) && (
              <Progress value={(progressData?.total_points ?? currentPoints / nextLevelPoints) * 100} className="h-2 mt-1" />
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {Array.isArray(userLevels[pointsProfile]?.[userLevel.value || levelLabelToValue(userLevel.label)]?.benefits.features) &&
                (showAllBenefits
                  ? (userLevels[pointsProfile]?.[userLevel.value || levelLabelToValue(userLevel.label)]?.benefits.features as string[])
                  : (userLevels[pointsProfile]?.[userLevel.value || levelLabelToValue(userLevel.label)]?.benefits.features as string[]).slice(0, 3)
                ).map((feature, idx) => (
                  <span key={idx} className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full text-green-800 text-xs font-medium shadow-sm">
                    <Award className="h-3 w-3" /> {feature}
                  </span>
                ))}
              {Array.isArray(userLevels[pointsProfile]?.[userLevel.value || levelLabelToValue(userLevel.label)]?.benefits.features) &&
                (userLevels[pointsProfile]?.[userLevel.value || levelLabelToValue(userLevel.label)]?.benefits.features as string[]).length > 3 && !showAllBenefits && (
                  <span
                    className="text-xs text-muted-foreground cursor-pointer underline"
                    title="Ver todos os benefícios"
                    onClick={() => setShowAllBenefits(true)}
                  >
                    +{(userLevels[pointsProfile]?.[userLevel.value || levelLabelToValue(userLevel.label)]?.benefits.features as string[]).length - 3} mais
                  </span>
                )}
              {showAllBenefits && (
                <span
                  className="text-xs text-muted-foreground cursor-pointer underline"
                  title="Mostrar menos"
                  onClick={() => setShowAllBenefits(false)}
                >
                  Mostrar menos
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="outline" size="icon" title="Baixar Certificado" onClick={() => {}}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
            </Button>
            <Button variant="outline" size="icon" title="Compartilhar" onClick={async () => {
              setShowShareCard(true);
              await new Promise(r => setTimeout(r, 100));
              if (!shareRef.current) return;
              const canvas = await html2canvas(shareRef.current, { backgroundColor: '#fff' });
              setShowShareCard(false);
              canvas.toBlob(async (blob) => {
                if (!blob) return;
                const file = new File([blob], 'meu-nivel-neutro.jpg', { type: 'image/jpeg' });
                const shareText = 'Veja meu nível no Neutro! ... www.neutro.app.br';
                
                // Sempre copia o texto para clipboard primeiro
                try {
                  await navigator.clipboard.writeText(shareText);
                } catch (clipboardError) {
                  console.warn('Erro ao copiar para clipboard:', clipboardError);
                }
                
                // Tenta compartilhar nativamente
                if (navigator.share) {
                  try {
                    // Verifica se o navegador suporta compartilhamento com arquivos
                    if ('canShare' in navigator && navigator.canShare({ files: [file] })) {
                      await navigator.share({
                        title: 'Meu Nível no Neutro',
                        text: shareText,
                        files: [file]
                      });
                      toast({
                        title: 'Compartilhamento',
                        description: 'A frase "Veja meu nível no Neutro! ... www.neutro.app.br" foi copiada para a área de transferência. Cole-a junto com a imagem se necessário.'
                      });
                      return;
                    }
                  } catch (err) {
                    // Se falhar, continua para o fallback
                    console.warn('Falha no compartilhamento nativo:', err);
                  }
                }
                
                // Fallback: download da imagem
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'meu-nivel-neutro.jpg';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                toast({
                  title: 'Compartilhamento',
                  description: 'Imagem salva! A frase "Veja meu nível no Neutro! ... www.neutro.app.br" foi copiada para a área de transferência. Cole-a ao compartilhar a imagem.'
                });
              });
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 8a3 3 0 11-6 0 3 3 0 016 0zm6 8a3 3 0 11-6 0 3 3 0 016 0zm-6 4a3 3 0 11-6 0 3 3 0 016 0zm6-4v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1" /></svg>
            </Button>
          </div>
        </div>

        {/* Metas e Progressos - logo abaixo (continua igual para visualização normal) */}
        <div className="space-y-6 mb-8">
          <h2 className="text-xl font-bold">Metas e Progressos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goalsData.monthlyGoals.map((goal: Goal) => (
              <Card key={goal.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getIconComponent(goal.icon)}
                    {goal.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Progresso</span>
                        <span className="text-xs font-medium">{goal.currentProgress}/{goal.total}</span>
                      </div>
                      <Progress value={(goal.currentProgress / goal.total) * 100} className="h-2" />
                      <div className="flex justify-end">
                        <span className="text-xs text-muted-foreground">{goal.points} pontos</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Como ganhar pontos - colapsável */}
        <details className="mb-6">
          <summary className="cursor-pointer text-base font-semibold text-neutro">Como ganhar pontos</summary>
          <div className="mt-4">
            <PointsTable actions={pointsData[pointsProfile] || []} />
          </div>
        </details>

        {/* Requisitos para o próximo nível - só se houver e não for nível máximo */}
        {!isMaxLevel() && userLevels[pointsProfile] && Object.entries(userLevels[pointsProfile]).some(([levelType, levelData]) => levelData && levelData.name !== userLevel.label && levelData.requirements) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Requisitos para o próximo nível</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(userLevels[pointsProfile] || {}).map(([levelType, levelData]) => (
                  levelData && levelData.name !== userLevel.label && levelData.requirements && typeof levelData.requirements === 'object' &&
                    Object.entries(levelData.requirements).map(([key, value]) => (
                      <li key={key} className="flex items-center gap-2 text-gray-700">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="capitalize">{requisitoLabelPt[key] || key}: <b>{value}</b></span>
                      </li>
                    ))
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Próximos níveis - só se houver e não for nível máximo */}
        {!isMaxLevel() && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-3">Próximos Níveis</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(() => {
                // Obter ordem dos níveis
                const levelsArr = Object.entries(userLevels[pointsProfile] || {});
                const currentLabel = (userLevel.label || '').toLowerCase();
                const currentIdx = levelsArr.findIndex(([, levelData]) => levelData && (levelData.name || '').toLowerCase() === currentLabel);
                // Mostrar apenas níveis acima do atual
                return levelsArr.slice(currentIdx + 1).map(([levelType, levelData]) => (
                  levelData && levelData.name && levelData.benefits && levelData.requirements && (
                    <Card key={levelType} className="border-2 border-dashed border-gray-300">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Trophy className="h-5 w-5" /> Nível {levelData.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-2 text-sm text-muted-foreground">{levelData.description}</div>
                        <div className="mb-2">
                          <h4 className="font-semibold mb-1">Benefícios:</h4>
                          <ul className="list-disc list-inside text-sm">
                            {Array.isArray(levelData.benefits.features) &&
                              (levelData.benefits.features as string[]).map((feature, idx) => (
                                <li key={idx}>{feature}</li>
                              ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Requisitos:</h4>
                          <ul className="list-disc list-inside text-sm">
                            {levelData.requirements && typeof levelData.requirements === 'object' &&
                              Object.entries(levelData.requirements).map(([key, value]) => (
                                <li key={key}>{requisitoLabelPt[key] || key}: <b>{value}</b></li>
                              ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  )
                ));
              })()}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserLevels; 