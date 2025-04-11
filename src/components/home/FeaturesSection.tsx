
import React from 'react';
import { Calculator, Calendar, ShoppingBag, Users, Recycle, Award } from 'lucide-react';

const features = [
  {
    icon: <Calculator className="h-10 w-10 text-neutro" />,
    title: 'Calculadora de Impacto',
    description: 'Calcule a economia em água, energia, CO2 e árvores com sua reciclagem.'
  },
  {
    icon: <Users className="h-10 w-10 text-neutro" />,
    title: 'Conecte-se a Coletores',
    description: 'Encontre coletores e cooperativas próximos para agendar suas coletas.'
  },
  {
    icon: <Calendar className="h-10 w-10 text-neutro" />,
    title: 'Agendamento Simplificado',
    description: 'Agende coletas em sua residência ou local de trabalho em poucos cliques.'
  },
  {
    icon: <ShoppingBag className="h-10 w-10 text-neutro" />,
    title: 'Descontos em Parceiros',
    description: 'Acesse descontos exclusivos em lojas, restaurantes e cursos parceiros.'
  },
  {
    icon: <Award className="h-10 w-10 text-neutro" />,
    title: 'Sistema de Níveis',
    description: 'Evolua de Bronze a Ouro conforme aumentar seu impacto positivo.'
  },
  {
    icon: <Recycle className="h-10 w-10 text-neutro" />,
    title: 'Valorize os Materiais',
    description: 'Compare preços de materiais recicláveis e venda pelo melhor valor.'
  }
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Recursos para todos os perfis</h2>
          <p className="text-lg text-neutral-600">
            Seja você um usuário comum, coletor individual, cooperativa ou empresa, o Neutro tem soluções para todos.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-neutral-50 p-6 rounded-xl border border-neutral-200 hover:border-neutro hover:shadow-md transition-all"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-neutral-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
