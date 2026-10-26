import React, { useState, useEffect, useRef, useId } from 'react';
import { audioManager } from '../utils/audioManager';

export default function AudioController({ track = 'tomo', className = '' }) {
  const [audioState, setAudioState] = useState(() => ({ isPlaying: audioManager.isPlaying, isMuted: audioManager.isMuted, volume: audioManager.volume, autoplayBlocked: audioManager.autoplayBlocked }));
  const [showVolume, setShowVolume] = useState(false);
  const popoverRef = useRef(null);
  const volumeId = useId();

  useEffect(() => {
    const unsubscribe = audioManager.subscribe(state => setAudioState({ ...state }));
    const stopAutoplay = audioManager.enableAutoplay(track);
    return () => { unsubscribe(); stopAutoplay(); };
  }, [track]);

  useEffect(() => {
    if (!showVolume) return;
    const outside = event => { if (!popoverRef.current?.contains(event.target)) setShowVolume(false); };
    const escape = event => { if (event.key === 'Escape') setShowVolume(false); };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [showVolume]);

  const audible = audioState.isPlaying && !audioState.isMuted && audioState.volume > 0;
  const label = audioState.isStarting ? 'Cancel music start' : audioState.isPlaying ? 'Pause music' : audioState.autoplayBlocked ? 'Start music — tap to enable sound' : 'Play music';
  return <div ref={popoverRef} data-audio-control className={`arcade-audio ${track === 'nomo' ? 'is-nomo' : ''} ${className}`}>
    <button type="button" className="arcade-audio-play" title={label} aria-label={label} aria-pressed={audioState.isPlaying} onClick={() => {
      if (audioManager.isPlaying || audioManager.isStarting) audioManager.stop();
      else void audioManager.play(track);
    }}>
      <span className={`arcade-equalizer ${audible ? 'is-playing' : ''}`} aria-hidden="true"><i /><i /><i /></span>
      <span className="arcade-audio-label">{audioState.isStarting ? 'Starting…' : audioState.isPlaying ? 'Music on' : audioState.autoplayBlocked ? 'Tap for music' : 'Music off'}</span>
    </button>
    <button type="button" className="arcade-audio-volume" aria-label="Adjust music volume" title="Adjust music volume" aria-expanded={showVolume} aria-controls={volumeId} onClick={() => setShowVolume(value => !value)}><span aria-hidden="true">♫</span></button>
    {showVolume && <div id={volumeId} className="arcade-volume-popover" role="group" aria-label="Music volume">
      <button type="button" onClick={() => audioManager.toggleMute()} aria-label={audioState.isMuted ? 'Unmute music' : 'Mute music'}>{audioState.isMuted ? 'Unmute' : 'Mute'}</button>
      <input type="range" min="0" max="1" step="0.05" value={audioState.isMuted ? 0 : audioState.volume} onChange={event => {
        if (audioState.isMuted) audioManager.toggleMute();
        audioManager.setVolume(Number(event.target.value));
      }} aria-label="Music volume" />
      <span>{audioState.isMuted ? 0 : Math.round(audioState.volume * 100)}%</span>
    </div>}
  </div>;
}
