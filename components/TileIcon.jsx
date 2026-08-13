// One hand-drawn line-art set so every tile reads as the same board.
// Emoji were inconsistent across platforms and looked pasted-on at 70px.
const PATHS = {
  go: (
    <>
      <path d="M3.5 12h13" strokeWidth="2.6" />
      <path d="M12.5 7.2 17.8 12l-5.3 4.8" strokeWidth="2.6" />
    </>
  ),
  rail: (
    <>
      <path d="M3 16.4v-6a1 1 0 0 1 1-1h6.6v7" />
      <path d="M10.6 9.4h3.2l3.4 3.7v3.3" />
      <path d="M2 16.4h17.5" />
      <path d="M4.6 9.4V6.9h2.3v2.5" />
      <circle cx="6.6" cy="18.6" r="1.7" />
      <circle cx="14.8" cy="18.6" r="1.7" />
    </>
  ),
  power: (
    <>
      <path d="M12 3.4a5.2 5.2 0 0 0-3.1 9.4c.6.5.9 1.1.9 1.8v.3h4.4v-.3c0-.7.3-1.3.9-1.8A5.2 5.2 0 0 0 12 3.4Z" />
      <path d="M9.9 17.4h4.2" />
      <path d="M10.7 20h2.6" />
    </>
  ),
  water: (
    <>
      <path d="M3 9.6h6.6v3.4H3z" />
      <path d="M9.6 10.6h4.2a2.2 2.2 0 0 1 2.2 2.2v2" />
      <path d="M5.1 9.6V7.9h2.9v1.7" />
      <path d="M17.7 18.9a1.7 1.7 0 0 1-3.4 0c0-1.1 1.7-3.2 1.7-3.2s1.7 2.1 1.7 3.2Z" />
    </>
  ),
  chance: (
    <>
      <path d="M8.9 9.1a3.1 3.1 0 1 1 4.2 2.9c-.9.4-1.2 1-1.2 1.9v.6" strokeWidth="2.1" />
      <circle cx="12" cy="18" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  chest: (
    <>
      <path d="M3.6 11.6h16.8v7.3a1 1 0 0 1-1 1H4.6a1 1 0 0 1-1-1Z" />
      <path d="M3.6 11.6a8.4 8.4 0 0 1 16.8 0" />
      <rect x="10.3" y="13.2" width="3.4" height="3.4" rx=".7" />
    </>
  ),
  jail: (
    <>
      <rect x="4" y="4.8" width="16" height="14.4" rx="1.2" />
      <path d="M8.8 4.8v14.4M12 4.8v14.4M15.2 4.8v14.4" />
    </>
  ),
  parking: (
    <>
      <path d="M4 16.4v-3l1.8-4.2a1.5 1.5 0 0 1 1.4-.9h9.6a1.5 1.5 0 0 1 1.4.9L20 13.4v3" />
      <path d="M4 16.4h16" />
      <path d="M5.9 13.3h12.2" />
      <circle cx="7.4" cy="16.8" r="1.5" />
      <circle cx="16.6" cy="16.8" r="1.5" />
    </>
  ),
  police: (
    <>
      <path d="M6 13.1a6 6 0 0 1 12 0" />
      <path d="M6 13.1h12v3.2H6z" />
      <path d="M3.8 16.3h16.4" />
      <path d="M10.9 9.6h2.2v2.1h-2.2z" />
    </>
  ),
  tax: (
    <>
      <rect x="5.8" y="3.6" width="12.4" height="16.8" rx="1.2" />
      <path d="M8.9 8h6.2M8.9 11.6h6.2M8.9 15.2h3.6" />
    </>
  ),
  luxury: (
    <>
      <circle cx="12" cy="15.2" r="4.4" />
      <path d="M9.1 8.1h5.8l1.7 2.5-4.6 3.2-4.6-3.2z" />
    </>
  ),
};

export default function TileIcon({ name, className = '' }) {
  const d = PATHS[name];
  if (!d) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {d}
    </svg>
  );
}
