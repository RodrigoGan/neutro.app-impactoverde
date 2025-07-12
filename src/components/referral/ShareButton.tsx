import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Check } from 'lucide-react';
import { useReferral } from '@/hooks/useReferral';
import { toast } from '@/hooks/use-toast';

interface ShareButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showText?: boolean;
  message?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  variant = 'default',
  size = 'default',
  className = '',
  showText = true,
  message
}) => {
  const { referralCode, shareReferral, getShareLink } = useReferral();
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (!referralCode) {
      toast({
        title: "Erro",
        description: "Código de indicação não disponível.",
        variant: "destructive",
      });
      return;
    }

    setSharing(true);
    try {
      const success = await shareReferral(message);
      if (success) {
        toast({
          title: "Compartilhado!",
          description: "Sua indicação foi compartilhada com sucesso.",
        });
      } else {
        // Fallback para copiar link
        await handleCopyLink();
      }
    } catch (error) {
      // Fallback para copiar link
      await handleCopyLink();
    } finally {
      setSharing(false);
    }
  };

  const handleCopyLink = async () => {
    const link = getShareLink();
    if (!link) return;

    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  if (!referralCode) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      disabled={sharing}
      className={className}
    >
      {sharing ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      ) : copied ? (
        <Check className="h-4 w-4" />
      ) : (
        <Share2 className="h-4 w-4" />
      )}
      {showText && (
        <span className="ml-2">
          {sharing ? 'Compartilhando...' : copied ? 'Copiado!' : 'Compartilhar'}
        </span>
      )}
    </Button>
  );
}; 