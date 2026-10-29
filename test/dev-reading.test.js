import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { readingDevPlugin } from '../server/dev-reading-plugin.mjs';

const inputs = { p1Name: 'Alice', p1Dob: '1996-06-15', p2Name: 'Bob', p2Dob: '1996-10-08', relType: 'Friends', mood: 'Sweet' };

async function start(t, options) {
  const server = await createServer({ configFile: false, appType: 'custom', logLevel: 'silent',
    plugins: [readingDevPlugin(options)], server: { host: '127.0.0.1', port: 0 } });
  await server.listen();
  t.after(() => server.close());
  return `http://127.0.0.1:${server.httpServer.address().port}/api/reading`;
}

test('Vite serves readings directly without a backend proxy or exposing the server key', async t => {
  let calls = 0;
  const url = await start(t, { env: { GEMINI_API_KEY: 'dev-only-secret' }, read: async (...args) => {
    calls++;
    assert.equal(args[7], 'dev-only-secret');
    return { chemistry_score: args[6], readingInfo: { source: 'gemini' } };
  } });
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', origin: new URL(url).origin }, body: JSON.stringify(inputs) });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /application\/json/);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const body = await response.text();
  assert.equal(JSON.parse(body).readingInfo.source, 'gemini');
  assert.ok(!body.includes('dev-only-secret'));
  assert.equal(calls, 1);
  for (const [method, body, expected] of [['GET', undefined, 405], ['POST', '{', 400], ['POST', 'x'.repeat(2049), 413]]) {
    const result = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body });
    assert.equal(result.status, expected);
    assert.equal(typeof (await result.json()).error, 'string');
  }
  assert.equal(calls, 1);
});

test('Vite reports missing local key configuration as JSON instead of an empty proxy 500', async t => {
  const url = await start(t, { env: {}, read: () => assert.fail('Must not call Gemini') });
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(inputs) });
  assert.equal(response.status, 503);
  assert.equal((await response.json()).code, 'AI_NOT_CONFIGURED');
});
