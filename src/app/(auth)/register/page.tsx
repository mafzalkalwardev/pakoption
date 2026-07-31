import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Create a PakOption account to bid on inspection-backed cars, sell your own, and book inspections.",
};

const PERKS = [
  "Bid on 1,200+ live auctions",
  "Free listing when you book an inspection",
  "Outbid and ending-soon alerts",
  "Shareable inspection reports",
];

export default function RegisterPage() {
  return (
    <div className="container-page grid min-h-[calc(100dvh-4rem)] items-center gap-16 py-16 lg:grid-cols-2">
      {/* form */}
      <div className="mx-auto w-full max-w-sm lg:mx-0">
        <Link href="/" className="mb-8 inline-block">
          <Logo />
        </Link>

        <h1 className="text-2xl font-bold tracking-[-0.03em] text-ivory">
          Create your account
        </h1>
        <p className="mt-2 text-[14px] text-muted">
          Takes about a minute. We&rsquo;ll verify your number before your first
          bid.
        </p>

        <form className="mt-8 space-y-4">
          <div>
            <Label htmlFor="r-name">Full name</Label>
            <Input id="r-name" autoComplete="name" placeholder="Afzal Jani" />
          </div>

          <div>
            <Label htmlFor="r-email">Email</Label>
            <Input
              id="r-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <Label htmlFor="r-phone">Mobile number</Label>
            <Input
              id="r-phone"
              type="tel"
              autoComplete="tel"
              placeholder="03XX XXXXXXX"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="r-pass">Password</Label>
              <Input
                id="r-pass"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
              />
            </div>
            <div>
              <Label htmlFor="r-pass2">Confirm</Label>
              <Input
                id="r-pass2"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-2.5">
            <Checkbox id="r-terms" className="mt-0.5" />
            <span className="text-[12.5px] leading-relaxed text-muted">
              I accept the{" "}
              <Link href="/legal/terms" className="text-brand-400 hover:underline">
                terms
              </Link>
              ,{" "}
              <Link href="/legal/privacy" className="text-brand-400 hover:underline">
                privacy policy
              </Link>{" "}
              and{" "}
              <Link
                href="/legal/auction-rules"
                className="text-brand-400 hover:underline"
              >
                auction rules
              </Link>
              . I understand bids are binding.
            </span>
          </label>

          <Button type="submit" size="lg" className="w-full">
            Create account
            <ArrowRight />
          </Button>
        </form>

        <p className="mt-8 text-center text-[13.5px] text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      {/* perks */}
      <aside className="hidden lg:block">
        <div className="edge-light relative overflow-hidden rounded-2xl border border-line-strong bg-gradient-to-br from-brand-900 via-surface to-ink p-10">
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />
          <div
            className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-brand-500/20 blur-[90px]"
            aria-hidden
          />
          <div className="relative">
            <h2 className="text-2xl font-bold leading-tight tracking-[-0.03em] text-ivory">
              Every car verified.
              <br />
              <span className="text-gradient-brand">
                Every price in the open.
              </span>
            </h2>
            <ul className="mt-8 space-y-4">
              {PERKS.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-500/20">
                    <Check className="size-3 text-brand-400" strokeWidth={3} aria-hidden />
                  </span>
                  <span className="text-[14.5px] text-ivory">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}
