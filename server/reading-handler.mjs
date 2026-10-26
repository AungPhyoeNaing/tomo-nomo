import { createHash } from 'node:crypto';
import { calculateSecretMetrics, calculateAlgorithmicScore } from '../src/utils/astrology.js';
import { fetchTomoDestinyReading } from '../src/utils/gemini.js';
import { isValidBirthDate, normalizePersonName } from '../src/utils/reading.js';
import { DEFAULT_TOMO_MODEL, TOMO_PROMPT_VERSION } from '../src/utils/tomoPrompt.js';

// These bounds are per running instance. Google project quotas remain the hard
// upstream limit; serverless instances do not share this memory.
export function createReadingHandler({ env = process.env, read = fetchTomoDestinyReading, now = Date.now } = {}) {
  const visitors = new Map();
  const cache = new Map();
  const pending = new Map();
  let minute = { start: 0, count: 0 };
  let day = { start: 0, count: 0 };
  let active = 0;
  const positive = (name, fallback) => /^\d+$/.test(env[name] || '') && Number(env[name]) > 0 ? Number(env[name]) : fallback;
  const sendError = (res, status, message, code, retryAfterSeconds = 0, extra = {}) => {
    if (retryAfterSeconds) res.setHeader('Retry-After', String(retryAfterSeconds));
    return res.status(status).json({ error: message, code, ...(retryAfterSeconds ? { retryAfterSeconds } : {}), ...extra });
  };
  const sendResult = (res, result, cached = false) => {
    if (result.reading) {
      const reading = structuredClone(result.reading);
      if (cached && reading.readingInfo) reading.readingInfo.cached = true;
      return res.status(200).json(reading);
    }
    const error = result.error;
    if (error.code === 'GEMINI_QUALITY') {
      return sendError(res, 502, 'The AI reading did not meet the language or detail requirements. Please try again.', 'READING_QUALITY', 0, { check: error.message });
    }
    if (error.code === 'GEMINI_HTTP_429') {
      return sendError(res, 429, 'Google Gemini has reached its quota or rate limit. Please wait before trying AI again.', 'GEMINI_RATE_LIMIT', error.retryAfterSeconds || 60);
    }
    if (error.reason === 'API_KEY_INVALID' || error.reason === 'API_KEY_EXPIRED' || error.code === 'GEMINI_HTTP_401' || error.code === 'GEMINI_HTTP_403') {
      return sendError(res, 503, 'The AI service key needs attention from the site owner.', 'AI_KEY_CONFIGURATION');
    }
    if (error.code === 'GEMINI_HTTP_400' || error.code === 'GEMINI_HTTP_404') {
      return sendError(res, 503, 'Google Gemini rejected the AI request configuration. The site owner needs to check it.', 'AI_REQUEST_CONFIGURATION');
    }
    if (error.code === 'GEMINI_TIMEOUT') return sendError(res, 503, 'Google Gemini took too long to respond. You can try again.', 'AI_TIMEOUT');
    if (error.code === 'GEMINI_OUTPUT_LIMIT') return sendError(res, 503, 'The AI response was cut short. You can try again.', 'AI_OUTPUT_LIMIT');
    if (error.code === 'GEMINI_INCOMPLETE') return sendError(res, 503, 'Google Gemini could not complete this reading. You can try again.', 'AI_INCOMPLETE');
    return sendError(res, 503, 'The AI service is temporarily unavailable. You can try again.', 'AI_UNAVAILABLE');
  };
  return async function readingHandler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    const fail = (status, message) => res.status(status).json({ error: message });
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return fail(405, 'Use POST for readings.'); }
    const origin = req.headers.origin;
    const host = req.headers.host;
    if (origin) {
      try { if (new URL(origin).host !== host) return fail(403, 'Request this reading from Tomo.'); }
      catch { return fail(403, 'Invalid request origin.'); }
    }
    if (!String(req.headers['content-type'] || '').startsWith('application/json')) return fail(415, 'Send JSON reading details.');
    if (!env.GEMINI_API_KEY?.trim()) return sendError(res, 503, 'AI readings are not configured yet.', 'AI_NOT_CONFIGURED');
    let body = req.body;
    try {
      if (typeof body === 'string' || Buffer.isBuffer(body)) {
        if (Buffer.byteLength(body) > 2048) return fail(413, 'Reading details are too large.');
        body = JSON.parse(body.toString());
      }
      if (!body || Array.isArray(body) || Buffer.byteLength(JSON.stringify(body)) > 2048) return fail(400, 'Invalid reading details.');
    } catch { return fail(400, 'Invalid JSON reading details.'); }
    const { p1Dob, p2Dob, relType, mood } = body;
    if (typeof body.p1Name !== 'string' || typeof body.p2Name !== 'string') return fail(400, 'Enter two names.');
    const p1Name = normalizePersonName(body.p1Name), p2Name = normalizePersonName(body.p2Name);
    if (![p1Name, p2Name].every(name => name.length > 0 && name.length <= 80) ||
        !isValidBirthDate(p1Dob) || !isValidBirthDate(p2Dob) ||
        !['Friends', 'Couple'].includes(relType) || !['Sweet', 'Playful', 'Mystic'].includes(mood)) return fail(400, 'Enter valid names, birthdates, mode and tone.');

    const time = now();
    if (time - minute.start >= 60000) minute = { start: time, count: 0 };
    if (time - day.start >= 86400000) day = { start: time, count: 0 };
    for (const [id, until] of visitors) if (until <= time) visitors.delete(id);
    for (const [id, entry] of cache) if (entry.expiresAt <= time) cache.delete(id);
    const cacheKey = createHash('sha256').update(JSON.stringify([env.GEMINI_API_KEY.trim(), TOMO_PROMPT_VERSION, DEFAULT_TOMO_MODEL, p1Name, p1Dob, p2Name, p2Dob, relType, mood])).digest('hex');
    // Serving a cached result or joining an identical request consumes no
    // additional Gemini call, so do it before any generation rate limits.
    if (cache.has(cacheKey)) return sendResult(res, cache.get(cacheKey).result, true);
    if (pending.has(cacheKey)) return sendResult(res, await pending.get(cacheKey));
    // Only trust Vercel's platform-set forwarding header there. On the Node
    // server use the socket address, never an arbitrary client-supplied header.
    const ip = env.VERCEL === '1' ? String(req.headers['x-vercel-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim() : req.socket?.remoteAddress || 'unknown';
    const visitor = createHash('sha256').update(ip).digest('hex');
    if (visitors.has(visitor)) return sendError(res, 429, 'Please pause briefly before requesting another AI reading.', 'APP_COOLDOWN', Math.max(1, Math.ceil((visitors.get(visitor) - time) / 1000)));
    if (visitors.size >= 10000 || active >= 2) return sendError(res, 503, 'Tomo is handling other readings. Please try again shortly.', 'APP_BUSY', 3);
    if (minute.count >= positive('TOMO_AI_REQUESTS_PER_MINUTE', 5)) return sendError(res, 429, 'Tomo has reached its shared request limit for this minute.', 'APP_MINUTE_LIMIT', Math.max(1, Math.ceil((minute.start + 60000 - time) / 1000)));
    if (day.count >= positive('TOMO_AI_REQUESTS_PER_DAY', 100)) return sendError(res, 429, 'Tomo has reached its daily AI allowance. The built-in story is still available.', 'APP_DAILY_LIMIT', Math.max(1, Math.ceil((day.start + 86400000 - time) / 1000)));
    visitors.set(visitor, time + 3000);
    minute.count++; day.count++; active++;
    const work = (async () => {
      try {
        const first = calculateSecretMetrics(p1Name, p1Dob), second = calculateSecretMetrics(p2Name, p2Dob);
        const score = calculateAlgorithmicScore(first, second, relType);
        const reading = await read(p1Name, first, p2Name, second, relType, mood, score, env.GEMINI_API_KEY.trim(),
          { model: DEFAULT_TOMO_MODEL, timeoutMs: 50000, maxAttempts: 1 });
        return { reading };
      } catch (error) { return { error }; }
    })();
    pending.set(cacheKey, work);
    try {
      const result = await work;
      if (result.reading) {
        if (cache.size >= 8) cache.delete(cache.keys().next().value);
        cache.set(cacheKey, { result, expiresAt: now() + 10 * 60 * 1000 });
      } else {
        // A failed generation must not leave the user locked out for 30s.
        visitors.delete(visitor);
      }
      return sendResult(res, result);
    } finally { pending.delete(cacheKey); active--; }
  };
}
