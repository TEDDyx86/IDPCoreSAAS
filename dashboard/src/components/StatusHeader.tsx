import React from 'react';
import { Activity, Calendar } from 'lucide-react';

interface StatusHeaderProps {
  ultimaAtualizacao: string;
  totalDisciplinas: number;
  totalMateriais: number;
}

const StatusHeader: React.FC<StatusHeaderProps> = ({
  ultimaAtualizacao,
  totalDisciplinas,
  totalMateriais,
}) => {
  const syncDate = new Date(ultimaAtualizacao);
  const syncValid = !isNaN(syncDate.getTime());
  const syncTime = syncValid
    ? syncDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : 'Aguardando';

  return (
    <div className="status-strip animate-reveal">
      <div className="status-item">
        <span className="status-dot-live" />
        <span className="status-label">Sistema</span>
        <span className="status-value">Online</span>
      </div>

      <div className="status-strip-divider" />

      <div className="status-item">
        <Activity size={11} style={{ color: 'hsl(var(--text-ghost))' }} />
        <span className="status-label">Módulos</span>
        <span className="status-value">{totalDisciplinas}</span>
      </div>

      <div className="status-strip-divider" />

      <div className="status-item">
        <Calendar size={11} style={{ color: 'hsl(var(--text-ghost))' }} />
        <span className="status-label">Última sync</span>
        <span className="status-value">{syncTime}</span>
      </div>

      {totalMateriais > 0 && (
        <>
          <div className="status-strip-divider" />
          <div className="status-item">
            <span className="status-label">Registros</span>
            <span className="status-value">{totalMateriais}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default StatusHeader;
