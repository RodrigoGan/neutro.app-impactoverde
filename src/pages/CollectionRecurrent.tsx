import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Loader2, Users as UsersIcon } from 'lucide-react';

// Constantes
const PERIODOS_COLETA = [
  { id: 'manha', nome: 'Manhã (08:00 - 12:00)' },
  { id: 'tarde', nome: 'Tarde (13:00 - 18:00)' },
  { id: 'noite', nome: 'Noite (19:00 - 22:00)' },
];

// Interface para Coletor
interface Coletor {
  id: string;
  nome: string;
  regioesAtendidas: string[];
  materiaisAceitos: string[];
  periodosDisponiveis: string[]; // ['manha', 'tarde', 'noite']
  diasDisponiveis: string[]; // ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']
}

// MOCK de coletores (pode ser importado de outro arquivo)
const COLETORES_MOCK: Coletor[] = [
  {
    id: 'coletor-001',
    nome: 'João Ambiental',
    regioesAtendidas: ['Zona Sul', 'Zona Oeste'],
    materiaisAceitos: ['papel', 'plastico', 'vidro', 'metal', 'aluminio'],
    periodosDisponiveis: ['manha', 'tarde'],
    diasDisponiveis: ['seg', 'ter', 'qua', 'qui', 'sex']
  },
  {
    id: 'coletor-002',
    nome: 'Maria Recicla',
    regioesAtendidas: ['Zona Oeste', 'Centro'],
    materiaisAceitos: ['papel', 'plastico', 'vidro', 'metal', 'aluminio', 'cobre', 'oleo'],
    periodosDisponiveis: ['tarde', 'noite'],
    diasDisponiveis: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab']
  },
  {
    id: 'coletor-003',
    nome: 'Pedro Sustentável',
    regioesAtendidas: ['Zona Leste', 'Zona Norte'],
    materiaisAceitos: ['papel', 'plastico', 'vidro', 'metal', 'aluminio', 'cobre', 'oleo', 'eletronico', 'pilhas', 'lampadas'],
    periodosDisponiveis: ['manha', 'noite'],
    diasDisponiveis: ['seg', 'ter', 'qua', 'qui', 'sex']
  },
];

const CollectionRecurrent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profileType = 'user' } = location.state || {};

  // Estado do endereço selecionado (mock para exemplo)
  const [enderecoParaFiltro, setEnderecoParaFiltro] = useState({ regiao: 'Zona Sul' });
  const [periodoSelecionado, setPeriodoSelecionado] = useState<string>('');
  const [dataSelecionada, setDataSelecionada] = useState<Date | null>(null);
  const [materiaisAdicionados, setMateriaisAdicionados] = useState<any[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [coletoresFiltrados, setColetoresFiltrados] = useState<Coletor[]>([]);

  // 1. Ao abrir, mostra todos da região
  useEffect(() => {
    const daRegiao = COLETORES_MOCK.filter(coletor => coletor.regioesAtendidas.includes(enderecoParaFiltro.regiao));
    setColetoresFiltrados(daRegiao);
  }, [enderecoParaFiltro]);

  // 2. A cada filtro, vai reduzindo
  useEffect(() => {
    let filtrados = COLETORES_MOCK.filter(coletor => coletor.regioesAtendidas.includes(enderecoParaFiltro.regiao));
    if (materiaisAdicionados.length > 0) {
      const materiaisColeta = materiaisAdicionados.map(m => m.id);
      filtrados = filtrados.filter(coletor => materiaisColeta.every(materialId => coletor.materiaisAceitos.includes(materialId)));
    }
    if (periodoSelecionado) {
      filtrados = filtrados.filter(coletor => coletor.periodosDisponiveis.includes(periodoSelecionado));
    }
    if (dataSelecionada) {
      const diaSemana = dataSelecionada.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      filtrados = filtrados.filter(coletor => coletor.diasDisponiveis.includes(diaSemana));
    }
    setColetoresFiltrados(filtrados);
  }, [enderecoParaFiltro, materiaisAdicionados, periodoSelecionado, dataSelecionada]);

  const handleDataChange = (date: Date | undefined) => {
    setDataSelecionada(date || null);
    setIsCalendarOpen(false);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="space-y-8 py-6">
              {/* Seção de Data e Período */}
              <section>
                <h2 className="text-xl font-semibold mb-4">Data e Período da Coleta</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="data-coleta">Data da Coleta *</Label>
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={`w-full justify-start text-left font-normal ${!dataSelecionada && "text-muted-foreground"}`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dataSelecionada ? format(dataSelecionada, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dataSelecionada || undefined}
                          onSelect={handleDataChange}
                          disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="periodo-coleta">Período Preferencial *</Label>
                    <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
                      <SelectTrigger id="periodo-coleta">
                        <SelectValue placeholder="Selecione um período" />
                      </SelectTrigger>
                      <SelectContent>
                        {PERIODOS_COLETA.map(periodo => (
                          <SelectItem key={periodo.id} value={periodo.id}>
                            {periodo.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              {/* Seção de Coletores Disponíveis */}
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <UsersIcon className="h-5 w-5 text-neutro" />
                  Coletores Disponíveis
                </h2>
                {coletoresFiltrados.length === 0 ? (
                  <p className="text-center text-amber-700 bg-amber-50 p-3 rounded-md">Nenhum coletor disponível para a região selecionada.</p>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {coletoresFiltrados.length} coletor(es) disponíveis para os filtros atuais.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {coletoresFiltrados.map(coletor => (
                        <div key={coletor.id} className="p-4 border rounded-lg">
                          <h4 className="font-semibold text-md">{coletor.nome}</h4>
                          <p className="text-xs text-muted-foreground mt-1">Regiões: {coletor.regioesAtendidas.join(', ')}</p>
                          <p className="text-xs text-muted-foreground mt-1">Materiais: {coletor.materiaisAceitos.join(', ')}</p>
                          <p className="text-xs text-muted-foreground mt-1">Períodos: {coletor.periodosDisponiveis.join(', ')}</p>
                          <p className="text-xs text-muted-foreground mt-1">Dias: {coletor.diasDisponiveis.join(', ')}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CollectionRecurrent; 