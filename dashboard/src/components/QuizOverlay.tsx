import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, ChevronRight, Trophy, RotateCcw, BrainCircuit, HelpCircle, Sparkles, Target, Zap, Award, Star } from 'lucide-react';

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Immersive Animated Backdrop */}
      <div 
        className="absolute inset-0 bg-[#020202]/80 backdrop-blur-[40px] animate-in fade-in duration-1000"
        onClick={onClose}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
           <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px] animate-pulse" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500 rounded-full blur-[120px] animate-pulse delay-700" />
        </div>
      </div>
      
      {/* Onyx Ultra Vessel Container */}
      <div className="relative w-full max-w-5xl bg-neutral-950/40 border border-white/10 rounded-[40px] shadow-[0_80px_160px_-40px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in-95 duration-1000 flex flex-col lg:flex-row min-h-[700px]">
        
        {/* Grain Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
        />

        {/* Dynamic Border Gradient */}
        <div className="absolute inset-0 pointer-events-none rounded-[40px] border border-white/5 mask-image-[radial-gradient(circle_at_var(--mouse-x,0px)_var(--mouse-y,0px),black,transparent_70%)]" />

        {/* sidebar: Vertical Stepper & Meta */}
        <div className="lg:w-80 bg-black/40 border-b lg:border-b-0 lg:border-r border-white/5 p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden shrink-0">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-400/20 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                <BrainCircuit size={24} />
              </div>
              <div>
                <h4 className="text-[0.65rem] font-black tracking-[0.3em] text-blue-500 uppercase">AVALIAÇÃO</h4>
                <div className="text-xl font-bold font-display text-white tracking-tight">Onyx Ultra</div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="relative pl-6 border-l-2 border-white/5 py-1">
                 <div className="absolute top-0 -left-[5px] w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                 <div className="text-[0.6rem] font-bold text-blue-500 uppercase tracking-widest mb-1">Passo Atual</div>
                 <div className="text-2xl font-black text-white font-display">
                   {String(isFinished ? quiz.length : currentStep + 1).padStart(2, '0')}
                   <span className="text-white/20 text-lg ml-2">/ {String(quiz.length).padStart(2, '0')}</span>
                 </div>
              </div>

              {/* Progress Stepper Visual */}
              <div className="flex gap-1.5 py-4">
                {quiz.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`h-1 rounded-full flex-1 transition-all duration-700 ${
                      idx < currentStep ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 
                      idx === currentStep ? 'bg-white w-4' : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-auto pt-10">
            <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex items-start gap-3">
               <Zap size={16} className="text-yellow-500 mt-1 shrink-0" />
               <div>
                  <div className="text-[0.6rem] font-bold text-white/40 uppercase tracking-widest mb-1">Módulo Ativo</div>
                  <p className="text-xs font-medium text-white/70 leading-relaxed italic">
                    {title}
                  </p>
               </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-black/20">
          {/* Global Close */}
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-3 hover:bg-white/5 rounded-2xl transition-all group z-20 border border-transparent hover:border-white/10 bg-black/40 backdrop-blur-md"
          >
            <X size={20} className="text-white/40 group-hover:text-white transition-all" />
          </button>

          {!isFinished ? (
            <div className={`flex-1 flex flex-col p-8 md:p-14 lg:p-20 transition-all duration-700 ${appearIn ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
              
              {/* Question Header */}
              <div className="mb-14">
                <div className="flex items-center gap-3 mb-6">
                  <div className="px-3 py-1 bg-blue-600/10 rounded-full text-[0.6rem] font-bold text-blue-400 tracking-widest uppercase border border-blue-500/20">
                    QUESTÃO {currentStep + 1}
                  </div>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <h3 className="text-3xl lg:text-4xl font-black text-white leading-[1.1] font-display tracking-tight text-balance">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* Options Section - Bento Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 content-start">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrectAnswer = isAnswered && idx === currentQuestion.correct_index;
                  const isWrongSelection = isAnswered && isSelected && !isCorrectAnswer;
                  
                  let stateStyle = "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10";
                  let markerStyle = "bg-white/5 text-white/30 border-white/5";

                  if (isSelected && !isAnswered) {
                    stateStyle = "bg-blue-600/10 border-blue-500/40 shadow-[0_10px_40px_rgba(59,130,246,0.1)] scale-[1.02] z-10 ring-1 ring-blue-500/20";
                    markerStyle = "bg-blue-600 text-white border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]";
                  } else if (isCorrectAnswer) {
                    stateStyle = "bg-green-500/15 border-green-500/40 shadow-[0_10px_40px_rgba(34,197,94,0.15)] scale-[1.02] z-10";
                    markerStyle = "bg-green-500 text-white border-green-400/50 shadow-[0_0_20px_rgba(34,197,94,0.4)]";
                  } else if (isWrongSelection) {
                    stateStyle = "bg-red-500/15 border-red-500/40 opacity-100 z-10";
                    markerStyle = "bg-red-500 text-white border-red-400/50 shadow-[0_0_20px_rgba(239,68,68,0.4)]";
                  } else if (isAnswered) {
                    stateStyle = "bg-transparent border-white/5 opacity-20 grayscale transition-opacity duration-1000";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      disabled={isAnswered}
                      style={{ animationDelay: `${idx * 80}ms` }}
                      className={`group w-full p-6 lg:p-8 rounded-[32px] border text-left transition-all duration-500 flex flex-col gap-6 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 ${stateStyle}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-sm font-black shrink-0 transition-all duration-500 font-display ${markerStyle}`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      
                      <div className={`flex-1 text-[1.15rem] font-semibold leading-relaxed transition-colors duration-500 ${isSelected || isCorrectAnswer ? 'text-white' : 'text-white/60'}`}>
                        {option}
                      </div>

                      {isCorrectAnswer && <CheckCircle2 size={24} className="absolute bottom-6 right-6 text-green-500 animate-in zoom-in-50 duration-500" />}
                      {isWrongSelection && <XCircle size={24} className="absolute bottom-6 right-6 text-red-500 animate-in zoom-in-50 duration-500" />}
                      
                      {/* Decorative Flare */}
                      {isSelected && !isAnswered && (
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/10 blur-[50px] pointer-events-none rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Action Area */}
              <div className="mt-14 pt-10 border-t border-white/5 flex items-center justify-between">
                <div className="hidden sm:flex items-center gap-6">
                   <div className="flex items-center gap-3">
                      <Target size={18} className="text-blue-500/60" />
                      <span className="text-[0.65rem] font-black tracking-[0.2em] text-white/30 uppercase">Precisão Acadêmica</span>
                   </div>
                   <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                   <div className="flex items-center gap-3">
                      <Zap size={18} className="text-yellow-500/60" />
                      <span className="text-[0.65rem] font-black tracking-[0.2em] text-white/30 uppercase">Onyx Core</span>
                   </div>
                </div>

                {!isAnswered ? (
                  <button
                    onClick={handleConfirm}
                    disabled={selectedOption === null}
                    className="group relative px-14 py-6 bg-white text-black font-black rounded-3xl hover:bg-neutral-200 disabled:opacity-5 disabled:grayscale transition-all active:scale-95 shadow-[0_30px_60px_rgba(255,255,255,0.1)] text-[0.8rem] tracking-[0.1em] overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                       VALIDAR RESPOSTA
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="group relative px-14 py-6 bg-blue-600 text-white font-black rounded-3xl hover:bg-blue-500 transition-all active:scale-95 shadow-[0_30px_60px_rgba(59,130,246,0.3)] text-[0.8rem] tracking-[0.1em] overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                       {currentStep < quiz.length - 1 ? 'CONTINUAR JORNADA' : 'RESULTADO FINAL'}
                       <ChevronRight size={20} className="transition-transform group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Masterly Result View - Ultra High Fidelity */
            <div className="flex-1 flex flex-col p-14 lg:p-24 text-center items-center justify-center animate-in zoom-in-95 duration-1000">
              <div className="relative mb-14 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                <div className="absolute inset-0 bg-blue-500/20 blur-[80px] rounded-full scale-150 animate-pulse" />
                
                <div className="relative">
                  <div className="w-48 h-48 bg-gradient-to-br from-neutral-800 to-neutral-950 border border-white/20 rounded-[56px] flex items-center justify-center shadow-2xl overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-transparent to-cyan-400/20 group-hover:rotate-12 transition-transform duration-1000" />
                    <Trophy size={96} className="text-white relative z-10 drop-shadow-2xl" strokeWidth={1} />
                  </div>
                  
                  {/* Floating Badges */}
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-blue-600 text-white border-4 border-[#0a0a0a] rounded-full flex items-center justify-center shadow-xl animate-bounce">
                     <Star size={24} fill="white" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-neutral-900 border border-white/10 rounded-[28px] flex items-center justify-center text-white shadow-2xl -rotate-12">
                     <Award size={36} className="text-blue-400" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 mb-14">
                <h3 className="text-5xl lg:text-7xl font-black text-white font-display tracking-tight leading-none bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent italic">
                  Magistral
                </h3>
                <p className="text-white/50 max-w-lg text-xl font-medium leading-relaxed font-display">
                  Sua performance foi extraordinária. Os dados cognitivos foram sincronizados com seu núcleo de processamento.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 w-full max-w-2xl mb-16 px-10">
                <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 text-left group hover:border-blue-500/30 transition-all">
                  <div className="text-[0.65rem] font-black text-blue-500 uppercase tracking-[0.3em] mb-3">PONTUAÇÃO</div>
                  <div className="text-7xl font-black text-white tracking-tighter font-display leading-none">
                    {score}<span className="text-white/10 text-3xl font-light ml-2">/{quiz.length}</span>
                  </div>
                </div>
                
                <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 text-left group hover:border-blue-500/30 transition-all flex flex-col justify-center">
                  <div className="text-[0.65rem] font-black text-blue-500 uppercase tracking-[0.3em] mb-4 text-center">STATUS DE NÚCLEO</div>
                  <div className="flex items-center justify-center gap-3">
                     <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)]" />
                     <div className="text-2xl lg:text-3xl font-black text-white tracking-tight font-display uppercase italic">
                       {score === quiz.length ? 'ELITE' : score >= quiz.length / 2 ? 'AVANÇADO' : 'EVOLUINDO'}
                     </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 w-full max-w-xl">
                <button
                  onClick={resetQuiz}
                  className="flex-1 flex items-center justify-center gap-4 px-10 py-6 border border-white/10 text-white/60 font-black rounded-3xl hover:bg-white/5 hover:text-white transition-all text-[0.85rem] uppercase tracking-widest group"
                >
                  <RotateCcw size={20} className="group-hover:rotate-[-120deg] transition-transform duration-500" />
                  REINICIAR
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-14 py-6 bg-white text-black font-black rounded-3xl hover:scale-105 transition-all text-[0.85rem] uppercase tracking-widest shadow-[0_30px_60px_rgba(255,255,255,0.1)] active:scale-90"
                >
                  FINALIZAR
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
