import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, Calculator, Recycle, TreePine, Droplets } from 'lucide-react';
import Logo from '@/components/Logo';

const HeroSection: React.FC = () => {
  return (
    <>
      {/* Logo Area */}
      <div className="container px-4 md:px-6 pt-8 md:pt-12 pb-8">
        <div className="text-center">
          <Logo size="lg" showSlogan={true} showText={true} className="mx-auto" />
        </div>
      </div>

      {/* Main Content */}
      <section className="bg-gradient-to-b from-neutro/10 via-neutro/5 to-neutral-50">
        <div className="container px-4 md:px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  Transforme reciclagem em <span className="text-neutro">impacto positivo</span>
                </h1>
                <p className="text-lg text-neutral-600 max-w-xl">
                  Conectamos coletores, cooperativas e empresas para criar um ecossistema sustentável de reciclagem. Faça parte dessa transformação!
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="font-medium">
                  <Link to="/register">Comece agora</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="font-medium">
                  <Link to="/how-it-works" className="flex items-center">
                    Como funciona
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Calculator Card */}
            <div className="w-full aspect-auto bg-white rounded-2xl shadow-lg overflow-hidden p-8">
              <div className="text-center space-y-8 h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Calculator className="h-24 w-24 text-neutro animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-bold text-neutro-dark">Calcule seu impacto</h3>
                  <p className="text-neutral-600">
                    Transforme sua reciclagem em métricas ambientais
                  </p>
                </div>

                {/* Impact Icons */}
                <div className="grid grid-cols-3 gap-4 py-6">
                  <div className="flex flex-col items-center space-y-2">
                    <Droplets className="h-8 w-8 text-blue-500" />
                    <span className="text-sm text-neutral-600">Água economizada</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <TreePine className="h-8 w-8 text-green-500" />
                    <span className="text-sm text-neutral-600">Árvores preservadas</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <Recycle className="h-8 w-8 text-neutro" />
                    <span className="text-sm text-neutral-600">CO₂ reduzido</span>
                  </div>
                </div>

                <Button asChild variant="default" size="lg" className="w-full mt-4">
                  <Link to="/calculator">Acessar calculadora</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
