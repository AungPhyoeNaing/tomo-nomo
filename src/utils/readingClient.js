import { validateReading, validateBurmeseReading } from './reading.js';
import { READING_CLIENT_TIMEOUT_MS } from './readingPolicy.js';

let browserSession;
function getBrowserSession() {
  if (browserSession) return browserSession;
  try {
    const saved = globalThis.sessionStorage?.getItem('tomo_reading_session');
    if (/^[a-f0-9]{32}$/.test(saved || '')) browserSession = saved;
  } catch { /* Storage can be disabled. Keep an in-memory session instead. */ }
  // This ID separates browser cooldowns on shared Wi-Fi; it is not authentication.
  browserSession ||= globalThis.crypto?.randomUUID?.().replace(/-/g, '') ||
    Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  try { globalThis.sessionStorage?.setItem('tomo_reading_session', browserSession); } catch { /* Optional storage. */ }
  return browserSession;
}

export async function requestTomoReading(inputs, { signal } = {}) {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  if (signal?.aborted) cancel();
  signal?.addEventListener('abort', cancel, { once: true });
  const timer = setTimeout(cancel, READING_CLIENT_TIMEOUT_MS);
  try {
    const response = await fetch('/api/reading', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Tomo-Session': getBrowserSession() },
      body: JSON.stringify(inputs), signal: controller.signal
    });
    // Hosts may return text or HTML when a function crashes or times out.
    // Never show those raw bodies (or a JSON parser exception) to players.
    let data;
    try { data = await response.json(); }
    catch {
      const error = new Error(response.ok
        ? 'The AI server returned an invalid response. Please try again later.'
        : `The AI server is temporarily unavailable (HTTP ${response.status}). Please try again later.`);
      error.code = `TOMO_HTTP_${response.status}`;
      throw error;
    }
    if (!response.ok) {
      const error = new Error(data.error || 'AI reading is temporarily unavailable.');
      error.code = data.code || `TOMO_HTTP_${response.status}`;
      if (typeof data.reference === 'string' && /^[\da-f-]{36}$/i.test(data.reference)) error.reference = data.reference;
      const delay = Number(data.retryAfterSeconds || response.headers?.get?.('Retry-After'));
      if (Number.isFinite(delay) && delay > 0) error.retryAfterSeconds = Math.min(86400, Math.ceil(delay));
      throw error;
    }
    const validated = validateBurmeseReading(validateReading(data, data.chemistry_score),
      { relType: inputs.relType, names: [inputs.p1Name, inputs.p2Name] });
    return { ...validated, readingInfo: data.readingInfo };
  } catch (error) {
    if (error.name === 'AbortError' && !signal?.aborted) throw Object.assign(new Error('The AI reading timed out. Please try again.'), { code: 'AI_TIMEOUT' });
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', cancel);
  }
}
