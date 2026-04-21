import React, { useState } from 'react';
import { ArrowLeft, ExternalLink, BookOpen, Clock, Zap, Sparkles, Share2, RefreshCw, BrainCircuit, ChevronRight, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import QuizOverlay from './QuizOverlay';

interface LessonDetailOverlayProps {
  item: {
    id: string | number;
    origin_id: string;
    titulo: string;
    disciplina: string;
    resumo: string;
    data_detectado: string;
    links?: { url: string };
  };
  onClose: () => void;
}

const LessonDetailOverlay: React.FC<LessonDetailOverlayProps> = ({ item, onClose }) => {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const { error } = await supabase
        .from('academic_updates')
        .update({ 
          resumo: '[REGENERAÇÃO SOLICITADA]'
        })
        .eq('id', item.id);

      if (error) throw error;
      setSuccess(true);
      
      // Auto-fechar ou feedback
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Erro ao solicitar regeneração:', err);
      alert('Falha ao solicitar regeneração. Tente novamente.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const renderFormattedText = (text: string) => {
    if (!text) return null;

    // Detect requested regeneration state
    if (text.includes('[REGENERAÇÃO SOLICITADA]')) {
      return (
        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'hsla(var(--accent-cyan), 0.8)' }}>
          <RefreshCw size={32} className="animate-spin" style={{ marginBottom: '1.5rem' }} />
          <p className="font-display" style={{ fontSize: '1.1rem', letterSpacing: '0.05em' }}>REPROCESSANDO CONTEÚDO...</p>
          <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>A inteligência artificial está reconstruindo esta aula para você.</p>
        </div>
      );
    }

    const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '');
    const elements: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];

    const processText = (str: string) => {
      // Basic bold detection with **
      return str.split(/(\*\*.*?\*\*)/).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });
    };

    lines.forEach((line, index) => {
      const isListItem = line.startsWith('- ') || line.startsWith('* ') || /^\d+\.\s/.test(line);

      if (isListItem) {
        const content = line.replace(/^[-*]\s|^\d+\.\s/, '');
        currentList.push(<li key={`li-${index}`}>{processText(content)}</li>);
      } else {
        if (currentList.length > 0) {
          elements.push(<ul key={`ul-${index}`}>{currentList}</ul>);
          currentList = [];
        }
        elements.push(<p key={`p-${index}`}>{processText(line)}</p>);
      }
    });

    if (currentList.length > 0) {
      elements.push(<ul key="final-ul">{currentList}</ul>);
    }

    return <div className="prose-custom">{elements}</div>;
  };

  const [showQuiz, setShowQuiz] = useState(false);

  // Extrair quiz dos links (visto que salvamos no campo links.quiz)
  const quizData = (item.links as any)?.quiz || null;

  return (
    <div 
      className="lesson-page-overlay animate-reveal" 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        zIndex: 20000, 
        background: 'rgba(5, 5, 5, 0.8)', 
        backdropFilter: 'blur(var(--glass-blur))',
        WebkitBackdropFilter: 'blur(var(--glass-blur))',
        display: 'flex', 
        flexDirection: 'column',
        color: 'white'
      }}
    >
      {/* Premium Navigation Header */}
      <nav style={{ 
        padding: '1.25rem 3rem', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: 'rgba(5,5,5,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.03)',
        zIndex: 10
      }}>
        <button 
          onClick={onClose} 
          className="nav-btn-text" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: 0.6 }}
        >
          <ArrowLeft size={18} />
          <span className="font-display" style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em' }}>DASHBOARD</span>
        </button>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
           <div className="badge badge-purple" style={{ padding: '0.6rem 1.2rem', fontSize: '0.7rem' }}>
            <Sparkles size={14} /> ONYX INTELLIGENCE
          </div>
          <button className="nav-btn-text" style={{ padding: '0.5rem', opacity: 0.4 }}>
            <Share2 size={18} />
          </button>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors ml-2"
          >
            <X size={24} className="text-white/60" />
          </button>
        </div>
      </nav>

      {/* Editorial Content Wrapper */}
      <main style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '5vh 2rem 10vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center' 
      }}>
        <div style={{ maxWidth: '800px', width: '100%' }}>
          
          {/* Article Header */}
          <header style={{ marginBottom: '5rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
               <div className="badge badge-cyan" style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', borderRadius: '100px' }}>
                <BookOpen size={14} /> {item.disciplina}
              </div>
            </div>
            
            <h1 className="font-display" style={{ 
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', 
              fontWeight: 700, 
              lineHeight: '1.05', 
              letterSpacing: '-0.03em',
              marginBottom: '2.5rem',
              color: 'white'
            }}>
              {item.titulo}
            </h1>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '2.5rem', 
              color: 'rgba(255,255,255,0.3)',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Clock size={16} />
                <span className="font-display" style={{ fontWeight: 500 }}>{new Date(item.data_detectado).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Zap size={16} />
                <span className="font-display" style={{ fontWeight: 500 }}>Onyx Engine v3.0</span>
              </div>
            </div>
          </header>

          {/* Reading Section */}
          <article className="glass glass-card" style={{ 
            padding: '4rem', 
            borderRadius: '40px',
            border: '1px solid rgba(255,255,255,0.03)',
            background: 'rgba(255,255,255,0.01)',
            marginBottom: '4rem'
          }}>
            <div style={{ 
              fontSize: '1.25rem', 
              lineHeight: '1.9', 
              color: 'rgba(255,255,255,0.8)',
              fontWeight: 400,
              letterSpacing: '-0.01em'
            }}>
              {item.resumo ? (
                 renderFormattedText(item.resumo)
              ) : (
                <div style={{ textAlign: 'center', padding: '4rem 0', opacity: 0.4 }}>
                  <Sparkles size={32} style={{ marginBottom: '1.5rem' }} className="animate-pulse" />
                  <p className="font-display" style={{ fontSize: '1rem', letterSpacing: '0.1em' }}>SINTETIZANDO CONTEÚDO...</p>
                </div>
              )}
            </div>
          </article>

          {/* Quiz Challenge Section */}
          {quizData && quizData.length > 0 && (
            <div style={{ 
              margin: '0 0 6rem', 
              padding: '4rem', 
              borderRadius: '40px', 
              background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                background: 'rgba(59, 130, 246, 0.1)', 
                borderRadius: '20px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                color: '#3b82f6'
              }}>
                <BrainCircuit size={32} />
              </div>
              <h3 className="font-display" style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '1rem' }}>Pronto para o Desafio?</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '2.5rem', maxWidth: '400px', margin: '0 auto 2.5rem' }}>
                Teste sua compreensão sobre os temas abordados com um questionário interativo exclusivo.
              </p>
              <button 
                onClick={() => setShowQuiz(true)}
                className="premium-btn"
                style={{ 
                  background: '#3b82f6', 
                  color: 'white', 
                  border: 'none', 
                  padding: '1.25rem 3rem',
                  fontSize: '1rem',
                  boxShadow: '0 20px 40px rgba(59, 130, 246, 0.2)'
                }}
              >
                INICIAR QUESTIONÁRIO <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* Call to Action & Source */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', marginBottom: '6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
              {item.links?.url && (
                  <a 
                    href={item.links.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="premium-btn"
                    style={{ gap: '1rem', padding: '1rem 2.5rem', fontSize: '0.9rem' }}
                  >
                    ABRIR MATERIAL COMPLETO <ExternalLink size={18} />
                  </a>
                )}

              <button 
                onClick={handleRegenerate}
                disabled={isRegenerating || success}
                className={`premium-btn ${success ? 'btn-success' : ''}`}
                style={{ 
                  gap: '1rem', 
                  padding: '1rem 2.5rem', 
                  fontSize: '0.9rem',
                  background: success ? '#00ffa3' : 'rgba(255,255,255,0.05)',
                  color: success ? '#000' : 'white',
                  border: success ? 'none' : '1px solid rgba(255,255,255,0.1)'
                }}
              >
                {isRegenerating ? (
                  <>SOLICITANDO... <RefreshCw size={18} className="animate-spin" /></>
                ) : success ? (
                  <>SOLICITADO COM SUCESSO!</>
                ) : (
                  <>REGERAR AULA COM IA <RefreshCw size={18} /></>
                )}
              </button>
            </div>
            
            {success && (
              <p className="font-display animate-pulse" style={{ fontSize: '0.75rem', color: '#00ffa3', letterSpacing: '0.1em' }}>
                O ROBÔ REPROCESSARÁ ESTE CONTEÚDO NA PRÓXIMA VERIFICAÇÃO.
              </p>
            )}
          </div>

          <footer style={{ borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '3rem', textAlign: 'center', opacity: 0.2 }}>
            <p className="font-display" style={{ fontSize: '0.65rem', letterSpacing: '0.3em', lineHeight: '2' }}>
              ONYX ACADEMIC MONITOR • HIGH-FIDELITY LEARNING INTERFACE<br/>
              ESTE CONTEÚDO FOI GERADO POR INTELIGÊNCIA ARTIFICIAL.
            </p>
          </footer>
        </div>
      </main>

      {/* Quiz Overlay Modal */}
      {showQuiz && quizData && (
        <QuizOverlay 
          quiz={quizData} 
          title={item.titulo} 
          onClose={() => setShowQuiz(false)} 
        />
      )}
    </div>
  );
};

export default LessonDetailOverlay;
