import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to bid, sell and manage your PakOption inspections.",
};

export default function LoginPage() {
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

        <form className="mt-8 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-2"
                aria-hidden
              />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="mb-1.5 text-[12.5px] text-brand-400 hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-2"
                aria-hidden
              />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Checkbox id="remember" />
            <label htmlFor="remember" className="text-[13px] text-muted">
              Keep me signed in for 30 days
            </label>
          </div>

          <Button type="submit" size="lg" className="w-full">
            Sign in
            <ArrowRight />
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <span className="text-[11px] uppercase tracking-[0.12em] text-muted-2">
            or
          </span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <Button variant="secondary" size="lg" className="w-full">
          Continue with Google
        </Button>

        <p className="mt-8 text-center text-[13.5px] text-muted">
          New here?{" "}
          <Link href="/register" className="text-brand-400 hover:underline">
            Create an account
          </Link>
        </p>

        <p className="mt-6 flex items-start gap-2.5 rounded-lg border border-line bg-ink-2 p-4 text-[12px] leading-relaxed text-muted-2">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-brand-500" aria-hidden />
          <span>
            Phone verification is required before your first bid. CNIC
            verification unlocks lots above PKR 50,00,000.
          </span>
        </p>
      </div>
    </div>
  );
}
