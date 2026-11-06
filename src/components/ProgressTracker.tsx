'use client';

import { useEffect, useRef } from 'react';

// Sends watch-progress heartbeats while a lesson is open. The embedded
// players (Bunny/YouTube/Vimeo/Gumlet iframes) don't expose a unified
// play-position API, so progress = engaged time on the lesson, capped
// at the lesson's duration. This feeds the `progress` collection used
// for the refund rule (<20% watched) and course completion display.
export default function ProgressTracker({ courseSlug, lessonId, durationSec }: {
    courseSlug: string;
    lessonId: string;
    durationSec: number;
}) {
    const watchedRef = useRef(0);

    useEffect(() => {
        watchedRef.current = 0;
        const send = (useBeacon = false) => {
            const payload = JSON.stringify({
                courseSlug, lessonId,
                watchedSeconds: Math.floor(watchedRef.current),
                durationSec: durationSec || 0,
            });
            if (useBeacon && navigator.sendBeacon) {
                navigator.sendBeacon('/api/progress', new Blob([payload], { type: 'application/json' }));
            } else {
                fetch('/api/progress', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: payload,
                }).catch(() => { /* non-blocking */ });
            }
        };
        const tick = setInterval(() => {
            if (document.visibilityState === 'visible') {
                watchedRef.current += 5;
                if (watchedRef.current % 20 === 0) send();
            }
        }, 5000);
        const onHide = () => send(true);
        window.addEventListener('beforeunload', onHide);
        return () => {
            clearInterval(tick);
            window.removeEventListener('beforeunload', onHide);
            send(true);
        };
    }, [courseSlug, lessonId, durationSec]);

    return null;
}
