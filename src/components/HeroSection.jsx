import React from 'react';
import { motion } from 'framer-motion';

function HeroSection({ jumpToPage }) {
  return (
    <section id="page-hero" className="page-section">
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
        viewport={{ once: true, margin: "-50px" }}
        className="max-w-3xl mx-auto text-center space-y-6"
      >
        <div className="relative inline-block">
          <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-red-400 via-rose-400 to-orange-300 opacity-75 blur-md animate-pulse"></div>
          <video 
            id="tomoHeroImg" 
            src="/tomo-main.mp4" 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="relative mx-auto w-32 h-32 md:w-36 md:h-36 rounded-full object-cover shadow-2xl border-4 border-white tomo-bounce cursor-pointer hover:scale-110 transition-all duration-300 ring-4 ring-red-400/50" 
          />
        </div>
        
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/90 border border-red-200/80 dark:border-rose-900/60 text-red-600 dark:text-red-300 text-xs font-bold tracking-wide shadow-sm backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span>Tomo Destiny & Chemistry Matcher</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 tracking-tight font-['Fredoka']">
            Tomo's Destiny Matcher
          </h1>
          <p className="text-base md:text-lg text-red-700 dark:text-red-300 font-semibold max-w-xl mx-auto">
            တိုမို (Tomo) က နှစ်ယောက်လုံးရဲ့ စိတ်ဓာတ်နဲ့ ရေစက်လေးကို အသေးစိတ် ကြည့်ပေးမယ်နော်
          </p>
        </div>

        <div className="pt-4">
          <button 
            type="button" 
            onClick={() => jumpToPage('page-inputs')} 
            className="tomo-button-3d-primary px-8 py-4 rounded-2xl text-white font-extrabold text-sm sm:text-base inline-flex items-center gap-2.5 cursor-pointer shadow-xl hover:scale-105 transition-all"
          >
            <span>Enter Soul Information ➔</span>
          </button>
        </div>
      </motion.div>
    </section>
  );
}

export default HeroSection;
