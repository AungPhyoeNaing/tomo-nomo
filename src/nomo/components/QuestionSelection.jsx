import React, { useState, useMemo, useEffect } from 'react';
import socket from '../socket';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import GameTicketFrame from './GameTicketFrame';

const CATEGORIES = [
  { id: 'all', label: 'All Topics', icon: '✨', range: null },
  { id: 'favs', label: 'Food & Life (စားသောက်/ဘဝ)', icon: '🍜', range: [1, 45] },
  { id: 'dating', label: 'Crush & Dating (အချစ်ရေး)', icon: '💌', range: [46, 90] },
  { id: 'social', label: 'Memes & Viral (အခွီများ)', icon: '🔥', range: [91, 135] },
  { id: 'deep', label: 'Roasts & Secrets (ချောက်တွန်း)', icon: '🎭', range: [136, 180] }
];

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'];

// Helper to determine question category by ID
const getQuestionCategory = (id) => {
  if (id >= 1 && id <= 45) return { label: 'Food & Life', icon: '🍜' };
  if (id >= 46 && id <= 90) return { label: 'Dating & Love', icon: '💌' };
  if (id >= 91 && id <= 135) return { label: 'Memes & Viral', icon: '🔥' };
  if (id >= 136 && id <= 180) return { label: 'Roasts & Secrets', icon: '🎭' };
  return { label: 'General', icon: '✨' };
};

const QuestionSelection = ({ roomId, questions = [] }) => {
  const safeQuestions = useMemo(() => {
    return Array.isArray(questions) ? questions : [];
  }, [questions]);

  const [selections, setSelections] = useState({});
  const [activeModalQuestion, setActiveModalQuestion] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [filterView, setFilterView] = useState('all'); // 'all' | 'unselected' | 'selected'
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCount = Object.keys(selections).length;
  const isComplete = selectedCount === 10;

  // Mini celebratory confetti when 10/10 is completed
  useEffect(() => {
    if (selectedCount === 10 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.85 },
        colors: ['#38bdf8', '#0ea5e9', '#06b6d4', '#bae6fd', '#ffffff']
      });
    }
  }, [selectedCount]);

  // Keyboard Escape listener for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeModalQuestion) {
        setActiveModalQuestion(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModalQuestion]);

  const handleSelectAnswer = (question, option) => {
    const newSelections = { ...selections };
    
    if (selectedCount >= 10 && !newSelections[question.id]) {
      alert("မေးခွန်း ၁၀ ခု ပြည့်သွားပါပြီ။ အသစ်ရွေးလိုပါက တစ်ခုကို ပြန်ဖြုတ်ပေးပါ။");
      return;
    }

    newSelections[question.id] = { ...question, answer: option };
    setSelections(newSelections);

    // Close the modal smoothly after answer is chosen
    setTimeout(() => {
      setActiveModalQuestion(null);
    }, 180);
  };

  const handleDeselect = (e, questionId) => {
    e.stopPropagation();
    const newSelections = { ...selections };
    delete newSelections[questionId];
    setSelections(newSelections);
  };

  // Quick Random Pick 10 Questions
  const handleQuickPick = () => {
    const shuffled = [...safeQuestions].sort(() => 0.5 - Math.random());
    const picked10 = shuffled.slice(0, 10);
    const newMap = {};
    picked10.forEach(q => {
      const defaultAnswer = q.options && q.options.length ? q.options[0] : '';
      newMap[q.id] = { ...q, answer: selections[q.id]?.answer || defaultAnswer };
    });
    setSelections(newMap);
    setActiveModalQuestion(null);
  };

  const handleClearAll = () => {
    if (window.confirm("ရွေးထားသော မေးခွန်းအားလုံးကို ရှင်းထုတ်မှာ သေချာပါသလား?")) {
      setSelections({});
      setActiveModalQuestion(null);
    }
  };

  const handleSubmit = () => {
    if (!socket.connected) return;
    if (selectedCount !== 10) {
      alert(`ကျေးဇူးပြု၍ မေးခွန်း ၁၀ ခု အတိအကျ ရွေးပေးပါ။ (လက်ရှိ: ${selectedCount} ခု)`);
      return;
    }
    socket.emit('submit_selection', { 
      roomId, 
      selectedQuestions: Object.values(selections) 
    });
    // The server confirms acceptance with waiting_for_opponent/start_quiz.
  };

  const filteredQuestions = useMemo(() => {
    let list = safeQuestions;
    if (activeCategory !== 'all') {
      const cat = CATEGORIES.find(c => c.id === activeCategory);
      if (cat && cat.range) {
        list = list.filter(q => q.id >= cat.range[0] && q.id <= cat.range[1]);
      }
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter(q => q.text.toLowerCase().includes(query) || (q.options || []).some(o => o.toLowerCase().includes(query)));
    }
    if (filterView === 'unselected') {
      list = list.filter(q => !selections[q.id]);
    } else if (filterView === 'selected') {
      list = list.filter(q => !!selections[q.id]);
    }
    return list;
  }, [safeQuestions, activeCategory, filterView, searchQuery, selections]);

  const selectedList = Object.values(selections);

  // Modal Next / Prev Helpers
  const currentModalIndex = activeModalQuestion 
    ? safeQuestions.findIndex(q => q.id === activeModalQuestion.id) 
    : -1;

  const handleModalNext = (e) => {
    e.stopPropagation();
    if (currentModalIndex >= 0 && currentModalIndex < safeQuestions.length - 1) {
      setActiveModalQuestion(safeQuestions[currentModalIndex + 1]);
    }
  };

  const handleModalPrev = (e) => {
    e.stopPropagation();
    if (currentModalIndex > 0) {
      setActiveModalQuestion(safeQuestions[currentModalIndex - 1]);
    }
  };

  return (
    <div className="w-full space-y-6 pb-36 text-left">
      {/* Fun Header & Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="nomo-card rounded-[32px] p-6 sm:p-7 relative overflow-hidden shadow-xl text-center space-y-3.5"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100/90 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-700 text-sky-800 dark:text-sky-200 text-xs font-black shadow-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>Step 1 • Pick Your 10 Truths (မေးခွန်း ၁၀ ခု ရွေးချယ်ပါ)</span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100 font-['Fredoka'] tracking-tight">
          မင်းရဲ့ အမှန်တရား ၁၀ ခုကို ရွေးချယ်ပါ 🎯
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium max-w-lg mx-auto leading-relaxed">
          မေးခွန်းတစ်ခုစီကို နှိပ်ပြီး <strong>Pop-up Modal</strong> တွင် သင့်အဖြေအမှန်ကို ရွေးချယ်ပါ။ သင့်သူငယ်ချင်းက မင်းဘာရွေးခဲ့လဲဆိုတာကို လိုက်ခန့်မှန်းရမှာဖြစ်ပါတယ်!
        </p>

        {/* Quick Action Chips (Quick Pick Random & Clear) */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleQuickPick}
            className="nomo-chip-3d px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <span>🎲 Quick Random 10</span>
            <span className="text-[10px] bg-sky-200/80 dark:bg-sky-800 text-sky-900 dark:text-sky-200 px-1.5 py-0.5 rounded-md font-black">Auto</span>
          </motion.button>

          {selectedCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleClearAll}
              className="px-3.5 py-2 rounded-2xl bg-white/70 hover:bg-rose-50 dark:bg-slate-800/70 dark:hover:bg-rose-950/40 text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-300 border border-slate-200/80 dark:border-slate-700 text-xs font-bold transition-all cursor-pointer shadow-sm backdrop-blur-md"
            >
              ↺ Reset ({selectedCount})
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Sticky Interactive Progress Hub & Filter Strip */}
      <div className="sticky top-[58px] z-30 nomo-card rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
        {/* Top Hub Bar: Counter & Filter Switchers */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                Progress:
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-black transition-all shadow-sm flex items-center gap-1.5 ${
                isComplete 
                  ? 'bg-gradient-to-r from-cyan-400 to-sky-500 text-white animate-bounce ring-2 ring-sky-300' 
                  : 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
              }`}>
                <span>{selectedCount} / 10</span>
                <span>{isComplete ? '🎉 Ready!' : 'Chosen'}</span>
              </span>
            </div>
          </div>

          {/* Quick Filter View Segment (All vs Chosen) */}
          <div className="flex items-center gap-1 p-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-xs">
            <button
              type="button"
              aria-pressed={filterView === 'all'}
              onClick={() => setFilterView('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filterView === 'all'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All ({safeQuestions.length})
            </button>
            <button
              type="button"
              aria-pressed={filterView === 'selected'}
              onClick={() => setFilterView('selected')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                filterView === 'selected'
                  ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <span>Chosen</span>
              <span className="bg-sky-200 dark:bg-sky-900 text-sky-900 dark:text-sky-200 px-1.5 py-0.2 rounded-full text-[10px] font-black">{selectedCount}</span>
            </button>
          </div>
        </div>

        {/* 10 Interactive Crystal Slot Deck (Clicking pops out modal) */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 pt-0.5">
          {Array.from({ length: 10 }).map((_, slotIdx) => {
            const item = selectedList[slotIdx];
            const isSlotFilled = !!item;
            const isCurrentTarget = slotIdx === selectedCount;

            return (
              <motion.button
                key={slotIdx}
                data-filled={isSlotFilled}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                type="button"
                onClick={() => {
                  if (item) {
                    setActiveModalQuestion(item);
                  } else {
                    const nextUnselected = safeQuestions.find(q => !selections[q.id]);
                    if (nextUnselected) setActiveModalQuestion(nextUnselected);
                  }
                }}
                className={`h-11 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden shadow-sm ${
                  isSlotFilled
                    ? 'bg-gradient-to-tr from-sky-500 to-cyan-400 text-white border border-white/60 shadow-sky-200 dark:shadow-none'
                    : isCurrentTarget
                    ? 'bg-sky-50/80 dark:bg-slate-800/80 border-2 border-dashed border-sky-400 dark:border-sky-500 text-sky-600 dark:text-sky-400 animate-pulse'
                    : 'bg-white/40 dark:bg-slate-800/40 border-2 border-dashed border-slate-200/80 dark:border-slate-700/80 text-slate-400 dark:text-slate-500'
                }`}
                title={item ? `Slot ${slotIdx + 1}: ${item.text} (Click to open modal)` : `Slot ${slotIdx + 1} (Empty - Click to pick)`}
              >
                <span className="text-[10px] font-black leading-none">
                  {isSlotFilled ? '✓' : slotIdx + 1}
                </span>
                <span className="text-[9px] font-extrabold opacity-90 truncate max-w-[90%] leading-tight mt-0.5">
                  {isSlotFilled ? `Q${slotIdx + 1}` : 'slot'}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Category Filter Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 no-scrollbar text-xs">
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id && filterView === 'all';
            return (
              <motion.button
                key={cat.id}
                aria-pressed={isActive}
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => { setActiveCategory(cat.id); setFilterView('all'); }}
                className={`px-3.5 py-2 rounded-2xl font-extrabold whitespace-nowrap transition-all cursor-pointer shadow-sm flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white border-t border-white/50 shadow-md ring-2 ring-sky-300/50'
                    : 'bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 backdrop-blur-md'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {filteredQuestions.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 nomo-card rounded-3xl p-6 space-y-3 shadow-sm"
        >
          <div className="text-3xl">🔍</div>
          <p className="font-extrabold text-slate-600 dark:text-slate-300 text-sm">No questions found in this category.</p>
          <button
            type="button"
            onClick={() => { setActiveCategory('all'); setFilterView('all'); setSearchQuery(''); }}
            className="nomo-chip-3d px-5 py-2 rounded-full text-xs font-bold cursor-pointer"
          >
            Show All Questions (အားလုံးပြန်ကြည့်မည်)
          </button>
        </motion.div>
      )}

      {/* Questions Grid Cards (Clicking opens popped-out modal) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredQuestions.map((q, idx) => {
          const isSelected = !!selections[q.id];
          const currentAnswer = selections[q.id]?.answer;
          const category = getQuestionCategory(q.id);

          return (
            <motion.div 
              key={q.id} 
              id={`q-card-${q.id}`}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              data-chosen={isSelected}
              onClick={() => setActiveModalQuestion(q)}
              className={`nomo-ticket p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 text-left relative ${
                isSelected 
                  ? 'nomo-card-ice ring-2 ring-sky-300/80 dark:ring-sky-700/80 shadow-lg' 
                  : 'nomo-card hover:border-sky-300'
              }`}
            >
              <GameTicketFrame />
              <div className="space-y-2.5">
                {/* Header Meta Pill */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shadow-sm ${
                      isSelected
                        ? 'bg-gradient-to-br from-sky-400 to-cyan-500 text-white'
                        : 'bg-sky-100 dark:bg-slate-700 text-sky-700 dark:text-sky-300'
                    }`}>
                      {idx + 1}
                    </span>

                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-sky-700 dark:text-sky-300 bg-white/70 dark:bg-sky-950/70 px-2.5 py-0.5 rounded-lg border border-sky-200/80 dark:border-sky-800/60 backdrop-blur-md">
                      <span>{category.icon}</span>
                      <span>{category.label}</span>
                    </span>
                  </div>

                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-cyan-600 dark:text-cyan-400 bg-cyan-100/90 dark:bg-cyan-950/80 px-2.5 py-0.5 rounded-lg border border-cyan-300 dark:border-cyan-800 shadow-sm">
                      ✓ Chosen
                    </span>
                  ) : (
                    <span className="text-[11px] font-extrabold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/40 px-2.5 py-0.5 rounded-lg border border-sky-200/70 dark:border-sky-800/50">
                      + Pick Answer
                    </span>
                  )}
                </div>

                {/* Question Text */}
                <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-snug">
                  {q.text}
                </h3>
              </div>

              {/* Answer Footer or Call to Action */}
              <div className="pt-2.5 border-t border-sky-100/80 dark:border-slate-700/80">
                {isSelected ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-start gap-2 min-w-0">
                      <span className="text-[10px] font-black text-cyan-700 dark:text-cyan-300 uppercase tracking-wider shrink-0 bg-cyan-100/90 dark:bg-cyan-950/90 px-2 py-0.5 rounded-md border border-cyan-300/80 dark:border-cyan-800/80 mt-0.5">
                        Your Truth:
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-snug whitespace-normal break-words flex-1">
                        {currentAnswer}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setActiveModalQuestion(q); }}
                        className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-sky-600 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-slate-800 transition-all cursor-pointer border border-sky-200/80 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60"
                      >
                        Change ✏️
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeselect(e, q.id)}
                        className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/60 transition-all cursor-pointer border border-rose-200/80 dark:border-rose-900/60 bg-white/60 dark:bg-slate-800/60"
                      >
                        Remove ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full text-xs font-bold text-slate-400 dark:text-slate-500">
                    <span>{q.options?.length || 4} choices</span>
                    <span className="text-sky-500 dark:text-sky-400 font-extrabold flex items-center gap-1">
                      Choose Answer ➔
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* POPPED-OUT ANSWER SELECTION MODAL */}
      <AnimatePresence>
        {activeModalQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            {/* Frosted Dark Glass Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalQuestion(null)}
              className="fixed inset-0 bg-slate-950/65 backdrop-blur-xl"
            />

            {/* Popped Out Modal Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.88, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 25 }}
              transition={{ type: "spring", bounce: 0.28, duration: 0.35 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xl max-h-[92vh] nomo-card-ice rounded-[36px] p-5 sm:p-7 shadow-2xl overflow-hidden text-left flex flex-col justify-between gap-5 z-10 my-auto"
            >
              {/* Modal Top Nav Bar */}
              <div className="flex items-center justify-between border-b border-sky-200/80 dark:border-slate-700/80 pb-3.5 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-400 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
                    #{currentModalIndex + 1}
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1 text-[11px] font-extrabold text-sky-700 dark:text-sky-300">
                      <span>{getQuestionCategory(activeModalQuestion.id).icon}</span>
                      <span>{getQuestionCategory(activeModalQuestion.id).label}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                      {currentModalIndex + 1} of {safeQuestions.length} Questions
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selections[activeModalQuestion.id] && (
                    <button
                      type="button"
                      onClick={(e) => handleDeselect(e, activeModalQuestion.id)}
                      className="px-3 py-1 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-100 dark:text-rose-300 dark:hover:bg-rose-950/60 transition-all cursor-pointer"
                    >
                      Remove Pick
                    </button>
                  )}
                  <button 
                    type="button" 
                    onClick={() => setActiveModalQuestion(null)}
                    className="w-8 h-8 rounded-full bg-white/70 dark:bg-slate-800/70 hover:bg-sky-100 dark:hover:bg-slate-700 text-slate-500 hover:text-sky-600 flex items-center justify-center font-bold text-sm transition-all cursor-pointer backdrop-blur-md shadow-sm border border-slate-200 dark:border-slate-700"
                    title="Close (Esc)"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Scrollable Question and Options Area */}
              <div className="overflow-y-auto max-h-[60vh] pr-1.5 space-y-4">
                {/* Question Heading */}
                <div className="space-y-1.5">
                  <span className="text-xs font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">
                    Select your true answer (မင်းရဲ့ အဖြေအမှန်ကို ရွေးပေးပါ):
                  </span>
                  <h2 className="text-lg sm:text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-['Fredoka'] leading-snug whitespace-normal break-words">
                    {activeModalQuestion.text}
                  </h2>
                </div>

                {/* Options List (Full Text Visible & Multi-line Friendly) */}
                <div className="space-y-2.5">
                  {activeModalQuestion.options.map((opt, optIdx) => {
                    const letter = OPTION_LETTERS[optIdx] || '•';
                    const isSelected = selections[activeModalQuestion.id]?.answer === opt;

                    return (
                      <motion.button 
                        key={opt} 
                        whileHover={{ scale: 1.015, y: -1 }}
                        whileTap={{ scale: 0.985 }}
                        type="button" 
                        aria-pressed={isSelected}
                        onClick={() => handleSelectAnswer(activeModalQuestion, opt)}
                        className={`w-full p-4 rounded-2xl font-extrabold text-xs sm:text-sm text-left flex items-start justify-between gap-3.5 transition-all cursor-pointer shadow-md ${
                          isSelected 
                            ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg border-t border-white/60 ring-2 ring-sky-300' 
                            : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-700 dark:text-slate-200 border-2 border-sky-100 dark:border-slate-700 hover:border-sky-300 hover:bg-sky-50/70 dark:hover:bg-slate-700/80'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 shadow-sm transition-all mt-0.5 ${
                            isSelected 
                              ? 'bg-white text-sky-600 shadow-inner' 
                              : 'bg-sky-100 dark:bg-slate-700 text-sky-600 dark:text-sky-300'
                          }`}>
                            {letter}
                          </span>
                          <span className="whitespace-normal break-words leading-relaxed flex-1 text-left pt-0.5 font-bold">
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
              </div>

              {/* Modal Bottom Stepper Nav */}
              <div className="pt-3 border-t border-sky-100/80 dark:border-slate-700/80 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  disabled={currentModalIndex <= 0}
                  onClick={handleModalPrev}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    currentModalIndex > 0 
                      ? 'bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-sky-50 border border-slate-200 dark:border-slate-700' 
                      : 'opacity-40 cursor-not-allowed text-slate-400'
                  }`}
                >
                  <span>⬅️ Previous</span>
                </button>

                <div className="text-xs font-black text-sky-700 dark:text-sky-300">
                  {selectedCount} / 10 Chosen
                </div>

                <button
                  type="button"
                  disabled={currentModalIndex >= safeQuestions.length - 1}
                  onClick={handleModalNext}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    currentModalIndex < safeQuestions.length - 1 
                      ? 'bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-sky-50 border border-slate-200 dark:border-slate-700' 
                      : 'opacity-40 cursor-not-allowed text-slate-400'
                  }`}
                >
                  <span>Next ➔</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Bottom Action Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t-2 border-sky-200/90 dark:border-slate-800 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="text-left hidden sm:block space-y-0.5">
            <div className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
              {isComplete ? '🎉 မေးခွန်း ၁၀ ခု ရွေးပြီးပါပြီ (Ready to Lock Answers)' : `မေးခွန်း ${10 - selectedCount} ခု ထပ်ရွေးပေးပါ`}
            </div>
            <div className="text-base font-black text-slate-800 dark:text-slate-100 font-['Fredoka']">
              {selectedCount} / 10 ရွေးချယ်ပြီး (Chosen)
            </div>
          </div>

          <motion.button 
            whileHover={isComplete ? { scale: 1.02 } : {}}
            whileTap={isComplete ? { scale: 0.98 } : {}}
            type="button"
            disabled={!isComplete}
            onClick={handleSubmit}
            className={`w-full sm:w-auto sm:min-w-[320px] py-4 px-8 rounded-2xl font-black text-sm sm:text-base tracking-wide transition-all shadow-xl flex items-center justify-center gap-2 ${
              isComplete
                ? 'nomo-button-3d-primary text-white cursor-pointer shadow-sky-400/40 hover:scale-[1.02]'
                : 'bg-slate-200/80 dark:bg-slate-800/80 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-300 dark:border-slate-700'
            }`}
          >
            <span>
              {isComplete 
                ? 'အဖြေ ၁၀ ခု အတည်ပြုမည် ➔' 
                : `မေးခွန်း ${10 - selectedCount} ခု ထပ်ရွေးပေးပါ`}
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default QuestionSelection;
