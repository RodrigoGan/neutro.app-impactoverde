import React from 'react';
import { Target, Users, Package, Star, Calendar, Award, TrendingUp, Info } from 'lucide-react';
import { useLevels } from '@/hooks/useLevels';
import { userLevels } from './levelsData';

interface UserLevelCardProps {
  userId?: string;
  userType: 'partner' | 'cooperative' | 'common' | 'collector' | 'company';
  levelType: 'bronze' | 'silver' | 'gold';
}

export const UserLevelCard: React.FC<UserLevelCardProps> = ({ userId, userType, levelType }) => {
  const { userLevel, levelProgress, loading, error } = useLevels(userId, userType);

  const getLevelColor = () => {
    switch (levelType) {
      case 'bronze':
        return 'bg-amber-600';
      case 'silver':
        return 'bg-gray-400';
      case 'gold':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-600';
    }
  };

  const getMetricIcon = (key: string) => {
    switch (key) {
      case 'collections':
        return <Package className="h-4 w-4" />;
      case 'kg':
        return <TrendingUp className="h-4 w-4" />;
      case 'ratings':
        return <Star className="h-4 w-4" />;
      case 'months':
        return <Calendar className="h-4 w-4" />;
      case 'activeCoupons':
        return <Award className="h-4 w-4" />;
      case 'sales':
        return <TrendingUp className="h-4 w-4" />;
      case 'activeCollectors':
        return <Users className="h-4 w-4" />;
      case 'points':
        return <Target className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getMetricLabel = (key: string) => {
    switch (key) {
      case 'collections':
        return 'Coletas';
      case 'kg':
        return 'Kg Coletados';
      case 'ratings':
        return 'Avaliações';
      case 'months':
        return 'Meses Ativo';
      case 'activeCoupons':
        return 'Cupons Ativos';
      case 'sales':
        return 'Vendas';
      case 'activeCollectors':
        return 'Coletores Ativos';
      case 'points':
        return 'Pontos';
      case 'averageRating':
        return 'Avaliação Média';
      default:
        return key;
    }
  };

  const formatRequirement = (key: string, value: number) => {
    switch (key) {
      case 'points':
        return `${value.toLocaleString()} pontos`;
      case 'collections':
        return `${value} coletas`;
      case 'kg':
        return `${value.toLocaleString()}kg`;
      case 'months':
        return `${value} ${value === 1 ? 'mês' : 'meses'}`;
      case 'activeCoupons':
        return `${value} cupons`;
      case 'ratings':
        return `${value} avaliações`;
      case 'sales':
        return `${value} vendas`;
      case 'activeCollectors':
        return `${value} coletores`;
      case 'averageRating':
        return `${value} estrelas`;
      default:
        return value.toString();
    }
  };

  const getRelevantRequirements = () => {
    const levelData = userLevels[userType as keyof typeof userLevels];
    const level = levelData[levelType];
    const requirements = level.requirements;
    
    const relevantKeys = {
      common: ['collections', 'kg', 'ratings', 'months'],
      collector: ['collections', 'kg', 'ratings', 'months'],
      cooperative: ['collections', 'kg', 'sales', 'months'],
      company: ['activeCollectors', 'kg', 'sales', 'months'],
      partner: ['activeCoupons', 'points', 'ratings', 'months']
    };

    return relevantKeys[userType]
      .filter(key => requirements[key as keyof typeof requirements] !== undefined && requirements[key as keyof typeof requirements] > 0)
      .map(key => ({
        key,
        value: requirements[key as keyof typeof requirements],
        label: getMetricLabel(key),
        icon: getMetricIcon(key)
      }));
  };

  const getUserTypeTitle = () => {
    switch (userType) {
      case 'common':
        return 'Usuário Comum';
      case 'collector':
        return 'Coletor Individual';
      case 'partner':
        return 'Empresa Parceira';
      case 'cooperative':
        return 'Cooperativa';
      case 'company':
        return 'Empresa Coletora';
      default:
        return 'Usuário';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <div className={`${getLevelColor()} p-4 text-center`}>
          <div className="h-8 bg-white/20 rounded animate-pulse mb-2" />
          <div className="h-4 bg-white/20 rounded animate-pulse w-3/4 mx-auto" />
        </div>
        <div className="p-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <div className={`${getLevelColor()} p-4 text-center`}>
          <h3 className="text-2xl font-bold text-white">Erro</h3>
        </div>
        <div className="p-6">
          <div className="text-red-500 text-sm">
            Erro ao carregar dados do nível: {error}
          </div>
        </div>
      </div>
    );
  }

  const levelData = userLevels[userType as keyof typeof userLevels];
  const level = levelData[levelType];

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      <div className={`${getLevelColor()} p-4 text-center`}>
        <h3 className="text-2xl font-bold text-white">{level.name}</h3>
        <p className="text-white/90 mt-2 text-sm">{level.description}</p>
      </div>
      
      <div className="p-6">
        {/* Tipo de Usuário */}
        <div className="mb-4">
          <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
            {getUserTypeTitle()}
          </span>
        </div>

        {/* Requisitos */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Target className="h-5 w-5 text-gray-600" />
            Requisitos para {level.name}
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {getRelevantRequirements().map(({ key, value, label, icon }) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-gray-500">
                    {icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {formatRequirement(key, value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Benefícios */}
        <div>
          <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Award className="h-5 w-5 text-gray-600" />
            Benefícios
          </h4>
          <ul className="space-y-2">
            {level.benefits.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-700">
                <span className="text-green-500 mt-1">•</span>
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Observações */}
        {level.benefits.notes && level.benefits.notes.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Observações
            </h5>
            <ul className="space-y-1">
              {level.benefits.notes.map((note, index) => (
                <li key={index} className="text-sm text-blue-700">
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}; 