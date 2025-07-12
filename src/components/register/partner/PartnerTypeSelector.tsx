import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PartnerTypeSelectorProps {
  onSelect: (type: 'restaurant' | 'store' | 'educational') => void;
}

const PartnerTypeSelector: React.FC<PartnerTypeSelectorProps> = ({ onSelect }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Selecione o Tipo de Parceiro</h2>
        <p className="text-muted-foreground mt-2">
          Escolha o tipo de parceiro que melhor representa seu negócio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => onSelect('restaurant')}>
          <CardHeader>
            <CardTitle>Restaurante</CardTitle>
            <CardDescription>
              Ideal para restaurantes, bares, cafeterias e estabelecimentos de alimentação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Gestão de resíduos orgânicos</li>
              <li>Programa de copos reutilizáveis</li>
              <li>Descontos para clientes sustentáveis</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => onSelect('store')}>
          <CardHeader>
            <CardTitle>Loja</CardTitle>
            <CardDescription>
              Perfeito para lojas de varejo, supermercados e estabelecimentos comerciais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Gestão de embalagens</li>
              <li>Programa de pontos sustentáveis</li>
              <li>Descontos para clientes eco-friendly</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => onSelect('educational')}>
          <CardHeader>
            <CardTitle>Instituição de Ensino</CardTitle>
            <CardDescription>
              Ideal para escolas, universidades e centros educacionais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Programas de educação ambiental</li>
              <li>Gestão de resíduos escolares</li>
              <li>Descontos para alunos sustentáveis</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PartnerTypeSelector; 