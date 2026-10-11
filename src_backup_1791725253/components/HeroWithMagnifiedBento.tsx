"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import MagnifiedBento from "@/components/ui/magnified-bento";

export default function HeroWithMagnifiedBento() {
  return (
    <section className="relative overflow-hidden py-12 md:py-20 lg:py-24">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-emerald-500/10 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Left Column: Heading, Value Prop, CTA */}
          <div className="flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Gen Autonomous Workflow Engine</span>
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Inspect your team&apos;s stack with{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                contextual clarity
              </span>
              .
            </h1>

            <p className="mt-6 text-base leading-relaxed text-zinc-400 sm:text-lg">
              Drag the interactive magnifying lens on the right to discover live
              capabilities, devops pipelines, and microservice infrastructure in
              real time.
            </p>

            {/* Feature Checklist */}
            <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs sm:text-sm text-zinc-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Zero configuration required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Spring-physics dragging</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Dual-layer SVG inverse masks</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>100% accessible and responsive</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 hover:scale-[1.02]"
              >
                <span>Launch Interactive Demo</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#docs"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-6 py-3 text-sm font-semibold text-zinc-300 transition-all hover:border-zinc-700 hover:bg-zinc-800"
              >
                <span>View Architecture</span>
              </Link>
            </div>
          </div>

          {/* Right Column: MagnifiedBento Component */}
          <div className="flex items-center justify-center lg:justify-end">
            <MagnifiedBento />
          </div>
        </div>
      </div>
    </section>
  );
}
