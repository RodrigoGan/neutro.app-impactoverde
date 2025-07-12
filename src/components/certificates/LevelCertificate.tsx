import React from 'react';
import CertificateFrame from './CertificateFrame';

export type LevelCertificateProps = {
  name: string;
  level: 'Bronze' | 'Prata' | 'Ouro';
  profileType: 'partner' | 'cooperative' | 'company';
  date: string;
  certificateType: 'básico' | 'personalizado' | 'premium';
  badgeUrl?: string;
  customMessage?: string;
};

const levelColors = {
  'Bronze': '#CD7F32',
  'Prata': '#C0C0C0',
  'Ouro': '#FFD700',
};

export default function LevelCertificate({
  name,
  level,
  profileType,
  date,
  certificateType,
  badgeUrl,
  customMessage,
}: LevelCertificateProps) {
  if (level === 'Prata') {
    return (
      <div style={{
        width: '100%',
        maxWidth: 900,
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        minHeight: 0,
      }}>
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: 900,
          aspectRatio: '1122/793',
          background: `url('/Certificate/Certificate Silver.png?v=${Date.now()}') center/cover no-repeat`,
          borderRadius: 24,
          boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'auto',
          maxHeight: '80vh',
        }}>
          <div style={{
            position: 'absolute',
            top: '15%',
            left: 0,
            width: '100%',
            textAlign: 'center',
            color: '#444',
            fontFamily: 'Noto Serif, serif',
            zIndex: 2,
            padding: '0 4vw',
          }}>
            <img src="/logo-neutro.png" alt="Logo Neutro" style={{ width: '6vw', minWidth: 48, margin: '0 auto 1vw auto', display: 'block' }} />
            <h2 style={{ fontSize: '2.5vw', fontWeight: 700, color: '#888', marginBottom: '1vw' }}>Certificado de Mérito Ambiental</h2>
            <div style={{ fontSize: '1.5vw', margin: '1vw 0 0 0', color: '#333' }}>O Neutro reconhece e certifica:</div>
            <div style={{ fontWeight: 700, fontSize: '2.2vw', margin: '1vw 0 0 0', color: '#222', fontFamily: 'Sacramento, cursive' }}>{name}</div>
            <div style={{ fontSize: '1.5vw', margin: '1vw 0 0 0', color: '#333' }}>
              pela conquista do nível <b>Prata</b> no programa de sustentabilidade.
            </div>
            <div style={{ fontSize: '1.2vw', margin: '1vw 0 0 0', color: '#444' }}>
              Perfil: <b>{profileType === 'partner' ? 'Empresa Parceira' : profileType === 'cooperative' ? 'Cooperativa' : 'Empresa Coletora'}</b>
            </div>
            <div style={{ fontSize: '1.2vw', margin: '0.5vw 0 0 0', color: '#444' }}>
              Tipo de Certificado: <b>{certificateType.charAt(0).toUpperCase() + certificateType.slice(1)}</b>
            </div>
            <div style={{ fontSize: '1.1vw', margin: '0.5vw 0 0 0', color: '#444' }}>
              Conquistado em: {date}
            </div>
            {customMessage && <div style={{ margin: '1vw 0 0 0', fontStyle: 'italic', color: '#666', fontSize: '1.1vw' }}>{customMessage}</div>}
            <div style={{ marginTop: '3vw', textAlign: 'center' }}>
              <img src="/Image/assinatura-yuri-gandolpho.svg" alt="Assinatura Yuri Martins Gandolpho" style={{ width: '15vw', minWidth: 120, margin: '0 auto 0.5vw auto', display: 'block' }} />
              <div style={{ borderBottom: '2px solid #888', width: '18vw', margin: '0 auto' }} />
              <div style={{ fontSize: '1.1vw', color: '#888', marginTop: '0.5vw' }}>Assinatura Yuri Martins Gandolpho</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CertificateFrame>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', minHeight: 540 }}>
        {(level === 'Ouro' || certificateType === 'premium') ? (
          <img src="/Image/selo-certificado-premium.svg" alt="Selo Premium" style={{ width: 120, height: 120, marginBottom: 8, marginTop: -60, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} />
        ) : badgeUrl ? (
          <img src={badgeUrl} alt={level} style={{ width: 100, height: 100, marginBottom: 8, marginTop: -40, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} />
        ) : (
          <img src="/Image/selo-certificado-neutro.svg" alt="Selo Neutro" style={{ width: 100, height: 100, marginBottom: 8, marginTop: -40, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} />
        )}
        <h2 style={{ fontFamily: 'Noto Serif, serif', fontSize: 28, margin: '8px 0 12px 0', color: levelColors[level], letterSpacing: 1, fontWeight: 700 }}>Certificado de Mérito Ambiental</h2>
        <div style={{ fontSize: 18, margin: '8px 0', textAlign: 'center', color: '#333' }}>
          O Neutro reconhece e certifica:
        </div>
        <div style={{ fontWeight: 700, fontSize: 22, margin: '8px 0', textAlign: 'center' }}>{name}</div>
        <div style={{ fontSize: 17, margin: '8px 0', textAlign: 'center' }}>
          pela conquista do nível <b>{level}</b> no programa de sustentabilidade.
        </div>
        <div style={{ fontSize: 15, margin: '8px 0', textAlign: 'center' }}>
          Perfil: <b>{profileType === 'partner' ? 'Empresa Parceira' : profileType === 'cooperative' ? 'Cooperativa' : 'Empresa Coletora'}</b>
        </div>
        <div style={{ fontSize: 15, margin: '8px 0', textAlign: 'center' }}>
          Tipo de Certificado: <b>{certificateType.charAt(0).toUpperCase() + certificateType.slice(1)}</b>
        </div>
        <div style={{ fontSize: 14, margin: '8px 0', textAlign: 'center' }}>
          Conquistado em: {date}
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