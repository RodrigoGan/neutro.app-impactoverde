import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Star, ArrowLeft, Smartphone, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

const LinkExistingCollector: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCollector, setExpandedCollector] = useState<string | null>(null);
  const [availableCollectors, setAvailableCollectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const companyId = user?.entity?.id;
  const [vinculandoId, setVinculandoId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAvailableCollectors() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .is('entity_id', null)
          .eq('user_type', 'collector'); // ajuste para o valor correto se necessário
        if (error) throw error;
        setAvailableCollectors(data || []);
      } catch (err) {
        setError('Erro ao buscar coletores disponíveis.');
        setAvailableCollectors([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAvailableCollectors();
  }, []);

  const filteredCollectors = availableCollectors.filter(collector =>
    collector.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
                  {loading && (
                    <div className="text-center py-8 text-muted-foreground">Carregando coletores...</div>
                  )}
                  {error && (
                    <div className="text-center py-8 text-red-500">{error}</div>
                  )}
                  {!loading && !error && filteredCollectors.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">Nenhum coletor disponível para vincular.</div>
                  )}
                  {filteredCollectors.map((collector) => (
                    <div
                      key={collector.id}
                      className={`border rounded-lg mb-2 cursor-pointer transition-shadow ${expandedCollector === collector.id ? 'shadow-md bg-gray-50' : ''}`}
                      onClick={() => setExpandedCollector(expandedCollector === collector.id ? null : collector.id)}
                    >
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={collector.avatar_url || '/placeholder-avatar.jpg'} alt={collector.name} />
                            <AvatarFallback>{collector.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{collector.name}</h3>
                            <p className="text-sm text-muted-foreground">{collector.location || collector.address || ''}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-muted-foreground">{collector.rating || 0}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          disabled={vinculandoId === collector.id}
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!companyId) return;
                            setVinculandoId(collector.id);
                            try {
                              const { error } = await supabase
                                .from('users')
                                .update({ entity_id: companyId })
                                .eq('id', collector.id);
                              if (error) throw error;
                              navigate('/company-collectors');
                            } catch (err) {
                              alert('Erro ao vincular coletor.');
                            } finally {
                              setVinculandoId(null);
                            }
                          }}
                        >
                          {vinculandoId === collector.id ? 'Vinculando...' : 'Vincular'}
                        </Button>
                      </div>
                      {expandedCollector === collector.id && (
                        <div className="px-4 pb-4">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 col-span-2">
                              <MapPin className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium">{collector.address || collector.location || ''}</span>
                            </div>
                            <div className="flex items-center gap-2 col-span-2">
                              <Smartphone className={`h-4 w-4 ${collector.has_app ? 'text-green-500' : 'text-gray-400'}`} />
                              <span className="text-sm font-medium">{collector.has_app ? 'Com App' : 'Sem App'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm">{collector.rating || 0}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-purple-500" />
                              <span className="text-sm">Agenda Disponível</span>
                            </div>
                            <div className="flex items-center gap-2 col-span-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 008.48 19h7.04a2 2 0 001.83-1.3L17 13M7 13V6h13" /></svg>
                              <span className="text-sm font-medium">{collector.phone || ''}</span>
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