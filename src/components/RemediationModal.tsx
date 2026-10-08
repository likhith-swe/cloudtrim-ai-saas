"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { providerMeta, riskMeta, usdRound } from "@/lib/format";
import type { CloudLeak } from "@/lib/types";
import { ModalHeader, ModalShell } from "./GlobalModals";

/** Copyable code block with light comment highlighting. */
export function CopyBlock({ code, filename }: { code: string; filename: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-edge">
      <div className="flex items-center justify-between border-b border-edge bg-raise px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-fog">
          {filename}
        </span>
        <button
          onClick={copy}
          className={`inline-flex items-center gap-1.5 rounded px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest transition ${
            copied
              ? "text-lime"
              : "text-mint hover:bg-mint/10"
          }`}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" /> copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" /> copy
            </>
          )}
        </button>
      </div>
      <pre className="codebox max-h-72 overflow-auto rounded-none border-0 p-4 whitespace-pre text-mist">
        {code.split("\n").map((line, i) => (
          <span key={i} className={line.trimStart().startsWith("#") ? "tf-comment" : undefined}>
            {line}
            {"\n"}
          </span>
        ))}
      </pre>
    </div>
  );
}

export default function RemediationModal({
  leak,
  onClose,
}: {
  leak: CloudLeak;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"terraform" | "cli">("terraform");
  const [scripts, setScripts] = useState<{ terraform: string; cli: string }>({
    terraform: leak.remediationScriptTerraform,
    cli: leak.remediationScriptCli,
  });

  useEffect(() => {
    let alive = true;
    fetch(`/api/leak/${encodeURIComponent(leak.id)}/remediate`, {
      method: "POST",
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (alive && data?.terraform && data?.cli) {
          setScripts({ terraform: data.terraform, cli: data.cli });
        }
      })
      .catch(() => {
        /* keep catalog scripts */
      });
    return () => {
      alive = false;
    };
  }, [leak.id]);

  const provider = providerMeta(leak.provider);
  const risk = riskMeta(leak.riskLevel);

  return (
    <ModalShell onClose={onClose} wide>
      <ModalHeader
        eyebrow="remediation console"
        title={leak.resourceName}
        onClose={onClose}
      />
      <div className="px-6 py-5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest ${provider.chip}`}
          >
            {provider.short}
          </span>
          <span className="rounded border border-edge px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-mist">
            {leak.service} · {leak.region}
          </span>
          <span className="rounded border border-ember/40 bg-ember/10 px-2 py-0.5 font-mono text-[10px] font-bold text-ember">
            {usdRound(leak.monthlyWasteUsd)}/mo
          </span>
          <span className="rounded border border-mint/40 bg-mint/10 px-2 py-0.5 font-mono text-[10px] font-bold text-mint">
            score {leak.wasteScore}
          </span>
          <span
            className={`rounded border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest ${risk.chip}`}
          >
            {risk.label}
          </span>
        </div>

        <p className="mt-3 text-sm text-fog">{leak.detectionReason}</p>

        <div className="mt-5 flex gap-1 rounded-lg border border-edge bg-ink p-1">
          {(
            [
              { key: "terraform", label: "Terraform" },
              { key: "cli", label: leak.provider === "gcp" ? "gcloud CLI" : leak.provider === "azure" ? "az CLI" : "AWS CLI" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 rounded-md py-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest transition ${
                tab === t.key
                  ? "bg-mint/15 text-mint"
                  : "text-fog hover:text-mist"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {tab === "terraform" ? (
            <CopyBlock code={scripts.terraform} filename="main.tf" />
          ) : (
            <CopyBlock code={scripts.cli} filename="cleanup.sh" />
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-edge pt-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-fog">
            reclaims ≈{" "}
            <span className="text-lime">
              {usdRound(leak.monthlyWasteUsd)}/mo
            </span>{" "}
            · {usdRound(leak.monthlyWasteUsd * 12)}/yr
          </p>
          <Link
            href={`/leak/${leak.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-mint/50 bg-mint/10 px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-mint transition hover:bg-mint/20"
          >
            Full audit <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </ModalShell>
  );
}
