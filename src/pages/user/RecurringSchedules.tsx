import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, Package, ChevronLeft, Star, AlertTriangle, Save, X, Pencil, Pause, Play, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { materialDisplayData } from '@/config/materialDisplayData';
import { getMaterialIdentificador } from '@/lib/utils';
import { getAllMaterials } from '@/lib/collectorService';

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

interface ProximaColeta {
  data: Date;
  materiais: Material[];
  observacoes?: string;
  fotos?: string[];
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
  proximaColeta: ProximaColeta;
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
      { tipo: 'papel', quantidade: '2', unidade: 'sacos' },
      { tipo: 'plastico', quantidade: '1', unidade: 'sacos' }
    ],
    coletor: {
      id: '1',
      nome: 'Maria Silva',
      foto: 'https://github.com/shadcn.png',
      avaliacao: 4.8,
      totalColetas: 15
    },
    dataCriacao: new Date('2024-03-19'),
    proximaColeta: {
      data: new Date('2024-03-22'),
      materiais: [
        { tipo: 'papel', quantidade: '2', unidade: 'sacos' },
        { tipo: 'plastico', quantidade: '1', unidade: 'sacos' }
      ],
      observacoes: '',
      fotos: []
    }
  }
];

const HORARIOS_DISPONIVEIS = [
  '08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'
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

const EditarProximaColetaModal = ({ open, onOpenChange, proximaColeta, onSave }) => {
  const [materiais, setMateriais] = useState(proximaColeta.materiais || []);
  const [observacoes, setObservacoes] = useState(proximaColeta.observacoes || '');
  const [fotos, setFotos] = useState(proximaColeta.fotos ? proximaColeta.fotos.join('\n') : '');

  const handleMaterialChange = (index, field, value) => {
    const novos = materiais.map((m, i) => i === index ? { ...m, [field]: value } : m);
    setMateriais(novos);
  };

  const handleAddMaterial = () => {
    setMateriais([...materiais, { id: Date.now().toString(), materialId: '', quantidade: '', unidade: '' }]);
  };

  const handleRemoveMaterial = (index) => {
    setMateriais(materiais.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave({
      ...proximaColeta,
      materiais,
      observacoes,
      fotos: fotos.split('\n').map(f => f.trim()).filter(f => f)
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Próxima Coleta</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Materiais</label>
            {materiais.map((mat, idx) => (
              <div key={mat.id || idx} className="flex gap-2 mb-2">
                <Input
                  placeholder="Tipo (ex: papel)"
                  value={mat.materialId}
                  onChange={e => handleMaterialChange(idx, 'materialId', e.target.value)}
                />
                <Input
                  placeholder="Quantidade"
                  value={mat.quantidade}
                  onChange={e => handleMaterialChange(idx, 'quantidade', e.target.value)}
                  style={{ width: 80 }}
                />
                <Input
                  placeholder="Unidade"
                  value={mat.unidade}
                  onChange={e => handleMaterialChange(idx, 'unidade', e.target.value)}
                  style={{ width: 80 }}
                />
                <Button variant="destructive" onClick={() => handleRemoveMaterial(idx)}>-</Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={handleAddMaterial}>Adicionar Material</Button>
          </div>
          <div>
            <label className="block font-medium mb-1">Observações</label>
            <Textarea
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              placeholder="Observações para o coletor"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Fotos (1 por linha, URL)</label>
            <Textarea
              value={fotos}
              onChange={e => setFotos(e.target.value)}
              placeholder="Cole aqui os links das fotos, um por linha"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const RecurringSchedules: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('pendentes');
  const [agendamentos, setAgendamentos] = useState<AgendamentoRecorrente[]>(mockAgendamentos);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<AgendamentoRecorrente | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<AgendamentoRecorrente> | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [agendamentoEditando, setAgendamentoEditando] = useState(null);
  const [materiaisDb, setMateriaisDb] = useState<any[]>([]);
  const [materiaisLoading, setMateriaisLoading] = useState(false);

  // Buscar materiais do banco de dados
  useEffect(() => {
    const fetchMateriais = async () => {
      setMateriaisLoading(true);
      try {
        const materiaisData = await getAllMaterials();
        setMateriaisDb(materiaisData);
      } catch (error) {
        console.error('Erro ao carregar materiais:', error);
      } finally {
        setMateriaisLoading(false);
      }
    };

    fetchMateriais();
  }, []);

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

  const handleEdit = (agendamento: AgendamentoRecorrente) => {
    setEditingId(agendamento.id);
    setEditForm({
      ...agendamento,
      diasSemana: [...agendamento.diasSemana],
      materiais: agendamento.materiais.map(m => ({ ...m }))
    });
    setShowEditDialog(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
    setShowEditDialog(false);
  };

  const handleSaveEdit = () => {
    if (!editForm) return;

    setAgendamentos(prev =>
      prev.map(a =>
        a.id === editingId
          ? { ...a, ...editForm }
          : a
      )
    );

    setEditingId(null);
    setEditForm(null);
    setShowEditDialog(false);
    toast.success('Agendamento atualizado com sucesso!');
  };

  const handleDiaSemanaChange = (dia: string) => {
    if (!editForm) return;

    const diasAtuais = editForm.diasSemana || [];
    const novosDias = diasAtuais.includes(dia)
      ? diasAtuais.filter(d => d !== dia)
      : [...diasAtuais, dia];

    setEditForm(prev => ({
      ...prev,
      diasSemana: novosDias
    }));
  };

  const handleMaterialChange = (index: number, field: keyof Material, value: string) => {
    if (!editForm?.materiais) return;

    const novosMateriais = [...editForm.materiais];
    novosMateriais[index] = {
      ...novosMateriais[index],
      [field]: value
    };

    setEditForm(prev => ({
      ...prev,
      materiais: novosMateriais
    }));
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

  const handleAddMaterial = () => {
    if (!editForm?.materiais) return;

    setEditForm(prev => ({
      ...prev,
      materiais: [...(prev?.materiais || []), { tipo: 'papel', quantidade: '1', unidade: 'sacos' }]
    }));
  };

  const handleRemoveMaterial = (index: number) => {
    if (!editForm?.materiais) return;

    setEditForm(prev => ({
      ...prev,
      materiais: prev?.materiais?.filter((_, i) => i !== index) || []
    }));
  };

  const filteredAgendamentos = statusFilter === 'todos'
    ? agendamentos
    : agendamentos.filter(a => {
        if (statusFilter === 'pendentes') return a.status === 'pendente';
        if (statusFilter === 'aceitos') return ['ativo', 'pausado'].includes(a.status);
        if (statusFilter === 'recusados') return a.status === 'encerrado';
        return a.status === statusFilter;
      });

  const handleAbrirModal = (agendamento) => {
    setAgendamentoEditando(agendamento);
    setModalAberto(true);
  };

  const handleSalvarProximaColeta = (novaProximaColeta) => {
    setAgendamentos(prev => prev.map(a =>
      a.id === agendamentoEditando.id
        ? { ...a, proximaColeta: { ...a.proximaColeta, ...novaProximaColeta } }
        : a
    ));
    setModalAberto(false);
    setAgendamentoEditando(null);
  };

  const renderAgendamentoContent = (agendamento: AgendamentoRecorrente) => {
    const isEditing = editingId === agendamento.id;
    const formData = isEditing ? editForm : agendamento;

    if (!formData) return null;

    return (
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
        </div>

        {/* Informações Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            {/* Dias da Semana */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-neutro" />
                <span className="font-medium">Dias:</span>
                <span>{getDiasSemana(formData.diasSemana)}</span>
              </div>
            </div>

            {/* Horário */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-neutro" />
              <span className="font-medium">Horário:</span>
              <span>{formData.horario}</span>
            </div>

            {/* Endereço */}
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-neutro mt-1" />
              <div>
                <p>{formData.endereco.rua}, {formData.endereco.numero}</p>
                <p className="text-sm text-muted-foreground">
                  {formData.endereco.bairro}, {formData.endereco.cidade} - {formData.endereco.estado}
                </p>
              </div>
            </div>

            {/* Materiais */}
            <div className="flex items-start gap-2">
              <Package className="h-4 w-4 text-neutro mt-1" />
              <div>
                <span className="font-medium">Materiais:</span>
                <div className="mt-1">
                  {formData.materiais.map((material, index) => (
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
                {format(agendamento.proximaColeta.data, "dd 'de' MMMM', às 'HH:mm", { locale: ptBR })}
              </p>
              {agendamento.ultimaColeta && (
                <p className="text-sm text-muted-foreground mt-1">
                  Última coleta: {format(agendamento.ultimaColeta, "dd/MM/yyyy")}
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => handleAbrirModal(agendamento)}
              >
                Editar próxima coleta
              </Button>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-end gap-2 mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(agendamento)}
            className="text-neutro hover:text-neutro/90"
          >
            <Pencil className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleTogglePause(agendamento)}
            className={agendamento.status === 'ativo' ? 'text-orange-500 hover:text-orange-600' : 'text-green-500 hover:text-green-600'}
            disabled={agendamento.status === 'pendente'}
          >
            {agendamento.status === 'ativo' ? (
              <>
                <Pause className="h-4 w-4 mr-1" />
                Pausar
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                Reativar
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(agendamento)}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Excluir
          </Button>
        </div>
      </div>
    );
  };

  const renderEditDialog = () => {
    if (!editForm) return null;

    return (
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar Agendamento Recorrente</DialogTitle>
            <DialogDescription>
              Atualize as informações do seu agendamento recorrente
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Frequência e Horário */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Frequência</Label>
                <Select
                  value={editForm.frequencia}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, frequencia: value as AgendamentoRecorrente['frequencia'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="quinzenal">Quinzenal</SelectItem>
                    <SelectItem value="mensal">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Horário</Label>
                <Select
                  value={editForm.horario}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, horario: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HORARIOS_DISPONIVEIS.map((hora) => (
                      <SelectItem key={hora} value={hora}>{hora}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dias da Semana */}
            <div className="space-y-2">
              <Label>Dias da Semana</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {DIAS_SEMANA.map((dia) => (
                  <div key={dia.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${dia.id}`}
                      checked={editForm.diasSemana?.includes(dia.id)}
                      onCheckedChange={() => handleDiaSemanaChange(dia.id)}
                    />
                    <label
                      htmlFor={`edit-${dia.id}`}
                      className="text-sm font-medium leading-none"
                    >
                      {dia.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Materiais */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Materiais</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddMaterial}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Material
                </Button>
              </div>
              <div className="space-y-4">
                {editForm.materiais?.map((material, index) => (
                  <div key={index} className="flex items-end gap-2">
                    <div className="flex-1 space-y-2">
                      <Label>Material</Label>
                      <Select
                        value={material.tipo}
                        onValueChange={(value) => handleMaterialChange(index, 'tipo', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {materiaisDb.map((material) => {
                            const displayInfo = materialDisplayData[material.identificador];
                            if (!displayInfo) return null;
                            
                            return (
                              <SelectItem key={material.id} value={material.identificador}>
                                <div className="flex items-center gap-2">
                                  <displayInfo.icone className={`h-4 w-4 ${displayInfo.cor}`} />
                                  <span>{displayInfo.nome}</span>
                                </div>
                              </SelectItem>
                            );
                          }).filter(Boolean)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24 space-y-2">
                      <Label>Qtd.</Label>
                      <Input
                        type="number"
                        value={material.quantidade}
                        onChange={(e) => handleMaterialChange(index, 'quantidade', e.target.value)}
                      />
                    </div>
                    <div className="w-32 space-y-2">
                      <Label>Unidade</Label>
                      <Select
                        value={material.unidade}
                        onValueChange={(value) => handleMaterialChange(index, 'unidade', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">Quilos</SelectItem>
                          <SelectItem value="sacos">Sacos</SelectItem>
                          <SelectItem value="caixas">Caixas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleRemoveMaterial(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} className="bg-neutro hover:bg-neutro/90">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

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
            onClick={() => navigate('/user/recurring-collection')}
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
                {renderAgendamentoContent(agendamento)}
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
        {renderEditDialog()}
        <EditarProximaColetaModal
          open={modalAberto}
          onOpenChange={setModalAberto}
          proximaColeta={agendamentoEditando?.proximaColeta || { materiais: [], observacoes: '', fotos: [] }}
          onSave={handleSalvarProximaColeta}
        />
      </div>
    </Layout>
  );
};

export default RecurringSchedules; 