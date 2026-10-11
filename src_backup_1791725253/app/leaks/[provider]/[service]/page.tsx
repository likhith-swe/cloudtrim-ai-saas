import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LeakCard from "@/components/LeakCard";
import {
  FALLBACK_LEAKS,
  providerServicePairs,
  serviceFromSlug,
  serviceSlug,
} from "@/lib/fallback-leaks";
import { providerMeta, usdRound } from "@/lib/format";
import { listLeaks } from "@/lib/queries";
import { jsonLdBreadcrumbs, jsonLdHub } from "@/lib/seo";
import type { Provider } from "@/lib/types";

interface Params {
  provider: string;
  service: string;
}

export async function generateStaticParams(): Promise<Params[]> {
  return providerServicePairs().map((p) => ({
    provider: p.provider,
    service: serviceSlug(p.service),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { provider, service: slug } = await params;
  const service = serviceFromSlug(slug) ?? slug;
  return {
    title: `${provider.toUpperCase()} ${service} — waste signatures & fixes`,
    description: `Verified ${service} cost-leak signatures on ${provider.toUpperCase()} with WasteScore, monthly burn and 1-click Terraform + CLI remediation.`,
  };
}

export default async function HubPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { provider, service: slug } = await params;
  const service = serviceFromSlug(slug);

  const valid =
    service !== null &&
    (provider === "aws" || provider === "gcp" || provider === "azure") &&
    providerServicePairs().some(
      (p) => p.provider === provider && p.service === service,
    );
  if (!valid) notFound();

  const leaks = await listLeaks({ provider, service: service!, sort: "waste" });
  if (leaks.length === 0) notFound();

  const total = leaks.reduce((acc, l) => acc + l.monthlyWasteUsd, 0);
  const meta = providerMeta(provider as Provider);
  const siblings = providerServicePairs()
    .filter((p) => p.provider === provider && p.service !== service)
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav className="font-mono text-[10px] uppercase tracking-widest text-fog">
        <Link href="/" className="hover:text-mint">radar</Link>
        <span className="mx-2 text-edge2">/</span>
        <span className="text-mist">
          {provider} / {service}
        </span>
      </nav>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className={`rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest ${meta.chip}`}>
          {meta.short}
        </span>
        <span className="rounded border border-edge px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-mist">
          {leaks.length} signature{leaks.length === 1 ? "" : "s"}
        </span>
        <span className="rounded border border-ember/40 bg-ember/10 px-2 py-0.5 font-mono text-[10px] font-bold text-ember">
          {usdRound(total)}/mo combined bleed
        </span>
      </div>

      <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-snow sm:text-4xl">
        {meta.label} · {service} waste radar
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fog">
        Every {service} leak below was detected by the CloudTrim sweep: raw
        metrics in, WasteScore out, remediation scripts attached. Free to read,
        free to copy, yours to reclaim.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {leaks.map((l) => (
          <LeakCard key={l.id} leak={l} />
        ))}
      </div>

      {siblings.length > 0 ? (
        <div className="mt-14 border-t border-edge pt-8">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-mint">
            other {provider} radars
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {siblings.map((s) => (
              <Link
                key={s.service}
                href={`/leaks/${s.provider}/${serviceSlug(s.service)}`}
                className="rounded-lg border border-edge px-3 py-1.5 font-mono text-[11px] text-mist transition hover:border-mint/50 hover:text-mint"
              >
                {s.service}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdHub(provider, service, leaks.length)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            jsonLdBreadcrumbs([
              { name: "Radar", path: "/" },
              { name: `${provider} ${service}`, path: `/leaks/${provider}/${serviceSlug(service!)}` },
            ]),
          ),
        }}
      />
      <span className="sr-only">{FALLBACK_LEAKS.length}</span>
    </div>
  );
}
