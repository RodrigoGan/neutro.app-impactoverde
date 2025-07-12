import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Info, 
  Upload,
  Star,
  Bell,
  ArrowLeft
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileTabs } from '@/components/ui/mobile-tabs';
import { NotificationsSection } from '@/components/profile/NotificationsSection';
import { NotificationPreference } from '@/types/user';

type SettingsSection = 'perfil' | 'endereco' | 'plano' | 'seguranca' | 'notificacoes';

const tabs = [
  { id: 'perfil', label: 'Perfil', icon: <Building2 className="h-4 w-4" /> },
  { id: 'endereco', label: 'Endereço', icon: <MapPin className="h-4 w-4" /> },
  { id: 'plano', label: 'Plano', icon: <Star className="h-4 w-4" /> },
  { id: 'notificacoes', label: 'Notificações', icon: <Bell className="h-4 w-4" /> },
  { id: 'seguranca', label: 'Segurança', icon: <Lock className="h-4 w-4" /> },
];

const getTabTitle = (tabId: string) => {
  switch (tabId) {
    case 'perfil':
      return 'Dados da Empresa Parceira';
    case 'endereco':
      return 'Endereço da Empresa Parceira';
    case 'plano':
      return 'Plano Atual';
    case 'notificacoes':
      return 'Preferências de Notificação';
    case 'seguranca':
      return 'Segurança da Conta';
    default:
      return '';
  }
};

const PartnerCompanySettings: React.FC = () => {
  // ... copiar e adaptar lógica de CompanySettings ...
  // Para simplificação, pode-se copiar o conteúdo de CompanySettings.tsx e ajustar os textos para 'Empresa Parceira'.
  // O restante da lógica permanece igual.
  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Configurações</h1>
        </div>
        <MobileTabs
          tabs={tabs}
          activeTab={activeSection}
          onTabChange={tab => setActiveSection(tab as SettingsSection)}
          className="mb-6"
        />
        {/* ... restante igual ao CompanySettings, ajustando textos para Empresa Parceira ... */}
      </div>
    </Layout>
  );
};

export default PartnerCompanySettings; 