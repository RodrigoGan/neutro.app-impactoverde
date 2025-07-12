export type Notification = {
  id: string;
  title: string;
  description: string;
  type: 'urgente' | 'alerta' | 'info' | 'novo' | 'coleta_bairro';
  status: 'urgente' | 'pendente' | 'resolvida' | 'arquivada';
  read: boolean;
  date: string;
  userTypes: Array<'common_user' | 'individual_collector' | 'cooperative_owner' | 'collector_company_owner' | 'partner_owner'>;
  recipients?: string[];
  sender?: string;
  neighborhood?: {
    id: string;
    name: string;
  };
  collector?: {
    id: string;
    name: string;
    rating?: number;
  };
  collectionDate?: string;
  collectionPeriod?: 'manha' | 'tarde' | 'noite';
}; 