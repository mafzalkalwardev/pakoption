import type { Metadata } from "next";
import { withCanonical } from "@/lib/seo";
import Link from "next/link";
import { Check } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = withCanonical("/register", {
  title: "Create an account",
  description:
    "Create a PakOption account with your email and a password.",
  robots: { index: false, follow: false },
});

const PERKS = [
  "Auction board with proxy bidding and a three-minute soft close",
  "Listing fee set to zero on review when you book an inspection",
  "Inspection reports with a shareable link",
  "Compare up to four cars",
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
          Email and password. An admin can record phone or CNIC verification later.
        </p>

        <RegisterForm />

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
