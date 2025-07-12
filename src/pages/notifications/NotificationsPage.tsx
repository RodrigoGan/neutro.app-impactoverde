import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Send, Plus, ChevronLeft, MapPin, Calendar, Clock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { standardNotificationsMock } from '@/mocks/StandardNotificationMockData';
import { Notification } from '@/components/dashboard/standard/StandardNotificationCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SolicitarColetaBairroModal } from '@/components/collection/SolicitarColetaBairroModal';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import { BatchActionsBar } from '@/components/notifications/BatchActionsBar';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

const mockUsers = [
  { id: '1', name: 'João Silva', profile: 'coletor' },
  { id: '2', name: 'Maria Oliveira', profile: 'comum' },
  { id: '3', name: 'Empresa Coletora', profile: 'empresa' },
  { id: '4', name: 'Ana Costa', profile: 'funcionário' },
];

const STATUS_OPTIONS = ['todas', 'urgente', 'pendente', 'resolvida'];
const TYPE_OPTIONS = [
  { value: 'todas', label: 'Todas' },
  { value: 'info', label: 'Info' },
  { value: 'alerta', label: 'Alerta' },
  { value: 'urgente', label: 'Urgente' },
  { value: 'novo', label: 'Novo' },
  { value: 'coleta_bairro', label: 'Coleta no Bairro' }
];
const PAGE_SIZE = 5;

// Badge de tipo (igual ao dashboard)
const badgeColors = {
  urgente: 'bg-red-100 text-red-700',
  alerta: 'bg-yellow-100 text-yellow-700',
  info: 'bg-blue-100 text-blue-700',
  novo: 'bg-green-100 text-green-700',
  coleta_bairro: 'bg-purple-100 text-purple-700',
};

// Badge de status (igual ao dashboard)
const statusColors = {
  urgente: 'bg-red-50 text-red-700',
  pendente: 'bg-yellow-50 text-yellow-700',
  resolvida: 'bg-green-50 text-green-700',
  arquivada: 'bg-gray-50 text-gray-700',
};

const NotificationModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSend: (data: any) => void;
  loggedUserId: string;
}> = ({ open, onClose, onSend, loggedUserId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'info' | 'alerta' | 'urgente'>('info');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  if (!open) return null;

  const filteredSuggestions = mockUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) && !recipients.includes(u.id)
  );

  const addRecipient = (id: string) => {
    setRecipients([...recipients, id]);
    setSearch('');
  };

  const removeRecipient = (id: string) => {
    setRecipients(recipients.filter(r => r !== id));
  };

  const handleSend = async () => {
    // Cria notificação real no Supabase
    const { error } = await supabase.from('notifications').insert([
      {
        title,
        description,
        type,
        status: 'pendente',
        read: false,
        recipients,
        sender: loggedUserId,
        user_types: [],
      }
    ]);
    if (!error) {
      onSend({ title, description, type, recipients });
      onClose();
    } else {
      alert('Erro ao criar notificação: ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">Nova Notificação</h2>
        <div className="space-y-3">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Título"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <textarea
            className="w-full border rounded px-3 py-2"
            placeholder="Descrição"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <select
            className="w-full border rounded px-3 py-2"
            value={type}
            onChange={e => setType(e.target.value as any)}
          >
            <option value="info">Info</option>
            <option value="alerta">Alerta</option>
            <option value="urgente">Urgente</option>
          </select>
          <div>
            <label className="block mb-1 text-sm">Destinatários</label>
            <input
              className="w-full border rounded px-3 py-2 mb-2"
              placeholder="Buscar nome..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && filteredSuggestions.length > 0 && (
              <div className="border rounded bg-white shadow max-h-32 overflow-y-auto mb-2">
                {filteredSuggestions.map(u => (
                  <div
                    key={u.id}
                    className="px-3 py-2 cursor-pointer hover:bg-muted"
                    onClick={() => addRecipient(u.id)}
                  >
                    {u.name} <span className="text-xs text-muted-foreground">({u.profile})</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {recipients.map(id => {
                const user = mockUsers.find(u => u.id === id);
                return user ? (
                  <span key={id} className="flex items-center bg-neutro/10 rounded px-2 py-1 text-sm">
                    {user.name}
                    <button
                      className="ml-1 text-neutro hover:text-red-500"
                      onClick={() => removeRecipient(id)}
                      type="button"
                    >
                      ×
                    </button>
                  </span>
                ) : null;
              })}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSend} disabled={!title || !description || recipients.length === 0}>
            <Send className="mr-2 h-4 w-4" /> Enviar
          </Button>
        </div>
      </div>
    </div>
  );
};

const NotificationsPage: React.FC = () => {
  const [tab, setTab] = useState<'recebidas' | 'enviadas'>('recebidas');
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('todas');
  const [typeFilter, setTypeFilter] = useState('todas');
  const [page, setPage] = useState(1);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  
  const loggedUserId = String(location.state?.userId || '2');
  const userType = String(location.state?.userType || 'common_user') as Notification['userTypes'][number];

  const [showColetaBairroModal, setShowColetaBairroModal] = useState(false);
  const [selectedColetaBairroNotification, setSelectedColetaBairroNotification] = useState<Notification | null>(null);

  const {
    selectedIds,
    isLoading,
    toggleSelect,
    selectAll,
    clearSelection,
    markAsRead,
    markAsUnread,
    markAsResolved,
    markAsUrgent,
    archive,
    deleteNotification,
    markSelectedAsRead,
    markSelectedAsUnread,
    archiveSelected,
    deleteSelected
  } = useNotificationActions({
    notifications,
    onUpdate: setNotifications
  });

  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function fetchNotifications() {
      setLoading(true);
      try {
        // Busca notificações reais do banco
        let query = supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false });
        // Filtro por tipo de usuário (userType) e/ou usuário logado (recipients)
        if (userType) {
          query = query.contains('user_types', [userType]);
        }
        if (tab === 'enviadas') {
          query = query.eq('sender', loggedUserId);
        } else {
          query = query.or(`recipients.cs.{${loggedUserId}},user_types.cs.{${userType}}`);
        }
        const { data, error } = await query;
        if (!ignore && !error && data && data.length > 0) {
          // Mapeia os campos do banco para o type Notification do front
          let filtered = data.map((n: any) => ({
            id: n.id,
            title: n.title,
            description: n.description,
            type: n.type,
            status: n.status,
            read: n.read,
            date: n.date || n.created_at,
            userTypes: n.user_types || [],
            recipients: n.recipients || [],
            sender: n.sender,
            neighborhood: n.neighborhood ? {
              id: n.neighborhood.id,
              name: n.neighborhood.name
            } : undefined,
            collector: n.collector ? {
              id: n.collector.id,
              name: n.collector.name,
              rating: n.collector.rating
            } : undefined,
            collectionDate: n.collection_date,
            collectionPeriod: n.collection_period
          }));
          if (statusFilter !== 'todas') {
            filtered = filtered.filter(n => n.status === statusFilter);
          }
          if (typeFilter !== 'todas') {
            filtered = filtered.filter(n => n.type === typeFilter);
          }
          setNotifications(filtered);
        } else {
          setNotifications([]);
        }
      } catch (err) {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
    return () => { ignore = true; };
  }, [tab, statusFilter, typeFilter, loggedUserId, userType, refresh]);

  const totalPages = Math.ceil(notifications.length / PAGE_SIZE);
  const paginated = notifications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleNotificationAction = (notification: Notification) => {
    if (notification.type === 'coleta_bairro') {
      setSelectedColetaBairroNotification(notification);
      setShowColetaBairroModal(true);
      return;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="mb-4">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2" 
          onClick={() => navigate('/dashboard/standard', { state: { userId: loggedUserId, userType } })}
        >
          <ChevronLeft className="h-5 w-5" /> Voltar
        </Button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="h-6 w-6 text-neutro" /> Notificações
        </h1>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nova Notificação
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        <Button 
          variant={tab === 'recebidas' ? 'default' : 'outline'} 
          onClick={() => { setTab('recebidas'); setPage(1); }}
        >
          Recebidas
        </Button>
        <Button 
          variant={tab === 'enviadas' ? 'default' : 'outline'} 
          onClick={() => { setTab('enviadas'); setPage(1); }}
        >
          Enviadas
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <div className="flex flex-col flex-1">
          <label htmlFor="statusFilter" className="mb-1 text-sm text-muted-foreground font-medium">Status da Notificação</label>
          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full h-12 rounded-md">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(opt => (
                <SelectItem key={opt} value={opt}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col flex-1">
          <label htmlFor="typeFilter" className="mb-1 text-sm text-muted-foreground font-medium">Tipo de Notificação</label>
          <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full h-12 rounded-md">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            <AnimatePresence mode="popLayout">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <span className="text-muted-foreground">Carregando notificações...</span>
                </div>
              ) : paginated.length === 0 ? (
                <div className="flex justify-center items-center h-40">
                  <span className="text-muted-foreground">Nenhuma notificação encontrada.</span>
                </div>
              ) : (
                paginated.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    isSelected={selectedIds.includes(notification.id)}
                    onSelect={toggleSelect}
                    onMarkAsRead={markAsRead}
                    onMarkAsUnread={markAsUnread}
                    onArchive={archive}
                    onDelete={deleteNotification}
                    onPin={() => {}} // TODO: Implementar fixar
                    onResolve={markAsResolved}
                    onUrgent={markAsUrgent}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button 
            size="sm" 
            variant="outline" 
            disabled={page === 1} 
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </Button>
          <span className="px-2 py-1">
            Página {page} de {totalPages}
          </span>
          <Button 
            size="sm" 
            variant="outline" 
            disabled={page === totalPages} 
            onClick={() => setPage(page + 1)}
          >
            Próxima
          </Button>
        </div>
      )}

      <BatchActionsBar
        selectedCount={selectedIds.length}
        onMarkAsRead={markSelectedAsRead}
        onMarkAsUnread={markSelectedAsUnread}
        onArchive={archiveSelected}
        onDelete={deleteSelected}
        onClearSelection={clearSelection}
      />

      <NotificationModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSend={() => setRefresh(r => r + 1)}
        loggedUserId={loggedUserId}
      />

      {showColetaBairroModal && selectedColetaBairroNotification && (
        <SolicitarColetaBairroModal
          open={showColetaBairroModal}
          onClose={() => setShowColetaBairroModal(false)}
          notification={selectedColetaBairroNotification}
        />
      )}
    </div>
  );
};

export default NotificationsPage; 