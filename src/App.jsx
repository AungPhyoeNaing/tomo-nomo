import React, { useState, useEffect, useRef } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import HeroSection from './components/HeroSection';
import InputSection from './components/InputSection';
import MatchResult from './components/MatchResult';
import TomoPortrait from './components/TomoPortrait';
import { calculateSecretMetrics, calculateAlgorithmicScore } from './utils/astrology';
import { generateDeepProceduralReading } from './utils/gemini';
import { requestTomoReading } from './utils/readingClient';
import { createReadingResult, isValidBirthDate, normalizePersonName } from './utils/reading';
import { readStorage, writeStorage, removeStorage } from './utils/storage';

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import AudioController from './components/AudioController';
import './tomo.css';
import './arcade.css';
import './arcade-controls.css';
import './tomo-aura.css';

const NomoApp = React.lazy(() => import('./nomo/App'));

function TomoApp() {
  const [theme, setTheme] = useState('light');
  const [activePage, setActivePage] = useState('page-hero');

  // App State
  const [relType, setRelType] = useState('Friends');
  const [mood, setMood] = useState('Sweet');
  const [loading, setLoading] = useState(false);
  const [inputError, setInputError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const requestIdRef = useRef(0);
  const demoTimerRef = useRef(null);
  const loadingPanelRef = useRef(null);
  const readingControllerRef = useRef(null);

  useEffect(() => {
    if (!loading) return;
    const previousFocus = document.activeElement;
    loadingPanelRef.current?.focus();
    return () => previousFocus?.focus({ preventScroll: true });
  }, [loading]);

  // Person 1 State
  const [p1Name, setP1Name] = useState('သူရိန်');
  const [p1Dob, setP1Dob] = useState('1996-06-15');
  
  // Person 2 State
  const [p2Name, setP2Name] = useState('သီရိ');
  const [p2Dob, setP2Dob] = useState('1996-10-08');

  // Results State
  const [result, setResult] = useState(null);


  // Remove credentials left by the previous browser-key setup.
  useEffect(() => {
    ['tomo_gemini_keys', 'tomo_api_key', 'tomo_active_gemini_key', 'tomo_reading_model'].forEach(removeStorage);
  }, []);

  // Theme Init
  useEffect(() => {
    const savedTheme = readStorage('tomo_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.body.classList.add('dark');
    }
  }, []);

  useEffect(() => () => {
    requestIdRef.current += 1;
    readingControllerRef.current?.abort();
    if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    writeStorage('tomo_theme', newTheme);
    if (newTheme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  const progressBarRef = useRef(null);
  const scrollRafRef = useRef(0);

  const jumpToPage = (pageId) => {
    setActivePage(pageId);
    const element = document.getElementById(pageId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScroll = (e) => {
    const target = e.target;
    if (scrollRafRef.current) return;
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = 0;
      const maxScroll = target.scrollHeight - target.clientHeight;
      const progress = maxScroll > 0 ? (target.scrollTop / maxScroll) * 100 : 0;
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${progress}%`;
      }
      
      const scrollTop = target.scrollTop;
      const pages = ['page-hero', 'page-inputs', 'page-gauge', 'page-readings', 'page-synergy'];
      let closestPage = pages[0];
      let minDistance = Infinity;

      for (let i = 0; i < pages.length; i++) {
        const el = document.getElementById(pages[i]);
        if (el) {
          const dist = Math.abs(el.offsetTop - scrollTop);
          if (dist < minDistance) {
            minDistance = dist;
            closestPage = pages[i];
          }
        }
      }
      setActivePage((prev) => (prev !== closestPage ? closestPage : prev));
    });
  };

  const onCalculate = async (useDemo = false) => {
    if (loading) return;

    const firstName = normalizePersonName(p1Name);
    const secondName = normalizePersonName(p2Name);
    const hasValidInputs = firstName && secondName && firstName.length <= 80 && secondName.length <= 80 && isValidBirthDate(p1Dob) && isValidBirthDate(p2Dob);
    if (!hasValidInputs) {
      setInputError('Please enter both names and valid birthdates before calculating.');
      jumpToPage('page-inputs');
      return;
    }
    setInputError('');

    const requestId = ++requestIdRef.current;
    readingControllerRef.current = new AbortController();
    setLoading(true);
    const p1Secret = calculateSecretMetrics(firstName, p1Dob);
    const p2Secret = calculateSecretMetrics(secondName, p2Dob);
    const algorithmicScore = calculateAlgorithmicScore(p1Secret, p2Secret, relType);
    const inputs = { p1Name: firstName, p2Name: secondName, p1Dob, p2Dob, relType, mood };

    if (useDemo) {
      demoTimerRef.current = setTimeout(() => {
        if (requestId !== requestIdRef.current) return;
        const tailoredReading = generateDeepProceduralReading(p1Name, p1Secret, p2Name, p2Secret, relType, mood, algorithmicScore);
        setResult(createReadingResult(tailoredReading, inputs, p1Secret, p2Secret));
        setLoading(false);
        requestAnimationFrame(() => jumpToPage('page-gauge'));
      }, 0);
      return;
    }

    try {
      const data = await requestTomoReading({ p1Name: firstName, p1Dob, p2Name: secondName, p2Dob, relType, mood }, { signal: readingControllerRef.current.signal });
      if (requestId !== requestIdRef.current) return;
      setResult(createReadingResult(data, inputs, p1Secret, p2Secret));
      setLoading(false);
      requestAnimationFrame(() => jumpToPage('page-gauge'));
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      if (err.name === 'AbortError') { setLoading(false); return; }
      setToastMessage(`AI reading unavailable: ${err.message || 'Gemini error'}. Showing the built-in story instead.`);
      setTimeout(() => setToastMessage(''), 5000);
      const tailoredReading = generateDeepProceduralReading(p1Name, p1Secret, p2Name, p2Secret, relType, mood, algorithmicScore);
      setResult(createReadingResult(tailoredReading, inputs, p1Secret, p2Secret, { fallback: true, reason: err.code || 'AI_UNAVAILABLE' }));
      setLoading(false);
      requestAnimationFrame(() => jumpToPage('page-gauge'));
    }
  };

  const cancelReading = () => {
    requestIdRef.current += 1;
    readingControllerRef.current?.abort();
    if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
    setLoading(false);
  };

  const sections = [
    ['page-hero', '⌂ Arcade'], ['page-inputs', '☺ Player setup'],
    ...(result ? [['page-gauge', '✦ Your score'], ['page-readings', 'Your profiles'], ['page-synergy', 'Together']] : [])
  ];

  return (
    <div className="tomo-experience">
      <div ref={progressBarRef} className="tomo-scroll-progress" aria-hidden="true" />
      <a href="#page-inputs" className="tomo-skip-link" tabIndex={loading ? -1 : undefined}>Skip to your details</a>
      <header className="tomo-header" inert={loading ? '' : undefined}>
        <button type="button" className="tomo-brand" onClick={() => jumpToPage('page-hero')} aria-label="Tomo home"><TomoPortrait pose="wave" /><strong>tomo + nomo</strong><small>A place to play & connect</small></button>
        <div className="tomo-header-actions">
          <Link to="/nomo" className="tomo-nomo-link">2P challenge <span aria-hidden="true">↗</span></Link>
          <AudioController track="tomo" />
          <button type="button" className="tomo-icon-button" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Use light theme' : 'Use dark theme'} title={theme === 'dark' ? 'Use light theme' : 'Use dark theme'}>{theme === 'dark' ? '☀' : '☾'}</button>
        </div>
      </header>
      <nav inert={loading ? '' : undefined} className={`tomo-section-nav ${result ? 'has-results' : ''}`} aria-label="Reading sections">{sections.map(([id, label]) => <button type="button" key={id} onClick={() => jumpToPage(id)} aria-current={activePage === id ? 'location' : undefined}>{label}</button>)}</nav>
      {toastMessage && <div className="tomo-toast" role="status"><span>{toastMessage}</span><button type="button" onClick={() => setToastMessage('')} aria-label="Dismiss notification">×</button></div>}
      {loading && <div className="tomo-loading" role="dialog" aria-modal="true" aria-labelledby="loading-title"><div ref={loadingPanelRef} tabIndex={-1} className="tomo-loading-panel" role="status"><video src="/tomo-calculating.mp4" autoPlay loop muted playsInline aria-hidden="true" /><h2 id="loading-title">Building your duo’s story…</h2><p lang="my">တိုမိုက နှစ်ယောက်လုံးအတွက် ဖတ်ရှုချက်လေး ပြင်ဆင်နေပြီနော်။</p><button type="button" className="tomo-outline-button tomo-cancel-reading" onClick={cancelReading}>Cancel reading</button><span className="tomo-loading-dots" aria-hidden="true">✦ &nbsp; ✦ &nbsp; ✦</span></div></div>}
      <main inert={loading ? '' : undefined} className="scroll-container tomo-main" onScroll={handleScroll} aria-busy={loading}>
        <HeroSection jumpToPage={jumpToPage} />
        <InputSection p1Name={p1Name} setP1Name={setP1Name} p1Dob={p1Dob} setP1Dob={setP1Dob} p2Name={p2Name} setP2Name={setP2Name} p2Dob={p2Dob} setP2Dob={setP2Dob} relType={relType} setRelType={setRelType} mood={mood} setMood={setMood} loading={loading} inputError={inputError} onCalculate={() => onCalculate(false)} onDemo={() => onCalculate(true)} />
        {result && <MatchResult result={result} p1Name={result.inputs.p1Name} p2Name={result.inputs.p2Name} relType={result.inputs.relType} mood={result.inputs.mood} jumpToPage={jumpToPage} />}
        {!result && <footer className="tomo-footer">Good company. Unexpected discoveries. <span>tomo + nomo · Made for your kind of two.</span></footer>}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TomoApp />} />
        <Route 
          path="/nomo/*" 
          element={
            <React.Suspense fallback={
              <div className="min-h-screen flex flex-col items-center justify-center bg-sky-50 dark:bg-slate-900 text-sky-600 gap-3 font-['Fredoka']">
                <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-base font-bold">Loading Nomo Quiz...</p>
              </div>
            }>
              <NomoApp />
            </React.Suspense>
          } 
        />
      </Routes>
    </BrowserRouter>
    </MotionConfig>
  );
}
