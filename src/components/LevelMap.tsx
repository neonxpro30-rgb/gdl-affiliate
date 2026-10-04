import Link from "next/link";
import { db } from "@/lib/firebaseAdmin";

async function getPackages() {
  try {
    const snapshot = await db.collection("packages").orderBy("price", "asc").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as any[];
  } catch {
    return [];
  }
}

/* Locked package lineup v2 — source of truth for "Skills Unlocked" */
const SKILLS: Record<string, string[]> = {
  SILICON: [
    "Affiliate Marketing ABCs",
    "Profile Makeover in 30 Minutes",
    "First Affiliate Link Launchpad",
    "First 10 Leads — Taste",
    "Roadmap Reveal & Referral Kickstart",
  ],
  SILVER: [
    "Organic Affiliate Marketing Mastery",
    "First Money Sales Script",
    "Content Creation Mastery",
    "Video Creation Mastery",
  ],
  GOLD: [
    "Advanced Affiliate Marketing",
    "Personal Branding & Authority Mastery",
    "Advanced Video Editing & Reels Mastery",
  ],
  DIAMOND: [
    "Facebook Ads",
    "Google Ads",
    "Public Speaking",
    "Freelancing Mastery",
  ],
};

const BOSS: Record<string, string> = {
  SILICON: "🎮 TUTORIAL LEVEL — ₹19 me full taste, phir game badha",
  SILVER: "⚡ UNLOCK — sales scripts + content systems",
  GOLD: "🔓 BOSS UNLOCK — Community access, sirf Gold se",
  DIAMOND: "👑 FINAL BOSS — 1:1 Mentorship, sirf Diamond me",
};

const MEDAL: Record<string, string> = {
  SILICON: "🥉",
  SILVER: "🥈",
  GOLD: "🥇",
  DIAMOND: "💎",
};

function tierOf(pkg: any, index: number): string {
  const name = String(pkg.name || "").toUpperCase();
  if (name.includes("SILICON")) return "SILICON";
  if (name.includes("SILVER")) return "SILVER";
  if (name.includes("GOLD")) return "GOLD";
  if (name.includes("DIAMOND")) return "DIAMOND";
  return ["SILICON", "SILVER", "GOLD", "DIAMOND"][Math.min(index, 3)];
}

function XpRing({ pct }: { pct: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="7" />
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke="url(#xpgrad)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (c * pct) / 100}
      />
      <defs>
        <linearGradient id="xpgrad" x1="0" y1="0" x2="72" y2="72">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#f9a8d4" />
        </linearGradient>
      </defs>
      <text x="36" y="41" textAnchor="middle" fontSize="15" fontWeight="800" fill="#fff" transform="rotate(90 36 36)">
        {pct}%
      </text>
    </svg>
  );
}

export default async function LevelMap() {
  const packages = await getPackages();
  if (packages.length === 0) return null;

  return (
    <section id="packages" className="relative bg-[#F7E8EC] px-4 py-20 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-mono text-[11px] tracking-[0.3em] text-[#732C3F]/70">🗺️ SCROLL = LEVEL UP</p>
        <h2 className="font-display mt-3 text-[clamp(2.2rem,7vw,4.5rem)] uppercase leading-none text-[#1A0B12]">
          The Level Map
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#732C3F]/80 md:text-base">
          4 levels. Zyada mat soch — jahan hai wahan se start kar, game khud aage badhayega.
          Har level <span className="font-semibold">lifetime access</span> ke saath.
        </p>
      </div>

      <div className="mx-auto mt-14 max-w-2xl">
        {packages.slice(0, 4).map((pkg, i) => {
          const tier = tierOf(pkg, i);
          const lvl = i + 1;
          const skills = SKILLS[tier] ?? [];
          return (
            <div
              key={pkg.id}
              className="sticky mb-8 overflow-hidden rounded-3xl border border-[#732C3F]/30 bg-gradient-to-br from-[#1A0B12] via-[#2b1220] to-[#732C3F] text-white shadow-[0_24px_70px_rgba(26,11,18,0.45)]"
              style={{ top: `${5.5 + i * 2.2}rem` }}
            >
              {/* level ribbon */}
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 md:px-8">
                <span className="font-mono text-[11px] tracking-[0.3em] text-rose-300">
                  {MEDAL[tier]} LVL {lvl} · {tier}
                </span>
                <XpRing pct={lvl * 25} />
              </div>

              <div className="px-6 py-7 md:px-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h3 className="font-display text-3xl uppercase tracking-wide md:text-4xl">{pkg.name}</h3>
                    {pkg.description ? (
                      <p className="mt-1 max-w-md text-sm text-rose-100/70">{pkg.description}</p>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <p className="font-display text-5xl text-transparent bg-gradient-to-r from-rose-300 to-pink-200 bg-clip-text">
                      ₹{pkg.price}
                    </p>
                    <p className="mt-1 inline-block rounded-full bg-white/10 px-3 py-1 text-[11px] text-rose-100/80">
                      ✨ Lifetime Access
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-black/25 p-5">
                  <p className="mb-3 font-mono text-[11px] tracking-[0.25em] text-rose-300">🎯 SKILLS UNLOCKED</p>
                  <ul className="grid gap-2.5 sm:grid-cols-2">
                    {skills.map((s) => (
                      <li key={s} className="flex items-start gap-2 text-sm font-medium text-white/90">
                        <span className="mt-0.5 text-rose-400">▸</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="mt-5 rounded-xl border border-rose-400/30 bg-rose-950/50 px-4 py-3 text-sm font-semibold text-rose-100">
                  {BOSS[tier]}
                </p>

                <Link
                  href={`/signup?package=${pkg.id}`}
                  className="animate-xp-glow mt-6 block rounded-xl bg-gradient-to-r from-[#732C3F] to-rose-500 py-4 text-center text-lg font-bold tracking-wide transition hover:brightness-110"
                >
                  ⚡ Buy Now — Start LVL {lvl}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mx-auto mt-6 max-w-xl text-center text-xs leading-relaxed text-[#732C3F]/60">
        Har level apne dum pe khada hai — jis level ka game chahiye, wahi uthao. Upgrade ka option hamesha khula hai.
      </p>
    </section>
  );
}
