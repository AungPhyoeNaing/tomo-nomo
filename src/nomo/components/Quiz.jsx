import React, { useState, useEffect, useRef } from 'react';
import socket from '../socket';
import { motion, AnimatePresence } from 'framer-motion';
import GameTicketFrame from './GameTicketFrame';

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'];

const Quiz = ({ roomId, data }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [completed, setCompleted] = useState(false);
  const advanceTimer = useRef(null);

  const { opponentName = 'your friend', questionsToAnswer = [] } = data || {};

  const safeQuestions = Array.isArray(questionsToAnswer) ? questionsToAnswer : [];
  const totalQuestions = safeQuestions.length || 10;
  const currentQ = safeQuestions[currentIndex];

  useEffect(() => () => clearTimeout(advanceTimer.current), []);
  useEffect(() => {
    const submit = () => {
      if (completed && socket.connected) socket.emit('submit_answers', { roomId, answers });
    };
    submit();
    socket.on('room_session', submit);
    return () => socket.off('room_session', submit);
  }, [completed, roomId, answers]);

  const handleSelectOption = (option) => {
    if (selectedOption !== null || !currentQ || completed || !socket.connected) return;
    setSelectedOption(option);

    const newAnswers = [...answers, { questionId: currentQ.id, selectedOption: option }];
    setAnswers(newAnswers);

    advanceTimer.current = setTimeout(() => {
      setSelectedOption(null);
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCompleted(true);
      }
    }, 280);
  };

  if (completed) {
    return (
      <div className="nomo-card rounded-[32px] p-8 text-center space-y-4 max-w-md mx-auto">
        <p role="status">Your answers are ready. Waiting for the server to confirm…</p>
        <button type="button" className="nomo-button-3d-primary px-5 py-3 rounded-2xl" onClick={() => {
          if (socket.connected) socket.emit('submit_answers', { roomId, answers });
        }}>Retry submission</button>
      </div>
    );
  }

  if (!currentQ) {
    return (
      <div className="nomo-card rounded-[32px] p-8 text-center space-y-4 max-w-md mx-auto shadow-xl">
        <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <div className="font-extrabold text-slate-600 dark:text-slate-300">Loading questions...</div>
      </div>
    );
  }

  const options = Array.isArray(currentQ.options) ? currentQ.options : [];

  return (
    <div data-arcade-panel="quiz" className="w-full max-w-xl mx-auto space-y-6">
      {/* Top Opponent Header */}
      <div className="flex flex-col items-center gap-2.5 text-center">
        <motion.div 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-2 border-sky-200/80 dark:border-slate-700/80 shadow-md"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-200">
            Guess what <strong className="text-sky-600 dark:text-sky-400 font-black">{opponentName}</strong> answered:
          </span>
        </motion.div>

        {/* Segmented Dots Indicator with Active Glow */}
        <div className="flex items-center gap-1.5 pt-1">
          {Array.from({ length: totalQuestions }).map((_, idx) => (
            <motion.div 
              key={idx} 
              initial={false}
              animate={{
                scale: idx === currentIndex ? [1, 1.25, 1] : 1,
                width: idx === currentIndex ? 28 : 8
              }}
              transition={{ duration: 0.25 }}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentIndex 
                  ? 'bg-gradient-to-r from-sky-400 to-cyan-400 shadow-md shadow-sky-300/50' 
                  : idx < currentIndex 
                  ? 'bg-cyan-400/80' 
                  : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>
        
        <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500">
          Question {currentIndex + 1} of {totalQuestions}
        </span>
      </div>

      {/* Main Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="nomo-card nomo-ticket p-6 sm:p-8 relative text-left space-y-6"
        >
          <GameTicketFrame />
          {/* Question Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-100/90 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 text-[11px] font-black tracking-wider uppercase border border-sky-200 dark:border-sky-800 shadow-sm">
              <span>Question #{currentIndex + 1}</span>
            </div>
            
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-['Fredoka'] leading-snug">
              {currentQ.text || 'မေးခွန်း'}
            </h2>
          </div>

          {/* Options List */}
          <div className="space-y-3">
            {options.map((opt, optIdx) => {
              const letter = OPTION_LETTERS[optIdx] || '•';
              const isSelected = selectedOption === opt;

              return (
                <motion.button 
                  key={opt} 
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={{ scale: 0.985 }}
                  type="button"
                  aria-pressed={isSelected}
                  disabled={selectedOption !== null}
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full p-4 rounded-2xl font-extrabold text-sm sm:text-base text-left flex items-start justify-between gap-3.5 transition-all cursor-pointer shadow-sm ${
                    isSelected 
                      ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg border-t border-white/50 scale-[1.02]' 
                      : 'bg-white/70 dark:bg-slate-800/70 backdrop-blur-md text-slate-700 dark:text-slate-200 border-2 border-slate-200/80 dark:border-slate-700 hover:border-sky-300 hover:bg-sky-50/50 dark:hover:bg-slate-700/80 active:scale-[0.99]'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 shadow-sm transition-all mt-0.5 ${
                      isSelected 
                        ? 'bg-white text-sky-600' 
                        : 'bg-sky-50 dark:bg-slate-700 text-sky-600 dark:text-sky-300'
                    }`}>
                      {letter}
                    </span>
                    <span className="whitespace-normal break-words leading-relaxed flex-1 text-left pt-0.5">
                      {opt}
                    </span>
                  </div>

                  {isSelected && (
                    <span className="text-white text-base font-black shrink-0 mt-0.5 animate-bounce">
                      ✓
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Quiz;
