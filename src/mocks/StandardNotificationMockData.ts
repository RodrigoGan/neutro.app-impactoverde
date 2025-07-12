import { Notification } from '@/components/dashboard/standard/StandardNotificationCard';

export const standardNotificationsMock: Notification[] = [
  {
    id: '1',
    title: 'Coleta Agendada',
    description: 'Sua coleta está marcada para amanhã às 14:30',
    type: 'info',
    status: 'pendente',
    read: false,
    date: '2024-06-10 14:30',
    userTypes: ['common_user', 'individual_collector'],
    recipients: ['2'],
    sender: '1'
  },
  {
    id: '2',
    title: 'Coletor Disponível no Seu Bairro',
    description: 'João Silva está disponível para coletas no seu bairro amanhã',
    type: 'coleta_bairro',
    status: 'pendente',
    read: false,
    date: '11/06/2024 09:00',
    userTypes: ['common_user'],
    neighborhood: {
      id: '1',
      name: 'Jardim Primavera'
    },
    collector: {
      id: '1',
      name: 'João Silva',
      rating: 4.8
    },
    collectionDate: '11/06/2024',
    collectionPeriod: 'tarde'
  },
  {
    id: '3',
    title: 'Meta Mensal',
    description: '80% da meta atingida - Faltam 5 dias',
    type: 'alerta',
    status: 'pendente',
    read: false,
    date: '2024-06-08 16:00',
    userTypes: ['common_user', 'individual_collector', 'cooperative_owner', 'collector_company_owner', 'partner_owner'],
    recipients: ['2', '1'],
    sender: '3'
  },
  {
    id: '4',
    title: 'Manutenção Necessária',
    description: 'Prensa 2 requer manutenção imediata',
    type: 'urgente',
    status: 'urgente',
    read: false,
    date: '2024-06-08 08:00',
    userTypes: ['collector_company_owner'],
    recipients: ['3'],
    sender: '4'
  },
  {
    id: '5',
    title: 'Novo Parceiro',
    description: 'A Loja Verde agora faz parte da rede!',
    type: 'info',
    status: 'resolvida',
    read: true,
    date: '2024-06-07 10:00',
    userTypes: ['cooperative_owner', 'collector_company_owner', 'partner_owner'],
    recipients: ['3', '4'],
    sender: '3'
  }
]; 