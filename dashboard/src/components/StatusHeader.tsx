import React from 'react';
import { Activity, Clock, ShieldCheck, Database } from 'lucide-react';

interface StatusHeaderProps {
  ultimaAtualizacao: string;
  totalDisciplinas: number;
  totalMateriais: number;
}

const StatusHeader: React.FC<StatusHeaderProps> = ({ ultimaAtualizacao, totalDisciplinas, totalMateriais }) => {
  const timeStr = new Date(ultimaAtualizacao).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = new Date(ultimaAtualizacao).toLocaleDateString();

  return (
    <div className="glass animate-fade" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <ShieldCheck size={20} color="hsl(var(--accent-cyan))" />
          <span className="badge badge-cyan">IDP CORE v3.1 SE</span>
        </div>
        <h1 className="text-gradient">Monitor Acadêmico</h1>
        <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={14} /> Último scan: <span style={{ color: 'hsl(var(--text-primary))' }}>{dateStr} às {timeStr}</span>
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <div className="glass" style={{ padding: '1rem 1.5rem', textAlign: 'center', minWidth: '120px', background: 'hsla(var(--bg-secondary), 0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Activity size={16} color="hsl(var(--accent-cyan))" className="pulse-slow" />
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalDisciplinas}</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '1px' }}>Disciplinas</span>
        </div>

        <div className="glass" style={{ padding: '1rem 1.5rem', textAlign: 'center', minWidth: '120px', background: 'hsla(var(--bg-secondary), 0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Database size={16} color="hsl(var(--accent-purple))" />
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalMateriais}</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '1px' }}>Arquivos</span>
        </div>
      </div>
      
      <style>{`
        .pulse-slow { animation: status-pulse 3s infinite ease-in-out; }
        @keyframes status-pulse {
          0%, 100% { opacity: 0.5; filter: drop-shadow(0 0 0 hsl(var(--accent-cyan))); }
          50% { opacity: 1; filter: drop-shadow(0 0 5px hsl(var(--accent-cyan))); }
        }
      `}</style>
    </div>
  );
};

export default StatusHeader;
