import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { calculateDetailedMetricsBreakdown } from '../utils/astrology';

function MatchResult({ result, p1Name, p2Name, relType, mood, jumpToPage }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let currentScore = 0;
    const targetScore = Math.min(100, Math.max(0, Math.round(result.chemistry_score || 85)));
    
    const interval = setInterval(() => {
      currentScore += 1;
      setAnimatedScore(currentScore);
      if (currentScore >= targetScore) {
        clearInterval(interval);
      }
    }, 15);

    return () => clearInterval(interval);
  }, [result]);

  const circumference = 283;
  const offset = circumference - (animatedScore / 100) * circumference;

  const breakdown = result.p1Secret && result.p2Secret ? calculateDetailedMetricsBreakdown(result.p1Secret, result.p2Secret, relType) : [];
  const p1 = result.p1Secret || {};
  const p2 = result.p2Secret || {};

  return (
    <>
      {/* PAGE 1: MATCH GAUGE & METRIC BREAKDOWNS */}
      <section id="page-gauge" className="page-section">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, staggerChildren: 0.15 }}
          viewport={{ once: true, margin: "-50px" }}
          className="max-w-3xl mx-auto w-full space-y-5"
        >
          <div className="tomo-card-gold rounded-[36px] p-6 sm:p-8 text-center flex flex-col items-center gap-4 relative overflow-hidden shadow-2xl">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className={`text-xs font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm ${
                relType === 'Couple' 
                  ? 'text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-600/60' 
                  : 'text-rose-900 dark:text-rose-200 bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-600/60'
              }`}>
                {relType === 'Couple' ? '💖 Romantic Couple Mode' : '🌟 Best Friends Destiny Mode'}
              </div>
              <div className="text-xs font-extrabold uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-slate-800 text-rose-700 dark:text-rose-200 border border-rose-300 dark:border-slate-700 shadow-sm">
                {mood === 'Playful' ? '😜 Playful & Sassy Tone' : (mood === 'Mystic' ? '🔮 Mystic & Cosmic Tone' : '🌸 Sweet & Cute Tone')}
              </div>
            </div>
            
            {/* Score Ring */}
            <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90 filter drop-shadow-md" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8" className="text-red-100/60 dark:text-slate-800/90" fill="transparent" />
                <circle 
                  cx="50" cy="50" r="45" 
                  stroke="url(#scoreGradient)" 
                  strokeWidth="8" 
                  className="transition-all duration-300 ease-out" 
                  strokeDasharray="283" 
                  strokeDashoffset={offset} 
                  strokeLinecap="round" 
                  fill="transparent" 
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl sm:text-5xl font-black text-orange-600 dark:text-amber-400 font-['Fredoka']">{animatedScore}%</span>
                <span className="text-[10px] text-red-500 dark:text-rose-300 font-extrabold uppercase tracking-wider">Match Resonance</span>
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-red-700 dark:text-rose-200 font-['Fredoka'] max-w-xl leading-tight">
              {result.relationship_title || "တစ်ယောက်ရဲ့ အဆိုးကို တစ်ယောက်က အေးဆေး ညှိပေးနိုင်တဲ့ အံဝင်ခွင်ကျ ရင်းနှီးမှု"}
            </h3>

            {/* 5-Metric Breakdown Bars */}
            <div className="w-full max-w-lg grid gap-2.5 pt-3 border-t border-orange-200/60 dark:border-slate-700/80 text-left">
              {breakdown.map((metric, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                    <span>{metric.label}</span>
                    <span className="text-red-600 dark:text-rose-400 font-black">{metric.score}%</span>
                  </div>
                  <div className="w-full bg-red-100/80 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className={`h-2 rounded-full bg-gradient-to-r ${metric.color} transition-all duration-1000`} style={{ width: `${metric.score}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center pt-1">
            <button onClick={() => jumpToPage('page-readings')} className="tomo-chip-3d px-7 py-3 rounded-full text-xs sm:text-sm font-black text-red-700 dark:text-red-300 inline-flex items-center gap-2 cursor-pointer shadow-md">
              <span>အသေးစိတ် စရိုက်လက္ခဏာ ဖတ်ရှုမည် (Continue to Deep Readings) ➔</span>
            </button>
          </div>
        </motion.div>
      </section>

      {/* PAGE 2: TOMO'S IN-DEPTH CHARACTER PROFILES */}
      <section id="page-readings" className="page-section">
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true, margin: "-50px" }}
          className="max-w-4xl mx-auto w-full space-y-6"
        >
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-red-600 dark:text-red-400 font-['Fredoka']">
              Tomo's Deep Character Profiles
            </h2>
            <p className="text-xs sm:text-sm text-red-600 dark:text-red-300 font-bold max-w-xl mx-auto">
              စိတ်နေသဘောထား၊ အတွင်းစိတ်ခံစားချက်နှင့် လူမှုဆက်ဆံရေး အသေးစိတ် သုံးသပ်ချက်
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Person 1 Profile Card */}
            <div className="tomo-card rounded-[32px] p-6 space-y-4 shadow-xl text-left flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3 border-b border-red-200 dark:border-slate-700 pb-3">
                  <img src="/icon_3d_p1.jpg" alt="P1" className="w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-red-300" />
                  <div>
                    <span className="font-extrabold text-red-600 dark:text-red-400 text-lg font-['Fredoka'] block">
                      {p1Name} ရဲ့ အတွင်းစိတ်နှင့် စရိုက်လက္ခဏာ
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                      Personal Soul Insight
                    </span>
                  </div>
                </div>

                {/* Reading Body */}
                <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal space-y-3 max-h-[420px] overflow-y-auto pr-2 whitespace-pre-wrap">
                  {result.tomo_deep_reading_p1}
                </div>
              </div>
            </div>

            {/* Person 2 Profile Card */}
            <div className="tomo-card rounded-[32px] p-6 space-y-4 shadow-xl text-left flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3 border-b border-orange-200 dark:border-slate-700 pb-3">
                  <img src="/icon_3d_p2.jpg" alt="P2" className="w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-orange-300" />
                  <div>
                    <span className="font-extrabold text-orange-600 dark:text-orange-400 text-lg font-['Fredoka'] block">
                      {p2Name} ရဲ့ အတွင်းစိတ်နှင့် စရိုက်လက္ခဏာ
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                      Personal Soul Insight
                    </span>
                  </div>
                </div>

                {/* Reading Body */}
                <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal space-y-3 max-h-[420px] overflow-y-auto pr-2 whitespace-pre-wrap">
                  {result.tomo_deep_reading_p2}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center pt-2">
            <button onClick={() => jumpToPage('page-synergy')} className="tomo-chip-3d px-7 py-3 rounded-full text-xs sm:text-sm font-black text-red-700 dark:text-red-300 inline-flex items-center gap-2 cursor-pointer shadow-md">
              <span>ဓာတ်ပေါင်းစပ်မှုနှင့် လျှို့ဝှက်အကြံပြုချက် ဖတ်ရှုမည် (Dynamic Synergy) ➔</span>
            </button>
          </div>
        </motion.div>
      </section>

      {/* PAGE 3: DYNAMIC SYNERGY & SECRET ADVICE */}
      <section id="page-synergy" className="page-section">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, staggerChildren: 0.2 }}
          viewport={{ once: true, margin: "-50px" }}
          className="max-w-4xl mx-auto w-full space-y-6"
        >
          {/* Dynamic Synergy Overview */}
          <div className="tomo-card-rose rounded-[32px] p-6 sm:p-7 space-y-3 shadow-xl text-left">
            <h4 className="font-extrabold text-rose-600 dark:text-rose-300 text-lg flex items-center gap-2.5 font-['Fredoka']">
              <img src="/icon_3d_heart.jpg" alt="Heart" className="w-6 h-6 rounded-full object-cover shadow-sm" />
              <span>နှစ်ယောက်ကြားက ဓာတ်ပေါင်းစပ်မှုနှင့် ရင်းနှီးမှု အခြေအနေ (Dynamic Synergy)</span>
            </h4>
            <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal whitespace-pre-wrap space-y-2.5">
              {result.tomo_dynamic_insight}
            </div>
          </div>

          {/* Strengths & Challenges Grid */}
          <div className="grid md:grid-cols-2 gap-6 text-left">
            {/* Strengths */}
            <div className="tomo-card rounded-[32px] p-6 space-y-3.5 border-2 border-red-200 dark:border-slate-700 shadow-lg">
              <div className="flex items-center gap-2.5 border-b border-red-200 dark:border-slate-700 pb-2.5">
                <img src="/icon_3d_p2.jpg" alt="Strength" className="w-6 h-6 rounded-full object-cover shadow-sm" />
                <h4 className="font-extrabold text-red-600 dark:text-red-400 text-base font-['Fredoka']">
                  နှစ်ယောက်သား၏ အဓိက အားသာချက်များ (Core Strengths)
                </h4>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                {result.tomo_strengths?.map((str, i) => (
                  <li key={i} className="flex gap-2.5 text-slate-800 dark:text-slate-200 leading-snug">
                    <span className="text-red-500 font-bold shrink-0">✨</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Challenges */}
            <div className="tomo-card rounded-[32px] p-6 space-y-3.5 border-2 border-orange-200 dark:border-slate-700 shadow-lg">
              <div className="flex items-center gap-2.5 border-b border-orange-200 dark:border-slate-700 pb-2.5">
                <img src="/icon_3d_p1.jpg" alt="Challenge" className="w-6 h-6 rounded-full object-cover shadow-sm" />
                <h4 className="font-extrabold text-orange-600 dark:text-orange-400 text-base font-['Fredoka']">
                  အချင်းချင်း ညှိယူရမည့် အချက်များ (Growth Areas)
                </h4>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                {result.tomo_challenges?.map((chl, i) => (
                  <li key={i} className="flex gap-2.5 text-slate-800 dark:text-slate-200 leading-snug">
                    <span className="text-orange-500 font-bold shrink-0">🌸</span>
                    <span>{chl}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tomo's Secret Advice */}
          <div className="tomo-card-gold rounded-[32px] p-6 sm:p-7 space-y-3 border-2 border-orange-400/60 shadow-xl text-left">
            <h4 className="font-extrabold text-orange-800 dark:text-orange-300 text-base sm:text-lg flex items-center gap-2.5 font-['Fredoka']">
              <img src="/icon_3d_crown.jpg" alt="Crown" className="w-6 h-6 rounded-full object-cover shadow-sm" />
              <span>Tomo ရဲ့ အထူးလျှို့ဝှက် လမ်းညွှန်ချက် (Secret Guidance)</span>
            </h4>
            <div className="text-xs sm:text-sm text-slate-900 dark:text-orange-100 leading-relaxed font-semibold whitespace-pre-wrap space-y-2">
              {result.tomo_secret_advice}
            </div>
          </div>

          {/* Action Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <button onClick={() => navigate('/nomo')} className="tomo-button-3d-primary px-8 py-3.5 text-white font-extrabold rounded-2xl text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105 transition-all" style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
              <span>🎮 Play Nomo Friendship Quiz! ➔</span>
            </button>

            <button onClick={() => jumpToPage('page-hero')} className="tomo-chip-3d px-6 py-3 rounded-2xl text-xs font-black text-slate-700 dark:text-slate-300 inline-flex items-center gap-1.5 cursor-pointer shadow-sm">
              <span>↑ Return to Top</span>
            </button>
          </div>

          <footer className="text-center text-xs text-red-500 font-bold pt-4 border-t border-red-200/40 dark:border-slate-800">
            <p>🌸 Handcrafted with Love for Tomo's Destiny Showcase 💖</p>
          </footer>
        </motion.div>
      </section>
    </>
  );
}

export default MatchResult;
