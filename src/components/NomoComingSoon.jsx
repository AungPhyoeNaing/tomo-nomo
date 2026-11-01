import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { readStorage } from '../utils/storage';
import './NomoComingSoon.css';

export default function NomoComingSoon() {
  const mascot = useRef(null);
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Nomo · Coming soon | Tomo + Nomo';
    const theme = readStorage('tomo_theme');
    document.body.classList.toggle('dark', theme === 'dark' || (theme !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches));
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => {
      if (preference.matches) mascot.current?.pause();
      else mascot.current?.play()?.catch(() => {});
    };
    updateMotion();
    preference.addEventListener('change', updateMotion);
    return () => {
      document.title = previousTitle;
      preference.removeEventListener('change', updateMotion);
    };
  }, []);

  return (
    <div className="nomo-soon">
      <header className="nomo-soon-header">
        <Link to="/" className="nomo-soon-brand" aria-label="Tomo and Nomo home">tomo + nomo<span aria-hidden="true">✦</span></Link>
        <span className="nomo-soon-header-note">Good things are worth a little wait.</span>
      </header>
      <main className="nomo-soon-main" id="main-content">
        <article className="nomo-soon-ticket" aria-labelledby="nomo-soon-title">
          <div className="nomo-soon-art">
            <span className="nomo-soon-ticket-label">The bestie challenge</span>
            <div className="nomo-soon-machine" aria-hidden="true">
              <div className="nomo-soon-marquee"><span>✦</span> Nomo <span>✦</span></div>
              <div className="nomo-soon-screen">
                <span className="nomo-soon-spark nomo-soon-spark-one">✧</span>
                <video ref={mascot} src="/nomo-main.mp4" muted loop playsInline preload="auto" tabIndex={-1} />
                <span className="nomo-soon-spark nomo-soon-spark-two">✦</span>
                <span className="nomo-soon-speech">Saving you a spot!</span>
              </div>
              <div className="nomo-soon-controls"><span className="nomo-soon-joystick" /><span /><span /></div>
            </div>
            <span className="nomo-soon-hanging-sign"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>Opening soon</span>
          </div>
          <div className="nomo-soon-copy">
            <span className="nomo-soon-status"><span aria-hidden="true" /> A new round is on its way</span>
            <h1 id="nomo-soon-title">Nomo is<br />coming soon.</h1>
            <p className="nomo-soon-lead">Your favourite human.<br />A challenge made for two.</p>
            <p>We’re getting the bestie challenge ready for you. Creating rooms and joining games are temporarily closed. Come back for your first round soon!</p>
            <p className="nomo-soon-burmese" lang="my">နိုမိုကို မကြာခင် တွေ့ရတော့မယ်နော်။ စောင့်နေတုန်း တိုမိုနဲ့ အရင်ကစားကြည့်ပါ။</p>
            <Link className="nomo-soon-cta" to="/"><span aria-hidden="true">♡</span> Play with Tomo <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg></Link>
            <span className="nomo-soon-available">Tomo’s connection stories are ready to play.</span>
          </div>
        </article>
        <footer className="nomo-soon-footer"><span>Two players. Plenty to look forward to.</span><span aria-hidden="true">♡ &nbsp; ✦ &nbsp; ⚡</span></footer>
      </main>
    </div>
  );
}
