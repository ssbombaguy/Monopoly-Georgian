'use client';
import { useState } from 'react';

const SECTIONS = [
  {
    icon: '🎯',
    title: 'მიზანი',
    body: 'გახდი ყველაზე მდიდარი — იყიდე საკუთრება, ააშენე სახლები და გააკოტრე დანარჩენები.',
  },
  {
    icon: '🎲',
    title: 'სვლა',
    body: 'რიგრიგობით აგდებთ კამათელს და გადადიხართ იმდენ უჯრაზე, რამდენიც აჩვენა. დუბლი (ორივე კამათელზე ერთი და იგივე რიცხვი) — კიდევ ერთხელ აგდებ. სამი დუბლი ზედიზედ — პირდაპირ ციხეში.',
  },
  {
    icon: '🏠',
    title: 'საკუთრების ყიდვა',
    body: 'თუ დაუკავებელ ქუჩაზე/სადგურზე/კომუნალურზე დადგები, შეგიძლია იყიდო ფასად. თუ არ იყიდი, ის აუქციონზე გავა — ნებისმიერს შეუძლია ბიდის დადება.',
  },
  {
    icon: '💰',
    title: 'ქირა',
    body: 'სხვისი საკუთრების უჯრაზე დადგომისას ქირა ავტომატურად გადაიხდება მფლობელს — ღილაკი არ სჭირდება.',
  },
  {
    icon: '🏗️',
    title: 'მშენებლობა',
    body: 'სახლის ასაშენებლად საჭიროა მთელი ფერადი ჯგუფი გქონდეს. სახლები თანაბრად უნდა აშენდეს ჯგუფში — ერთ ქუჩაზე ორი სახლი ვერ ააშენებ, სანამ დანარჩენებს ერთი მაინც არ ექნება. მე-5 დონე — სასტუმროა.',
  },
  {
    icon: '🏦',
    title: 'იპოთეკა',
    body: 'ფულის დასაგროვებლად შეგიძლია საკუთრება დააგირავო (ნახევარი ფასი მიიღებ). დაგირავებული საკუთრება ქირას არ იღებს. გამოსასყიდად გადაიხდი ღირებულებას +10%-ს.',
  },
  {
    icon: '🤝',
    title: 'ვაჭრობა',
    body: 'ნებისმიერ დროს შეგიძლია სხვა მოთამაშეს შესთავაზო გაცვლა — ფული და/ან საკუთრება ორივე მხრიდან. მან უნდა დაეთანხმოს.',
  },
  {
    icon: '🚔',
    title: 'ციხე',
    body: 'ციხეში ხვდები სამი დუბლით ან „წადი ციხეში" უჯრაზე დგომით. გამოსვლა შეგიძლია ჯარიმის გადახდით ან დუბლის აგდებით (მაქს. 3 მცდელობა).',
  },
  {
    icon: '❓',
    title: 'შანსი და საზოგადოებრივი ყუთი',
    body: 'ამ უჯრებზე დგომისას ბარათი გამოდის შემთხვევითი ეფექტით — ფულის მიღება/გადახდა, ან გადაადგილება დაფაზე.',
  },
  {
    icon: '💸',
    title: 'გაკოტრება',
    body: 'თუ ვერ იხდი ვალს, გაკოტრდები — მთელი შენი საკუთრება ცალ-ცალკე აუქციონზე გავა დარჩენილ მოთამაშეებზე.',
  },
  {
    icon: '🏆',
    title: 'გამარჯვება',
    body: 'ბოლო მოთამაშე, ვინც არ გაკოტრდება, იმარჯვებს.',
  },
];

export default function RulesGuide() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-parchment/70 transition hover:border-gold/40 hover:text-gold"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M9.1 9.1a3 3 0 1 1 4 2.8c-.9.4-1.1 1-1.1 1.9v.4" />
          <circle cx="12" cy="17" r=".6" fill="currentColor" stroke="none" />
        </svg>
        როგორ ვითამაშო
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={() => setOpen(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="scroll-thin flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-gold/30 bg-[#1c1512] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 p-5 pb-4">
              <h2 className="font-display text-xl font-bold text-parchment">როგორ ვითამაშოთ მონოპოლია</h2>
              <button
                onClick={() => setOpen(false)}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-parchment/50 transition hover:bg-white/10 hover:text-parchment"
              >
                ✕
              </button>
            </div>
            <div className="scroll-thin overflow-y-auto p-5 pt-4">
              <div className="flex flex-col gap-4">
                {SECTIONS.map((s) => (
                  <div key={s.title} className="flex gap-3">
                    <span className="text-xl leading-none">{s.icon}</span>
                    <div>
                      <div className="font-bold text-gold">{s.title}</div>
                      <p className="mt-0.5 text-sm leading-relaxed text-parchment/70">{s.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
