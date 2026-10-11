import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in — Magic Link",
  description: "Passwordless sign-in for the CloudTrim AI waste radar.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-edge bg-panel p-8 shadow-[0_18px_70px_rgba(0,0,0,0.5)]">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-mint">
            passwordless access
          </p>
          <h1 className="mt-3 text-2xl font-bold text-snow">
            Sign in to the radar
          </h1>
          <p className="mt-2 text-sm text-fog">
            Drop your email — we&apos;ll send a 15-minute magic link. No
            passwords, no reset flows, no zombie credentials.
          </p>
          <LoginForm />
        </div>
        <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-widest text-fog">
          QA build: instant link preview shown after request
        </p>
      </div>
    </div>
  );
}
