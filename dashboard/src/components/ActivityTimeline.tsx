import React from 'react';
import { Clock, ExternalLink, BrainCircuit } from 'lucide-react';

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

  return (
    <div className="activity-feed" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {items.map((item, index) => (
        <div 
          key={item.id} 
          className="timeline-item animate-fade" 
          style={{ animationDelay: `${0.1 * index}s` }}
        >
          <span className="timeline-date">
             <Clock size={12} style={{ marginRight: '4px' }} />
             {new Date(item.data_detectado).toLocaleDateString()} — {new Date(item.data_detectado).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          
          <div 
            className="glass glass-card glass-hover" 
            style={{ padding: '1.5rem', borderLeftWidth: '0', cursor: 'pointer' }}
            onClick={() => onOpenResumo(item)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span className="badge badge-purple" style={{ marginBottom: '0.5rem' }}>{item.disciplina}</span>
                <h3 className="font-display" style={{ fontSize: '1.25rem', textTransform: 'none', margin: '0.5rem 0 0', lineHeight: '1.2' }}>
                  {item.titulo}
                </h3>
              </div>
              <Activity className="text-dim" size={16} />
            </div>

            <p className="text-dim" style={{ fontSize: '0.9rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', opacity: 0.6 }}>
              {item.resumo || "Onyx está processando os dados desta aula..."}
            </p>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                className="premium-btn" 
                style={{ padding: '0.6rem 1.2rem', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)' }}
              >
                <BrainCircuit size={14} /> ANALISAR INSIGHTS
              </button>
              
              <span className="text-dim font-display" style={{ fontSize: '0.6rem', letterSpacing: '0.1em' }}>ABRIR AULA</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityTimeline;
