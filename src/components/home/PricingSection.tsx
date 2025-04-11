
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const partnerPlans = [
  {
    name: 'Bronze',
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
    name: 'Prata',
    price: 'R$ 99,90',
    period: '/mês',
    description: 'Para empresas que buscam mais visibilidade e benefícios.',
    features: [
      'Todas as funcionalidades do plano Bronze',
      'Cadastro de até 3 funcionários',
      'Descontos em empresas parceiras para você e seus funcionários',
      'Destaque prata dentro do aplicativo',
      'Certificado Neutro digital',
      'Divulgações em redes sociais',
      'Logotipo em camisetas Neutro'
    ],
    cta: 'Assinar Plano Prata',
    highlight: true,
    badge: 'Popular',
    level: 'silver'
  },
  {
    name: 'Ouro',
    price: 'R$ 249,90',
    period: '/mês',
    description: 'Máximo destaque e benefícios para sua empresa.',
    features: [
      'Todas as funcionalidades do plano Prata',
      'Cadastro de até 100 funcionários',
      'Descontos em empresas parceiras para todos os funcionários',
      'Destaque ouro dentro do aplicativo',
      'Certificado Neutro digital',
      'Divulgações em redes sociais da Neutro',
      'Logotipo em camisetas Neutro para coletores'
    ],
    cta: 'Assinar Plano Ouro',
    highlight: false,
    badge: '',
    level: 'gold'
  }
];

const cooperativePlans = [
  {
    name: 'Bronze',
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
    name: 'Prata',
    price: 'R$ 99,90',
    period: '/mês',
    description: 'Para cooperativas que buscam mais benefícios e reconhecimento.',
    features: [
      'Todas as funcionalidades do plano Bronze',
      'Cadastro de até 3 funcionários/cooperados',
      'Descontos em empresas parceiras para você e seus funcionários/cooperados',
      'Destaque prata dentro do aplicativo',
      'Certificado Neutro digital',
      'Divulgações em redes sociais',
      'Logotipo em camisetas Neutro'
    ],
    cta: 'Assinar Plano Prata',
    highlight: true,
    badge: 'Popular',
    level: 'silver'
  },
  {
    name: 'Ouro',
    price: 'R$ 249,90',
    period: '/mês',
    description: 'Máximo destaque e benefícios para sua cooperativa/coletora.',
    features: [
      'Todas as funcionalidades do plano Prata',
      'Cadastro de até 100 funcionários/cooperados',
      'Descontos em empresas parceiras para todos os funcionários/cooperados',
      'Destaque ouro dentro do aplicativo',
      'Certificado Neutro digital',
      'Divulgações em redes sociais da Neutro',
      'Logotipo em camisetas Neutro para coletores'
    ],
    cta: 'Assinar Plano Ouro',
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

        <Tabs defaultValue="partners" className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <TabsList>
              <TabsTrigger value="partners" className="text-sm px-6">Empresas Parceiras</TabsTrigger>
              <TabsTrigger value="cooperatives" className="text-sm px-6">Cooperativas/Coletoras</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="partners">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {partnerPlans.map((plan, index) => (
                <div 
                  key={index}
                  className={`card-plan-${plan.level} ${plan.highlight ? 'border-2 scale-105' : ''}`}
                >
                  {plan.badge && (
                    <div className="level-badge-silver absolute -top-3 left-1/2 transform -translate-x-1/2">
                      {plan.badge}
                    </div>
                  )}
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-neutral-600">{plan.period}</span>}
                  </div>
                  <p className="text-neutral-600 mb-6">{plan.description}</p>
                  <ul className="space-y-3 text-left mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-neutro mr-2 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className={`w-full ${plan.name === 'Bronze' ? 'bg-bronze text-white hover:bg-bronze/90' : plan.name === 'Prata' ? 'bg-silver text-neutral-800 hover:bg-silver/90' : 'bg-gold text-neutral-800 hover:bg-gold/90'}`}>
                    <Link to={`/register/partner?plan=${plan.name.toLowerCase()}`}>{plan.cta}</Link>
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="cooperatives">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cooperativePlans.map((plan, index) => (
                <div 
                  key={index}
                  className={`card-plan-${plan.level} ${plan.highlight ? 'border-2 scale-105' : ''}`}
                >
                  {plan.badge && (
                    <div className="level-badge-silver absolute -top-3 left-1/2 transform -translate-x-1/2">
                      {plan.badge}
                    </div>
                  )}
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-neutral-600">{plan.period}</span>}
                  </div>
                  <p className="text-neutral-600 mb-6">{plan.description}</p>
                  <ul className="space-y-3 text-left mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-neutro mr-2 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className={`w-full ${plan.name === 'Bronze' ? 'bg-bronze text-white hover:bg-bronze/90' : plan.name === 'Prata' ? 'bg-silver text-neutral-800 hover:bg-silver/90' : 'bg-gold text-neutral-800 hover:bg-gold/90'}`}>
                    <Link to={`/register/cooperative?plan=${plan.name.toLowerCase()}`}>{plan.cta}</Link>
                  </Button>
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
