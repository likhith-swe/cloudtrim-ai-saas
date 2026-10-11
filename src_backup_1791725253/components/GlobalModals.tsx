"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CloudLeak } from "@/lib/types";
import NewsletterModal from "./NewsletterModal";
import PricingModal from "./PricingModal";
import RemediationModal from "./RemediationModal";
import WatchlistModal from "./WatchlistModal";

export type ModalKind =
  | "remediation"
  | "watchlist"
  | "pricing"
  | "newsletter"
  | null;

interface ModalsCtx {
  active: ModalKind;
  leak: CloudLeak | null;
  open: (kind: Exclude<ModalKind, null>, leak?: CloudLeak) => void;
  close: () => void;
}

const Ctx = createContext<ModalsCtx>({
  active: null,
  leak: null,
  open: () => {},
  close: () => {},
});

export function useModals(): ModalsCtx {
  return useContext(Ctx);
}

export default function GlobalModals({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ModalKind>(null);
  const [leak, setLeak] = useState<CloudLeak | null>(null);

  const open = useCallback(
    (kind: Exclude<ModalKind, null>, l?: CloudLeak) => {
      setActive(kind);
      setLeak(l ?? null);
    },
    [],
  );
  const close = useCallback(() => setActive(null), []);

  const value = useMemo(
    () => ({ active, leak, open, close }),
    [active, leak, open, close],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      {active === "remediation" && leak ? (
        <RemediationModal leak={leak} onClose={close} />
      ) : null}
      {active === "watchlist" ? (
        <WatchlistModal onClose={close} presetLeak={leak} />
      ) : null}
      {active === "pricing" ? <PricingModal onClose={close} /> : null}
      {active === "newsletter" ? <NewsletterModal onClose={close} /> : null}
    </Ctx.Provider>
  );
}

/** Shared modal chrome: backdrop, esc-to-close, bordered terminal panel. */
export function ModalShell({
  onClose,
  children,
  wide = false,
}: {
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/85 backdrop-blur-sm"
      />
      <div
        className={`modal-in relative max-h-[88vh] w-full ${
          wide ? "max-w-3xl" : "max-w-md"
        } overflow-y-auto rounded-xl border border-edge2 bg-panel shadow-[0_24px_90px_rgba(0,0,0,0.65)]`}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({
  eyebrow,
  title,
  onClose,
}: {
  eyebrow: string;
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between border-b border-edge px-6 py-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-mint">
          {eyebrow}
        </p>
        <h3 className="mt-1 text-lg font-semibold text-snow">{title}</h3>
      </div>
      <button
        onClick={onClose}
        aria-label="Close"
        className="rounded-md border border-edge px-2.5 py-1 font-mono text-xs text-fog transition hover:border-edge2 hover:text-snow"
      >
        ESC ✕
      </button>
    </div>
  );
}
