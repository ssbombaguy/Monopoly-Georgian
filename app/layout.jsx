import { Noto_Sans_Georgian, Noto_Serif_Georgian } from 'next/font/google';
import './globals.css';

const sansKa = Noto_Sans_Georgian({ subsets: ['georgian', 'latin'], variable: '--font-sans-ka' });
const serifKa = Noto_Serif_Georgian({ subsets: ['georgian', 'latin'], variable: '--font-serif-ka' });

export const metadata = { title: 'მონოპოლია — ქართული სუფრის თამაში' };

export default function RootLayout({ children }) {
  return (
    <html lang="ka" className={`${sansKa.variable} ${serifKa.variable}`}>
      <body className="min-h-screen bg-roast text-parchment">{children}</body>
    </html>
  );
}
