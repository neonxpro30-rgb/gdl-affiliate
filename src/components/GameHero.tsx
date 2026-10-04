"use client";

import { useState } from "react";

type Option = { label: string; points: number };
type Question = { q: string; options: Option[] };

const QUESTIONS: Question[] = [
  {
    q: "How much time can you give daily?",
    options: [
      { label: "30 min", points: 1 },
      { label: "1–2 hours", points: 2 },
      { label: "3+ hours", points: 3 },
    ],
  },
  {
    q: "What's your camera setup?",
    options: [
      { label: "📱 Just my phone", points: 1 },
      { label: "📱 Phone + tripod", points: 2 },
      { label: "🎥 Full setup", points: 3 },
    ],
  },
  {
    q: "What's your first mission?",
    options: [
      { label: "🎬 Making reels", points: 1 },
      { label: "🤝 Closing sales", points: 2 },
      { label: "👑 Building a brand", points: 3 },
    ],
  },
];

type Level = {
  name: string;
  tagline: string;
  reason: string;
  medal: string;
};

const LEVELS: Record<string, Level> = {
  SILICON: {
    name: "SILICON",
    tagline: "LVL 1 · TUTORIAL MODE",
    reason: "Taste everything for ₹19 first — understand the game, then level up. Smart players never skip the tutorial.",
    medal: "🥉",
  },
  SILVER: {
    name: "SILVER",
    tagline: "LVL 2 · MAIN QUEST",
    reason: "Your daily time + phone = start with reels, close with sales scripts. The perfect entry level for you.",
    medal: "🥈",
  },
  GOLD: {
    name: "GOLD",
    tagline: "LVL 3 · BOSS TERRITORY",
    reason: "You're serious — advanced skills + community unlock. This is where boss-fight prep happens.",
    medal: "🥇",
  },
  DIAMOND: {
    name: "DIAMOND",
    tagline: "LVL 4 · FINAL BOSS",
    reason: "Full time, full setup, full ambition — straight to the final boss with 1:1 mentorship.",
    medal: "💎",
  },
};

function levelFor(score: number): Level {
  if (score <= 4) return LEVELS.SILICON;
  if (score <= 6) return LEVELS.SILVER;
  if (score <= 8) return LEVELS.GOLD;
  return LEVELS.DIAMOND;
}

export default function GameHero() {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const xp = done ? 100 : Math.round((step / QUESTIONS.length) * 100);

  const pick = (points: number) => {
    const nextScore = score + points;
    if (step + 1 >= QUESTIONS.length) {
      setScore(nextScore);
      setDone(true);
    } else {
      setScore(nextScore);
      setStep(step + 1);
    }
  };

  const reset = () => {
    setStep(0);
    setScore(0);
    setDone(false);
  };

  const level = levelFor(score);

  return (
    <section className="scanlines relative overflow-hidden bg-[#1A0B12] text-white">
      {/* ambient glows */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-[#732C3F]/60 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-rose-500/20 blur-[100px]" />

      <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-14 md:pt-20 text-center">
        {/* top status row */}
        <div className="mb-8 flex items-center justify-center gap-3 font-mono text-[11px] tracking-[0.25em] text-rose-200/80">
          <span className="inline-flex items-center gap-2 rounded-full border border-rose-400/40 bg-rose-950/60 px-4 py-1.5">
            <span className="animate-blink inline-block h-2 w-2 rounded-full bg-red-500" />
            LIVE
          </span>
          <span className="hidden sm:inline">PLAYER 1 // READY</span>
        </div>

        {/* poster headline */}
        <h1 className="font-display uppercase leading-[0.95] tracking-wide">
          <span className="block text-[clamp(2.6rem,9vw,6.5rem)]">Learn skills.</span>
          <span className="block bg-gradient-to-r from-rose-300 via-rose-400 to-pink-300 bg-clip-text text-[clamp(2.6rem,9vw,6.5rem)] text-transparent">
            Level up.
          </span>
          <span className="block text-[clamp(2.6rem,9vw,6.5rem)] text-white/90">Repeat.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-rose-100/80 md:text-base">
          This isn&apos;t a course website — it&apos;s your <span className="font-semibold text-white">creator game</span>.
          4 levels. Zero fluff. Just skills that work in the real world.
        </p>

        {/* quiz console */}
        <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-rose-900/60 bg-[#241019]/90 p-6 text-left shadow-[0_0_60px_rgba(115,44,63,0.35)] md:p-8">
          {/* XP bar */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between font-mono text-[11px] tracking-widest text-rose-200/70">
              <span>{done ? "QUEST COMPLETE" : `QUESTION ${Math.min(step + 1, 3)}/3`}</span>
              <span className="text-rose-300">XP {xp}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="animate-xp-glow h-full rounded-full bg-gradient-to-r from-[#732C3F] via-rose-400 to-pink-300 transition-all duration-500"
                style={{ width: `${xp}%` }}
              />
            </div>
          </div>

          {!done ? (
            <div key={step}>
              <h2 className="mb-5 text-lg font-bold md:text-xl">{QUESTIONS[step].q}</h2>
              <div className="grid gap-3">
                {QUESTIONS[step].options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => pick(opt.points)}
                    className="rounded-xl border border-rose-900/50 bg-white/5 px-5 py-4 text-left font-semibold transition hover:-translate-y-0.5 hover:border-rose-400 hover:bg-rose-950/60 active:translate-y-0"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-5xl">{level.medal}</div>
              <p className="mt-3 font-mono text-[11px] tracking-[0.25em] text-rose-300">{level.tagline}</p>
              <h2 className="font-display mt-2 text-4xl uppercase tracking-wide md:text-5xl">
                Your level: <span className="bg-gradient-to-r from-rose-300 to-pink-300 bg-clip-text text-transparent">{level.name}</span>
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-rose-100/80">{level.reason}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <a
                  href="#packages"
                  className="animate-xp-glow rounded-xl bg-gradient-to-r from-[#732C3F] to-rose-500 px-8 py-3.5 font-bold text-white transition hover:brightness-110"
                >
                  ⚡ Start Your Level
                </a>
                <button
                  onClick={reset}
                  className="rounded-xl border border-rose-900/60 px-8 py-3.5 font-semibold text-rose-200 transition hover:border-rose-400 hover:text-white"
                >
                  ↻ Play again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* trust pill (kept as-is per standing instruction) */}
        <p className="mx-auto mt-8 inline-block rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] text-white/60">
          Refer friends &amp; earn up to 80% commission — not guaranteed, results vary.
        </p>
      </div>
    </section>
  );
}
