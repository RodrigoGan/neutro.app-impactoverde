import React from 'react';
import { UserLevelCard } from './UserLevelCard';
import { userLevels } from './levelsData';

interface UserLevelsProps {
  userType: 'partner' | 'cooperative' | 'common' | 'collector' | 'company';
}

export const UserLevels: React.FC<UserLevelsProps> = ({ userType }) => {
  const getTitle = () => {
    switch (userType) {
      case 'partner':
        return 'Níveis para Parceiros';
      case 'cooperative':
        return 'Níveis para Cooperativas';
      case 'common':
        return 'Níveis para Usuários Comuns';
      case 'collector':
        return 'Níveis para Coletores Individuais';
      case 'company':
        return 'Níveis para Empresas Coletoras';
      default:
        return 'Níveis';
    }
  };

  const levels = userLevels[userType];

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-8">{getTitle()}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(levels).map(([levelType, levelData]) => (
          <UserLevelCard
            key={levelType}
            level={levelData}
            userType={userType}
            levelType={levelType as 'bronze' | 'prata' | 'ouro'}
          />
        ))}
      </div>
    </div>
  );
}; 