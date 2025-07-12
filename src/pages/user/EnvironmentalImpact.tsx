import React from 'react';
import Layout from '@/components/Layout';
import { useEnvironmentalImpact } from '@/hooks/useEnvironmentalImpact';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Award, Droplets, Leaf, Trees, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function EnvironmentalImpact() {
  const navigate = useNavigate();
  
  // Usar dados reais
  const { impactData, loading } = useEnvironmentalImpact('1'); // TODO: usar userId real
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="text-center">Carregando dados de impacto ambiental...</div>
        </div>
      </Layout>
    );
  }
  
  if (!impactData) {
    return (
      <Layout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="text-center">Erro ao carregar dados de impacto ambiental</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="flex items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-600" />
            Seu Impacto Ambiental
          </h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* CO2 Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-green-600" />
                CO2 Evitado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-bold text-green-600">{impactData.co2.total}kg</p>
                  <p className="text-sm text-muted-foreground">{impactData.co2.equivalent}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{Math.round((impactData.co2.total / impactData.co2.goal) * 100)}%</span>
                  </div>
                  <Progress value={(impactData.co2.total / impactData.co2.goal) * 100} />
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Evolução Mensal</p>
                  <div className="flex items-end gap-2 h-24">
                    {impactData.co2.monthly.map((value, index) => (
                      <div
                        key={index}
                        className="flex-1 bg-green-100 rounded-t"
                        style={{ height: `${(value / impactData.co2.goal) * 100}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Árvores Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trees className="h-5 w-5 text-green-600" />
                Árvores Salvas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-bold text-green-600">{impactData.trees.total}</p>
                  <p className="text-sm text-muted-foreground">{impactData.trees.equivalent}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{Math.round((impactData.trees.total / impactData.trees.goal) * 100)}%</span>
                  </div>
                  <Progress value={(impactData.trees.total / impactData.trees.goal) * 100} />
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Evolução Mensal</p>
                  <div className="flex items-end gap-2 h-24">
                    {impactData.trees.monthly.map((value, index) => (
                      <div
                        key={index}
                        className="flex-1 bg-green-100 rounded-t"
                        style={{ height: `${(value / impactData.trees.goal) * 100}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Água Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-green-600" />
                Água Economizada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-bold text-green-600">{impactData.water.total}L</p>
                  <p className="text-sm text-muted-foreground">{impactData.water.equivalent}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{Math.round((impactData.water.total / impactData.water.goal) * 100)}%</span>
                  </div>
                  <Progress value={(impactData.water.total / impactData.water.goal) * 100} />
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Evolução Mensal</p>
                  <div className="flex items-end gap-2 h-24">
                    {impactData.water.monthly.map((value, index) => (
                      <div
                        key={index}
                        className="flex-1 bg-green-100 rounded-t"
                        style={{ height: `${(value / impactData.water.goal) * 100}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certificados Card */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600" />
                Certificados Ambientais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {impactData.certificates.names.map((name, index) => (
                  <div
                    key={index}
                    className="p-4 bg-green-50 rounded-lg flex items-center gap-3"
                  >
                    <Award className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium">{name}</p>
                      <p className="text-sm text-muted-foreground">Conquistado</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
} 