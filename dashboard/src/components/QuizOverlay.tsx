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
              <div style={{ padding: '10px', background: 'rgba(59,130,246,0.1)', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.2)' }}>
                <BrainCircuit size={24} color="#3b82f6" />
              </div>
              <div>
                <div className="quiz-meta-label">AVALIAÇÃO</div>
                <div style={{ color: 'white', fontWeight: 700, fontSplit: '0.9' }}>Onyx Ultra</div>
              </div>
            </div>

            <div style={{ borderLeft: '2px solid rgba(255,255,255,0.05)', paddingLeft: '1.5rem', marginBottom: '2rem' }}>
              <div className="quiz-meta-label">PROGRESSO</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', fontFamily: 'Outfit' }}>
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
                    background: idx < currentStep ? '#3b82f6' : idx === currentStep ? 'white' : 'rgba(255,255,255,0.1)'
                  }} 
                />
              ))}
            </div>
          </div>

          <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="quiz-meta-label" style={{ opacity: 0.4 }}>Módulo Ativo</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', lineHeight: '1.4' }}>
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
                <div className="quiz-meta-label" style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.05)', display: 'inline-block', padding: '4px 12px', borderRadius: '100px' }}>QUESTÃO OBJETIVA</div>
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
                      <div style={{ fontSize: '1.05rem', fontWeight: 500, color: isSelected || isCorrect ? 'white' : 'rgba(255,255,255,0.7)', transition: 'color 0.4s' }}>
                        {option}
                      </div>
                      {isCorrect && <CheckCircle2 size={18} color="#22c55e" style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }} />}
                      {isWrong && <XCircle size={18} color="#ef4444" style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }} />}
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
                  <div style={{ width: '120px', height: '120px', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', borderRadius: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(59,130,246,0.3)', transform: 'rotate(5deg)' }}>
                    <Trophy size={60} color="white" />
                  </div>
                  <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', background: '#0a0a0a', padding: '8px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                     <Star size={24} color="#facc15" fill="#facc15" />
                  </div>
               </div>

               <h2 style={{ fontSize: '3rem', fontWeight: 800, color: 'white', marginBottom: '1rem', fontFamily: 'Outfit' }}>Desafio Concluído</h2>
               <p style={{ color: 'rgba(255,255,255,0.4)', maxWidth: '400px', marginBottom: '3rem', fontSize: '1.1rem' }}>Sua jornada de conhecimento foi registrada com sucesso no núcleo acadêmico.</p>

               <div style={{ display: 'flex', gap: '2rem', marginBottom: '4rem' }}>
                  <div style={{ textAlign: 'left', padding: '1.5rem 3rem', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="quiz-meta-label">PONTUAÇÃO</div>
                    <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'white', fontFamily: 'Outfit', lineHeight: 1 }}>
                      {score}<span style={{ opacity: 0.1, fontSize: '1.5rem', marginLeft: '0.5rem' }}>/{quiz.length}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'left', padding: '1.5rem 3rem', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className="quiz-meta-label">STATUS</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#3b82f6', letterSpacing: '0.1em' }}>
                      {score === quiz.length ? 'MAGISTRAL' : score >= quiz.length / 2 ? 'AVANÇADO' : 'EVOLUINDO'}
                    </div>
                  </div>
               </div>

               <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '500px' }}>
                 <button className="quiz-main-btn" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }} onClick={resetQuiz}>
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
