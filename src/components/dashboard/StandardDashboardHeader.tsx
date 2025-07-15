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
  GraduationCap,
  Info,
  Link2,
  User,
  Building,
  Book
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useUserProfile } from '@/hooks/useUserProfile';

interface StandardDashboardHeaderProps {
  user: any;
  entity?: any;
  stats?: Array<{
    icon: string;
    value: string | number;
    label: string;
  }>;
  customStats?: Array<{
    icon: string;
    value: string | number;
    label: string;
  }>;
  plan?: {
    name: string;
    price: string;
  };
  role?: string;
  isVerified?: boolean;
  userId?: string;
}

// Função para validar se a entidade deve ser mostrada
const shouldShowEntity = (userType: string, user: any) => {
  if (userType === 'individual_collector' && (user as any).companyAffiliation) {
    return true;
  }
  if (['cooperative_owner', 'collector_company_owner', 'partner_owner'].includes(userType)) {
    return true;
  }
  return false;
};

const getDefaultStats = (userType: string, entityType?: string, user?: any) => {
  switch (userType) {
    case 'common_user':
      return [
        {
          icon: 'Package',
          value: '450kg',
          label: 'Total Reciclado'
        },
        {
          icon: 'Star',
          value: 4.7,
          label: 'Avaliação'
        },
        {
          icon: 'Calendar',
          value: '3',
          label: 'Coletas Agendadas'
        },
        {
          icon: 'Ticket',
          value: '5',
          label: 'Cupons Disponíveis'
        }
      ];
    case 'individual_collector':
      const collector = user as any;
      if (collector.companyAffiliation) {
        return [
          {
            icon: 'Package',
            value: collector.collectorMetrics.totalCollected,
            label: 'Total Coletado'
          },
          {
            icon: 'Star',
            value: collector.collectorMetrics.rating,
            label: 'Avaliação'
          },
          {
            icon: 'Calendar',
            value: collector.companyAffiliation.since,
            label: 'Na plataforma'
          },
          {
            icon: 'Building2',
            value: collector.companyAffiliation.companyName,
            label: 'Empresa Vinculada'
          }
        ];
      } else {
        return [
          {
            icon: 'Package',
            value: collector.collectorMetrics.totalCollected,
            label: 'Total Coletado'
          },
          {
            icon: 'Star',
            value: collector.collectorMetrics.rating,
            label: 'Avaliação'
          },
          {
            icon: 'Calendar',
            value: '36 meses',
            label: 'Na plataforma'
          },
          {
            icon: 'Building2',
            value: 'Não Vinculado',
            label: 'Empresa Vinculada'
          }
        ];
      }
    case 'cooperative_owner':
      return [
        {
          icon: 'Users',
          value: '45',
          label: 'Cooperados'
        },
        {
          icon: 'Star',
          value: 4.8,
          label: 'Avaliação'
        },
        {
          icon: 'Package',
          value: '15.2t',
          label: 'Volume Mensal'
        },
        {
          icon: 'Calendar',
          value: '3 anos',
          label: 'Na Plataforma'
        }
      ];
    case 'collector_company_owner':
      return [
        {
          icon: 'Users',
          value: '35',
          label: 'Coletores'
        },
        {
          icon: 'Star',
          value: 4.9,
          label: 'Avaliação'
        },
        {
          icon: 'Package',
          value: '25.5t',
          label: 'Volume Mensal'
        },
        {
          icon: 'Calendar',
          value: '2 anos',
          label: 'Na Plataforma'
        }
      ];
    case 'partner_owner':
      if (entityType === 'restaurant') {
        return [
          {
            icon: 'Users',
            value: '1500',
            label: 'Clientes/Mês'
          },
          {
            icon: 'Leaf',
            value: '450kg',
            label: 'Desperdício Evitado'
          },
          {
            icon: 'Ticket',
            value: '15',
            label: 'Cupons Ativos'
          },
          {
            icon: 'Star',
            value: 4.8,
            label: 'Avaliação'
          }
        ];
      } else if (entityType === 'store') {
        return [
          {
            icon: 'Users',
            value: '2500',
            label: 'Clientes/Mês'
          },
          {
            icon: 'Package',
            value: '1200kg',
            label: 'Embalagens Recicladas'
          },
          {
            icon: 'Ticket',
            value: '25',
            label: 'Cupons Ativos'
          },
          {
            icon: 'Star',
            value: 4.6,
            label: 'Avaliação'
          }
        ];
      } else if (entityType === 'educational') {
        return [
          {
            icon: 'Users',
            value: '500',
            label: 'Alunos Impactados'
          },
          {
            icon: 'Book',
            value: '3',
            label: 'Programas Ativos'
          },
          {
            icon: 'Ticket',
            value: '10',
            label: 'Cupons Ativos'
          },
          {
            icon: 'Star',
            value: 4.9,
            label: 'Avaliação'
          }
        ];
      }
      return [];
    default:
      return [];
  }
};

// Função para converter dados do perfil real para estatísticas
const getStatsFromProfile = (profile: any, userType: string, entityType?: string) => {
  if (!profile?.stats) return null;

  const stats = profile.stats;
  
  switch (userType) {
    case 'common_user':
      return [
        {
          icon: 'Package',
          value: `${stats.total_recycled || 0}kg`,
          label: 'Total Reciclado'
        },
        {
          icon: 'Star',
          value: stats.rating || 4.7,
          label: 'Avaliação'
        },
        {
          icon: 'Calendar',
          value: stats.scheduled_collections || 3,
          label: 'Coletas Agendadas'
        },
        {
          icon: 'Ticket',
          value: stats.available_coupons || 5,
          label: 'Cupons Disponíveis'
        }
      ];
    case 'individual_collector':
      return [
        {
          icon: 'Package',
          value: `${stats.total_collected || 0}kg`,
          label: 'Total Coletado'
        },
        {
          icon: 'Star',
          value: stats.rating || 0,
          label: 'Avaliação'
        },
        {
          icon: 'Calendar',
          value: stats.platform_time || '0 meses',
          label: 'Na plataforma'
        },
        {
          icon: 'Building2',
          value: profile.company_affiliation?.company_name || 'Não Vinculado',
          label: 'Empresa Vinculada'
        }
      ];
    case 'cooperative_owner':
      return [
        {
          icon: 'Users',
          value: stats.team_members || 45,
          label: 'Cooperados'
        },
        {
          icon: 'Star',
          value: stats.rating || 4.8,
          label: 'Avaliação'
        },
        {
          icon: 'Package',
          value: stats.monthly_volume || '15.2t',
          label: 'Volume Mensal'
        },
        {
          icon: 'Calendar',
          value: stats.platform_time || '3 anos',
          label: 'Na Plataforma'
        }
      ];
    case 'collector_company_owner':
      return [
        {
          icon: 'Users',
          value: stats.team_members || 35,
          label: 'Coletores'
        },
        {
          icon: 'Star',
          value: stats.rating || 4.9,
          label: 'Avaliação'
        },
        {
          icon: 'Package',
          value: stats.monthly_volume || '25.5t',
          label: 'Volume Mensal'
        },
        {
          icon: 'Calendar',
          value: stats.platform_time || '2 anos',
          label: 'Na Plataforma'
        }
      ];
    case 'partner_owner':
      if (entityType === 'restaurant') {
        return [
          {
            icon: 'Users',
            value: stats.customers_per_month || 1500,
            label: 'Clientes/Mês'
          },
          {
            icon: 'Leaf',
            value: stats.green_meals || 120,
            label: 'Refeições Verdes'
          },
          {
            icon: 'Ticket',
            value: stats.coupons_served || 12,
            label: 'Cupons Servidos'
          },
          {
            icon: 'Calendar',
            value: stats.platform_time || '2 anos',
            label: 'Na Plataforma'
          }
        ];
      } else if (entityType === 'store') {
        return [
          {
            icon: 'Users',
            value: stats.customers_per_month || 800,
            label: 'Clientes/Mês'
          },
          {
            icon: 'Ticket',
            value: stats.coupons_validated || 8,
            label: 'Cupons Validados'
          },
          {
            icon: 'Leaf',
            value: '95%',
            label: 'Produtos Verdes'
          },
          {
            icon: 'Calendar',
            value: stats.platform_time || '1 ano',
            label: 'Na Plataforma'
          }
        ];
      } else if (entityType === 'educational') {
        return [
          {
            icon: 'Users',
            value: stats.customers_per_month || 500,
            label: 'Alunos'
          },
          {
            icon: 'Book',
            value: stats.green_classes || 20,
            label: 'Aulas Verdes'
          },
          {
            icon: 'Leaf',
            value: '85%',
            label: 'Práticas Sustentáveis'
          },
          {
            icon: 'Calendar',
            value: stats.platform_time || '3 anos',
            label: 'Na Plataforma'
          }
        ];
      }
      return [];
    default:
      return null;
  }
};

// Função para obter o ícone correto baseado no tipo de entidade
const getEntityIcon = (type: string) => {
  switch (type) {
    case 'cooperative':
      return Users;
    case 'collector_company':
      return Building2;
    case 'restaurant':
      return Utensils;
    case 'store':
      return ShoppingBag;
    case 'educational':
      return GraduationCap;
    default:
      return Building2;
  }
};

// Função para obter a cor do badge baseado no tipo de usuário
const getUserTypeColor = (userType: string) => {
  switch (userType) {
    case 'common_user':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'individual_collector':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'cooperative_owner':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    case 'collector_company_owner':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
    case 'partner_owner':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

// Função para obter o ícone do tipo de usuário
const getUserTypeIcon = (userType: string) => {
  switch (userType) {
    case 'common_user':
      return User;
    case 'individual_collector':
      return Package;
    case 'cooperative_owner':
      return Users;
    case 'collector_company_owner':
      return Building2;
    case 'partner_owner':
      return Building;
    default:
      return User;
  }
};

// Função para formatar números com unidades
const formatValue = (value: string | number): string => {
  // Se for string, verifica se contém unidades específicas
  if (typeof value === 'string') {
    // Verifica se é uma data ou texto simples
    if (value.includes('ano') || value.includes('mês') || 
        value.includes('dia') || !value.match(/[0-9]/)) {
      return value;
    }

    // Extrai o número e a unidade
    const match = value.match(/^([\d,.]+)\s*(.*)$/);
    if (!match) return value;

    const [, num, unit] = match;
    const number = parseFloat(num.replace(',', '.'));

    // Formata o número
    let formattedNum = number;
    let formattedUnit = unit;

    // Converte kg para toneladas se necessário
    if (unit.toLowerCase() === 'kg' && number >= 1000) {
      formattedNum = number / 1000;
      formattedUnit = 't';
    }

    // Formata o número com separador de milhares
    const formatted = new Intl.NumberFormat('pt-BR', {
      maximumFractionDigits: 1,
      minimumFractionDigits: formattedNum % 1 === 0 ? 0 : 1
    }).format(formattedNum);

    return `${formatted}${formattedUnit ? ' ' + formattedUnit : ''}`;
  }

  // Se for número
  if (typeof value === 'number') {
    if (value % 1 === 0) {
      return new Intl.NumberFormat('pt-BR').format(value);
    }
    return new Intl.NumberFormat('pt-BR', {
      maximumFractionDigits: 1
    }).format(value);
  }

  return String(value);
};

// Função para formatar datas yyyy-mm-dd para dd/mm/aa
function formatDateBR(dateStr: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year.slice(2)}`;
  }
  return dateStr;
}

// Mapeamento de ícones (mover para o topo do arquivo)
const iconMap: Record<string, React.ElementType> = {
  Package,
  Star,
  Calendar,
  Ticket,
  Users,
  Leaf,
  Building2,
  MapPin,
  Book,
  Gift: Award,
  Info
};

const StandardDashboardHeader: React.FC<StandardDashboardHeaderProps> = ({
  user,
  entity,
  stats,
  customStats,
  plan,
  role,
  isVerified,
  userId
}) => {
  const userProfile = useUserProfile(userId);
  // Se for usuário comum do mock, nunca mostrar loading
  if (user.userType === 'common_user' && !userProfile.userData) {
    // ...renderização do card igual ao return principal, mas usando apenas os dados do mock...
    const finalStats = stats || getDefaultStats(user.userType, entity?.type, user);
    const showEntity = false;
    const EntityIcon = Building2;
    const UserTypeIcon = getUserTypeIcon(user.userType);
    const displayUser = user;
    return (
      <Card className="mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="relative shrink-0">
                <Avatar className="h-16 w-16 sm:h-24 sm:w-24">
                  {displayUser.avatar?.src && (
                    <AvatarImage src={displayUser.avatar.src} alt={displayUser.name} />
                  )}
                  <AvatarFallback>{displayUser.avatar?.fallback}</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-xl sm:text-2xl font-bold truncate">{displayUser.name}</h1>
                  {displayUser.level && (
                    <Badge variant="secondary" className="h-fit bg-neutro/10 text-neutro hover:bg-neutro/20">
                      <Award className="h-3 w-3 mr-1" />
                      Nível {displayUser.level.label}
                    </Badge>
                  )}
                </div>
                {role && (
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-white text-green-700 border-green-300">
                      {role}
                    </Badge>
                  </div>
                )}
                {plan && (
                  <div className="mb-2">
                    <Badge variant="outline" className="bg-white">
                      Plano {plan.name} • {plan.price}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            <Separator className="my-2" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {finalStats.map((stat, i) => {
                const Icon = iconMap[stat.icon] || Info;
                return (
                  <div key={i} className="flex flex-col items-center">
                    <Icon className="h-6 w-6 mb-1 text-neutro" />
                    <span className="font-bold text-lg">{stat.value}</span>
                    <span className="text-xs text-muted-foreground text-center">{stat.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Usar dados reais se disponíveis, senão usar dados mockados
  let finalStats = null;
  if (userProfile.userData) {
    if (user.userType === 'individual_collector') {
      const stats = userProfile.userData.stats || {};
      const companyName = userProfile.userData.company_affiliation?.company_name || 'Não Vinculado';
      finalStats = [
        {
          icon: 'Package',
          value: stats.total_collected ?? 0,
          label: 'Total Coletado'
        },
        {
          icon: 'Star',
          value: stats.rating ?? 0,
          label: 'Avaliação'
        },
        {
          icon: 'Calendar',
          value: stats.platform_time ?? '0 meses',
          label: 'Na plataforma'
        },
        {
          icon: 'Building2',
          value: companyName,
          label: 'Empresa Vinculada'
        }
      ];
    } else if (user.userType === 'cooperative_owner') {
      const stats = userProfile.userData.stats || {};
      finalStats = [
        {
          icon: 'Users',
          value: stats.team_members ?? 0,
          label: 'Cooperados'
        },
        {
          icon: 'Star',
          value: stats.rating ?? 0,
          label: 'Avaliação'
        },
        {
          icon: 'Package',
          value: stats.monthly_volume ?? 0,
          label: 'Volume Mensal'
        },
        {
          icon: 'Calendar',
          value: stats.platform_time ?? '0 meses',
          label: 'Na Plataforma'
        }
      ];
    } else if (user.userType === 'collector_company_owner') {
      const stats = userProfile.userData.stats || {};
      finalStats = [
        {
          icon: 'Users',
          value: stats.team_members ?? 0,
          label: 'Coletores'
        },
        {
          icon: 'Star',
          value: stats.rating ?? 0,
          label: 'Avaliação'
        },
        {
          icon: 'Package',
          value: stats.monthly_volume ?? 0,
          label: 'Volume Mensal'
        },
        {
          icon: 'Calendar',
          value: stats.platform_time ?? '0 meses',
          label: 'Na Plataforma'
        }
      ];
    } else if (user.userType === 'partner_owner') {
      const stats = userProfile.userData.stats || {};
      let partnerStats = [];
      if (entity?.type === 'restaurant') {
        partnerStats = [
          {
            icon: 'Users',
            value: stats.customers_per_month ?? 0,
            label: 'Clientes/Mês'
          },
          {
            icon: 'Leaf',
            value: stats.green_meals ?? 0,
            label: 'Refeições Verdes'
          },
          {
            icon: 'Ticket',
            value: stats.coupons_served ?? 0,
            label: 'Cupons Servidos'
          },
          {
            icon: 'Calendar',
            value: stats.platform_time ?? '0 meses',
            label: 'Na Plataforma'
          }
        ];
      } else if (entity?.type === 'store') {
        partnerStats = [
          {
            icon: 'Users',
            value: stats.customers_per_month ?? 0,
            label: 'Clientes/Mês'
          },
          {
            icon: 'Ticket',
            value: stats.coupons_validated ?? 0,
            label: 'Cupons Validados'
          },
          {
            icon: 'Leaf',
            value: stats.green_products ?? 0,
            label: 'Produtos Verdes'
          },
          {
            icon: 'Calendar',
            value: stats.platform_time ?? '0 meses',
            label: 'Na Plataforma'
          }
        ];
      } else if (entity?.type === 'educational') {
        partnerStats = [
          {
            icon: 'Users',
            value: stats.customers_per_month ?? 0,
            label: 'Alunos'
          },
          {
            icon: 'Book',
            value: stats.green_classes ?? 0,
            label: 'Aulas Verdes'
          },
          {
            icon: 'Leaf',
            value: stats.sustainable_practices ?? 0,
            label: 'Práticas Sustentáveis'
          },
          {
            icon: 'Calendar',
            value: stats.platform_time ?? '0 meses',
            label: 'Na Plataforma'
          }
        ];
      }
      finalStats = partnerStats;
    } else if (user.userType === 'common_user') {
      const stats = userProfile.userData.stats || {};
      finalStats = [
        {
          icon: 'Package',
          value: stats.total_recycled ?? 0,
          label: 'Total Reciclado'
        },
        {
          icon: 'Star',
          value: stats.rating ?? 0,
          label: 'Avaliação'
        },
        {
          icon: 'Calendar',
          value: stats.scheduled_collections ?? 0,
          label: 'Coletas Agendadas'
        },
        {
          icon: 'Ticket',
          value: stats.available_coupons ?? 0,
          label: 'Cupons Disponíveis'
        }
      ];
    } else {
      finalStats = userProfile.userData ? getStatsFromProfile(userProfile.userData, user.userType, entity?.type) : null;
    }
  }
  // Para cada perfil, se não houver dados, mostrar 0 ou referência amigável
  if (user.userType === 'individual_collector' && !userProfile.userData) {
    finalStats = [
      {
        icon: 'Package',
        value: 0,
        label: 'Total Coletado'
      },
      {
        icon: 'Star',
        value: 0,
        label: 'Avaliação'
      },
      {
        icon: 'Calendar',
        value: '0 meses',
        label: 'Na plataforma'
      },
      {
        icon: 'Building2',
        value: 'Não Vinculado',
        label: 'Empresa Vinculada'
      }
    ];
  }
  if (user.userType === 'cooperative_owner' && !userProfile.userData) {
    finalStats = [
      {
        icon: 'Users',
        value: 0,
        label: 'Cooperados'
      },
      {
        icon: 'Star',
        value: 0,
        label: 'Avaliação'
      },
      {
        icon: 'Package',
        value: 0,
        label: 'Volume Mensal'
      },
      {
        icon: 'Calendar',
        value: '0 meses',
        label: 'Na Plataforma'
      }
    ];
  }
  if (user.userType === 'collector_company_owner' && !userProfile.userData) {
    finalStats = [
      {
        icon: 'Users',
        value: 0,
        label: 'Coletores'
      },
      {
        icon: 'Star',
        value: 0,
        label: 'Avaliação'
      },
      {
        icon: 'Package',
        value: 0,
        label: 'Volume Mensal'
      },
      {
        icon: 'Calendar',
        value: '0 meses',
        label: 'Na Plataforma'
      }
    ];
  }
  if (user.userType === 'partner_owner' && !userProfile.userData) {
    let partnerStats = [];
    if (entity?.type === 'restaurant') {
      partnerStats = [
        {
          icon: 'Users',
          value: 0,
          label: 'Clientes/Mês'
        },
        {
          icon: 'Leaf',
          value: 0,
          label: 'Refeições Verdes'
        },
        {
          icon: 'Ticket',
          value: 0,
          label: 'Cupons Servidos'
        },
        {
          icon: 'Calendar',
          value: '0 meses',
          label: 'Na Plataforma'
        }
      ];
    } else if (entity?.type === 'store') {
      partnerStats = [
        {
          icon: 'Users',
          value: 0,
          label: 'Clientes/Mês'
        },
        {
          icon: 'Ticket',
          value: 0,
          label: 'Cupons Validados'
        },
        {
          icon: 'Leaf',
          value: 0,
          label: 'Produtos Verdes'
        },
        {
          icon: 'Calendar',
          value: '0 meses',
          label: 'Na Plataforma'
        }
      ];
    } else if (entity?.type === 'educational') {
      partnerStats = [
        {
          icon: 'Users',
          value: 0,
          label: 'Alunos'
        },
        {
          icon: 'Book',
          value: 0,
          label: 'Aulas Verdes'
        },
        {
          icon: 'Leaf',
          value: 0,
          label: 'Práticas Sustentáveis'
        },
        {
          icon: 'Calendar',
          value: '0 meses',
          label: 'Na Plataforma'
        }
      ];
    }
    finalStats = partnerStats;
  }
  
  const showEntity = shouldShowEntity(user.userType, user);
  const EntityIcon = entity ? getEntityIcon(entity.type) : Building2;
  const UserTypeIcon = getUserTypeIcon(user.userType);

  // Usar dados reais do perfil se disponíveis
  const displayUser = userProfile.userData ? {
    ...user,
    name: userProfile.userData.name,
    avatar: userProfile.userData.avatar ? { src: userProfile.userData.avatar, fallback: userProfile.userData.name.charAt(0) } : user.avatar,
    level: user.level
  } : user;

  const displayEntity = userProfile.userData?.entity ? {
    ...entity,
    name: userProfile.userData.entity.name,
    type: userProfile.userData.entity.type,
    isVerified: userProfile.userData.entity.is_verified,
    avatar: userProfile.userData.entity.avatar ? { src: userProfile.userData.entity.avatar, fallback: userProfile.userData.entity.name.charAt(0) } : entity?.avatar,
    metrics: userProfile.userData.entity.metrics
  } : entity;

  if (userProfile.loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="relative shrink-0">
                <div className="h-16 w-16 sm:h-24 sm:w-24 bg-gray-200 rounded-full animate-pulse" />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
              </div>
            </div>
            <Separator className="my-2" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          {/* Seção Principal - Layout Mobile First */}
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Avatar com Indicador de Vínculo */}
            <div className="relative shrink-0">
              <Avatar className="h-16 w-16 sm:h-24 sm:w-24">
                {displayUser.avatar?.src && (
                  <AvatarImage src={displayUser.avatar.src} alt={displayUser.name} />
                )}
                <AvatarFallback>{displayUser.avatar?.fallback}</AvatarFallback>
              </Avatar>
              {showEntity && (
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
                  <Link2 className="h-4 w-4 text-green-500" />
                </div>
              )}
            </div>

            {/* Container Principal de Informações */}
            <div className="flex-1 min-w-0">
              {/* Grupo 1: Nome e Nível */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-xl sm:text-2xl font-bold truncate">{displayUser.name}</h1>
                {displayUser.level && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="secondary" className="h-fit bg-neutro/10 text-neutro hover:bg-neutro/20">
                          <Award className="h-3 w-3 mr-1" />
                          Nível {displayUser.level.label}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <p className="font-medium">Nível {displayUser.level.label}</p>
                          <p>Pontuação: {displayUser.level.value}</p>
                          <p className="text-xs text-muted-foreground">Clique para ver mais detalhes</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              {/* Grupo 2: Cargo/Função e Verificação */}
              {role && (
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-white text-green-700 border-green-300">
                    {role}
                  </Badge>
                  {isVerified && (
                    <span className="text-green-600 text-xs font-semibold">Verificado</span>
                  )}
                </div>
              )}

              {/* Grupo 3: Plano */}
              {plan && (
                <div className="mb-2">
                  <Badge variant="outline" className="bg-white">
                    Plano {plan.name} • {plan.price}
                  </Badge>
                </div>
              )}

              {/* Grupo 4: Informações da Entidade */}
              {showEntity && displayEntity && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                    {displayEntity.avatar?.src && (
                      <AvatarImage src={displayEntity.avatar.src} alt={displayEntity.name} />
                    )}
                    <AvatarFallback>{displayEntity.avatar?.fallback}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium truncate">{displayEntity.name}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge 
                            variant="outline" 
                            className="bg-white text-xs flex items-center gap-1 whitespace-nowrap"
                          >
                            <EntityIcon className="h-3 w-3 shrink-0" />
                            <span>
                              {displayEntity.type === 'cooperative' && 'Cooperativa'}
                              {displayEntity.type === 'collector_company' && 'Empresa Coletora'}
                              {displayEntity.type === 'restaurant' && 'Restaurante'}
                              {displayEntity.type === 'store' && 'Loja'}
                              {displayEntity.type === 'educational' && 'Instituição Educacional'}
                            </span>
                            {displayEntity.isVerified && (
                              <span className="text-green-500 ml-1">• Verificada</span>
                            )}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p className="font-medium">{displayEntity.name}</p>
                            <p>ID: {displayEntity.id}</p>
                            <p>Tipo: {displayEntity.type === 'cooperative' ? 'Cooperativa' : 
                                     displayEntity.type === 'collector_company' ? 'Empresa Coletora' : 
                                     displayEntity.type === 'restaurant' ? 'Restaurante' : 
                                     displayEntity.type === 'store' ? 'Loja' : 
                                     displayEntity.type === 'educational' ? 'Instituição Educacional' : 
                                     displayEntity.type}</p>
                            <p>Ativa desde: {displayEntity.metrics?.activeSince || '-'}</p>
                            {displayEntity.metrics?.rating && (
                              <p>Avaliação: {displayEntity.metrics.rating}</p>
                            )}
                            {displayEntity.isVerified && <p className="text-green-500">Entidade Verificada</p>}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              )}

              {/* Informações de Vínculo do Coletor */}
              {displayUser.userType === 'individual_collector' && userProfile.userData?.company_affiliation && (
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    Vinculado desde {userProfile.userData.company_affiliation.since || '-'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Separador */}
          <Separator className="my-2" />
          
          {/* Seção de Estatísticas - Grid Responsivo Melhorado */}
          {finalStats && finalStats.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full">
              {finalStats.map((stat, index) => {
                const Icon = iconMap[stat.icon];
                const isDate = stat.label.toLowerCase().includes('plataforma') && typeof stat.value === 'string';
                return (
                  <div 
                    key={index} 
                    className={cn(
                      "flex flex-col gap-1.5 p-3 rounded-lg transition-colors",
                      "bg-slate-50 hover:bg-slate-100",
                      "dark:bg-slate-900/50 dark:hover:bg-slate-900/70"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {Icon && (
                        <div className="p-1 rounded-md bg-white dark:bg-slate-800">
                          <Icon className="h-4 w-4 text-neutro shrink-0" />
                        </div>
                      )}
                      <span className="text-sm text-muted-foreground truncate">
                        {stat.label}
                      </span>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-lg sm:text-xl font-semibold truncate">
                            {isDate ? formatDateBR(stat.value as string) : formatValue(stat.value)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{stat.label}: {isDate ? formatDateBR(stat.value as string) : formatValue(stat.value)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StandardDashboardHeader; 