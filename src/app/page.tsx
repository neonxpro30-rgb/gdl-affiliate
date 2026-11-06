import Image from "next/image";
import type { CSSProperties } from "react";
import { getProducts, SEED_PRODUCTS } from "@/lib/products";
import MascotScripts from "@/components/MascotScripts";
import "./home.css";

export const dynamic = "force-dynamic";

// Prices always come from the catalog (Firestore `products`, seeded fallback
// inside getProducts). seedPrice is only a last-resort guard if a slug is
// missing from a live catalog response.
const seedPrice = (slug: string) =>
  SEED_PRODUCTS.find((p) => p.slug === slug)?.price ?? 0;
const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

export default async function Home() {
  const products = await getProducts();
  const priceOf = (slug: string) =>
    products.find((p) => p.slug === slug)?.price ?? seedPrice(slug);

  const demoPrice = priceOf("demo");
  const starterPrice = priceOf("reel-trailer-starter");
  const emotionalPrice = priceOf("emotional-reels");
  const proPrice = priceOf("pro-wedding-trailer");
  const metaPrice = priceOf("meta-ads-photographers");
  const bundlePrice = priceOf("bundle-all");
  const savings =
    starterPrice + emotionalPrice + proPrice + metaPrice - bundlePrice;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Unbounded:wght@500;700;800&family=Baloo+2:wght@400;500;600;700;800&family=VT323&display=swap"
      />
      <div className="lp-home">
<header className="bar">
  <div className="wrap">
    <a className="logo" href="#top"><span className="dot" aria-hidden="true"></span>LearnPeak</a>
    <nav aria-label="Main">
      <a href="#courses">Courses</a>
      <a href="#certificate">Certificate</a>
      <a href="#tools">Tools</a>
      <a href="#work">Paid work</a>
    </nav>
    <div className="rec" aria-label="Page timecode"><i></i><span className="px" id="tc">00:00:00:00</span></div>
    <a className="btn sm" href="/signup?product=demo">{fmt(demoPrice)} demo</a>
  </div>
</header>

<main id="top">
<section className="hero">
  <div className="wrap hero-grid">
    <div>
      <span className="chip"><b></b>Premiere Pro + Meta Ads · Built for editors</span>
      <h1 className="kin" id="kin" aria-label="From raw footage to trailers that hit.">
        <span className="row" aria-hidden="true">From raw footage to</span>
        <span className="row" aria-hidden="true"><span className="pill" id="rot">trailers</span></span>
        <span className="row" aria-hidden="true">that hit.</span>
      </h1>
      <p className="lede">Reels, emotional story edits, wedding trailers, and ads that get photographers booked. Learn from a working editor, pass the test, get certified.</p>
      <div className="cta-row">
        <a className="btn" href="/signup?product=demo">First lesson for {fmt(demoPrice)} ▶</a>
        <a className="btn ghost" href="#courses">See courses</a>
      </div>
      <p className="note" style={{ marginTop: '12px' } as CSSProperties}>24-hour refund · Lifetime access · Certificate after the test</p>
    </div>

    <div className="tvbox">
      <span className="sticker">Starts at {fmt(demoPrice)}</span>
      <div className="tv">
        <span className="ant" aria-hidden="true"><i></i><i></i></span>
        <div className="screen" aria-label="Wedding trailer preview on a retro TV">
          <div className="scene">
            <div className="sun"></div><div className="hills"></div>
            <div className="duo" aria-hidden="true"><i></i><i></i></div>
            <span className="heart" aria-hidden="true">♥</span>
            <p className="subt" id="subt">The first time I saw her… I couldn't look away.</p>
          </div>
          <div className="face" aria-hidden="true"><div className="f"><span className="e"></span><span className="e"></span><span className="ck a"></span><span className="ck b"></span><span className="m"></span></div></div>
          <span className="osd tl">REC</span><span className="osd tr" id="montc">00:12</span>
          <div className="scan"></div>
        </div>
        <div className="side" aria-hidden="true"><span className="knob"></span><span className="knob k2"></span><div className="grill"><i></i><i></i><i></i><i></i></div></div>
      </div>
      <div className="feet" aria-hidden="true"><i></i><i></i></div>

      <div className="tl" id="tl">
        <div className="trk"><b>V2</b><div className="lane">
          <span className="clip" style={{ left: '28%', width: '18%', background: 'var(--pink)' } as CSSProperties}>title</span>
          <span className="clip" style={{ left: '80%', width: '18%', background: 'var(--pink)' } as CSSProperties}>logo</span></div></div>
        <div className="trk"><b>V1</b><div className="lane">
          <span className="clip" style={{ left: '0', width: '20%', background: 'var(--lilac)' } as CSSProperties}>haldi</span>
          <span className="clip" style={{ left: '21%', width: '12%', background: 'var(--lilac)' } as CSSProperties}>ring</span>
          <span className="clip" style={{ left: '34%', width: '28%', background: 'var(--lilac)' } as CSSProperties}>pheras</span>
          <span className="clip" style={{ left: '63%', width: '35%', background: 'var(--lilac)' } as CSSProperties}>vidaai</span></div></div>
        <div className="trk"><b>A1</b><div className="lane">
          <span className="clip" style={{ left: '0', width: '98%', background: 'var(--mint)' } as CSSProperties}>♪ piano score</span></div></div>
        <div className="trk"><b>A2</b><div className="lane">
          <span className="clip" style={{ left: '18%', width: '7%', background: 'var(--butter)' } as CSSProperties}>wsh</span>
          <span className="clip" style={{ left: '31%', width: '6%', background: 'var(--butter)' } as CSSProperties}>hit</span>
          <span className="clip" style={{ left: '56%', width: '12%', background: 'var(--butter)' } as CSSProperties}>riser</span></div></div>
        <div className="ph" id="ph" aria-hidden="true"></div>
        <div className="ctrl">
          <span className="px" id="seqtc">00:00:12:08</span>
          <div className="btns">
            <button className="ibtn" id="rew" aria-label="Go to start">⏮</button>
            <button className="ibtn" id="play" aria-label="Play timeline">▶</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<div className="marq" aria-hidden="true"><div className="run" id="run">
  <span><b>✦</b> Cut on the beat</span><span><b>✦</b> SFX layering</span><span><b>✦</b> Speed ramps</span><span><b>✦</b> Emotional reels</span><span><b>✦</b> Wedding trailers</span><span><b>✦</b> Meta ads</span><span><b>✦</b> Color grading</span><span><b>✦</b> Certificates</span><span><b>✦</b> Real client projects</span>
</div></div>

<section id="courses">
  <div className="wrap">
    <div className="head">
      <div><span className="eyebrow">4 courses</span><h2>Edit it. <em>Then sell it.</em></h2></div>
      <p>The first three courses teach editing. The fourth teaches you to turn that editing into ads that bring photographers real bookings.</p>
    </div>

    <div className="courses">
      <article className="course" style={{ '--sc': 'var(--mint)' } as CSSProperties}>
        <div className="vhs"><div className="vlabel"><span className="px">TAPE 01</span><span className="px">SP</span></div><div className="window" aria-hidden="true"><span className="reel"></span><span className="reel"></span></div></div>
        <div className="cbody">
          <h3>Reel &amp; Trailer Starter</h3>
          <p className="out">Your first reel and your first trailer, made from basic footage.</p>
          <ul>
            <li>Premiere setup, workflow and shortcuts</li>
            <li>Picking selects and cutting on the beat</li>
            <li>Basic color and audio cleanup</li>
            <li>Reel structure and your first trailer</li>
          </ul>
          <p className="task">Task: 1 reel + 1 trailer from the provided footage</p>
          <p className="certline">Certificate when you pass the final test</p>
          <div className="buy"><div className="price">{fmt(starterPrice)}<small>LIFETIME</small></div><a className="btn sm" href="/signup?product=reel-trailer-starter">Start</a></div>
        </div>
      </article>

      <article className="course" style={{ '--sc': 'var(--pink)' } as CSSProperties}>
        <div className="vhs"><div className="vlabel"><span className="px">TAPE 02</span><span className="px">SP</span></div><div className="window" aria-hidden="true"><span className="reel"></span><span className="reel"></span></div></div>
        <div className="cbody">
          <h3>Emotional Reels</h3>
          <p className="out">Reels people watch to the last frame and share.</p>
          <ul>
            <li>The hook in the first 2 seconds</li>
            <li>The emotion graph: build-up, peak, ending</li>
            <li>Picking moments: laughter, tears, reactions</li>
            <li>Telling the story with music and voiceover</li>
          </ul>
          <p className="task">Task: two reels with different emotions from the same footage</p>
          <p className="certline">Certificate when you pass the final test</p>
          <div className="buy"><div className="price">{fmt(emotionalPrice)}<small>LIFETIME</small></div><a className="btn sm" href="/signup?product=emotional-reels">Start</a></div>
        </div>
      </article>

      <article className="course" style={{ '--sc': 'var(--lilac)' } as CSSProperties}>
        <div className="vhs"><div className="vlabel"><span className="px">TAPE 03</span><span className="px">PRO</span></div><div className="window" aria-hidden="true"><span className="reel"></span><span className="reel"></span></div></div>
        <div className="cbody">
          <h3>Pro Wedding Trailer</h3>
          <p className="out">A smooth opening, layered SFX, and a finish clients remember.</p>
          <ul>
            <li>Slow-build, atmospheric openings</li>
            <li>SFX layering: whooshes, ambience, risers</li>
            <li>Speed ramps, transitions and pacing</li>
            <li>What's overdone and what to avoid</li>
            <li>Cinematic grading and client delivery</li>
          </ul>
          <p className="task">Bonus: portfolio review, and paid projects for top students</p>
          <p className="certline">Certificate when you pass the final test</p>
          <div className="buy"><div className="price">{fmt(proPrice)}<small>LIFETIME</small></div><a className="btn sm" href="/signup?product=pro-wedding-trailer">Start</a></div>
        </div>
      </article>

      <article className="course" style={{ '--sc': 'var(--sky)' } as CSSProperties}>
        <div className="vhs"><div className="vlabel"><span className="px">TAPE 04</span><span className="px">ADS</span></div><div className="window" aria-hidden="true"><span className="reel"></span><span className="reel"></span></div></div>
        <div className="cbody">
          <h3>Meta Ads for Photographers <span className="tagnew">NEW</span></h3>
          <p className="out">From research to live ads: bringing photographers inquiries and bookings.</p>
          <ul>
            <li>Reading competitors' live ads in the Ad Library</li>
            <li>Audience: city, radius, age and past clients</li>
            <li>3 hook-first ad reels cut from wedding footage</li>
            <li>The offer, plus WhatsApp or a lead form with the right questions</li>
            <li>A ₹300–500/day test budget: what to kill, what to scale</li>
            <li>Tracking from lead to call to booking</li>
          </ul>
          <p className="task">Task: a full campaign plan + 3 ad creatives for a photographer's page</p>
          <p className="certline">Certificate when you pass the final test</p>
          <div className="buy"><div className="price">{fmt(metaPrice)}<small>LIFETIME</small></div><a className="btn sm" href="/signup?product=meta-ads-photographers">Start</a></div>
        </div>
      </article>
    </div>

    <div className="combo">
      <div><h3>All 4 courses</h3><p>Editing + ads, with every extension and 4 certificates. {fmt(savings)} less than buying them separately.</p></div>
      <div className="r"><span className="price">{fmt(bundlePrice)}</span><a className="btn" href="/signup?product=bundle-all">Get the bundle</a></div>
    </div>
    <p className="demo"><span>{fmt(demoPrice)} DEMO</span>Not sure yet? Take the first lesson of Tape 01: "The first 10 seconds of your first reel".</p>
  </div>
</section>

<section id="certificate" style={{ paddingTop: '10px' } as CSSProperties}>
  <div className="wrap cert-grid">
    <div>
      <div className="head" style={{ '--hl': 'var(--butter)', display: 'block', marginBottom: '0' } as CSSProperties}>
        <span className="eyebrow">After the course</span>
        <h2>Pass the test. <em>Get certified.</em></h2>
        <p style={{ marginTop: '16px' } as CSSProperties}>Every course ends with a final test. Pass it and you get a certificate in your name.</p>
      </div>
      <div className="cert-steps">
        <div style={{ '--sc': 'var(--mint)' } as CSSProperties}><b>1</b><span>Finish every lesson and assignment</span></div>
        <div style={{ '--sc': 'var(--pink)' } as CSSProperties}><b>2</b><span>Take the final test: questions + one practical edit</span></div>
        <div style={{ '--sc': 'var(--butter)' } as CSSProperties}><b>3</b><span>Pass and get your certificate with a unique ID</span></div>
      </div>
      <p className="note" style={{ marginTop: '14px' } as CSSProperties}>This is a LearnPeak certificate of completion. It is not a government or university qualification.</p>
    </div>

    <div style={{ position: 'relative', paddingTop: '22px' } as CSSProperties}>
      <div className="cert" aria-label="Sample certificate">
        <div className="seal" aria-hidden="true"><span>TEST<br />PASSED</span></div>
        <div className="top"><span className="brand"><i aria-hidden="true"></i>LearnPeak</span><span className="cert-id">ID LP-24-0193</span></div>
        <p className="of">Certificate of completion</p>
        <p className="name"><span>Your Name</span></p>
        <p className="for">has successfully completed all lessons, assignments and the final test of the <b>Pro Wedding Trailer</b> course.</p>
        <div className="bottom">
          <div className="sig">Naksh Gupta<em>Founder, LearnPeak</em></div>
          <span className="cert-id">SAMPLE</span>
        </div>
      </div>
    </div>
  </div>
</section>

<section id="over" style={{ paddingTop: '10px' } as CSSProperties}>
  <div className="wrap">
    <div className="head" style={{ '--hl': 'var(--mint)' } as CSSProperties}>
      <div><span className="eyebrow">The most important lesson in Tape 03</span><h2>Over-edited or <em>clean?</em></h2></div>
      <p>Drag the line in the middle and see where the difference is.</p>
    </div>
    <div className="wipe" id="wipe">
      <div className="pane over">
        <h3>Over-edited</h3>
        <ul>
          <li style={{ '--i': '0' } as CSSProperties}>A different transition on every cut</li>
          <li style={{ '--i': '1' } as CSSProperties}>A bass drop every 2 seconds</li>
          <li style={{ '--i': '2' } as CSSProperties}>Three LUTs stacked on top of each other</li>
          <li style={{ '--i': '3' } as CSSProperties}>Loud music over the vows</li>
          <li style={{ '--i': '4' } as CSSProperties}>A speed ramp on every shot</li>
        </ul>
      </div>
      <div className="pane clean">
        <div className="in">
          <h3>Clean edit</h3>
          <ul style={{ marginLeft: 'auto' } as CSSProperties}>
            <li>More cuts, fewer transitions</li>
            <li>SFX only where the scene asks for it</li>
            <li>One consistent grade</li>
            <li>Music down during the vows</li>
            <li>Ramps only at the peak moment</li>
          </ul>
        </div>
      </div>
      <div className="wl" aria-hidden="true"></div>
      <input type="range" id="wipe-range" min="8" max="92" defaultValue="50" aria-label="Wipe line between over-edited and clean edit" />
    </div>
    <p className="hint">Drag it, or use the arrow keys.</p>
  </div>
</section>

<section id="tools" style={{ paddingTop: '10px' } as CSSProperties}>
  <div className="wrap">
    <div className="head" style={{ '--hl': 'var(--pink)' } as CSSProperties}>
      <div><span className="eyebrow">Only on LearnPeak</span><h2>Courses that come with <em>my own tools</em></h2></div>
      <p>I built these Premiere Pro extensions for my own work. They come with the courses, and you can also buy them separately. The names are placeholders for now.</p>
    </div>
    <div className="tools">
      <div className="tool" style={{ '--tc': 'var(--pink)' } as CSSProperties}><span className="ic">BM</span><strong>Beat Marker</strong><span>Automatic markers on the music's beat</span>
        <div className="sw"><span>Included</span><button className="tog" aria-pressed="true" aria-label="Beat Marker on/off"></button></div></div>
      <div className="tool" style={{ '--tc': 'var(--sky)' } as CSSProperties}><span className="ic">SX</span><strong>SFX Drawer</strong><span>Whooshes, risers and hits on your timeline in one click</span>
        <div className="sw"><span>Included</span><button className="tog" aria-pressed="true" aria-label="SFX Drawer on/off"></button></div></div>
      <div className="tool" style={{ '--tc': 'var(--butter)' } as CSSProperties}><span className="ic">SZ</span><strong>Reel Safe Zones</strong><span>Guides that match Instagram's UI</span>
        <div className="sw"><span>Included</span><button className="tog" aria-pressed="false" aria-label="Reel Safe Zones on/off"></button></div></div>
    </div>
  </div>
</section>

<section id="work" style={{ paddingTop: '10px' } as CSSProperties}>
  <div className="wrap">
    <div className="head" style={{ '--hl': 'var(--sky)' } as CSSProperties}>
      <div><span className="eyebrow">After the certificate</span><h2>Learn it. <em>Then get paid for it.</em></h2></div>
      <p>Jobs ask for a year of experience. Here, you build that experience on real projects.</p>
    </div>
    <div className="path">
      <span className="runner" aria-hidden="true"></span>
      <div className="stp" style={{ '--nc': 'var(--mint)' } as CSSProperties}><span className="n">1</span><h3>Learn</h3><p>Watch the lessons and edit along.</p></div>
      <div className="stp" style={{ '--nc': 'var(--pink)' } as CSSProperties}><span className="n">2</span><h3>Test + certificate</h3><p>Pass the final test and get certified.</p></div>
      <div className="stp" style={{ '--nc': 'var(--lilac)' } as CSSProperties}><span className="n">3</span><h3>Portfolio</h3><p>Build a showreel of your best edits.</p></div>
      <div className="stp" style={{ '--nc': 'var(--butter)' } as CSSProperties}><span className="n">4</span><h3>Paid projects</h3><p>Top students get paid work on our real wedding projects.</p></div>
    </div>
    <p className="disclaim">Paid project opportunities depend on the quality of your work. They are not guaranteed, and LearnPeak does not promise any income.</p>
  </div>
</section>

<section style={{ paddingTop: '10px' } as CSSProperties}>
  <div className="wrap pair">
    <div className="box">
      <span className="eyebrow" style={{ margin: '0' } as CSSProperties}>Affiliate program</span>
      <p className="big">30<span>%</span></p>
      <h3 style={{ fontSize: '24px' } as CSSProperties}>Flat commission, simple rules</h3>
      <div className="perks">
        <div>Free to join, no purchase needed</div>
        <div>Single-tier, no levels</div>
        <div>Paid out after the refund window</div>
        <div>40% for editors and photographers</div>
      </div>
      <p className="note">It's a bonus, not an income source. The real way to earn is the skill.</p>
    </div>
    <div className="box">
      <span className="eyebrow" style={{ margin: '0' } as CSSProperties}>Who teaches</span>
      <div className="who"><Image src="/images/founder-naksh.jpg" alt="Naksh Gupta" width={72} height={72} className="av" style={{ objectFit: "cover" }} /><div><h3>Naksh Gupta</h3><p className="note">Founder · Lead editor, wedding films</p></div></div>
      <p style={{ fontWeight: '500', color: '#3B3150' } as CSSProperties}>Alongside a job and freelance work, I edit wedding films and trailers for clients every day. Here I teach what actually works on real projects.</p>
      <p className="note">Add your photo and before/after edits here.</p>
    </div>
  </div>
</section>

<section style={{ paddingTop: '10px' } as CSSProperties}>
  <div className="wrap">
    <div className="head"><h2>Questions?</h2></div>
    <div className="faq">
      <details><summary>Can I get a refund?</summary><p>Yes. Within 24 hours of purchase, if you've watched less than 20% of the course, you get a full refund.</p></details>
      <details><summary>How do I get the certificate?</summary><p>Finish every lesson and assignment, then take the final test. When you pass, you get a certificate with your name and a unique ID. If you don't pass, you can retake the test.</p></details>
      <details><summary>What software do I need?</summary><p>Adobe Premiere Pro 2024 or newer for the editing courses. For the Meta Ads course, a Facebook page and a Meta Business account.</p></details>
      <details><summary>I'm a complete beginner. Where do I start?</summary><p>With Tape 01. Or take the {fmt(demoPrice)} demo lesson first and see whether you like the style.</p></details>
      <details><summary>Are bookings from ads guaranteed?</summary><p>No. The course teaches research, creative and testing. Results depend on the budget, the city, the offer and the photographer's work.</p></details>
      <details><summary>Is there an earnings guarantee?</summary><p>No. LearnPeak teaches skills. Top students may get paid project opportunities, but that depends on their work.</p></details>
    </div>
  </div>
</section>

<section className="close" id="close">
  <div className="wrap">
    <h2 aria-label="Your turn."><span id="w1" aria-hidden="true">Your</span><br /><span id="w2" className="w2" aria-hidden="true">turn.</span></h2>
    <p>Your first edit for {fmt(demoPrice)}. If you don't like it, all you've spent is one lesson.</p>
    <div className="cta-row"><a className="btn" href="/signup?product=demo">Start the {fmt(demoPrice)} demo ▶</a><a className="btn ghost" href="#courses">All courses</a></div>
  </div>
  <div className="wrap foot">
    <span>© 2026 LearnPeak · Lucknow · learnpeak.in@gmail.com</span>
    <nav aria-label="Legal"><a href="/legal/terms">Terms</a><a href="/legal/refund-policy">Refund policy</a><a href="/legal/affiliate-terms">Affiliate terms</a><a href="/company/contact">Contact</a></nav>
  </div>
</section>
</main>
<div className="buddy" id="buddy">
  <div className="bubble" id="bubble" role="status" hidden></div>
  <canvas id="buddy-cv" aria-hidden="true"></canvas>
  <button className="hit" id="buddy-hit" aria-label="Mini Naksh, the LearnPeak mascot. Click to poke him."></button>
  <button className="bx" id="buddy-x" aria-label="Hide mini Naksh">×</button>
</div>
<button className="buddy-show" id="buddy-show" hidden>Show Naksh</button>
      </div>
      <MascotScripts />
    </>
  );
}
