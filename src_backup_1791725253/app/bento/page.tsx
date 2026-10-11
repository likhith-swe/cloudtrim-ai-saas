import type { Metadata } from "next";
import HeroWithMagnifiedBento from "@/components/HeroWithMagnifiedBento";
import Demo from "@/components/ui/demo";

export const metadata: Metadata = {
  title: "Magnified Bento Hero Demo — Interactive Lens Component",
  description:
    "Interactive Magnified Bento hero section built with shadcn, Tailwind CSS, motion/react and HugeIcons. Features dual-layer SVG clip-path magnification.",
  openGraph: {
    title: "Magnified Bento Hero Demo",
    description: "Drag the interactive magnifying lens across autonomous workflow badges.",
  },
};

export default function BentoPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* 1. Complete Hero Section with MagnifiedBento */}
      <HeroWithMagnifiedBento />

      {/* 2. Standalone Primitive Demonstration */}
      <section className="border-t border-zinc-900 bg-zinc-950/50 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Fluid Expanding Grid Companion
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Previously integrated 21st.dev fluid-expanding-grid primitive
          </p>
          <div className="mt-8 flex justify-center">
            <Demo />
          </div>
        </div>
      </section>
    </div>
  );
}
