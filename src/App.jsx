import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import HeroSection from './components/HeroSection';
import InputSection from './components/InputSection';
import MatchResult from './components/MatchResult';
import ApiKeyModal from './components/ApiKeyModal';
import TomoBackgroundParticles from './components/TomoBackgroundParticles';
import TomoCosmicCursor from './components/TomoCosmicCursor';
import { calculateSecretMetrics, calculateAlgorithmicScore } from './utils/astrology';
import { fetchTomoDestinyReading, generateDeepProceduralReading } from './utils/gemini';
import { TOMO_GEMINI_KEYS } from './config/geminiKeys';

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import AudioController from './components/AudioController';

const NomoApp = React.lazy(() => import('./nomo/App'));

function TomoApp() {
  const [theme, setTheme] = useState('light');
  const [activePage, setActivePage] = useState('page-hero');
  const [scrollProgress, setScrollProgress] = useState(0);

  // App State
  const [relType, setRelType] = useState('Friends');
  const [mood, setMood] = useState('Sweet');
  const [slotKeys, setSlotKeys] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('tomo_gemini_keys') || '{}');
      const legacyKey = localStorage.getItem('tomo_api_key') || '';
      return {
        'key-1': stored['key-1'] || legacyKey,
        'key-2': stored['key-2'] || ''
      };
    } catch {
      return {
        'key-1': localStorage.getItem('tomo_api_key') || '',
        'key-2': ''
      };
    }
  });
  const [activeApiKeyId, setActiveApiKeyId] = useState(() => {
    const savedId = localStorage.getItem('tomo_active_gemini_key');
    return TOMO_GEMINI_KEYS.some(key => key.id === savedId) ? savedId : TOMO_GEMINI_KEYS[0].id;
  });
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputError, setInputError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const requestIdRef = useRef(0);
  const demoTimerRef = useRef(null);

  // Person 1 State
  const [p1Name, setP1Name] = useState('သူရိန်');
  const [p1Dob, setP1Dob] = useState('1996-06-15');
  
  // Person 2 State
  const [p2Name, setP2Name] = useState('သီရိ');
  const [p2Dob, setP2Dob] = useState('1996-10-08');

  // Results State
  const [result, setResult] = useState(null);

  const apiKey = slotKeys[activeApiKeyId] || import.meta.env.VITE_GEMINI_API_KEY || '';

  // Theme Init
  useEffect(() => {
    const savedTheme = localStorage.getItem('tomo_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.body.classList.add('dark');
    }
  }, []);

  useEffect(() => () => {
    requestIdRef.current += 1;
    if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('tomo_theme', newTheme);
    if (newTheme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  const handleSaveApiKey = (newKey) => {
    const value = newKey.trim();
    const nextSlotKeys = { ...slotKeys, [activeApiKeyId]: value };
    setSlotKeys(nextSlotKeys);
    localStorage.setItem('tomo_gemini_keys', JSON.stringify(nextSlotKeys));
  };

  const handleSelectApiKey = (event) => {
    const keyId = event.target.value;
    setActiveApiKeyId(keyId);
    localStorage.setItem('tomo_active_gemini_key', keyId);
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

    const todayISO = new Date().toISOString().split('T')[0];
    const hasValidInputs = p1Name.trim() && p2Name.trim() && p1Dob && p2Dob && p1Dob <= todayISO && p2Dob <= todayISO;
    if (!hasValidInputs) {
      setInputError('Please enter both names and valid birthdates before calculating.');
      jumpToPage('page-inputs');
      return;
    }
    setInputError('');

    if (!useDemo && !apiKey) {
      setIsApiModalOpen(true);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    const p1Secret = calculateSecretMetrics(p1Name, p1Dob);
    const p2Secret = calculateSecretMetrics(p2Name, p2Dob);
    const algorithmicScore = calculateAlgorithmicScore(p1Secret, p2Secret, relType);

    if (useDemo) {
      demoTimerRef.current = setTimeout(() => {
        if (requestId !== requestIdRef.current) return;
        const tailoredReading = generateDeepProceduralReading(p1Name, p1Secret, p2Name, p2Secret, relType, mood, algorithmicScore);
        setResult({ ...tailoredReading, p1Secret, p2Secret });
        setLoading(false);
        jumpToPage('page-gauge');
      }, 1500);
      return;
    }

    try {
      const data = await fetchTomoDestinyReading(p1Name, p1Secret, p2Name, p2Secret, relType, mood, algorithmicScore, apiKey);
      if (requestId !== requestIdRef.current) return;
      setResult({ ...data, p1Secret, p2Secret });
      setLoading(false);
      jumpToPage('page-gauge');
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error(err);
      setToastMessage(`API Notice: ${err.message || 'Gemini error'}. Showing Deep Procedural Reading!`);
      setTimeout(() => setToastMessage(''), 5000);
      const tailoredReading = generateDeepProceduralReading(p1Name, p1Secret, p2Name, p2Secret, relType, mood, algorithmicScore);
      setResult({ ...tailoredReading, p1Secret, p2Secret });
      setLoading(false);
      jumpToPage('page-gauge');
    }
  };

  return (
    <>
      <div 
        ref={progressBarRef} 
        id="topProgressBar" 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-orange-400 z-50 pointer-events-none transition-[width] duration-75 ease-out" 
        style={{ width: '0%' }}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-amber-500 text-white font-bold text-xs shadow-xl flex items-center gap-2 border border-amber-300"
        >
          <span>✨</span>
          <span>{toastMessage}</span>
          <button type="button" onClick={() => setToastMessage('')} className="ml-2 hover:opacity-80 font-black cursor-pointer">✕</button>
        </motion.div>
      )}

      {/* GPU-Accelerated Tomo Cosmic Background Atmosphere */}
      <TomoBackgroundParticles />

      {/* GPU-Accelerated Tomo Cosmic Stardust & Celestial Halo Cursor */}
      <TomoCosmicCursor />

      <nav className="glass-nav fixed top-0 left-0 right-0 z-40 px-2.5 sm:px-6 py-2 sm:py-3.5 flex items-center justify-between shadow-sm border-b border-red-200/40 dark:border-slate-800">
        <div className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer shrink-0" onClick={() => jumpToPage('page-hero')}>
          <video src="/tomo-main.mp4" autoPlay loop muted playsInline className="w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-red-400 shadow-sm animate-pulse" />
          <span className="font-extrabold text-red-600 text-sm sm:text-lg font-['Fredoka'] tracking-tight">
            <span className="xs:hidden">Tomo</span>
            <span className="hidden xs:inline sm:hidden">Tomo Destiny</span>
            <span className="hidden sm:inline">Tomo's Destiny Matcher</span>
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2.5">
          <AudioController track="tomo" />
          <select
            value={activeApiKeyId}
            onChange={handleSelectApiKey}
            aria-label="Select Tomo Gemini API key"
            className="max-w-[82px] sm:max-w-[118px] rounded-full border border-red-200 bg-white/80 px-1.5 sm:px-2.5 py-1 sm:py-1.5 text-[9px] sm:text-[10px] font-extrabold text-red-700 shadow-sm outline-none dark:border-slate-700 dark:bg-slate-900/90 dark:text-red-300 cursor-pointer"
          >
            {TOMO_GEMINI_KEYS.map(key => <option key={key.id} value={key.id}>{key.label}</option>)}
          </select>
          <button 
            type="button" 
            onClick={toggleTheme} 
            className="tomo-chip-3d p-1.5 sm:px-3 sm:py-1 rounded-full text-xs font-extrabold text-red-700 dark:text-red-300 flex items-center gap-1.5 cursor-pointer transition-all"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Cosmic Dark Mode'}
            aria-label="Toggle color mode"
          >
            {theme === 'dark' ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
            <span className="hidden md:inline">{theme === 'dark' ? 'Light' : 'Cosmic'}</span>
          </button>
          
          {/* API Key Modal Trigger from Navbar */}
          <button 
            type="button" 
            onClick={() => setIsApiModalOpen(true)}
            className="tomo-chip-3d p-1.5 sm:px-3 sm:py-1 rounded-full text-xs font-extrabold text-red-700 dark:text-red-300 flex items-center gap-1 sm:gap-1.5 cursor-pointer hover:scale-105 transition-all shadow-sm"
            title="Configure Gemini API Key"
            aria-label="Configure Gemini API Key"
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <span className="hidden sm:inline">{apiKey ? 'Key Set' : 'Set Key'}</span>
            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${apiKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
          </button>

          {/* Switch to Nomo Quiz Button */}
          <Link 
            to="/nomo" 
            className="px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-sky-100 to-cyan-100 hover:from-sky-200 hover:to-cyan-200 dark:from-sky-950/80 dark:to-cyan-950/80 border border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300 text-[11px] sm:text-xs font-extrabold transition-all shadow-sm flex items-center gap-1 cursor-pointer hover:scale-105"
            title="Switch to Nomo Friendship Chemistry Quiz"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="hidden xs:inline">Nomo</span>
            <span className="xs:hidden font-black">Nomo</span>
            <span className="text-[10px] text-sky-500 font-black">➔</span>
          </Link>
        </div>
      </nav>

      {/* Floating Side Navigation Dots (Hidden on Mobile to avoid content blockage) */}
      <div className="hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-3 p-2 bg-white/70 dark:bg-slate-900/80 backdrop-blur-md rounded-full border border-red-200/60 dark:border-slate-700 shadow-lg">
        {['page-hero', 'page-inputs', 'page-gauge', 'page-readings', 'page-synergy'].map((pageId, idx) => (
          <button 
            key={pageId} 
            type="button" 
            onClick={() => jumpToPage(pageId)} 
            className={`side-nav-dot ${activePage === pageId ? 'active' : ''}`}
            title={`Page ${idx + 1}`}
          />
        ))}
      </div>

      {/* Loading Modal */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-red-950/60 dark:bg-black/70 backdrop-blur-md p-4 sm:p-6 text-center">
          <div className="tomo-card rounded-full p-2.5 sm:p-3 shadow-2xl mb-4 sm:mb-6 border-4 border-red-300 flex items-center justify-center tomo-pulse">
            <video src="/tomo-calculating.mp4" autoPlay loop muted playsInline className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover shadow-inner border-2 border-red-400/40" />
          </div>
          <h3 className="text-lg sm:text-2xl font-bold text-white font-['Fredoka'] drop-shadow-md mb-2">
            ခေတ္တလေးစောင့်ပေးပါနော်
          </h3>
          <p className="text-xs sm:text-sm text-red-100 font-semibold max-w-sm sm:max-w-md drop-shadow px-2">
           တိုမို က နှစ်ယောက်လုံးရဲ့ အကြောင်းကို သေချာ တွက်ပေးနေပြီနော်...
          </p>
        </div>
      )}

      {/* Pop-up API Key Modal */}
      <ApiKeyModal 
        isOpen={isApiModalOpen} 
        onClose={() => setIsApiModalOpen(false)} 
        apiKey={apiKey} 
        onSaveKey={handleSaveApiKey} 
      />

      <div className="scroll-container relative z-10" onScroll={handleScroll}>
        <HeroSection jumpToPage={jumpToPage} />
        <InputSection 
          p1Name={p1Name} setP1Name={setP1Name} p1Dob={p1Dob} setP1Dob={setP1Dob}
          p2Name={p2Name} setP2Name={setP2Name} p2Dob={p2Dob} setP2Dob={setP2Dob}
          relType={relType} setRelType={setRelType}
          mood={mood} setMood={setMood}
          loading={loading} inputError={inputError}
          onCalculate={() => onCalculate(false)}
          onDemo={() => onCalculate(true)}
        />
        {result && (
          <MatchResult 
            result={result} 
            p1Name={p1Name} p2Name={p2Name}
            relType={relType}
            mood={mood}
            jumpToPage={jumpToPage}
          />
        )}
      </div>
    </>
  );
}

export default function App() {
  return (
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
  );
}
