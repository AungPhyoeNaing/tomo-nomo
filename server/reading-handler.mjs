import { createHash } from 'node:crypto';
import { calculateSecretMetrics, calculateAlgorithmicScore } from '../src/utils/astrology.js';
import { fetchTomoDestinyReading } from '../src/utils/gemini.js';
import { isValidBirthDate, normalizePersonName } from '../src/utils/reading.js';
import { DEFAULT_TOMO_MODEL } from '../src/utils/tomoPrompt.js';

// These bounds are per running instance. Google project quotas remain the hard
// upstream limit; serverless instances do not share this memory.
export function createReadingHandler({ env = process.env, read = fetchTomoDestinyReading, now = Date.now } = {}) {
  const visitors = new Map();
  let minute = { start: 0, count: 0 };
  let day = { start: 0, count: 0 };
  let active = 0;
  const positive = (name, fallback) => /^\d+$/.test(env[name] || '') && Number(env[name]) > 0 ? Number(env[name]) : fallback;
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
    if (!env.GEMINI_API_KEY?.trim()) return fail(503, 'AI readings are not configured yet.');
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
    // Only trust Vercel's platform-set forwarding header there. On the Node
    // server use the socket address, never an arbitrary client-supplied header.
    const ip = env.VERCEL === '1' ? String(req.headers['x-vercel-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim() : req.socket?.remoteAddress || 'unknown';
    const visitor = createHash('sha256').update(ip).digest('hex');
    if (visitors.has(visitor) || visitors.size >= 10000 || active >= 2 ||
        minute.count >= positive('TOMO_AI_REQUESTS_PER_MINUTE', 5) || day.count >= positive('TOMO_AI_REQUESTS_PER_DAY', 100)) {
      res.setHeader('Retry-After', '60');
      return fail(429, 'AI is busy. Please try again later, or enjoy the built-in story.');
    }
    visitors.set(visitor, time + 30000);
    minute.count++; day.count++; active++;
    try {
      const first = calculateSecretMetrics(p1Name, p1Dob), second = calculateSecretMetrics(p2Name, p2Dob);
      const score = calculateAlgorithmicScore(first, second, relType);
      const reading = await read(p1Name, first, p2Name, second, relType, mood, score, env.GEMINI_API_KEY.trim(),
        { model: DEFAULT_TOMO_MODEL, timeoutMs: 50000, maxAttempts: 1 });
      return res.status(200).json(reading);
    } catch (error) {
      // Never expose Google's error body, credentials or user input.
      if (error.code === 'GEMINI_QUALITY') console.warn('Tomo reading quality check failed:', error.message);
      if (error.code === 'GEMINI_HTTP_429') { res.setHeader('Retry-After', '60'); return fail(429, 'AI capacity is temporarily full. Please try again later.'); }
      return fail(503, 'AI could not finish this reading. Please try again later.');
    } finally { active--; }
  };
}
