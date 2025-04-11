
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, UserSearch, Users, Factory, Store } from 'lucide-react';

const userTypes = [
  {
    icon: <Home className="h-8 w-8 text-neutro" />,
    title: 'Usuário Comum',
    description: 'Para quem deseja agendar coletas, calcular seu impacto e obter descontos em parceiros.',
    path: '/register/user'
  },
  {
    icon: <UserSearch className="h-8 w-8 text-neutro" />,
    title: 'Coletor Individual',
    description: 'Para coletores que desejam receber agendamentos e registrar suas coletas.',
    path: '/register/collector'
  },
  {
    icon: <Users className="h-8 w-8 text-neutro" />,
    title: 'Cooperativa',
    description: 'Para cooperativas que desejam gerenciar equipes e receber agendamentos.',
    path: '/register/cooperative'
  },
  {
    icon: <Factory className="h-8 w-8 text-neutro" />,
    title: 'Empresa Coletora',
    description: 'Para empresas que compram materiais recicláveis e desejam conectar-se com coletores.',
    path: '/register/company'
  },
  {
    icon: <Store className="h-8 w-8 text-neutro" />,
    title: 'Empresa Parceira',
    description: 'Para empresas que desejam oferecer descontos e fortalecer sua marca sustentável.',
    path: '/register/partner'
  }
];

const Register = () => {
  return (
    <Layout>
      <div className="container py-12 px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl font-bold mb-4">Cadastre-se no Neutro</h1>
          <p className="text-lg text-neutral-600">
            Escolha o tipo de conta que melhor se adequa ao seu perfil e comece a fazer parte da revolução sustentável.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {userTypes.map((type, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="p-4 bg-neutro/10 inline-block rounded-lg mb-2">{type.icon}</div>
                <CardTitle>{type.title}</CardTitle>
                <CardDescription>{type.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to={type.path}>Cadastrar como {type.title}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-neutral-600">Já tem uma conta?</p>
          <Button asChild variant="link">
            <Link to="/login">Fazer login</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
