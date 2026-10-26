import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createReadingHandler } from '../server/reading-handler.mjs';
import { requestTomoReading } from '../src/utils/readingClient.js';
import { execFileSync } from 'node:child_process';
import readingEndpoint from '../api/reading.js';

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
    assert.equal(args[8].maxAttempts, 1);
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
  const send = async () => { const result = res(); await handler(req(), result); return result; };
  assert.equal((await send()).statusCode, 200);
  assert.equal((await send()).statusCode, 429);
  const spoof = req(); spoof.headers['x-forwarded-for'] = 'different-ip';
  const result = res(); await handler(spoof, result); assert.equal(result.statusCode, 429);
  time += 31000; assert.equal((await send()).statusCode, 200);
  time += 31000; assert.equal((await send()).statusCode, 429);
  assert.equal(calls, 2);
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
test('browser sends only reading inputs to same-origin endpoint and handles unavailable AI', async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/reading');
    assert.deepEqual(JSON.parse(options.body), inputs);
    assert.equal(options.headers['x-goog-api-key'], undefined);
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
