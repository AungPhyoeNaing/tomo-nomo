import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import JoinGame from './components/JoinGame';
import GameRoom from './components/GameRoom';
import AudioController from '../components/AudioController';
import { readStorage, writeStorage } from '../utils/storage';
import './index.css';
import '../arcade.css';
import '../arcade-controls.css';
import './nomo-arcade.css';

const nomoWavingVideo = '/nomo-main.mp4';

function NomoApp() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const savedTheme = readStorage('tomo_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.body.classList.add('dark');
    }
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

  return (
    <div className="nomo-scroll-wrapper w-full text-slate-800 dark:text-slate-100 font-['Quicksand',sans-serif] relative">
      
      {/* Top Glass Navigation with Clean Ice Blue Styling */}
      <nav className="glass-nav fixed top-0 left-0 right-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm border-b border-sky-200/60 dark:border-sky-900/60">
        <Link to="/nomo" className="flex items-center gap-2.5 cursor-pointer">
          <div className="relative">
            <video 
              src={nomoWavingVideo} 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-9 h-9 rounded-full object-cover border-2 border-sky-400 shadow-sm" 
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-cyan-400 border-2 border-white dark:border-slate-800 rounded-full animate-pulse"></span>
          </div>
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-sky-600 dark:text-sky-400 text-base sm:text-lg font-['Fredoka'] tracking-tight leading-tight">
              Nomo
            </span>
            <span className="text-[10px] font-bold text-sky-500/80 dark:text-sky-300/80 uppercase tracking-wider hidden sm:block">
              The bestie challenge
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <AudioController track="nomo" />
          
          <button 
            type="button" 
            onClick={toggleTheme} 
            className="nomo-chip-3d px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            title="Toggle theme"
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
            <span className="hidden md:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>

          <Link 
            to="/" 
            className="px-3.5 py-1.5 rounded-full bg-sky-50 hover:bg-sky-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-sky-200 dark:border-slate-600 text-sky-600 dark:text-sky-300 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>Back to arcade</span>
            <span className="text-[10px] text-sky-400">↗</span>
          </Link>
        </div>
      </nav>

      {/* Main Content Area: padding-top ensures nav clearance, pb-28 ensures sticky bars never overlap */}
      <main className="w-full max-w-4xl mx-auto px-4 pt-20 pb-28 min-h-[calc(100vh-80px)] flex flex-col items-center relative">
        <Routes>
          <Route path="/" element={<JoinGame />} />
          <Route path="/game/:roomId" element={<GameRoom />} />
          <Route path="*" element={<JoinGame />} />
        </Routes>
      </main>
    </div>
  );
}

export default NomoApp;
