const BASE = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'დაფიქსირდა შეცდომა');
  return data;
}

export const signup = (username, password) => post('/auth/signup', { username, password });
export const login = (username, password) => post('/auth/login', { username, password });
