import React, { useState, useEffect } from 'react';
import { Image, Loader2 } from 'lucide-react';

interface StandardPhotoGalleryProps {
  fotos?: string[];
  maxWidth?: number;
  maxHeight?: number;
}

const StandardPhotoGallery: React.FC<StandardPhotoGalleryProps> = ({ 
  fotos = [], 
  maxWidth = 200,
  maxHeight = 200 
}) => {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Resetar estados quando as fotos mudarem
    setLoading({});
    setErrors({});
  }, [fotos]);

  if (!fotos || fotos.length === 0) {
    return <span className="text-muted-foreground text-sm italic">Nenhuma foto enviada ainda.</span>;
  }

  const handleImageError = (foto: string) => {
    setErrors(prev => ({
      ...prev,
      [foto]: 'Erro ao carregar imagem'
    }));
    setLoading(prev => ({
      ...prev,
      [foto]: false
    }));
  };

  const handleImageLoad = (foto: string) => {
    setLoading(prev => ({
      ...prev,
      [foto]: false
    }));
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {fotos.map((foto, idx) => (
        <div key={idx} className="relative w-20 h-20">
          {loading[foto] && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          {errors[foto] ? (
            <div className="w-full h-full flex items-center justify-center bg-muted rounded border border-dashed">
              <Image className="h-6 w-6 text-muted-foreground" />
            </div>
          ) : (
            <img
              src={foto}
              alt={`Foto do material ${idx + 1}`}
              className="w-full h-full object-cover rounded border"
              style={{ maxWidth, maxHeight }}
              onError={() => handleImageError(foto)}
              onLoad={() => handleImageLoad(foto)}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default React.memo(StandardPhotoGallery); 