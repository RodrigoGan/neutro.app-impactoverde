import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Recycle, Star, LayoutDashboard, FileText, HeadsetIcon, Package, Scale, ThumbsUp, Calendar, Clock, Map, BookOpen, Ticket } from 'lucide-react';
import { BarChart2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { userLevels } from '@/components/levels/levelsData';

interface GoldLevelProgressCardProps {
  title?: string;
  userLevel: {
    label: string;
    color?: string;
  };
  maxLevelMessage?: string;
  maintenanceRequirements?: {
    description: string;
    icon: string;
  }[];
  benefits?: {
    description: string;
    icon: string;
  }[];
  userType: string;
  currentPoints: number;
  nextLevelPoints: number;
  monthlyGoals: any[];
}

const getIconComponent = (iconName: string) => {
  const icons: { [key: string]: React.ReactNode } = {
    Users: <Users className="h-4 w-4 text-green-600" />,
    Recycle: <Recycle className="h-4 w-4 text-green-600" />,
    Star: <Star className="h-4 w-4 text-green-600" />,
    LayoutDashboard: <LayoutDashboard className="h-4 w-4 text-green-600" />,
    FileText: <FileText className="h-4 w-4 text-green-600" />,
    HeadsetIcon: <HeadsetIcon className="h-4 w-4 text-green-600" />,
    Package: <Package className="h-4 w-4 text-green-600" />,
    Scale: <Scale className="h-4 w-4 text-green-600" />,
    ThumbsUp: <ThumbsUp className="h-4 w-4 text-green-600" />,
    Calendar: <Calendar className="h-4 w-4 text-green-600" />,
    Clock: <Clock className="h-4 w-4 text-green-600" />,
    Map: <Map className="h-4 w-4 text-green-600" />,
    BookOpen: <BookOpen className="h-4 w-4 text-green-600" />,
    Ticket: <Ticket className="h-4 w-4 text-green-600" />
  };
  return icons[iconName] || <Star className="h-4 w-4 text-green-600" />;
};

const defaultBenefits = [
  { description: 'Certificado Ouro', icon: 'Award' },
  { description: 'Badge Ouro no perfil', icon: 'Star' },
  { description: 'Participação em sorteios/campanhas (quando disponível)', icon: 'Ticket' },
  { description: 'Destaque em ranking geral', icon: 'TrendingUp' },
  { description: 'Convite para desafios mensais (quando disponível)', icon: 'Calendar' },
  { description: 'Pode resgatar até 20 cupons de desconto por mês', icon: 'Ticket' }
];

// Função para mapear benefício para ícone
function getBenefitIcon(description: string) {
  if (description.toLowerCase().includes('certificado')) return 'Award';
  if (description.toLowerCase().includes('badge')) return 'Star';
  if (description.toLowerCase().includes('sorteio') || description.toLowerCase().includes('campanha')) return 'Ticket';
  if (description.toLowerCase().includes('ranking')) return 'TrendingUp';
  if (description.toLowerCase().includes('convite') || description.toLowerCase().includes('evento') || description.toLowerCase().includes('treinamento') || description.toLowerCase().includes('desafio')) return 'Calendar';
  if (description.toLowerCase().includes('cupons')) return 'Ticket';
  if (description.toLowerCase().includes('divulgação') || description.toLowerCase().includes('lista') || description.toLowerCase().includes('destaque')) return 'Users';
  if (description.toLowerCase().includes('acesso a cupons básicos')) return 'Ticket';
  return 'Award';
}

// Função utilitária para mapear userType para chave correta
function mapUserTypeKey(userType: string) {
  if (!userType) return 'common';
  if (userType.includes('common')) return 'common';
  if (userType.includes('collector')) return 'collector';
  if (userType.includes('partner')) return 'partner';
  if (userType.includes('cooperative')) return 'cooperative';
  if (userType.includes('company')) return 'company';
  return userType.toLowerCase();
}

// Função utilitária para mapear label para chave correta
function mapLevelKey(label: string) {
  if (!label) return 'bronze';
  const l = label.toLowerCase();
  if (l.startsWith('bronze')) return 'bronze';
  if (l.startsWith('prata') || l.startsWith('silver')) return 'silver';
  if (l.startsWith('ouro') || l.startsWith('gold')) return 'gold';
  return l;
}

const GoldLevelProgressCard: React.FC<GoldLevelProgressCardProps> = ({
  title = "Metas e Progresso",
  userLevel,
  maxLevelMessage,
  maintenanceRequirements,
  benefits,
  userType,
  currentPoints,
  nextLevelPoints,
  monthlyGoals
}) => {
  const navigate = useNavigate();

  // Buscar benefícios reais do sistema conforme perfil e nível
  const levelKey = mapLevelKey(userLevel.label); // bronze, prata, ouro
  const userTypeKey = mapUserTypeKey(userType); // common, collector, partner, cooperative, company
  const levelData = userLevels[userTypeKey]?.[levelKey];
  const realBenefits = levelData?.benefits?.features?.map((desc: string) => ({ description: desc, icon: getBenefitIcon(desc) })) || [];

  const handleViewMetrics = () => {
    navigate('/standard/levels', {
      state: {
        userType,
        userLevel,
        currentPoints,
        nextLevelPoints,
        monthlyGoals
      }
    });
  };

  return (
    <Card className="bg-white">
      <CardHeader className="space-y-2 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center justify-between sm:flex-1 w-full">
            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
              <Trophy className="h-5 w-5 text-neutro" />
              {title}
            </CardTitle>
            <Badge variant="secondary" className="bg-neutro/10 text-neutro sm:hidden">
              Nível {userLevel.label}
            </Badge>
          </div>
          <Badge variant="secondary" className="bg-neutro/10 text-neutro hidden sm:inline-flex">
            Nível {userLevel.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mensagem de Nível Máximo */}
        {maxLevelMessage && (
          <p className="text-green-700 font-medium">{maxLevelMessage}</p>
        )}

        {/* Requisitos de Manutenção */}
        {maintenanceRequirements && maintenanceRequirements.length > 0 && (
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
        )}

        {/* Benefícios */}
        {realBenefits.length > 0 ? (
          <div className="space-y-3">
            <p className="font-medium">Benefícios do Nível {userLevel.label}:</p>
            <div className="space-y-2">
              {realBenefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  {getIconComponent(benefit.icon)}
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="font-medium text-red-600">Nenhum benefício disponível para este nível (verifique o cadastro do nível no sistema).</p>
          </div>
        )}

        {/* Botão Ver Métricas */}
        <Button 
          variant="outline" 
          className="w-full text-green-700 border-green-200 hover:bg-green-50"
          onClick={handleViewMetrics}
        >
          <BarChart2 className="w-4 h-4 mr-2" />
          Ver Métricas Detalhadas
        </Button>
      </CardContent>
    </Card>
  );
};

export default GoldLevelProgressCard; 