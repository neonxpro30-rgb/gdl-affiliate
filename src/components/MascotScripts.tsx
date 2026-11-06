'use client';

import { useEffect } from 'react';

// Loads the landing page's original scripts (byte-identical copies of the
// <script> blocks in learnpeak-landing.html, kept under public/js/) once the
// homepage has mounted, in dependency order:
//   1. three.r128.min.js — self-hosted three.js r128; the mascot bails out
//      unless window.THREE exists, so it must finish first.
//   2. lp-home.js        — page JS: rotating hero word, marquee duplication,
//      timecode, timeline playhead, wipe slider, tool toggles.
//   3. lp-mascot.js      — the 3D "mini Naksh" buddy.
// Scripts are appended sequentially and each load is awaited, so execution
// order is guaranteed. A window flag + per-src element check guard against
// double-runs (React StrictMode double effects, remounts).
const SOURCES = [
  '/js/three.r128.min.js',
  '/js/lp-home.js',
  '/js/lp-mascot.js',
] as const;

declare global {
  interface Window {
    __lpScriptsStarted?: boolean;
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = false;
    s.dataset.lpSrc = src;
    s.onload = () => resolve();
    s.onerror = () => resolve(); // a failed script must not block the rest
    document.body.appendChild(s);
  });
}

export default function MascotScripts() {
  useEffect(() => {
    if (window.__lpScriptsStarted) return;
    window.__lpScriptsStarted = true;
    (async () => {
      for (const src of SOURCES) {
        if (document.querySelector(`script[data-lp-src="${src}"]`)) continue;
        await loadScript(src);
      }
    })();
  }, []);

  return null;
}
