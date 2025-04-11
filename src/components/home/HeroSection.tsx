
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, Leaf } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-b from-neutro/20 to-neutral-50 py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-neutro/20 text-neutro-dark text-sm font-medium">
              <Leaf className="h-4 w-4 mr-2" />
              <span>Pequenos Gestos, Grandes Impactos</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Transforme reciclagem em <span className="text-neutro">impacto positivo</span>
            </h1>
            <p className="text-lg text-neutral-600 max-w-xl">
              Conectamos coletores, cooperativas e empresas para criar um ecossistema sustentável de reciclagem. Faça parte dessa transformação!
            </p>
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
          <div className="relative mx-auto">
            <div className="absolute -z-10 animate-leaf-fall top-0 left-1/4">
              <Leaf className="h-12 w-12 text-neutro/50" />
            </div>
            <div className="w-full aspect-square md:aspect-auto md:h-[500px] bg-white rounded-2xl shadow-lg overflow-hidden p-6 flex items-center justify-center">
              <div className="text-center space-y-8">
                <div className="mx-auto w-24 h-24 rounded-full bg-neutro/20 flex items-center justify-center">
                  <Leaf className="h-12 w-12 text-neutro" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Calcule seu impacto</h3>
                  <p className="text-neutral-600">Transforme sua reciclagem em métricas ambientais</p>
                </div>
                <Button asChild variant="outline">
                  <Link to="/calculator">Acessar calculadora</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
