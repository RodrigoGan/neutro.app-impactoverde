import React from 'react';
import CertificateFrame from './CertificateFrame';

export type SubscriptionCertificateProps = {
  name: string;
  plan: 'Eco+' | 'Impacto Verde' | 'Carbon Free';
  profileType: 'partner' | 'cooperative' | 'company';
  startDate: string;
  endDate?: string;
  badgeUrl?: string;
  customMessage?: string;
};

const planColors = {
  'Eco+': '#4CAF50',
  'Impacto Verde': '#388E3C',
  'Carbon Free': '#1976D2',
};

const planLabels = {
  'Eco+': 'Eco+',
  'Impacto Verde': 'Impacto Verde',
  'Carbon Free': 'Carbon Free',
};

export default function SubscriptionCertificate({
  name,
  plan,
  profileType,
  startDate,
  endDate,
  badgeUrl,
  customMessage,
}: SubscriptionCertificateProps) {
  return (
    <CertificateFrame>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', minHeight: 540 }}>
        {badgeUrl ? (
          <img src={badgeUrl} alt={plan} style={{ width: 100, height: 100, marginBottom: 8, marginTop: -40, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} />
        ) : (
          <img src="/Image/selo-certificado-neutro.svg" alt="Selo Neutro" style={{ width: 100, height: 100, marginBottom: 8, marginTop: -40, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} />
        )}
        <h2 style={{ fontFamily: 'Noto Serif, serif', fontSize: 28, margin: '8px 0 12px 0', color: planColors[plan], letterSpacing: 1, fontWeight: 700 }}>Certificado de Participação Ambiental</h2>
        <div style={{ fontSize: 18, margin: '8px 0', textAlign: 'center', color: '#333' }}>
          O Neutro certifica a participação de:
        </div>
        <div style={{ fontWeight: 700, fontSize: 22, margin: '8px 0', textAlign: 'center' }}>{name}</div>
        <div style={{ fontSize: 17, margin: '8px 0', textAlign: 'center' }}>
          o selo <b>{planLabels[plan]}</b> como reconhecimento pela adesão ao nosso programa de sustentabilidade.
        </div>
        <div style={{ fontSize: 15, margin: '8px 0', textAlign: 'center' }}>
          Perfil: <b>{profileType === 'partner' ? 'Empresa Parceira' : profileType === 'cooperative' ? 'Cooperativa' : 'Empresa Coletora'}</b>
        </div>
        <div style={{ fontSize: 15, margin: '8px 0', textAlign: 'center' }}>
          Vigência: {startDate} {endDate && `até ${endDate}`}
        </div>
        {customMessage && <div style={{ margin: '18px 0', fontStyle: 'italic', color: '#444' }}>{customMessage}</div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', marginTop: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 90 }}>
            <img src="/logo-neutro.png" alt="Logo Neutro" style={{ width: 70, opacity: 0.7, marginLeft: 0 }} />
          </div>
          <div style={{ textAlign: 'right', minWidth: 130 }}>
            <img src="/Image/assinatura-exemplo.png" alt="Assinatura" style={{ width: 110, marginBottom: -8 }} />
            <div style={{ fontSize: 13, color: '#888' }}>Equipe Neutro</div>
          </div>
        </div>
      </div>
    </CertificateFrame>
  );
} 