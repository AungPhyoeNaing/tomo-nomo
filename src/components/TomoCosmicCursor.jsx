import React, { useEffect, useRef } from 'react';

const TRAIL_COUNT = 24;

/**
 * Volumetric 3D Interactive Cursor with Massive Celestial Star Trails for Tomo.
 * Features a real-time rendered 3D Crystal Dart pointer with dynamic physical banking/tilting,
 * and a dense, sparkling cosmic star trail that cascades stardust as you move.
 * 100% GPU-accelerated with 0 React re-renders.
 */
function TomoCosmicCursor() {
  const pointerRef = useRef(null);
  const trailRefs = useRef([]);
  const posRef = useRef({
    x: -100,
    y: -100,
    prevX: -100,
    prevY: -100,
    vx: 0,
    vy: 0,
    tiltX: 0,
    tiltY: 0,
    bankZ: 0,
    isHovering: false,
    isClicking: false,
    isVisible: false,
    lastSpawnDist: 0
  });

  // Particle pool for massive star trails
  const particlesRef = useRef(
    Array.from({ length: TRAIL_COUNT }, () => ({
      x: -100,
      y: -100,
      vx: 0,
      vy: 0,
      size: 16,
      rotation: 0,
      rotSpeed: 0,
      life: 0,
      maxLife: 30,
      alive: false,
      type: 'star-4'
    }))
  );

  useEffect(() => {
    // Only disable on pure touch-only devices with NO mouse/trackpad pointer
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches || window.matchMedia('(any-pointer: fine)').matches;
    const isPureTouchOnly = window.matchMedia('(pointer: coarse)').matches && !hasFinePointer;
    if (isPureTouchOnly) return;

    // Dynamically activate cursor: none on the document root
    document.documentElement.classList.add('custom-cursor-active');

    let animId = 0;
    let isAnimating = false;
    const pointer = pointerRef.current;
    if (!pointer) return;

    let nextParticleIdx = 0;

    const scheduleRender = () => {
      if (!isAnimating) {
        isAnimating = true;
        animId = requestAnimationFrame(render);
      }
    };

    const spawnStar = (x, y, speedMult = 1, isBurst = false) => {
      const p = particlesRef.current[nextParticleIdx];
      const angle = isBurst ? Math.random() * Math.PI * 2 : Math.random() * Math.PI * 2;
      const speed = isBurst ? (2 + Math.random() * 4) : (0.5 + Math.random() * 2) * speedMult;

      p.x = x + (Math.random() - 0.5) * 12;
      p.y = y + (Math.random() - 0.5) * 12;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed + (isBurst ? 0 : 0.4); // gentle downward stardust gravity
      p.size = 12 + Math.random() * 14;
      p.rotation = Math.random() * 360;
      p.rotSpeed = (Math.random() - 0.5) * 8;
      p.life = 0;
      p.maxLife = 20 + Math.floor(Math.random() * 16);
      p.alive = true;

      const rand = Math.random();
      p.type = rand > 0.6 ? 'star-8' : rand > 0.25 ? 'star-4' : 'mote';

      nextParticleIdx = (nextParticleIdx + 1) % TRAIL_COUNT;
    };

    const handlePointerMove = (e) => {
      const p = posRef.current;
      const prevX = p.x;
      const prevY = p.y;
      
      p.x = e.clientX;
      p.y = e.clientY;

      if (!p.isVisible) {
        p.isVisible = true;
        pointer.style.opacity = '1';
      } else {
        p.vx = (e.clientX - prevX) * 0.4;
        p.vy = (e.clientY - prevY) * 0.4;

        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        p.lastSpawnDist += dist;

        // Spawn multiple sparkling stars per step for a dense, massive trail
        if (p.lastSpawnDist > 8) {
          spawnStar(e.clientX, e.clientY, 1.2);
          if (dist > 15) spawnStar(e.clientX - dx * 0.5, e.clientY - dy * 0.5, 1.0);
          p.lastSpawnDist = 0;
        }
      }

      // Check if hovering over clickable element
      const target = e.target;
      const isInteractive = target && (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('.cursor-pointer') ||
        target.closest('.tomo-chip-3d') ||
        target.closest('.tomo-button-3d-primary') ||
        target.closest('.tomo-button-3d-secondary') ||
        target.getAttribute('role') === 'button'
      );
      p.isHovering = !!isInteractive;
      scheduleRender();
    };

    const handlePointerDown = () => {
      posRef.current.isClicking = true;
      // Massive supernova burst on click (8 stars)
      const p = posRef.current;
      if (p.isVisible) {
        for (let i = 0; i < 6; i++) {
          spawnStar(p.x, p.y, 2, true);
        }
      }
      scheduleRender();
    };

    const handlePointerUp = () => {
      posRef.current.isClicking = false;
      scheduleRender();
    };

    const handlePointerEnter = (e) => {
      posRef.current.isVisible = true;
      posRef.current.x = e.clientX;
      posRef.current.y = e.clientY;
      if (pointer) pointer.style.opacity = '1';
      scheduleRender();
    };

    const handlePointerLeave = () => {
      posRef.current.isVisible = false;
      if (pointer) pointer.style.opacity = '0';
      particlesRef.current.forEach((particle, index) => {
        particle.alive = false;
        const el = trailRefs.current[index];
        if (el) el.style.opacity = '0';
      });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.addEventListener('mouseenter', handlePointerEnter, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave, { passive: true });

    const render = () => {
      const p = posRef.current;
      let hasActiveParticles = false;
      if (p.isVisible) {
        // Calculate dynamic 3D tilt & banking angles based on movement
        const targetTiltX = Math.max(-28, Math.min(28, -p.vy * 1.2));
        const targetTiltY = Math.max(-28, Math.min(28, p.vx * 1.2));
        const targetBankZ = Math.max(-18, Math.min(18, p.vx * 0.8));

        p.tiltX += (targetTiltX - p.tiltX) * 0.2;
        p.tiltY += (targetTiltY - p.tiltY) * 0.2;
        p.bankZ += (targetBankZ - p.bankZ) * 0.2;

        // Decay velocities
        p.vx *= 0.85;
        p.vy *= 0.85;

        // --- 1. Position & 3D Transform the 3D Pointer Head ---
        const pointerScale = p.isClicking ? 0.82 : p.isHovering ? 1.15 : 1;
        const pressDepth = p.isClicking ? -12 : 0;
        
        pointer.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) perspective(700px) rotateX(${p.tiltX}deg) rotateY(${p.tiltY}deg) rotateZ(${p.bankZ}deg) translateZ(${pressDepth}px) scale(${pointerScale})`;

        // --- 2. Update & Render Star Trail Particles ---
        for (let i = 0; i < TRAIL_COUNT; i++) {
          const pt = particlesRef.current[i];
          const el = trailRefs.current[i];
          if (!el) continue;

          if (pt.alive) {
            pt.x += pt.vx;
            pt.y += pt.vy;
            pt.rotation += pt.rotSpeed;
            pt.life += 1;

            const progress = pt.life / pt.maxLife;
            if (progress >= 1) {
              pt.alive = false;
              el.style.opacity = '0';
            } else {
              hasActiveParticles = true;
              const opacity = (1 - progress) * 0.95;
              const scale = (1 - progress * 0.45);
              el.style.transform = `translate3d(${pt.x}px, ${pt.y}px, 0) translate(-50%, -50%) rotate(${pt.rotation.toFixed(1)}deg) scale(${scale.toFixed(2)})`;
              el.style.opacity = opacity.toFixed(2);
            }
          }
        }
      }

      const pointerIsSettling = Math.abs(p.vx) > 0.01 || Math.abs(p.vy) > 0.01 || Math.abs(p.tiltX) > 0.01 || Math.abs(p.tiltY) > 0.01 || Math.abs(p.bankZ) > 0.01;
      if (p.isVisible && (hasActiveParticles || pointerIsSettling)) {
        animId = requestAnimationFrame(render);
      } else {
        isAnimating = false;
        animId = 0;
      }
    };

    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mouseenter', handlePointerEnter);
      document.removeEventListener('mouseleave', handlePointerLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden select-none" aria-hidden="true">
      {/* 🌟 Massive Sparkling Star Trail Particles */}
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => (trailRefs.current[i] = el)}
          className="fixed top-0 left-0 pointer-events-none opacity-0 will-change-transform flex items-center justify-center"
        >
          {i % 3 === 0 ? (
            /* 8-Pointed Radiant Solar Star */
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 40 40" 
              className="text-amber-300 dark:text-amber-200 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]"
            >
              <path 
                d="M20 0 L23 15 L38 20 L23 25 L20 40 L17 25 L2 20 L17 15 Z" 
                fill="currentColor" 
              />
              <path 
                d="M20 7 L24 16 L33 20 L24 24 L20 33 L16 24 L7 20 L16 16 Z" 
                fill="#ffffff" 
              />
            </svg>
          ) : i % 3 === 1 ? (
            /* 4-Pointed Celestial Star */
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              className="text-rose-400 dark:text-rose-300 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.9)]"
            >
              <path 
                d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" 
                fill="currentColor" 
              />
              <circle cx="12" cy="12" r="2.5" fill="#ffffff" />
            </svg>
          ) : (
            /* Glowing Stardust Diamond Mote */
            <div 
              className="w-3.5 h-3.5 rounded-full"
              style={{
                background: 'radial-gradient(circle, #ffffff 0%, #fde047 50%, #f43f5e 100%)',
                boxShadow: '0 0 10px rgba(251, 191, 36, 0.95)'
              }}
            />
          )}
        </div>
      ))}

      {/* 🌟 Hyper-Tactile Volumetric 3D Pointer Head */}
      <div
        ref={pointerRef}
        className="fixed top-0 left-0 opacity-0 will-change-transform pointer-events-none"
        style={{
          transformOrigin: 'top left',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Volumetric 3D Beveled Dart Container */}
        <div className="relative -top-1 -left-1 w-8 h-8 filter drop-shadow-[0_6px_8px_rgba(0,0,0,0.35)]">
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 32 32" 
            fill="none" 
            className="w-full h-full transform -rotate-12"
          >
            <defs>
              <linearGradient id="facetLight" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="30%" stopColor="#fda4af" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>

              <linearGradient id="facetDark" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#e11d48" />
                <stop offset="50%" stopColor="#9f1239" />
                <stop offset="100%" stopColor="#4c0519" />
              </linearGradient>

              <radialGradient id="gemGlow" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#fde68a" />
                <stop offset="80%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </radialGradient>
            </defs>

            <polygon 
              points="4,3 24,14 15,17 11,27" 
              fill="rgba(0,0,0,0.4)" 
              transform="translate(1, 2)"
            />

            <polygon 
              points="4,3 24,14 15,17" 
              fill="url(#facetLight)" 
              stroke="#ffffff" 
              strokeWidth="0.75"
            />

            <polygon 
              points="4,3 15,17 11,27" 
              fill="url(#facetDark)" 
              stroke="#ffffff" 
              strokeWidth="0.75"
            />

            <line 
              x1="4" 
              y1="3" 
              x2="15" 
              y2="17" 
              stroke="#ffffff" 
              strokeWidth="1.6" 
              strokeLinecap="round"
            />

            <circle 
              cx="11" 
              cy="11" 
              r="2.8" 
              fill="url(#gemGlow)" 
              stroke="#ffffff" 
              strokeWidth="1"
            />
            <circle 
              cx="10" 
              cy="10" 
              r="0.8" 
              fill="#ffffff" 
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default React.memo(TomoCosmicCursor);
