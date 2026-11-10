import type { Metadata } from "next";
import { withCanonical } from "@/lib/seo";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = withCanonical("/login", {
  title: "Sign in",
  description: "Sign in to PakOption with your email and password.",
  robots: { index: false, follow: false },
});

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const error = sp.error === "verify" ? "That verification link is invalid or expired." : undefined;
  return (
    <div className="container-page flex min-h-[calc(100dvh-4rem)] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 inline-block">
          <Logo />
        </Link>

        <h1 className="text-2xl font-bold tracking-[-0.03em] text-ivory">
          Welcome back
        </h1>
        <p className="mt-2 text-[14px] text-muted">
          Sign in to place bids, manage listings and track inspections.
        </p>

        <LoginForm error={error} />

        <p className="mt-6 flex items-start gap-2.5 rounded-lg border border-line bg-ink-2 p-4 text-[12px] leading-relaxed text-muted-2">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-brand-500" aria-hidden />
          <span>
            Email verification is enough to bid. An admin can record phone or CNIC
            verification. Lots above PKR 50,00,000 need the CNIC tier.
          </span>
        </p>
      </div>
    </div>
  );
}
