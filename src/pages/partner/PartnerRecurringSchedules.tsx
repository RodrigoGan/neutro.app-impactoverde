import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Clock, MapPin, Package, ChevronLeft, Star, AlertTriangle, Pause, Play, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface Material {
  tipo: string;
  quantidade: string;
  unidade: string;
}

interface Coletor {
  id: string;
  nome: string;
  foto: string;
  avaliacao: number;
  totalColetas: number;
}

interface AgendamentoRecorrente {
  id: string;
  status: 'pendente' | 'ativo' | 'pausado' | 'encerrado';
  frequencia: 'semanal' | 'quinzenal' | 'mensal';
  diasSemana: string[];
  horario: string;
  endereco: {
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  materiais: Material[];
  coletor: Coletor;
  dataCriacao: Date;
  proximaColeta: Date;
  ultimaColeta?: Date;
}

// Dados mockados para exemplo
const mockAgendamentos: AgendamentoRecorrente[] = [
  {
    id: '1',
    status: 'pendente',
    frequencia: 'semanal',
    diasSemana: ['seg', 'qua', 'sex'],
    horario: '14:00',
    endereco: {
      rua: 'Rua das Flores',
      numero: '123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    materiais: [
      { tipo: 'Papel/Papelão', quantidade: '2', unidade: 'sacos' },
      { tipo: 'Plástico', quantidade: '1', unidade: 'sacos' }
    ],
    coletor: {
      id: '1',
      nome: 'Maria Silva',
      foto: 'https://github.com/shadcn.png',
      avaliacao: 4.8,
      totalColetas: 15
    },
    dataCriacao: new Date('2024-03-19'),
    proximaColeta: new Date('2024-03-22')
  }
];

const DIAS_SEMANA = [
  { id: 'dom', label: 'Domingo' },
  { id: 'seg', label: 'Segunda' },
  { id: 'ter', label: 'Terça' },
  { id: 'qua', label: 'Quarta' },
  { id: 'qui', label: 'Quinta' },
  { id: 'sex', label: 'Sexta' },
  { id: 'sab', label: 'Sábado' }
];

const PartnerRecurringSchedules: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('pendentes');
  const [agendamentos, setAgendamentos] = useState<AgendamentoRecorrente[]>(mockAgendamentos);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<AgendamentoRecorrente | null>(null);

  const getStatusBadge = (status: AgendamentoRecorrente['status']) => {
    switch (status) {
      case 'pendente':
        return <Badge className="bg-yellow-500">Pendente</Badge>;
      case 'ativo':
        return <Badge className="bg-green-500">Ativo</Badge>;
      case 'pausado':
        return <Badge variant="outline" className="text-orange-500 border-orange-500">Pausado</Badge>;
      case 'encerrado':
        return <Badge variant="outline" className="text-red-500 border-red-500">Encerrado</Badge>;
    }
  };

  const getDiasSemana = (dias: string[]) => {
    const diasMap: Record<string, string> = {
      dom: 'Domingo',
      seg: 'Segunda',
      ter: 'Terça',
      qua: 'Quarta',
      qui: 'Quinta',
      sex: 'Sexta',
      sab: 'Sábado'
    };
    return dias.map(dia => diasMap[dia]).join(', ');
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
  };

  const handleTogglePause = (agendamento: AgendamentoRecorrente) => {
    if (agendamento.status === 'pendente') {
      toast.error('Não é possível pausar um agendamento pendente');
      return;
    }

    const novoStatus = agendamento.status === 'ativo' ? 'pausado' : 'ativo';
    const mensagem = novoStatus === 'ativo' ? 'reativado' : 'pausado';

    setAgendamentos(prev =>
      prev.map(a =>
        a.id === agendamento.id
          ? { ...a, status: novoStatus as AgendamentoRecorrente['status'] }
          : a
      )
    );

    toast.success(`Agendamento ${mensagem} com sucesso!`);
  };

  const handleDelete = (agendamento: AgendamentoRecorrente) => {
    setSelectedAgendamento(agendamento);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedAgendamento) {
      setAgendamentos(prev => prev.filter(a => a.id !== selectedAgendamento.id));
      setShowDeleteDialog(false);
      setSelectedAgendamento(null);
      toast.success('Agendamento excluído com sucesso!');
    }
  };

  const filteredAgendamentos = statusFilter === 'todos'
    ? agendamentos
    : agendamentos.filter(a => {
        if (statusFilter === 'pendentes') return a.status === 'pendente';
        if (statusFilter === 'aceitos') return ['ativo', 'pausado'].includes(a.status);
        if (statusFilter === 'recusados') return a.status === 'encerrado';
        return a.status === statusFilter;
      });

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Agendamentos Recorrentes</h1>
            <p className="text-muted-foreground">
              Gerencie suas solicitações de coletas recorrentes
            </p>
          </div>
          <Button
            onClick={() => navigate('/partner/recurring-collection')}
            className="bg-neutro hover:bg-neutro/90"
          >
            Novo Agendamento
          </Button>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Button
            variant={statusFilter === 'pendentes' ? 'default' : 'ghost'}
            onClick={() => handleStatusChange('pendentes')}
            className="relative"
          >
            Pendentes
            {agendamentos.filter(a => a.status === 'pendente').length > 0 && (
              <Badge className="ml-2 bg-red-500">{agendamentos.filter(a => a.status === 'pendente').length}</Badge>
            )}
          </Button>
          <Button
            variant={statusFilter === 'aceitos' ? 'default' : 'ghost'}
            onClick={() => handleStatusChange('aceitos')}
          >
            Aceitos
          </Button>
          <Button
            variant={statusFilter === 'recusados' ? 'default' : 'ghost'}
            onClick={() => handleStatusChange('recusados')}
          >
            Recusados
          </Button>
        </div>

        <div className="space-y-4">
          {filteredAgendamentos.map((agendamento) => (
            <Card key={agendamento.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  {/* Cabeçalho do Card */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(agendamento.status)}
                      <Badge variant="outline" className="font-normal">
                        {agendamento.frequencia.charAt(0).toUpperCase() + agendamento.frequencia.slice(1)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Solicitado em {format(agendamento.dataCriacao, "dd/MM/yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {agendamento.status !== 'pendente' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTogglePause(agendamento)}
                        >
                          {agendamento.status === 'ativo' ? (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Pausar
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Reativar
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(agendamento)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </Button>
                    </div>
                  </div>

                  {/* Informações Principais */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      {/* Dias da Semana */}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-neutro" />
                        <span className="font-medium">Dias:</span>
                        <span>{getDiasSemana(agendamento.diasSemana)}</span>
                      </div>

                      {/* Horário */}
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-neutro" />
                        <span className="font-medium">Horário:</span>
                        <span>{agendamento.horario}</span>
                      </div>

                      {/* Endereço */}
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-neutro mt-1" />
                        <div>
                          <p>{agendamento.endereco.rua}, {agendamento.endereco.numero}</p>
                          <p className="text-sm text-muted-foreground">
                            {agendamento.endereco.bairro}, {agendamento.endereco.cidade} - {agendamento.endereco.estado}
                          </p>
                        </div>
                      </div>

                      {/* Materiais */}
                      <div className="flex items-start gap-2">
                        <Package className="h-4 w-4 text-neutro mt-1" />
                        <div>
                          <span className="font-medium">Materiais:</span>
                          <div className="mt-1">
                            {agendamento.materiais.map((material, index) => (
                              <p key={index}>
                                {material.tipo}: {material.quantidade} {material.unidade}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Coletor */}
                      <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                        <Avatar>
                          <AvatarImage src={agendamento.coletor.foto} alt={agendamento.coletor.nome} />
                          <AvatarFallback>{agendamento.coletor.nome.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{agendamento.coletor.nome}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 mr-1" />
                              {agendamento.coletor.avaliacao}
                            </div>
                            <span>•</span>
                            <span>{agendamento.coletor.totalColetas} coletas</span>
                          </div>
                        </div>
                      </div>

                      {/* Próxima Coleta */}
                      <div className="p-4 bg-neutro/5 rounded-lg">
                        <p className="text-sm font-medium mb-1">Próxima Coleta</p>
                        <p className="text-lg">
                          {format(agendamento.proximaColeta, "dd 'de' MMMM', às 'HH:mm", { locale: ptBR })}
                        </p>
                        {agendamento.ultimaColeta && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Última coleta: {format(agendamento.ultimaColeta, "dd/MM/yyyy")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredAgendamentos.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum agendamento encontrado</p>
            </div>
          )}
        </div>

        {/* Dialog de Confirmação de Exclusão */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Confirmar Exclusão
              </DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir este agendamento recorrente?
                Esta ação não poderá ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                className="flex-1"
              >
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default PartnerRecurringSchedules; 