import React, { useState } from 'react';
import { CheckCircle2, Crown, Medal, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const partnerPlans = [
  {
    name: 'Eco+',
    price: 'Gratuito',
    description: 'Funcionalidades essenciais para empresas parceiras.',
    features: [
      'Funcionalidades essenciais para empresas parceiras',
      'Gerenciamento de promoções e descontos',
      'Cadastro de funcionários',
      'Cupons de descontos de outras empresas',
      'Divulgação em redes sociais'
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
      'Todas as funcionalidades do Eco+',
      'Cadastro de até 3 funcionários',
      'Descontos em empresas parceiras para você e sua equipe',
      'Certificado digital de participação',
      'Divulgação em redes sociais',
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
      'Todas as funcionalidades do Impacto Verde',
      'Cadastro de até 100 funcionários',
      'Descontos em empresas parceiras para toda a equipe',
      'Certificado digital de participação',
      'Divulgação em redes sociais da Neutro',
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
    description: 'Funcionalidades essenciais para cooperativas e coletoras.',
    features: [
      'Funcionalidades essenciais para cooperativas/coletoras',
      'Registro de coletas',
      'Gerenciamento de preços de materiais',
      'Cadastro de funcionários/cooperados',
      'Cupons de descontos de empresas parceiras',
      'Divulgação em redes sociais'
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
      'Todas as funcionalidades do Eco+',
      'Cadastro de até 3 funcionários/cooperados',
      'Descontos em empresas parceiras para você e sua equipe',
      'Certificado digital de participação',
      'Divulgação em redes sociais',
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
      'Todas as funcionalidades do Impacto Verde',
      'Cadastro de até 100 funcionários/cooperados',
      'Descontos em empresas parceiras para toda a equipe',
      'Certificado digital de participação',
      'Divulgação em redes sociais da Neutro',
      'Logotipo em camisetas Neutro para coletores'
    ],
    cta: 'Assinar Plano Carbon Free',
    highlight: false,
    badge: '',
    level: 'gold'
  }
];

const PaidPlans: React.FC = () => {
  const [tab, setTab] = useState<'partners' | 'cooperatives'>('partners');
  const plans = tab === 'partners' ? partnerPlans : cooperativePlans;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center py-10 px-2">
      <img src="/logo-neutro.png" alt="Neutro" className="h-12 mb-4 mt-2" />
      <h1 className="text-3xl font-bold text-center mb-2">Escolha o plano ideal para você</h1>
      <p className="text-lg text-neutral-600 text-center mb-8 max-w-2xl">
        Planos flexíveis para empresas parceiras, cooperativas e coletoras que desejam maximizar seu impacto.
      </p>
      <Tabs value={tab} onValueChange={(v) => setTab(v as 'partners' | 'cooperatives')} className="w-full">
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
                className={`relative rounded-2xl transition-all duration-300 flex flex-col h-full
                  ${plan.highlight
                    ? 'border-2 border-neutro shadow-xl md:scale-105 bg-white z-10'
                    : 'border border-neutral-200 hover:border-neutro/50 shadow-sm hover:shadow-md bg-white'}
                `}
              >
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
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full mt-auto ${plan.highlight ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-white text-green-700 border border-green-200 hover:bg-green-50'}`}>{plan.cta}</Button>
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
                className={`relative rounded-2xl transition-all duration-300 flex flex-col h-full
                  ${plan.highlight
                    ? 'border-2 border-neutro shadow-xl md:scale-105 bg-white z-10'
                    : 'border border-neutral-200 hover:border-neutro/50 shadow-sm hover:shadow-md bg-white'}
                `}
              >
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
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full mt-auto ${plan.highlight ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-white text-green-700 border border-green-200 hover:bg-green-50'}`}>{plan.cta}</Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      <footer className="w-full text-center text-xs text-neutral-400 mt-12 pt-6 border-t border-neutral-200">
        © 2025 Neutro. Todos os direitos reservados.
      </footer>
    </div>
  );
};

export default PaidPlans; 