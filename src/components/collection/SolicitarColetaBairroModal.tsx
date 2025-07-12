import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock, User, Home, X as XIcon, Image as ImageIcon, Archive, Package, Recycle, GlassWater, Leaf, CircleDashed, Battery, Lightbulb, TrashIcon, Cpu, Droplets } from 'lucide-react';
import { Notification } from '@/components/dashboard/standard/StandardNotificationCard';
import { MaterialForm } from '@/components/forms/MaterialForm';

import { materialDisplayData } from '@/config/materialDisplayData';
import StandardMaterialList from './StandardMaterialList';
import { useNavigate } from 'react-router-dom';
import { AchievementAnimation } from '@/components/animations/AchievementAnimation';

interface SolicitarColetaBairroModalProps {
  open: boolean;
  onClose: () => void;
  notification: Notification;
  userId?: string;
}

export const SolicitarColetaBairroModal: React.FC<SolicitarColetaBairroModalProps> = ({ open, onClose, notification, userId }) => {
  const [materiais, setMateriais] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fotos, setFotos] = useState<File[]>([]);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [modalOpen, setModalOpen] = useState(open);
  const navigate = useNavigate();

  // TODO: Implementar busca de dados reais do usuário quando necessário
  // const { profile: userData, loading, error } = useUserProfile(userId);

  React.useEffect(() => {
    setModalOpen(open);
  }, [open]);

  // TODO: Implementar busca de endereços reais do usuário
  // Por enquanto, usar endereço da notificação como fallback
  const enderecoCompleto = notification.neighborhood?.name ? `Bairro: ${notification.neighborhood.name}` : 'Endereço não especificado';

  const handleAddMaterial = (material: any) => {
    setMateriais(prev => [...prev, material]);
  };

  const handleSolicitar = () => {
    setIsSubmitting(true);
    // Aqui você pode salvar os dados se necessário
    setModalOpen(false); // Fecha o modal imediatamente
    setTimeout(() => setShowSuccessAnimation(true), 300); // Aguarda o modal fechar para mostrar a animação
  };

  return (
    <>
      <Dialog open={modalOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Solicitar Coleta no Bairro</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-700" />
              <span className="font-medium">Bairro:</span>
              <span>{notification.neighborhood?.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-blue-700" />
              <span className="font-medium">Endereço:</span>
              <span>{enderecoCompleto}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-700" />
              <span className="font-medium">Data:</span>
              <span>{notification.collectionDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-700" />
              <span className="font-medium">Período:</span>
              <span>{notification.collectionPeriod === 'manha' ? 'Manhã' : notification.collectionPeriod === 'tarde' ? 'Tarde' : 'Noite'}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-neutro" />
              <span className="font-medium">Coletor:</span>
              <span>{notification.collector?.name}</span>
            </div>
            <div>
              <span className="font-medium flex items-center gap-2"><ImageIcon className="h-4 w-4 text-green-700" />Fotos (opcional, até 3):</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={e => {
                  const files = Array.from(e.target.files || []);
                  setFotos(prev => [...prev, ...files].slice(0, 3));
                }}
                disabled={fotos.length >= 3}
                className="mt-1"
              />
              <div className="flex gap-2 mt-2">
                {fotos.map((foto, idx) => (
                  <div key={idx} className="relative">
                    <img src={URL.createObjectURL(foto)} alt={`Foto ${idx+1}`} className="w-16 h-16 object-cover rounded" />
                    <button type="button" className="absolute top-0 right-0 bg-white rounded-full p-0.5" onClick={() => setFotos(fotos.filter((_, i) => i !== idx))}>
                      <XIcon className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <span className="font-medium">Materiais para coleta:</span>
              <MaterialForm onAddMaterial={handleAddMaterial} onClose={() => {}} />
              <StandardMaterialList materiais={materiais.map(mat => ({
                type: mat.tipo,
                quantity: mat.quantidade,
                unit: mat.unidade
              }))} />
            </div>
          </div>
          <DialogFooter className="mt-4 flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
            <Button onClick={handleSolicitar} disabled={materiais.length === 0 || isSubmitting}>
              {isSubmitting ? 'Solicitando...' : 'Solicitar Coleta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showSuccessAnimation && (
        <div className="fixed inset-0 z-[100]">
          <AchievementAnimation
            title="Coleta Solicitada!"
            description="Sua solicitação de coleta foi registrada com sucesso."
            icon={<Package className="w-16 h-16 text-green-600" />}
            soundType="scheduleConfirmed"
            onComplete={() => {
              setShowSuccessAnimation(false);
              setIsSubmitting(false);
              onClose();
              navigate('/collection-history', { replace: true });
            }}
          />
        </div>
      )}
    </>
  );
};

export default SolicitarColetaBairroModal; 