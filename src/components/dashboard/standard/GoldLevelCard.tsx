import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Recycle, Star, LayoutDashboard, FileText, HeadsetIcon, Map, DollarSign, Clock, BarChart2 } from 'lucide-react';

interface GoldLevelCardProps {
  userType: string;
  userLevel: {
    label: string;
    color?: string;
  };
  maxLevelMessage?: string;
  maintenanceRequirements: {
    description: string;
    icon: string;
  }[];
  benefits: {
    description: string;
    icon: string;
  }[];
  onViewMetrics?: () => void;
}

const getIconComponent = (iconName: string) => {
  const icons: { [key: string]: React.ReactNode } = {
    Users: <Users className="h-4 w-4 text-green-600" />,
    Recycle: <Recycle className="h-4 w-4 text-green-600" />,
    Star: <Star className="h-4 w-4 text-green-600" />,
    LayoutDashboard: <LayoutDashboard className="h-4 w-4 text-green-600" />,
    FileText: <FileText className="h-4 w-4 text-green-600" />,
    HeadsetIcon: <HeadsetIcon className="h-4 w-4 text-green-600" />,
    Map: <Map className="h-4 w-4 text-green-600" />,
    DollarSign: <DollarSign className="h-4 w-4 text-green-600" />,
    Clock: <Clock className="h-4 w-4 text-green-600" />
  };
  return icons[iconName] || <Star className="h-4 w-4 text-green-600" />;
};

const GoldLevelCard: React.FC<GoldLevelCardProps> = ({
  userType,
  userLevel,
  maxLevelMessage = 'Parabéns! Você alcançou o nível máximo',
  maintenanceRequirements,
  benefits,
  onViewMetrics
}) => {
  return (
    <Card className="bg-white">
      <CardContent className="pt-6 space-y-6">
        {/* Cabeçalho padronizado */}
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="h-5 w-5 text-neutro" />
          <h2 className="text-2xl font-bold">Metas e Progresso</h2>
          <span className="ml-2 px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Nível {userLevel.label}</span>
        </div>

        {/* Mensagem de Nível Máximo */}
        <p className="text-green-700 font-medium">{maxLevelMessage}</p>

        {/* Requisitos de Manutenção */}
        <div className="space-y-3">
          <p className="font-medium">Mantenha seu status {userLevel.label}:</p>
          <div className="space-y-2">
            {maintenanceRequirements.map((req, index) => (
              <div key={index} className="flex items-center gap-2">
                {getIconComponent(req.icon)}
                <p className="text-sm text-gray-600">{req.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefícios */}
        <div className="space-y-3">
          <p className="font-medium">Benefícios do Nível {userLevel.label}:</p>
          <div className="space-y-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                {getIconComponent(benefit.icon)}
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Botão Ver Métricas */}
        <Button 
          variant="outline" 
          className="w-full text-green-700 border-green-200 hover:bg-green-50"
          onClick={onViewMetrics}
        >
          <BarChart2 className="w-4 h-4 mr-2" />
          Ver Métricas Detalhadas
        </Button>
      </CardContent>
    </Card>
  );
};

export default GoldLevelCard; 