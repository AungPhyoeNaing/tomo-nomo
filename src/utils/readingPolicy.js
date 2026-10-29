// Leave time for the server to return its diagnostic before the browser or
// host ends the request. Vercel's maxDuration is 90 seconds (vercel.json).
export const READING_TIMEOUT_MS = 80000;
export const READING_CLIENT_TIMEOUT_MS = 85000;
export const READING_MAX_REQUESTS = 2;
export const READING_MAX_CONCURRENT = 5;
export const READING_REQUESTS_PER_MINUTE = READING_MAX_CONCURRENT * READING_MAX_REQUESTS;
