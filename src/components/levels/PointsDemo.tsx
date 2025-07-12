import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Star, 
  Trophy, 
  TrendingUp, 
  Target,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  LogOut,
  CheckCircle,
  Shield,
  TrendingDown,
  Package
} from 'lucide-react';
import { usePoints } from '@/hooks/usePoints';
import { PointsService } from '@/services/PointsService';
import { getMetricsForUserType, getMetricLabel } from '@/config/userMetrics';
import log from '@/lib/logger';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

export const PointsDemo: React.FC = () => {
  const { progress, addPoints, getPointsTable, refreshProgress, evaluateUserLevel, getLevelNotifications } = usePoints();
  const { user } = useAuth();
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<'common' | 'collector' | 'partner' | 'cooperative' | 'company'>('common');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const pointsTable = getPointsTable();
  const userType = progress?.userType || selectedUserType;
  const metrics = getMetricsForUserType(userType);

  // Log do estado inicial
  React.useEffect(() => {
    log.info('🔍 [PointsDemo] Componente montado:', { 
      hasProgress: !!progress, 
      userType, 
      totalPoints: progress?.totalPoints,
      hasUser: !!user,
      userId: user?.id
    });
  }, [progress, userType, user]);

  const handleAddPoints = async () => {
    if (!selectedAction) {
      setResult({ success: false, message: 'Selecione uma ação' });
      return;
    }

    log.info('🔍 [PointsDemo] Iniciando adição de pontos:', { 
      selectedAction, 
      metadata, 
      userType,
      hasProgress: !!progress 
    });

    setLoading(true);
    try {
      const result = await addPoints(selectedAction, metadata);
      
      log.info('🔍 [PointsDemo] Resultado da adição de pontos:', result);
      
      if (result.success) {
        setResult({ 
          success: true, 
          message: `+${result.pointsAdded} pontos adicionados! Total: ${result.newTotal} pontos` 
        });
        setSelectedAction('');
        setMetadata({});
      } else {
        setResult({ success: false, message: 'Erro ao adicionar pontos' });
      }
    } catch (error) {
      log.error('❌ [PointsDemo] Erro ao adicionar pontos:', error);
      setResult({ success: false, message: `Erro: ${error instanceof Error ? error.message : 'Erro inesperado'}` });
    } finally {
      setLoading(false);
    }
  };

  const handleTestAuth = () => {
    log.info('🔍 [PointsDemo] Teste de autenticação:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      hasProgress: !!progress
    });
    
    setResult({ 
      success: !!user, 
      message: user 
        ? `Usuário logado: ${user.email} (ID: ${user.id})` 
        : 'Nenhum usuário logado' 
    });
  };

  const handleCreateTestUser = async () => {
    log.info('🔍 [PointsDemo] Criando usuário de teste...');
    setLoading(true);
    
    try {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'teste@neutro.com',
        password: '123456',
        options: {
          data: {
            name: 'Usuário Teste',
            user_type: selectedUserType
          }
        }
      });

      if (authError) {
        log.error('❌ [PointsDemo] Erro ao criar usuário:', authError);
        setResult({ 
          success: false, 
          message: `Erro ao criar usuário: ${authError.message}` 
        });
        return;
      }

      log.info('✅ [PointsDemo] Usuário criado:', authData);

      // Criar registro na tabela users
      if (authData.user) {
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            name: 'Usuário Teste',
            user_type: selectedUserType,
            created_at: new Date().toISOString()
          });

        if (userError) {
          log.error('❌ [PointsDemo] Erro ao inserir na tabela users:', userError);
        } else {
          log.info('✅ [PointsDemo] Usuário inserido na tabela users');
        }

        // Criar registro inicial na tabela user_progress
        const { error: progressError } = await supabase
          .from('user_progress')
          .insert({
            user_id: authData.user.id,
            user_type: selectedUserType,
            total_points: 0,
            collections: 0,
            kg: 0,
            ratings: 0,
            months: 0,
            active_coupons: 0,
            sales: 0,
            active_collectors: 0,
            average_rating: 0,
            current_level: 'bronze',
            created_at: new Date().toISOString()
          });

        if (progressError) {
          log.error('❌ [PointsDemo] Erro ao criar progresso inicial:', progressError);
        } else {
          log.info('✅ [PointsDemo] Progresso inicial criado');
        }

        setResult({ 
          success: true, 
          message: `Usuário de teste (${selectedUserType}) criado com sucesso! Faça login com teste@neutro.com / 123456` 
        });
      }
    } catch (error) {
      log.error('❌ [PointsDemo] Erro inesperado ao criar usuário:', error);
      setResult({ 
        success: false, 
        message: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUserTypeTest = async (userType: 'common' | 'collector' | 'partner' | 'cooperative' | 'company') => {
    log.info(`🔍 [PointsDemo] Criando usuário de teste do tipo: ${userType}`);
    setLoading(true);
    
    const email = `teste.${userType}@neutro.com`;
    const password = '123456';
    
    try {
      // Primeiro, verificar se o usuário já existe
      log.info(`🔍 [PointsDemo] Verificando se usuário ${email} já existe...`);
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (existingUser && !checkError) {
        log.info('⚠️ [PointsDemo] Usuário já existe:', existingUser);
        setResult({ 
          success: true, 
          message: `Usuário ${userType} já existe! Use o botão de login.` 
        });
        return;
      }

      // Criar usuário no Supabase Auth
      log.info(`🔍 [PointsDemo] Criando usuário no sistema de autenticação...`);
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: `Usuário Teste ${userType.charAt(0).toUpperCase() + userType.slice(1)}`,
            user_type: userType
          }
        }
      });

      if (authError) {
        log.error('❌ [PointsDemo] Erro ao criar usuário:', authError);
        setResult({ 
          success: false, 
          message: `Erro ao criar usuário ${userType}: ${authError.message}` 
        });
        return;
      }

      log.info('✅ [PointsDemo] Usuário criado:', authData);

      // Criar registro na tabela users
      if (authData.user) {
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            name: `Usuário Teste ${userType.charAt(0).toUpperCase() + userType.slice(1)}`,
            user_type: userType,
            created_at: new Date().toISOString()
          });

        if (userError) {
          log.error('❌ [PointsDemo] Erro ao inserir na tabela users:', userError);
        } else {
          log.info('✅ [PointsDemo] Usuário inserido na tabela users');
        }

        // Criar registro inicial na tabela user_progress
        const { error: progressError } = await supabase
          .from('user_progress')
          .insert({
            user_id: authData.user.id,
            user_type: userType,
            total_points: 0,
            collections: 0,
            kg: 0,
            ratings: 0,
            months: 0,
            active_coupons: 0,
            sales: 0,
            active_collectors: 0,
            average_rating: 0,
            current_level: 'bronze',
            created_at: new Date().toISOString()
          });

        if (progressError) {
          log.error('❌ [PointsDemo] Erro ao criar progresso inicial:', progressError);
        } else {
          log.info('✅ [PointsDemo] Progresso inicial criado');
        }

        setResult({ 
          success: true, 
          message: `Usuário ${userType} criado! Email: ${email} | Senha: ${password}` 
        });
      }
    } catch (error) {
      log.error('❌ [PointsDemo] Erro inesperado ao criar usuário:', error);
      setResult({ 
        success: false, 
        message: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginTestUser = async () => {
    log.info('🔍 [PointsDemo] Fazendo login com usuário de teste...');
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'teste@neutro.com',
        password: '123456'
      });

      if (error) {
        log.error('❌ [PointsDemo] Erro no login:', error);
        setResult({ 
          success: false, 
          message: `Erro no login: ${error.message}` 
        });
      } else {
        log.info('✅ [PointsDemo] Login realizado com sucesso:', data);
        setResult({ 
          success: true, 
          message: 'Login realizado com sucesso! Recarregue a página para ver o progresso.' 
        });
        
        // Recarregar progresso após login
        setTimeout(() => {
          refreshProgress();
        }, 1000);
      }
    } catch (error) {
      log.error('❌ [PointsDemo] Erro inesperado no login:', error);
      setResult({ 
        success: false, 
        message: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginUserType = async (userType: 'common' | 'collector' | 'partner' | 'cooperative' | 'company') => {
    log.info(`🔍 [PointsDemo] Fazendo login com usuário ${userType}...`);
    setLoading(true);
    
    const email = `teste.${userType}@neutro.com`;
    const password = '123456';
    
    try {
      // Primeiro, verificar se o usuário existe na tabela users
      log.info(`🔍 [PointsDemo] Verificando se usuário ${email} existe...`);
      const { data: userData, error: userCheckError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userCheckError) {
        log.error('❌ [PointsDemo] Usuário não encontrado na tabela users:', userCheckError);
        setResult({ 
          success: false, 
          message: `Usuário ${userType} não encontrado. Crie o usuário primeiro.` 
        });
        return;
      }

      log.info('✅ [PointsDemo] Usuário encontrado na tabela users:', userData);

      // Verificar se existe progresso para o usuário
      const { data: progressData, error: progressCheckError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userData.id)
        .single();

      if (progressCheckError) {
        log.warn('⚠️ [PointsDemo] Progresso não encontrado, será criado automaticamente');
      } else {
        log.info('✅ [PointsDemo] Progresso encontrado:', progressData);
      }

      // Tentar fazer login
      log.info(`🔍 [PointsDemo] Tentando login com ${email}...`);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        log.error('❌ [PointsDemo] Erro no login:', error);
        
        // Se o erro for de credenciais inválidas, pode ser que o usuário não foi criado no auth
        if (error.message.includes('Invalid login credentials')) {
          setResult({ 
            success: false, 
            message: `Credenciais inválidas para ${userType}. O usuário pode não ter sido criado no sistema de autenticação.` 
          });
        } else {
          setResult({ 
            success: false, 
            message: `Erro no login ${userType}: ${error.message}` 
          });
        }
      } else {
        log.info('✅ [PointsDemo] Login realizado com sucesso:', data);
        setResult({ 
          success: true, 
          message: `Login ${userType} realizado! Recarregue a página para ver o progresso.` 
        });
        
        // Recarregar progresso após login
        setTimeout(() => {
          refreshProgress();
        }, 1000);
      }
    } catch (error) {
      log.error('❌ [PointsDemo] Erro inesperado no login:', error);
      setResult({ 
        success: false, 
        message: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    log.info('🔍 [PointsDemo] Fazendo logout...');
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        log.error('❌ [PointsDemo] Erro no logout:', error);
        setResult({ 
          success: false, 
          message: `Erro no logout: ${error.message}` 
        });
      } else {
        log.info('✅ [PointsDemo] Logout realizado com sucesso');
        setResult({ 
          success: true, 
          message: 'Logout realizado com sucesso! Recarregue a página.' 
        });
        
        // Limpar estado local
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      log.error('❌ [PointsDemo] Erro inesperado no logout:', error);
      setResult({ 
        success: false, 
        message: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPoints = async () => {
    if (!user?.id) {
      setResult({ success: false, message: 'Usuário não está logado' });
      return;
    }

    log.info('🔍 [PointsDemo] Resetando pontos...');
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('user_progress')
        .update({
          total_points: 0,
          collections: 0,
          kg: 0,
          ratings: 0,
          months: 0,
          active_coupons: 0,
          sales: 0,
          active_collectors: 0,
          average_rating: 0,
          current_level: 'bronze',
          protection_months_remaining: 0,
          level_achieved_date: null,
          notification_type: null,
          last_notification_sent: null,
          monthly_average_collections: null,
          monthly_average_kg: null,
          monthly_average_rating: null
        })
        .eq('user_id', user.id);

      if (error) {
        log.error('❌ [PointsDemo] Erro ao resetar pontos:', error);
        setResult({ success: false, message: `Erro ao resetar: ${error.message}` });
      } else {
        log.info('✅ [PointsDemo] Pontos resetados com sucesso');
        setResult({ success: true, message: 'Pontos resetados com sucesso!' });
        await refreshProgress();
      }
    } catch (error) {
      log.error('❌ [PointsDemo] Erro inesperado ao resetar:', error);
      setResult({ success: false, message: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}` });
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateLevel = async () => {
    if (!user?.id) {
      setResult({ success: false, message: 'Usuário não está logado' });
      return;
    }

    log.info('🔍 [PointsDemo] Avaliando nível do usuário...');
    setLoading(true);
    
    try {
      await evaluateUserLevel();
      setResult({ success: true, message: 'Avaliação de nível concluída! Verifique as notificações.' });
      await refreshProgress();
    } catch (error) {
      log.error('❌ [PointsDemo] Erro ao avaliar nível:', error);
      setResult({ success: false, message: `Erro na avaliação: ${error instanceof Error ? error.message : 'Erro desconhecido'}` });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadNotifications = async () => {
    if (!user?.id) {
      setResult({ success: false, message: 'Usuário não está logado' });
      return;
    }

    log.info('🔍 [PointsDemo] Carregando notificações...');
    setLoading(true);
    
    try {
      const notifs = await getLevelNotifications(10);
      setNotifications(notifs);
      setShowNotifications(true);
      setResult({ success: true, message: `${notifs.length} notificação(s) carregada(s)` });
    } catch (error) {
      log.error('❌ [PointsDemo] Erro ao carregar notificações:', error);
      setResult({ success: false, message: `Erro ao carregar notificações: ${error instanceof Error ? error.message : 'Erro desconhecido'}` });
    } finally {
      setLoading(false);
    }
  };

  const handleActivateProtection = async () => {
    if (!user?.id || !progress) {
      setResult({ success: false, message: 'Usuário não está logado ou progresso não encontrado' });
      return;
    }

    log.info('🔍 [PointsDemo] Ativando proteção de nível...');
    setLoading(true);
    
    try {
      await PointsService.activateLevelProtection(user.id, progress.currentLevel);
      setResult({ success: true, message: 'Proteção de nível ativada! Verifique o progresso.' });
      await refreshProgress();
    } catch (error) {
      log.error('❌ [PointsDemo] Erro ao ativar proteção:', error);
      setResult({ success: false, message: `Erro ao ativar proteção: ${error instanceof Error ? error.message : 'Erro desconhecido'}` });
    } finally {
      setLoading(false);
    }
  };

  const handleTestAction = async (actionKey: string, metadata: Record<string, any> = {}) => {
    if (!user?.id) {
      setResult({ success: false, message: 'Usuário não está logado' });
      return;
    }

    log.info('🔍 [PointsDemo] Executando ação de teste:', { actionKey, metadata });
    setLoading(true);
    
    try {
      const result = await addPoints(actionKey, metadata);
      
      if (result.success) {
        setResult({ 
          success: true, 
          message: `Ação de teste executada! ${result.pointsAdded} pontos adicionados. Total: ${result.newTotal} pontos` 
        });
        await refreshProgress();
      } else {
        setResult({ success: false, message: 'Erro ao executar ação de teste' });
      }
    } catch (error) {
      log.error('❌ [PointsDemo] Erro ao executar ação de teste:', error);
      setResult({ success: false, message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}` });
    } finally {
      setLoading(false);
    }
  };

  const handleEnableTestMode = async () => {
    if (!user?.id) {
      setResult({ success: false, message: 'Usuário não está logado' });
      return;
    }

    log.info('🧪 [PointsDemo] Ativando modo de teste...');
    setLoading(true);
    
    try {
      await PointsService.enableTestMode(user.id);
      setResult({ success: true, message: 'Modo de teste ativado! Requisitos ajustados para facilitar level up.' });
      await refreshProgress();
    } catch (error) {
      log.error('❌ [PointsDemo] Erro ao ativar modo de teste:', error);
      setResult({ success: false, message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}` });
    } finally {
      setLoading(false);
    }
  };

  const handleForceLevelUp = async (targetLevel: 'silver' | 'gold') => {
    if (!user?.id) {
      setResult({ success: false, message: 'Usuário não está logado' });
      return;
    }

    log.info('🚀 [PointsDemo] Forçando level up para:', targetLevel);
    setLoading(true);
    
    try {
      await PointsService.forceLevelUp(user.id, targetLevel);
      setResult({ success: true, message: `Level up forçado para ${targetLevel}! Proteção ativada automaticamente.` });
      await refreshProgress();
    } catch (error) {
      log.error('❌ [PointsDemo] Erro ao forçar level up:', error);
      setResult({ success: false, message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}` });
    } finally {
      setLoading(false);
    }
  };

  const getActionOptions = () => {
    return Object.entries(pointsTable)
      .filter(([_, action]) => action.userType === userType)
      .map(([key, action]) => ({
        key,
        label: action.action,
        points: action.points,
        description: action.description
      }));
  };

  const actionOptions = getActionOptions();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          <Target className="inline-block w-6 h-6 mr-2 text-green-600" />
          Demonstração do Sistema de Pontuação
        </h2>
        <p className="text-gray-600">
          Teste o sistema de pontuação em tempo real. Adicione pontos e veja seu progresso atualizar.
        </p>
        
        {/* Instruções de Teste */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-2xl mx-auto">
          <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Como Testar o Sistema
          </h4>
          <div className="text-sm text-green-800 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">1.</span>
              <span>Selecione o tipo de usuário que deseja testar</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">2.</span>
              <span>Clique em "Criar Usuários de Teste" para criar contas de diferentes tipos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">3.</span>
              <span>Clique em "Login por Tipo" para fazer login com o tipo desejado</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">4.</span>
              <span>Clique em "Testar Autenticação" para verificar o status</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">5.</span>
              <span>Selecione uma ação e clique em "Adicionar Pontos"</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">6.</span>
              <span>Use "Resetar Pontos" para zerar e testar novamente</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">7.</span>
              <span>Use "Fazer Logout" para trocar de usuário</span>
            </div>
          </div>
          
          {/* Dicas de Troubleshooting */}
          <div className="mt-3 pt-3 border-t border-green-200">
            <h5 className="font-medium text-green-900 mb-1 flex items-center gap-2">
              <AlertCircle className="w-3 h-3" />
              Se não conseguir fazer login:
            </h5>
            <div className="text-xs text-green-700 space-y-1">
              <div>• Verifique se o usuário foi criado primeiro</div>
              <div>• Use "Fazer Logout" antes de tentar outro login</div>
              <div>• Recarregue a página se necessário</div>
              <div>• Verifique o console do navegador para logs detalhados</div>
            </div>
          </div>

          {/* Nova Funcionalidade: Pontualidade */}
          <div className="mt-3 pt-3 border-t border-blue-200">
            <h5 className="font-medium text-blue-900 mb-1 flex items-center gap-2">
              <CheckCircle className="w-3 h-3" />
              Nova Funcionalidade: Pontualidade do Coletor
            </h5>
            <div className="text-xs text-blue-700 space-y-1">
              <div>• Ao avaliar um coletor, marque se ele chegou no horário</div>
              <div>• Pontual: +5 pontos para o coletor</div>
              <div>• Atrasado: -10 pontos para o coletor</div>
              <div>• Bônus mensal: 95%+ pontualidade = +100 pontos</div>
              <div>• Teste selecionando "Avaliar Coletor" e marcando pontualidade</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Painel de Controle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Adicionar Pontos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Credenciais de Teste */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Credenciais de Teste
              </h4>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-1 gap-1">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Comum:</span>
                    <code className="bg-blue-100 px-2 py-1 rounded text-blue-900">teste.common@neutro.com</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Coletor:</span>
                    <code className="bg-blue-100 px-2 py-1 rounded text-blue-900">teste.collector@neutro.com</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Parceiro:</span>
                    <code className="bg-blue-100 px-2 py-1 rounded text-blue-900">teste.partner@neutro.com</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Cooperativa:</span>
                    <code className="bg-blue-100 px-2 py-1 rounded text-blue-900">teste.cooperative@neutro.com</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Empresa:</span>
                    <code className="bg-blue-100 px-2 py-1 rounded text-blue-900">teste.company@neutro.com</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Senha:</span>
                    <code className="bg-blue-100 px-2 py-1 rounded text-blue-900">123456</code>
                  </div>
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Use estas credenciais para testar o sistema após criar os usuários
              </p>
            </div>

            {/* Tipo de Usuário */}
            <div>
              <Label>Tipo de Usuário</Label>
              <div className="mt-1">
                <Badge variant="outline" className="text-sm">
                  {userType.charAt(0).toUpperCase() + userType.slice(1)}
                </Badge>
              </div>
            </div>

            {/* Seletor de Tipo de Usuário para Teste */}
            <div>
              <Label htmlFor="userType">Tipo de Usuário para Teste</Label>
              <Select value={selectedUserType} onValueChange={(value: any) => setSelectedUserType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de usuário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="common">Usuário Comum</SelectItem>
                  <SelectItem value="collector">Coletor</SelectItem>
                  <SelectItem value="partner">Parceiro</SelectItem>
                  <SelectItem value="cooperative">Cooperativa</SelectItem>
                  <SelectItem value="company">Empresa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botões de Criação por Tipo */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Criar Usuários de Teste</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => handleCreateUserTypeTest('common')} 
                  disabled={loading}
                  size="sm"
                  variant="outline"
                >
                  {loading ? '...' : 'Comum'}
                </Button>
                <Button 
                  onClick={() => handleCreateUserTypeTest('collector')} 
                  disabled={loading}
                  size="sm"
                  variant="outline"
                >
                  {loading ? '...' : 'Coletor'}
                </Button>
                <Button 
                  onClick={() => handleCreateUserTypeTest('partner')} 
                  disabled={loading}
                  size="sm"
                  variant="outline"
                >
                  {loading ? '...' : 'Parceiro'}
                </Button>
                <Button 
                  onClick={() => handleCreateUserTypeTest('cooperative')} 
                  disabled={loading}
                  size="sm"
                  variant="outline"
                >
                  {loading ? '...' : 'Cooperativa'}
                </Button>
                <Button 
                  onClick={() => handleCreateUserTypeTest('company')} 
                  disabled={loading}
                  size="sm"
                  variant="outline"
                  className="col-span-2"
                >
                  {loading ? '...' : 'Empresa'}
                </Button>
              </div>
            </div>

            {/* Botões de Login por Tipo */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Login por Tipo</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => handleLoginUserType('common')} 
                  disabled={loading}
                  size="sm"
                >
                  {loading ? '...' : 'Comum'}
                </Button>
                <Button 
                  onClick={() => handleLoginUserType('collector')} 
                  disabled={loading}
                  size="sm"
                >
                  {loading ? '...' : 'Coletor'}
                </Button>
                <Button 
                  onClick={() => handleLoginUserType('partner')} 
                  disabled={loading}
                  size="sm"
                >
                  {loading ? '...' : 'Parceiro'}
                </Button>
                <Button 
                  onClick={() => handleLoginUserType('cooperative')} 
                  disabled={loading}
                  size="sm"
                >
                  {loading ? '...' : 'Cooperativa'}
                </Button>
                <Button 
                  onClick={() => handleLoginUserType('company')} 
                  disabled={loading}
                  size="sm"
                  className="col-span-2"
                >
                  {loading ? '...' : 'Empresa'}
                </Button>
              </div>
            </div>

            {/* Botão de Logout */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Gerenciar Sessão</Label>
              <Button 
                onClick={handleLogout} 
                disabled={loading || !user}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {loading ? 'Fazendo Logout...' : 'Fazer Logout'}
              </Button>
            </div>

            {/* Status do Usuário Atual */}
            {user && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-sm text-green-800">
                  <div className="font-medium mb-1">Usuário Logado:</div>
                  <div className="text-xs space-y-1">
                    <div><span className="font-medium">Email:</span> {user.email}</div>
                    <div><span className="font-medium">ID:</span> {user.id}</div>
                    <div><span className="font-medium">Tipo:</span> {user.user_type || 'Não definido'}</div>
                  </div>
                </div>
              </div>
            )}

            {!user && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="text-sm text-yellow-800">
                  <div className="font-medium">Nenhum usuário logado</div>
                  <div className="text-xs mt-1">Faça login para testar o sistema</div>
                </div>
              </div>
            )}

            {/* Seleção de Ação */}
            <div>
              <Label htmlFor="action">Ação</Label>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma ação" />
                </SelectTrigger>
                <SelectContent>
                  {actionOptions.map((option) => (
                    <SelectItem key={option.key} value={option.key}>
                      <div className="flex items-center justify-between w-full">
                        <span>{option.label}</span>
                        <Badge variant="secondary" className="ml-2">
                          +{option.points}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Metadados */}
            {selectedAction && (
              <div>
                <Label>Metadados (opcional)</Label>
                <div className="mt-2 space-y-2">
                  <Input
                    placeholder="kg (ex: 25)"
                    value={metadata.kg || ''}
                    onChange={(e) => setMetadata({ ...metadata, kg: parseFloat(e.target.value) || 0 })}
                  />
                  <Input
                    placeholder="rating (ex: 5)"
                    value={metadata.rating || ''}
                    onChange={(e) => setMetadata({ ...metadata, rating: parseFloat(e.target.value) || 0 })}
                  />
                  {/* Campo de pontualidade para avaliação de coletor */}
                  {selectedAction === 'common_rate_collector' && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Pontualidade do Coletor</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="pontual"
                          checked={metadata.pontual !== false}
                          onChange={(e) => setMetadata({ 
                            ...metadata, 
                            pontual: e.target.checked,
                            coletorId: metadata.coletorId || 'teste.collector@neutro.com'
                          })}
                          className="rounded"
                        />
                        <Label htmlFor="pontual" className="text-sm">
                          {metadata.pontual !== false ? 'Chegou no horário' : 'Chegou atrasado'}
                        </Label>
                      </div>
                      <Input
                        placeholder="ID do coletor (ex: teste.collector@neutro.com)"
                        value={metadata.coletorId || ''}
                        onChange={(e) => setMetadata({ ...metadata, coletorId: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Botão de Teste de Autenticação */}
            <Button 
              onClick={handleTestAuth} 
              variant="outline"
              className="w-full"
            >
              Testar Autenticação
            </Button>

            {/* Botão de Login com Usuário de Teste */}
            <Button 
              onClick={handleLoginTestUser} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? 'Logando...' : 'Login com Usuário de Teste'}
            </Button>

            {/* Botão de Resetar Pontos */}
            <Button 
              onClick={handleResetPoints} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {loading ? 'Resetando...' : 'Resetar Pontos'}
            </Button>

            {/* Botões do Sistema de Proteção de Nível */}
            <Separator />
            <div className="text-sm font-medium text-gray-700 mb-3">Sistema de Proteção de Nível</div>
            
            <Button 
              onClick={handleEvaluateLevel} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <Target className="w-4 h-4 mr-2" />
              {loading ? 'Avaliando...' : 'Avaliar Nível'}
            </Button>

            <Button 
              onClick={handleLoadNotifications} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <Shield className="w-4 h-4 mr-2" />
              {loading ? 'Carregando...' : 'Ver Notificações'}
            </Button>

            <Button 
              onClick={handleActivateProtection} 
              disabled={loading || !progress}
              variant="outline"
              className="w-full"
            >
              <Shield className="w-4 h-4 mr-2" />
              {loading ? 'Ativando...' : 'Ativar Proteção'}
            </Button>

            {/* Ações de Teste para Level Up */}
            <Separator />
            <div className="text-sm font-medium text-gray-700 mb-3">Ações de Teste - Level Up</div>
            
            <Button 
              onClick={() => handleTestAction('test_high_rating', {})} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <Star className="w-4 h-4 mr-2" />
              {loading ? 'Adicionando...' : 'Simular Avaliação Alta'}
            </Button>

            <Button 
              onClick={() => handleTestAction('test_bulk_collections', { kg: 300 })} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <Package className="w-4 h-4 mr-2" />
              {loading ? 'Adicionando...' : 'Simular 15 Coletas'}
            </Button>

            <Button 
              onClick={() => handleTestAction('test_high_kg', {})} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              {loading ? 'Adicionando...' : 'Simular 500kg'}
            </Button>

            <Button 
              onClick={() => handleTestAction('test_level_up_silver', {})} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <Trophy className="w-4 h-4 mr-2" />
              {loading ? 'Forçando...' : 'Forçar Level Up Prata'}
            </Button>

            <Button 
              onClick={() => handleTestAction('test_level_up_gold', {})} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <Trophy className="w-4 h-4 mr-2" />
              {loading ? 'Forçando...' : 'Forçar Level Up Ouro'}
            </Button>

            {/* Modo de Teste Avançado */}
            <Separator />
            <div className="text-sm font-medium text-gray-700 mb-3">Modo de Teste Avançado</div>
            
            <Button 
              onClick={handleEnableTestMode} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <Target className="w-4 h-4 mr-2" />
              {loading ? 'Ativando...' : 'Ativar Modo de Teste'}
            </Button>

            <Button 
              onClick={() => handleForceLevelUp('silver')} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <Trophy className="w-4 h-4 mr-2" />
              {loading ? 'Forçando...' : 'Forçar Level Up Prata (Direto)'}
            </Button>

            <Button 
              onClick={() => handleForceLevelUp('gold')} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <Trophy className="w-4 h-4 mr-2" />
              {loading ? 'Forçando...' : 'Forçar Level Up Ouro (Direto)'}
            </Button>

            {/* Botão de Adicionar Pontos */}
            <Button 
              onClick={handleAddPoints} 
              disabled={!selectedAction || loading}
              className="w-full"
            >
              {loading ? 'Adicionando...' : 'Adicionar Pontos'}
            </Button>

            {/* Resultado */}
            {result && (
              <div className={`p-3 rounded-lg flex items-center gap-2 ${
                result.success 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {result.success ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span className="text-sm">{result.message}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progresso Atual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Progresso Atual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {progress ? (
              <>
                {/* Nível e Pontos */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{progress.totalPoints}</div>
                    <div className="text-sm text-gray-600">pontos totais</div>
                  </div>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {progress.currentLevel.toUpperCase()}
                  </Badge>
                </div>

                <Separator />

                {/* Métricas */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Métricas
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Coletas:</span>
                      <span className="font-medium ml-1">{progress.collections}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Kg:</span>
                      <span className="font-medium ml-1">{progress.kg}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Avaliações:</span>
                      <span className="font-medium ml-1">{progress.ratings}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Meses:</span>
                      <span className="font-medium ml-1">{progress.months}</span>
                    </div>
                    {progress.activeCoupons > 0 && (
                      <div>
                        <span className="text-gray-600">Cupons:</span>
                        <span className="font-medium ml-1">{progress.activeCoupons}</span>
                      </div>
                    )}
                    {progress.activeCollectors > 0 && (
                      <div>
                        <span className="text-gray-600">Coletores:</span>
                        <span className="font-medium ml-1">{progress.activeCollectors}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botão de Atualizar */}
                <Button 
                  variant="outline" 
                  onClick={refreshProgress}
                  className="w-full"
                >
                  Atualizar Progresso
                </Button>
              </>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Star className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>Nenhum progresso encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notificações de Nível */}
        {showNotifications && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Notificações de Nível
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${
                      notification.notificationType === 'protection' ? 'bg-blue-50 border-blue-200' :
                      notification.notificationType === 'alert' ? 'bg-orange-50 border-orange-200' :
                      'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {notification.notificationType === 'protection' && <Shield className="w-4 h-4 text-blue-500" />}
                        {notification.notificationType === 'alert' && <AlertCircle className="w-4 h-4 text-orange-500" />}
                        {notification.notificationType === 'drop' && <TrendingDown className="w-4 h-4 text-red-500" />}
                        <span className="font-medium text-sm">
                          {notification.notificationType === 'protection' && 'Proteção Ativada'}
                          {notification.notificationType === 'alert' && 'Alerta de Performance'}
                          {notification.notificationType === 'drop' && 'Queda de Nível'}
                        </span>
                      </div>
                      <Badge 
                        className={
                          notification.notificationType === 'protection' ? 'bg-blue-100 text-blue-700' :
                          notification.notificationType === 'alert' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }
                      >
                        {notification.notificationType === 'protection' && 'Proteção'}
                        {notification.notificationType === 'alert' && 'Alerta'}
                        {notification.notificationType === 'drop' && 'Queda'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">
                      {notification.message}
                    </p>
                    
                    <div className="text-xs text-gray-500">
                      {notification.sentAt.toLocaleDateString('pt-BR')} às{' '}
                      {notification.sentAt.toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <Shield className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>Nenhuma notificação encontrada</p>
                </div>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => setShowNotifications(false)}
                className="w-full"
              >
                Fechar Notificações
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabela de Pontuação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Tabela de Pontuação - {userType.charAt(0).toUpperCase() + userType.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {actionOptions.map((option) => (
              <div key={option.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  +{option.points} pontos
                </Badge>
              </div>
            ))}
          </div>

          {metrics && (
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-medium mb-3">Condições de Bônus</h4>
              <div className="space-y-2">
                {metrics.bonusConditions.map((condition, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>{condition}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 