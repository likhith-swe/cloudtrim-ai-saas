/** Currency, badge and time formatters shared across UI + API. */

import type { Provider, RiskLevel } from "./types";

/** 34800 -> "$348.00" */
export function usd(minor: number): string {
  const v = minor / 100;
  return v.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: v >= 1000 ? 0 : 2,
    maximumFractionDigits: v >= 1000 ? 0 : 2,
  });
}

/** 34800 -> "$348" */
export function usdRound(minor: number): string {
  return `$${Math.round(minor / 100).toLocaleString("en-US")}`;
}

/** 49900 -> "₹499" */
export function inr(minor: number): string {
  return `₹${Math.round(minor / 100).toLocaleString("en-IN")}`;
}

export function perDay(minor: number): string {
  return usd(Math.round(minor / 30));
}

export function perHour(minor: number): string {
  const v = minor / 100 / 30 / 24;
  return `$${v.toFixed(2)}`;
}

export function perYear(minor: number): string {
  return usdRound(minor * 12);
}

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "never";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "unknown";
  const s = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

export interface ToneClasses {
  text: string;
  bar: string;
  chip: string;
}

export function scoreTone(score: number): ToneClasses {
  if (score >= 80) {
    return {
      text: "text-ember",
      bar: "bg-ember",
      chip: "border-ember/40 bg-ember/10 text-ember",
    };
  }
  if (score >= 60) {
    return {
      text: "text-gold",
      bar: "bg-gold",
      chip: "border-gold/40 bg-gold/10 text-gold",
    };
  }
  return {
    text: "text-mint",
    bar: "bg-mint",
    chip: "border-mint/40 bg-mint/10 text-mint",
  };
}

export function riskMeta(risk: RiskLevel): { label: string; chip: string } {
  switch (risk) {
    case "safe_to_terminate":
      return {
        label: "SAFE TO TERMINATE",
        chip: "border-mint/40 bg-mint/10 text-mint",
      };
    case "needs_snapshot":
      return {
        label: "SNAPSHOT FIRST",
        chip: "border-gold/40 bg-gold/10 text-gold",
      };
    case "production_review":
      return {
        label: "PRODUCTION REVIEW",
        chip: "border-ember/40 bg-ember/10 text-ember",
      };
  }
}

export function providerMeta(p: Provider): {
  label: string;
  short: string;
  chip: string;
} {
  switch (p) {
    case "aws":
      return {
        label: "Amazon Web Services",
        short: "AWS",
        chip: "border-gold/40 bg-gold/10 text-gold",
      };
    case "gcp":
      return {
        label: "Google Cloud Platform",
        short: "GCP",
        chip: "border-aqua/40 bg-aqua/10 text-aqua",
      };
    case "azure":
      return {
        label: "Microsoft Azure",
        short: "AZURE",
        chip: "border-skyx/40 bg-skyx/10 text-skyx",
      };
  }
}

export function titleCase(s: string): string {
  return s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1));
}
