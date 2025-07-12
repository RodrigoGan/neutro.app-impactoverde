import React from 'react';
import Layout from '@/components/Layout';
import LevelsSection from '@/components/levels/LevelsSection';
import { PointsGuide } from '@/components/levels/PointsGuide';
import { Shield, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

const Levels = () => {
  return (
    <Layout>
      <div className="container py-12 px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h1 className="text-3xl font-bold mb-4">Sistema de Níveis</h1>
          <p className="text-lg text-neutral-600">
            Conheça os níveis disponíveis para cada tipo de perfil e seus benefícios.
          </p>
        </div>

        {/* Seção dos níveis e benefícios */}
        <LevelsSection />

        {/* Sistema de Proteção de Nível - agora após os cards de nível */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-800 text-lg">Sistema de Proteção de Nível</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-blue-700">Como Funciona</span>
              <ul className="list-disc ml-6 text-blue-900 text-sm mt-1">
                <li>3 meses de proteção ao subir de nível</li>
                <li>Avaliação mensal baseada em médias dos últimos 3 meses</li>
                <li><b>Manter 70% dos requisitos</b> para não cair de nível</li>
                <li>Notificações proativas sobre seu status</li>
              </ul>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-blue-700">Tipos de Notificação</span>
              <ul className="list-disc ml-6 text-blue-900 text-sm mt-1">
                <li><b>Proteção:</b> Você subiu de nível e está protegido</li>
                <li><b>Alerta:</b> Performance caiu, risco de perder nível</li>
                <li><b>Queda:</b> Você perdeu nível devido à baixa performance</li>
              </ul>
            </div>
            <div className="bg-blue-100 rounded p-3 mt-2">
              <b>Dica:</b> O sistema calcula automaticamente suas médias mensais e envia notificações para ajudá-lo a manter seu nível. Foco em manter consistência nas suas atividades!
            </div>
          </div>
        </div>

        <PointsGuide />
      </div>
    </Layout>
  );
};

export default Levels; 