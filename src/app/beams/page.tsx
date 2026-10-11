import type { Metadata } from "next";
import EtherealBeamsHero from "@/components/ui/ethereal-beams-hero";

export const metadata: Metadata = {
  title: "3D Ethereal Beams Hero — Procedural GLSL Shaders & WebGL",
  description:
    "High-performance Three.js & React Three Fiber animated light beams with glassmorphic navbar and procedural cnoise displacement.",
  openGraph: {
    title: "3D Ethereal Beams Hero",
    description: "Mesmerizing 3D animated light beams background using Three.js and WebGL shaders.",
  },
};

export default function BeamsPage() {
  return (
    <div className="min-h-screen bg-black">
      <EtherealBeamsHero showNavbar={true} />
    </div>
  );
}
