import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  highlight?: string; // Ex: "Top 1", "5 anos", "10 cupons"
}

interface StandardTeamManagementCardProps {
  companyType: 'cooperative' | 'collector_company' | 'partner';
  team: TeamMember[];
  teamAverageLabel: string; // Ex: "Média geral da equipe"
  teamAverageValue: string; // Ex: "4.7 estrelas", "8 cupons/mês"
  onViewAll?: () => void;
}

const getTitleByCompanyType = (type: string) => {
  switch (type) {
    case 'cooperative':
      return 'Gestão de Cooperados';
    case 'collector_company':
      return 'Gestão de Equipe';
    case 'partner':
      return 'Gestão de Funcionários';
    default:
      return 'Gestão de Equipe';
  }
};

const StandardTeamManagementCard: React.FC<StandardTeamManagementCardProps> = ({
  companyType,
  team,
  teamAverageLabel,
  teamAverageValue,
  onViewAll
}) => {
  const navigate = useNavigate();
  const handleViewAll = () => {
    if (companyType === 'cooperative') {
      navigate('/cooperativa/cooperados');
    } else if (companyType === 'partner') {
      // Detectar tipo de parceiro pelo time mockado (ou adaptar conforme integração futura)
      let type = 'restaurant';
      if (team[0]?.role?.toLowerCase().includes('vendedor') || team[0]?.role?.toLowerCase().includes('estoquista')) type = 'store';
      if (team[0]?.role?.toLowerCase().includes('professor') || team[0]?.role?.toLowerCase().includes('coordenador')) type = 'educational';
      navigate(`/partner/team-members-list?type=${type}`);
    } else if (onViewAll) {
      onViewAll();
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-2 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <Users className="h-5 w-5 text-neutro" />
            {getTitleByCompanyType(companyType)}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {team.length === 0 ? (
            <div className="text-muted-foreground text-center py-4 text-sm">
              {companyType === 'cooperative'
                ? 'Nenhum cooperado cadastrado ainda.'
                : companyType === 'collector_company'
                  ? 'Nenhum membro cadastrado ainda.'
                  : 'Nenhum funcionário cadastrado ainda.'}
            </div>
          ) : (
            team.slice(0, 3).map((member) => (
              <div key={member.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {member.avatarUrl ? (
                      <AvatarImage src={member.avatarUrl} />
                    ) : (
                      <AvatarFallback>{member.name.slice(0,2).toUpperCase()}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                {member.highlight && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {member.highlight}
                  </Badge>
                )}
              </div>
            ))
          )}
        </div>
        <div className="pt-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{teamAverageLabel}</span>
            <span>{teamAverageValue}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={handleViewAll}>
          <Users className="mr-2 h-4 w-4" />
          Ver Todos
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StandardTeamManagementCard; 