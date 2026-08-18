'use client';
import { useEffect, useRef, useState } from 'react';
import { BOARD_FAMILIES, SURFACES, customVars } from '../lib/themes';
import { useThemeStore } from '../store/themeStore';

// localStorage tops out around 5MB and a 4K screenshot base64-encodes to far
// more than that, so an uploaded background is redrawn to a sane width before
// it's stored. 1920px is more than enough for something that sits behind a
// board and is mostly blurred margins anyway.
const MAX_WIDTH = 1920;
const JPEG_QUALITY = 0.82;

function downscale(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('ფაილი ვერ წაიკითხა'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('სურათი ვერ გაიხსნა'));
      img.onload = () => {
        const scale = Math.min(1, MAX_WIDTH / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        // PNG would keep a photo lossless and enormous; JPEG is the right
        // trade for a background.
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <div className="mb-1 text-[10px] uppercase tracking-widest text-parchment/55">{label}</div>
      {children}
      {hint && <div className="mt-1 text-[10px] text-parchment/50">{hint}</div>}
    </label>
  );
}

function Swatch({ label, value, onChange }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2 rounded-lg border border-[var(--th-line)] bg-[var(--th-sunken)] p-1.5">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 bg-transparent font-mono text-xs text-parchment focus:outline-none"
        />
      </div>
    </Field>
  );
}

// Chips rather than a <select>: six board families and two surfaces are few
// enough to show at once, and seeing them all is the point.
function Choice({ label, options, value, onChange }) {
  return (
    <Field label={label}>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className={`min-h-9 rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
              value === o.key
                ? 'border-gold bg-gold/15 text-gold'
                : 'border-[var(--th-line)] text-parchment/70 hover:border-gold/50'
            }`}
          >
            {o.name}
          </button>
        ))}
      </div>
    </Field>
  );
}

export default function ThemeEditor({ initial, onClose }) {
  const saveCustom = useThemeStore((s) => s.saveCustom);
  const deleteCustom = useThemeStore((s) => s.deleteCustom);
  const previewCustom = useThemeStore((s) => s.previewCustom);
  const cancelPreview = useThemeStore((s) => s.cancelPreview);
  const storeError = useThemeStore((s) => s.error);
  const clearError = useThemeStore((s) => s.clearError);
  const customs = useThemeStore((s) => s.customs);

  const [draft, setDraft] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState(null);
  const fileInput = useRef(null);
  const isExisting = customs.some((c) => c.id === draft.id);

  // Paint the whole app as you edit — a theme is a full-screen thing, so a
  // thumbnail would be a poor substitute for just showing it.
  useEffect(() => { previewCustom(draft); }, [draft, previewCustom]);

  // Leaving without saving must put back whatever was actually applied.
  const close = () => { cancelPreview(); clearError(); onClose(); };

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const pickImage = async (file) => {
    if (!file) return;
    setBusy(true); setLocalError(null);
    try {
      set({ image: await downscale(file) });
    } catch (e) {
      setLocalError(e.message);
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const vars = customVars(draft);
  const error = localError || storeError;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4" onClick={close}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="scroll-thin flex max-h-[90svh] w-full max-w-lg flex-col overflow-y-auto rounded-2xl border border-gold/30 bg-[var(--th-modal)] shadow-2xl"
      >
        <div className="flex items-center justify-between gap-2 border-b border-[var(--th-line)] p-5 pb-4">
          <h2 className="font-display text-lg font-bold text-parchment">
            {isExisting ? 'თემის შეცვლა' : 'ახალი თემა'}
          </h2>
          <button
            onClick={close}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-parchment/50 transition hover:bg-[var(--th-panel-hi)] hover:text-parchment"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4 p-5">
          {/* Same two layers the real backdrop paints, so this preview is the
              actual result rather than an impression of it. */}
          <div
            className="relative h-24 overflow-hidden rounded-lg border border-[var(--th-line)]"
            style={{ background: draft.edge }}
          >
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: vars['--th-art'] }} />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  `linear-gradient(90deg, transparent 0%, ${vars['--th-plate']} 18%, ${vars['--th-plate']} 82%, transparent 100%)`,
              }}
            />
            <div className="absolute inset-0 grid place-items-center">
              <div className="grid h-10 w-10 grid-cols-2 grid-rows-2 overflow-hidden rounded shadow-lg">
                <span className="bg-[#f4ecd9]" /><span className="bg-[#2a2018]" />
                <span className="bg-[#2a2018]" /><span className="bg-[#f4ecd9]" />
              </div>
            </div>
          </div>

          <Field label="სახელი">
            <input
              value={draft.name}
              maxLength={24}
              onChange={(e) => set({ name: e.target.value })}
              className="w-full rounded-lg border border-[var(--th-line-hi)] bg-[var(--th-sunken-hi)] p-2.5 text-sm text-parchment focus:border-gold focus:outline-none"
            />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Swatch label="ცენტრი" value={draft.center} onChange={(center) => set({ center })} />
            <Swatch label="კიდეები" value={draft.edge} onChange={(edge) => set({ edge })} />
            <Swatch label="აქცენტი" value={draft.accent} onChange={(accent) => set({ accent })} />
          </div>

          <Choice
            label="ტექსტი და პანელები"
            options={SURFACES}
            value={draft.surface}
            onChange={(surface) => set({ surface })}
          />
          <Choice
            label="დაფის სტილი"
            options={BOARD_FAMILIES}
            value={draft.board}
            onChange={(board) => set({ board })}
          />

          <Field
            label="ფონის სურათი"
            hint="არასავალდებულო · ცენტრი მაინც სუფთა რჩება დაფისთვის"
          >
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                onChange={(e) => pickImage(e.target.files?.[0])}
                className="hidden"
              />
              <button
                type="button"
                disabled={busy}
                onClick={() => fileInput.current?.click()}
                className="min-h-9 rounded-lg border border-[var(--th-line-hi)] px-3 py-1.5 text-xs font-semibold text-parchment/80 transition hover:border-gold/50 disabled:opacity-40"
              >
                {busy ? 'იტვირთება…' : draft.image ? 'სხვა სურათი' : 'სურათის ატვირთვა'}
              </button>
              {draft.image && (
                <button
                  type="button"
                  onClick={() => set({ image: null })}
                  className="min-h-9 rounded-lg border border-[var(--th-line-hi)] px-3 py-1.5 text-xs font-semibold text-parchment/60 transition hover:border-red-400/60 hover:text-red-300"
                >
                  წაშლა
                </button>
              )}
            </div>
          </Field>

          {error && <p className="text-xs text-[var(--th-danger)]">{error}</p>}
        </div>

        <div className="sticky bottom-0 flex gap-2.5 border-t border-[var(--th-line)] bg-[var(--th-modal)] p-5 pt-4">
          {isExisting && (
            <button
              onClick={() => { deleteCustom(draft.id); onClose(); }}
              className="min-h-11 rounded-lg border border-red-500/40 px-4 font-bold text-[var(--th-danger)] transition hover:bg-red-500/10"
            >
              წაშლა
            </button>
          )}
          <button
            onClick={close}
            className="min-h-11 flex-1 rounded-lg border border-[var(--th-line-hi)] px-4 font-bold text-parchment/70 transition hover:bg-[var(--th-panel)]"
          >
            გაუქმება
          </button>
          <button
            onClick={() => { saveCustom(draft); onClose(); }}
            disabled={!draft.name.trim()}
            className="min-h-11 flex-1 rounded-lg bg-gold px-4 font-bold text-[var(--th-on-accent)] shadow-lg transition hover:brightness-110 disabled:opacity-40"
          >
            შენახვა
          </button>
        </div>
      </div>
    </div>
  );
}
