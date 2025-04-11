
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, UserSearch, Users, Factory, Store } from 'lucide-react';

const userTypes = [
  {
    icon: <Home className="h-8 w-8 text-neutro" />,
    title: 'Usuário Comum',
    description: 'Agende coletas, calcule seu impacto e obtenha descontos em parceiros.',
    linkText: 'Cadastre-se como usuário',
    linkTo: '/register/user'
  },
  {
    icon: <UserSearch className="h-8 w-8 text-neutro" />,
    title: 'Coletor Individual',
    description: 'Receba agendamentos, registre suas coletas e obtenha certificações.',
    linkText: 'Seja um coletor',
    linkTo: '/register/collector'
  },
  {
    icon: <Users className="h-8 w-8 text-neutro" />,
    title: 'Cooperativa',
    description: 'Gerencie equipes, receba agendamentos e aumente o impacto coletivo.',
    linkText: 'Cadastre sua cooperativa',
    linkTo: '/register/cooperative'
  },
  {
    icon: <Factory className="h-8 w-8 text-neutro" />,
    title: 'Empresa Coletora',
    description: 'Publique preços de materiais, conecte-se com coletores e aumente seu alcance.',
    linkText: 'Cadastre sua empresa',
    linkTo: '/register/company'
  },
  {
    icon: <Store className="h-8 w-8 text-neutro" />,
    title: 'Empresa Parceira',
    description: 'Ofereça descontos, atraia clientes conscientes e fortaleça sua marca sustentável.',
    linkText: 'Seja um parceiro',
    linkTo: '/register/partner'
  }
];

const UserTypesSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-neutral-50">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Para quem é o Neutro?</h2>
          <p className="text-lg text-neutral-600">
            Escolha seu perfil e descubra como o Neutro pode ajudar você ou sua empresa.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userTypes.map((type, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-all"
            >
              <div className="mb-4 p-4 bg-neutro/10 inline-block rounded-lg">{type.icon}</div>
              <h3 className="text-xl font-bold mb-2">{type.title}</h3>
              <p className="text-neutral-600 mb-6">{type.description}</p>
              <Button asChild variant="outline" className="w-full">
                <Link to={type.linkTo}>{type.linkText}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UserTypesSection;
