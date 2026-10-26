// Extended Multi-Section Procedural Music Engine for Tomo & Nomo
// Features 128-step multi-movement compositions with verses, choruses, bridges, drum fills, and generative passing tones.

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.isStarting = false;
    this.autoplayBlocked = false;
    this.wantsPlayback = true;
    this.isMuted = false;
    this.volume = 0.35;
    this.currentTrack = null; // 'tomo' | 'nomo'
    this.listeners = new Set();
    
    // Sequencer intervals and nodes
    this.masterGain = null;
    this.stepIntervalId = null;
    this.stepCount = 0;
    this.noiseBuffer = null;
    
    // HTML5 Audio element for custom file fallback
    this.audioElement = null;
    this.playRequestId = 0;

    // Load saved preferences
    try {
      if (typeof localStorage === 'undefined') return;
      this.wantsPlayback = localStorage.getItem('tomo_audio_enabled') !== 'false';
      const savedMute = localStorage.getItem('tomo_audio_muted');
      if (savedMute !== null) this.isMuted = savedMute === 'true';
      const savedVol = localStorage.getItem('tomo_audio_vol');
      if (savedVol !== null && Number.isFinite(Number(savedVol))) this.volume = Math.max(0, Math.min(1, Number(savedVol)));
    } catch (e) {
      console.warn('Audio storage error', e);
    }
  }

  async initContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
        this.generateNoiseBuffer();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    return this.ctx?.state === 'running';
  }

  generateNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    const state = {
      isPlaying: this.isPlaying,
      isStarting: this.isStarting,
      autoplayBlocked: this.autoplayBlocked,
      isMuted: this.isMuted,
      volume: this.volume,
      currentTrack: this.currentTrack
    };
    this.listeners.forEach(fn => fn(state));
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    try {
      localStorage.setItem('tomo_audio_vol', this.volume);
    } catch (e) {}

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        this.isMuted ? 0 : this.volume, 
        this.ctx.currentTime, 
        0.05
      );
    }
    if (this.audioElement) {
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
    }
    this.notify();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('tomo_audio_muted', this.isMuted);
    } catch (e) {}

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        this.isMuted ? 0 : this.volume, 
        this.ctx.currentTime, 
        0.05
      );
    }
    if (this.audioElement) {
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
    }
    this.notify();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play(this.currentTrack || 'tomo');
    }
  }

  enableAutoplay(trackName, target = document) {
    const start = event => {
      if (event?.target?.closest?.('[data-audio-control]')) return;
      if (event?.type === 'keydown' && (event.repeat || ['Tab', 'Escape', 'Shift', 'Control', 'Alt', 'Meta'].includes(event.key))) return;
      if (this.wantsPlayback && !this.isStarting && (!this.isPlaying || this.currentTrack !== trackName)) {
        void this.play(trackName, { automatic: true });
      }
    };
    start();
    target.addEventListener('click', start, true);
    target.addEventListener('keydown', start, true);
    return () => {
      target.removeEventListener('click', start, true);
      target.removeEventListener('keydown', start, true);
    };
  }

  async play(trackName = 'tomo', { automatic = false } = {}) {
    if (automatic && !this.wantsPlayback) return false;
    if (!automatic) {
      this.wantsPlayback = true;
      try { localStorage.setItem('tomo_audio_enabled', 'true'); } catch {}
    }
    const requestId = ++this.playRequestId;
    this.currentTrack = trackName;
    this.isStarting = true;
    this.isPlaying = false;
    this.autoplayBlocked = false;
    this.stopProcedural();
    this.audioElement?.pause();
    const audio = new Audio(trackName === 'nomo' ? '/tomo-bgm.mp3' : '/pixeltown-color-parade-main-version-41716-01-53.mp3');
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = this.isMuted ? 0 : this.volume;
    this.audioElement = audio;
    this.notify();
    try {
      await audio.play();
      if (requestId !== this.playRequestId) { audio.pause(); return false; }
      this.isPlaying = true;
    } catch (error) {
      audio.pause();
      if (requestId !== this.playRequestId) return false;
      this.audioElement = null;
      if (error.name === 'NotAllowedError') {
        this.autoplayBlocked = true;
      } else {
        // A missing/unsupported file may use the local synth. A blocked file
        // must wait for a gesture instead of pretending suspended audio plays.
        try {
          const running = await this.initContext();
          if (requestId !== this.playRequestId) return false;
          if (running) { this.isPlaying = true; this.startProcedural(trackName); }
          else this.autoplayBlocked = true;
        } catch { this.autoplayBlocked = true; }
      }
    } finally {
      if (requestId === this.playRequestId) { this.isStarting = false; this.notify(); }
    }
    return this.isPlaying;
  }

  stop() {
    this.playRequestId += 1;
    this.wantsPlayback = false;
    this.isStarting = false;
    this.autoplayBlocked = false;
    this.isPlaying = false;
    try { localStorage.setItem('tomo_audio_enabled', 'false'); } catch {}
    this.audioElement?.pause();
    this.audioElement = null;
    this.stopProcedural();
    this.notify();
  }

  stopProcedural() {
    if (this.stepIntervalId) {
      clearInterval(this.stepIntervalId);
      this.stepIntervalId = null;
    }
    this.stepCount = 0;
  }

  startProcedural(trackName) {
    if (!this.ctx || !this.masterGain) return;
    this.stopProcedural();

    if (trackName === 'nomo') {
      this.startNomoExtendedProcedural();
    } else {
      this.startTomoExtendedProcedural();
    }
  }

  // --- SYNTHESIZER INSTRUMENT VOICES ---

  // Crisp Filtered Percussion / Snare / Shaker
  playDrum(type = 'hat', gainScale = 1.0) {
    if (!this.ctx || !this.noiseBuffer) return;
    const now = this.ctx.currentTime;
    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    if (type === 'snare') {
      filter.type = 'bandpass';
      filter.frequency.value = 2400;
      gain.gain.setValueAtTime(0.06 * gainScale, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    } else if (type === 'hat_accent') {
      filter.type = 'highpass';
      filter.frequency.value = 7500;
      gain.gain.setValueAtTime(0.04 * gainScale, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    } else {
      // Light shaker
      filter.type = 'highpass';
      filter.frequency.value = 8500;
      gain.gain.setValueAtTime(0.02 * gainScale, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
    }

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start(now);
    source.stop(now + 0.15);
  }

  // Punchy Pop Kick
  playKick(freq = 135, gainScale = 1.0) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.11);

    gain.gain.setValueAtTime(0.085 * gainScale, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  // Bouncy Bass Synth
  playBass(freq, duration = 0.22, velocity = 1.0) {
    if (!this.ctx || !freq) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + duration);

    gain.gain.setValueAtTime(0.075 * velocity, now);
    gain.gain.linearRampToValueAtTime(0.06 * velocity, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  // Vibrant Pluck / Lead Synth (With Chorus & Harmonic Warmth)
  playPluck(freq, duration = 0.35, isBright = false, velocity = 1.0) {
    if (!this.ctx || !freq) return;
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = isBright ? 'sine' : 'triangle';
    osc2.type = isBright ? 'triangle' : 'sine';

    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 1.003, now); // Sweet natural chorus

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isBright ? 2600 : 1800, now);
    filter.frequency.exponentialRampToValueAtTime(isBright ? 800 : 500, now + duration);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.065 * velocity, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration + 0.05);
    osc2.stop(now + duration + 0.05);
  }

  // Cheerful Multi-Voice Chord Stabs
  playChordStab(freqs, duration = 0.25, velocity = 1.0) {
    if (!this.ctx || !freqs) return;
    const now = this.ctx.currentTime;

    freqs.forEach(f => {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1600, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.022 * velocity, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    });
  }

  // Sparkling High Chime / Arpeggio Flourish
  playChime(freq, duration = 0.45) {
    if (!this.ctx || !freq) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  // =========================================================================
  // TOMO: 128-STEP EXTENDED MULTI-SECTION FESTIVAL SOUNDSCAPE (~92 BPM)
  // Movement 1 (0-31): Playful Verse
  // Movement 2 (32-63): Joyful High-Energy Chorus
  // Movement 3 (64-95): Dreamy Bridge Breakdown (Half-time glow)
  // Movement 4 (96-127): Climax Resolution with Fills
  // =========================================================================
  startTomoExtendedProcedural() {
    this.stepCount = 0;
    const bpm = 92;
    const stepTimeMs = (60 / bpm / 4) * 1000; // 16th notes (~163ms)

    const N = {
      C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
      C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
      C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
      C6: 1046.50
    };

    // Chord Definitions
    const CHORDS = {
      Fmaj7: [N.F4, N.A4, N.C5, N.E5],
      G7:    [N.G4, N.B4, N.D5, N.F5],
      Em7:   [N.E4, N.G4, N.B4, N.D5],
      Am7:   [N.A4, N.C5, N.E5, N.G5],
      Dm7:   [N.D4, N.F4, N.A4, N.C5],
      Cmaj7: [N.C4, N.E4, N.G4, N.B4],
      E7:    [N.E4, N.G4 * 1.059, N.B4, N.D5] // G# for E7
    };

    // 128-step Lead Melody
    const melody128 = [
      // --- SECTION 1: VERSE (0-31) ---
      N.C5, null, N.A4, N.C5,   null, N.E5, null, N.D5,
      null, N.B4, N.D5, null,   N.G5, null, N.D5, null,
      N.G4, null, N.B4, N.D5,   null, N.E5, null, N.C5,
      null, N.E5, N.D5, N.C5,   N.A4, null, N.C5, null,

      // --- SECTION 2: CHORUS / ANTHEM (32-63) ---
      N.E5, N.G5, null, N.A5,   null, N.G5, N.E5, N.D5,
      N.E5, N.D5, N.B4, null,   N.D5, N.E5, N.G5, null,
      N.G5, null, N.E5, N.G5,   N.A5, null, N.B5, null,
      N.C6, null, N.B5, N.A5,   N.G5, N.E5, N.D5, N.C5,

      // --- SECTION 3: DREAMY BRIDGE (64-95) ---
      N.F5, null, null, N.E5,   null, N.D5, null, null,
      N.E5, null, null, N.D5,   null, N.C5, null, null,
      N.D5, null, null, N.C5,   null, N.B4, null, null,
      N.C5, N.D5, N.E5, N.G5,   N.A5, null, N.B5, null,

      // --- SECTION 4: HIGH-ENERGY CLIMAX & FILLS (96-127) ---
      N.C6, null, N.G5, N.E5,   N.A5, null, N.G5, null,
      N.E5, N.D5, N.C5, N.D5,   N.E5, null, N.G5, null,
      N.A5, N.B5, N.C6, N.D5,   N.E5, N.G5, N.A5, N.C6,
      N.B5, N.A5, N.G5, N.E5,   N.D5, N.C5, N.D5, N.E5
    ];

    // 128-step Bassline
    const bass128 = [
      // Verse (0-31)
      N.F3, null, null, N.F3,   null, N.C4, N.F3, null,
      N.G3, null, null, N.G3,   null, N.D4, N.G3, null,
      N.E3, null, null, N.E3,   null, N.B3, N.E3, null,
      N.A3, null, null, N.A3,   null, N.E4, N.A3, null,

      // Chorus (32-63)
      N.F3, N.F3, null, N.C4,   N.F3, null, N.A3, N.C4,
      N.G3, N.G3, null, N.D4,   N.G3, null, N.B3, N.D4,
      N.E3, N.E3, null, N.B3,   N.E3, null, N.G3, N.B3,
      N.A3, N.A3, null, N.E4,   N.A3, null, N.C4, N.E4,

      // Bridge (64-95)
      N.D3, null, null, null,   N.A3, null, null, null,
      N.G3, null, null, null,   N.D4, null, null, null,
      N.C3, null, null, null,   N.G3, null, null, null,
      N.A3, null, null, null,   N.E4, null, N.G3, null,

      // Climax (96-127)
      N.F3, null, N.F3, null,   N.C4, null, N.F3, null,
      N.G3, null, N.G3, null,   N.D4, null, N.G3, null,
      N.E3, null, N.E3, null,   N.B3, null, N.E3, null,
      N.A3, null, N.A3, null,   N.E4, N.D4, N.C4, N.B3
    ];

    this.stepIntervalId = setInterval(() => {
      if (!this.isPlaying || this.currentTrack !== 'tomo') return;
      const step = this.stepCount % 128;
      const section = Math.floor(step / 32); // 0: Verse, 1: Chorus, 2: Bridge, 3: Climax

      // --- DRUM GROOVE VARIATIONS ---
      if (section === 2) {
        // Bridge: Half-time soft beat
        if (step % 16 === 0) this.playKick(125, 0.7);
        if (step % 16 === 8) this.playDrum('snare', 0.5);
        if (step % 4 === 2) this.playDrum('hat');
      } else if (section === 1 || section === 3) {
        // Chorus & Climax: Full dynamic drive
        if (step % 8 === 0 || step % 8 === 6) this.playKick(140, 1.1);
        if (step % 8 === 4) this.playDrum('snare', 1.0);
        this.playDrum(step % 4 === 2 ? 'hat_accent' : 'hat', 1.1);

        // Fill on last 4 steps of section
        if (step % 32 >= 28) {
          this.playDrum('snare', 0.8);
          this.playKick(150, 0.9);
        }
      } else {
        // Verse: Bouncy pop beat
        if (step % 8 === 0 || step % 8 === 5) this.playKick(130, 0.9);
        if (step % 8 === 4) this.playDrum('snare', 0.8);
        this.playDrum(step % 2 === 0 ? 'hat' : 'hat_accent', 0.8);
      }

      // --- HARMONIC CHORD STABS ---
      if (section !== 2 && (step % 8 === 2 || step % 8 === 5)) {
        let chord = CHORDS.Fmaj7;
        const localBar = Math.floor((step % 32) / 8);
        if (localBar === 1) chord = CHORDS.G7;
        else if (localBar === 2) chord = CHORDS.Em7;
        else if (localBar === 3) chord = CHORDS.Am7;
        this.playChordStab(chord, 0.3, section === 1 ? 1.2 : 0.9);
      } else if (section === 2 && step % 16 === 0) {
        // Sustained gentle chord on bridge
        const bChords = [CHORDS.Dm7, CHORDS.G7, CHORDS.Cmaj7, CHORDS.Am7];
        this.playChordStab(bChords[Math.floor((step % 32) / 8)], 0.8, 0.7);
      }

      // --- BASSLINE ---
      const bFreq = bass128[step];
      if (bFreq) {
        this.playBass(bFreq, section === 2 ? 0.5 : 0.28, section === 1 ? 1.2 : 1.0);
      }

      // --- MELODY ---
      const mFreq = melody128[step];
      if (mFreq) {
        this.playPluck(mFreq, section === 1 ? 0.48 : 0.38, section === 1, section === 1 ? 1.2 : 1.0);

        // Add sparkling harmony chime on section 1 (chorus)
        if (section === 1 && step % 4 === 0) {
          this.playChime(mFreq * 1.5, 0.55);
        }
      }

      // Generative Passing Tone Fill (Every 16 steps with 25% organic improvisation)
      if (step % 16 === 14 && Math.random() < 0.35) {
        this.playPluck(N.G5, 0.2, true, 0.8);
      }

      this.stepCount++;
    }, stepTimeMs);
  }

  // =========================================================================
  // NOMO: 128-STEP EXTENDED PLAYFUL PARTY & GLACIAL QUEST (~96 BPM)
  // Movement 1 (0-31): Playful Bouncy Verse
  // Movement 2 (32-63): Joyful Island-Pop Chorus
  // Movement 3 (64-95): Sparkling Crystal Breakdown (Descending bells)
  // Movement 4 (96-127): High-Spirited Celebration Climax
  // =========================================================================
  startNomoExtendedProcedural() {
    this.stepCount = 0;
    const bpm = 96;
    const stepTimeMs = (60 / bpm / 4) * 1000; // 16th notes (~156ms)

    const N = {
      Eb3: 155.56, F3: 174.61, G3: 196.00, Ab3: 207.65, Bb3: 233.08, C4: 261.63, D4: 293.66,
      Eb4: 311.13, F4: 349.23, G4: 392.00, Ab4: 415.30, Bb4: 466.16, C5: 523.25, D5: 587.33,
      Eb5: 622.25, F5: 698.46, G5: 783.99, Ab5: 830.61, Bb5: 932.33, C6: 1046.50
    };

    const NOMO_CHORDS = {
      Eb:   [N.Eb4, N.G4, N.Bb4, N.Eb5],
      Bb:   [N.D4, N.F4, N.Bb4, N.D5],
      Cm:   [N.C4, N.Eb4, N.G4, N.C5],
      Ab:   [N.C4, N.Eb4, N.Ab4, N.C5],
      Fm7:  [N.F4, N.Ab4, N.C5, N.Eb5],
      Gm7:  [N.G4, N.Bb4, N.D5, N.F5],
      AbM7: [N.Ab4, N.C5, N.Eb5, N.G5]
    };

    // 128-step Marimba & Crystal Bell Melody
    const nomoMelody128 = [
      // --- SECTION 1: PLAYFUL BOUNCY VERSE (0-31) ---
      N.Eb5, N.G5, N.Bb4, N.Eb5,   N.G5, null, N.F5, N.Eb5,
      N.D5, N.F5, N.Bb4, N.D5,     N.F5, null, N.Eb5, N.D5,
      N.C5, N.Eb5, N.G4, N.C5,     N.Eb5, null, N.G5, N.Eb5,
      N.Ab4, N.C5, N.Eb5, N.Ab4,   N.C5, N.Eb5, N.F5, N.G5,

      // --- SECTION 2: JOYFUL ISLAND CHORUS (32-63) ---
      N.G5, null, N.Bb5, N.G5,     N.Eb5, N.G5, N.Bb5, null,
      N.F5, null, N.Ab5, N.F5,     N.D5, N.F5, N.Ab5, null,
      N.Eb5, null, N.G5, N.Eb5,    N.C5, N.Eb5, N.G5, null,
      N.F5, N.G5, N.Ab5, N.Bb5,    N.C6, null, N.Bb5, null,

      // --- SECTION 3: CRYSTAL BELL BREAKDOWN (64-95) ---
      N.C6, null, N.Bb5, null,     N.Ab5, null, N.G5, null,
      N.Bb5, null, N.Ab5, null,    N.G5, null, N.F5, null,
      N.Ab5, null, N.G5, null,     N.F5, null, N.Eb5, null,
      N.F5, N.G5, N.Ab5, N.Bb5,    N.C6, N.D5, N.Eb5, N.G5,

      // --- SECTION 4: HIGH-SPIRITED CELEBRATION (96-127) ---
      N.Eb5, N.Eb5, N.G5, N.Bb5,   N.C6, null, N.Bb5, N.G5,
      N.F5, N.F5, N.Ab5, N.C6,     N.Bb5, null, N.Ab5, N.F5,
      N.G5, N.G5, N.Bb5, N.C6,     N.Eb5, N.G5, N.Bb5, N.C6,
      N.Bb5, N.Ab5, N.G5, N.F5,    N.Eb5, N.F5, N.G5, N.Bb5
    ];

    // 128-step Bouncy Calypso Bassline
    const nomoBass128 = [
      // Verse (0-31)
      N.Eb3, null, N.Eb3, null,   N.Bb3, null, N.Eb3, null,
      N.Bb3, null, N.Bb3, null,   N.F3,  null, N.Bb3, null,
      N.C4,  null, N.C4,  null,   N.G3,  null, N.C4,  null,
      N.Ab3, null, N.Ab3, null,   N.Eb3, null, N.Ab3, null,

      // Chorus (32-63)
      N.Eb3, N.Eb3, null, N.Bb3,  N.Eb3, null, N.G3, N.Bb3,
      N.Bb3, N.Bb3, null, N.F3,   N.Bb3, null, N.D4, N.F4,
      N.C4,  N.C4,  null, N.G3,   N.C4,  null, N.Eb4, N.G4,
      N.Ab3, N.Ab3, null, N.Eb3,  N.Ab3, null, N.C4, N.Eb4,

      // Breakdown (64-95)
      N.Ab3, null, null, null,    N.Eb3, null, null, null,
      N.G3,  null, null, null,    N.D4,  null, null, null,
      N.F3,  null, null, null,    N.C4,  null, null, null,
      N.Bb3, null, null, null,    N.F3,  null, N.Ab3, null,

      // Celebration Climax (96-127)
      N.Eb3, null, N.Eb3, null,   N.Bb3, null, N.Eb3, null,
      N.Bb3, null, N.Bb3, null,   N.F3,  null, N.Bb3, null,
      N.C4,  null, N.C4,  null,   N.G3,  null, N.C4,  null,
      N.Ab3, null, N.Ab3, null,   N.Bb3, null, N.Eb3, null
    ];

    this.stepIntervalId = setInterval(() => {
      if (!this.isPlaying || this.currentTrack !== 'nomo') return;
      const step = this.stepCount % 128;
      const section = Math.floor(step / 32);

      // --- PERCUSSION GROOVE ---
      if (section === 2) {
        // Crystal Breakdown: Light gentle pulse
        if (step % 8 === 0) this.playKick(130, 0.6);
        if (step % 4 === 2) this.playDrum('hat', 0.6);
      } else if (section === 1 || section === 3) {
        // Chorus / Celebration: Energetic double-pulse
        if (step % 8 === 0 || step % 8 === 4) this.playKick(155, 1.1);
        if (step % 8 === 4) this.playDrum('snare', 0.9);
        this.playDrum(step % 2 === 0 ? 'hat_accent' : 'hat', 1.1);

        // Flourish on end of 32-step phrase
        if (step % 32 >= 28) {
          this.playDrum('snare', 0.8);
          this.playKick(160, 0.9);
        }
      } else {
        // Verse: Classic Bouncy Shaker
        if (step % 8 === 0 || step % 8 === 4) this.playKick(145, 0.85);
        this.playDrum(step % 2 === 0 ? 'hat' : 'hat_accent', 0.85);
      }

      // --- CHORD STABS ---
      if (section !== 2 && (step % 8 === 2 || step % 8 === 6)) {
        const localBar = Math.floor((step % 32) / 8);
        const cKey = localBar === 0 ? 'Eb' : localBar === 1 ? 'Bb' : localBar === 2 ? 'Cm' : 'Ab';
        this.playChordStab(NOMO_CHORDS[cKey], 0.25, section === 1 ? 1.2 : 0.9);
      } else if (section === 2 && step % 8 === 0) {
        const bKeys = ['AbM7', 'Gm7', 'Fm7', 'Bb'];
        this.playChordStab(NOMO_CHORDS[bKeys[Math.floor((step % 32) / 8)]], 0.55, 0.7);
      }

      // --- BASSLINE ---
      const bNote = nomoBass128[step];
      if (bNote) {
        this.playBass(bNote, section === 2 ? 0.45 : 0.25, section === 1 ? 1.2 : 1.0);
      }

      // --- MARIMBA & BELL MELODY ---
      const mNote = nomoMelody128[step];
      if (mNote) {
        this.playPluck(mNote, section === 1 ? 0.38 : 0.3, true, section === 1 ? 1.2 : 1.0);

        // High shimmer bell on chorus and breakdown
        if ((section === 1 || section === 2) && step % 4 === 0) {
          this.playChime(mNote * 1.5, 0.45);
        }
      }

      // Generative High Bell Fill (15% chance on upbeat steps)
      if (step % 8 === 7 && Math.random() < 0.3) {
        this.playChime(N.C6, 0.3);
      }

      this.stepCount++;
    }, stepTimeMs);
  }
}

// Singleton audio manager
export const audioManager = new AudioManager();
export default audioManager;
