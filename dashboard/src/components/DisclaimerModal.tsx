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
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div 
        className="modal-content glass glass-card animate-fade" 
        style={{ 
          maxWidth: '500px', 
          border: '1px solid hsla(var(--primary), 0.3)',
          boxShadow: '0 0 40px rgba(0, 242, 255, 0.1)'
        }}
      >
        <div className="modal-header" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ 
            background: 'hsla(var(--primary), 0.1)', 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 1.5rem auto'
          }}>
            <AlertTriangle className="text-gradient" size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }} className="text-gradient">AVISO: FASE BETA</h2>
          <p className="text-dim font-display" style={{ fontSize: '0.7rem', letterSpacing: '0.2em' }}>ONYX ENGINE SAFETY PROTOCOL</p>
        </div>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.02)', 
          padding: '1.5rem', 
          borderRadius: '12px', 
          fontSize: '0.9rem', 
          lineHeight: '1.6',
          color: 'rgba(255,255,255,0.8)',
          borderLeft: '4px solid hsla(var(--primary), 0.5)'
        }}>
          Este sistema é uma ferramenta **experimental** automatizada por Inteligência Artificial. 
          Embora utilizemos a API oficial do Canvas, podem ocorrer falhas de sincronização ou interpretação de dados.
          <br /><br />
          <strong style={{ color: 'white' }}>Importante:</strong> Nunca confie 100% nas notificações. Sempre verifique prazos e materiais críticos diretamente no seu **Ambiente Virtual oficial**.
        </div>

        <button 
          onClick={handleClose} 
          className="premium-btn" 
          style={{ width: '100%', marginTop: '2rem', justifyContent: 'center' }}
        >
          <ShieldCheck size={18} /> Entendido e Ciente
        </button>
      </div>
    </div>
  );
};

export default DisclaimerModal;
