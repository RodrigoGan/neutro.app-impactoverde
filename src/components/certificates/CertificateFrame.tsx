import React from 'react';

// Adiciona as fontes Google no head do documento
if (typeof document !== 'undefined') {
  const id = 'google-fonts-certificate';
  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&family=Sacramento&display=swap';
    document.head.appendChild(link);
  }
}

export default function CertificateFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #e8f5e9 60%, #a5d6a7 100%)',
      borderRadius: 32,
      padding: 0,
      boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
      position: 'relative',
      maxWidth: 700,
      margin: '0 auto',
      fontFamily: 'Noto Serif, serif',
      overflow: 'hidden',
      border: '6px solid #388E3C',
    }}>
      <div style={{
        border: '3px solid #A5D6A7',
        borderRadius: 24,
        margin: 24,
        padding: 32,
        background: 'rgba(255,255,255,0.96)',
        position: 'relative',
        minHeight: 540,
      }}>
        {/* Ornamentos nos cantos */}
        <svg style={{position: 'absolute', left: 0, top: 0, opacity: 0.18}} width="60" height="60"><ellipse cx="30" cy="30" rx="28" ry="12" fill="#388E3C" /></svg>
        <svg style={{position: 'absolute', right: 0, top: 0, opacity: 0.18}} width="60" height="60"><ellipse cx="30" cy="30" rx="28" ry="12" fill="#388E3C" /></svg>
        <svg style={{position: 'absolute', left: 0, bottom: 0, opacity: 0.18}} width="60" height="60"><ellipse cx="30" cy="30" rx="28" ry="12" fill="#388E3C" /></svg>
        <svg style={{position: 'absolute', right: 0, bottom: 0, opacity: 0.18}} width="60" height="60"><ellipse cx="30" cy="30" rx="28" ry="12" fill="#388E3C" /></svg>
        {/* Marca d'água do logo */}
        <img src="/logo-neutro.png" alt="Marca d'água Neutro" style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', opacity: 0.06, width: 340, zIndex: 0}} />
        <div style={{position: 'relative', zIndex: 1}}>
          {children}
        </div>
      </div>
    </div>
  );
} 