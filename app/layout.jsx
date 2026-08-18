import { Noto_Sans_Georgian, Noto_Serif_Georgian } from 'next/font/google';
import './globals.css';
import ThemeBackdrop from '../components/ThemeBackdrop';
import { CUSTOM_KEY, CUSTOM_PREFIX, DEFAULT_THEME, STORAGE_KEY, THEME_KEYS } from '../lib/themes';

const sansKa = Noto_Sans_Georgian({ subsets: ['georgian', 'latin'], variable: '--font-sans-ka' });
const serifKa = Noto_Serif_Georgian({ subsets: ['georgian', 'latin'], variable: '--font-serif-ka' });

export const metadata = { title: 'მონოპოლია — ქართული სუფრის თამაში' };

// viewportFit lets the board run under a notch/home indicator; the sticky
// turn bar pays that back with env(safe-area-inset-*) padding. maximumScale is
// deliberately left alone — pinch-zoom is how you read a 40-tile board on a
// phone, and blocking it would be the opposite of an accessible design.
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#16100d',
};

// Applies the saved theme before the first paint. Without this the page would
// render in the default theme and visibly snap to the chosen one once React
// hydrates. Kept to one statement and inlined for that reason.
const themeBootstrap = `(function(){var r=document.documentElement,D=${JSON.stringify(DEFAULT_THEME)};try{
var k=localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
if(${JSON.stringify(THEME_KEYS)}.indexOf(k)>-1){r.dataset.theme=k;return}
if(k&&k.indexOf('${CUSTOM_PREFIX}')===0){
var id=k.slice(${CUSTOM_PREFIX.length});
var c=(JSON.parse(localStorage.getItem(${JSON.stringify(CUSTOM_KEY)})||'[]')||[]).filter(function(x){return x.id===id})[0];
if(c){r.dataset.theme='custom';r.dataset.board=c.board;if(c.surface==='light')r.dataset.surface='light';
r.style.setProperty('--th-center',c.center);r.style.setProperty('--th-edge',c.edge);
r.style.setProperty('--th-accent',c.accent);
r.style.setProperty('--th-text',c.surface==='light'?'#22201a':'#f4ecd9');
r.style.setProperty('--th-plate',c.image?'transparent':c.center);
r.style.setProperty('--th-art',c.image?'url("'+c.image+'")':
'radial-gradient(120% 90% at 0% 50%,'+c.edge+',transparent 62%),radial-gradient(120% 90% at 100% 50%,'+c.edge+',transparent 62%)');
return}}
r.dataset.theme=D}catch(e){r.dataset.theme=D}})()`;

export default function RootLayout({ children }) {
  return (
    // data-theme is set here too so the server markup and the pre-paint script
    // agree; the script only changes it when a different theme was saved.
    <html lang="ka" data-theme={DEFAULT_THEME} className={`${sansKa.variable} ${serifKa.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      {/* No overflow clamp here on purpose: nothing overflows horizontally at
          any breakpoint (verified), and an overflow value on body would make it
          a scroll container / risk becoming the containing block for the
          fixed turn bar. */}
      <body className="min-h-screen text-parchment">
        <ThemeBackdrop />
        {children}
      </body>
    </html>
  );
}
