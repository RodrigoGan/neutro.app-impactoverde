import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../components/ui/dialog';
// Os componentes abaixo serão criados em seguida
import SubscriptionCertificate from '../components/certificates/SubscriptionCertificate';
import LevelCertificate from '../components/certificates/LevelCertificate';

export default function CertificateExamples() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div style={{ padding: 32, maxWidth: 800, margin: '0 auto' }}>
      <h1>Exemplos de Certificados</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, margin: '32px 0' }}>
        <Button onClick={() => setOpen('subscription-eco')}>Certificado Plano Eco+ (Empresa Parceira)</Button>
        <Button onClick={() => setOpen('subscription-impacto')}>Certificado Plano Impacto Verde (Cooperativa)</Button>
        <Button onClick={() => setOpen('subscription-carbon')}>Certificado Plano Carbon Free (Empresa Coletora)</Button>
        <Button onClick={() => setOpen('level-bronze')}>Certificado Nível Bronze (Empresa Parceira)</Button>
        <Button onClick={() => setOpen('level-silver')}>Certificado Nível Prata (Cooperativa)</Button>
        <Button onClick={() => setOpen('level-gold')}>Certificado Nível Ouro (Empresa Coletora)</Button>
      </div>
      <Dialog open={!!open} onOpenChange={() => setOpen(null)}>
        <DialogContent style={{ minWidth: 400, maxWidth: 600 }}>
          <DialogTitle>Visualização do Certificado</DialogTitle>
          {open === 'subscription-eco' && (
            <SubscriptionCertificate
              name="Empresa Parceira Exemplo"
              plan="Eco+"
              profileType="partner"
              startDate="2024-06-01"
              endDate="2025-06-01"
              badgeUrl="/badges/eco-plus.svg"
              customMessage="Parabéns por apoiar a reciclagem responsável!"
            />
          )}
          {open === 'subscription-impacto' && (
            <SubscriptionCertificate
              name="Cooperativa Exemplo"
              plan="Impacto Verde"
              profileType="cooperative"
              startDate="2024-06-01"
              endDate="2025-06-01"
              badgeUrl="/badges/impacto-verde.svg"
              customMessage="Juntos pelo impacto positivo!"
            />
          )}
          {open === 'subscription-carbon' && (
            <SubscriptionCertificate
              name="Empresa Coletora Exemplo"
              plan="Carbon Free"
              profileType="company"
              startDate="2024-06-01"
              endDate="2025-06-01"
              badgeUrl="/badges/carbon-free.svg"
              customMessage="Obrigado por neutralizar sua pegada!"
            />
          )}
          {open === 'level-bronze' && (
            <LevelCertificate
              name="Empresa Parceira Exemplo"
              level="Bronze"
              profileType="partner"
              date="2024-07-10"
              certificateType="básico"
              badgeUrl="/badges/bronze.svg"
              customMessage="Reconhecimento pelo início da jornada sustentável!"
            />
          )}
          {open === 'level-silver' && (
            <LevelCertificate
              name="Cooperativa Exemplo"
              level="Prata"
              profileType="cooperative"
              date="2024-07-10"
              certificateType="personalizado"
              badgeUrl="/badges/prata.svg"
              customMessage="Parabéns pelo avanço sustentável!"
            />
          )}
          {open === 'level-gold' && (
            <LevelCertificate
              name="Empresa Coletora Exemplo"
              level="Ouro"
              profileType="company"
              date="2024-07-10"
              certificateType="premium"
              badgeUrl="/badges/ouro.svg"
              customMessage="Reconhecimento máximo pelo impacto sustentável!"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 