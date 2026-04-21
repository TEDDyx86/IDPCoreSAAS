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
    <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={onClose}>
      <div 
        className="modal-content animate-slide-up" 
        style={{ 
          maxWidth: '900px', 
          width: '95%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          background: 'rgba(10, 10, 15, 0.9)',
          overflow: 'hidden'
        }} 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ 
          padding: '2rem 2.5rem', 
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(to right, rgba(16, 185, 129, 0.05), transparent)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div className="badge badge-cyan" style={{ padding: '0.8rem' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <h2 className="font-display" style={{ 
                fontSize: '1.75rem', 
                fontWeight: 700, 
                color: 'white',
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
              background: 'rgba(255,255,255,0.03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
              color: 'white',
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
          scrollbarColor: 'rgba(255,255,255,0.1) transparent'
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
          background: 'rgba(0,0,0,0.2)',
          borderTop: '1px solid rgba(255,255,255,0.04)',
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
