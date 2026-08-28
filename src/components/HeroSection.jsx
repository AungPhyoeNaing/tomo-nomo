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
        className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-6 px-2"
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
            className="relative mx-auto w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full object-cover shadow-2xl border-4 border-white tomo-bounce cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 ring-4 ring-red-400/50" 
          />
        </div>
        
        <div className="space-y-2 sm:space-y-2.5">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/85 dark:bg-slate-800/90 border border-red-200/80 dark:border-rose-900/60 text-red-600 dark:text-red-300 text-[10px] sm:text-xs font-bold tracking-wide shadow-sm backdrop-blur-sm">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span>Tomo Destiny & Chemistry Matcher</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 tracking-tight font-['Fredoka'] leading-tight sm:leading-tight">
            Tomo's Destiny Matcher
          </h1>
          <p className="text-xs sm:text-base md:text-lg text-red-700 dark:text-red-300 font-semibold max-w-xl mx-auto leading-relaxed px-2">
            တိုမို (Tomo) က နှစ်ယောက်လုံးရဲ့ စိတ်နေစိတ်ထားနဲ့ အချင်းချင်း ဆက်နွယ်နေမှုကို အသေးစိတ် ကြည့်ပေးမယ်နော်
          </p>
        </div>

        <div className="pt-2 sm:pt-4">
          <button 
            type="button" 
            onClick={() => jumpToPage('page-inputs')} 
            className="tomo-button-3d-primary w-full xs:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-white font-extrabold text-xs sm:text-base inline-flex items-center justify-center gap-2 sm:gap-2.5 cursor-pointer shadow-xl active:translate-y-1 transition-all min-h-[48px]"
          >
            <span>Enter Soul Information ➔</span>
          </button>
        </div>
      </motion.div>
    </section>
  );
}

export default HeroSection;
