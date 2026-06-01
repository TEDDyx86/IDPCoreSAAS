import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, ChevronRight, Trophy, RotateCcw, BrainCircuit, Target, Zap, Award, Star } from 'lucide-react';

interface QuizItem {
  question: string;
  options: string[];
  correct_index: number;
}

interface QuizOverlayProps {
  quiz: QuizItem[];
  title: string;
  onClose: () => void;
}

const QuizOverlay: React.FC<QuizOverlayProps> = ({ quiz, title, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [appearIn, setAppearIn] = useState(false);

  useEffect(() => {
    setAppearIn(true);
    return () => setAppearIn(false);
  }, [currentStep]);

  const currentQuestion = quiz[currentStep];

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleConfirm = () => {
    if (selectedOption === null) return;
    
    const isCorrect = selectedOption === currentQuestion.correct_index;
    if (isCorrect) setScore(score + 1);
    
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentStep < quiz.length - 1) {
      setAppearIn(false);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setSelectedOption(null);
        setIsAnswered(false);
      }, 400);
    } else {
      setIsFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="quiz-fixed-layer">
      <div className="quiz-vessel">
        
        {/* Sidebar */}
        <div className="quiz-sidebar">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
              <div style={{ padding: '10px', background: 'hsla(var(--accent-blue), 0.1)', borderRadius: '12px', border: '1px solid hsla(var(--accent-blue), 0.2)' }}>
                <BrainCircuit size={24} style={{ color: 'hsl(var(--accent-blue))' }} />
              </div>
              <div>
                <div className="quiz-meta-label">AVALIAÇÃO</div>
                <div style={{ color: 'hsl(var(--ch-t0))', fontWeight: 700 }}>Onyx Ultra</div>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div className="quiz-meta-label">PROGRESSO</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'hsl(var(--ch-t0))', fontFamily: 'var(--font-display)', marginTop: '0.4rem' }}>
                {String(isFinished ? quiz.length : currentStep + 1).padStart(2, '0')}
                <span style={{ opacity: 0.2, fontSize: '1rem', marginLeft: '0.5rem' }}>/ {quiz.length}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {quiz.map((_, idx) => (
                <div 
                  key={idx}
                  style={{ 
                    height: '4px', 
                    flex: 1, 
                    borderRadius: '10px',
                    transition: 'all 0.6s',
                    background: idx < currentStep ? 'hsl(var(--accent-blue))' : idx === currentStep ? 'hsl(var(--ch-t0))' : 'var(--surface-3)'
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ padding: '1.5rem', background: 'var(--surface-1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div className="quiz-meta-label" style={{ opacity: 0.7 }}>Módulo Ativo</div>
            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--ch-t1))', fontStyle: 'italic', lineHeight: '1.4' }}>
              {title}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="quiz-content">
          <button className="quiz-close-btn" onClick={onClose}>
            <X size={20} />
          </button>

          {!isFinished ? (
            <div style={{ opacity: appearIn ? 1 : 0, transform: appearIn ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ marginBottom: '2.5rem' }}>
                <div className="quiz-meta-label" style={{ marginBottom: '1rem', background: 'var(--surface-2)', display: 'inline-block', padding: '4px 12px', borderRadius: '100px' }}>QUESTÃO OBJETIVA</div>
                <h3 className="quiz-question-text">{currentQuestion.question}</h3>
              </div>

              <div className="quiz-options-grid">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = isAnswered && idx === currentQuestion.correct_index;
                  const isWrong = isAnswered && isSelected && !isCorrect;
                  const showFade = isAnswered && !isSelected && !isCorrect;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      disabled={isAnswered}
                      className={`quiz-option-card ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''} ${showFade ? 'fade' : ''}`}
                    >
                      <div className="quiz-marker">
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 500, color: isSelected || isCorrect ? 'hsl(var(--ch-t0))' : 'hsl(var(--ch-t1))', transition: 'color 0.4s' }}>
                        {option}
                      </div>
                      {isCorrect && <CheckCircle2 size={18} style={{ color: 'hsl(var(--ch-confirm))', position: 'absolute', top: '1.5rem', right: '1.5rem' }} />}
                      {isWrong && <XCircle size={18} style={{ color: 'hsl(var(--ch-reject))', position: 'absolute', top: '1.5rem', right: '1.5rem' }} />}
                    </button>
                  );
                })}
              </div>

              <div className="quiz-footer">
                {!isAnswered ? (
                  <button 
                    className="quiz-main-btn primary" 
                    onClick={handleConfirm}
                    disabled={selectedOption === null}
                  >
                    Confirmar Resposta
                  </button>
                ) : (
                  <button className="quiz-main-btn" onClick={handleNext}>
                    {currentStep < quiz.length - 1 ? 'Continuar Desafio' : 'Ver Meu Desempenho'}
                    <ChevronRight size={18} style={{ marginLeft: '8px' }} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Final Result View */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
               <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
                  <div style={{ width: '120px', height: '120px', background: 'hsla(var(--accent-blue), 0.12)', border: '1px solid hsla(var(--accent-blue), 0.25)', borderRadius: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px hsla(var(--accent-blue), 0.15)', transform: 'rotate(5deg)' }}>
                    <Trophy size={60} style={{ color: 'hsl(var(--accent-blue))' }} />
                  </div>
                  <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', background: 'var(--surface-1)', padding: '8px', borderRadius: '15px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-ambient)' }}>
                     <Star size={24} color="hsl(var(--ch-ember))" fill="hsl(var(--ch-ember))" />
                  </div>
               </div>

               <h2 style={{ fontSize: '3rem', fontWeight: 800, color: 'hsl(var(--ch-t0))', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>Desafio Concluído</h2>
               <p style={{ color: 'hsl(var(--ch-t2))', maxWidth: '400px', marginBottom: '3rem', fontSize: '1.1rem' }}>Sua jornada de conhecimento foi registrada com sucesso no núcleo acadêmico.</p>

               <div style={{ display: 'flex', gap: '2rem', marginBottom: '4rem' }}>
                  <div style={{ textAlign: 'left', padding: '1.5rem 3rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div className="quiz-meta-label">PONTUAÇÃO</div>
                    <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'hsl(var(--ch-t0))', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                      {score}<span style={{ opacity: 0.15, fontSize: '1.5rem', marginLeft: '0.5rem' }}>/{quiz.length}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'left', padding: '1.5rem 3rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className="quiz-meta-label">STATUS</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'hsl(var(--accent-blue))', letterSpacing: '0.1em' }}>
                      {score === quiz.length ? 'MAGISTRAL' : score >= quiz.length / 2 ? 'AVANÇADO' : 'EVOLUINDO'}
                    </div>
                  </div>
               </div>

               <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '500px' }}>
                 <button className="quiz-main-btn" style={{ flex: 1, background: 'var(--surface-2)', color: 'hsl(var(--ch-t1))', border: '1px solid var(--border)', boxShadow: 'none' }} onClick={resetQuiz}>
                   <RotateCcw size={18} style={{ marginRight: '8px' }} />
                   Refazer
                 </button>
                 <button className="quiz-main-btn primary" style={{ flex: 1 }} onClick={onClose}>
                   Finalizar
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizOverlay;
