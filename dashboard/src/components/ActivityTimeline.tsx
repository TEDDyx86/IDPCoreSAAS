import React from 'react';
import { Clock, BrainCircuit, ArrowUpRight } from 'lucide-react';

interface TimelineItem {
  id: string;
  disciplina: string;
  titulo: string;
  resumo: string;
  data_detectado: string;
  url_origem?: string;
}

interface ActivityTimelineProps {
  items: TimelineItem[];
  onOpenResumo: (item: TimelineItem) => void;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ items, onOpenResumo }) => {
  if (items.length === 0) return null;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {items.map((item, index) => (
        <div
          key={item.id}
          className="timeline-item animate-reveal"
          style={{ animationDelay: `${0.08 * index}s` }}
        >
          <div className="timeline-dot" />

          <div className="timeline-date">
            <Clock size={11} style={{ opacity: 0.5 }} />
            {formatDate(item.data_detectado)} · {formatTime(item.data_detectado)}
          </div>

          <article
            className="feed-card"
            onClick={() => onOpenResumo(item)}
          >
            <div className="feed-meta">
              <span className="badge badge-purple">{item.disciplina}</span>
              <span className="feed-type-label">Atualização de Aula</span>
            </div>

            <h3 className="feed-title">{item.titulo}</h3>

            <p className="feed-excerpt">
              {item.resumo || 'A inteligência artificial está processando os dados desta aula para gerar seu resumo…'}
            </p>

            <div className="feed-actions">
              <button className="feed-action-btn">
                <BrainCircuit size={13} />
                Analisar Insights
              </button>
              <span className="feed-action-secondary">
                Abrir Aula <ArrowUpRight size={12} />
              </span>
            </div>
          </article>
        </div>
      ))}
    </div>
  );
};

export default ActivityTimeline;
