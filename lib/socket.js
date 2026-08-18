import { io } from 'socket.io-client';

// Module-level singleton: one connection per tab, shared by every game
// (Monopoly, checkers, ...) and every component, surviving re-renders and
// route changes.
let socket = null;

// Stable per-tab identity, independent of the ephemeral socket.id — a page
// refresh gets a new socket.id but keeps this, so the server recognizes it
// as the same player instead of a stranger (see gameSocket.js reconnect
// logic). sessionStorage (not localStorage) so two tabs are still two
// separate players, matching how it already behaved before refresh support.
export function getSessionId() {
  if (typeof window === 'undefined') return undefined;
  let id = sessionStorage.getItem('monopoly-session');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('monopoly-session', id);
  }
  return id;
}

export function getSocket(token) {
  const sessionId = getSessionId();
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000', { auth: { token, sessionId } });
  } else if (socket.auth?.token !== token) {
    // Logged in/out since the socket first connected — re-handshake as the new identity.
    socket.auth = { token, sessionId };
    socket.disconnect().connect();
  }
  return socket;
}
