import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LeakCard from "@/components/LeakCard";
import { CopyBlock } from "@/components/RemediationModal";
import { FALLBACK_LEAKS, serviceSlug } from "@/lib/fallback-leaks";
import { perDay, perHour, perYear, providerMeta, riskMeta, scoreTone, timeAgo, usd, usdRound } from "@/lib/format";
import { countRemediations, getLeak, listLeaks } from "@/lib/queries";
import { jsonLdBreadcrumbs, jsonLdLeak } from "@/lib/seo";
import { explainBreakdown, FORMULA_TEXT } from "@/lib/waste-score";

export async function generateStaticParams() {
  return FALLBACK_LEAKS.map((l) => ({ id: l.id }));
}

interface Params {
  id: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const leak = await getLeak(id);
  if (!leak) return { title: "Leak not found" };
  const title = `${leak.service} leak audit: ${leak.resourceName} burns ${usdRound(leak.monthlyWasteUsd)}/mo`;
  return {
    title,
    description: leak.detectionReason,
    openGraph: {
      title,
      description: leak.detectionReason,
      images: [
        `/api/og?waste=${leak.monthlyWasteUsd}&score=${leak.wasteScore}&resource=${encodeURIComponent(leak.resourceName)}&label=${encodeURIComponent(`${leak.service} LEAK DETECTED`)}`,
      ],
    },
  };
}

export default async function LeakPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const leak = await getLeak(id);
  if (!leak) notFound();

  const [breakdown, remediations, related] = await Promise.all([
    Promise.resolve(explainBreakdown(leak.metrics)),
    countRemediations(leak.id),
    listLeaks({ category: leak.category, sort: "waste" }),
  ]);
  const relatedLeaks = related.filter((l) => l.id !== leak.id).slice(0, 3);

  const provider = providerMeta(leak.provider);
  const risk = riskMeta(leak.riskLevel);
  const tone = scoreTone(leak.wasteScore);

  const hubPath = `/leaks/${leak.provider}/${serviceSlug(leak.service)}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav className="font-mono text-[10px] uppercase tracking-widest text-fog">
        <Link href="/" className="hover:text-mint">radar</Link>
        <span className="mx-2 text-edge2">/</span>
        <Link href={hubPath} className="hover:text-mint">
          {provider.short} {leak.service}
        </Link>
        <span className="mx-2 text-edge2">/</span>
        <span className="text-mist">{leak.id}</span>
      </nav>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className={`rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest ${provider.chip}`}>
          {provider.short}
        </span>
        <span className="rounded border border-edge px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-mist">
          {leak.service}
        </span>
        <span className="rounded border border-edge px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-mist">
          {leak.region}
        </span>
        <span className={`rounded border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest ${risk.chip}`}>
          {risk.label}
        </span>
        <span className="font-mono text-[10px] text-fog">
          first seen {timeAgo(leak.firstSeenAt)}
        </span>
      </div>

      <div className="mt-4 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <h1 className="font-mono text-3xl font-bold text-snow sm:text-4xl">
            {leak.resourceName}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-fog">
            {leak.detectionReason}
          </p>

          {/* burn math */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "per hour", value: perHour(leak.monthlyWasteUsd) },
              { label: "per day", value: perDay(leak.monthlyWasteUsd) },
              { label: "per month", value: usd(leak.monthlyWasteUsd) },
              { label: "per year", value: perYear(leak.monthlyWasteUsd) },
            ].map((b) => (
              <div key={b.label} className="rounded-xl border border-edge bg-panel p-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-fog">
                  {b.label}
                </p>
                <p className="mt-2 font-mono text-lg font-bold text-ember">
                  {b.value}
                </p>
              </div>
            ))}
          </div>

          {/* remediation */}
          <div className="mt-10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-snow">
                1-click remediation
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-widest text-fog">
                generated {remediations}× via API · review before prod
              </span>
            </div>
            <div className="mt-4 space-y-4">
              <CopyBlock
                code={leak.remediationScriptTerraform}
                filename="main.tf"
              />
              <CopyBlock
                code={leak.remediationScriptCli}
                filename={
                  leak.provider === "gcp"
                    ? "cleanup.sh (gcloud)"
                    : leak.provider === "azure"
                      ? "cleanup.sh (az)"
                      : "cleanup.sh (awscli)"
                }
              />
            </div>
          </div>
        </div>

        {/* score audit */}
        <aside className="h-fit rounded-xl border border-edge bg-panel p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-mint">
            wastescore audit
          </p>
          <div className="mt-3 flex items-end gap-3">
            <span className={`font-mono text-6xl font-bold ${tone.text}`}>
              {leak.wasteScore}
            </span>
            <span className="pb-2 font-mono text-sm text-fog">/ 100</span>
          </div>
          <p className="mt-3 break-words rounded-lg border border-edge bg-ink/60 p-3 font-mono text-[9.5px] leading-relaxed text-fog">
            {FORMULA_TEXT}
          </p>

          <div className="mt-5 space-y-3">
            {breakdown.rows.map((r) => {
              const pct = r.max > 0 ? Math.min(100, (r.weighted / r.max) * 100) : 0;
              return (
                <div key={r.key}>
                  <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest">
                    <span className="text-mist">{r.label}</span>
                    <span className="text-snow">+{r.weighted.toFixed(1)}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-edge">
                    <div className="h-full bg-mint" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-0.5 font-mono text-[9px] text-fog">{r.detail}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-5 space-y-1.5 border-t border-edge pt-4 font-mono text-[11px]">
            {breakdown.bonus > 0 ? (
              <p className="flex justify-between text-lime">
                <span>+ critical abandoned bonus (≥14d zero I/O)</span>
                <span>+{breakdown.bonus}</span>
              </p>
            ) : null}
            {breakdown.penalty > 0 ? (
              <p className="flex justify-between text-aqua">
                <span>− production risk penalty</span>
                <span>−{breakdown.penalty}</span>
              </p>
            ) : null}
            <p className="flex justify-between pt-1 text-sm font-bold text-snow">
              <span>final</span>
              <span>{breakdown.total}/100</span>
            </p>
          </div>

          <button
            onClick={undefined}
            className="sr-only"
            aria-hidden
            tabIndex={-1}
          />
        </aside>
      </div>

      {relatedLeaks.length > 0 ? (
        <section className="mt-16">
          <h2 className="text-xl font-bold text-snow">
            More {leak.category.replace("-", " & ")} waste on the radar
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {relatedLeaks.map((l) => (
              <LeakCard key={l.id} leak={l} />
            ))}
          </div>
        </section>
      ) : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdLeak(leak)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            jsonLdBreadcrumbs([
              { name: "Radar", path: "/" },
              { name: `${provider.short} ${leak.service}`, path: hubPath },
              { name: leak.id, path: `/leak/${leak.id}` },
            ]),
          ),
        }}
      />
    </div>
  );
}
