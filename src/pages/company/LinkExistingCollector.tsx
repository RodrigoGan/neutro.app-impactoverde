import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Star, ArrowLeft, Smartphone, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LinkExistingCollector: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCollector, setExpandedCollector] = useState<number | null>(null);

  // Dados de exemplo - serão substituídos por dados reais
  const availableCollectors = [
    {
      id: 1,
      name: 'Carlos Oliveira',
      avatar: '/placeholder-avatar.jpg',
      hasSmartphone: true,
      location: 'Jardim Paulista',
      fullAddress: 'Rua das Flores, 123, Jardim Paulista, São Paulo - SP, 01234-567',
      phone: '(11) 91234-5678',
      rating: 4.7,
      status: 'Disponível'
    },
    {
      id: 2,
      name: 'Ana Costa',
      avatar: '/placeholder-avatar.jpg',
      hasSmartphone: false,
      location: 'Vila Mariana',
      fullAddress: 'Av. Brasil, 456, Vila Mariana, São Paulo - SP, 04567-890',
      phone: '(11) 99876-5432',
      rating: 4.9,
      status: 'Disponível'
    },
    // Adicionar mais coletores conforme necessário
  ];

  const filteredCollectors = availableCollectors.filter(collector =>
    collector.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="container py-8 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Vincular Coletor Existente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Barra de Pesquisa */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar coletor por nome..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Lista de Coletores Disponíveis */}
                <div className="space-y-4">
                  {filteredCollectors.map((collector) => (
                    <div
                      key={collector.id}
                      className={`border rounded-lg mb-2 cursor-pointer transition-shadow ${expandedCollector === collector.id ? 'shadow-md bg-gray-50' : ''}`}
                      onClick={() => setExpandedCollector(expandedCollector === collector.id ? null : collector.id)}
                    >
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={collector.avatar} alt={collector.name} />
                            <AvatarFallback>{collector.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{collector.name}</h3>
                            <p className="text-sm text-muted-foreground">{collector.location}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-muted-foreground">{collector.rating}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Lógica para vincular o coletor
                            navigate('/company-collectors');
                          }}
                        >
                          Vincular
                        </Button>
                      </div>
                      {expandedCollector === collector.id && (
                        <div className="px-4 pb-4">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 col-span-2">
                              <MapPin className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium">{collector.fullAddress}</span>
                            </div>
                            <div className="flex items-center gap-2 col-span-2">
                              <Smartphone className={`h-4 w-4 ${collector.hasSmartphone ? 'text-green-500' : 'text-gray-400'}`} />
                              <span className="text-sm font-medium">{collector.hasSmartphone ? 'Com App' : 'Sem App'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm">{collector.rating}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-purple-500" />
                              <span className="text-sm">Agenda Disponível</span>
                            </div>
                            <div className="flex items-center gap-2 col-span-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 008.48 19h7.04a2 2 0 001.83-1.3L17 13M7 13V6h13" /></svg>
                              <span className="text-sm font-medium">{collector.phone}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default LinkExistingCollector; 