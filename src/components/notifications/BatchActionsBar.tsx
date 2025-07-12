import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Archive, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BatchActionsBarProps {
  selectedCount: number;
  onMarkAsRead: () => void;
  onMarkAsUnread: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
}

export const BatchActionsBar: React.FC<BatchActionsBarProps> = ({
  selectedCount,
  onMarkAsRead,
  onMarkAsUnread,
  onArchive,
  onDelete,
  onClearSelection
}) => {
  if (selectedCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg z-50"
      >
        <div className="container mx-auto max-w-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">{selectedCount} selecionado(s)</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearSelection}
              className="h-8 w-8"
              aria-label="Limpar seleção"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onMarkAsRead}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Marcar como lidas
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={onMarkAsUnread}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Marcar como não lidas
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={onArchive}
              className="flex items-center gap-2"
            >
              <Archive className="h-4 w-4" />
              Arquivar
            </Button>

            <Button
              size="sm"
              variant="destructive"
              onClick={onDelete}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}; 