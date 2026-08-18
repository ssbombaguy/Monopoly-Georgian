'use client';
import { useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';

// Paints the active theme behind everything, in two fixed layers:
//
//   1. the decoration (--th-art) covering the whole viewport, and
//   2. a plate of --th-center laid over the middle of it, feathered at both
//      sides so the texture appears to fade out toward the centre.
//
// That ordering is what produces the layout every theme is written against:
// scenery at the left and right margins, a flat undecorated band down the
// middle for the board. Doing it with two elements rather than stacked
// background layers means a theme's art can be any number of gradients
// without having to hand-manage background-size/position per layer.
export default function ThemeBackdrop() {
  const syncFromDocument = useThemeStore((s) => s.syncFromDocument);

  // The inline script in layout.jsx already applied the stored theme to
  // <html> before paint; this just tells the store what it picked, after
  // hydration, so the picker highlights the right swatch.
  useEffect(() => { syncFromDocument(); }, [syncFromDocument]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-[var(--th-edge)]">
      {/* bg-cover matters for custom themes, whose art may be a url() photo
          rather than gradients that already fill the box. */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'var(--th-art)' }} />
      <div
        className="absolute inset-0"
        style={{
          // The board is centred and capped at 800px, so the plate is sized in
          // viewport terms to stay under it and no wider than it needs to be.
          backgroundImage:
            'linear-gradient(90deg, transparent 0%, var(--th-plate) 18%, var(--th-plate) 82%, transparent 100%)',
        }}
      />
    </div>
  );
}
