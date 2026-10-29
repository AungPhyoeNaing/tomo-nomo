import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createReadingHandler } from '../server/reading-handler.mjs';
import { requestTomoReading } from '../src/utils/readingClient.js';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import readingEndpoint from '../api/reading.js';
import { READING_TIMEOUT_MS, READING_CLIENT_TIMEOUT_MS, READING_MAX_REQUESTS } from '../src/utils/readingPolicy.js';
import { clearTomoReadingCache, generateDeepProceduralReading } from '../src/utils/gemini.js';
import { calculateSecretMetrics } from '../src/utils/astrology.js';

const inputs = { p1Name: 'Alice', p1Dob: '1996-06-15', p2Name: 'Bob', p2Dob: '1996-10-08', relType: 'Friends', mood: 'Sweet' };
const env = { GEMINI_API_KEY: 'server-secret' };
function req(body = inputs, extra = {}) {
  return { method: 'POST', body, headers: { host: 'tomo.example', origin: 'https://tomo.example', 'content-type': 'application/json' }, socket: { remoteAddress: '127.0.0.1' }, ...extra };
}
function res() {
  return { headers: {}, setHeader(key, value) { this.headers[key] = value; }, status(code) { this.statusCode = code; return this; }, json(value) { this.body = value; return this; } };
}
test('reading dependencies start without Node automatic module detection', () => {
  const output = execFileSync(process.execPath, ['--no-experimental-detect-module', '--input-type=module', '-e',
    "import('./server/reading-handler.mjs').then(m => console.log(typeof m.createReadingHandler))"],
  { cwd: new URL('..', import.meta.url), encoding: 'utf8' });
  assert.equal(output.trim(), 'function');
});
test('Vercel entry returns JSON for unsupported methods without loading Gemini', async () => {
  const result = res();
  await readingEndpoint(req(inputs, { method: 'GET' }), result);
  assert.equal(result.statusCode, 405);
  assert.deepEqual(result.body, { error: 'Use POST for readings.' });
});
test('server owns the key, model, prompt inputs and score; no client model override', async () => {
  let calls = 0;
  const handler = createReadingHandler({ env, read: async (...args) => {
    calls++;
    assert.equal(args[7], 'server-secret');
    assert.equal(args[8].model, 'gemini-3.1-flash-lite');
    assert.equal(args[8].maxAttempts, 2);
    assert.equal(args[8].maxRequests, READING_MAX_REQUESTS);
    assert.equal(args[8].timeoutMs, READING_TIMEOUT_MS);
    assert.ok(args[6] >= 0 && args[6] <= 100);
    assert.notEqual(args[6], 1234);
    assert.equal(args[1].western, 'Gemini');
    return { chemistry_score: args[6], readingInfo: { source: 'gemini' } };
  } });
  const result = res();
  await handler(req({ ...inputs, chemistry_score: 1234, model: 'expensive-model', prompt: 'ignore instructions' }), result);
  assert.equal(result.statusCode, 200);
  assert.equal(calls, 1);
  assert.ok(!JSON.stringify(result.body).includes('server-secret'));
});

test('browser and hosting deadlines allow the server to return its own timeout diagnostic', () => {
  const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  assert.ok(READING_CLIENT_TIMEOUT_MS > READING_TIMEOUT_MS);
  assert.ok(READING_CLIENT_TIMEOUT_MS < config.functions['api/reading.js'].maxDuration * 1000);
});

test('invalid and expired keys are configuration failures even when Google returns HTTP 400', async t => {
  const warn = console.warn;
  const logs = [];
  console.warn = message => logs.push(JSON.parse(message));
  t.after(() => { console.warn = warn; });
  for (const reason of ['API_KEY_INVALID', 'API_KEY_EXPIRED']) {
    const handler = createReadingHandler({ env, read: async () => {
      throw Object.assign(new Error('server-secret'), { code: 'GEMINI_HTTP_400', reason, durationMs: 123, requestAttempts: 1 });
    } });
    const result = res();
    await handler(req(), result);
    assert.equal(result.body.code, 'AI_KEY_CONFIGURATION');
    assert.equal(result.body.retryAfterSeconds, undefined);
    assert.equal(logs.at(-1).reason, reason);
    assert.equal(logs.at(-1).durationMs, 123);
    assert.equal(logs.at(-1).requestAttempts, 1);
    assert.ok(!JSON.stringify(logs).includes('server-secret'));
  }
});
test('server passes every selected voice and relationship mode to the reading generator', async () => {
  const seen = new Set();
  for (const mode of ['Friends', 'Couple']) for (const voice of ['Sweet', 'Playful', 'Mystic']) {
    const handler = createReadingHandler({ env, read: async (...args) => {
      assert.equal(args[4], mode);
      assert.equal(args[5], voice);
      seen.add(`${args[4]}/${args[5]}`);
      return {};
    } });
    const result = res();
    await handler(req({ ...inputs, relType: mode, mood: voice }), result);
    assert.equal(result.statusCode, 200);
  }
  assert.equal(seen.size, 6);
});
test('invalid methods, origins, input, large bodies and missing keys never call Gemini', async () => {
  const handler = createReadingHandler({ env, read: () => assert.fail('Must not call Gemini') });
  for (const [request, status] of [
    [req(inputs, { method: 'GET' }), 405],
    [req(inputs, { headers: { origin: 'https://attacker.example', host: 'tomo.example' } }), 403],
    [req({ ...inputs, p1Dob: '2025-02-31' }), 400],
    [req({ ...inputs, p1Name: {} }), 400],
    [req('x'.repeat(2049)), 413],
    [req('{'), 400]
  ]) {
    const result = res(); await handler(request, result); assert.equal(result.statusCode, status);
  }
  const result = res(); await createReadingHandler({ env: {} })(req(), result); assert.equal(result.statusCode, 503);
});
test('cooldown and instance budget bound requests and ignore spoofed forwarding headers', async () => {
  let time = 1000000, calls = 0;
  const handler = createReadingHandler({ env: { ...env, TOMO_AI_REQUESTS_PER_DAY: '2' }, now: () => time, read: async () => { calls++; return {}; } });
  const send = async (body = inputs) => { const result = res(); await handler(req(body), result); return result; };
  assert.equal((await send()).statusCode, 200);
  const changed = { ...inputs, mood: 'Playful' };
  const limited = await send(changed);
  assert.equal(limited.statusCode, 429);
  assert.equal(limited.body.code, 'APP_COOLDOWN');
  assert.equal(limited.headers['Retry-After'], '3');
  const spoof = req(changed); spoof.headers['x-forwarded-for'] = 'different-ip';
  const result = res(); await handler(spoof, result); assert.equal(result.statusCode, 429);
  time += 3100; assert.equal((await send(changed)).statusCode, 200);
  time += 3100;
  const daily = await send({ ...inputs, mood: 'Mystic' });
  assert.equal(daily.statusCode, 429);
  assert.equal(daily.body.code, 'APP_DAILY_LIMIT');
  assert.equal((await send()).statusCode, 200); // cached, even at budget limit
  assert.equal(calls, 2);
});

test('cached readings bypass cooldown and budgets; duplicate pending requests use one generation', async () => {
  let finish, calls = 0;
  const handler = createReadingHandler({ env: { ...env, TOMO_AI_REQUESTS_PER_MINUTE: '1' }, read: () => {
    calls++;
    return new Promise(resolve => { finish = resolve; });
  } });
  const first = res(), second = res();
  const a = handler(req(), first);
  const b = handler(req(), second);
  assert.equal(calls, 1);
  finish({ readingInfo: { source: 'gemini', cached: false }, chemistry_score: 72 });
  await Promise.all([a, b]);
  assert.equal(first.statusCode, 200);
  assert.equal(second.statusCode, 200);
  first.body.chemistry_score = -1;
  const cached = res(); await handler(req(), cached);
  assert.equal(cached.statusCode, 200);
  assert.equal(cached.body.readingInfo.cached, true);
  assert.equal(cached.body.chemistry_score, 72);
  assert.equal(calls, 1);
});

test('failed generations release the visitor cooldown for an immediate manual retry', async () => {
  let calls = 0;
  const handler = createReadingHandler({ env, read: async () => {
    if (++calls === 1) throw Object.assign(new Error('Sensitive upstream text'), { code: 'GEMINI_TIMEOUT' });
    return { chemistry_score: 72 };
  } });
  const first = res(); await handler(req(), first);
  assert.equal(first.statusCode, 503);
  assert.equal(first.body.code, 'AI_TIMEOUT');
  const second = res(); await handler(req(), second);
  assert.equal(second.statusCode, 200);
  assert.equal(calls, 2);
});

test('production repairs a rejected reading once and accounts for both Google requests', async t => {
  const original = globalThis.fetch;
  clearTomoReadingCache();
  t.after(() => { globalThis.fetch = original; clearTomoReadingCache(); });
  const fixture = generateDeepProceduralReading('Alice', calculateSecretMetrics('Alice', inputs.p1Dob),
    'Bob', calculateSecretMetrics('Bob', inputs.p2Dob), 'Friends', 'Sweet', 72);
  let calls = 0;
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ candidates: [{ finishReason: 'STOP', content: {
    parts: [{ text: JSON.stringify(++calls === 1 ? { ...fixture, tomo_secret_advice: 'English' } : fixture) }]
  } }] }) });
  let time = 1000000;
  const handler = createReadingHandler({ env: { ...env, TOMO_AI_REQUESTS_PER_MINUTE: '2' }, now: () => time });
  const repaired = res(); await handler(req(), repaired);
  assert.equal(repaired.statusCode, 200);
  assert.equal(repaired.body.readingInfo.attempts, 2);
  assert.equal(repaired.body.readingInfo.requestAttempts, 2);
  assert.equal(calls, 2);
  time += 4000;
  const limited = res(); await handler(req({ ...inputs, mood: 'Mystic' }), limited);
  assert.equal(limited.body.code, 'APP_MINUTE_LIMIT');
  assert.equal(calls, 2);
  const cached = res(); await handler(req(), cached);
  assert.equal(cached.body.readingInfo.cached, true);
  assert.equal(calls, 2);
});

test('concurrency limits identify busy server separately from a quota', async () => {
  const finishes = [];
  const handler = createReadingHandler({ env: { ...env, TOMO_AI_MAX_CONCURRENT: '2' }, read: () => new Promise(resolve => finishes.push(resolve)) });
  const a = handler(req(), res());
  const b = handler(req({ ...inputs, mood: 'Playful' }, { socket: { remoteAddress: '127.0.0.2' } }), res());
  const blocked = res();
  await handler(req({ ...inputs, mood: 'Mystic' }, { socket: { remoteAddress: '127.0.0.3' } }), blocked);
  assert.equal(blocked.statusCode, 503);
  assert.equal(blocked.body.code, 'APP_BUSY');
  assert.equal(blocked.body.retryAfterSeconds, 3);
  for (const finish of finishes) finish({ chemistry_score: 72 });
  await Promise.all([a, b]);
});

test('five distinct sessions on shared Wi-Fi start concurrently and release all capacity', async () => {
  let calls = 0;
  const finishes = [];
  const handler = createReadingHandler({ env, read: (...args) => {
    calls++;
    return new Promise(resolve => finishes.push(() => resolve({ chemistry_score: args[6] })));
  } });
  const sessionReq = i => req({ ...inputs, p1Name: `Player ${i}` }, {
    headers: { ...req().headers, 'x-tomo-session': i.toString(16).padStart(32, '0') }
  });
  const results = Array.from({ length: 5 }, res);
  const pending = results.map((result, i) => handler(sessionReq(i), result));
  assert.equal(calls, 5, 'all five must start before any is finished');
  const duplicateBrowser = res();
  await handler(req({ ...inputs, p1Name: 'Another pair' }, { headers: sessionReq(0).headers }), duplicateBrowser);
  assert.equal(duplicateBrowser.body.code, 'APP_COOLDOWN');
  const sixth = res();
  await handler(req({ ...inputs, p1Name: 'Sixth pair' }, { socket: { remoteAddress: '127.0.0.2' } }), sixth);
  assert.equal(sixth.body.code, 'APP_BUSY');
  assert.equal(calls, 5);
  finishes.splice(0).forEach(finish => finish());
  await Promise.all(pending);
  results.forEach(result => assert.equal(result.statusCode, 200));
  const next = handler(req({ ...inputs, p1Name: 'Sixth pair' }, { socket: { remoteAddress: '127.0.0.2' } }), sixth);
  assert.equal(calls, 6);
  finishes.splice(0).forEach(finish => finish());
  await next;
  assert.equal(sixth.statusCode, 200);
});

test('rotating browser IDs cannot bypass the shared network burst limit', async () => {
  let calls = 0;
  const handler = createReadingHandler({ env, read: async () => { calls++; return {}; } });
  for (let i = 0; i < 6; i++) {
    const result = res();
    await handler(req({ ...inputs, p1Name: `Person ${i}` }, {
      headers: { ...req().headers, 'x-tomo-session': i.toString(16).padStart(32, '0') }
    }), result);
    assert.equal(result.statusCode, i < 5 ? 200 : 429);
    if (i === 5) assert.equal(result.body.code, 'APP_COOLDOWN');
  }
  assert.equal(calls, 5);
});

test('five simultaneous readings have budget for one repair each, but never an eleventh call', async t => {
  const original = globalThis.fetch;
  clearTomoReadingCache();
  t.after(() => { globalThis.fetch = original; clearTomoReadingCache(); });
  const attempts = new Map();
  globalThis.fetch = async (_, options) => {
    const prompt = JSON.parse(options.body).contents[0].parts[0].text;
    const data = JSON.parse(prompt.split('INPUT_DATA_JSON:\n')[1].split('\nRepair instruction:')[0]);
    const name = data.people[0].name;
    const attempt = (attempts.get(name) || 0) + 1;
    attempts.set(name, attempt);
    const fixture = generateDeepProceduralReading(name, calculateSecretMetrics(name, inputs.p1Dob),
      'Bob', calculateSecretMetrics('Bob', inputs.p2Dob), 'Friends', 'Sweet', 72);
    return { ok: true, json: async () => ({ candidates: [{ finishReason: 'STOP', content: {
      parts: [{ text: JSON.stringify(attempt === 1 ? { ...fixture, tomo_secret_advice: 'English' } : fixture) }]
    } }] }) };
  };
  let time = 1000000;
  const handler = createReadingHandler({ env, now: () => time });
  const results = await Promise.all(Array.from({ length: 5 }, async (_, i) => {
    const result = res();
    await handler(req({ ...inputs, p1Name: `Reader ${i}` }, { socket: { remoteAddress: `127.0.0.${i + 1}` } }), result);
    return result;
  }));
  for (const result of results) {
    assert.equal(result.statusCode, 200);
    assert.equal(result.body.readingInfo.requestAttempts, 2);
  }
  assert.deepEqual([...attempts.values()], [2, 2, 2, 2, 2]);
  time += 4000;
  const limited = res();
  await handler(req({ ...inputs, p1Name: 'Eleventh request' }), limited);
  assert.equal(limited.body.code, 'APP_MINUTE_LIMIT');
  assert.equal(attempts.size, 5);
});

test('Google quota cooldown blocks new calls and repairs while keeping cached readings available', async t => {
  const warn = console.warn;
  console.warn = () => {};
  t.after(() => { console.warn = warn; });
  let time = 1000000, calls = 0;
  let reserveRetry;
  const handler = createReadingHandler({ env, now: () => time, read: async (...args) => {
    calls++;
    reserveRetry = args[8].reserveRetry;
    if (calls === 2) throw Object.assign(new Error('Quota exceeded'), { code: 'GEMINI_HTTP_429', retryAfterSeconds: 42 });
    return { chemistry_score: 72 };
  } });
  await handler(req(), res());
  time += 4000;
  const limited = res();
  await handler(req({ ...inputs, mood: 'Mystic' }), limited);
  assert.equal(limited.body.code, 'GEMINI_RATE_LIMIT');
  assert.equal(reserveRetry(), false);
  time += 1000;
  const paused = res();
  await handler(req({ ...inputs, mood: 'Playful' }), paused);
  assert.equal(paused.body.code, 'GEMINI_RATE_LIMIT');
  assert.equal(paused.headers['Retry-After'], '41');
  const cached = res(); await handler(req(), cached);
  assert.equal(cached.statusCode, 200);
  assert.equal(calls, 2);
  time += 41000;
  const recovered = res(); await handler(req({ ...inputs, mood: 'Playful' }), recovered);
  assert.equal(recovered.statusCode, 200);
  assert.equal(calls, 3);
});

test('provider quota waits are kept separate from the app cooldown', async () => {
  const handler = createReadingHandler({ env, read: async () => { throw Object.assign(new Error('server-secret'), { code: 'GEMINI_HTTP_429', retryAfterSeconds: 42 }); } });
  const result = res(); await handler(req(), result);
  assert.equal(result.statusCode, 429);
  assert.equal(result.body.code, 'GEMINI_RATE_LIMIT');
  assert.equal(result.body.retryAfterSeconds, 42);
  assert.equal(result.headers['Retry-After'], '42');
  assert.ok(!JSON.stringify(result.body).includes('server-secret'));
});

test('provider retry reservations obey the same minute/day request allowance', async () => {
  for (const limits of [{ TOMO_AI_REQUESTS_PER_MINUTE: '1' }, { TOMO_AI_REQUESTS_PER_DAY: '1' }]) {
    const handler = createReadingHandler({ env: { ...env, ...limits }, read: async (...args) => {
      assert.equal(args[8].maxTransientRetries, 1);
      assert.equal(args[8].reserveRetry(), false);
      return {};
    } });
    const result = res(); await handler(req(), result);
    assert.equal(result.statusCode, 200);
  }
  let time = 1000000;
  const handler = createReadingHandler({ env: { ...env, TOMO_AI_REQUESTS_PER_MINUTE: '2' }, now: () => time, read: async (...args) => {
    assert.equal(args[8].reserveRetry(), true);
    return {};
  } });
  const result = res(); await handler(req(), result);
  time += 4000;
  const limited = res(); await handler(req({ ...inputs, mood: 'Mystic' }), limited);
  assert.equal(limited.body.code, 'APP_MINUTE_LIMIT');
});

test('failure logs distinguish upstream/network errors without personal data or secrets', async t => {
  const original = console.warn;
  const logs = [];
  console.warn = message => logs.push(JSON.parse(message));
  t.after(() => { console.warn = original; });
  for (const [code, expected] of [['GEMINI_HTTP_503', 'AI_PROVIDER_UNAVAILABLE'], ['GEMINI_NETWORK', 'AI_NETWORK'], ['GEMINI_RESPONSE', 'AI_PROVIDER_RESPONSE']]) {
    const handler = createReadingHandler({ env, read: async () => {
      throw Object.assign(new Error('server-secret Alice Bob private upstream body'), { code, cause: { cause: { code: 'ECONNRESET' } } });
    } });
    const result = res(); await handler(req(), result);
    assert.equal(result.statusCode, 503);
    assert.equal(result.body.code, expected);
    assert.ok(result.body.reference);
    assert.ok(result.body.retryAfterSeconds > 0);
    assert.ok(!/server-secret|Alice|Bob|private/.test(JSON.stringify(result.body)));
  }
  assert.equal(logs.length, 3);
  assert.equal(logs[1].networkCause, 'ECONNRESET');
  assert.ok(!/server-secret|Alice|Bob|private/.test(JSON.stringify(logs)));
});
test('upstream errors are sanitized and quota failures are not retried', async () => {
  for (const code of ['GEMINI_HTTP_429', 'GEMINI_HTTP_400']) {
    let calls = 0;
    const handler = createReadingHandler({ env, read: async () => { calls++; throw Object.assign(new Error('server-secret sensitive upstream detail'), { code }); } });
    const result = res(); await handler(req(), result);
    assert.equal(result.statusCode, code.endsWith('429') ? 429 : 503);
    assert.ok(!JSON.stringify(result.body).includes('server-secret'));
    assert.equal(calls, 1);
  }
});
test('quality diagnostics expose only fixed validator instructions', async t => {
  const warn = console.warn;
  console.warn = () => {};
  t.after(() => { console.warn = warn; });
  const message = 'Reading quality check: keep Friends mode platonic.';
  const handler = createReadingHandler({ env, read: async () => { throw Object.assign(new Error(message), { code: 'GEMINI_QUALITY' }); } });
  const result = res(); await handler(req(), result);
  assert.equal(result.statusCode, 502);
  assert.equal(result.body.code, 'READING_QUALITY');
  assert.equal(result.body.check, message);
  assert.equal(JSON.stringify(result.body).includes(env.GEMINI_API_KEY), false);
});
test('browser sends only reading inputs to same-origin endpoint and handles unavailable AI', async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/reading');
    assert.deepEqual(JSON.parse(options.body), inputs);
    assert.equal(options.headers['x-goog-api-key'], undefined);
    assert.match(options.headers['X-Tomo-Session'], /^[a-f0-9]{32}$/);
    return { ok: false, status: 429, json: async () => ({ error: 'AI is busy.' }) };
  };
  await assert.rejects(requestTomoReading(inputs), { message: 'AI is busy.', code: 'TOMO_HTTP_429' });
});

test('plain-text host failures and HTML responses never expose parser errors', async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  for (const [status, body] of [[500, 'A server error has occurred\nFUNCTION_INVOCATION_FAILED'], [504, '<html>Gateway timeout</html>'], [200, '<html>SPA fallback</html>']]) {
    globalThis.fetch = async () => new Response(body, { status });
    await assert.rejects(requestTomoReading(inputs), error => {
      assert.equal(error.code, `TOMO_HTTP_${status}`);
      assert.ok(error.message.includes(status === 200 ? 'invalid response' : `HTTP ${status}`));
      assert.ok(!/Unexpected token|FUNCTION_INVOCATION_FAILED|<html>/.test(error.message));
      return true;
    });
  }
});

test('browser preserves the server retry countdown without automatically retrying Gemini', async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return new Response(JSON.stringify({ error: 'Please wait.', code: 'APP_MINUTE_LIMIT', retryAfterSeconds: 27 }), { status: 429, headers: { 'Retry-After': '27' } });
  };
  await assert.rejects(requestTomoReading(inputs), { code: 'APP_MINUTE_LIMIT', retryAfterSeconds: 27 });
  assert.equal(calls, 1);
});

test('browser preserves the support reference for failures without a retry countdown', async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  const reference = '12345678-1234-4321-9876-123456789abc';
  globalThis.fetch = async () => new Response(JSON.stringify({
    error: 'The AI service key needs attention from the site owner.', code: 'AI_KEY_CONFIGURATION', reference
  }), { status: 503 });
  await assert.rejects(requestTomoReading(inputs), { code: 'AI_KEY_CONFIGURATION', reference });
});
