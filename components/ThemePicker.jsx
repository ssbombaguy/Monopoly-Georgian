'use client';
import { useState } from 'react';
import { CUSTOM_PREFIX, THEME_GROUPS, customVars, newCustomTheme } from '../lib/themes';
import { useThemeStore } from '../store/themeStore';
import ThemeEditor from './ThemeEditor';

// A miniature of what the theme actually paints — same two layers as
// ThemeBackdrop, same variables, just scoped to this element by its own
// data-theme. Nothing is hardcoded per theme, so a theme added to globals.css
// previews correctly here for free.
//
// A custom theme has no CSS block to inherit from, so it passes its variables
// in as inline style instead; the markup below is identical either way.
function Swatch({ themeKey, custom }) {
  const style = custom
    ? { ...customVars(custom), background: custom.edge }
    : undefined;
  return (
    <div
      data-theme={custom ? 'custom' : themeKey}
      data-board={custom ? custom.board : undefined}
      data-surface={custom?.surface === 'light' ? 'light' : undefined}
      style={style}
      className="relative h-12 w-full overflow-hidden rounded-md bg-[var(--th-edge)]"
    >
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'var(--th-art)' }} />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(90deg, transparent 0%, var(--th-plate) 18%, var(--th-plate) 82%, transparent 100%)',
        }}
      />
      {/* Stand-in for the board, drawn from this theme's own board palette so
          the swatch previews both halves of the change: the backdrop and the
          board that sits on it. */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="grid h-6 w-6 grid-cols-2 grid-rows-2 overflow-hidden rounded-[2px] shadow ring-1 ring-[var(--bd-frame)]">
          <span className="bg-[var(--bd-face)]" />
          <span className="bg-[var(--bd-ink)]" />
          <span className="bg-[var(--bd-ink)]" />
          <span className="bg-[var(--bd-face)]" />
        </div>
      </div>
    </div>
  );
}

export default function ThemePicker() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null); // the draft being edited, or null
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const customs = useThemeStore((s) => s.customs);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex min-h-9 items-center gap-1.5 rounded-lg border border-[var(--th-line-hi)] px-3 py-1.5 text-xs font-semibold text-parchment/70 transition hover:border-gold/40 hover:text-gold"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="13.5" cy="6.5" r="2.5" />
          <circle cx="18" cy="13" r="2.5" />
          <circle cx="6.5" cy="10" r="2.5" />
          <path d="M12 2a10 10 0 1 0 0 20c.9 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.8.7-1.5 1.5-1.5H16a6 6 0 0 0 6-6c0-5-4.5-9-10-9z" />
        </svg>
        თემა
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={() => setOpen(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="scroll-thin flex max-h-[88svh] w-full max-w-2xl flex-col rounded-2xl border border-gold/30 bg-[var(--th-modal)] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--th-line)] p-5 pb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-parchment">თემის არჩევა</h2>
                <p className="mt-0.5 text-xs text-parchment/50">ფონი იცვლება — დაფა უცვლელი რჩება</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-parchment/50 transition hover:bg-[var(--th-panel-hi)] hover:text-parchment"
              >
                ✕
              </button>
            </div>

            <div className="scroll-thin overflow-y-auto p-5 pt-4">
              {THEME_GROUPS.map((group) => (
                <div key={group.key} className="mb-5 last:mb-0">
                  <div className="mb-2 text-[10px] uppercase tracking-widest text-parchment/55">{group.label}</div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {group.themes.map((t) => {
                      const active = t.key === theme;
                      return (
                        <button
                          key={t.key}
                          onClick={() => setTheme(t.key)}
                          aria-pressed={active}
                          className={`rounded-lg border p-1.5 text-left transition ${
                            active
                              ? 'border-gold bg-gold/10 ring-1 ring-gold/40'
                              : 'border-[var(--th-line)] hover:border-gold/50'
                          }`}
                        >
                          <Swatch themeKey={t.key} />
                          <div className="mt-1.5 flex items-center justify-between gap-1 px-0.5">
                            <span className="truncate text-[11px] font-semibold text-parchment/80">{t.name}</span>
                            {active && <span className="shrink-0 text-[10px] text-gold">✓</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Custom themes last: the built-ins are the menu, these are
                  what the player made. Tapping an active one opens it for
                  editing, so there's no separate edit affordance to hunt for. */}
              <div className="mt-5 border-t border-[var(--th-line)] pt-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-parchment/55">ჩემი თემები</span>
                  <button
                    onClick={() => setEditing(newCustomTheme())}
                    className="min-h-9 rounded-lg bg-gold px-2.5 py-1 text-[11px] font-bold text-[var(--th-on-accent)] transition hover:brightness-110"
                  >
                    + ახალი თემა
                  </button>
                </div>

                {customs.length === 0 ? (
                  <p className="text-xs text-parchment/50">
                    შექმენი შენი თემა — ფერები, დაფის სტილი და საკუთარი ფონის სურათი.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {customs.map((c) => {
                      const key = CUSTOM_PREFIX + c.id;
                      const active = key === theme;
                      return (
                        <button
                          key={c.id}
                          onClick={() => (active ? setEditing(c) : setTheme(key))}
                          aria-pressed={active}
                          title={active ? 'შეცვლა' : c.name}
                          className={`rounded-lg border p-1.5 text-left transition ${
                            active
                              ? 'border-gold bg-gold/10 ring-1 ring-gold/40'
                              : 'border-[var(--th-line)] hover:border-gold/50'
                          }`}
                        >
                          <Swatch custom={c} />
                          <div className="mt-1.5 flex items-center justify-between gap-1 px-0.5">
                            <span className="truncate text-[11px] font-semibold text-parchment/80">{c.name}</span>
                            <span className="shrink-0 text-[10px] text-gold">{active ? '✎' : ''}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {editing && <ThemeEditor initial={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
