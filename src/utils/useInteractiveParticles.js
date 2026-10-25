import { useEffect, useRef } from 'react';

/**
 * Ultra-smooth, zero-layout-thrashing cursor interactive physics engine.
 * Features gentle, slow drifting repulsion and soft harmonic spring return.
 * Eliminates getBoundingClientRect inside the RAF loop by caching base particle coordinates.
 * Modifies DOM transforms directly via requestAnimationFrame with 0 React re-renders.
 */
export function useInteractiveParticles(containerRef) {
  const isRunningRef = useRef(false);
  const pointerRef = useRef({ x: -1000, y: -1000, prevX: -1000, prevY: -1000, vx: 0, vy: 0 });
  const particlesRef = useRef([]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const container = containerRef.current;
    if (!container) return;

    const measureParticles = () => {
      const elements = container.querySelectorAll('[data-interactive="true"]');
      particlesRef.current = Array.from(elements).map((el) => {
        const mass = parseFloat(el.getAttribute('data-mass') || '2.0');
        const spring = parseFloat(el.getAttribute('data-spring') || '0.018');
        const damping = parseFloat(el.getAttribute('data-damping') || '0.94');
        const radius = parseFloat(el.getAttribute('data-radius') || '140');

        const rect = el.getBoundingClientRect();
        const prevP = particlesRef.current.find(p => p.el === el);
        const offsetX = prevP ? prevP.offsetX : 0;
        const offsetY = prevP ? prevP.offsetY : 0;

        return {
          el,
          baseX: rect.left - offsetX + rect.width / 2,
          baseY: rect.top - offsetY + rect.height / 2,
          offsetX,
          offsetY,
          vx: prevP ? prevP.vx : 0,
          vy: prevP ? prevP.vy : 0,
          mass,
          spring,
          damping,
          radius
        };
      });
    };

    measureParticles();

    let frameId = 0;

    const startLoop = () => {
      if (!isRunningRef.current) {
        isRunningRef.current = true;
        frameId = requestAnimationFrame(tick);
      }
    };

    const handlePointerMove = (e) => {
      const x = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : pointerRef.current.x);
      const y = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : pointerRef.current.y);

      if (pointerRef.current.prevX !== -1000) {
        pointerRef.current.vx = (x - pointerRef.current.prevX) * 0.15;
        pointerRef.current.vy = (y - pointerRef.current.prevY) * 0.15;
      }

      pointerRef.current.prevX = x;
      pointerRef.current.prevY = y;
      pointerRef.current.x = x;
      pointerRef.current.y = y;

      startLoop();
    };

    const handlePointerLeave = () => {
      pointerRef.current.x = -1000;
      pointerRef.current.y = -1000;
      pointerRef.current.vx = 0;
      pointerRef.current.vy = 0;
    };

    let resizeTimer = null;
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(measureParticles, 150);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    const tick = () => {
      let hasActiveMotion = false;
      const px = pointerRef.current.x;
      const py = pointerRef.current.y;
      const pvx = pointerRef.current.vx;
      const pvy = pointerRef.current.vy;

      // Smoothly decay pointer velocity
      pointerRef.current.vx *= 0.75;
      pointerRef.current.vy *= 0.75;

      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const centerX = p.baseX + p.offsetX;
        const centerY = p.baseY + p.offsetY;

        const dx = px - centerX;
        const dy = py - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Gentle, calm cursor nudge
        if (dist < p.radius && dist > 1) {
          const force = (1 - dist / p.radius) * 2.2;
          const angle = Math.atan2(dy, dx);
          
          p.vx -= (Math.cos(angle) * force) / p.mass;
          p.vy -= (Math.sin(angle) * force) / p.mass;
          p.vx += (pvx * 0.35) / p.mass;
          p.vy += (pvy * 0.35) / p.mass;

          hasActiveMotion = true;
        }

        // Clamp max velocity to keep motion calm and serene
        p.vx = Math.max(-3.5, Math.min(3.5, p.vx));
        p.vy = Math.max(-3.5, Math.min(3.5, p.vy));

        // Soft elastic spring return force
        const springFx = -p.spring * p.offsetX;
        const springFy = -p.spring * p.offsetY;

        p.vx = (p.vx + springFx) * p.damping;
        p.vy = (p.vy + springFy) * p.damping;

        p.offsetX += p.vx;
        p.offsetY += p.vy;

        // Check if movement is still significant
        if (Math.abs(p.vx) > 0.02 || Math.abs(p.vy) > 0.02 || Math.abs(p.offsetX) > 0.08 || Math.abs(p.offsetY) > 0.08) {
          hasActiveMotion = true;
        } else {
          p.offsetX = 0;
          p.offsetY = 0;
          p.vx = 0;
          p.vy = 0;
        }

        // Apply GPU transform directly to DOM
        p.el.style.transform = `translate3d(${p.offsetX.toFixed(2)}px, ${p.offsetY.toFixed(2)}px, 0)`;
      }

      if (hasActiveMotion) {
        frameId = requestAnimationFrame(tick);
      } else {
        isRunningRef.current = false;
        frameId = 0;
      }
    };

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('resize', handleResize);
      if (resizeTimer) clearTimeout(resizeTimer);
      isRunningRef.current = false;
      cancelAnimationFrame(frameId);
    };
  }, [containerRef]);
}

