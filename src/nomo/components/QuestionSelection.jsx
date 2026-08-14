import React, { useState, useMemo } from 'react';
import socket from '../socket';
import { motion, AnimatePresence } from 'framer-motion';
import { BURMESE_QUESTIONS } from '../questions';

const CATEGORIES = [
  { id: 'all', label: 'All (60)' },
  { id: 'favs', label: 'Food & Life (စားသောက်/ဘဝ)', range: [1, 45] },
  { id: 'dating', label: 'Crush & Dating (အချစ်ရေး)', range: [46, 90] },
  { id: 'social', label: 'Memes & TikTok (အခွီများ)', range: [91, 135] },
  { id: 'deep', label: 'Friendship Roasts (ချောက်တွန်း/စနောက်)', range: [136, 180] }
];

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'];

const QuestionSelection = ({ roomId, questions = [], onSubmit }) => {
  const safeQuestions = useMemo(() => {
    const rawList = questions && questions.length ? questions : BURMESE_QUESTIONS.slice(0, 60);
    return rawList.map(q => {
      const bq = BURMESE_QUESTIONS.find(b => b.id === q.id);
      return bq || q;
    });
  }, [questions]);

  const [selections, setSelections] = useState({});
  const [expandedId, setExpandedId] = useState(safeQuestions[0]?.id || null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [filterView, setFilterView] = useState('all'); // 'all' | 'unselected' | 'selected'

  const selectedCount = Object.keys(selections).length;

  const handleSelectAnswer = (question, option) => {
    const newSelections = { ...selections };
    
    if (selectedCount >= 10 && !newSelections[question.id]) {
      alert("မေးခွန်း ၁၀ ခု ပြည့်သွားပါပြီ။ အသစ်ရွေးလိုပါက တစ်ခုကို ပြန်ဖြုတ်ပေးပါ။");
      return;
    }

    newSelections[question.id] = { ...question, answer: option };
    setSelections(newSelections);

    // Auto open next unanswered question if under 10
    if (selectedCount + 1 < 10) {
      const nextQ = safeQuestions.find(q => q.id !== question.id && !newSelections[q.id]);
      if (nextQ) setExpandedId(nextQ.id);
    }
  };

  const handleDeselect = (e, questionId) => {
    e.stopPropagation();
    const newSelections = { ...selections };
    delete newSelections[questionId];
    setSelections(newSelections);
  };

  const handleSubmit = () => {
    if (selectedCount !== 10) {
      alert(`ကျေးဇူးပြု၍ မေးခွန်း ၁၀ ခု အတိအကျ ရွေးပေးပါ။ (လက်ရှိ: ${selectedCount} ခု)`);
      return;
    }
    socket.emit('submit_selection', { 
      roomId, 
      selectedQuestions: Object.values(selections) 
    });
    onSubmit();
  };

  const filteredQuestions = useMemo(() => {
    let list = safeQuestions;
    if (activeCategory !== 'all') {
      const cat = CATEGORIES.find(c => c.id === activeCategory);
      if (cat && cat.range) {
        list = list.filter(q => q.id >= cat.range[0] && q.id <= cat.range[1]);
      }
    }
    if (filterView === 'unselected') {
      list = list.filter(q => !selections[q.id]);
    } else if (filterView === 'selected') {
      list = list.filter(q => !!selections[q.id]);
    }
    return list;
  }, [safeQuestions, activeCategory, filterView, selections]);

  return (
    <div className="w-full space-y-5 pb-36 text-left">
      {/* Title & Guidance with Playful Frost Glow */}
      <div className="text-center space-y-1.5 pt-2">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-sky-100 via-cyan-100 to-sky-100 dark:from-slate-800 dark:via-sky-900/40 dark:to-slate-800 border border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300 text-xs font-black shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>အဆင့် ၁ / Step 1 • Pick Your 10 Truths</span>
        </motion.div>
        
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100 font-['Fredoka'] tracking-tight">
          မေးခွန်း ၁၀ ခု ရွေးချယ်ပါ
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium max-w-md mx-auto">
          မေးခွန်း ၁၀ ခုကို ရွေးပြီး သင့်အဖြေအမှန်တွေကို ရွေးပေးပါ။ သူငယ်ချင်းက လိုက်ခန့်မှန်းရမှာဖြစ်ပါတယ်!
        </p>
      </div>

      {/* Sticky Progress & Category Filter Header */}
      <div className="sticky top-[60px] z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-3xl border-2 border-sky-200/90 dark:border-slate-700 shadow-lg space-y-3">
        <div className="flex justify-between items-center text-xs font-black">
          <div className="flex items-center gap-2.5">
            <span className="text-slate-700 dark:text-slate-200">
              Selection Progress:
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-black transition-all shadow-sm ${
              selectedCount === 10 
                ? 'bg-gradient-to-r from-cyan-400 to-sky-500 text-white animate-bounce' 
                : 'bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
            }`}>
              {selectedCount} / 10 Chosen {selectedCount === 10 ? '✓' : ''}
            </span>
          </div>

          {/* Quick Filter View Toggle */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setFilterView(filterView === 'selected' ? 'all' : 'selected')}
              className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer shadow-sm ${
                filterView === 'selected' 
                  ? 'bg-sky-500 text-white' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-50 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Chosen ({selectedCount})
            </motion.button>
          </div>
        </div>

        {/* Dynamic Segmented Progress Bar */}
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1 p-0.5 border border-sky-100 dark:border-slate-700">
          {Array.from({ length: 10 }).map((_, idx) => (
            <motion.div 
              key={idx} 
              initial={false}
              animate={{
                scale: idx < selectedCount ? [1, 1.15, 1] : 1
              }}
              transition={{ duration: 0.2 }}
              className={`flex-1 h-full rounded-full transition-all duration-300 ${
                idx < selectedCount 
                  ? 'bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 shadow-sm' 
                  : 'bg-slate-200/80 dark:bg-slate-700/80'
              }`}
            />
          ))}
        </div>

        {/* Category Filter Pills (Bouncy Chips) */}
        <div className="flex gap-2 overflow-x-auto pt-1 pb-1 no-scrollbar text-xs">
          {CATEGORIES.map(cat => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => { setActiveCategory(cat.id); setFilterView('all'); }}
              className={`px-3.5 py-1.5 rounded-xl font-extrabold whitespace-nowrap transition-all cursor-pointer shadow-sm ${
                activeCategory === cat.id && filterView === 'all'
                  ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white border-t border-white/50 shadow-md'
                  : 'bg-slate-100/90 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {cat.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredQuestions.length === 0 && (
        <div className="text-center py-12 bg-white/70 dark:bg-slate-800/70 rounded-3xl border-2 border-dashed border-sky-200 dark:border-slate-700 p-6 space-y-3 shadow-sm">
          <p className="font-bold text-slate-500 text-sm">No questions found in this filter.</p>
          <button
            type="button"
            onClick={() => { setActiveCategory('all'); setFilterView('all'); }}
            className="nomo-chip-3d px-4 py-1.5 rounded-full text-xs font-bold"
          >
            Show All Questions
          </button>
        </div>
      )}

      {/* Questions List (Frosted Dynamic Cards) */}
      <div className="space-y-3.5">
        {filteredQuestions.map((q, idx) => {
          const isSelected = !!selections[q.id];
          const currentAnswer = selections[q.id]?.answer;
          const isExpanded = expandedId === q.id;

          return (
            <motion.div 
              key={q.id} 
              layout
              className={`rounded-3xl border-2 transition-all duration-200 overflow-hidden shadow-sm ${
                isSelected 
                  ? 'bg-gradient-to-br from-sky-50/95 to-cyan-50/80 dark:from-slate-800 dark:to-sky-950/40 border-sky-300 dark:border-sky-700 ring-2 ring-sky-200/60 dark:ring-sky-900/40 shadow-md' 
                  : 'bg-white/95 dark:bg-slate-800/90 border-slate-200/90 dark:border-slate-700/90 hover:border-sky-300 hover:shadow-md'
              }`}
            >
              {/* Question Header */}
              <div 
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
                className="p-4 sm:p-5 flex items-center justify-between gap-3.5 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className={`w-8 h-8 rounded-2xl flex items-center justify-center text-xs font-black shrink-0 shadow-sm transition-all ${
                    isSelected
                      ? 'bg-gradient-to-br from-sky-400 to-cyan-500 text-white shadow-sky-200'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {idx + 1}
                  </span>
                  
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-snug">
                      {q.text}
                    </h3>
                    
                    {isSelected && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-sky-900 dark:text-sky-200 bg-sky-100/90 dark:bg-sky-950/70 px-2.5 py-1 rounded-xl border border-sky-200 dark:border-sky-800 shadow-sm">
                          <span className="text-cyan-600 dark:text-cyan-400">✓ အဖြေ:</span>
                          <span className="font-bold truncate max-w-[200px] sm:max-w-sm">{currentAnswer}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isSelected && (
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={(e) => handleDeselect(e, q.id)}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900 cursor-pointer transition-all"
                      title="Remove this question"
                    >
                      Remove
                    </motion.button>
                  )}

                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-transform duration-200 ${
                    isExpanded ? 'rotate-180 bg-sky-100 text-sky-600 dark:bg-slate-700 dark:text-sky-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                  }`}>
                    ▼
                  </span>
                </div>
              </div>

              {/* Options Accordion Body */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-sky-100 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-900/50 p-4 sm:p-5"
                  >
                    <div className="text-xs font-extrabold text-sky-700 dark:text-sky-300 mb-2.5 flex items-center gap-1.5">
                      <span>သင့်အဖြေအမှန်ကို ရွေးချယ်ပါ (Select your real answer):</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {q.options.map((opt, optIdx) => {
                        const letter = OPTION_LETTERS[optIdx] || '•';
                        const isOptActive = currentAnswer === opt;

                        return (
                          <motion.button
                            key={opt}
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => handleSelectAnswer(q, opt)}
                            className={`p-3.5 rounded-2xl font-bold text-xs sm:text-sm text-left flex items-center gap-3 transition-all cursor-pointer shadow-sm ${
                              isOptActive
                                ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-md border-t border-white/50 scale-[1.01]'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-sky-300 hover:bg-sky-50/50 dark:hover:bg-slate-700'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-black shrink-0 shadow-sm ${
                              isOptActive 
                                ? 'bg-white text-sky-600' 
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                            }`}>
                              {letter}
                            </span>
                            <span className="truncate">{opt}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Sticky Bottom Confirm Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t-2 border-sky-200/80 dark:border-slate-800 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="text-left hidden sm:block">
            <div className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
              {selectedCount === 10 ? 'မေးခွန်း ၁၀ ခု ရွေးပြီးပါပြီ (Ready to Play)' : `${10 - selectedCount} ခု ထပ်ရွေးပေးပါ`}
            </div>
            <div className="text-base font-black text-slate-800 dark:text-slate-100 font-['Fredoka']">
              {selectedCount} / 10 ရွေးချယ်ပြီး
            </div>
          </div>

          <motion.button 
            whileHover={selectedCount === 10 ? { scale: 1.02 } : {}}
            whileTap={selectedCount === 10 ? { scale: 0.98 } : {}}
            type="button"
            disabled={selectedCount !== 10}
            onClick={handleSubmit}
            className={`w-full sm:w-auto sm:min-w-[320px] py-4 px-8 rounded-2xl font-black text-sm sm:text-base tracking-wide transition-all shadow-md ${
              selectedCount === 10
                ? 'nomo-button-3d-primary text-white cursor-pointer hover:scale-[1.02] shadow-sky-400/40'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-300 dark:border-slate-700'
            }`}
          >
            {selectedCount === 10 
              ? 'အဖြေ ၁၀ ခု အတည်ပြုမည် ➔' 
              : `မေးခွန်း ${10 - selectedCount} ခု ထပ်ရွေးပေးပါ`}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default QuestionSelection;