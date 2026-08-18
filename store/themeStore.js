import { create } from 'zustand';
import {
  CUSTOM_KEY, CUSTOM_PREFIX, DEFAULT_THEME, STORAGE_KEY,
  customVars, isCustomKey, isTheme,
} from '../lib/themes';

// Built-in themes are pure CSS — applying one is just an attribute. Custom
// themes carry their colours as inline variables on the same element, and
// borrow the shared board/surface treatments through data-board /
// data-surface. Both paths end up in exactly the same variables, so nothing
// downstream has to know which kind is active.

const VAR_NAMES = ['--th-center', '--th-edge', '--th-text', '--th-accent', '--th-art', '--th-plate'];

function readCustoms() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function writeCustoms(list) {
  try {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(list));
  } catch {
    // Almost always the 5MB quota, and almost always a large background image.
    return 'ვერ შეინახა — სურათი ძალიან დიდია';
  }
  return null;
}

// The one place that touches the DOM. `theme` is a built-in key, or a custom
// theme object.
function paint(key, custom) {
  const root = document.documentElement;
  if (custom) {
    root.dataset.theme = 'custom';
    root.dataset.board = custom.board;
    if (custom.surface === 'light') root.dataset.surface = 'light';
    else delete root.dataset.surface;
    const vars = customVars(custom);
    for (const name of VAR_NAMES) root.style.setProperty(name, vars[name]);
  } else {
    root.dataset.theme = key;
    // Leaving these behind would keep overriding the built-in's own values.
    delete root.dataset.board;
    delete root.dataset.surface;
    for (const name of VAR_NAMES) root.style.removeProperty(name);
  }
}

export const useThemeStore = create((set, get) => ({
  // Starts at the default so server and client markup agree; syncFromDocument
  // reconciles with whatever the pre-paint script applied.
  theme: DEFAULT_THEME,
  customs: [],
  error: null,

  syncFromDocument: () => {
    const customs = readCustoms();
    let stored = DEFAULT_THEME;
    try { stored = localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME; } catch {}
    const valid = isTheme(stored)
      || (isCustomKey(stored) && customs.some((c) => CUSTOM_PREFIX + c.id === stored));
    set({ customs, theme: valid ? stored : DEFAULT_THEME });
  },

  setTheme: (key) => {
    const custom = isCustomKey(key)
      ? get().customs.find((c) => CUSTOM_PREFIX + c.id === key)
      : null;
    if (!custom && !isTheme(key)) return;

    paint(key, custom);
    try { localStorage.setItem(STORAGE_KEY, key); } catch { /* private mode */ }
    set({ theme: key });
  },

  // Insert or update, then repaint if the edited theme is the live one — that
  // is what makes the editor's preview feel immediate.
  saveCustom: (theme) => {
    const customs = get().customs;
    const next = customs.some((c) => c.id === theme.id)
      ? customs.map((c) => (c.id === theme.id ? theme : c))
      : [...customs, theme];
    const error = writeCustoms(next);
    if (error) return set({ error });

    set({ customs: next, error: null });
    get().setTheme(CUSTOM_PREFIX + theme.id);
  },

  deleteCustom: (id) => {
    const next = get().customs.filter((c) => c.id !== id);
    writeCustoms(next);
    set({ customs: next, error: null });
    // Don't leave the app wearing a theme that no longer exists.
    if (get().theme === CUSTOM_PREFIX + id) get().setTheme(DEFAULT_THEME);
  },

  // Live preview while the editor is open, without committing anything.
  previewCustom: (theme) => paint(CUSTOM_PREFIX + theme.id, theme),
  cancelPreview: () => {
    const { theme, customs } = get();
    const custom = isCustomKey(theme) ? customs.find((c) => CUSTOM_PREFIX + c.id === theme) : null;
    paint(theme, custom);
  },

  clearError: () => set({ error: null }),
}));
