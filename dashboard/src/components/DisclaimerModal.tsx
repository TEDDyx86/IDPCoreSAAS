import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';

const DisclaimerModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem('onyx_disclaimer_seen');
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    sessionStorage.setItem('onyx_disclaimer_seen', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 30000 }}>
      <div
        className="modal-content glass glass-card animate-reveal"
        style={{
          maxWidth: '500px',
          border: '1px solid hsla(var(--primary), 0.25)',
          boxShadow: '0 0 60px hsla(var(--accent-cyan), 0.1)',
          padding: '2.5rem',
        }}
      >
        <div className="modal-header" style={{ 
          marginBottom: '2rem', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{ 
            background: 'hsla(var(--primary), 0.1)', 
            width: '70px', 
            height: '70px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginBottom: '1.5rem',
            border: '1px solid hsla(var(--primary), 0.2)'
          }}>
            <ShieldCheck size={38} style={{ color: 'hsl(var(--accent-cyan))' }} />
          </div>
          <h2 style={{ 
            fontSize: '1.75rem', 
            margin: '0', 
            fontWeight: 700, 
            textAlign: 'center', 
            width: '100%',
            display: 'block'
          }}>
            IDP CORE SECURITY
          </h2>
        </div>

        <div style={{
          background: 'hsla(var(--primary), 0.04)',
          border: '1px solid hsla(var(--primary), 0.12)',
          padding: '2rem',
          borderRadius: '16px',
          fontSize: '0.95rem',
          lineHeight: '1.7',
          color: 'hsl(var(--ch-t1))',
          marginBottom: '2rem',
        }}>
          Este sistema é uma ferramenta **experimental (BETA)** monitorada por Inteligência Artificial. 
          <br /><br />
          Para garantir a integridade dos seus dados acadêmicos, lembre-se:
          <ul style={{ paddingLeft: '1.2rem', marginTop: '0.8rem', opacity: 0.9 }}>
            <li>Confirme sempre os prazos no Canvas oficial.</li>
            <li>Notificações automáticas podem variar.</li>
            <li>O IDP Core é um assistente de produtividade.</li>
          </ul>
        </div>

        <button 
          onClick={handleClose} 
          className="premium-btn" 
          style={{ 
            width: '100%', 
            justifyContent: 'center',
            padding: '1.25rem',
            fontSize: '1rem',
            color: '#fff'
          }}
        >
          <ShieldCheck size={20} /> EU COMPREENDO OS TERMOS
        </button>
      </div>
    </div>
  );
};

export default DisclaimerModal;
