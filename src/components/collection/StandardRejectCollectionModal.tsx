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

interface StandardRejectCollectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (motivo: string) => void;
}

const StandardRejectCollectionModal: React.FC<StandardRejectCollectionModalProps> = ({
  open,
  onOpenChange,
  onConfirm,
}) => {
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!motivo.trim()) {
      setError('Por favor, informe o motivo da recusa');
      return;
    }
    onConfirm(motivo);
    setMotivo('');
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recusar Coleta</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="motivo" className="text-red-600">Motivo da Recusa *</Label>
              <Textarea
                id="motivo"
                placeholder="Informe o motivo da recusa..."
                value={motivo}
                onChange={(e) => {
                  setMotivo(e.target.value);
                  if (error) setError('');
                }}
                className={`mt-2 ${error ? 'border-red-500' : ''}`}
              />
              {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Confirmar Recusa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StandardRejectCollectionModal; 