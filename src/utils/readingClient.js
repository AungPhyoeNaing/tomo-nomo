import { validateReading, validateBurmeseReading } from './reading.js';

export async function requestTomoReading(inputs, { signal } = {}) {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  if (signal?.aborted) cancel();
  signal?.addEventListener('abort', cancel, { once: true });
  const timer = setTimeout(cancel, 55000);
  try {
    const response = await fetch('/api/reading', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputs), signal: controller.signal
    });
    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.error || 'AI reading is temporarily unavailable.');
      error.code = `TOMO_HTTP_${response.status}`;
      throw error;
    }
    const validated = validateBurmeseReading(validateReading(data, data.chemistry_score),
      { relType: inputs.relType, names: [inputs.p1Name, inputs.p2Name] });
    return { ...validated, readingInfo: data.readingInfo };
  } catch (error) {
    if (error.name === 'AbortError' && !signal?.aborted) throw new Error('The AI reading timed out.');
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', cancel);
  }
}
