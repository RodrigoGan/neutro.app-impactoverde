import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Loader2 } from 'lucide-react';
import { useCooperativeActions } from '@/hooks/useCooperativeActions';
import { useAuth } from '@/contexts/AuthContext';

interface StandardCooperativeUpcomingActionsCardProps {
  cooperativeId?: string;
}

const StandardCooperativeUpcomingActionsCard: React.FC<StandardCooperativeUpcomingActionsCardProps> = ({ 
  cooperativeId 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Usar o ID da cooperativa fornecido ou buscar do usuário logado
  const entityId = cooperativeId || user?.entity?.id;
  
  const { actions, loading, error } = useCooperativeActions(entityId);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-neutro" />
          Próximas Ações
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center space-y-4">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Carregando ações...</p>
          </div>
        ) : error ? (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Erro ao carregar ações. Tente novamente.</p>
            <Button variant="outline" onClick={() => navigate('/standard/cooperative-actions')}>Gerenciar Ações</Button>
          </div>
        ) : actions.length === 0 ? (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Organize suas atividades! Cadastre sua primeira ação.</p>
            <Button variant="outline" onClick={() => navigate('/standard/cooperative-actions')}>Gerenciar Ações</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {actions.slice(0, 3).map(action => (
              <div key={action.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{new Date(action.date).toLocaleDateString()}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-neutro/10 text-neutro">{action.status}</span>
              </div>
            ))}
            <div className="flex justify-center mt-2">
              <Button variant="outline" onClick={() => navigate('/standard/cooperative-actions')}>Gerenciar Ações</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StandardCooperativeUpcomingActionsCard; 