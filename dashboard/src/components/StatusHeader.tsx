import React from 'react';
import { Database, Calendar, Activity, CheckCircle2 } from 'lucide-react';

interface StatusHeaderProps {
  ultimaAtualizacao: string;
  totalDisciplinas: number;
  totalMateriais: number;
}

const StatusHeader: React.FC<StatusHeaderProps> = ({ 
  ultimaAtualizacao, 
  totalDisciplinas, 
  totalMateriais 
}) => {
  return (
    <div className="status-grid animate-reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
      <div className="glass glass-card" style={{ display: 'flex', flexDirection: 'column', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
          <div className="status-dot status-online" />
          <span className="font-display" style={{ fontSize: '0.7rem', fontWeight: 600, color: 'white', opacity: 0.4, letterSpacing: '0.1em' }}>SISTEMA</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <h2 className="font-display" style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, color: 'white' }}>Online</h2>
          <CheckCircle2 size={18} style={{ color: '#27c93f' }} />
        </div>
      </div>

      <div className="glass glass-card glass-hover" style={{ display: 'flex', flexDirection: 'column', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
          <Activity size={14} style={{ color: 'white', opacity: 0.4 }} />
          <span className="font-display" style={{ fontSize: '0.7rem', fontWeight: 600, color: 'white', opacity: 0.4, letterSpacing: '0.1em' }}>MÓDULOS</span>
        </div>
        <h2 className="font-display" style={{ fontSize: '2.5rem', fontWeight: 600, margin: 0, color: 'white' }}>{totalDisciplinas}</h2>
      </div>

      <div className="glass glass-card glass-hover" style={{ display: 'flex', flexDirection: 'column', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
          <Database size={14} style={{ color: 'white', opacity: 0.4 }} />
          <span className="font-display" style={{ fontSize: '0.7rem', fontWeight: 600, color: 'white', opacity: 0.4, letterSpacing: '0.1em' }}>REGISTROS</span>
        </div>
        <h2 className="font-display" style={{ fontSize: '2.5rem', fontWeight: 600, margin: 0, color: 'white' }}>{totalMateriais}</h2>
      </div>

      <div className="glass glass-card glass-hover" style={{ display: 'flex', flexDirection: 'column', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
          <Calendar size={14} style={{ color: 'white', opacity: 0.4 }} />
          <span className="font-display" style={{ fontSize: '0.7rem', fontWeight: 600, color: 'white', opacity: 0.4, letterSpacing: '0.1em' }}>ULTIMA VERIFICAÇÃO</span>
        </div>
        <div>
          {isNaN(new Date(ultimaAtualizacao).getTime()) ? (
            <span className="text-dim" style={{ fontSize: '1rem', fontWeight: 600 }}>Aguardando...</span>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0.4rem' }}>
              <span className="font-display" style={{ fontSize: '1.4rem', fontWeight: 600, color: 'white' }}>
                {new Date(ultimaAtualizacao).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="font-display" style={{ fontSize: '0.8rem', fontWeight: 500, color: 'white', opacity: 0.3 }}>
                {new Date(ultimaAtualizacao).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusHeader;
