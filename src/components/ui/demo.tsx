"use client";

import EtherealBeamsHero from "@/components/ui/ethereal-beams-hero";

const settings = {
  beamWidth: 2.5,
  beamHeight: 18,
  speed: 2.5,
  noiseIntensity: 2,
  lightColor: "#ffffff",
  rotation: 43,
};

export default function Demo(props: Partial<typeof settings>) {
  const s = { ...settings, ...props };
  return (
    <div className="h-screen w-screen">
      <EtherealBeamsHero {...s} />
    </div>
  );
}
