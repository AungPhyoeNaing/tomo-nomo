import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { createReadingHandler } from '../server/reading-handler.mjs';
import { generateDeepProceduralReading } from '../src/utils/proceduralReading.js';
import { validateBurmeseReading } from '../src/utils/reading.js';

test('five real HTTP reading requests overlap on shared Wi-Fi and a sixth is bounded', { timeout: 10000 }, async () => {
  let release, allStarted;
  const gate = new Promise(resolve => { release = resolve; });
  const started = new Promise(resolve => { allStarted = resolve; });
  let calls = 0, active = 0, peak = 0;
  const handler = createReadingHandler({
    env: { GEMINI_API_KEY: 'test-only-key', VERCEL: '1' },
    read: async (first, firstChart, second, secondChart, mode, mood, score) => {
      calls++; active++; peak = Math.max(peak, active);
      if (calls === 5) allStarted();
      await gate;
      active--;
      return generateDeepProceduralReading(first, firstChart, second, secondChart, mode, mood, score);
    }
  });
  const server = createServer(async (req, res) => {
    try {
      let body = '';
      for await (const chunk of req) body += chunk;
      req.body = JSON.parse(body);
      res.status = code => { res.statusCode = code; return res; };
      res.json = data => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); };
      await handler(req, res);
    } catch { res.statusCode = 500; res.end('{}'); }
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const post = async i => {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/reading`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tomo-session': i.toString(16).padStart(32, '0'), 'x-vercel-forwarded-for': '192.0.2.1' },
      body: JSON.stringify({ p1Name: `Reader ${i}`, p1Dob: '1996-06-15', p2Name: 'Bob', p2Dob: '1996-10-08', relType: 'Friends', mood: 'Sweet' })
    });
    return { status: response.status, cacheControl: response.headers.get('cache-control'), body: await response.json() };
  };
  const pending = Array.from({ length: 5 }, (_, i) => post(i));
  try {
    await started;
    assert.equal(peak, 5);
    const sixth = await post(5);
    assert.equal(sixth.status, 429);
    assert.equal(sixth.body.code, 'APP_COOLDOWN');
    assert.equal(calls, 5);
    release();
    const results = await Promise.all(pending);
    for (const [index, result] of results.entries()) {
      assert.equal(result.status, 200);
      assert.equal(result.cacheControl, 'no-store');
      assert.doesNotThrow(() => validateBurmeseReading(result.body, { names: [`Reader ${index}`, 'Bob'], relType: 'Friends', expanded: true }));
    }
    assert.equal(active, 0);
    assert.equal((await post(0)).status, 200, 'cached readings bypass the network burst cap');
    assert.equal(calls, 5);
  } finally {
    release();
    await Promise.allSettled(pending);
    await new Promise(resolve => server.close(resolve));
  }
});
