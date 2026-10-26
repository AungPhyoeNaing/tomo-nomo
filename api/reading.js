let handlerPromise;

export default async function reading(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Use POST for readings.' });
  }
  let handler;
  try {
    handlerPromise ||= import('../server/reading-handler.mjs').then(module => module.createReadingHandler());
    handler = await handlerPromise;
  } catch (error) {
    handlerPromise = undefined;
    // This block only handles module initialization, before any user input
    // or API key is sent. Log a startup diagnostic for Vercel's server logs.
    console.error('Tomo reading startup failed:', error.name, error.code || '', error.message);
    return res.status(503).json({ error: 'The AI server could not start. Please try again later.', code: 'AI_STARTUP' });
  }
  return handler(req, res);
}
