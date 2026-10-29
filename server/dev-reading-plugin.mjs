import { createReadingHandler } from './reading-handler.mjs';

// Vite serves the same reading handler as production. Local AI readings do
// not depend on the separate Socket.IO server being started on port 3080.
export function readingDevPlugin({ env = process.env, read } = {}) {
  return {
    name: 'tomo-dev-readings',
    apply: 'serve',
    configureServer(server) {
      const handler = createReadingHandler({ env, read });
      server.middlewares.use('/api/reading', (req, res, next) => {
        if (req.url.split('?')[0] !== '/') return next();
        const response = {
          setHeader: (...args) => res.setHeader(...args),
          status(code) { res.statusCode = code; return this; },
          json(body) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Cache-Control', 'no-store');
            res.end(JSON.stringify(body));
          }
        };
        const run = () => Promise.resolve(handler(req, response)).catch(error => {
          // Do not send stacks, credentials, or request details to the browser.
          console.error('Tomo local AI handler failed:', error instanceof Error ? error.name : 'UnknownError');
          if (!res.headersSent) response.status(503).json({ error: 'The local AI handler could not complete this request. Check the dev terminal.', code: 'AI_DEV_HANDLER' });
          else res.end();
        });
        if (req.method !== 'POST') { run(); return; }
        let bytes = 0;
        let finished = false;
        let chunks = [];
        req.on('data', chunk => {
          if (finished) return;
          bytes += chunk.length;
          if (bytes > 2048) {
            finished = true;
            chunks = [];
            response.status(413).json({ error: 'Reading details are too large.' });
            return;
          }
          chunks.push(chunk);
        });
        req.on('end', () => {
          if (finished) return;
          finished = true;
          req.body = Buffer.concat(chunks).toString('utf8');
          chunks = [];
          run();
        });
        req.on('error', () => {
          if (finished || res.destroyed) return;
          finished = true;
          response.status(400).json({ error: 'Could not read the request body.' });
        });
      });
    }
  };
}
