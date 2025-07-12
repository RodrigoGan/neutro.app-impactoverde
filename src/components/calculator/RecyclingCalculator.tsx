import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplet, Leaf, Zap, Wind, Droplets, Cpu, Coins, Package, Trash } from 'lucide-react';
import { materialDisplayData } from '@/config/materialDisplayData';

interface CalculationResult {
  water: number;
  energy: number;
  trees: number;
  co2: number;
}

// Fatores de impacto padronizados por id do materialDisplayData
const impactFactors = {
  papel:    { water: 31, energy: 4.2, trees: 0.017, co2: 2.8 },
  plastico: { water: 35, energy: 6.5, trees: 0,     co2: 3.5 },
  vidro:    { water: 8,  energy: 2.5, trees: 0,     co2: 0.6 },
  metal:    { water: 15, energy: 12,  trees: 0,     co2: 4.5 },
  aluminio: { water: 22, energy: 15,  trees: 0,     co2: 5.2 },
  cobre:    { water: 28, energy: 13,  trees: 0,     co2: 4.2 },
  oleo:     { water: 50, energy: 11,  trees: 0,     co2: 4.8 },
  eletronico: { water: 45, energy: 14, trees: 0,    co2: 5.8 },
  pilhas:   { water: 0,  energy: 0,   trees: 0,     co2: 0 },
  lampadas: { water: 0,  energy: 0,   trees: 0,     co2: 0 },
  organico: { water: 4,  energy: 1,   trees: 0.01,  co2: 0.4 },
  outros:   { water: 0,  energy: 0,   trees: 0,     co2: 0 },
};

const RecyclingCalculator: React.FC = () => {
  const [materialType, setMaterialType] = useState('papel');
  const [lastCalculatedMaterial, setLastCalculatedMaterial] = useState('papel');
  const [weight, setWeight] = useState<number | ''>('');
  const [results, setResults] = useState<CalculationResult | null>(null);

  const handleCalculate = () => {
    if (weight === '' || isNaN(Number(weight)) || Number(weight) <= 0) {
      return;
    }

    const factors = impactFactors[materialType as keyof typeof impactFactors];
    const weightInKg = Number(weight);

    setLastCalculatedMaterial(materialType);
    setResults({
      water: factors.water * weightInKg,
      energy: factors.energy * weightInKg,
      trees: factors.trees * weightInKg,
      co2: factors.co2 * weightInKg,
    });
  };

  const materialOptions = Object.entries(materialDisplayData).map(([id, mat]) => ({
    id,
    nome: mat.nome,
    Icon: mat.icone,
    cor: mat.cor,
  }));

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Calculadora de Impacto Ambiental</CardTitle>
          <CardDescription>
            Calcule a economia de recursos naturais com sua reciclagem.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="material-type">Tipo de Material</Label>
            <Select
              value={materialType}
              onValueChange={(value) => setMaterialType(value)}
            >
              <SelectTrigger id="material-type">
                <SelectValue placeholder="Selecione o material" />
              </SelectTrigger>
              <SelectContent>
                {materialOptions.map(opt => (
                  <SelectItem value={opt.id} key={opt.id} className="flex items-center">
                    <div className="flex items-center">
                      <opt.Icon className={`h-5 w-5 mr-2 ${opt.cor}`} />
                      <span className={opt.cor}>{opt.nome}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="Ex: 5"
              value={weight}
              onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>

          <Button onClick={handleCalculate} className="w-full" disabled={weight === '' || Number(weight) <= 0}>
            Calcular Impacto
          </Button>
        </CardContent>

        {results && (
          <CardFooter className="flex-col space-y-4">
            <div className="w-full h-px bg-neutral-200 my-2"></div>
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-bold self-start">Seu Impacto Positivo</h3>
              <div className="flex items-center gap-2 text-neutral-600">
                <span>Material:</span>
                <div className="flex items-center font-medium text-neutro">
                  {materialDisplayData[lastCalculatedMaterial as keyof typeof materialDisplayData]?.icone &&
                    React.createElement(
                      materialDisplayData[lastCalculatedMaterial as keyof typeof materialDisplayData].icone,
                      { className: `h-5 w-5 mr-2 ${materialDisplayData[lastCalculatedMaterial as keyof typeof materialDisplayData]?.cor}` }
                    )}
                  <span className={materialDisplayData[lastCalculatedMaterial as keyof typeof materialDisplayData]?.cor}>
                    {materialDisplayData[lastCalculatedMaterial as keyof typeof materialDisplayData]?.nome}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="bg-blue-50 p-4 rounded-lg flex flex-col items-center">
                <Droplet className="h-8 w-8 text-blue-500 mb-2" />
                <span className="text-lg font-bold text-blue-700">
                  {results.water.toFixed(1)} L
                </span>
                <span className="text-sm text-neutral-600">Água economizada</span>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg flex flex-col items-center">
                <Zap className="h-8 w-8 text-yellow-500 mb-2" />
                <span className="text-lg font-bold text-yellow-700">
                  {results.energy.toFixed(2)} kWh
                </span>
                <span className="text-sm text-neutral-600">Energia economizada</span>
              </div>
              <div className="bg-green-50 p-4 rounded-lg flex flex-col items-center">
                <Leaf className="h-8 w-8 text-green-500 mb-2" />
                <span className="text-lg font-bold text-green-700">
                  {results.trees.toFixed(4)} árvores
                </span>
                <span className="text-sm text-neutral-600">Árvores preservadas</span>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg flex flex-col items-center">
                <Wind className="h-8 w-8 text-purple-500 mb-2" />
                <span className="text-lg font-bold text-purple-700">
                  {results.co2.toFixed(2)} kg
                </span>
                <span className="text-sm text-neutral-600">CO₂ não emitido</span>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default RecyclingCalculator;
