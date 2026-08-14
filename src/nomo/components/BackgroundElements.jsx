import React, { useMemo, useRef } from 'react';
import { useInteractiveParticles } from '../../utils/useInteractiveParticles';

/**
 * NOMO Background: Arctic Frost Crystals & Glacial Ice Shard Architecture with Interactive Cursor Toss Physics.
 * Features 6-fold mathematical ice crystals, 3D hexagonal frost facets,
 * sharp diamond ice prisms, and lateral sub-zero glacial drift.
 * Supports cursor fling/toss repulsion with zero React re-renders and 0% idle CPU impact.
 */
const BackgroundElements = () => {
  const containerRef = useRef(null);
  useInteractiveParticles(containerRef);

  const iceCrystals = useMemo(() => [
    { id: 'c1', left: '8%', top: '15%', size: 36, duration: '14s', delay: '0s', opacity: 0.9, mass: 0.8 },
    { id: 'c2', left: '86%', top: '22%', size: 42, duration: '16s', delay: '1.5s', opacity: 0.85, mass: 0.9 },
    { id: 'c3', left: '76%', top: '70%', size: 32, duration: '13s', delay: '3.5s', opacity: 0.8, mass: 0.85 },
    { id: 'c4', left: '12%', top: '78%', size: 38, duration: '17s', delay: '2s', opacity: 0.85, mass: 0.9 },
    { id: 'c5', left: '34%', top: '10%', size: 28, duration: '11s', delay: '4s', opacity: 0.9, mass: 0.75 },
    { id: 'c6', left: '62%', top: '48%', size: 30, duration: '15s', delay: '5s', opacity: 0.8, mass: 0.8 }
  ], []);

  const hexPrisms = useMemo(() => [
    { id: 'h1', left: '22%', top: '32%', size: 48, duration: '18s', delay: '2.5s', opacity: 0.75, mass: 1.4 },
    { id: 'h2', left: '70%', top: '14%', size: 54, duration: '20s', delay: '0.5s', opacity: 0.7, mass: 1.6 },
    { id: 'h3', left: '46%', top: '82%', size: 42, duration: '16s', delay: '4.5s', opacity: 0.8, mass: 1.3 },
    { id: 'h4', left: '92%', top: '80%', size: 50, duration: '22s', delay: '3s', opacity: 0.65, mass: 1.5 }
  ], []);

  const diamondShards = useMemo(() => [
    { id: 'd1', left: '5%', top: '46%', size: 22, duration: '9s', delay: '1s', opacity: 0.9, mass: 0.6 },
    { id: 'd2', left: '38%', top: '88%', size: 24, duration: '10s', delay: '3s', opacity: 0.85, mass: 0.65 },
    { id: 'd3', left: '94%', top: '38%', size: 20, duration: '8.5s', delay: '5.5s', opacity: 0.95, mass: 0.55 },
    { id: 'd4', left: '55%', top: '18%', size: 22, duration: '11s', delay: '2s', opacity: 0.9, mass: 0.6 }
  ], []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
      {/* Sub-Zero Arctic Auroras (Electric Sky, Frost Cyan, Mint Ice) */}
      <div className="absolute -top-32 -left-32 w-[34rem] h-[34rem] rounded-full bg-sky-300/35 dark:bg-sky-900/50 blur-3xl animate-pulse-glow"></div>
      <div className="absolute top-1/3 -right-36 w-[30rem] h-[30rem] rounded-full bg-cyan-300/30 dark:bg-cyan-900/40 blur-3xl animate-pulse-glow" style={{ animationDelay: '2.5s' }}></div>
      <div className="absolute -bottom-32 left-1/4 w-[36rem] h-[36rem] rounded-full bg-teal-200/30 dark:bg-teal-950/30 blur-3xl animate-pulse-glow" style={{ animationDelay: '4.5s' }}></div>

      {/* Interactive 3D Hexagonal Ice Prism Facets */}
      {hexPrisms.map((h) => (
        <div
          key={h.id}
          className="absolute nomo-frost-particle filter drop-shadow-md transform-gpu"
          style={{
            left: h.left,
            top: h.top,
            opacity: h.opacity,
            animationDuration: h.duration,
            animationDelay: h.delay
          }}
        >
          <div
            data-interactive="true"
            data-mass={h.mass}
            data-radius="170"
            data-spring="0.045"
            data-damping="0.87"
            className="cursor-pointer transform-gpu"
            style={{
              width: `${h.size}px`,
              height: `${h.size}px`,
              clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(186, 230, 253, 0.7) 45%, rgba(6, 182, 212, 0.3) 100%)',
              boxShadow: '0 8px 24px -4px rgba(6, 182, 212, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.9)',
              border: '1.5px solid rgba(255, 255, 255, 0.85)'
            }}
          />
        </div>
      ))}

      {/* Interactive 6-Fold Mathematical Arctic Ice Crystals (Sharp SVG Geometry) */}
      {iceCrystals.map((c) => (
        <div
          key={c.id}
          className="absolute nomo-glacial-drift filter drop-shadow-md transform-gpu flex items-center justify-center"
          style={{
            left: c.left,
            top: c.top,
            opacity: c.opacity,
            animationDuration: c.duration,
            animationDelay: c.delay
          }}
        >
          <div
            data-interactive="true"
            data-mass={c.mass}
            data-radius="150"
            data-spring="0.05"
            data-damping="0.86"
            className="cursor-pointer transform-gpu"
          >
            <svg 
              width={c.size} 
              height={c.size} 
              viewBox="0 0 40 40" 
              className="text-cyan-400 dark:text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
            >
              {/* 6-Ray Symmetrical Glacial Crystal Structure */}
              <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="20" y1="2" x2="20" y2="38" />
                <line x1="4.4" y1="11" x2="35.6" y2="29" />
                <line x1="4.4" y1="29" x2="35.6" y2="11" />
                {/* Chevron Prisms on Rays */}
                <polyline points="15,7 20,2 25,7" fill="none" />
                <polyline points="15,33 20,38 25,33" fill="none" />
                <polyline points="8,17 4.4,11 11,8" fill="none" />
                <polyline points="32,23 35.6,29 29,32" fill="none" />
                <polyline points="8,23 4.4,29 11,32" fill="none" />
                <polyline points="32,17 35.6,11 29,8" fill="none" />
              </g>
              {/* Central Diamond Ice Core */}
              <polygon points="20,15 25,20 20,25 15,20" fill="white" />
            </svg>
          </div>
        </div>
      ))}

      {/* Interactive Floating Sharp Diamond Ice Shards */}
      {diamondShards.map((d) => (
        <div
          key={d.id}
          className="absolute nomo-shard-float transform-gpu flex items-center justify-center"
          style={{
            left: d.left,
            top: d.top,
            opacity: d.opacity,
            animationDuration: d.duration,
            animationDelay: d.delay
          }}
        >
          <div
            data-interactive="true"
            data-mass={d.mass}
            data-radius="130"
            data-spring="0.055"
            data-damping="0.85"
            className="cursor-pointer transform-gpu"
            style={{
              width: `${d.size}px`,
              height: `${d.size * 1.4}px`,
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(224, 242, 254, 0.8) 50%, rgba(14, 165, 233, 0.35) 100%)',
              boxShadow: '0 0 12px rgba(14, 165, 233, 0.6)'
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default React.memo(BackgroundElements);
