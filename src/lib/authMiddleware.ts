import { supabase } from './supabaseClient';
import log from './logger';

// Tipos de usuário permitidos
export type UserType = 
  | 'common_user'
  | 'individual_collector'
  | 'cooperative_owner'
  | 'collector_company_owner'
  | 'partner_owner'
  | 'admin';

// Interface para permissões
export interface Permission {
  resource: string;
  action: 'read' | 'write' | 'delete' | 'admin';
}

// Interface para configuração de rota
export interface RouteConfig {
  requiresAuth: boolean;
  allowedUserTypes?: UserType[];
  requiredPermissions?: Permission[];
  redirectTo?: string;
}

// Mapa de permissões por tipo de usuário
const USER_PERMISSIONS: Record<UserType, Permission[]> = {
  common_user: [
    { resource: 'profile', action: 'read' },
    { resource: 'profile', action: 'write' },
    { resource: 'collections', action: 'read' },
    { resource: 'collections', action: 'write' },
    { resource: 'coupons', action: 'read' },
    { resource: 'levels', action: 'read' },
    { resource: 'achievements', action: 'read' },
    { resource: 'environmental_impact', action: 'read' }
  ],
  individual_collector: [
    { resource: 'profile', action: 'read' },
    { resource: 'profile', action: 'write' },
    { resource: 'collections', action: 'read' },
    { resource: 'collections', action: 'write' },
    { resource: 'collections', action: 'delete' },
    { resource: 'schedule', action: 'read' },
    { resource: 'schedule', action: 'write' },
    { resource: 'materials', action: 'read' },
    { resource: 'pricing', action: 'read' },
    { resource: 'levels', action: 'read' },
    { resource: 'achievements', action: 'read' },
    { resource: 'environmental_impact', action: 'read' }
  ],
  cooperative_owner: [
    { resource: 'profile', action: 'read' },
    { resource: 'profile', action: 'write' },
    { resource: 'collections', action: 'read' },
    { resource: 'collections', action: 'write' },
    { resource: 'collections', action: 'delete' },
    { resource: 'team', action: 'read' },
    { resource: 'team', action: 'write' },
    { resource: 'team', action: 'delete' },
    { resource: 'financial', action: 'read' },
    { resource: 'financial', action: 'write' },
    { resource: 'materials', action: 'read' },
    { resource: 'materials', action: 'write' },
    { resource: 'pricing', action: 'read' },
    { resource: 'pricing', action: 'write' },
    { resource: 'levels', action: 'read' },
    { resource: 'achievements', action: 'read' },
    { resource: 'environmental_impact', action: 'read' }
  ],
  collector_company_owner: [
    { resource: 'profile', action: 'read' },
    { resource: 'profile', action: 'write' },
    { resource: 'collections', action: 'read' },
    { resource: 'collections', action: 'write' },
    { resource: 'collections', action: 'delete' },
    { resource: 'team', action: 'read' },
    { resource: 'team', action: 'write' },
    { resource: 'team', action: 'delete' },
    { resource: 'financial', action: 'read' },
    { resource: 'financial', action: 'write' },
    { resource: 'materials', action: 'read' },
    { resource: 'materials', action: 'write' },
    { resource: 'pricing', action: 'read' },
    { resource: 'pricing', action: 'write' },
    { resource: 'levels', action: 'read' },
    { resource: 'achievements', action: 'read' },
    { resource: 'environmental_impact', action: 'read' }
  ],
  partner_owner: [
    { resource: 'profile', action: 'read' },
    { resource: 'profile', action: 'write' },
    { resource: 'coupons', action: 'read' },
    { resource: 'coupons', action: 'write' },
    { resource: 'coupons', action: 'delete' },
    { resource: 'team', action: 'read' },
    { resource: 'team', action: 'write' },
    { resource: 'team', action: 'delete' },
    { resource: 'financial', action: 'read' },
    { resource: 'financial', action: 'write' },
    { resource: 'levels', action: 'read' },
    { resource: 'achievements', action: 'read' },
    { resource: 'environmental_impact', action: 'read' }
  ],
  admin: [
    { resource: '*', action: 'admin' }
  ]
};

// Configuração de rotas protegidas
export const ROUTE_CONFIG: Record<string, RouteConfig> = {
  // Rotas públicas
  '/': { requiresAuth: false },
  '/login': { requiresAuth: false },
  '/register': { requiresAuth: false },
  '/about': { requiresAuth: false },
  
  // Dashboard principal
  '/dashboard/standard': { 
    requiresAuth: true,
    redirectTo: '/login'
  },
  
  // Rotas de usuário comum
  '/user/achievements': { 
    requiresAuth: true,
    allowedUserTypes: ['common_user'],
    redirectTo: '/dashboard/standard'
  },
  '/user/levels': { 
    requiresAuth: true,
    allowedUserTypes: ['common_user'],
    redirectTo: '/dashboard/standard'
  },
  '/user/environmental-impact': { 
    requiresAuth: true,
    allowedUserTypes: ['common_user'],
    redirectTo: '/dashboard/standard'
  },
  
  // Rotas de coletor
  '/collector/schedule': { 
    requiresAuth: true,
    allowedUserTypes: ['individual_collector'],
    redirectTo: '/dashboard/standard'
  },
  '/collector/points': { 
    requiresAuth: true,
    allowedUserTypes: ['individual_collector'],
    redirectTo: '/dashboard/standard'
  },
  
  // Rotas de cooperativa
  '/cooperative/collections': { 
    requiresAuth: true,
    allowedUserTypes: ['cooperative_owner'],
    redirectTo: '/dashboard/standard'
  },
  '/cooperative/team': { 
    requiresAuth: true,
    allowedUserTypes: ['cooperative_owner'],
    redirectTo: '/dashboard/standard'
  },
  
  // Rotas de empresa coletora
  '/company/collections': { 
    requiresAuth: true,
    allowedUserTypes: ['collector_company_owner'],
    redirectTo: '/dashboard/standard'
  },
  '/company/team': { 
    requiresAuth: true,
    allowedUserTypes: ['collector_company_owner'],
    redirectTo: '/dashboard/standard'
  },
  
  // Rotas de parceiro
  '/partner/coupons': { 
    requiresAuth: true,
    allowedUserTypes: ['partner_owner'],
    redirectTo: '/dashboard/standard'
  },
  '/partner/team': { 
    requiresAuth: true,
    allowedUserTypes: ['partner_owner'],
    redirectTo: '/dashboard/standard'
  },
  
  // Rotas administrativas
  '/admin': { 
    requiresAuth: true,
    allowedUserTypes: ['admin'],
    redirectTo: '/dashboard/standard'
  }
};

/**
 * Verifica se o usuário está autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      log.error('❌ [AuthMiddleware] Erro ao verificar autenticação:', error);
      return false;
    }
    
    return !!user;
  } catch (error) {
    log.error('❌ [AuthMiddleware] Erro inesperado ao verificar autenticação:', error);
    return false;
  }
}

/**
 * Obtém o tipo de usuário atual
 */
export async function getCurrentUserType(): Promise<UserType | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }
    
    // Buscar dados do usuário na tabela users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .single();
    
    if (userError || !userData) {
      log.error('❌ [AuthMiddleware] Erro ao buscar tipo de usuário:', userError);
      return null;
    }
    
    return userData.user_type as UserType;
  } catch (error) {
    log.error('❌ [AuthMiddleware] Erro ao obter tipo de usuário:', error);
    return null;
  }
}

/**
 * Verifica se o usuário tem permissão para acessar um recurso
 */
export async function hasPermission(
  resource: string, 
  action: 'read' | 'write' | 'delete' | 'admin'
): Promise<boolean> {
  try {
    const userType = await getCurrentUserType();
    
    if (!userType) {
      return false;
    }
    
    const permissions = USER_PERMISSIONS[userType] || [];
    
    // Admin tem todas as permissões
    if (userType === 'admin') {
      return true;
    }
    
    // Verificar permissão específica
    return permissions.some(permission => 
      (permission.resource === resource || permission.resource === '*') &&
      (permission.action === action || permission.action === 'admin')
    );
  } catch (error) {
    log.error('❌ [AuthMiddleware] Erro ao verificar permissão:', error);
    return false;
  }
}

/**
 * Verifica se o usuário pode acessar uma rota específica
 */
export async function canAccessRoute(route: string): Promise<{
  canAccess: boolean;
  redirectTo?: string;
  reason?: string;
}> {
  try {
    const config = ROUTE_CONFIG[route];
    
    // Se não há configuração, permitir acesso
    if (!config) {
      return { canAccess: true };
    }
    
    // Se não requer autenticação, permitir acesso
    if (!config.requiresAuth) {
      return { canAccess: true };
    }
    
    // Verificar se está autenticado
    const isAuth = await isAuthenticated();
    if (!isAuth) {
      return { 
        canAccess: false, 
        redirectTo: config.redirectTo || '/login',
        reason: 'Usuário não autenticado'
      };
    }
    
    // Se não há restrição de tipo de usuário, permitir acesso
    if (!config.allowedUserTypes) {
      return { canAccess: true };
    }
    
    // Verificar tipo de usuário
    const userType = await getCurrentUserType();
    if (!userType) {
      return { 
        canAccess: false, 
        redirectTo: config.redirectTo || '/dashboard/standard',
        reason: 'Tipo de usuário não identificado'
      };
    }
    
    if (!config.allowedUserTypes.includes(userType)) {
      return { 
        canAccess: false, 
        redirectTo: config.redirectTo || '/dashboard/standard',
        reason: `Tipo de usuário '${userType}' não tem permissão para acessar esta rota`
      };
    }
    
    return { canAccess: true };
  } catch (error) {
    log.error('❌ [AuthMiddleware] Erro ao verificar acesso à rota:', error);
    return { 
      canAccess: false, 
      redirectTo: '/login',
      reason: 'Erro interno ao verificar permissões'
    };
  }
}

/**
 * Middleware para proteger componentes
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions?: Permission[]
) {
  return function AuthenticatedComponent(props: P) {
    const [isAuthorized, setIsAuthorized] = React.useState<boolean | null>(null);
    const [loading, setLoading] = React.useState(true);
    
    React.useEffect(() => {
      async function checkAuthorization() {
        try {
          // Verificar autenticação
          const isAuth = await isAuthenticated();
          if (!isAuth) {
            setIsAuthorized(false);
            return;
          }
          
          // Verificar permissões específicas se fornecidas
          if (requiredPermissions) {
            for (const permission of requiredPermissions) {
              const hasPerm = await hasPermission(permission.resource, permission.action);
              if (!hasPerm) {
                setIsAuthorized(false);
                return;
              }
            }
          }
          
          setIsAuthorized(true);
        } catch (error) {
          log.error('❌ [AuthMiddleware] Erro ao verificar autorização:', error);
          setIsAuthorized(false);
        } finally {
          setLoading(false);
        }
      }
      
      checkAuthorization();
    }, []);
    
    if (loading) {
      return <div>Verificando permissões...</div>;
    }
    
    if (!isAuthorized) {
      return <div>Acesso negado. Você não tem permissão para acessar este recurso.</div>;
    }
    
    return <Component {...props} />;
  };
}

/**
 * Hook para verificar permissões em componentes
 */
export function useAuth() {
  const [user, setUser] = React.useState<any>(null);
  const [userType, setUserType] = React.useState<UserType | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          setUser(null);
          setUserType(null);
          return;
        }
        
        setUser(user);
        
        // Buscar tipo de usuário
        const { data: userData } = await supabase
          .from('users')
          .select('user_type')
          .eq('id', user.id)
          .single();
        
        if (userData) {
          setUserType(userData.user_type as UserType);
        }
      } catch (error) {
        log.error('❌ [AuthMiddleware] Erro ao carregar usuário:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadUser();
    
    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        
        const { data: userData } = await supabase
          .from('users')
          .select('user_type')
          .eq('id', session.user.id)
          .single();
        
        if (userData) {
          setUserType(userData.user_type as UserType);
        }
      } else {
        setUser(null);
        setUserType(null);
      }
      setLoading(false);
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  const hasPermission = React.useCallback(async (
    resource: string, 
    action: 'read' | 'write' | 'delete' | 'admin'
  ): Promise<boolean> => {
    if (!userType) return false;
    
    const permissions = USER_PERMISSIONS[userType] || [];
    
    if (userType === 'admin') return true;
    
    return permissions.some(permission => 
      (permission.resource === resource || permission.resource === '*') &&
      (permission.action === action || permission.action === 'admin')
    );
  }, [userType]);
  
  return {
    user,
    userType,
    loading,
    isAuthenticated: !!user,
    hasPermission
  };
} 