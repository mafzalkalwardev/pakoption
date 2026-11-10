"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/primitives";

export function LoginForm({ error }: { error?: string }) {
  const router = useRouter();
  const [message, setMessage] = React.useState(error ?? "");
  const [pending, setPending] = React.useState(false);
  const [remember, setRemember] = React.useState(true);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
        remember,
      }),
    });
    const body = (await res.json()) as { error?: { message: string } };
    setPending(false);
    if (!res.ok) {
      setMessage(body.error?.message ?? "Could not sign in.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={onSubmit}>
      {message && (
        <p className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[13px] text-ivory" role="alert">
          {message}
        </p>
      )}
      <div>
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-2" aria-hidden />
          <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" className="pl-10" />
        </div>
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-2" aria-hidden />
          <Input id="password" name="password" type="password" autoComplete="current-password" required minLength={8} className="pl-10" />
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <Checkbox id="remember" checked={remember} onCheckedChange={(value) => setRemember(value === true)} />
        <label htmlFor="remember" className="text-[13px] text-muted">Keep me signed in for 30 days</label>
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        Sign in
        <ArrowRight />
      </Button>
      <p className="text-center text-[13.5px] text-muted">
        New here? <Link href="/register" className="text-brand-400 hover:underline">Create an account</Link>
      </p>
    </form>
  );
}
