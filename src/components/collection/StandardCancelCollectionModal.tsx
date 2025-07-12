import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface StandardCancelCollectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (motivo: string) => void;
  hora?: string;
  data?: Date;
}

// Função utilitária para verificar se o cancelamento está dentro do período agendado
function isNowWithinPeriod(period: string, date: Date): boolean {
  const now = new Date();
  if (now.toDateString() !== date.toDateString()) return false;
  const hour = now.getHours();
  if (period === 'morning' || period === 'Manhã') return hour >= 8 && hour < 12;
  if (period === 'afternoon' || period === 'Tarde') return hour >= 12 && hour < 18;
  if (period === 'night' || period === 'Noite') return hour >= 18 && hour < 23;
  return false;
}

function getPeriodFromTime(time?: string): 'Manhã' | 'Tarde' | 'Noite' {
  if (!time) return 'Tarde';
  const hour = parseInt(time.split(':')[0]);
  if (hour >= 5 && hour < 12) return 'Manhã';
  if (hour >= 12 && hour < 18) return 'Tarde';
  return 'Noite';
}

const StandardCancelCollectionModal: React.FC<StandardCancelCollectionModalProps> = ({ open, onOpenChange, onConfirm, hora, data }) => {
  const [motivo, setMotivo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Verifica se haverá penalidade
  const penalidade = hora && data && isNowWithinPeriod(getPeriodFromTime(hora), data);

  // Resetar o estado quando o modal for fechado
  useEffect(() => {
    if (!open) {
      setMotivo('');
      setIsLoading(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!motivo.trim()) {
      toast.error('Por favor, informe o motivo do cancelamento.');
      return;
    }

    try {
      setIsLoading(true);
      // Penalidade: se estiver dentro do período, aplica -5 pontos
      if (penalidade) {
        await import('@/hooks/usePoints').then(mod => mod.usePoints().addPoints('common_cancel_last_minute'));
        toast.warning('Você está cancelando dentro do período agendado. Isso resultará em penalidade de -5 pontos.');
      }
      await onConfirm(motivo);
      setMotivo('');
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao cancelar coleta:', error);
      toast.error('Erro ao cancelar coleta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setMotivo('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cancelar Coleta</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {penalidade && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 rounded">
              Atenção: Cancelar dentro do período agendado resultará em penalidade de <b>-5 pontos</b>!
            </div>
          )}
          <div>
            <Label>Motivo do Cancelamento</Label>
            <Textarea 
              value={motivo} 
              onChange={e => setMotivo(e.target.value)} 
              placeholder="Informe o motivo do cancelamento..."
              className="min-h-[100px]"
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Voltar
          </Button>
          <Button 
            onClick={handleConfirm} 
            variant="destructive"
            disabled={!motivo.trim() || isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Cancelando...
              </div>
            ) : (
              'Confirmar Cancelamento'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StandardCancelCollectionModal; 