
import React from 'react';
import Layout from '@/components/Layout';
import RecyclingCalculator from '@/components/calculator/RecyclingCalculator';

const Calculator = () => {
  return (
    <Layout>
      <div className="container py-12 px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl font-bold mb-4">Calculadora de Impacto Ambiental</h1>
          <p className="text-lg text-neutral-600">
            Descubra o impacto positivo que sua reciclagem tem no meio ambiente. 
            Calcule quantos litros de água, kWh de energia, árvores e CO₂ você economiza.
          </p>
        </div>
        
        <RecyclingCalculator />
        
        <div className="max-w-2xl mx-auto mt-12 bg-neutral-50 p-6 rounded-xl border border-neutral-200">
          <h2 className="text-xl font-bold mb-4">Como os cálculos são feitos?</h2>
          <p className="text-neutral-600 mb-4">
            Nossa calculadora utiliza fatores de conversão baseados em pesquisas científicas sobre o 
            impacto da reciclagem em diferentes recursos naturais. Os valores podem variar de acordo 
            com as tecnologias de reciclagem disponíveis em cada região.
          </p>
          <h3 className="font-bold mt-4 mb-2">Fontes</h3>
          <ul className="list-disc pl-6 text-neutral-600 space-y-1">
            <li>Agência de Proteção Ambiental (EPA)</li>
            <li>Ministério do Meio Ambiente do Brasil</li>
            <li>Estudos acadêmicos sobre impacto da reciclagem</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default Calculator;
