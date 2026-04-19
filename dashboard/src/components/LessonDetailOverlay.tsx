import React from 'react';
import { ArrowLeft, ExternalLink, BookOpen, Clock, Zap, Sparkles } from 'lucide-react';

interface LessonDetailOverlayProps {
  item: {
    titulo: string;
    disciplina: string;
    resumo: string;
    data_detectado: string;
    links?: { url: string };
  };
  onClose: () => void;
}

const LessonDetailOverlay: React.FC<LessonDetailOverlayProps> = ({ item, onClose }) => {
  return (
    <div 
      className="lesson-page-overlay animate-fade" 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        zIndex: 2000, 
        background: 'hsl(var(--bg-onyx))', 
        display: 'flex', 
        flexDirection: 'column' 
      }}
    >
      {/* Header Fixo */}
      <nav style={{ 
        padding: '1.5rem 4rem', 
        borderBottom: '1px solid hsla(var(--glass-border))', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: 'rgba(0,0,0,0.2)',
        backdropFilter: 'blur(10px)'
      }}>
        <button 
          onClick={onClose} 
          className="nav-btn" 
          style={{ gap: '0.8rem', padding: '0.8rem 1.5rem' }}
        >
          <ArrowLeft size={18} /> Voltar para o Dashboard
        </button>
        
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div className="badge badge-purple" style={{ padding: '0.5rem 1rem' }}>
            <Sparkles size={14} /> Onyx IA Analysis
          </div>
          {item.links?.url && (
            <a 
              href={item.links.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="premium-btn"
              style={{ padding: '0.8rem 1.5rem', background: 'hsla(var(--primary), 0.15)', borderColor: 'hsla(var(--primary), 0.3)' }}
            >
              Abrir no Canvas <ExternalLink size={16} />
            </a>
          )}
        </div>
      </nav>

      {/* Conteúdo Centralizado */}
      <main style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '6rem 2rem', 
        display: 'flex', 
        justifyContent: 'center' 
      }}>
        <div style={{ maxWidth: '900px', width: '100%', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          
          <header style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="badge badge-cyan" style={{ width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={20} />
              </div>
              <span className="text-dim font-display" style={{ letterSpacing: '0.3em', fontSize: '0.75rem', fontWeight: 800 }}>{item.disciplina.toUpperCase()}</span>
            </div>
            
            <h1 style={{ fontSize: '4rem', fontWeight: 900, lineHeight: '1.1', maxWidth: '800px' }} className="text-gradient">
              {item.titulo}
            </h1>
            
            <div style={{ display: 'flex', gap: '2rem', opacity: 0.6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} />
                <span className="font-display" style={{ fontSize: '0.8rem' }}>Detectado em {new Date(item.data_detectado).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={16} />
                <span className="font-display" style={{ fontSize: '0.8rem' }}>Processado por Onyx Engine 3.0</span>
              </div>
            </div>
          </header>

          <section style={{ 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', 
            borderRadius: '24px', 
            padding: '3rem', 
            border: '1px solid hsla(var(--glass-border))',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Efeito Visual de Fundo */}
            <div style={{ 
              position: 'absolute', 
              top: '-10%', 
              right: '-10%', 
              width: '40%', 
              height: '40%', 
              background: 'hsla(var(--primary), 0.05)', 
              filter: 'blur(80px)',
              borderRadius: '50%',
              zIndex: 0
            }}></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 className="font-display" style={{ fontSize: '1.2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', color: 'white' }}>
                <Sparkles size={20} className="text-gradient" /> RESUMO E INSIGHTS DA AULA
              </h3>
              <div className="resumo-content-full" style={{ 
                fontSize: '1.2rem', 
                lineHeight: '2', 
                color: 'rgba(255,255,255,0.85)',
                whiteSpace: 'pre-line' 
              }}>
                {item.resumo || "Aguardando processamento profundo de IA..."}
              </div>
            </div>
          </section>

          <footer style={{ marginTop: '2rem', textAlign: 'center', opacity: 0.3 }}>
            <p className="font-display" style={{ fontSize: '0.7rem', letterSpacing: '0.2em' }}>
              ESTE RESUMO É GERADO POR IA E PODE CONTER IMPRECISÕES. SEMPRE CONSULTE O MATERIAL ORIGINAL.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default LessonDetailOverlay;
