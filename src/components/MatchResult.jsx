import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { calculateDetailedMetricsBreakdown, getScoreResonanceTier } from '../utils/astrology';
import confetti from 'canvas-confetti';

function MatchResult({ result, p1Name, p2Name, relType, mood, jumpToPage }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const numericScore = Number(result.chemistry_score);
    const targetScore = Math.min(100, Math.max(0, Number.isFinite(numericScore) ? Math.round(numericScore) : 85));
    const startTime = performance.now();
    const duration = 900;
    let animId = 0;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(easeProgress * targetScore));

      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      }
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [result]);

  const circumference = 283;
  const offset = circumference - (animatedScore / 100) * circumference;

  const breakdown = result.p1Secret && result.p2Secret ? calculateDetailedMetricsBreakdown(result.p1Secret, result.p2Secret, relType) : [];
  const p1 = result.p1Secret || {};
  const p2 = result.p2Secret || {};
  const resonanceTier = getScoreResonanceTier(Number(result.chemistry_score) || 85);

  const handleDownloadCard = () => {
    setIsExporting(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 1600;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background Deep Radial & Linear Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 1600);
      bgGrad.addColorStop(0, '#1e1b4b');
      bgGrad.addColorStop(0.35, '#311042');
      bgGrad.addColorStop(0.7, '#4c0519');
      bgGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 1600);

      // Gold Decorative Border
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
      ctx.lineWidth = 6;
      ctx.strokeRect(36, 36, 1128, 1528);

      // Header Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px "Fredoka", "Quicksand", "Padauk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("🌸 Tomo's Destiny Matcher 💖", 600, 105);

      // Mode & Mood Banner
      ctx.fillStyle = '#fda4af';
      ctx.font = 'bold 24px "Quicksand", "Padauk", sans-serif';
      const modeText = `${relType === 'Couple' ? '💖 Romantic Couple Destiny' : '🌟 Best Friends Destiny'} • ${mood} Mood Tone`;
      ctx.fillText(modeText, 600, 155);

      // Names Badge Box
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(100, 185, 1000, 100, 24);
      } else {
        ctx.rect(100, 185, 1000, 100);
      }
      ctx.fill();
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 40px "Fredoka", "Padauk", sans-serif';
      ctx.fillText(`${p1Name}   ✨   ${p2Name}`, 600, 250);

      // Score Circular Gauge
      const centerX = 600;
      const centerY = 450;
      const radius = 115;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 18;
      ctx.stroke();

      const scoreVal = Number(result.chemistry_score) || 85;
      const endAngle = -Math.PI / 2 + (scoreVal / 100) * (Math.PI * 2);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, -Math.PI / 2, endAngle);
      const arcGrad = ctx.createLinearGradient(centerX - radius, centerY, centerX + radius, centerY);
      arcGrad.addColorStop(0, '#f59e0b');
      arcGrad.addColorStop(0.5, '#ec4899');
      arcGrad.addColorStop(1, '#ef4444');
      ctx.strokeStyle = arcGrad;
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 74px "Fredoka", sans-serif';
      ctx.fillText(`${scoreVal}%`, centerX, centerY + 24);
      ctx.fillStyle = '#fca5a5';
      ctx.font = 'bold 18px "Quicksand", sans-serif';
      ctx.fillText('MATCH RESONANCE', centerX, centerY + 62);

      // Relationship Title
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 28px "Padauk", "Quicksand", sans-serif';
      const relTitle = result.relationship_title || "တစ်ယောက်ရဲ့ အဆိုးကို တစ်ယောက်က အေးဆေး ညှိပေးနိုင်တဲ့ အံဝင်ခွင်ကျ ရင်းနှီးမှု";
      ctx.fillText(relTitle, 600, 625);

      // 5-Metric Breakdown Box
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(100, 670, 1000, 360, 24);
      } else {
        ctx.rect(100, 670, 1000, 360);
      }
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Fredoka", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('5-PILLAR ASTROLOGICAL SYNERGY BREAKDOWN', 140, 715);

      const metricsList = breakdown.length ? breakdown : [
        { label: '✨ Western Zodiac Synergy', score: 92 },
        { label: '☀️ Mahabote Planetary Synergy', score: 88 },
        { label: '🐉 Chinese Zodiac Trine', score: 95 },
        { label: '🪵 5 Elements Cycle Balance', score: 90 },
        { label: '🔢 Numerology Destiny Resonance', score: 86 }
      ];

      metricsList.forEach((m, idx) => {
        const barY = 760 + idx * 52;
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 18px "Padauk", "Quicksand", sans-serif';
        ctx.fillText(m.label, 140, barY);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#fca5a5';
        ctx.fillText(`${m.score}%`, 1060, barY);
        ctx.textAlign = 'left';

        // Bar background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        if (ctx.roundRect) {
          ctx.roundRect(140, barY + 8, 920, 12, 6);
        } else {
          ctx.fillRect(140, barY + 8, 920, 12);
        }
        ctx.fill();

        // Bar fill
        ctx.fillStyle = '#f43f5e';
        const fillWidth = (m.score / 100) * 920;
        if (ctx.roundRect) {
          ctx.roundRect(140, barY + 8, fillWidth, 12, 6);
        } else {
          ctx.fillRect(140, barY + 8, fillWidth, 12);
        }
        ctx.fill();
      });

      // Tomo Guidance Box
      ctx.fillStyle = 'rgba(245, 158, 11, 0.14)';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(100, 1065, 1000, 395, 24);
      } else {
        ctx.rect(100, 1065, 1000, 395);
      }
      ctx.fill();
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 24px "Fredoka", "Padauk", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText("👑 Tomo's Secret Guidance (တိုမို ၏ အထူးလမ်းညွှန်ချက်)", 140, 1115);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'normal 20px "Padauk", "Quicksand", sans-serif';
      const adviceText = (result.tomo_secret_advice || '').replace(/[\r\n]+/g, ' ');
      const words = adviceText.split(' ');
      let currentLine = '';
      let lineY = 1165;
      for (const w of words) {
        if ((currentLine + ' ' + w).length > 56) {
          ctx.fillText(currentLine, 140, lineY);
          lineY += 36;
          currentLine = w;
          if (lineY > 1410) break;
        } else {
          currentLine = currentLine ? currentLine + ' ' + w : w;
        }
      }
      if (currentLine && lineY <= 1410) {
        ctx.fillText(currentLine, 140, lineY);
      }

      // Footer stamp
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 18px "Quicksand", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("🌸 Handcrafted with Love • Tomo's Destiny Matcher 💖", 600, 1520);

      // Download
      const link = document.createElement('a');
      link.download = `Tomo_Destiny_Reading_${p1Name}_${p2Name}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {
      console.error('Failed to export destiny card:', e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      {/* PAGE 1: MATCH GAUGE & METRIC BREAKDOWNS */}
      <section id="page-gauge" className="page-section">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, staggerChildren: 0.15 }}
          viewport={{ once: true, margin: "-50px" }}
          className="max-w-3xl mx-auto w-full space-y-4 sm:space-y-5 px-1 sm:px-2"
        >
          <div className="tomo-card-gold rounded-2xl sm:rounded-[36px] p-4 sm:p-8 text-center flex flex-col items-center gap-3.5 sm:gap-4 relative overflow-hidden shadow-2xl">
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              <div className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-wider sm:tracking-widest px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-sm ${
                relType === 'Couple' 
                  ? 'text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-600/60' 
                  : 'text-rose-900 dark:text-rose-200 bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-600/60'
              }`}>
                {relType === 'Couple' ? '💖 Romantic Couple Mode' : '🌟 Best Friends Destiny Mode'}
              </div>
              <div className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider sm:tracking-widest px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-rose-50 dark:bg-slate-800 text-rose-700 dark:text-rose-200 border border-rose-300 dark:border-slate-700 shadow-sm">
                {mood === 'Playful' ? '😜 Playful Tone' : (mood === 'Mystic' ? '🔮 Mystic Tone' : '🌸 Sweet Tone')}
              </div>
            </div>
            
            {/* Score Ring */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 flex items-center justify-center">
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
                <span className="text-3xl sm:text-4xl md:text-5xl font-black text-orange-600 dark:text-amber-400 font-['Fredoka']">{animatedScore}%</span>
                <span className="text-[9px] sm:text-[10px] text-red-500 dark:text-rose-300 font-extrabold uppercase tracking-wider">Match Resonance</span>
              </div>
            </div>

            {/* Resonance Tier Badge */}
            <div className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border border-amber-300/80 dark:border-amber-600/60 text-amber-900 dark:text-amber-200 shadow-sm inline-flex items-center gap-1.5">
              <span>✨</span>
              <span>{resonanceTier.levelMm}</span>
            </div>

            <h3 className="text-base sm:text-2xl md:text-3xl font-extrabold text-red-700 dark:text-rose-200 font-['Fredoka'] max-w-xl leading-snug px-1">
              {result.relationship_title || "တစ်ယောက်ရဲ့ အဆိုးကို တစ်ယောက်က အေးဆေး ညှိပေးနိုင်တဲ့ အံဝင်ခွင်ကျ ရင်းနှီးမှု"}
            </h3>

            {/* 5-Metric Breakdown Bars */}
            <div className="w-full max-w-lg grid gap-2 sm:gap-2.5 pt-2.5 sm:pt-3 border-t border-orange-200/60 dark:border-slate-700/80 text-left">
              {breakdown.map((metric, idx) => (
                <div key={idx} className="flex flex-col gap-0.5 sm:gap-1">
                  <div className="flex justify-between text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-200">
                    <span className="truncate pr-2">{metric.label}</span>
                    <span className="text-red-600 dark:text-rose-400 font-black shrink-0">{metric.score}%</span>
                  </div>
                  <div className="w-full bg-red-100/80 dark:bg-slate-800 rounded-full h-1.5 sm:h-2 overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${metric.color} transition-all duration-1000`} style={{ width: `${metric.score}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col xs:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-1 w-full">
            <button 
              type="button"
              disabled={isExporting}
              onClick={handleDownloadCard} 
              className="tomo-button-3d-secondary w-full xs:w-auto px-5 sm:px-6 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-black text-rose-600 dark:text-rose-300 inline-flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-all min-h-[44px]"
            >
              <span>{isExporting ? '⏳ Generating Card...' : '📸 Download Destiny Card (PNG)'}</span>
            </button>

            <button 
              type="button"
              onClick={() => jumpToPage('page-readings')} 
              className="tomo-chip-3d w-full xs:w-auto px-5 sm:px-7 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-black text-red-700 dark:text-red-300 inline-flex items-center justify-center gap-2 cursor-pointer shadow-md min-h-[44px]"
            >
              <span>အသေးစိတ် စရိုက်လက္ခဏာ ဖတ်ရှုမည် (Continue) ➔</span>
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
          className="max-w-4xl mx-auto w-full space-y-4 sm:space-y-6 px-1 sm:px-2"
        >
          <div className="text-center space-y-1 sm:space-y-1.5">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-red-600 dark:text-red-400 font-['Fredoka']">
              Tomo's Deep Character Profiles
            </h2>
            <p className="text-[11px] sm:text-sm text-red-600 dark:text-red-300 font-bold max-w-xl mx-auto px-2">
              စိတ်နေသဘောထား၊ အတွင်းစိတ်ခံစားချက်နှင့် လူမှုဆက်ဆံရေး အသေးစိတ် သုံးသပ်ချက်
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            {/* Person 1 Profile Card */}
            <div className="tomo-card rounded-2xl sm:rounded-[32px] p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-xl text-left flex flex-col justify-between">
              <div className="space-y-2.5 sm:space-y-3">
                <div className="flex items-center gap-2.5 sm:gap-3 border-b border-red-200 dark:border-slate-700 pb-2.5 sm:pb-3">
                  <img src="/icon_3d_p1.jpg" alt="P1" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shadow-sm ring-2 ring-red-300 shrink-0" />
                  <div>
                    <span className="font-extrabold text-red-600 dark:text-red-400 text-base sm:text-lg font-['Fredoka'] block leading-tight">
                      {p1Name} ရဲ့ အတွင်းစိတ်နှင့် စရိုက်
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                      Personal Soul Insight
                    </span>
                  </div>
                </div>

                {/* Celestial & Numerology Badges */}
                <div className="flex flex-wrap gap-1 sm:gap-1.5 py-0.5 sm:py-1">
                  {p1.western && (
                    <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 shadow-sm">
                      ☀️ Sun: {p1.western}
                    </span>
                  )}
                  {p1.moonSign && (
                    <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-300 shadow-sm">
                      🌙 Moon: {p1.moonSign}
                    </span>
                  )}
                  {p1.venusSign && (
                    <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-300 shadow-sm">
                      💖 Venus: {p1.venusSign}
                    </span>
                  )}
                  {p1.lifePathNumber && (
                    <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 shadow-sm">
                      🔢 Life Path: #{p1.lifePathNumber}
                    </span>
                  )}
                </div>

                {/* Reading Body */}
                <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal space-y-2.5 sm:space-y-3 max-h-[340px] sm:max-h-[420px] overflow-y-auto pr-1.5 sm:pr-2 whitespace-pre-wrap overscroll-contain">
                  {result.tomo_deep_reading_p1}
                </div>
              </div>
            </div>

            {/* Person 2 Profile Card */}
            <div className="tomo-card rounded-2xl sm:rounded-[32px] p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-xl text-left flex flex-col justify-between">
              <div className="space-y-2.5 sm:space-y-3">
                <div className="flex items-center gap-2.5 sm:gap-3 border-b border-orange-200 dark:border-slate-700 pb-2.5 sm:pb-3">
                  <img src="/icon_3d_p2.jpg" alt="P2" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shadow-sm ring-2 ring-orange-300 shrink-0" />
                  <div>
                    <span className="font-extrabold text-orange-600 dark:text-orange-400 text-base sm:text-lg font-['Fredoka'] block leading-tight">
                      {p2Name} ရဲ့ အတွင်းစိတ်နှင့် စရိုက်
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                      Personal Soul Insight
                    </span>
                  </div>
                </div>

                {/* Celestial & Numerology Badges */}
                <div className="flex flex-wrap gap-1 sm:gap-1.5 py-0.5 sm:py-1">
                  {p2.western && (
                    <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 shadow-sm">
                      ☀️ Sun: {p2.western}
                    </span>
                  )}
                  {p2.moonSign && (
                    <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-300 shadow-sm">
                      🌙 Moon: {p2.moonSign}
                    </span>
                  )}
                  {p2.venusSign && (
                    <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-300 shadow-sm">
                      💖 Venus: {p2.venusSign}
                    </span>
                  )}
                  {p2.lifePathNumber && (
                    <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 shadow-sm">
                      🔢 Life Path: #{p2.lifePathNumber}
                    </span>
                  )}
                </div>

                {/* Reading Body */}
                <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal space-y-2.5 sm:space-y-3 max-h-[340px] sm:max-h-[420px] overflow-y-auto pr-1.5 sm:pr-2 whitespace-pre-wrap overscroll-contain">
                  {result.tomo_deep_reading_p2}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center pt-2">
            <button onClick={() => jumpToPage('page-synergy')} className="tomo-chip-3d w-full xs:w-auto px-5 sm:px-7 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-black text-red-700 dark:text-red-300 inline-flex items-center justify-center gap-2 cursor-pointer shadow-md min-h-[44px]">
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
          className="max-w-4xl mx-auto w-full space-y-4 sm:space-y-6 px-1 sm:px-2"
        >
          {/* Dynamic Synergy Overview */}
          <div className="tomo-card-rose rounded-2xl sm:rounded-[32px] p-4 sm:p-7 space-y-2.5 sm:space-y-3 shadow-xl text-left">
            <h4 className="font-extrabold text-rose-600 dark:text-rose-300 text-sm sm:text-lg flex items-center gap-2 sm:gap-2.5 font-['Fredoka']">
              <img src="/icon_3d_heart.jpg" alt="Heart" className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover shadow-sm shrink-0" />
              <span>နှစ်ယောက်ကြားက ဓာတ်ပေါင်းစပ်မှုနှင့် ရင်းနှီးမှု အခြေအနေ (Dynamic Synergy)</span>
            </h4>
            <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal whitespace-pre-wrap space-y-2">
              {result.tomo_dynamic_insight}
            </div>
          </div>

          {/* Strengths & Challenges Grid */}
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 text-left">
            {/* Strengths */}
            <div className="tomo-card rounded-2xl sm:rounded-[32px] p-4 sm:p-6 space-y-2.5 sm:space-y-3.5 border-2 border-red-200 dark:border-slate-700 shadow-lg">
              <div className="flex items-center gap-2 sm:gap-2.5 border-b border-red-200 dark:border-slate-700 pb-2 sm:pb-2.5">
                <img src="/icon_3d_p2.jpg" alt="Strength" className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover shadow-sm shrink-0" />
                <h4 className="font-extrabold text-red-600 dark:text-red-400 text-sm sm:text-base font-['Fredoka']">
                  နှစ်ယောက်သား၏ အဓိက အားသာချက်များ (Core Strengths)
                </h4>
              </div>
              <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm">
                {result.tomo_strengths?.map((str, i) => (
                  <li key={i} className="flex gap-2 sm:gap-2.5 text-slate-800 dark:text-slate-200 leading-snug">
                    <span className="text-red-500 font-bold shrink-0">✨</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Challenges */}
            <div className="tomo-card rounded-2xl sm:rounded-[32px] p-4 sm:p-6 space-y-2.5 sm:space-y-3.5 border-2 border-orange-200 dark:border-slate-700 shadow-lg">
              <div className="flex items-center gap-2 sm:gap-2.5 border-b border-orange-200 dark:border-slate-700 pb-2 sm:pb-2.5">
                <img src="/icon_3d_p1.jpg" alt="Challenge" className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover shadow-sm shrink-0" />
                <h4 className="font-extrabold text-orange-600 dark:text-orange-400 text-sm sm:text-base font-['Fredoka']">
                  အချင်းချင်း ညှိယူရမည့် အချက်များ (Growth Areas)
                </h4>
              </div>
              <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm">
                {result.tomo_challenges?.map((chl, i) => (
                  <li key={i} className="flex gap-2 sm:gap-2.5 text-slate-800 dark:text-slate-200 leading-snug">
                    <span className="text-orange-500 font-bold shrink-0">🌸</span>
                    <span>{chl}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tomo's Secret Advice */}
          <div className="tomo-card-gold rounded-2xl sm:rounded-[32px] p-4 sm:p-7 space-y-2.5 sm:space-y-3 border-2 border-orange-400/60 shadow-xl text-left">
            <h4 className="font-extrabold text-orange-800 dark:text-orange-300 text-sm sm:text-lg flex items-center gap-2 sm:gap-2.5 font-['Fredoka']">
              <img src="/icon_3d_crown.jpg" alt="Crown" className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover shadow-sm shrink-0" />
              <span>Tomo ရဲ့ အထူးလျှို့ဝှက် လမ်းညွှန်ချက် (Secret Guidance)</span>
            </h4>
            <div className="text-xs sm:text-sm text-slate-900 dark:text-orange-100 leading-relaxed font-semibold whitespace-pre-wrap space-y-2">
              {result.tomo_secret_advice}
            </div>
          </div>

          {/* Action Navigation */}
          <div className="flex flex-col xs:flex-row flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 pt-2 w-full">
            <button 
              type="button"
              disabled={isExporting}
              onClick={handleDownloadCard} 
              className="tomo-button-3d-secondary w-full xs:w-auto px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl text-xs sm:text-sm font-black text-rose-600 dark:text-rose-300 inline-flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-all min-h-[46px]"
            >
              <span>{isExporting ? '⏳ Generating Card...' : '📸 Download Destiny Card (PNG)'}</span>
            </button>

            <button onClick={() => navigate('/nomo')} className="tomo-button-3d-primary w-full xs:w-auto px-6 sm:px-8 py-3 sm:py-3.5 text-white font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-105 active:scale-95 transition-all min-h-[46px]" style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
              <span>🎮 Play Nomo Friendship Quiz! ➔</span>
            </button>

            <button onClick={() => jumpToPage('page-hero')} className="tomo-chip-3d w-full xs:w-auto px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl text-xs font-black text-slate-700 dark:text-slate-300 inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-sm min-h-[46px]">
              <span>↑ Return to Top</span>
            </button>
          </div>

          <footer className="text-center text-[11px] sm:text-xs text-red-500 font-bold pt-3 sm:pt-4 border-t border-red-200/40 dark:border-slate-800">
            <p>🌸 Handcrafted with Love for Tomo's Destiny Showcase 💖</p>
          </footer>
        </motion.div>
      </section>
    </>
  );
}

export default MatchResult;
