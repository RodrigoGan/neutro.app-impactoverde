import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import StandardRatingForm from './StandardRatingForm';

interface StandardRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipo: 'coletor' | 'solicitante';
  avaliadoPor: string;
  onSubmit: (avaliacao: { estrelas: number; comentario?: string; pontual?: boolean }) => void;
  nomeColetor?: string;
  fotoColetor?: string;
  nomeSolicitante?: string;
  fotoSolicitante?: string;
}

const StandardRatingModal: React.FC<StandardRatingModalProps> = ({
  isOpen,
  onClose,
  tipo,
  avaliadoPor,
  onSubmit,
  nomeColetor,
  fotoColetor,
  nomeSolicitante,
  fotoSolicitante,
}) => {
  const getTitulo = () => {
    if (tipo === 'coletor') {
      return 'Avaliar o Coletor';
    }
    return 'Avaliar o Solicitante';
  };

  const getDescricao = () => {
    if (tipo === 'coletor') {
      return 'Sua avaliação ajuda a manter a qualidade do serviço e reconhecer o bom trabalho dos coletores.';
    }
    return 'Sua avaliação ajuda a manter a qualidade do serviço e reconhecer o bom trabalho dos solicitantes.';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{getTitulo()}</DialogTitle>
          {tipo === 'solicitante' && (
            <div className="text-green-700 text-sm font-semibold mb-2 mt-1">
              Avalie o solicitante e ganhe pontos para subir de nível!
            </div>
          )}
          {tipo === 'coletor' && (
            <div className="text-green-700 text-sm font-semibold mb-2 mt-1">
              Avalie o coletor e ganhe pontos para subir de nível!
            </div>
          )}
          {tipo === 'coletor' && nomeColetor && (
            <div className="flex flex-col items-center gap-2 mb-2 mt-2">
              {fotoColetor && (
                <img src={fotoColetor} alt={nomeColetor} className="w-14 h-14 rounded-full object-cover border" />
              )}
              <span className="font-semibold text-base text-neutral-800">{nomeColetor}</span>
            </div>
          )}
          {tipo === 'solicitante' && nomeSolicitante && (
            <div className="flex flex-col items-center gap-2 mb-2 mt-2">
              {fotoSolicitante && (
                <img src={fotoSolicitante} alt={nomeSolicitante} className="w-14 h-14 rounded-full object-cover border" />
              )}
              <span className="font-semibold text-base text-neutral-800">{nomeSolicitante}</span>
            </div>
          )}
          <DialogDescription>{getDescricao()}</DialogDescription>
        </DialogHeader>
        <StandardRatingForm
          tipo={tipo}
          avaliadoPor={avaliadoPor}
          onSubmit={(avaliacao) => {
            onSubmit(avaliacao);
            onClose();
          }}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default StandardRatingModal; 