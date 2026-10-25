import React, { useEffect, useRef } from 'react';

const TRAIL_COUNT = 24;

/**
 * Volumetric 3D Glacial Dart with Massive Arctic Frost Trail for Nomo.
 * Features a real-time rendered 3D Ice Prism Dart pointer with dynamic physical banking/tilting,
 * and a dense, tumbling trail of 6-fold ice crystals, diamond frost shards, and sub-zero mist.
 * 100% GPU-accelerated with 0 React re-renders.
 */
function NomoFrostCursor() {
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

  // Particle pool for massive frost trails
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
      type: 'crystal'
    }))
  );

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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

    const spawnFrost = (x, y, speedMult = 1, isBurst = false) => {
      const p = particlesRef.current[nextParticleIdx];
      const angle = isBurst ? Math.random() * Math.PI * 2 : Math.random() * Math.PI * 2;
      const speed = isBurst ? (2.5 + Math.random() * 4.5) : (0.6 + Math.random() * 2.2) * speedMult;

      p.x = x + (Math.random() - 0.5) * 12;
      p.y = y + (Math.random() - 0.5) * 12;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed + (isBurst ? 0 : 0.35); // gentle sub-zero settling
      p.size = 12 + Math.random() * 14;
      p.rotation = Math.random() * 360;
      p.rotSpeed = (Math.random() - 0.5) * 8;
      p.life = 0;
      p.maxLife = 20 + Math.floor(Math.random() * 16);
      p.alive = true;

      const rand = Math.random();
      p.type = rand > 0.55 ? 'crystal' : rand > 0.25 ? 'shard' : 'mote';

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

        // Spawn multiple frost crystals per step for a dense, massive trail
        if (p.lastSpawnDist > 8) {
          spawnFrost(e.clientX, e.clientY, 1.2);
          if (dist > 15) spawnFrost(e.clientX - dx * 0.5, e.clientY - dy * 0.5, 1.0);
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
        target.closest('.nomo-chip-3d') ||
        target.closest('.nomo-button-3d-primary') ||
        target.closest('.nomo-button-3d-secondary') ||
        target.getAttribute('role') === 'button'
      );
      p.isHovering = !!isInteractive;
      scheduleRender();
    };

    const handlePointerDown = () => {
      posRef.current.isClicking = true;
      // Massive Arctic Frost Burst on click (8 ice crystals radiating)
      const p = posRef.current;
      if (p.isVisible) {
        for (let i = 0; i < 6; i++) {
          spawnFrost(p.x, p.y, 2, true);
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

        // --- 2. Update & Render Frost Trail Particles ---
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
      {/* ❄️ Massive Arctic Frost Trail Particles */}
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => (trailRefs.current[i] = el)}
          className="fixed top-0 left-0 pointer-events-none opacity-0 will-change-transform flex items-center justify-center"
        >
          {i % 3 === 0 ? (
            /* 6-Fold Mathematical Ice Crystal */
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 40 40" 
              className="text-cyan-300 dark:text-cyan-200 filter drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]"
            >
              <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="20" y1="2" x2="20" y2="38" />
                <line x1="4.4" y1="11" x2="35.6" y2="29" />
                <line x1="4.4" y1="29" x2="35.6" y2="11" />
                <polyline points="15,7 20,2 25,7" fill="none" />
                <polyline points="15,33 20,38 25,33" fill="none" />
                <polyline points="8,17 4.4,11 11,8" fill="none" />
                <polyline points="32,23 35.6,29 29,32" fill="none" />
                <polyline points="8,23 4.4,29 11,32" fill="none" />
                <polyline points="32,17 35.6,11 29,8" fill="none" />
              </g>
              <polygon points="20,16 24,20 20,24 16,20" fill="#ffffff" />
            </svg>
          ) : i % 3 === 1 ? (
            /* 3D Diamond Ice Shard */
            <div 
              style={{
                width: '14px',
                height: '18px',
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                background: 'linear-gradient(135deg, #ffffff 0%, #bae6fd 50%, #06b6d4 100%)',
                boxShadow: '0 0 10px rgba(14, 165, 233, 0.95)'
              }}
            />
          ) : (
            /* Sub-Zero Glacial Mist Mote */
            <div 
              className="w-3.5 h-3.5 rounded-full"
              style={{
                background: 'radial-gradient(circle, #ffffff 0%, #38bdf8 50%, rgba(6,182,212,0) 100%)',
                boxShadow: '0 0 10px rgba(56, 189, 248, 0.9)'
              }}
            />
          )}
        </div>
      ))}

      {/* ❄️ Hyper-Tactile Volumetric 3D Ice Prism Pointer */}
      <div
        ref={pointerRef}
        className="fixed top-0 left-0 opacity-0 will-change-transform pointer-events-none"
        style={{
          transformOrigin: 'top left',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Volumetric 3D Beveled Ice Dart Container */}
        <div className="relative -top-1 -left-1 w-8 h-8 filter drop-shadow-[0_6px_8px_rgba(0,0,0,0.35)]">
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 32 32" 
            fill="none" 
            className="w-full h-full transform -rotate-12"
          >
            <defs>
              <linearGradient id="frostFacetLight" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="35%" stopColor="#bae6fd" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>

              <linearGradient id="frostFacetDark" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="50%" stopColor="#0369a1" />
                <stop offset="100%" stopColor="#0c4a6e" />
              </linearGradient>

              <radialGradient id="frostGemGlow" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#e0f2fe" />
                <stop offset="80%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#0891b2" />
              </radialGradient>
            </defs>

            <polygon 
              points="4,3 24,14 15,17 11,27" 
              fill="rgba(0,0,0,0.4)" 
              transform="translate(1, 2)"
            />

            <polygon 
              points="4,3 24,14 15,17" 
              fill="url(#frostFacetLight)" 
              stroke="#ffffff" 
              strokeWidth="0.75"
            />

            <polygon 
              points="4,3 15,17 11,27" 
              fill="url(#frostFacetDark)" 
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
              fill="url(#frostGemGlow)" 
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

export default React.memo(NomoFrostCursor);
