import React, { useMemo, useRef } from 'react';
import { useInteractiveParticles } from '../utils/useInteractiveParticles';

/**
 * TOMO Background: Cosmic Astrological Architecture with Interactive Cursor Toss Physics.
 * Features grand 3D planets, sacred 8-pointed solar starbursts, and ascending stardust.
 * Supports cursor fling/toss repulsion with zero React re-renders and 0% idle CPU impact.
 */
function TomoBackgroundParticles() {
  const containerRef = useRef(null);
  useInteractiveParticles(containerRef);

  const cosmicStars = useMemo(() => [
    { id: 1, left: '8%', top: '22%', size: 28, duration: '12s', delay: '0s', opacity: 0.9, color: 'rose', mass: 0.8 },
    { id: 2, left: '86%', top: '15%', size: 32, duration: '15s', delay: '2s', opacity: 0.85, color: 'gold', mass: 0.9 },
    { id: 3, left: '80%', top: '78%', size: 30, duration: '14s', delay: '3.5s', opacity: 0.8, color: 'rose', mass: 0.85 },
    { id: 4, left: '6%', top: '85%', size: 26, duration: '16s', delay: '1s', opacity: 0.75, color: 'purple', mass: 0.8 },
    { id: 5, left: '30%', top: '12%', size: 22, duration: '10s', delay: '4s', opacity: 0.9, color: 'gold', mass: 0.7 },
    { id: 6, left: '65%', top: '50%', size: 24, duration: '13s', delay: '5.5s', opacity: 0.85, color: 'rose', mass: 0.75 },
    { id: 7, left: '18%', top: '58%', size: 20, duration: '11s', delay: '2.5s', opacity: 0.8, color: 'gold', mass: 0.7 }
  ], []);

  const stardustMotes = useMemo(() => [
    { id: 'm1', left: '14%', top: '38%', size: 10, duration: '8s', delay: '0s', opacity: 0.9 },
    { id: 'm2', left: '72%', top: '28%', size: 12, duration: '9s', delay: '1.5s', opacity: 0.85 },
    { id: 'm3', left: '42%', top: '85%', size: 11, duration: '10s', delay: '3s', opacity: 0.75 },
    { id: 'm4', left: '94%', top: '62%', size: 9, duration: '7s', delay: '4.5s', opacity: 0.9 },
    { id: 'm5', left: '5%', top: '68%', size: 12, duration: '9.5s', delay: '2s', opacity: 0.8 },
    { id: 'm6', left: '58%', top: '15%', size: 10, duration: '8.5s', delay: '5s', opacity: 0.85 }
  ], []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
      {/* Warm Ambient Nebula Fields (Rose, Amber, Cosmic Violet) */}
      <div className="absolute -top-32 -left-32 w-[36rem] h-[36rem] rounded-full bg-gradient-to-br from-rose-300/40 via-red-300/30 to-pink-200/20 dark:from-rose-950/60 dark:via-red-950/40 dark:to-purple-950/30 blur-3xl tomo-aurora-pulse"></div>
      <div className="absolute top-1/3 -right-36 w-[32rem] h-[32rem] rounded-full bg-gradient-to-bl from-amber-200/35 via-rose-200/25 to-orange-100/20 dark:from-amber-950/50 dark:via-rose-950/30 dark:to-slate-950/30 blur-3xl tomo-aurora-pulse" style={{ animationDelay: '3.5s' }}></div>
      <div className="absolute -bottom-32 left-1/3 w-[38rem] h-[38rem] rounded-full bg-gradient-to-tr from-purple-200/35 via-pink-200/25 to-rose-100/20 dark:from-purple-950/50 dark:via-pink-950/30 dark:to-slate-950/30 blur-3xl tomo-aurora-pulse" style={{ animationDelay: '6s' }}></div>

      {/* 🟡 PLANET 1: Interactive Golden Sun / Destiny Planet (Top Right) */}
      <div className="absolute top-16 right-[6%] md:right-[10%] hidden sm:block opacity-85 pointer-events-auto">
        <div 
          data-interactive="true"
          data-mass="2.2"
          data-radius="200"
          data-spring="0.035"
          data-damping="0.88"
          className="relative flex items-center justify-center cursor-grab active:cursor-grabbing transform-gpu tomo-planet-float-1"
        >
          <div 
            className="w-24 h-24 md:w-28 md:h-28 rounded-full shadow-2xl relative z-10"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #fffbeb 0%, #fde68a 25%, #f59e0b 60%, #b45309 90%, #78350f 100%)',
              boxShadow: '0 0 40px rgba(245, 158, 11, 0.45), inset -8px -8px 24px rgba(0,0,0,0.6), inset 5px 5px 12px rgba(255,255,255,0.95)'
            }}
          >
            <div className="absolute inset-0 rounded-full opacity-30 border-y-2 border-amber-950/40"></div>
          </div>
        </div>
      </div>

      {/* 🌸 PLANET 2: Interactive Rose Quartz Celestial Planet with Moon (Mid-Left) */}
      <div className="absolute top-1/2 left-[4%] md:left-[6%] -translate-y-1/2 hidden sm:block opacity-85 pointer-events-auto">
        <div 
          data-interactive="true"
          data-mass="1.8"
          data-radius="180"
          data-spring="0.04"
          data-damping="0.88"
          className="relative flex items-center justify-center cursor-grab active:cursor-grabbing transform-gpu tomo-planet-float-2"
        >
          <div 
            className="w-20 h-20 md:w-24 md:h-24 rounded-full shadow-2xl relative z-10"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #fff1f2 0%, #fecdd3 30%, #f43f5e 65%, #9f1239 90%, #4c0519 100%)',
              boxShadow: '0 0 35px rgba(244, 63, 94, 0.45), inset -6px -6px 18px rgba(0,0,0,0.55), inset 4px 4px 10px rgba(255,255,255,0.95)'
            }}
          />
          <div 
            className="absolute w-32 md:w-36 h-32 md:h-36 rounded-full border border-dashed border-rose-300/40 dark:border-rose-400/25 tomo-orbit-rotate"
            style={{ animationDuration: '30s' }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-tr from-amber-300 to-white shadow-[0_0_10px_rgba(251,191,36,0.8)] border border-white"></div>
          </div>
        </div>
      </div>

      {/* 🔮 PLANET 3: Interactive Astral Amethyst Cosmic Orb (Bottom Right) */}
      <div className="absolute bottom-16 right-[18%] hidden md:block opacity-80 pointer-events-auto">
        <div 
          data-interactive="true"
          data-mass="1.5"
          data-radius="160"
          data-spring="0.045"
          data-damping="0.88"
          className="relative flex items-center justify-center cursor-grab active:cursor-grabbing transform-gpu tomo-planet-float-3"
        >
          <div 
            className="w-16 h-16 md:w-20 md:h-20 rounded-full shadow-2xl relative z-10"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #faf5ff 0%, #e9d5ff 30%, #a855f7 65%, #6b21a8 90%, #3b0764 100%)',
              boxShadow: '0 0 30px rgba(168, 85, 247, 0.45), inset -5px -5px 16px rgba(0,0,0,0.5), inset 3px 3px 8px rgba(255,255,255,0.9)'
            }}
          />
        </div>
      </div>

      {/* Interactive 8-Pointed Solar/Astrological Sacred Starbursts */}
      {cosmicStars.map((s) => (
        <div
          key={s.id}
          className="absolute tomo-particle-float filter drop-shadow-md transform-gpu flex items-center justify-center"
          style={{
            left: s.left,
            top: s.top,
            opacity: s.opacity,
            animationDuration: s.duration,
            animationDelay: s.delay
          }}
        >
          <div
            data-interactive="true"
            data-mass={s.mass}
            data-radius="140"
            data-spring="0.05"
            data-damping="0.86"
            className="cursor-pointer transform-gpu"
          >
            <svg 
              width={s.size} 
              height={s.size} 
              viewBox="0 0 40 40" 
              className={
                s.color === 'rose' 
                  ? 'text-rose-500 dark:text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]' 
                  : s.color === 'gold' 
                  ? 'text-amber-400 dark:text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' 
                  : 'text-purple-400 dark:text-purple-300 drop-shadow-[0_0_8px_rgba(192,132,252,0.6)]'
              }
            >
              <path 
                d="M20 0 L23 15 L38 20 L23 25 L20 40 L17 25 L2 20 L17 15 Z" 
                fill="currentColor" 
              />
              <path 
                d="M20 7 L24 16 L33 20 L24 24 L20 33 L16 24 L7 20 L16 16 Z" 
                fill="rgba(255,255,255,0.7)" 
              />
            </svg>
          </div>
        </div>
      ))}

      {/* Interactive Ascending Warm Stardust Motes */}
      {stardustMotes.map((m) => (
        <div
          key={m.id}
          className="absolute tomo-stardust-pulse rounded-full transform-gpu flex items-center justify-center"
          style={{
            left: m.left,
            top: m.top,
            animationDuration: m.duration,
            animationDelay: m.delay,
            opacity: m.opacity
          }}
        >
          <div
            data-interactive="true"
            data-mass="0.5"
            data-radius="110"
            data-spring="0.06"
            data-damping="0.85"
            className="rounded-full transform-gpu"
            style={{
              width: `${m.size}px`,
              height: `${m.size}px`,
              background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(251,191,36,0.8) 50%, rgba(244,63,94,0) 100%)',
              boxShadow: '0 0 10px rgba(251, 191, 36, 0.8)'
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default React.memo(TomoBackgroundParticles);
