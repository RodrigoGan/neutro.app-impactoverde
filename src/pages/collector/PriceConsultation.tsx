import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, DollarSign, Package, ChevronLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Interface para garantir tipagem consistente
interface MaterialPrice {
  materialId: string;
  name: string;
  basePrice: number;
  adjustment: number;
  unit: string;
}

interface Company {
  id: string;
  name: string;
  location: string;
  distance: string;
  prices: MaterialPrice[];
  isCurrent?: boolean;
}

// Dados mockados padronizados
const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Empresa Verde',
    location: 'São Paulo, SP',
    distance: '2.5 km',
    isCurrent: true,
    prices: [
      { materialId: '1', name: 'Papelão', basePrice: 0.50, adjustment: 0.10, unit: 'kg' },
      { materialId: '2', name: 'Vidro', basePrice: 0.30, adjustment: 0.05, unit: 'kg' },
      { materialId: '3', name: 'Latinhas', basePrice: 5.00, adjustment: 0.50, unit: 'kg' },
    ]
  },
  {
    id: '2',
    name: 'Recicla Brasil',
    location: 'São Paulo, SP',
    distance: '5.8 km',
    prices: [
      { materialId: '1', name: 'Papelão', basePrice: 0.45, adjustment: 0.08, unit: 'kg' },
      { materialId: '2', name: 'Vidro', basePrice: 0.25, adjustment: 0.03, unit: 'kg' },
      { materialId: '3', name: 'Latinhas', basePrice: 4.80, adjustment: 0.40, unit: 'kg' },
    ]
  },
  {
    id: '3',
    name: 'Eco Reciclagem',
    location: 'São Paulo, SP',
    distance: '3.2 km',
    prices: [
      { materialId: '1', name: 'Papelão', basePrice: 0.55, adjustment: 0.12, unit: 'kg' },
      { materialId: '2', name: 'Vidro', basePrice: 0.35, adjustment: 0.07, unit: 'kg' },
      { materialId: '3', name: 'Latinhas', basePrice: 5.20, adjustment: 0.60, unit: 'kg' },
    ]
  }
];

export const PriceConsultation: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Função para filtrar empresas baseada na busca
  const filteredCompanies = React.useMemo(() => {
    return mockCompanies.filter(company => 
      company.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Função para encontrar a empresa atual
  const currentCompany = React.useMemo(() => {
    return mockCompanies.find(company => company.isCurrent);
  }, []);

  // Função para calcular o preço final
  const calculateFinalPrice = (basePrice: number, adjustment: number) => {
    return (basePrice + adjustment).toFixed(2);
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Consulta de Preços</h1>
            <p className="text-muted-foreground">
              Compare preços entre empresas e encontre as melhores oportunidades
            </p>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        <div className="grid gap-6">
          {/* Barra de busca */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome da empresa..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Empresa Atual */}
          {currentCompany && (
            <Card className="border-2 border-neutro">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {currentCompany.name}
                  <Badge variant="secondary" className="ml-2">Sua Empresa</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{currentCompany.location}</span>
                    <span>•</span>
                    <span>{currentCompany.distance}</span>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Material</TableHead>
                          <TableHead>Preço Base</TableHead>
                          <TableHead>Acréscimo</TableHead>
                          <TableHead className="bg-neutro/5 font-bold">Preço Final</TableHead>
                          <TableHead>Unidade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentCompany.prices.map((price) => (
                          <TableRow key={price.materialId}>
                            <TableCell className="font-medium">{price.name}</TableCell>
                            <TableCell>R$ {price.basePrice.toFixed(2)}</TableCell>
                            <TableCell>R$ {price.adjustment.toFixed(2)}</TableCell>
                            <TableCell className="bg-neutro/5 font-bold text-lg">
                              R$ {calculateFinalPrice(price.basePrice, price.adjustment)}
                            </TableCell>
                            <TableCell>/{price.unit}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Outras Empresas */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Outras Empresas</h2>
            {filteredCompanies
              .filter(company => !company.isCurrent)
              .map((company) => (
                <Card key={company.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {company.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{company.location}</span>
                        <span>•</span>
                        <span>{company.distance}</span>
                      </div>

                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Material</TableHead>
                              <TableHead>Preço Base</TableHead>
                              <TableHead>Acréscimo</TableHead>
                              <TableHead className="bg-neutro/5 font-bold">Preço Final</TableHead>
                              <TableHead>Unidade</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {company.prices.map((price) => (
                              <TableRow key={price.materialId}>
                                <TableCell className="font-medium">{price.name}</TableCell>
                                <TableCell>R$ {price.basePrice.toFixed(2)}</TableCell>
                                <TableCell>R$ {price.adjustment.toFixed(2)}</TableCell>
                                <TableCell className="bg-neutro/5 font-bold text-lg">
                                  R$ {calculateFinalPrice(price.basePrice, price.adjustment)}
                                </TableCell>
                                <TableCell>/{price.unit}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}; 