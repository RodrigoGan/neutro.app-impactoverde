import React from 'react';
import { Star } from 'lucide-react';

interface StandardRatingStarsProps {
  estrelas: number;
  comentario?: string;
  tipo: 'coletor' | 'solicitante';
  avaliadoPor: string;
}

const StandardRatingStars: React.FC<StandardRatingStarsProps> = ({ estrelas, comentario, tipo, avaliadoPor }) => {
  const getTitulo = () => {
    if (tipo === 'coletor') {
      return 'Avaliação do coletor';
    }
    return 'Avaliação do solicitante';
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-medium">{getTitulo()}</h5>
        <span className="text-xs text-muted-foreground">Avaliado por: {avaliadoPor}</span>
      </div>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Star
            key={idx}
            className={`h-4 w-4 ${idx < estrelas ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`}
          />
        ))}
        <span className="text-sm ml-2">{estrelas} estrelas</span>
      </div>
      {comentario && (
        <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
          {comentario}
        </p>
      )}
    </div>
  );
};

export default StandardRatingStars; 