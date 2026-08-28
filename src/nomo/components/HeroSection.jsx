import React from 'react';
import { motion } from 'framer-motion';

const nomoWavingVideo = '/nomo-main.mp4';

function NomoHeroSection({ onScrollToForm }) {
  return (
    <section className="w-full max-w-3xl mx-auto text-center space-y-6 pt-4 pb-8">
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
        className="space-y-6"
      >
        {/* 3D Animated Waving Nomo Avatar with Frost Halo */}
        <div className="relative inline-block">
          <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 opacity-50 blur-xl animate-pulse-glow"></div>
          <video 
            id="nomoHeroImg" 
            src={nomoWavingVideo} 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="relative mx-auto w-32 h-32 md:w-36 md:h-36 rounded-full object-cover shadow-2xl border-4 border-white dark:border-slate-800 nomo-bounce cursor-pointer hover:scale-105 transition-all duration-300 ring-4 ring-sky-400/40" 
          />
        </div>
        
        {/* Title & Clean Badge */}
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/90 border border-sky-200/80 dark:border-sky-800/80 text-sky-700 dark:text-sky-300 text-xs font-bold tracking-wide shadow-sm backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
            <span>Nomo Friendship Chemistry Analyzer</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-600 tracking-tight font-['Fredoka']">
            Nomo's Friendship Quiz
          </h1>
          
          <p className="text-base md:text-lg text-slate-700 dark:text-slate-200 font-medium max-w-xl mx-auto leading-relaxed">
            နိုမို (Nomo) က မင်းတို့ သူငယ်ချင်းနှစ်ယောက်ရဲ့ connection ဘယ်လောက်ကောင်းလဲဆိုတာကို မေးခွန်းတွေနဲ့ တိုက်ရိုက် စစ်ဆေးပေးမယ်
          </p>
        </div>

        {/* Clean Feature Matrix Chips without messy emojis */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
          <span className="px-3.5 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-sky-200/70 dark:border-slate-700 text-sky-800 dark:text-sky-200 text-xs font-bold shadow-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            <span>180+ Viral Burmese Questions</span>
          </span>
          <span className="px-3.5 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-cyan-200/70 dark:border-slate-700 text-cyan-800 dark:text-cyan-200 text-xs font-bold shadow-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>Real-Time 2P Live Sync</span>
          </span>
          <span className="px-3.5 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-blue-200/70 dark:border-slate-700 text-blue-800 dark:text-blue-200 text-xs font-bold shadow-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            <span>Chemistry Radar & Dynamic Roast</span>
          </span>
        </div>

        {/* CTA Button */}
        <div className="pt-2">
          <button 
            type="button" 
            onClick={onScrollToForm} 
            className="nomo-button-3d-primary px-8 py-4 rounded-2xl text-white font-extrabold text-sm sm:text-base inline-flex items-center gap-2.5 cursor-pointer shadow-xl hover:scale-105 transition-all"
          >
            <span>Start Friendship Challenge ➔</span>
          </button>
        </div>
      </motion.div>
    </section>
  );
}

export default NomoHeroSection;
