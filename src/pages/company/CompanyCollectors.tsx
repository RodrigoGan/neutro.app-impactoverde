import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, MapPin, Star, UserPlus, ChevronLeft, Smartphone } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

const CompanyCollectors: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const companyId = user?.entity?.id || location.state?.userId;
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('todos');
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Buscar coletores reais do banco ao carregar
  useEffect(() => {
    async function fetchCollectors() {
      if (!companyId) return;
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('entity_id', companyId)
          .eq('user_type', 'collector');
        if (error) throw error;
        // Mapear para o formato esperado pela UI
        const mapped = (data || []).map((col: any) => ({
          id: col.id,
          name: col.name || 'Coletor',
          avatar: col.avatar_url || '/placeholder-avatar.jpg',
          hasSmartphone: !!col.has_app,
          location: col.location || col.address || '',
          rating: col.rating || 0,
          status: col.status || 'Ativo',
          collectionsToday: col.collections_today || 0,
        }));
        setCollectors(mapped);
      } catch (err: any) {
        setError('Erro ao buscar coletores da empresa.');
        setCollectors([]);
      } finally {
        setLoading(false);
      }
    }
    if (companyId) fetchCollectors();
  }, [companyId]);

  const filteredCollectors = collectors
    .filter(collector =>
      collector.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(collector => {
      if (activeFilter === 'comApp') return collector.hasSmartphone;
      if (activeFilter === 'semApp') return !collector.hasSmartphone;
      if (activeFilter === 'comColetaHoje') return collector.collectionsToday > 0;
      return true; // 'todos'
    });

  return (
    <Layout>
      <div className="container py-8 px-4 md:px-6">
        <div className="flex flex-col gap-6">
          {/* Cabeçalho */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/dashboard/standard', { state: { userId: location.state?.userId } })}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Coletores Vinculados</h1>
                <p className="text-muted-foreground mt-1">
                  Gerencie seus coletores e visualize suas agendas
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto"
                onClick={() => navigate('/link-existing-collector')}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Vincular Coletor Existente
              </Button>
              <Button 
                variant="default" 
                className="w-full sm:w-auto bg-neutro hover:bg-neutro/90"
                onClick={() => navigate('/collector/register/individual', { state: { companyId: location.state?.userId } })}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Cadastrar Novo Coletor
              </Button>
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="space-y-4">
            <Tabs defaultValue="todos" onValueChange={setActiveFilter}>
              <TabsList className="grid w-full grid-cols-4 max-w-[600px]">
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="comApp">Com App</TabsTrigger>
                <TabsTrigger value="semApp">Sem App</TabsTrigger>
                <TabsTrigger value="comColetaHoje">Com coleta hoje</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar coletor por nome..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Lista de Coletores */}
          {loading && (
            <div className="text-center py-8 text-muted-foreground">Carregando coletores...</div>
          )}
          {error && (
            <div className="text-center py-8 text-red-500">{error}</div>
          )}
          {!loading && !error && filteredCollectors.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">Nenhum coletor encontrado.</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCollectors.map((collector) => (
              <Card key={collector.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={collector.avatar} alt={collector.name} />
                      <AvatarFallback>{collector.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                          {collector.name}
                          {collector.collectionsToday > 0 && (
                            <Badge variant="default" className="flex items-center gap-1 bg-green-600 text-white">
                              <Calendar className="h-3 w-3" />
                              {collector.collectionsToday} coleta{collector.collectionsToday > 1 ? 's' : ''} hoje
                            </Badge>
                          )}
                        </h3>
                        <Badge 
                          variant={collector.hasSmartphone ? "default" : "secondary"}
                          className="flex items-center gap-1"
                        >
                          <Smartphone className="h-3 w-3" />
                          {collector.hasSmartphone ? "Com App" : "Sem App"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{collector.location}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{collector.rating}</span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => navigate(`/collector/schedule/${collector.id}`)}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          Ver Agenda
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1 bg-neutro hover:bg-neutro/90"
                          onClick={() => navigate(`/edit-collector/${collector.id}`, { state: { userId: location.state?.userId } })}
                        >
                          Editar
                        </Button>
                      </div>
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

export default CompanyCollectors; 