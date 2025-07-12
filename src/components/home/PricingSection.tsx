import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Crown, Medal, Award } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const partnerPlans = [
  {
    name: 'Eco+',
    price: 'Gratuito',
    description: 'Funcionalidades básicas para empresas parceiras.',
    features: [
      'Funcionalidades básicas da conta Empresa Parceira',
      'Gerenciamento de promoções',
      'Validação de descontos',
      'Cadastro de funcionários',
      'Cupons de descontos de outras empresas',
      'Destaque no aplicativo',
      'Divulgações em redes sociais',
      'Certificado Neutro'
    ],
    cta: 'Começar Grátis',
    highlight: false,
    badge: '',
    level: 'bronze'
  },
  {
    name: 'Impacto Verde',
    price: 'R$ 99,90',
    period: '/mês',
    description: 'Para empresas que buscam mais visibilidade e benefícios.',
    features: [
      'Todas as funcionalidades do plano Eco+',
      'Cadastro de até 3 funcionários',
      'Descontos em empresas parceiras para você e seus funcionários',
      'Destaque Impacto Verde dentro do aplicativo',
      'Certificado Neutro digital',
      'Divulgações em redes sociais',
      'Logotipo em camisetas Neutro'
    ],
    cta: 'Assinar Plano Impacto Verde',
    highlight: true,
    badge: 'Popular',
    level: 'silver'
  },
  {
    name: 'Carbon Free',
    price: 'R$ 249,90',
    period: '/mês',
    description: 'Máximo destaque e benefícios para sua empresa.',
    features: [
      'Todas as funcionalidades do plano Impacto Verde',
      'Cadastro de até 100 funcionários',
      'Descontos em empresas parceiras para todos os funcionários',
      'Destaque Carbon Free dentro do aplicativo',
      'Certificado Neutro digital',
      'Divulgações em redes sociais da Neutro',
      'Logotipo em camisetas Neutro para coletores'
    ],
    cta: 'Assinar Plano Carbon Free',
    highlight: false,
    badge: '',
    level: 'gold'
  }
];

const cooperativePlans = [
  {
    name: 'Eco+',
    price: 'Gratuito',
    description: 'Funcionalidades básicas para cooperativas e coletoras.',
    features: [
      'Funcionalidades básicas da conta Cooperativa/Coletora',
      'Registro de coletas',
      'Gerenciamento de preços de materiais',
      'Cadastro de funcionários/cooperados',
      'Cupons de descontos de empresas parceiras',
      'Destaque no aplicativo',
      'Divulgações em redes sociais',
      'Certificado Neutro'
    ],
    cta: 'Começar Grátis',
    highlight: false,
    badge: '',
    level: 'bronze'
  },
  {
    name: 'Impacto Verde',
    price: 'R$ 99,90',
    period: '/mês',
    description: 'Para cooperativas que buscam mais benefícios e reconhecimento.',
    features: [
      'Todas as funcionalidades do plano Eco+',
      'Cadastro de até 3 funcionários/cooperados',
      'Descontos em empresas parceiras para você e seus funcionários/cooperados',
      'Destaque Impacto Verde dentro do aplicativo',
      'Certificado Neutro digital',
      'Divulgações em redes sociais',
      'Logotipo em camisetas Neutro'
    ],
    cta: 'Assinar Plano Impacto Verde',
    highlight: true,
    badge: 'Popular',
    level: 'silver'
  },
  {
    name: 'Carbon Free',
    price: 'R$ 249,90',
    period: '/mês',
    description: 'Máximo destaque e benefícios para sua cooperativa/coletora.',
    features: [
      'Todas as funcionalidades do plano Impacto Verde',
      'Cadastro de até 100 funcionários/cooperados',
      'Descontos em empresas parceiras para todos os funcionários/cooperados',
      'Destaque Carbon Free dentro do aplicativo',
      'Certificado Neutro digital',
      'Divulgações em redes sociais da Neutro',
      'Logotipo em camisetas Neutro para coletores'
    ],
    cta: 'Assinar Plano Carbon Free',
    highlight: false,
    badge: '',
    level: 'gold'
  }
];

const PricingSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Escolha o plano ideal para você</h2>
          <p className="text-lg text-neutral-600">
            Planos flexíveis para empresas parceiras, cooperativas e coletoras que desejam maximizar seu impacto.
          </p>
        </div>

        <Tabs defaultValue="partners" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="partners" className="text-sm px-6">Empresas Parceiras</TabsTrigger>
              <TabsTrigger value="cooperatives" className="text-sm px-6">Cooperativas/Coletoras</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="partners">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {partnerPlans.map((plan, index) => (
                <div 
                key={index}
                className={`relative rounded-2xl transition-all duration-300 flex flex-col ${
                  plan.highlight 
                    ? 'border-2 border-neutro shadow-xl md:scale-105 bg-white z-10' 
                    : 'border border-neutral-200 hover:border-neutro/50 shadow-sm hover:shadow-md bg-white'
                }`}
                >
                  {/* Plano Header */}
                  <div className={`p-6 ${
                    plan.level === 'gold' 
                      ? 'bg-gradient-to-br from-blue-100 to-blue-50' 
                      : plan.level === 'silver' 
                        ? 'bg-gradient-to-br from-green-100 to-green-50' 
                        : 'bg-gradient-to-br from-emerald-100 to-emerald-50'
                  }`}>
                    {plan.badge && (
                      <div className="absolute top-3 right-6 bg-neutro text-white text-sm font-medium px-4 py-1 rounded-full shadow-sm z-20">
                        {plan.badge}
                      </div>
                    )}
                    <div className={`inline-flex p-3 rounded-lg mb-4 ${
                      plan.level === 'gold' 
                        ? 'bg-blue-200/50 text-blue-700' 
                        : plan.level === 'silver' 
                          ? 'bg-green-200/50 text-green-700' 
                          : 'bg-emerald-200/50 text-emerald-700'
                    }`}>
                      {plan.level === 'gold' 
                        ? <Crown className="h-8 w-8" />
                        : plan.level === 'silver' 
                          ? <Award className="h-8 w-8" />
                          : <Medal className="h-8 w-8" />
                      }
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      {plan.period && <span className="text-neutral-600 ml-1">{plan.period}</span>}
                    </div>
                    <p className="text-neutral-600">{plan.description}</p>
                  </div>

                  {/* Lista de Features */}
                  <div className="p-6 flex-1 flex flex-col">
                    <ul className="space-y-4 mb-6 flex-1">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                            plan.level === 'gold' 
                              ? 'text-blue-600' 
                              : plan.level === 'silver' 
                                ? 'text-green-600' 
                                : 'text-emerald-600'
                          }`} />
                          <span className="text-neutral-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      asChild 
                      className={`w-full mt-auto ${plan.highlight ? 'bg-neutro hover:bg-neutro/90' : ''}`}
                      variant={plan.highlight ? 'default' : 'outline'}
                    >
                      <Link to={`/register/partner?plan=${plan.name.toLowerCase()}`}>{plan.cta}</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="cooperatives">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {cooperativePlans.map((plan, index) => (
                <div 
                  key={index}
                  className={`relative rounded-2xl transition-all duration-300 flex flex-col ${
                    plan.highlight 
                      ? 'border-2 border-neutro shadow-xl md:scale-105 bg-white z-10' 
                      : 'border border-neutral-200 hover:border-neutro/50 shadow-sm hover:shadow-md bg-white'
                  }`}
                >
                  {/* Plano Header */}
                  <div className={`p-6 ${
                    plan.level === 'gold' 
                      ? 'bg-gradient-to-br from-blue-100 to-blue-50' 
                      : plan.level === 'silver' 
                        ? 'bg-gradient-to-br from-green-100 to-green-50' 
                        : 'bg-gradient-to-br from-emerald-100 to-emerald-50'
                  }`}>
                    {plan.badge && (
                      <div className="absolute top-3 right-6 bg-neutro text-white text-sm font-medium px-4 py-1 rounded-full shadow-sm z-20">
                        {plan.badge}
                      </div>
                    )}
                    <div className={`inline-flex p-3 rounded-lg mb-4 ${
                      plan.level === 'gold' 
                        ? 'bg-blue-200/50 text-blue-700' 
                        : plan.level === 'silver' 
                          ? 'bg-green-200/50 text-green-700' 
                          : 'bg-emerald-200/50 text-emerald-700'
                    }`}>
                      {plan.level === 'gold' 
                        ? <Crown className="h-8 w-8" />
                        : plan.level === 'silver' 
                          ? <Award className="h-8 w-8" />
                          : <Medal className="h-8 w-8" />
                      }
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      {plan.period && <span className="text-neutral-600 ml-1">{plan.period}</span>}
                    </div>
                    <p className="text-neutral-600">{plan.description}</p>
                  </div>

                  {/* Lista de Features */}
                  <div className="p-6 flex-1 flex flex-col">
                    <ul className="space-y-4 mb-6 flex-1">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                            plan.level === 'gold' 
                              ? 'text-blue-600' 
                              : plan.level === 'silver' 
                                ? 'text-green-600' 
                                : 'text-emerald-600'
                          }`} />
                          <span className="text-neutral-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      asChild 
                      className={`w-full mt-auto ${plan.highlight ? 'bg-neutro hover:bg-neutro/90' : ''}`}
                      variant={plan.highlight ? 'default' : 'outline'}
                    >
                      <Link to={`/register/cooperative?plan=${plan.name.toLowerCase()}`}>{plan.cta}</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default PricingSection;
