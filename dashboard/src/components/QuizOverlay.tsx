import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, ChevronRight, Trophy, RotateCcw } from 'lucide-react';

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
    setScore(score); // Mantém o score anterior ou reseta? Vamos resetar para nova tentativa
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Container */}
      <div className="relative w-full max-w-2xl bg-[#0a0a0b] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Desafio de Fixação
            </h2>
            <p className="text-sm text-white/40 mt-1">{title}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <X size={20} className="text-white/60" />
          </button>
        </div>

        {/* Content */}
        {!isFinished ? (
          <div className="p-8">
            {/* Progress */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-500" 
                  style={{ width: `${((currentStep + 1) / quiz.length) * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono text-white/40">
                {currentStep + 1} / {quiz.length}
              </span>
            </div>

            {/* Question */}
            <h3 className="text-xl font-medium text-white/90 mb-8 leading-relaxed">
              {currentQuestion.question}
            </h3>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                let statusClass = "border-white/10 hover:border-white/20 bg-white/5";
                
                if (isAnswered) {
                  if (idx === currentQuestion.correct_index) {
                    statusClass = "border-green-500/50 bg-green-500/10 text-green-400";
                  } else if (idx === selectedOption) {
                    statusClass = "border-red-500/50 bg-red-500/10 text-red-400";
                  } else {
                    statusClass = "border-white/5 bg-white/2 opacity-40";
                  }
                } else if (selectedOption === idx) {
                  statusClass = "border-blue-500/50 bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    disabled={isAnswered}
                    className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 flex items-start gap-4 ${statusClass}`}
                  >
                    <span className={`w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-bold shrink-0 ${
                       selectedOption === idx ? 'bg-blue-500 border-transparent text-white' : 'border-white/10 text-white/40'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1">{option}</span>
                    
                    {isAnswered && idx === currentQuestion.correct_index && (
                      <CheckCircle2 size={20} className="text-green-500 ml-auto" />
                    )}
                    {isAnswered && idx === selectedOption && idx !== currentQuestion.correct_index && (
                      <XCircle size={20} className="text-red-500 ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="mt-10 flex justify-end">
              {!isAnswered ? (
                <button
                  onClick={handleConfirm}
                  disabled={selectedOption === null}
                  className="px-8 py-3 bg-white text-black font-semibold rounded-xl hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  Confirmar Resposta
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-500 transition-all active:scale-95"
                >
                  {currentStep < quiz.length - 1 ? 'Próxima Questão' : 'Ver Resultado'}
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Finished State */
          <div className="p-12 text-center animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500">
              <Trophy size={48} />
            </div>
            
            <h3 className="text-3xl font-bold text-white mb-2">Desempenho Final</h3>
            <p className="text-white/40 mb-8 max-w-sm mx-auto">
              Você completou o desafio de fixação para "{title}". Continue assim!
            </p>

            <div className="bg-white/5 rounded-3xl p-8 mb-10 max-w-xs mx-auto border border-white/5">
              <div className="text-5xl font-bold text-white mb-1">
                {score} <span className="text-xl text-white/30 font-normal">/ {quiz.length}</span>
              </div>
              <div className="text-sm font-medium text-blue-400 uppercase tracking-widest">
                {score === quiz.length ? 'Perfeito!' : score >= quiz.length / 2 ? 'Bom Trabalho' : 'Continue Estudando'}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={resetQuiz}
                className="flex items-center justify-center gap-2 px-8 py-3 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/5 transition-all"
              >
                <RotateCcw size={18} />
                Tentar Novamente
              </button>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all"
              >
                Concluir
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizOverlay;
