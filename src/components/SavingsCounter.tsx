"use client";

import { useEffect, useRef, useState } from "react";
import { usdRound } from "@/lib/format";

/**
 * Live ticking counter: counts up to the identified waste total on mount,
 * then keeps climbing as the radar "finds" new burn.
 */
export default function SavingsCounter({
  initialMinor,
  label = "identified across the reference fleet",
}: {
  initialMinor: number;
  label?: string;
}) {
  const [display, setDisplay] = useState(0);
  const [flash, setFlash] = useState(false);
  const target = useRef(initialMinor);
  const current = useRef(0);

  useEffect(() => {
    target.current = initialMinor;
    let raf = 0;
    const startTs = performance.now();
    const from = 0;
    const duration = 1400;

    const step = (ts: number) => {
      const p = Math.min(1, (ts - startTs) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      current.current = Math.round(from + (target.current - from) * eased);
      setDisplay(current.current);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const drip = setInterval(() => {
      const delta = 400 + Math.round(Math.random() * 1800);
      target.current += delta;
      current.current = target.current;
      setDisplay(target.current);
      setFlash(true);
      setTimeout(() => setFlash(false), 900);
    }, 5200);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(drip);
    };
  }, [initialMinor]);

  return (
    <div className="flex flex-col gap-1">
      <span
        className={`font-mono text-4xl font-bold tracking-tight text-ember glow-ember sm:text-5xl ${
          flash ? "tick-flash" : ""
        }`}
      >
        {usdRound(display)}
        <span className="text-xl text-fog">/mo</span>
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-fog">
        {label}
      </span>
    </div>
  );
}
