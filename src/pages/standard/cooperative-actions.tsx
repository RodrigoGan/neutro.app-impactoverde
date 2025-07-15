import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calendar, Plus, Loader2 } from 'lucide-react';
import NewActionModal from '@/components/dashboard/standard/NewActionModal';
import { useToast } from '@/components/ui/use-toast';
import { useCooperativeActions, CooperativeAction } from '@/hooks/useCooperativeActions';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AppFooter from '@/components/AppFooter';

const CooperativeActionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Usar o ID da cooperativa do usuário logado
  const entityId = user?.entity?.id;
  
  const { 
    actions, 
    loading, 
    error, 
    createAction, 
    updateAction, 
    deleteAction 
  } = useCooperativeActions(entityId);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionToEdit, setActionToEdit] = useState<CooperativeAction | undefined>();
  const [actionToDelete, setActionToDelete] = useState<CooperativeAction | undefined>();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleNewAction = async (data: Omit<CooperativeAction, 'id' | 'created_at' | 'updated_at'>) => {
    if (actionToEdit) {
      // Atualizar ação existente
      const result = await updateAction(actionToEdit.id, data);
      
      if (result.error) {
        toast({
          title: "Erro ao atualizar ação",
          description: result.error,
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Ação atualizada com sucesso!",
        description: "As alterações foram salvas.",
      });
    } else {
      // Criar nova ação
      const result = await createAction(data);
      
      if (result.error) {
        toast({
          title: "Erro ao criar ação",
          description: result.error,
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Ação criada com sucesso!",
        description: "A nova ação foi adicionada à lista.",
      });
    }
    
    setIsModalOpen(false);
    setActionToEdit(undefined);
  };

  const handleEdit = (action: CooperativeAction) => {
    setActionToEdit(action);
    setIsModalOpen(true);
  };

  const handleDelete = (action: CooperativeAction) => {
    setActionToDelete(action);
  };

  const confirmDelete = async () => {
    if (actionToDelete) {
      const result = await deleteAction(actionToDelete.id);
      
      if (result.error) {
        toast({
          title: "Erro ao excluir ação",
          description: result.error,
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Ação excluída com sucesso!",
        description: "A ação foi removida da lista.",
      });
      
      setActionToDelete(undefined);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActionToEdit(undefined);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Gerenciar Ações</h1>
        </div>

        <div className="flex justify-end mb-6">
          <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Nova Ação
          </Button>
        </div>

        {loading ? (
          <div className="text-center space-y-4 py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Carregando ações...</p>
          </div>
        ) : error ? (
          <div className="text-center space-y-4 py-8">
            <p className="text-muted-foreground">Erro ao carregar ações: {error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          </div>
        ) : (
          actions.length === 0 ? (
            <div className="text-center space-y-4 py-8">
              <p className="text-muted-foreground">Nenhuma ação cadastrada ainda.<br/>Clique em "Nova Ação" para começar a organizar as atividades da sua cooperativa!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {actions.map(action => (
                <Card key={action.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-neutro" />
                        {action.title}
                      </div>
                      <span className="text-sm px-3 py-1 rounded-full bg-neutro/10 text-neutro">
                        {action.status}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Data: {new Date(action.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm">{action.description}</p>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(action)}
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDelete(action)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}

        <NewActionModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleNewAction}
          actionToEdit={actionToEdit}
        />

        <AlertDialog open={!!actionToDelete} onOpenChange={() => setActionToDelete(undefined)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Ação</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta ação? Esta ação não poderá ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div className="mt-8">
        <AppFooter />
      </div>
    </div>
  );
}

export default CooperativeActionsPage; 