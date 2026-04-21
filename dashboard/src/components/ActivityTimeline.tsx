import React from 'react';
import { Clock, BrainCircuit, Activity, ArrowUpRight } from 'lucide-react';

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
    <div className="activity-feed" style={{ display: 'flex', flexDirection: 'column' }}>
      {items.map((item, index) => (
        <div 
          key={item.id} 
          className="timeline-item animate-reveal" 
          style={{ animationDelay: `${0.1 * index}s` }}
        >
          <div className="timeline-dot" />
          
          <div className="timeline-date">
             <Clock size={12} opacity={0.5} />
             {new Date(item.data_detectado).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} • {new Date(item.data_detectado).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          
          <div 
            className="glass glass-card glass-hover" 
            style={{ padding: '2rem', cursor: 'pointer' }}
            onClick={() => onOpenResumo(item)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <span className="badge badge-purple">{item.disciplina}</span>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                  <span className="text-dim" style={{ fontSize: '0.7rem', fontWeight: 500, opacity: 0.6 }}>Atualização de Aula</span>
                </div>
                <h3 className="font-display" style={{ 
                  fontSize: '1.4rem', 
                  fontWeight: 600, 
                  margin: 0, 
                  lineHeight: '1.3',
                  color: 'white'
                }}>
                  {item.titulo}
                </h3>
              </div>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '12px', 
                background: 'rgba(255,255,255,0.03)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Activity className="text-dim" size={18} />
              </div>
            </div>

            <p className="text-dim" style={{ 
              fontSize: '0.95rem', 
              lineHeight: '1.6',
              marginBottom: '2rem', 
              display: '-webkit-box', 
              WebkitLineClamp: 2, 
              WebkitBoxOrient: 'vertical', 
              overflow: 'hidden', 
              opacity: 0.7 
            }}>
              {item.resumo || "A inteligência artificial Onyx está processando os dados desta aula para gerar seu resumo premium..."}
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <button className="premium-btn">
                <BrainCircuit size={16} /> ANALISAR INSIGHTS
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: 0.4 }} className="nav-btn-text">
                <span className="font-display" style={{ fontSize: '0.75rem', fontWeight: 600 }}>ABRIR AULA</span>
                <ArrowUpRight size={14} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityTimeline;
