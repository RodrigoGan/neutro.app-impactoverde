import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, UserSearch, Users, Factory, Store } from 'lucide-react';

const userTypes = [
  {
    icon: <Home className="h-8 w-8 text-neutro" />,
    title: 'Usuário Comum',
    description: 'Para quem deseja agendar coletas, calcular seu impacto e obter descontos em parceiros.',
    type: 'common'
  },
  {
    icon: <UserSearch className="h-8 w-8 text-neutro" />,
    title: 'Coletor',
    description: 'Para catadores individuais que coletam e vendem materiais recicláveis.',
    type: 'collector'
  },
  {
    icon: <Users className="h-8 w-8 text-neutro" />,
    title: 'Cooperativa',
    description: 'Para cooperativas de catadores que trabalham com reciclagem.',
    type: 'cooperative'
  },
  {
    icon: <Factory className="h-8 w-8 text-neutro" />,
    title: 'Empresa Coletora',
    description: 'Para empresas que coletam e processam materiais recicláveis.',
    type: 'company'
  },
  {
    icon: <Store className="h-8 w-8 text-neutro" />,
    title: 'Parceiro',
    description: 'Para estabelecimentos que desejam implementar práticas sustentáveis.',
    type: 'partner'
  }
];

const Register = () => {
  const navigate = useNavigate();
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
                <Button className="w-full" onClick={() => navigate(`/register/new?type=${type.type}`)}>
                  Cadastrar como {type.title}
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
