import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import log from '@/lib/logger';
import { validateLogin, validateUserRegistration } from '@/lib/validation';
import { checkLoginRateLimit, checkRegisterRateLimit } from '@/lib/rateLimiter';
import { logAuditEvent, logLoginAttempt } from '@/lib/auditLogger';

// Tipo do usuário autenticado
interface AuthUser {
  id: string;
  email: string;
  name?: string;
  user_type?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<{ error?: string; success?: boolean }>;
  refreshToken: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  login: async () => ({}),
  logout: async () => {},
  register: async () => ({}),
  refreshToken: async () => {},
  setUser: () => {},
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar sessão inicial e configurar refresh automático
  useEffect(() => {
    initializeAuth();
  }, []);

  // Simulação de usuário autenticado para ambiente de desenvolvimento/teste
  useEffect(() => {
    if (!user && !loading) {
      // Usuário comum mock
      setUser({
        id: '2863a918-7e01-42ec-95b4-35891c4321ee',
        email: 'maria.silva@email.com',
        name: 'Maria Silva',
        user_type: 'common_user'
      });
      setIsAuthenticated(true);
    }
  }, [user, loading]);

  const initializeAuth = async () => {
    try {
      // Buscar sessão atual
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        log.error('❌ [AuthContext] Erro ao buscar sessão:', error);
        setLoading(false);
        return;
      }

      if (session?.user) {
        await loadUserData(session.user);
      }

      // Configurar listener de mudanças de autenticação
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        log.info('🔄 [AuthContext] Mudança de estado de autenticação:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserData(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          await loadUserData(session.user);
        }
      });

      setLoading(false);

      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    } catch (error) {
      log.error('❌ [AuthContext] Erro na inicialização da autenticação:', error);
      setLoading(false);
    }
  };

  const loadUserData = async (authUser: any) => {
    try {
      // Buscar dados completos do usuário
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        log.error('❌ [AuthContext] Erro ao buscar dados do usuário:', error);
        setUser(authUser);
        setIsAuthenticated(true);
        return;
      }

      const fullUser = { ...authUser, ...userData };
      setUser(fullUser);
      setIsAuthenticated(true);
      
      log.info('✅ [AuthContext] Usuário carregado:', {
        id: fullUser.id,
        email: fullUser.email,
        userType: fullUser.user_type
      });
    } catch (error) {
      log.error('❌ [AuthContext] Erro ao carregar dados do usuário:', error);
      setUser(authUser);
      setIsAuthenticated(true);
    }
  };

  // Função de login com validação e rate limiting
  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Validar entrada
      const validation = validateLogin({ email, password });
      if (!validation.isValid) {
        log.warn('⚠️ [AuthContext] Dados de login inválidos:', validation.errors);
        return { error: validation.errors[0] };
      }

      // Verificar rate limit
      const rateLimitResult = checkLoginRateLimit(email);
      if (!rateLimitResult.allowed) {
        log.warn('⚠️ [AuthContext] Rate limit excedido para login:', email);
        return { 
          error: `Muitas tentativas de login. Tente novamente em ${rateLimitResult.retryAfter} segundos.` 
        };
      }

      log.info('🔍 [AuthContext] Tentativa de login:', { email });

      // Tentar login
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (error) {
        log.error('❌ [AuthContext] Erro no login:', error);
        
        // Registrar tentativa falhada
        await logLoginAttempt(email, false);
        
        return { error: error.message };
      }

      if (data.user) {
        await loadUserData(data.user);
        
        // Registrar login bem-sucedido
        await logLoginAttempt(data.user.id, true);
        await logAuditEvent(data.user.id, 'user_login', 'Login realizado com sucesso', 'low');
        
        log.info('✅ [AuthContext] Login realizado com sucesso');
      }

      return {};
    } catch (err) {
      log.error('❌ [AuthContext] Erro inesperado no login:', err);
      return { error: 'Erro inesperado ao fazer login' };
    } finally {
      setLoading(false);
    }
  };

  // Função de registro com validação e rate limiting
  const register = async (userData: any) => {
    setLoading(true);
    
    try {
      // Validar dados de registro
      const validation = validateUserRegistration(userData);
      if (!validation.isValid) {
        log.warn('⚠️ [AuthContext] Dados de registro inválidos:', validation.errors);
        return { error: validation.errors[0] };
      }

      // Verificar rate limit para registro
      const rateLimitResult = checkRegisterRateLimit(userData.email);
      if (!rateLimitResult.allowed) {
        log.warn('⚠️ [AuthContext] Rate limit excedido para registro:', userData.email);
        return { 
          error: `Muitas tentativas de registro. Tente novamente em ${rateLimitResult.retryAfter} segundos.` 
        };
      }

      log.info('🔍 [AuthContext] Tentativa de registro:', { email: userData.email });

      // Criar usuário no Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            user_type: userData.userType,
          }
        }
      });

      if (signUpError) {
        log.error('❌ [AuthContext] Erro no registro:', signUpError);
        return { error: signUpError.message };
      }

      if (signUpData.user) {
        // Registrar evento de auditoria
        await logAuditEvent(signUpData.user.id, 'user_register', 'Usuário registrado com sucesso', 'low');
        
        log.info('✅ [AuthContext] Registro realizado com sucesso');
        return { success: true };
      }

      return { error: 'Erro ao criar usuário' };
    } catch (err) {
      log.error('❌ [AuthContext] Erro inesperado no registro:', err);
      return { error: 'Erro inesperado ao fazer registro' };
    } finally {
      setLoading(false);
    }
  };

  // Função de logout com auditoria
  const logout = async () => {
    setLoading(true);
    
    try {
      if (user) {
        // Registrar logout
        await logAuditEvent(user.id, 'user_logout', 'Logout realizado', 'low');
      }

      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      
      log.info('✅ [AuthContext] Logout realizado com sucesso');
    } catch (error) {
      log.error('❌ [AuthContext] Erro no logout:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para refresh de token
  const refreshToken = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        log.error('❌ [AuthContext] Erro ao renovar token:', error);
        // Se não conseguir renovar, fazer logout
        await logout();
        return;
      }

      if (data.session?.user) {
        await loadUserData(data.session.user);
        log.info('✅ [AuthContext] Token renovado com sucesso');
      }
    } catch (error) {
      log.error('❌ [AuthContext] Erro inesperado ao renovar token:', error);
      await logout();
    }
  };

  // Configurar refresh automático de token
  useEffect(() => {
    if (!user) return;

    // Renovar token a cada 50 minutos (tokens expiram em 1 hora)
    const refreshInterval = setInterval(refreshToken, 50 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [user, refreshToken]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      register,
      refreshToken,
      setUser,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};

const handleAddPoints = async () => {
  if (!user) {
    // Mostre mensagem de erro amigável
    return;
  }
  // ...lógica para adicionar pontos...
}; 