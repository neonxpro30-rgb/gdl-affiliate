/**
 * Category thumbnail with a branded fallback.
 *
 * Legacy categories were seeded with placeholder-service images
 * (placehold.co etc.) which render as a grey "600 × 400" box. Whenever the
 * image is missing or points at a known placeholder service, render the
 * retro-tape branded block instead. Styling lives in src/app/dashboard.css
 * (.lpd-thumb*). Purely presentational — no data behaviour changes.
 */

const PLACEHOLDER_HOSTS = [
    "placehold.co",
    "via.placeholder.com",
    "dummyimage.com",
    "picsum.photos",
    "placekitten.com",
    "loremflickr.com",
];

export function isPlaceholderImage(src?: string | null): boolean {
    if (!src || !src.trim()) return true;
    const s = src.toLowerCase();
    if (s.includes("600x400") || s.includes("600×400")) return true;
    try {
        const host = new URL(src).hostname.toLowerCase();
        return PLACEHOLDER_HOSTS.some((d) => host === d || host.endsWith("." + d));
    } catch {
        return false; // relative / unparseable URL — treat as a real image
    }
}

export default function CategoryThumb({
    image,
    title,
    tapeLabel = "TAPE",
}: {
    image?: string | null;
    title: string;
    tapeLabel?: string;
}) {
    if (!isPlaceholderImage(image)) {
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={image as string} alt={title} className="w-full h-full object-cover" />;
    }
    const initial = (title || "L").trim().charAt(0).toUpperCase() || "L";
    return (
        <div className="lpd-thumb" role="img" aria-label={title}>
            <span className="lpd-thumb-tape">▶ {tapeLabel}</span>
            <span className="lpd-thumb-initial">{initial}</span>
            <span className="lpd-thumb-name">{title}</span>
        </div>
    );
}
