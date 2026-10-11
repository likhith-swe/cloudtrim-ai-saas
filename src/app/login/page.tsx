import type { Metadata } from "next";
import { Component as SignInCard2 } from "@/components/ui/sign-in-card-2";

export const metadata: Metadata = {
  title: "Sign in — CloudTrim Radar",
  description: "3D Perspective Sign-in with traveling perimeter light beams.",
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black">
      <SignInCard2 />
    </div>
  );
}
