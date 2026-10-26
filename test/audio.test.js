import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AudioManager } from '../src/utils/audioManager.js';

function setup(t, values = {}) {
  const audioDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'Audio');
  const storageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const saved = new Map(Object.entries(values));
  const instances = [];
  let play = () => Promise.resolve();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: key => saved.get(key) ?? null, setItem: (key, value) => saved.set(key, value) } });
  Object.defineProperty(globalThis, 'Audio', { configurable: true, value: class {
    constructor(src) { this.src = src; this.paused = false; instances.push(this); }
    play() { return play(this); }
    pause() { this.paused = true; }
  } });
  t.after(() => {
    if (audioDescriptor) Object.defineProperty(globalThis, 'Audio', audioDescriptor); else delete globalThis.Audio;
    if (storageDescriptor) Object.defineProperty(globalThis, 'localStorage', storageDescriptor); else delete globalThis.localStorage;
  });
  return { instances, saved, playback: fn => { play = fn; } };
}

test('music attempts autoplay on load, then starts on a gesture when the browser blocks it', async t => {
  const mock = setup(t);
  mock.playback(() => Promise.reject(Object.assign(new Error('Gesture required'), { name: 'NotAllowedError' })));
  const manager = new AudioManager();
  const page = new EventTarget();
  const cleanup = manager.enableAutoplay('tomo', page);
  await Promise.resolve();
  assert.equal(manager.isPlaying, false);
  assert.equal(manager.autoplayBlocked, true);
  assert.equal(manager.ctx, null);
  mock.playback(() => Promise.resolve());
  page.dispatchEvent(new Event('click'));
  await Promise.resolve();
  assert.equal(manager.isPlaying, true);
  assert.equal(manager.autoplayBlocked, false);
  assert.equal(mock.instances.length, 2);
  cleanup(); manager.stop();
  page.dispatchEvent(new Event('click'));
  assert.equal(mock.instances.length, 2);
});

test('saved pause, mute and zero volume are respected instead of reset by autoplay', async t => {
  const mock = setup(t, { tomo_audio_enabled: 'false', tomo_audio_muted: 'true', tomo_audio_vol: '0' });
  const manager = new AudioManager();
  const cleanup = manager.enableAutoplay('nomo', new EventTarget());
  assert.equal(mock.instances.length, 0);
  assert.equal(manager.volume, 0);
  assert.equal(manager.isMuted, true);
  await manager.play('nomo');
  assert.equal(mock.instances[0].volume, 0);
  assert.equal(manager.isMuted, true);
  assert.equal(mock.saved.get('tomo_audio_enabled'), 'true');
  manager.stop();
  assert.equal(mock.saved.get('tomo_audio_enabled'), 'false');
  cleanup();
});

test('pausing during pending playback cannot be undone by a late play resolution', async t => {
  const mock = setup(t);
  let resolve;
  mock.playback(() => new Promise(done => { resolve = done; }));
  const manager = new AudioManager();
  const pending = manager.play('tomo');
  assert.equal(manager.isPlaying, false);
  manager.stop(); resolve();
  await pending;
  assert.equal(manager.isPlaying, false);
  assert.equal(manager.isStarting, false);
  assert.equal(mock.instances[0].paused, true);
  assert.equal(manager.wantsPlayback, false);
});

test('switching between Tomo and Nomo stops the previous track', async t => {
  const mock = setup(t);
  const manager = new AudioManager();
  await manager.play('tomo');
  await manager.play('nomo', { automatic: true });
  assert.equal(mock.instances[0].paused, true);
  assert.equal(manager.currentTrack, 'nomo');
  assert.equal(manager.isPlaying, true);
  assert.notEqual(mock.instances[0].src, mock.instances[1].src);
  manager.stop();
});

test('an unavailable file and suspended synth do not report music as playing', async t => {
  const mock = setup(t);
  mock.playback(() => Promise.reject(Object.assign(new Error('Unsupported file'), { name: 'NotSupportedError' })));
  const manager = new AudioManager();
  manager.initContext = async () => false;
  await manager.play('tomo', { automatic: true });
  assert.equal(manager.isPlaying, false);
  assert.equal(manager.isStarting, false);
  assert.equal(manager.autoplayBlocked, true);
  assert.equal(manager.stepIntervalId, null);
});
