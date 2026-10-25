const sessions = new Map();
const key = roomId => `nomo_session_${roomId}`;

export function readSession(roomId) {
  if (sessions.has(roomId)) return sessions.get(roomId);
  try { return JSON.parse(sessionStorage.getItem(key(roomId)) || 'null'); }
  catch { return null; }
}

export function saveSession(roomId, session) {
  sessions.set(roomId, session);
  try { sessionStorage.setItem(key(roomId), JSON.stringify(session)); } catch { /* Memory fallback. */ }
}

export function clearSession(roomId) {
  sessions.delete(roomId);
  try { sessionStorage.removeItem(key(roomId)); } catch { /* Storage may be disabled. */ }
}
