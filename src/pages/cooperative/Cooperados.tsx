import React, { useEffect, useState, useRef } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Star, Edit, Trash2 } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';
import AppFooter from '@/components/AppFooter';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabaseClient';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';

const ratingCriteria = [
  { key: 'aparencia', label: 'Aparência (uniforme)' },
  { key: 'assiduidade', label: 'Assiduidade' },
  { key: 'bom_relacionamento', label: 'Bom relacionamento' },
];

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const defaultPermissions = {
  cupons: false,
  metas: false,
  impacto: false,
  financeiro: false,
  notificacoes: false,
  equipe: false,
};

const Cooperados: React.FC = () => {
  const [cooperados, setCooperados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRatingModal, setShowRatingModal] = useState<{ open: boolean, cooperado: any | null }>({ open: false, cooperado: null });
  const [ratingValues, setRatingValues] = useState<{ [key: string]: number | undefined }>({});
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const { profile } = useUserProfile();
  const [ratings, setRatings] = useState<any[]>([]);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState<{ open: boolean, cooperado: any | null }>({ open: false, cooperado: null });
  const [editForm, setEditForm] = useState<any>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editMsg, setEditMsg] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState<{ open: boolean, cooperado: any | null }>({ open: false, cooperado: null });
  const [deleteSaving, setDeleteSaving] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState('');
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Buscar cooperados reais do banco de dados
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setRatingsLoading(true);
      // Buscar cooperados reais vinculados à cooperativa (ajuste o filtro conforme necessário)
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_type', 'cooperado'); // ajuste se necessário para seu sistema
      setCooperados(users || []);
      setLoading(false);
      // Buscar avaliações reais
      const { data, error } = await supabase.from('cooperado_ratings').select('*');
      if (!error && data) {
        setRatings(data);
      }
      setRatingsLoading(false);
    }
    fetchData();
  }, []);

  // Função para calcular média de um cooperado
  function calcularMediaCooperado(cooperadoId: string) {
    const avals = ratings.filter(r => r.cooperado_id === cooperadoId);
    let soma = 0;
    let count = 0;
    avals.forEach(av => {
      ['aparencia', 'assiduidade', 'bom_relacionamento'].forEach(key => {
        if (av[key] !== null && av[key] !== undefined) {
          soma += av[key];
          count++;
        }
      });
    });
    return count > 0 ? (soma / count).toFixed(2) : null;
  }

  // Função para calcular média geral
  function calcularMediaGeral() {
    let soma = 0;
    let count = 0;
    ratings.forEach(av => {
      ['aparencia', 'assiduidade', 'bom_relacionamento'].forEach(key => {
        if (av[key] !== null && av[key] !== undefined) {
          soma += av[key];
          count++;
        }
      });
    });
    return count > 0 ? (soma / count).toFixed(2) : null;
  }

  // Abrir modal de edição
  const handleEdit = (id: string) => {
    const coop = cooperados.find((c) => c.id === id);
    if (!coop) return;
    setEditForm({
      ...coop,
      permissions: coop.permissions || { ...defaultPermissions },
      status: coop.status || 'Ativo',
      role: coop.role || '',
      admission: coop.admission || '',
      notes: coop.notes || '',
      avatar_url: coop.avatar_url || '',
    });
    setShowEditModal({ open: true, cooperado: coop });
    setEditMsg('');
  };

  // Atualizar campos do formulário de edição
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((prev: any) => ({ ...prev, [name]: value }));
  };
  const handleEditPermission = (key: string) => {
    setEditForm((prev: any) => ({ ...prev, permissions: { ...prev.permissions, [key]: !prev.permissions[key] } }));
  };

  // Salvar edição no Supabase
  const handleEditSave = async () => {
    if (!editForm) return;
    setEditSaving(true);
    const { id, name, phone, role, admission, notes, status, avatar_url, permissions } = editForm;
    const { error } = await supabase.from('users').update({
      name,
      phone,
      role,
      admission,
      notes,
      status,
      avatar_url,
      permissions,
    }).eq('id', id);
    setEditSaving(false);
    if (!error) {
      setEditMsg('Alterações salvas com sucesso!');
      setShowEditModal({ open: false, cooperado: null });
      // Atualizar lista local
      setCooperados((prev: any[]) => prev.map(c => c.id === id ? { ...c, ...editForm } : c));
    } else {
      setEditMsg('Erro ao salvar alterações.');
    }
  };

  // Abrir modal de confirmação de exclusão
  const handleDelete = (id: string) => {
    const coop = cooperados.find((c) => c.id === id);
    if (!coop) return;
    setShowDeleteModal({ open: true, cooperado: coop });
    setDeleteMsg('');
  };

  // Confirmar exclusão
  const handleConfirmDelete = async () => {
    if (!showDeleteModal.cooperado) return;
    setDeleteSaving(true);
    const { id } = showDeleteModal.cooperado;
    const { error } = await supabase.from('users').delete().eq('id', id);
    setDeleteSaving(false);
    if (!error) {
      setDeleteMsg('Cooperado excluído com sucesso!');
      setShowDeleteModal({ open: false, cooperado: null });
      setCooperados((prev: any[]) => prev.filter(c => c.id !== id));
    } else {
      setDeleteMsg('Erro ao excluir cooperado.');
    }
  };

  const handleRate = (cooperado: any) => {
    setShowRatingModal({ open: true, cooperado });
    setRatingValues({});
    setSuccessMsg('');
  };

  // Função para salvar avaliação no Supabase
  const handleSubmitRating = async () => {
    if (!showRatingModal.cooperado || !profile) return;
    setSaving(true);
    const { id: cooperado_id } = showRatingModal.cooperado;
    const avaliador_id = profile.id;
    const mes = getCurrentMonth();
    const { aparencia, assiduidade, bom_relacionamento } = ratingValues;
    if (!aparencia && !assiduidade && !bom_relacionamento) {
      setSaving(false);
      setSuccessMsg('Selecione pelo menos um critério para avaliar.');
      return;
    }
    const { error } = await supabase.from('cooperado_ratings').insert({
      cooperado_id,
      avaliador_id,
      mes,
      aparencia: aparencia ?? null,
      assiduidade: assiduidade ?? null,
      bom_relacionamento: bom_relacionamento ?? null,
    });
    setSaving(false);
    if (!error) {
      setSuccessMsg('Avaliação registrada com sucesso!');
      setShowRatingModal({ open: false, cooperado: null });
      // TODO: Atualizar médias após avaliação
    } else {
      setSuccessMsg('Erro ao salvar avaliação. Tente novamente.');
    }
  };

  // Função para renderizar estrelas para cada critério
  const renderStars = (key: string) => (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, idx) => (
        <button
          key={idx}
          type="button"
          className="focus:outline-none"
          onClick={() => setRatingValues((prev) => ({ ...prev, [key]: idx + 1 }))}
        >
          <Star className={`h-6 w-6 transition-colors ${idx < (ratingValues[key] || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
        </button>
      ))}
      <span className="text-sm ml-2">{ratingValues[key] ? `${ratingValues[key]} estrelas` : 'Não avaliado'}</span>
    </div>
  );

  // Filtrar cooperados pelo termo de busca
  const filteredCooperados = cooperados.filter((c) => {
    const term = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      (c.email && c.email.toLowerCase().includes(term))
    );
  });

  // Sugestões para autocompletar
  const suggestions = search.length > 0
    ? cooperados.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
      ).slice(0, 5)
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <div className="container max-w-2xl py-8 flex-1">
        <BackButton />
        <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
          Cooperados da Cooperativa
          <span className="ml-2 flex items-center gap-1 text-base font-normal text-yellow-600">
            <Star className="h-5 w-5" /> Média: {ratingsLoading ? '...' : calcularMediaGeral() ?? '0.00'}
          </span>
        </h1>
        {/* Input de busca com autocompletar */}
        <div className="mb-6 relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Buscar cooperado por nome ou e-mail..."
            value={search}
            onChange={e => { setSearch(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            className="w-full max-w-md"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 bg-white border rounded shadow w-full max-w-md mt-1">
              {suggestions.map((c) => (
                <div
                  key={c.id}
                  className="px-4 py-2 cursor-pointer hover:bg-muted"
                  onMouseDown={() => {
                    setSearch(c.name);
                    setShowSuggestions(false);
                    inputRef.current?.blur();
                  }}
                >
                  <span className="font-medium">{c.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{c.email}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <Card>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Carregando cooperados...</div>
            ) : filteredCooperados.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">Nenhum cooperado cadastrado ainda. Quando você cadastrar um cooperado, ele aparecerá aqui para gestão, avaliação e edição.</div>
            ) : (
              <div className="space-y-3">
                {filteredCooperados.map((c) => {
                  const expanded = expandedId === c.id;
                  return (
                    <div key={c.id} className="bg-muted/50 rounded-lg">
                      <div
                        className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${expanded ? 'bg-muted' : ''}`}
                        onClick={() => setExpandedId(expanded ? null : c.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            {c.avatar_url ? <AvatarImage src={c.avatar_url} /> : <AvatarFallback>{c.name.slice(0,2).toUpperCase()}</AvatarFallback>}
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.email}</p>
                            <div className="flex items-center gap-1 text-yellow-600 text-xs">
                              <Star className="h-4 w-4" /> {ratingsLoading ? '...' : calcularMediaCooperado(c.id) ?? '-'}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost" onClick={e => { e.stopPropagation(); handleRate(c); }} title="Avaliar">
                            <Star className="h-5 w-5 text-yellow-600" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={e => { e.stopPropagation(); handleEdit(c.id); }} title="Editar">
                            <Edit className="h-5 w-5 text-blue-600" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={e => { e.stopPropagation(); handleDelete(c.id); }} title="Excluir">
                            <Trash2 className="h-5 w-5 text-red-600" />
                          </Button>
                        </div>
                      </div>
                      {expanded && (
                        <div className="px-6 pb-4 pt-2 text-sm text-neutral-700 animate-fade-in">
                          <div className="flex flex-wrap gap-4 mb-2">
                            <div><span className="font-semibold">Função:</span> {c.role || '-'}</div>
                            <div><span className="font-semibold">Telefone:</span> {c.phone || '-'}</div>
                            <div><span className="font-semibold">Admissão:</span> {c.admission || '-'}</div>
                            <div><span className="font-semibold">Status:</span> {c.status || '-'}</div>
                          </div>
                          <div className="mb-2"><span className="font-semibold">Notas:</span> {c.notes || '-'}</div>
                          <div className="mb-2 flex items-center gap-2">
                            <span className="font-semibold">Permissões:</span>
                            {c.permissions ? (
                              Object.entries(c.permissions).filter(([_, v]) => v).length > 0 ? (
                                Object.entries(c.permissions).filter(([_, v]) => v).map(([k]) => (
                                  <span key={k} className="bg-green-100 text-green-700 rounded px-2 py-0.5 text-xs mr-1">{k.charAt(0).toUpperCase() + k.slice(1)}</span>
                                ))
                              ) : <span className="text-muted-foreground">Nenhuma</span>
                            ) : <span className="text-muted-foreground">Nenhuma</span>}
                          </div>
                          {c.avatar_url && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="font-semibold">Avatar:</span>
                              <img src={c.avatar_url} alt="Avatar" className="h-12 w-12 rounded-full border" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <AppFooter />

      {/* Modal de Avaliação */}
      <Dialog open={showRatingModal.open} onOpenChange={(open) => setShowRatingModal({ open, cooperado: open ? showRatingModal.cooperado : null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Avaliar Cooperado</DialogTitle>
            <DialogDescription>Selecione os critérios que deseja avaliar. Todos são opcionais.</DialogDescription>
          </DialogHeader>
          {ratingCriteria.map((crit) => (
            <div key={crit.key} className="mb-4">
              <div className="font-medium mb-1">{crit.label}</div>
              {renderStars(crit.key)}
            </div>
          ))}
          {successMsg && <div className="text-center text-green-600 font-medium my-2">{successMsg}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowRatingModal({ open: false, cooperado: null })}>Cancelar</Button>
            <Button onClick={handleSubmitRating} disabled={saving}>{saving ? 'Salvando...' : 'Enviar Avaliação'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={showEditModal.open} onOpenChange={(open) => setShowEditModal({ open, cooperado: open ? showEditModal.cooperado : null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cooperado</DialogTitle>
            <DialogDescription>Altere os dados necessários e salve.</DialogDescription>
          </DialogHeader>
          {editForm && (
            <form className="space-y-3" onSubmit={e => { e.preventDefault(); handleEditSave(); }}>
              <div>
                <Label>Nome</Label>
                <Input name="name" value={editForm.name} onChange={handleEditChange} required />
              </div>
              <div>
                <Label>Função/Cargo</Label>
                <Input name="role" value={editForm.role} onChange={handleEditChange} />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input name="phone" value={editForm.phone || ''} onChange={handleEditChange} />
              </div>
              <div>
                <Label>Data de Admissão</Label>
                <Input name="admission" type="date" value={editForm.admission || ''} onChange={handleEditChange} />
              </div>
              <div>
                <Label>Status</Label>
                <select name="status" value={editForm.status} onChange={handleEditChange} className="w-full border rounded px-2 py-2">
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                  <option value="Excluído">Excluído</option>
                </select>
              </div>
              <div>
                <Label>Notas/Observações</Label>
                <Input name="notes" value={editForm.notes || ''} onChange={handleEditChange} />
              </div>
              <div>
                <Label>Avatar (URL)</Label>
                <Input name="avatar_url" value={editForm.avatar_url || ''} onChange={handleEditChange} />
              </div>
              <div>
                <Label>Permissões</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {Object.keys(defaultPermissions).map(key => (
                    <label key={key} className="flex items-center gap-1 text-sm">
                      <Switch checked={!!editForm.permissions[key]} onCheckedChange={() => handleEditPermission(key)} />
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
              {editMsg && <div className="text-center text-green-600 font-medium my-2">{editMsg}</div>}
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" type="button" onClick={() => setShowEditModal({ open: false, cooperado: null })}>Cancelar</Button>
                <Button type="submit" disabled={editSaving}>{editSaving ? 'Salvando...' : 'Salvar Alterações'}</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <AlertDialog open={showDeleteModal.open} onOpenChange={(open) => setShowDeleteModal({ open, cooperado: open ? showDeleteModal.cooperado : null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir este cooperado? Esta ação não poderá ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          {deleteMsg && <div className="text-center text-green-600 font-medium my-2">{deleteMsg}</div>}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteModal({ open: false, cooperado: null })}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={deleteSaving}>{deleteSaving ? 'Excluindo...' : 'Excluir'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Cooperados; 