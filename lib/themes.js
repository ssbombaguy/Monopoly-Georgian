// The picker's index of what globals.css defines. Each `key` matches a
// [data-theme="…"] block over there — the visual definition lives entirely in
// CSS so a theme can be applied by setting one attribute, on <html> for the
// whole app or on a swatch for a preview.
//
// Every theme follows the same layout contract: a flat, undecorated centre
// band for the board to sit on, with texture and scenery kept to the left and
// right margins.

export const THEME_GROUPS = [
  {
    key: 'solid',
    label: 'ფერები და ტექსტურები',
    themes: [
      { key: 'dark', name: 'მუქი' },
      { key: 'light', name: 'ღია' },
      { key: 'black', name: 'შავი' },
      { key: 'gray', name: 'ნაცრისფერი' },
      { key: 'blue', name: 'ლურჯი' },
      { key: 'wood', name: 'ხე' },
      { key: 'darkwood', name: 'მუქი ხე' },
      { key: 'newspaper', name: 'გაზეთი' },
      { key: 'concrete', name: 'ბეტონი' },
      { key: 'sand', name: 'ქვიშა' },
      { key: 'marble', name: 'მარმარილო' },
      { key: 'carbon', name: 'კარბონი' },
      { key: 'parchment', name: 'პერგამენტი' },
    ],
  },
  {
    key: 'cinematic',
    label: 'კინემატოგრაფიული',
    themes: [
      { key: 'rebel', name: 'მეამბოხეთა ალიანსი' },
      { key: 'empire', name: 'გალაქტიკური იმპერია' },
      { key: 'clonewars', name: 'კლონების ომები' },
      { key: 'jedi', name: 'ჯედაების ორდენი' },
      { key: 'sith', name: 'სითების ორდენი' },
    ],
  },
  {
    key: 'scenic',
    label: 'ხედები და ილუსტრაციები',
    themes: [
      { key: 'space', name: 'კოსმოსი' },
      { key: 'sky', name: 'ცა' },
      { key: 'tigers', name: 'ვეფხვები' },
      { key: 'graffiti', name: 'გრაფიტი' },
      { key: 'gothic', name: 'გოთიკა' },
      { key: 'arcade', name: 'არკადა' },
      { key: 'neon', name: 'ნეონი' },
      { key: 'icysea', name: 'ყინულოვანი ზღვა' },
      { key: 'ocean', name: 'ოკეანე' },
      { key: 'gameroom', name: 'სათამაშო ოთახი' },
      { key: 'nature', name: 'ბუნება' },
      { key: 'winter', name: 'ზამთარი' },
      { key: 'halloween', name: 'ჰელოუინი' },
    ],
  },
];

export const THEMES = THEME_GROUPS.flatMap((g) => g.themes);
export const THEME_KEYS = THEMES.map((t) => t.key);
export const DEFAULT_THEME = 'dark';
export const STORAGE_KEY = 'monopoly-theme';
export const CUSTOM_KEY = 'monopoly-custom-themes';

export const isTheme = (key) => THEME_KEYS.includes(key);

// ---- Custom themes -------------------------------------------------------
// A custom theme is the same contract as a built-in one, just supplied at
// runtime: two colours for the backdrop, an accent, a board family, and
// optionally an image for the margins. Everything else (panels, hairlines,
// status colours, board palette) is derived from `surface` and `board`, which
// map onto the data-surface / data-board hooks in globals.css — so a custom
// theme gets the same treatment as a built-in without duplicating any of it.

export const BOARD_FAMILIES = [
  { key: 'warm', name: 'კლასიკური' },
  { key: 'dark', name: 'მუქი' },
  { key: 'white', name: 'თეთრი' },
  { key: 'stone', name: 'ქვა' },
  { key: 'timber', name: 'ხე' },
  { key: 'paper', name: 'ქაღალდი' },
];

export const SURFACES = [
  { key: 'dark', name: 'მუქი' },
  { key: 'light', name: 'ღია' },
];

export const CUSTOM_PREFIX = 'custom:';
export const isCustomKey = (key) => typeof key === 'string' && key.startsWith(CUSTOM_PREFIX);

export function newCustomTheme() {
  return {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name: 'ჩემი თემა',
    surface: 'dark',
    board: 'warm',
    center: '#2b2e34',
    edge: '#15171b',
    accent: '#d4a94b',
    image: null, // data URL for the margins, or null for a plain gradient
  };
}

// The CSS custom properties a custom theme contributes. Text colour follows
// the surface so a user can't accidentally build an unreadable theme.
export function customVars(theme) {
  const text = theme.surface === 'light' ? '#22201a' : '#f4ecd9';
  const art = theme.image
    ? `url("${theme.image}")`
    : `radial-gradient(120% 90% at 0% 50%, ${theme.edge}, transparent 62%),` +
      `radial-gradient(120% 90% at 100% 50%, ${theme.edge}, transparent 62%)`;
  return {
    '--th-center': theme.center,
    '--th-edge': theme.edge,
    '--th-text': text,
    '--th-accent': theme.accent,
    '--th-art': art,
    // An uploaded photo already reads fine behind the board, which is opaque
    // — a scrim here would just dim the middle of the picture.
    '--th-plate': theme.image ? 'transparent' : theme.center,
  };
}
