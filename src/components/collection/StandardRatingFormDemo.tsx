import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StandardRatingForm from './StandardRatingForm';

const StandardRatingFormDemo: React.FC = () => {
  const handleSubmit = (avaliacao: { estrelas: number; comentario?: string }) => {
    console.log('Avaliação enviada:', avaliacao);
    alert(`Avaliação enviada com sucesso!\nEstrelas: ${avaliacao.estrelas}\nComentário: ${avaliacao.comentario || 'Nenhum'}`);
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Demonstração do Formulário de Avaliação</h1>

      {/* Exemplo 1: Avaliação do Coletor */}
      <Card>
        <CardHeader>
          <CardTitle>Avaliação do Coletor</CardTitle>
        </CardHeader>
        <CardContent>
          <StandardRatingForm
            tipo="coletor"
            avaliadoPor="Solicitante"
            onSubmit={handleSubmit}
            onCancel={() => alert('Avaliação cancelada')}
          />
        </CardContent>
      </Card>

      {/* Exemplo 2: Avaliação do Solicitante */}
      <Card>
        <CardHeader>
          <CardTitle>Avaliação do Solicitante</CardTitle>
        </CardHeader>
        <CardContent>
          <StandardRatingForm
            tipo="solicitante"
            avaliadoPor="Coletor"
            onSubmit={handleSubmit}
            onCancel={() => alert('Avaliação cancelada')}
          />
        </CardContent>
      </Card>

      {/* Instruções de Uso */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Como Usar</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-4 space-y-2">
            <li>Clique nas estrelas para selecionar a avaliação (1 a 5 estrelas)</li>
            <li>Adicione um comentário opcional no campo de texto</li>
            <li>Clique em "Enviar Avaliação" para confirmar</li>
            <li>Use "Cancelar" para fechar o formulário</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default StandardRatingFormDemo; 