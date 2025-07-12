import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useReferral } from '@/hooks/useReferral';
import { Share2, Copy, Users, Trophy, Clock, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const ReferralCard: React.FC = () => {
  const {
    stats,
    referralCode,
    loading,
    error,
    shareReferral,
    getShareLink,
    totalReferrals,
    completedReferrals,
    pendingReferrals,
    usageCount,
    maxUsage
  } = useReferral();

  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    try {
      const success = await shareReferral();
      if (success) {
        toast({
          title: "Compartilhado!",
          description: "Sua indicação foi compartilhada com sucesso.",
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível compartilhar. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao compartilhar indicação.",
        variant: "destructive",
      });
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

  const handleCopyCode = async () => {
    if (!referralCode) return;

    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast({
        title: "Código copiado!",
        description: "Seu código de indicação foi copiado.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o código.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Sistema de Indicação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Sistema de Indicação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600">
            <p>Erro ao carregar dados de indicação</p>
            <Button variant="outline" size="sm" className="mt-2">
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const usagePercentage = maxUsage > 0 ? (usageCount / maxUsage) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Sistema de Indicação
        </CardTitle>
        <CardDescription>
          Compartilhe o Neutro e ganhe pontos por cada indicação!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Código de Indicação */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Seu Código de Indicação</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 p-3 bg-gray-50 border rounded-md font-mono text-lg text-center">
              {referralCode || 'Carregando...'}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              disabled={!referralCode}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-2">
          <Button
            onClick={handleShare}
            disabled={sharing || !referralCode}
            className="flex-1"
          >
            <Share2 className="h-4 w-4 mr-2" />
            {sharing ? 'Compartilhando...' : 'Compartilhar'}
          </Button>
          <Button
            variant="outline"
            onClick={handleCopyLink}
            disabled={!referralCode}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copiar Link
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">Completadas</span>
            </div>
            <div className="text-2xl font-bold text-green-700">{completedReferrals}</div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Pendentes</span>
            </div>
            <div className="text-2xl font-bold text-blue-700">{pendingReferrals}</div>
          </div>
        </div>

        {/* Progresso de Uso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uso do código</span>
            <span>{usageCount} / {maxUsage}</span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
          <p className="text-xs text-gray-500">
            {usageCount === maxUsage 
              ? 'Limite de uso atingido' 
              : `${maxUsage - usageCount} indicações restantes`
            }
          </p>
        </div>

        {/* Benefícios */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-600" />
            Benefícios da Indicação
          </h4>
          <ul className="text-sm space-y-1 text-gray-700">
            <li>• 50 pontos por indicação completa</li>
            <li>• Bônus de 100 pontos ao indicar 3 pessoas</li>
            <li>• Ajuda o planeta e ganha recompensas</li>
            <li>• Código válido para até {maxUsage} indicações</li>
          </ul>
        </div>

        {/* Como Funciona */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Como funciona:</h4>
          <ol className="text-sm space-y-1 text-gray-600">
            <li>1. Compartilhe seu código com amigos</li>
            <li>2. Eles se cadastram usando seu código</li>
            <li>3. Quando completarem o primeiro cadastro, você ganha pontos!</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}; 