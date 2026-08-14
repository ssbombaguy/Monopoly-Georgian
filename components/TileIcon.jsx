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
    <g transform="translate(1.7, 3.7) scale(0.1) translate(-13.55, -20.81)" fill="currentColor" stroke="none">
      <path d="m 85.552617,186.7469 c -7.03451,-1.50649 -13.76171,-7.48175 -16.32225,-14.49781 -2.39586,-6.56481 -1.92535,-12.79508 1.45161,-19.22144 1.88592,-3.58893 5.94069,-7.62093 9.25186,-9.19991 0.62633,-0.29868 1.13878,-0.66038 1.13878,-0.80378 0,-0.1434 -5.275,-0.26073 -11.72223,-0.26073 -11.23602,0 -11.76599,0.0271 -12.7773,0.65207 -0.58028,0.35863 -1.3464,1.25863 -1.70248,2 -0.35608,0.74136 -2.39582,7.32393 -4.53277,14.62793 -2.13694,7.304 -4.41229,15.08 -5.05633,17.28 l -1.17097,4 -15.27896,0.0831 c -8.40343,0.0457 -15.27896,0.002 -15.27896,-0.0977 0,-0.0994 5.30445,-7.62483 11.78768,-16.7231 6.48322,-9.09827 12.04137,-16.93463 12.35144,-17.41413 0.31007,-0.4795 0.57827,-1.38357 0.596,-2.00905 0.0497,-1.75325 -1.07961,-2.67645 -3.84372,-3.14218 -2.08806,-0.35183 -2.3374,-0.48279 -3.46148,-1.81805 -1.75127,-2.08028 -4.82539,-6.81958 -6.22627,-9.5989 -4.85083,-9.62396 -5.56588,-19.22348 -2.03389,-27.30514 1.36428,-3.12164 3.54253,-6.215355 6.62894,-9.414865 l 2.85536,-2.96 h 5.53214 c 3.04267,0 5.87902,-0.13189 6.30299,-0.29308 0.42398,-0.1612 0.95766,-0.74405 1.18597,-1.29524 0.81949,-1.97843 0.23657,-4.702449 -3.46068,-16.171682 -1.92901,-5.984 -4.54306,-14.12 -5.809,-18.08 -1.26595,-3.96 -3.36906,-10.499032 -4.6736,-14.531183 -1.30453,-4.03215 -2.36484,-7.56015 -2.35623,-7.84 0.009,-0.27985 1.13166,-2.884818 2.49567,-5.788818 l 2.48002,-5.28 3.02433,-0.202961 c 1.66338,-0.111628 9.66021,-0.299658 17.77074,-0.417843 l 14.74641,-0.214881 3.41826,5.306576 3.41827,5.306576 -1.30637,4.551267 c -0.71851,2.503196 -2.14702,7.431266 -3.17446,10.951266 -1.02744,3.52 -2.66302,9.136001 -3.63462,12.480001 -4.2051,14.472834 -5.46123,18.772492 -6.48581,22.200548 -1.21035,4.049599 -1.35618,6.046864 -0.54215,7.424904 1.13728,1.92526 -1.84964,1.81133 50.814063,1.93817 47.15019,0.11356 48.35,0.10149 49.55937,-0.49876 2.4155,-1.19891 2.61618,-3.82492 0.51543,-6.744862 -7.5293,-10.465373 -11.20417,-19.644348 -11.18925,-27.94815 0.007,-4.116337 0.65442,-7.008712 2.29854,-10.275088 2.28689,-4.543409 7.17536,-8.992138 12.89591,-11.735876 l 1.92,-0.920887 25.92,0.16 25.92,0.16 0.0873,5.454835 0.0873,5.454834 -2.57521,3.311413 c -1.41637,1.821278 -3.92332,5.342602 -5.571,7.825166 -11.95501,18.012673 -18.08763,35.262645 -18.10059,50.91376 -0.009,11.20987 2.99913,20.94702 9.16209,29.65437 l 2.19016,3.09437 -0.10717,2.10248 -0.10716,2.10249 -14.93284,0.0831 -14.93283,0.0831 1.51863,0.89269 c 5.33238,3.1345 9.57155,8.81595 10.95426,14.68119 0.63497,2.69346 0.62324,8.14497 -0.0233,10.80568 -1.53511,6.31786 -6.26668,12.32576 -11.99726,15.23347 -3.53654,1.79444 -5.58215,2.22697 -10.53237,2.22697 -4.00904,0 -4.9446,-0.10161 -6.88,-0.74721 -9.83965,-3.28226 -16.16,-11.88481 -16.16,-21.99517 0,-8.71962 4.07616,-15.74718 11.81639,-20.37216 l 1.46361,-0.87455 -27.35527,-0.005 -27.35526,-0.005 1.27526,0.68171 c 2.1976,1.17476 3.8419,2.42254 5.79098,4.39448 8.75561,8.85831 8.62562,23.60409 -0.28557,32.39547 -3.15602,3.11358 -6.91631,5.19966 -11.188313,6.2069 -2.4857,0.58606 -7.71035,0.57865 -10.48183,-0.0149 z" />
    </g>
  ),
  power: (
    <g stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 12 1 v 2.5 M 4 6 l 2.5 1.5 M 20 6 l -2.5 1.5 M 2 13 h 3 M 22 13 h -3 M 5 19 l 2 -1.5 M 19 19 l -2 -1.5" fill="none" />
      <path d="M 9 17 C 9 14.5 6.5 13 6 10 C 5 5 8 3 12 3 C 16 3 19 5 18 10 C 17.5 13 15 14.5 15 17 Z" fill="#fde047" />
      <path d="M 10.5 17 L 9.5 8 C 10 7 11.5 7.5 12 11 L 12 17 M 12 11 C 12.5 7.5 14 7 14.5 8 L 13.5 17" fill="none" />
      <path d="M 9 18 L 15 18 M 9.5 20 L 14.5 20 M 10.5 22 L 13.5 22 M 11.5 22 L 11.5 23" fill="none" />
    </g>
  ),
  water: (
    <g stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="#fff">
      <path d="M 5 7 C 2 7 2 19 5 19 Z" />
      <rect x="5" y="11" width="7" height="4" />
      <path d="M 12 11 h 5 a 4 4 0 0 1 4 4 v 6 h -4 v -6 a 1 1 0 0 0 -1 -1 h -4 z" />
      <polygon points="10,11 12,8 16,8 18,11" />
      <rect x="13" y="4" width="2" height="4" fill="#111" />
      <rect x="10" y="3" width="8" height="2" fill="#111" />
      <circle cx="9" cy="4" r="1.5" />
      <circle cx="19" cy="4" r="1.5" />
      <circle cx="14" cy="2" r="1.5" />
      <rect x="12" y="15" width="4" height="1.5" fill="#111" />
    </g>
  ),
  chance: (
    <g strokeLinejoin="round" strokeLinecap="round">
      {/* Shadow */}
      <path d="M 7 8 C 7 2 17 2 17 8 C 17 12 12 13 12 16" stroke="#0f172a" strokeWidth="4" fill="none" />
      <circle cx="12" cy="21" r="2.2" fill="#0f172a" stroke="none" />
      
      {/* Dark Accent */}
      <path d="M 6.5 7.5 C 6.5 1.5 16.5 1.5 16.5 7.5 C 16.5 11.5 11.5 12.5 11.5 15.5" stroke="#a0005a" strokeWidth="3" fill="none" />
      <circle cx="11.5" cy="20.5" r="1.8" fill="#a0005a" stroke="none" />

      {/* Primary Fill */}
      <path d="M 6 7 C 6 1 16 1 16 7 C 16 11 11 12 11 15" stroke="#e8098d" strokeWidth="3" fill="none" />
      <circle cx="11" cy="20" r="1.8" fill="#e8098d" stroke="none" />

      {/* Highlight */}
      <path d="M 6.5 5.5 C 7.5 3 10.5 1.5 13.5 2" stroke="#fbcfe8" strokeWidth="1" fill="none" />
      <circle cx="10.5" cy="19.5" r="0.6" fill="#fbcfe8" stroke="none" />
    </g>
  ),
  chest: (
    <g strokeLinejoin="round" strokeLinecap="round">
      <polygon points="4,3 20,3 22,9 2,9" fill="#cbd5e1" stroke="#0f172a" strokeWidth="1.5" />
      <polygon points="5,4 19,4 20.5,9 3.5,9" fill="#0ea5e9" stroke="#0f172a" strokeWidth="1.2" />
      <polygon points="3,9 21,9 22,12 2,12" fill="#0f172a" stroke="none" />
      <path d="M 8 16 C 5 16 6 10 9 10 L 11 8.5 L 13 8.5 L 15 10 C 18 10 19 16 16 16 Z" fill="#f8fafc" stroke="#0f172a" strokeWidth="1.5" />
      <path d="M 10 9.5 L 14 9.5" fill="none" stroke="#0f172a" strokeWidth="1.5" />
      <path d="M 12 12 v 3" fill="none" stroke="#0f172a" strokeWidth="1.5" />
      <rect x="2" y="12" width="20" height="9" fill="#0ea5e9" stroke="#0f172a" strokeWidth="1.5" />
      <rect x="2" y="12" width="20" height="2" fill="#cbd5e1" stroke="#0f172a" strokeWidth="1.5" />
      <rect x="2" y="19" width="20" height="2" fill="#cbd5e1" stroke="#0f172a" strokeWidth="1.5" />
      <rect x="2" y="12" width="2" height="9" fill="#cbd5e1" stroke="#0f172a" strokeWidth="1.5" />
      <rect x="20" y="12" width="2" height="9" fill="#cbd5e1" stroke="#0f172a" strokeWidth="1.5" />
      <rect x="11" y="12" width="2" height="9" fill="#cbd5e1" stroke="#0f172a" strokeWidth="1.5" />
      <path d="M 10.5 14.5 v -1.5 a 1.5 1.5 0 0 1 3 0 v 1.5" fill="none" stroke="#0f172a" strokeWidth="1.5" />
      <rect x="9.5" y="14.5" width="5" height="4" rx="1" fill="#cbd5e1" stroke="#0f172a" strokeWidth="1.5" />
      <circle cx="12" cy="16" r="0.6" fill="#0f172a" stroke="none" />
      <path d="M 11.7 16 L 11.5 17.5 L 12.5 17.5 L 12.3 16 Z" fill="#0f172a" stroke="none" />
    </g>
  ),
  jail: (
    <g stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d="M 8.5 9 C 9.5 5 14.5 5 15.5 9 C 16.5 12 15 16 14 18 C 13 19 11 19 10 18 C 9 16 7.5 12 8.5 9 Z" />
      <path d="M 8.5 9 C 7 10 6 11 7 12 C 7.5 13 8 12.5 8.5 12" />
      <path d="M 15.5 9 C 17 10 18 11 17 12 C 16.5 13 16 12.5 15.5 12" />
      <path d="M 10 11 L 11 11.5 M 14 11 L 13 11.5" strokeWidth="1.8" />
      <circle cx="10.5" cy="12.5" r="0.5" fill="#111" />
      <circle cx="13.5" cy="12.5" r="0.5" fill="#111" />
      <path d="M 12 11.5 v 2.5 h 0.5" />
      <path d="M 10.5 15.5 c 0.5 -0.5 2.5 -0.5 3 0 c -0.5 1 -2.5 1 -3 0 Z" fill="#111" strokeWidth="1" />
      <path d="M 6.5 13 C 5 14 5 17 6.5 18 C 8 19 9.5 17 9.5 15 C 9.5 13 8 12 6.5 13 Z" fill="#fff" />
      <path d="M 5.5 14.5 h 4 M 5.5 16 h 4" strokeWidth="1" />
      <path d="M 9 17 C 8 18 6 20 4 20 M 15 17 C 16 18 18 20 20 20" />
      <path d="M 4 2 v 20 M 9 2 v 20 M 15 2 v 20 M 20 2 v 20" strokeWidth="2" />
      <path d="M 2 2 h 20 M 2 22 h 20" strokeWidth="2.5" />
    </g>
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
    <g stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Sparkles */}
      <path d="M 3 8 L 7.5 10 M 6 4 L 9 8 M 11 2 V 6 M 16 3 L 13 7 M 21 7 L 15 9.5" strokeWidth="1.5" fill="none" />

      {/* Main ring band body (yellow) */}
      <path d="M 4 16 C 2 12 8 10 13 10 C 19 10 23 12 21 17 C 19 21 11 23 7 21 C 4 19 3 17 4 16 Z" fill="#fde047" />
      
      {/* Inner hole (transparent) */}
      <path d="M 6 16 C 5 14 8 12 12 12 C 16 12 20 14 19 16 C 18 18 14 20 10 19 C 7 18 6 17 6 16 Z" fill="none" />
      
      {/* Inner back wall of the hole (yellow) */}
      <path d="M 6 16 C 5 14 8 12 12 12 C 16 12 20 14 19 16 C 18 15 14 14 10 14 C 7 14 6 15 6 16 Z" fill="#fde047" />
      
      {/* Dark yellow shading on the outside bottom */}
      <path d="M 4 16 C 3 18 5 21 9 22 C 13 22 18 20 21 17 C 20 19 14 21 9 20 C 5 19 4 17 4 16 Z" fill="#eab308" stroke="none" />
      
      {/* Diamond base/setting */}
      <polygon points="8,7 13,6 16,9 10,11" fill="#fbcfe8" />
      
      {/* Inner circle of the diamond */}
      <circle cx="11.8" cy="8.3" r="1.5" fill="#f9a8d4" strokeWidth="1.2" />
      
      {/* Facet lines */}
      <path d="M 8 7 L 10.5 7.8 M 13 6 L 12.5 7.2 M 16 9 L 13.3 8.5 M 10 11 L 11.2 9.6" strokeWidth="1.2" />
    </g>
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
