import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  TreePine,
  Droplet,
  Zap,
  Trophy,
  BarChart3,
  Medal
} from 'lucide-react';

// Dados mockados - substituir por dados reais da API
const impactoAmbiental = {
  co2Evitado: 1250,
  arvoresPreservadas: 85,
  aguaEconomizada: 25000,
  energiaPoupada: 3500,
  materiaisColetados: [
    { tipo: 'Papel/Papelão', quantidade: 500, impacto: { co2: 250, agua: 10000, energia: 1500 } },
    { tipo: 'Plástico', quantidade: 300, impacto: { co2: 450, agua: 8000, energia: 1200 } },
    { tipo: 'Metal', quantidade: 200, impacto: { co2: 550, agua: 7000, energia: 800 } }
  ],
  certificados: [
    { nome: 'Coletor Verde', descricao: 'Mais de 1000kg de materiais coletados', conquistado: true },
    { nome: 'Guardião da Natureza', descricao: 'Mais de 1000kg de CO2 evitado', conquistado: true },
    { nome: 'Mestre da Reciclagem', descricao: 'Mais de 5000kg de materiais coletados', conquistado: false }
  ],
  ranking: {
    posicao: 15,
    total: 150,
    percentil: 90
  }
};

const EnvironmentalImpact: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <div className="container py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="ghost" 
            className="gap-2" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        <div className="grid gap-6">
          {/* Card Principal */}
          <Card>
            <CardHeader>
              <CardTitle>Impacto Ambiental</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
                  <TreePine className="h-8 w-8 text-green-600 mb-2" />
                  <span className="text-2xl font-bold text-green-700">{impactoAmbiental.co2Evitado}kg</span>
                  <span className="text-sm text-green-600">CO₂ Evitado</span>
                </div>

                <div className="flex flex-col items-center p-4 bg-emerald-50 rounded-lg">
                  <TreePine className="h-8 w-8 text-emerald-600 mb-2" />
                  <span className="text-2xl font-bold text-emerald-700">{impactoAmbiental.arvoresPreservadas}</span>
                  <span className="text-sm text-emerald-600">Árvores Preservadas</span>
                </div>

                <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                  <Droplet className="h-8 w-8 text-blue-600 mb-2" />
                  <span className="text-2xl font-bold text-blue-700">{impactoAmbiental.aguaEconomizada}L</span>
                  <span className="text-sm text-blue-600">Água Economizada</span>
                </div>

                <div className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg">
                  <Zap className="h-8 w-8 text-yellow-600 mb-2" />
                  <span className="text-2xl font-bold text-yellow-700">{impactoAmbiental.energiaPoupada}kWh</span>
                  <span className="text-sm text-yellow-600">Energia Poupada</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs com detalhes */}
          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="materiais">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="materiais">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Materiais
                  </TabsTrigger>
                  <TabsTrigger value="certificados">
                    <Trophy className="h-4 w-4 mr-2" />
                    Certificados
                  </TabsTrigger>
                  <TabsTrigger value="ranking">
                    <Medal className="h-4 w-4 mr-2" />
                    Ranking
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="materiais" className="space-y-4">
                  <div className="grid gap-4">
                    {impactoAmbiental.materiaisColetados.map((material) => (
                      <div key={material.tipo} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{material.tipo}</h3>
                          <span className="text-sm text-muted-foreground">{material.quantidade}kg coletados</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>CO₂ Evitado</span>
                            <span>{material.impacto.co2}kg</span>
                          </div>
                          <Progress value={material.impacto.co2 / 10} />
                          
                          <div className="flex items-center justify-between text-sm">
                            <span>Água Economizada</span>
                            <span>{material.impacto.agua}L</span>
                          </div>
                          <Progress value={material.impacto.agua / 100} />
                          
                          <div className="flex items-center justify-between text-sm">
                            <span>Energia Poupada</span>
                            <span>{material.impacto.energia}kWh</span>
                          </div>
                          <Progress value={material.impacto.energia / 35} />
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="certificados" className="space-y-4">
                  <div className="grid gap-4">
                    {impactoAmbiental.certificados.map((certificado) => (
                      <div key={certificado.nome} className="flex items-start gap-4 p-4 bg-card rounded-lg border">
                        <Trophy className={`h-8 w-8 ${certificado.conquistado ? 'text-yellow-500' : 'text-gray-400'}`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{certificado.nome}</h3>
                            <Badge variant={certificado.conquistado ? 'default' : 'secondary'}>
                              {certificado.conquistado ? 'Conquistado' : 'Em progresso'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{certificado.descricao}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="ranking" className="space-y-4">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold">#{impactoAmbiental.ranking.posicao}</h3>
                      <p className="text-sm text-muted-foreground">
                        de {impactoAmbiental.ranking.total} coletores
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Percentil {impactoAmbiental.ranking.percentil}</span>
                        <span className="text-sm">{impactoAmbiental.ranking.percentil}%</span>
                      </div>
                      <Progress value={impactoAmbiental.ranking.percentil} />
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-4 bg-card rounded-lg border">
                        <h4 className="text-lg font-bold">15º</h4>
                        <p className="text-sm text-muted-foreground">Em CO₂ Evitado</p>
                      </div>
                      <div className="p-4 bg-card rounded-lg border">
                        <h4 className="text-lg font-bold">12º</h4>
                        <p className="text-sm text-muted-foreground">Em Volume</p>
                      </div>
                      <div className="p-4 bg-card rounded-lg border">
                        <h4 className="text-lg font-bold">8º</h4>
                        <p className="text-sm text-muted-foreground">Em Regularidade</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default EnvironmentalImpact; 