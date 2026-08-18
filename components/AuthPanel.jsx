'use client';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import * as api from '../lib/api';

// Logged-in players play under their account name — the room forms hide
// their own name field and use this instead. Guests just skip this panel.
export default function AuthPanel() {
  const { token, user, login: setSession, logout } = useAuthStore();
  const [mode, setMode] = useState(null); // null | 'login' | 'signup'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (token && user) {
    return (
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-gold/30 bg-gold/10 px-3.5 py-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold/20 text-sm font-bold text-gold ring-1 ring-gold/30">
          {user.username.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate text-sm font-bold text-parchment">{user.username}</div>
          <div className="text-[11px] text-parchment/55">{user.wins} გამარჯვება · {user.gamesPlayed} თამაში</div>
        </div>
        <button
          onClick={logout}
          className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-parchment/55 transition hover:bg-[var(--th-panel)] hover:text-parchment/70"
        >
          გასვლა
        </button>
      </div>
    );
  }

  if (!mode) {
    return (
      <div className="mb-4 rounded-xl border border-[var(--th-line)] bg-[var(--th-panel)] p-3.5">
        <span className="text-xs text-parchment/55">სტუმრობ · ანგარიშის გარეშე</span>
        <div className="mt-2.5 flex gap-2">
          <button
            onClick={() => setMode('login')}
            className="flex-1 rounded-lg border border-[var(--th-line-hi)] py-1.5 text-xs font-semibold text-parchment/70 transition hover:border-gold/40 hover:text-gold"
          >
            შესვლა
          </button>
          <button
            onClick={() => setMode('signup')}
            className="flex-1 rounded-lg bg-gold/90 py-1.5 text-xs font-bold text-[var(--th-on-accent)] transition hover:bg-gold"
          >
            რეგისტრაცია
          </button>
        </div>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const fn = mode === 'signup' ? api.signup : api.login;
      const { token: t, user: u } = await fn(username.trim(), password);
      setSession(t, u);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mb-4 rounded-xl border border-[var(--th-line)] bg-[var(--th-panel)] p-4">
      <div className="mb-3 flex rounded-lg border border-[var(--th-line)] bg-[var(--th-sunken)] p-0.5 text-xs font-semibold">
        {[['login', 'შესვლა'], ['signup', 'რეგისტრაცია']].map(([m, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 rounded px-3 py-1.5 transition ${
              mode === m ? 'bg-gold text-[var(--th-on-accent)]' : 'text-parchment/50 hover:text-parchment/80'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2.5">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="სახელი"
          maxLength={20}
          className="w-full rounded-lg border border-[var(--th-line-hi)] bg-[var(--th-sunken-hi)] p-2.5 text-sm text-parchment placeholder:text-parchment/55 focus:border-gold focus:outline-none"
        />
        <div className="relative">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? 'text' : 'password'}
            placeholder="პაროლი"
            className="w-full rounded-lg border border-[var(--th-line-hi)] bg-[var(--th-sunken-hi)] p-2.5 pr-10 text-sm text-parchment placeholder:text-parchment/55 focus:border-gold focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
            className="absolute inset-y-0 right-0 grid w-9 place-items-center text-parchment/55 hover:text-parchment/70"
          >
            {showPassword ? (
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3l18 18" />
                <path d="M10.6 5.2A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a16.9 16.9 0 0 1-3.6 4.5M6.5 6.6C4 8.3 2 12 2 12s3.5 7 10 7a9.9 9.9 0 0 0 3.4-.6" />
                <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
              </svg>
            )}
          </button>
        </div>
        <button
          type="submit"
          disabled={busy || !username.trim() || !password}
          className="w-full rounded-lg bg-gold p-2.5 text-sm font-bold text-[var(--th-on-accent)] transition hover:brightness-110 disabled:opacity-40"
        >
          {mode === 'signup' ? 'ანგარიშის შექმნა' : 'შესვლა'}
        </button>
      </div>

      {error && <p className="mt-2.5 text-xs text-red-400">{error}</p>}

      <button
        type="button"
        onClick={() => setMode(null)}
        className="mt-3 w-full text-center text-xs text-parchment/55 hover:text-parchment/70"
      >
        სტუმრად თამაში
      </button>
    </form>
  );
}
