import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedUserTypes?: string[];
  fallbackPath?: string;
  showLoading?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  allowedUserTypes = [],
  fallbackPath = '/login',
  showLoading = true
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Mostrar loading se necessário
  if (loading && showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader className="text-center">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-green-600" />
            <CardTitle>Verificando permissões...</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            Aguarde enquanto verificamos suas credenciais.
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se não requer autenticação, permitir acesso
  if (!requireAuth) {
    return <>{children}</>;
  }

  // Se não está autenticado, redirecionar para login
  if (!isAuthenticated || !user) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Se há restrições de tipo de usuário, verificar
  if (allowedUserTypes.length > 0) {
    const userType = user.user_type;
    
    if (!userType || !allowedUserTypes.includes(userType)) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-96">
            <CardHeader className="text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-red-500" />
              <CardTitle className="text-red-600">Acesso Negado</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Você não tem permissão para acessar esta página.
              </p>
              <p className="text-sm text-muted-foreground">
                Tipo de usuário: <span className="font-medium">{userType || 'Não definido'}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Tipos permitidos: {allowedUserTypes.join(', ')}
              </p>
              <Navigate to="/dashboard/standard" replace />
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // Se passou por todas as verificações, renderizar o conteúdo
  return <>{children}</>;
};

// Componente específico para rotas de usuário comum
export const CommonUserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute 
    allowedUserTypes={['common_user']}
    fallbackPath="/dashboard/standard"
  >
    {children}
  </ProtectedRoute>
);

// Componente específico para rotas de coletor
export const CollectorRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute 
    allowedUserTypes={['individual_collector']}
    fallbackPath="/dashboard/standard"
  >
    {children}
  </ProtectedRoute>
);

// Componente específico para rotas de cooperativa
export const CooperativeRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute 
    allowedUserTypes={['cooperative_owner']}
    fallbackPath="/dashboard/standard"
  >
    {children}
  </ProtectedRoute>
);

// Componente específico para rotas de empresa coletora
export const CompanyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute 
    allowedUserTypes={['collector_company_owner']}
    fallbackPath="/dashboard/standard"
  >
    {children}
  </ProtectedRoute>
);

// Componente específico para rotas de parceiro
export const PartnerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute 
    allowedUserTypes={['partner_owner']}
    fallbackPath="/dashboard/standard"
  >
    {children}
  </ProtectedRoute>
);

// Componente específico para rotas administrativas
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute 
    allowedUserTypes={['admin']}
    fallbackPath="/dashboard/standard"
  >
    {children}
  </ProtectedRoute>
);

// Hook para verificar permissões em componentes
export const useRouteProtection = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  const canAccess = React.useCallback((
    allowedUserTypes: string[] = []
  ): boolean => {
    if (!isAuthenticated || !user) return false;
    
    if (allowedUserTypes.length === 0) return true;
    
    return allowedUserTypes.includes(user.user_type || '');
  }, [user, isAuthenticated]);

  const redirectToLogin = React.useCallback(() => {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }, [location]);

  const redirectToDashboard = React.useCallback(() => {
    return <Navigate to="/dashboard/standard" replace />;
  }, []);

  return {
    user,
    isAuthenticated,
    loading,
    canAccess,
    redirectToLogin,
    redirectToDashboard
  };
}; 