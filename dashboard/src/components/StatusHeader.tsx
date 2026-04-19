import React from 'react';
import { ShieldCheck, Database, Calendar, Activity } from 'lucide-react';

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
    <div className="status-command-center animate-fade">
      <div className="glass glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <p className="text-dim font-display" style={{ fontSize: '0.7rem', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>
          STATUS DO SISTEMA
        </p>
        <h1 className="text-gradient" style={{ fontSize: '3rem', margin: 0 }}>ATIVO</h1>
      </div>

      <div className="glass glass-card glass-hover" style={{ textAlign: 'center' }}>
        <Activity size={24} className="text-dim" style={{ marginBottom: '1rem' }} />
        <p className="text-dim font-display" style={{ fontSize: '0.6rem', letterSpacing: '0.1em' }}>DISCIPLINAS_SYNC</p>
        <p className="font-display" style={{ fontSize: '2.5rem', fontWeight: 800 }}>{totalDisciplinas}</p>
      </div>

      <div className="glass glass-card glass-hover" style={{ textAlign: 'center' }}>
        <Database size={24} className="text-dim" style={{ marginBottom: '1rem' }} />
        <p className="text-dim font-display" style={{ fontSize: '0.6rem', letterSpacing: '0.1em' }}>REGISTROS_DETEC</p>
        <p className="font-display" style={{ fontSize: '2.5rem', fontWeight: 800 }}>{totalMateriais}</p>
      </div>

      <div className="glass glass-card glass-hover" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Calendar size={24} className="text-dim" style={{ marginBottom: '0.5rem' }} />
        <p className="text-dim font-display" style={{ fontSize: '0.6rem', letterSpacing: '0.1em' }}>ÚLTIMO_CHECK</p>
        <p style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '0.5rem', textAlign: 'center' }}>
          {isNaN(new Date(ultimaAtualizacao).getTime()) ? (
            <span className="text-dim">Aguardando Sinc.</span>
          ) : (
            <>
              {new Date(ultimaAtualizacao).toLocaleDateString()} <br/>
              <span className="text-gradient" style={{ fontSize: '0.7rem' }}>
                {new Date(ultimaAtualizacao).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default StatusHeader;
