import Link from 'next/link';

const games = [
  { slug: 'monopoly', name: 'მონოპოლია', desc: 'ქართული სამაგიდო თამაში', available: true },
];

export default function GameCenter() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 p-6">
      <div className="text-center">
        <div className="text-xs uppercase tracking-[0.4em] text-gold/70">სათამაშო ცენტრი</div>
        <h1 className="mt-3 font-display text-5xl font-bold text-parchment">აირჩიე თამაში</h1>
        <div className="mx-auto mt-5 h-px w-24 bg-gold/50" />
      </div>

      <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {games.map((game) => (
          <Link
            key={game.slug}
            href={game.available ? `/${game.slug}` : '#'}
            aria-disabled={!game.available}
            className={`rounded-2xl border border-white/10 bg-white/5 p-6 text-center transition ${
              game.available ? 'hover:border-gold/50 hover:bg-white/10' : 'pointer-events-none opacity-40'
            }`}
          >
            <h2 className="font-display text-2xl font-bold text-parchment">{game.name}</h2>
            <p className="mt-2 text-sm text-parchment/60">{game.desc}</p>
            {!game.available && <p className="mt-3 text-xs uppercase tracking-widest text-gold/60">მალე</p>}
          </Link>
        ))}
      </div>
    </main>
  );
}
