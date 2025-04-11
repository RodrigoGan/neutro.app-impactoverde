
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplet, Leaf, Zap, Wind } from 'lucide-react';

interface CalculationResult {
  water: number;
  energy: number;
  trees: number;
  co2: number;
}

// Valores aproximados para cálculos de impacto
const impactFactors = {
  paper: {
    water: 0.02, // litros por grama
    energy: 0.0035, // kWh por grama
    trees: 0.00006, // árvores por grama
    co2: 0.0015, // kg de CO2 por grama
  },
  plastic: {
    water: 0.04, // litros por grama
    energy: 0.007, // kWh por grama
    trees: 0,
    co2: 0.003, // kg de CO2 por grama
  },
  glass: {
    water: 0.01, // litros por grama
    energy: 0.003, // kWh por grama
    trees: 0,
    co2: 0.0008, // kg de CO2 por grama
  },
  metal: {
    water: 0.02, // litros por grama
    energy: 0.01, // kWh por grama
    trees: 0,
    co2: 0.004, // kg de CO2 por grama
  },
  organic: {
    water: 0.005, // litros por grama
    energy: 0.001, // kWh por grama
    trees: 0.00001, // árvores por grama (composting benefit)
    co2: 0.0005, // kg de CO2 por grama
  },
};

const RecyclingCalculator: React.FC = () => {
  const [materialType, setMaterialType] = useState('paper');
  const [weight, setWeight] = useState<number | ''>('');
  const [results, setResults] = useState<CalculationResult | null>(null);

  const handleCalculate = () => {
    if (weight === '' || isNaN(Number(weight)) || Number(weight) <= 0) {
      return;
    }

    const factors = impactFactors[materialType as keyof typeof impactFactors];
    const weightInGrams = Number(weight) * 1000; // Convert kg to grams

    setResults({
      water: factors.water * weightInGrams,
      energy: factors.energy * weightInGrams,
      trees: factors.trees * weightInGrams,
      co2: factors.co2 * weightInGrams,
    });
  };

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
                <SelectItem value="paper">Papel/Papelão</SelectItem>
                <SelectItem value="plastic">Plástico</SelectItem>
                <SelectItem value="glass">Vidro</SelectItem>
                <SelectItem value="metal">Metal</SelectItem>
                <SelectItem value="organic">Orgânico</SelectItem>
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
            <h3 className="text-xl font-bold self-start">Seu Impacto Positivo</h3>
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
