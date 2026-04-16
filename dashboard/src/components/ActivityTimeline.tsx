import React from 'react';
import { FileText, GitBranch, ExternalLink, Download } from 'lucide-react';

interface ActivityItem {
  id: string;
  data: string;
  disciplina: string;
  titulo: string;
  tipo: string;
  status: string;
  resumo: string;
  links: {
    original: string;
    resumo_docx?: string;
  };
}

interface ActivityTimelineProps {
  items: ActivityItem[];
  onOpenResumo: (item: ActivityItem) => void;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ items, onOpenResumo }) => {
  return (
    <div className="animate-fade">
      <h2 style={{ marginBottom: '2rem' }}>Atividade Recente</h2>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((item, index) => {
          const isCode = item.tipo === 'CODE';
          const accentColor = isCode ? 'hsl(var(--accent-cyan))' : 'hsl(var(--accent-purple))';
          const Icon = isCode ? GitBranch : FileText;

          return (
            <div key={item.id} className="timeline-item" style={{ 
              animationDelay: `${index * 0.1}s`,
              borderLeftColor: index === items.length - 1 ? 'transparent' : 'hsla(var(--border-glass))'
            }}>
              {/* Dot replacement with icon */}
              <div style={{
                position: 'absolute',
                left: '-16px',
                top: '0',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'hsl(var(--bg-secondary))',
                border: `1px solid ${accentColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 15px ${accentColor}40`,
                zIndex: 2
              }}>
                <Icon size={14} color={accentColor} />
              </div>

              <div className="glass glass-hover" style={{ padding: '1.5rem', marginLeft: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className={`badge ${isCode ? 'badge-cyan' : 'badge-purple'}`}>
                    {item.tipo}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>{item.data}</span>
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{item.titulo}</h3>
                <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', marginBottom: '1.25rem' }}>{item.disciplina}</p>

                <div style={{ 
                  background: 'hsla(var(--bg-main), 0.5)', 
                  padding: '1rem', 
                  borderRadius: '12px', 
                  fontSize: '0.9rem', 
                  border: '1px solid hsla(var(--border-glass))',
                  marginBottom: '1.25rem',
                  lineHeight: '1.5',
                  color: 'hsl(var(--text-secondary))'
                }}>
                  {item.resumo}
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {item.status === 'PROCESSADO' && (
                    <button 
                      onClick={() => onOpenResumo(item)}
                      className="badge badge-green" 
                      style={{ cursor: 'pointer', border: 'none', padding: '8px 16px' }}
                    >
                      <FileText size={14} /> Ler Resumo IA
                    </button>
                  )}
                  
                  {item.links.resumo_docx && (
                    <a href={item.links.resumo_docx} className="badge" style={{ textDecoration: 'none', background: 'white', color: 'black', padding: '8px 16px' }}>
                      <Download size={14} /> Aula Magistral
                    </a>
                  )}

                  <a href={item.links.original} target="_blank" rel="noreferrer" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    fontSize: '0.8rem', 
                    color: 'hsl(var(--text-muted))',
                    textDecoration: 'none'
                  }}>
                    {isCode ? 'Ver Commit' : 'Ver no Canvas'} <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityTimeline;
