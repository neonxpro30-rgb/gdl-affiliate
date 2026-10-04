const ROW_ONE = [
  "VIDEO EDITING",
  "CONTENT CREATION",
  "PERSONAL BRANDING",
  "AFFILIATE MARKETING",
  "REELS MASTERY",
  "SALES SCRIPTS",
  "FREELANCING",
];

const ROW_TWO = [
  "SKILL SEEKH",
  "LEVEL UP",
  "REPEAT",
  "NO BAKWAAS",
  "CREATOR GAME",
  "MISSION MODE",
];

function Row({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const doubled = [...items, ...items, ...items, ...items];
  return (
    <div className="flex overflow-hidden">
      <div className={`flex shrink-0 items-center gap-8 pr-8 ${reverse ? "animate-marquee-right" : "animate-marquee-left"}`}>
        {doubled.map((t, i) => (
          <span key={i} className="flex items-center gap-8 whitespace-nowrap">
            <span className="font-display text-2xl uppercase tracking-wider text-white/90 md:text-3xl">{t}</span>
            <span className="text-rose-400">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function WinWall() {
  return (
    <section aria-hidden className="overflow-hidden border-y border-rose-900/40 bg-[#1A0B12] py-5">
      <Row items={ROW_ONE} />
      <div className="mt-4 opacity-60">
        <Row items={ROW_TWO} reverse />
      </div>
    </section>
  );
}
