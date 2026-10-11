"use client";

import { KeyRound, MailCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function LoginFormInner() {
  const params = useSearchParams();
  const tokenError = params.get("error") === "token";
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [qaLink, setQaLink] = useState<string | null>(null);
  const [emailed, setEmailed] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const submit = async () => {
    setState("sending");
    setErrMsg("");
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "failed");
      setState("sent");
      setQaLink(data?.qaLink ?? null);
      setEmailed(Boolean(data?.emailed));
      setCooldown(30);
    } catch (err) {
      setState("error");
      const code = err instanceof Error ? err.message : "failed";
      setErrMsg(
        code === "invalid_email"
          ? "That email doesn't parse."
          : code === "rate_limited"
            ? "Too many attempts — wait a few minutes."
            : "Could not send the link. Try again.",
      );
    }
  };

  if (state === "sent") {
    return (
      <div className="mt-6 rounded-xl border border-mint/40 bg-mint/[0.06] p-5 text-center">
        <MailCheck className="mx-auto h-8 w-8 text-mint" />
        <p className="mt-3 font-mono text-sm font-semibold text-mint">
          MAGIC LINK DISPATCHED
        </p>
        <p className="mt-2 text-sm text-fog">
          Sent to <span className="text-snow">{email}</span>.{" "}
          {emailed
            ? "Check your inbox (and spam)."
            : "Email channel is offline in this sandbox — use the QA link below."}
          {" "}Valid for 15 minutes, single use.
        </p>
        {qaLink ? (
          <a
            href={qaLink}
            className="mt-4 block rounded-lg bg-mint px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-widest text-ink transition hover:bg-lime"
          >
            ⚡ Instant QA link — open the radar now
          </a>
        ) : null}
        <button
          onClick={submit}
          disabled={cooldown > 0}
          className="mt-4 font-mono text-[10px] uppercase tracking-widest text-fog transition hover:text-mist disabled:opacity-40"
        >
          {cooldown > 0 ? `resend in ${cooldown}s` : "resend link"}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {tokenError ? (
        <p className="mb-4 rounded-lg border border-ember/40 bg-ember/10 px-4 py-3 font-mono text-xs text-ember">
          ✕ That magic link expired or was already used. Request a fresh one.
        </p>
      ) : null}
      <label className="font-mono text-[9px] uppercase tracking-[0.3em] text-fog">
        work email
      </label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && email.includes("@") && submit()}
        placeholder="ops@yourcompany.dev"
        className="mt-2 w-full rounded-lg border border-edge bg-ink px-3 py-3 font-mono text-sm text-snow placeholder:text-fog/50 focus:border-mint/60 focus:outline-none"
      />
      <button
        onClick={submit}
        disabled={state === "sending" || !email.includes("@")}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-mint py-3 font-mono text-[11px] font-bold uppercase tracking-widest text-ink transition hover:bg-lime disabled:opacity-50"
      >
        <KeyRound className="h-3.5 w-3.5" />
        {state === "sending" ? "dispatching…" : "Send magic link"}
      </button>
      {state === "error" ? (
        <p className="mt-3 text-center font-mono text-xs text-ember">
          ✕ {errMsg}
        </p>
      ) : null}
      <p className="mt-4 text-center text-[11px] leading-relaxed text-fog">
        Signing in also arms your personal tripwire namespace. We never share
        your email — see the monetization disclosure for how we earn instead.
      </p>
    </div>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={null}>
      <LoginFormInner />
    </Suspense>
  );
}
