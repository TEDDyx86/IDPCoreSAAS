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
    <div className="modal-overlay" style={{ z-index: 30000 }}>
      <div 
        className="modal-content glass glass-card animate-reveal" 
        style={{ 
          maxWidth: '500px', 
          border: '1px solid hsla(var(--primary), 0.3)',
          boxShadow: '0 0 60px rgba(0, 242, 255, 0.15)',
          padding: '2.5rem',
          backdropFilter: 'blur(80px)', // Ultra-frost fallback inside card
          WebkitBackdropFilter: 'blur(80px)'
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
            <ShieldCheck className="text-gradient" size={38} />
          </div>
          <h2 style={{ 
            fontSize: '1.75rem', 
            margin: '0', 
            fontWeight: 700, 
            textAlign: 'center', 
            width: '100%',
            display: 'block'
          }} className="text-gradient">
            IDP CORE SECURITY
          </h2>
        </div>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.03)', 
          padding: '2rem', 
          borderRadius: '16px', 
          fontSize: '0.95rem', 
          lineHeight: '1.7',
          color: 'rgba(255,255,255,0.85)',
          borderLeft: '4px solid hsla(var(--primary), 0.6)',
          marginBottom: '2rem'
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
            background: 'linear-gradient(45deg, hsla(var(--primary), 0.8), hsla(var(--primary), 0.4))'
          }}
        >
          <ShieldCheck size={20} /> EU COMPREENDO OS TERMOS
        </button>
      </div>
    </div>
  );
};

export default DisclaimerModal;
