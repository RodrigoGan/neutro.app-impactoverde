import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useReferral } from '@/hooks/useReferral';
import { Users, CheckCircle, Clock, XCircle, Calendar } from 'lucide-react';

export const ReferralList: React.FC = () => {
  const { referrals, loading, error } = useReferral();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Minhas Indicações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
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
            Minhas Indicações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600">
            <p>Erro ao carregar indicações</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completa</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Pendente</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expirada</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (referrals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Minhas Indicações
          </CardTitle>
          <CardDescription>
            Histórico de pessoas que você indicou
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Nenhuma indicação ainda</p>
            <p className="text-sm">
              Compartilhe seu código de indicação para começar a ganhar pontos!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Minhas Indicações
        </CardTitle>
        <CardDescription>
          Histórico de pessoas que você indicou ({referrals.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {referrals.map((referral) => (
            <div
              key={referral.id}
              className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* Avatar */}
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-gradient-to-br from-green-400 to-blue-500 text-white">
                  {referral.referredId.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Informações */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium truncate">
                    Usuário {referral.referredId.slice(0, 8)}...
                  </span>
                  {getStatusIcon(referral.status)}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-3 w-3" />
                  <span>Indicado em {formatDate(referral.createdAt)}</span>
                </div>

                {referral.completedAt && (
                  <div className="flex items-center gap-2 text-sm text-green-600 mt-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>Completado em {formatDate(referral.completedAt)}</span>
                  </div>
                )}
              </div>

              {/* Status e Pontos */}
              <div className="flex flex-col items-end gap-2">
                {getStatusBadge(referral.status)}
                
                {referral.pointsAwarded && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    +50 pontos
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Resumo */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {referrals.filter(r => r.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completadas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {referrals.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pendentes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {referrals.filter(r => r.pointsAwarded).length * 50}
              </div>
              <div className="text-sm text-gray-600">Pontos Ganhos</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 