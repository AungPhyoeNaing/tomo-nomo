import React, { useState, useEffect, useRef } from 'react';
import { audioManager } from '../utils/audioManager';

const AudioController = ({ track = 'tomo', className = '' }) => {
  const [audioState, setAudioState] = useState({
    isPlaying: audioManager.isPlaying,
    isMuted: audioManager.isMuted,
    volume: audioManager.volume,
    currentTrack: audioManager.currentTrack
  });
  const [showVolume, setShowVolume] = useState(false);

  useEffect(() => {
    const unsubscribe = audioManager.subscribe((state) => {
      setAudioState({ ...state });
    });

    // When track changes (e.g. Navigating between Tomo and Nomo), update track if already playing
    if (audioManager.isPlaying && audioManager.currentTrack !== track) {
      audioManager.play(track);
    }

    return unsubscribe;
  }, [track]);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!audioState.isPlaying) {
      audioManager.play(track);
    } else {
      audioManager.togglePlay();
    }
  };

  const isActuallyPlaying = audioState.isPlaying && !audioState.isMuted;
  const isNomo = track === 'nomo';

  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setShowVolume(false);
      }
    };
    if (showVolume) {
      document.addEventListener('pointerdown', handleClickOutside);
    }
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [showVolume]);

  return (
    <div 
      ref={popoverRef}
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setShowVolume(true)}
      onMouseLeave={() => setShowVolume(false)}
    >
      <button
        type="button"
        onClick={handleToggle}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowVolume(prev => !prev);
        }}
        className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-sm ${
          isNomo
            ? 'nomo-chip-3d text-sky-700 dark:text-sky-300'
            : 'tomo-chip-3d text-red-700 dark:text-red-300'
        }`}
        title={isActuallyPlaying ? 'Pause Background Music (Right-click or hold for volume)' : 'Play Background Music'}
        aria-label={isActuallyPlaying ? 'Pause Background Music' : 'Play Background Music'}
      >
        {/* Animated Equalizer Bars */}
        <div className="flex items-end gap-0.5 h-3 sm:h-3.5 w-3 sm:w-3.5 shrink-0">
          <span className={`w-0.5 rounded-full transition-all ${
            isActuallyPlaying 
              ? `${isNomo ? 'bg-sky-500' : 'bg-red-500'} animate-[bounce_0.8s_infinite]` 
              : 'h-1.5 bg-slate-400'
          }`} style={{ height: isActuallyPlaying ? '80%' : '30%' }}></span>
          <span className={`w-0.5 rounded-full transition-all ${
            isActuallyPlaying 
              ? `${isNomo ? 'bg-cyan-500' : 'bg-orange-500'} animate-[bounce_0.6s_infinite_0.2s]` 
              : 'h-2 bg-slate-400'
          }`} style={{ height: isActuallyPlaying ? '100%' : '50%' }}></span>
          <span className={`w-0.5 rounded-full transition-all ${
            isActuallyPlaying 
              ? `${isNomo ? 'bg-blue-500' : 'bg-rose-500'} animate-[bounce_0.7s_infinite_0.4s]` 
              : 'h-1 bg-slate-400'
          }`} style={{ height: isActuallyPlaying ? '60%' : '20%' }}></span>
        </div>

        <span className="hidden md:inline text-[11px] font-extrabold uppercase tracking-wider">
          {isActuallyPlaying ? 'Music On' : 'Music Off'}
        </span>
      </button>

      {/* Volume Hover/Touch Flyout */}
      {showVolume && (
        <div className="absolute right-0 top-full mt-2 z-50 p-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl flex items-center gap-2 min-w-[160px] sm:min-w-[170px] text-xs animate-in fade-in slide-in-from-top-1 duration-150">
          <button 
            type="button" 
            onClick={() => audioManager.toggleMute()}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer p-1"
            title={audioState.isMuted ? 'Unmute' : 'Mute'}
            aria-label={audioState.isMuted ? 'Unmute' : 'Mute'}
          >
            {audioState.isMuted ? '🔇' : '🔊'}
          </button>
          
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05"
            value={audioState.isMuted ? 0 : audioState.volume} 
            onChange={(e) => {
              if (audioState.isMuted) audioManager.toggleMute();
              audioManager.setVolume(parseFloat(e.target.value));
            }}
            className="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            aria-label="Volume Slider"
          />

          <span className="text-[10px] font-extrabold text-slate-500 w-6 text-right">
            {audioState.isMuted ? '0%' : `${Math.round(audioState.volume * 100)}%`}
          </span>
        </div>
      )}
    </div>
  );
};

export default AudioController;
