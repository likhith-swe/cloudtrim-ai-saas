import Link from "next/link";

export const metadata = { title: "404 — Signal Lost" };

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="relative h-56 w-56">
        <div className="absolute inset-0 rounded-full border border-edge2" />
        <div className="absolute inset-6 rounded-full border border-edge2/70" />
        <div className="absolute inset-12 rounded-full border border-edge2/50" />
        <div className="absolute inset-20 rounded-full border border-edge2/30" />
        <div className="radar-sweep absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,rgba(61,220,132,0.35),transparent_70deg)]" />
        <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mint pulse-dot" />
        <div className="blip absolute right-10 top-12 h-2 w-2 rounded-full bg-ember" />
      </div>
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-fog">
          radar contact lost
        </p>
        <h1 className="mt-3 text-5xl font-bold text-snow">404</h1>
        <p className="mt-4 max-w-md text-sm text-fog">
          This blip drifted off the radar. The resource may have been
          remediated — that&apos;s the good outcome.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg border border-mint/50 bg-mint/10 px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-widest text-mint transition hover:bg-mint/20"
        >
          ← Back to the radar
        </Link>
        <Link
          href="/#pricing"
          className="rounded-lg border border-edge px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-fog transition hover:border-edge2 hover:text-mist"
        >
          Pricing
        </Link>
      </div>
    </div>
  );
}
