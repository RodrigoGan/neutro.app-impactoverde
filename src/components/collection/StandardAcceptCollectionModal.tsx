import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface StandardAcceptCollectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (observacao?: string) => void;
}

const StandardAcceptCollectionModal: React.FC<StandardAcceptCollectionModalProps> = ({
  open,
  onOpenChange,
  onConfirm,
}) => {
  const [observacao, setObservacao] = useState('');

  const handleConfirm = () => {
    onConfirm(observacao || undefined);
    setObservacao('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aceitar Coleta</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="observacao">Observação (opcional)</Label>
              <Textarea
                id="observacao"
                placeholder="Adicione uma observação sobre a coleta..."
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>
            Confirmar Aceite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StandardAcceptCollectionModal; 