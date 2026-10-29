import { calculateDetailedMetricsBreakdown } from './astrology.js';
import { validateReading, validateBurmeseReading, normalizePersonName } from './reading.js';
import { DEFAULT_TOMO_MODEL, TOMO_MODELS, TOMO_PROMPT_VERSION, BURMESE_READING_SYSTEM, buildTomoPrompt, TOMO_RESPONSE_SCHEMA } from './tomoPrompt.js';
import { generateDeepProceduralReading } from './proceduralReading.js';
import { READING_TIMEOUT_MS, READING_MAX_REQUESTS } from './readingPolicy.js';
import { SCORING_VERSION } from './pairScoring.js';
export { generateDeepProceduralReading };

export const DEMO_RESULT = generateDeepProceduralReading(
  'သူရိန်',
  { western: 'Gemini', westernElement: 'Air' },
  'သီရိ',
  { western: 'Libra', westernElement: 'Air' },
  'Friends',
  'Sweet',
  94
);

export const PLAYFUL_DEMO_RESULT = generateDeepProceduralReading(
  'သူရိန်',
  { western: 'Gemini', westernElement: 'Air' },
  'သီရိ',
  { western: 'Libra', westernElement: 'Air' },
  'Friends',
  'Playful',
  94
);

// =========================================================
// CALL GEMINI 3.1 FLASH LITE WITH DYNAMIC DIVERSE DIRECTIVES
// =========================================================
const readingCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;
export function clearTomoReadingCache() { readingCache.clear(); }

export async function fetchTomoDestinyReading(p1Name, p1Secret, p2Name, p2Secret, relType, mood, algorithmicScore, apiKey, options = {}) {
  const model = options.model || DEFAULT_TOMO_MODEL;
  if (!TOMO_MODELS.some(item => item.id === model)) throw new Error('Choose a supported Gemini model.');
  if (!['Friends', 'Couple'].includes(relType) || !['Sweet', 'Playful', 'Mystic'].includes(mood)) throw new Error('Choose a valid reading mode and tone.');
  if (!apiKey?.trim()) throw new Error('Add your Gemini API key first.');
  if (!Number.isFinite(algorithmicScore) || algorithmicScore < 0 || algorithmicScore > 100) throw new Error('Invalid symbolic game score.');
  const names = [normalizePersonName(p1Name), normalizePersonName(p2Name)];
  if (names.some(name => !name || name.length > 80)) throw new Error('Enter two names of up to 80 characters.');
  const promptText = buildTomoPrompt({ p1Name: names[0], p1Secret, p2Name: names[1], p2Secret, relType, mood, algorithmicScore,
    breakdown: calculateDetailedMetricsBreakdown(p1Secret, p2Secret, relType).map(({ label, score, baseline, weight, rules }) => ({ label, score, baseline, weight, rules })) });
  // Cache only in memory, for this key/model/input/prompt version. Never put keys in URLs or persist readings.
  const canCache = Boolean(globalThis.crypto?.subtle);
  const keyBytes = canCache ? await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(apiKey.trim())) : null;
  const keyDigest = keyBytes ? Array.from(new Uint8Array(keyBytes), byte => byte.toString(16).padStart(2, '0')).join('') : null;
  const cacheKey = JSON.stringify([TOMO_PROMPT_VERSION, keyDigest, model, promptText]);
  if (options.signal?.aborted) throw new DOMException('Reading cancelled.', 'AbortError');
  const now = Date.now();
  for (const [key, entry] of readingCache) if (entry.expiresAt <= now) readingCache.delete(key);
  const cached = canCache ? readingCache.get(cacheKey) : undefined;
  if (cached) return structuredClone({ ...cached.reading, readingInfo: { ...cached.reading.readingInfo, cached: true } });

  const payload = {
    systemInstruction: { parts: [{ text: BURMESE_READING_SYSTEM }] },
    contents: [{ role: 'user', parts: [{ text: promptText }] }],
    generationConfig: {
      temperature: 1,
      maxOutputTokens: 16384,
      thinkingConfig: { thinkingLevel: 'low' },
      responseMimeType: 'application/json',
      responseSchema: TOMO_RESPONSE_SCHEMA
    }
  };
  const controller = new AbortController();
  let timedOut = false;
  const cancel = () => controller.abort();
  options.signal?.addEventListener('abort', cancel, { once: true });
  const timeoutMs = options.timeoutMs ?? READING_TIMEOUT_MS;
  const timeoutId = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  let lastQualityError;
  let totalTokens = 0;
  let requestAttempts = 0;
  let transientRetries = 0;
  const deadline = Date.now() + timeoutMs;
  const maxRequests = options.maxRequests ?? READING_MAX_REQUESTS;
  // A repair needs enough time for another full response, not just a POST.
  const minimumRetryTime = () => Math.max(15000, Math.ceil((Date.now() - now) / Math.max(1, requestAttempts) * 1.25));
  const retryTransient = async error => {
    if (!['GEMINI_HTTP_500', 'GEMINI_HTTP_502', 'GEMINI_HTTP_503', 'GEMINI_HTTP_504'].includes(error.code) ||
        options.maxTransientRetries !== 1 || transientRetries >= 1 || requestAttempts >= maxRequests || controller.signal.aborted) return false;
    const delay = error.retryAfterSeconds ? error.retryAfterSeconds * 1000 : (options.retryDelayMs ?? 750 + Math.random() * 500);
    if (deadline - Date.now() < delay + minimumRetryTime()) return false;
    // The endpoint reserves a real upstream request from its shared budget.
    // Do not bypass quota controls just because this is an internal retry.
    if (options.reserveRetry && !options.reserveRetry()) return false;
    transientRetries++;
    await new Promise((resolve, reject) => {
      const cancel = () => { clearTimeout(timer); controller.signal.removeEventListener('abort', cancel); reject(new DOMException('Reading cancelled.', 'AbortError')); };
      const timer = setTimeout(() => { controller.signal.removeEventListener('abort', cancel); resolve(); }, delay);
      controller.signal.addEventListener('abort', cancel, { once: true });
      if (controller.signal.aborted) cancel();
    });
    return true;
  };
  try {
    // At most one repair, only for malformed/poor-language content. Never retry quota/auth errors.
    for (let attempt = 0; attempt < (options.maxAttempts === 1 ? 1 : 2); attempt++) {
      if (controller.signal.aborted) throw new DOMException('Reading cancelled.', 'AbortError');
      if (attempt > 0 && (requestAttempts >= maxRequests || deadline - Date.now() < minimumRetryTime() ||
          (options.reserveRetry && !options.reserveRetry()))) break;
      const requestPayload = attempt === 0 ? payload : {
        ...payload,
        contents: [{ role: 'user', parts: [{ text: promptText + '\nRepair instruction: the previous attempt failed this app check: ' + lastQualityError.message + '\nWrite the complete JSON again; check all Burmese fields and the exact four-block/three-item structure.' }] }]
      };
      let response;
      while (!response?.ok) {
        try {
          requestAttempts++;
          response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey.trim() },
            body: JSON.stringify(requestPayload), signal: controller.signal
          });
        } catch (cause) {
          if (controller.signal.aborted || cause.name === 'AbortError') throw cause;
          // A transport failure may happen after Google accepted a POST. Do
          // not blindly repeat it and risk spending quota twice.
          throw Object.assign(new Error('Could not connect to Google Gemini.'), { code: 'GEMINI_NETWORK', cause });
        }
        if (response.ok) break;
        const errorJson = await response.json().catch(() => ({}));
        const message = String(errorJson.error?.message || `Gemini HTTP ${response.status}`).split(apiKey.trim()).join('[key]').slice(0, 180);
        const error = new Error(message);
        error.code = `GEMINI_HTTP_${response.status}`;
        const details = Array.isArray(errorJson.error?.details) ? errorJson.error.details : [];
        const reason = details.find(detail => ['API_KEY_INVALID', 'API_KEY_EXPIRED'].includes(detail.reason))?.reason;
        if (reason) error.reason = reason;
        if (response.status === 429 || response.status >= 500) {
          const retry = details.find(detail => detail['@type']?.endsWith('/google.rpc.RetryInfo'))?.retryDelay;
          const delay = typeof retry === 'string' && /^\d+(?:\.\d+)?s$/.test(retry) ? Math.ceil(Number(retry.slice(0, -1))) : Number(response.headers?.get?.('Retry-After'));
          if (Number.isFinite(delay) && delay > 0) error.retryAfterSeconds = Math.min(86400, Math.ceil(delay));
        }
        if (await retryTransient(error)) continue;
        throw error;
      }
      let data;
      try { data = await response.json(); }
      catch (cause) {
        if (controller.signal.aborted) throw cause;
        throw Object.assign(new Error('Google Gemini returned an unreadable response.'), { code: 'GEMINI_RESPONSE' });
      }
      if (!data || typeof data !== 'object') throw Object.assign(new Error('Google Gemini returned an empty response.'), { code: 'GEMINI_RESPONSE' });
      const candidate = data.candidates?.[0];
      totalTokens += Number(data.usageMetadata?.totalTokenCount) || 0;
      if (data.promptFeedback?.blockReason || (candidate?.finishReason && candidate.finishReason !== 'STOP')) {
        const error = new Error(candidate?.finishReason === 'MAX_TOKENS' ? 'Gemini reached the output limit. Try the built-in reading or another model.' : 'Gemini could not complete this reading.');
        error.code = candidate?.finishReason === 'MAX_TOKENS' ? 'GEMINI_OUTPUT_LIMIT' : 'GEMINI_INCOMPLETE';
        throw error;
      }
      const jsonText = candidate?.content?.parts?.filter(part => !part.thought && typeof part.text === 'string').map(part => part.text).join('');
      if (!jsonText) throw Object.assign(new Error('Google Gemini returned no reading text.'), { code: 'GEMINI_RESPONSE' });
      try {
        const validated = validateReading(JSON.parse(jsonText), algorithmicScore);
        const reading = validateBurmeseReading(validated, { relType, names, expanded: true });
        const result = { ...reading, readingInfo: { source: 'gemini', model, mood, relType, cached: false, attempts: attempt + 1, requestAttempts, transientRetries, totalTokens, durationMs: Date.now() - now, promptVersion: TOMO_PROMPT_VERSION, scoringVersion: SCORING_VERSION } };
        if (canCache) {
          if (readingCache.size >= 8) readingCache.delete(readingCache.keys().next().value);
          readingCache.set(cacheKey, { reading: structuredClone(result), expiresAt: Date.now() + CACHE_TTL_MS });
        }
        return result;
      } catch (error) {
        lastQualityError = new Error(error instanceof SyntaxError ? 'Return a complete valid JSON object without code fences.' : error.message);
      }
    }
    lastQualityError.code = 'GEMINI_QUALITY';
    throw lastQualityError;
  } catch (error) {
    const failure = error.name === 'AbortError' && timedOut
      ? Object.assign(new Error(`Gemini request timed out after ${timeoutMs / 1000} seconds.`), { code: 'GEMINI_TIMEOUT' }) : error;
    failure.requestAttempts = requestAttempts;
    failure.transientRetries = transientRetries;
    failure.durationMs = Date.now() - now;
    throw failure;
  } finally {
    clearTimeout(timeoutId);
    options.signal?.removeEventListener('abort', cancel);
  }
}
