import React, { useState } from 'react';
import { Star, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface StandardRatingFormProps {
  tipo: 'coletor' | 'solicitante';
  avaliadoPor: string;
  onSubmit: (avaliacao: { estrelas: number; comentario?: string; pontual?: boolean }) => void;
  onCancel?: () => void;
}

const StandardRatingForm: React.FC<StandardRatingFormProps> = ({
  tipo,
  avaliadoPor,
  onSubmit,
  onCancel
}) => {
  const [estrelas, setEstrelas] = useState(0);
  const [comentario, setComentario] = useState('');
  const [pontual, setPontual] = useState(true); // Padrão: chegou no horário
  const [hoverEstrela, setHoverEstrela] = useState(0);

  const getTitulo = () => {
    if (tipo === 'coletor') {
      return 'Avaliar o coletor';
    }
    return 'Avaliar o solicitante';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (estrelas > 0) {
      const avaliacao: { estrelas: number; comentario?: string; pontual?: boolean } = {
        estrelas,
        comentario: comentario.trim() || undefined
      };
      
      // Adicionar pontualidade apenas para avaliação de coletor
      if (tipo === 'coletor') {
        avaliacao.pontual = pontual;
      }
      
      onSubmit(avaliacao);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" onPointerDown={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, idx) => (
          <button
            key={idx}
            type="button"
            className="focus:outline-none"
            onClick={() => setEstrelas(idx + 1)}
            onMouseEnter={() => setHoverEstrela(idx + 1)}
            onMouseLeave={() => setHoverEstrela(0)}
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                idx < (hoverEstrela || estrelas)
                  ? 'text-yellow-500 fill-yellow-500'
                  : 'text-muted-foreground'
              }`}
            />
          </button>
        ))}
        <span className="text-sm ml-2">{estrelas} estrelas</span>
      </div>

      {/* Flag de Pontualidade - Apenas para avaliação de coletor */}
      {tipo === 'coletor' && (
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pontualidade
          </Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="pontual"
              checked={pontual}
              onCheckedChange={(checked) => setPontual(checked as boolean)}
            />
            <Label 
              htmlFor="pontual" 
              className="text-sm cursor-pointer flex items-center gap-2"
            >
              {pontual ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-green-700 font-medium">Chegou no horário</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-orange-700 font-medium">Chegou atrasado</span>
                </>
              )}
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            {pontual 
              ? "O coletor chegou no horário agendado" 
              : "O coletor chegou com atraso"
            }
          </p>
        </div>
      )}

      <Textarea
        placeholder="Adicione um comentário (opcional)"
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        onPointerDown={(e) => e.stopPropagation()}
        className="min-h-[100px]"
      />

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={estrelas === 0}>
          Enviar Avaliação
        </Button>
      </div>
    </form>
  );
};

export default StandardRatingForm; 