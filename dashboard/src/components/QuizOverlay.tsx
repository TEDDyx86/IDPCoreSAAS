import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, ChevronRight, Trophy, RotateCcw, BrainCircuit, HelpCircle } from 'lucide-react';

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
      setCurrentStep(currentStep + 1);
      setSelectedOption(null);
      setIsAnswered(false);
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 sm:overflow-y-auto">
      {/* Backdrop with Deep Glass Blur */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[20px] animate-in fade-in duration-700"
        onClick={onClose}
      />
      
      {/* Premium Container */}
      <div className="relative w-full max-w-3xl bg-[#050505] border border-white/5 rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Navigation Indicator Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-1000 ease-out" 
            style={{ width: `${((currentStep + (isFinished ? 1 : 0)) / quiz.length) * 100}%` }}
          />
        </div>

        {/* Global Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2.5 hover:bg-white/5 rounded-full transition-all group z-20"
        >
          <X size={20} className="text-white/30 group-hover:text-white group-hover:scale-110 transition-all" />
        </button>

        {/* Header Section */}
        <div className="pt-12 px-10 pb-6 border-b border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-blue-500/80 bg-blue-500/10 p-2 rounded-xl">
              <BrainCircuit size={18} />
            </div>
            <span className="text-[0.65rem] font-bold tracking-[0.2em] text-blue-500/80 uppercase">Desafio Onyx</span>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent font-display">
            {isFinished ? "Missão Concluída" : `Questão ${currentStep + 1}`}
          </h2>
          <p className="text-sm text-white/40 mt-1 font-medium truncate max-w-[80%]">{title}</p>
        </div>

        {/* Dynamic Content Area */}
        <div className="min-h-[400px]">
          {!isFinished ? (
            <div className="p-10">
              {/* Question Text */}
              <div className="mb-10">
                <h3 className="text-xl sm:text-2xl font-medium text-white/90 leading-tight">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* Options Grid (Optimized for Visibility) */}
              <div className="grid gap-4">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrectAnswer = isAnswered && idx === currentQuestion.correct_index;
                  const isWrongSelection = isAnswered && isSelected && !isCorrectAnswer;
                  
                  let cardStyle = "border-white/5 bg-white/[0.02]";
                  let indicatorStyle = "border-white/10 text-white/20";

                  if (isSelected && !isAnswered) {
                    cardStyle = "border-blue-500/40 bg-blue-500/5 ring-1 ring-blue-500/20";
                    indicatorStyle = "bg-blue-500 border-transparent text-white";
                  } else if (isCorrectAnswer) {
                    cardStyle = "border-green-500/40 bg-green-500/10";
                    indicatorStyle = "bg-green-500 border-transparent text-white";
                  } else if (isWrongSelection) {
                    cardStyle = "border-red-500/40 bg-red-500/10";
                    indicatorStyle = "bg-red-500 border-transparent text-white";
                  } else if (isAnswered) {
                    cardStyle = "border-white/5 bg-white/[0.01] opacity-30";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      disabled={isAnswered}
                      className={`group w-full p-6 pb-7 rounded-[24px] border text-left transition-all duration-300 flex items-start gap-5 relative overflow-hidden ${cardStyle} ${!isAnswered ? 'hover:bg-white/[0.05] hover:border-white/20' : ''}`}
                    >
                      <span className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs font-bold shrink-0 transition-all ${indicatorStyle}`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      
                      <span className={`flex-1 text-[1.05rem] leading-relaxed pt-1 transition-colors ${isSelected || isCorrectAnswer ? 'text-white' : 'text-white/60'}`}>
                        {option}
                      </span>
                      
                      {isCorrectAnswer && (
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-green-500 animate-in zoom-in duration-500">
                          <CheckCircle2 size={24} />
                        </div>
                      )}
                      {isWrongSelection && (
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-red-500 animate-in zoom-in duration-500">
                          <XCircle size={24} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Action Footer */}
              <div className="mt-12 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/20 text-xs font-bold tracking-widest uppercase">
                   <HelpCircle size={14} /> Selecione uma opção
                </div>

                {!isAnswered ? (
                  <button
                    onClick={handleConfirm}
                    disabled={selectedOption === null}
                    className="px-10 py-4 bg-white text-black font-bold rounded-2xl hover:bg-white/90 disabled:opacity-30 disabled:grayscale transition-all active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.1)] text-sm"
                  >
                    CONFIRMAR
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="group flex items-center gap-2 px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 transition-all active:scale-95 shadow-[0_20px_40px_rgba(59,130,246,0.2)] text-sm"
                  >
                    {currentStep < quiz.length - 1 ? 'PRÓXIMA QUESTÃO' : 'RESULTADO FINAL'}
                    <ChevronRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Finished State - Masterly Design */
            <div className="p-12 text-center animate-in zoom-in-95 duration-1000">
              <div className="relative w-32 h-32 mx-auto mb-8">
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                <div className="relative w-full h-full bg-gradient-to-b from-blue-500/20 to-blue-500/5 rounded-full flex items-center justify-center text-blue-500 border border-blue-500/20">
                  <Trophy size={56} />
                </div>
              </div>
              
              <h3 className="text-3xl sm:text-4xl font-bold text-white mb-3 font-display">Excelente Desempenho</h3>
              <p className="text-white/40 mb-10 max-w-sm mx-auto text-sm leading-relaxed">
                Você validou com sucesso seu conhecimento sobre o material. Os pontos foram adicionados ao seu perfil académico.
              </p>

              <div className="bg-white/[0.02] rounded-[32px] p-10 mb-12 max-w-sm mx-auto border border-white/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative">
                  <div className="text-6xl font-bold text-white mb-2 tracking-tighter">
                    {score} <span className="text-2xl text-white/20 font-light ml-1">/ {quiz.length}</span>
                  </div>
                  <div className="text-[0.65rem] font-bold text-blue-400 uppercase tracking-[0.3em] pl-1">
                    {score === quiz.length ? 'Nível Magistral' : score >= quiz.length / 2 ? 'Conhecimento Sólido' : 'Precisa de Revisão'}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={resetQuiz}
                  className="flex items-center justify-center gap-2 px-10 py-4 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/5 transition-all text-sm"
                >
                  <RotateCcw size={16} />
                  NOVA TENTATIVA
                </button>
                <button
                  onClick={onClose}
                  className="px-12 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 transition-all text-sm shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                >
                  CONCLUIR DESAFIO
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

