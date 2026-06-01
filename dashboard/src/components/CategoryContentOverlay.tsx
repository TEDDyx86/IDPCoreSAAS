import React from 'react';
import { X, BookOpen } from 'lucide-react';
import ActivityTimeline from './ActivityTimeline';

interface TimelineItem {
  id: string;
  disciplina: string;
  titulo: string;
  resumo: string;
  data_detectado: string;
  url_origem?: string;
}

interface CategoryContentOverlayProps {
  disciplina: string;
  items: TimelineItem[];
  onClose: () => void;
  onOpenResumo: (item: TimelineItem) => void;
}

const CategoryContentOverlay: React.FC<CategoryContentOverlayProps> = ({ 
  disciplina, 
  items, 
  onClose, 
  onOpenResumo 
}) => {
  return (
    <div
      className="modal-overlay"
      style={{ zIndex: 10000 }}
      onClick={onClose}
    >
      <div
        className="modal-content animate-reveal"
        style={{
          maxWidth: '900px',
          width: '95%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          background: 'var(--surface-base)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ 
          padding: '2rem 2.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(to right, hsla(var(--ch-plasma), 0.06), transparent)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div className="badge badge-cyan" style={{ padding: '0.8rem' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <h2 className="font-display" style={{ 
                fontSize: '1.75rem', 
                fontWeight: 700,
                color: 'hsl(var(--ch-t0))',
                margin: 0,
                letterSpacing: '-0.02em'
              }}>
                {disciplina}
              </h2>
              <p className="text-dim" style={{ fontSize: '0.9rem', opacity: 0.6, marginTop: '0.25rem' }}>
                {items.length} {items.length === 1 ? 'conteúdo detectado' : 'conteúdos detectados'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="glass-hover"
            style={{ 
              width: '45px', 
              height: '45px', 
              borderRadius: '50%',
              background: 'var(--surface-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              color: 'hsl(var(--ch-t1))',
              transition: 'all 0.3s'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div style={{ 
          padding: '2.5rem', 
          overflowY: 'auto',
          flex: 1,
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(15,23,42,0.18) transparent'
        }}>
          <ActivityTimeline items={items} onOpenResumo={onOpenResumo} />
          
          {items.length === 0 && (
            <div style={{ 
              padding: '4rem 2rem', 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{ opacity: 0.2 }}>
                <BookOpen size={64} />
              </div>
              <p className="text-dim" style={{ fontSize: '1.1rem' }}>
                Nenhum conteúdo encontrado para esta disciplina.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ 
          padding: '1.5rem 2.5rem',
          background: 'var(--surface-2)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <p className="text-dim" style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', opacity: 0.4 }}>
            SISTEMA DE RECUPERAÇÃO DE CONTEÚDO IDP CORE
          </p>
        </div>
      </div>
    </div>
  );
};

export default CategoryContentOverlay;
