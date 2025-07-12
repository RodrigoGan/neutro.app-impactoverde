import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Building2, 
  Users, 
  Package, 
  Calendar, 
  Star, 
  Ticket, 
  Truck, 
  Leaf, 
  DollarSign,
  Award,
  Clock,
  MapPin,
  BarChart,
  Target,
  Trophy,
  Utensils,
  ShoppingBag,
  GraduationCap
} from 'lucide-react';

interface DashboardHeaderProps {
  userInfo: {
    name: string;
    avatar?: {
      src?: string;
      fallback: string;
    };
    level?: {
      label: string;
      type: 'bronze' | 'prata' | 'ouro';
    };
    role: {
      label: string;
      icon?: React.ReactNode;
    };
    plan?: {
      name: string;
      price: string;
    };
    userType: 'collector' | 'company' | 'common_user' | 'admin' | 'partner' | 'cooperative' | 'restricted';
    isOrganization?: boolean; // Novo campo para identificar se é uma organização
  };
  companyInfo?: {
    name: string;
    avatar?: {
      src?: string;
      fallback: string;
    };
    type: string;
    isVerified?: boolean;
  };
  stats?: Array<{
    icon: React.ReactNode;
    value: string | number;
    label: string;
  }>;
  customStats?: Array<{
    icon: React.ReactNode;
    value: string | number;
    label: string;
  }>;
}

// Função para validar se o companyInfo deve ser mostrado
const shouldShowCompanyInfo = (userType: DashboardHeaderProps['userInfo']['userType'], isOrganization?: boolean) => {
  // Se for uma organização, não mostra companyInfo
  if (isOrganization) return false;

  // Tipos que sempre devem mostrar companyInfo
  if (['admin', 'collector'].includes(userType)) return true;

  // Partner só mostra se não for organização
  if (userType === 'partner' && !isOrganization) return true;

  // Outros tipos não mostram
  return false;
};

const getDefaultStats = (userType: DashboardHeaderProps['userInfo']['userType'], isOrganization?: boolean) => {
  switch (userType) {
    case 'collector':
      return [
        {
          icon: <Building2 className="h-4 w-4 text-muted-foreground" />,
          value: "Empresa",
          label: "Vinculado a"
        },
        {
          icon: <Star className="h-4 w-4 text-muted-foreground" />,
          value: "4.8",
          label: "Avaliação média"
        },
        {
          icon: <Package className="h-4 w-4 text-muted-foreground" />,
          value: "1234kg",
          label: "coletados"
        },
        {
          icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
          value: "6 meses",
          label: "na plataforma"
        }
      ];
    case 'company':
      return [
        {
          icon: <Users className="h-4 w-4 text-muted-foreground" />,
          value: "35",
          label: "Coletores"
        },
        {
          icon: <Star className="h-4 w-4 text-muted-foreground" />,
          value: "4.9",
          label: "Avaliação"
        },
        {
          icon: <Package className="h-4 w-4 text-muted-foreground" />,
          value: "5000kg",
          label: "Volume Mensal"
        },
        {
          icon: <Ticket className="h-4 w-4 text-muted-foreground" />,
          value: "8",
          label: "Cupons Ativos"
        }
      ];
    case 'common_user':
      return [
        {
          icon: <Package className="h-4 w-4 text-muted-foreground" />,
          value: "450kg",
          label: "Total Reciclado"
        },
        {
          icon: <Star className="h-4 w-4 text-muted-foreground" />,
          value: "4.7",
          label: "Avaliação"
        },
        {
          icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
          value: "3",
          label: "Coletas Agendadas"
        },
        {
          icon: <Ticket className="h-4 w-4 text-muted-foreground" />,
          value: "5",
          label: "Cupons Disponíveis"
        }
      ];
    case 'admin':
      return [
        {
          icon: <Users className="h-4 w-4 text-muted-foreground" />,
          value: "42",
          label: "Equipe"
        },
        {
          icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
          value: "2 anos",
          label: "Na Empresa"
        },
        {
          icon: <Star className="h-4 w-4 text-muted-foreground" />,
          value: "4.9",
          label: "Avaliação"
        },
        {
          icon: <Package className="h-4 w-4 text-muted-foreground" />,
          value: "15t",
          label: "Volume Total"
        }
      ];
    case 'partner':
      return isOrganization ? [
        {
          icon: <Users className="h-4 w-4 text-muted-foreground" />,
          value: "12",
          label: "Funcionários"
        },
        {
          icon: <Star className="h-4 w-4 text-muted-foreground" />,
          value: "4.8",
          label: "Avaliação"
        },
        {
          icon: <Ticket className="h-4 w-4 text-muted-foreground" />,
          value: "15",
          label: "Cupons Ativos"
        },
        {
          icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
          value: "1 ano",
          label: "Parceiro"
        }
      ] : [
        {
          icon: <Building2 className="h-4 w-4 text-muted-foreground" />,
          value: "Loja",
          label: "Vinculado a"
        },
        {
          icon: <Star className="h-4 w-4 text-muted-foreground" />,
          value: "4.8",
          label: "Avaliação"
        },
        {
          icon: <Ticket className="h-4 w-4 text-muted-foreground" />,
          value: "5",
          label: "Cupons Ativos"
        },
        {
          icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
          value: "6 meses",
          label: "Na Loja"
        }
      ];
    case 'cooperative':
      return [
        {
          icon: <Users className="h-4 w-4 text-muted-foreground" />,
          value: "25",
          label: "Cooperados"
        },
        {
          icon: <Star className="h-4 w-4 text-muted-foreground" />,
          value: "4.9",
          label: "Avaliação"
        },
        {
          icon: <Package className="h-4 w-4 text-muted-foreground" />,
          value: "8t",
          label: "Volume Mensal"
        },
        {
          icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
          value: "3 anos",
          label: "Na Plataforma"
        }
      ];
    case 'restricted':
      return [
        {
          icon: <Package className="h-4 w-4 text-muted-foreground" />,
          value: "200kg",
          label: "Total Reciclado"
        },
        {
          icon: <Star className="h-4 w-4 text-muted-foreground" />,
          value: "4.5",
          label: "Avaliação"
        },
        {
          icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
          value: "1",
          label: "Coleta Agendada"
        },
        {
          icon: <Ticket className="h-4 w-4 text-muted-foreground" />,
          value: "2",
          label: "Cupons Disponíveis"
        }
      ];
    default:
      return [];
  }
};

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userInfo,
  companyInfo,
  stats,
  customStats
}) => {
  // Validação de regras de negócio
  if (['admin', 'collector'].includes(userInfo.userType) && !companyInfo) {
    console.error(`Erro: ${userInfo.userType} deve ter companyInfo`);
  }

  if (userInfo.userType === 'cooperative' && companyInfo) {
    console.error('Erro: Cooperativa não deve ter companyInfo');
  }

  // Determina se deve mostrar companyInfo
  const showCompanyInfo = shouldShowCompanyInfo(userInfo.userType, userInfo.isOrganization);

  // Prioriza customStats, depois stats, e por último as estatísticas padrão baseadas no userType
  const finalStats = customStats || stats || getDefaultStats(userInfo.userType, userInfo.isOrganization);

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Seção Principal - Lado Esquerdo */}
          <div className="flex items-start gap-4">
            {/* Avatar do Usuário */}
            <Avatar className="h-24 w-24">
              {userInfo.avatar?.src && (
                <AvatarImage src={userInfo.avatar.src} alt={userInfo.name} />
              )}
              <AvatarFallback>{userInfo.avatar?.fallback}</AvatarFallback>
            </Avatar>

            <div className="flex flex-col gap-2">
              {/* Nome e Nível do Usuário */}
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{userInfo.name}</h1>
                {userInfo.level && (
                  <Badge variant="secondary" className="bg-neutro/10 text-neutro">
                    Nível {userInfo.level.label}
                  </Badge>
                )}
              </div>

              {/* Cargo e Plano */}
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-neutro/10 text-neutro">
                  {userInfo.role.icon}
                  {userInfo.role.label}
                </Badge>
                {userInfo.plan && (
                  <Badge variant="outline" className="bg-white">
                    Plano {userInfo.plan.name} • {userInfo.plan.price}
                  </Badge>
                )}
              </div>

              {/* Informações da Empresa */}
              {showCompanyInfo && companyInfo && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    {companyInfo.avatar?.src && (
                      <AvatarImage src={companyInfo.avatar.src} alt={companyInfo.name} />
                    )}
                    <AvatarFallback>{companyInfo.avatar?.fallback}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{companyInfo.name}</span>
                  <Badge variant="outline" className="bg-white text-xs">
                    {companyInfo.type}
                    {companyInfo.isVerified && " • Verificada"}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          
          {/* Seção de Estatísticas - Lado Direito */}
          {finalStats && finalStats.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
              {finalStats.map((stat, index) => (
                <div key={index} className="flex items-center gap-2">
                  {stat.icon}
                  <div>
                    <p className="text-sm font-medium">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardHeader; 