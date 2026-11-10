"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/primitives";

export function RegisterForm() {
  const router = useRouter();
  const [message, setMessage] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [accepted, setAccepted] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        password: form.get("password"),
        confirmPassword: form.get("confirmPassword"),
        acceptTerms: accepted,
      }),
    });
    const body = (await res.json()) as { error?: { message: string } };
    setPending(false);
    if (!res.ok) {
      setMessage(body.error?.message ?? "Could not create the account.");
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
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required minLength={2} autoComplete="name" />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div>
        <Label htmlFor="phone">Mobile</Label>
        <Input id="phone" name="phone" required placeholder="03XXXXXXXXX" autoComplete="tel" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" />
      </div>
      <div className="flex items-start gap-2.5">
        <Checkbox id="acceptTerms" checked={accepted} onCheckedChange={(value) => setAccepted(value === true)} />
        <label htmlFor="acceptTerms" className="text-[13px] text-muted">
          I accept the <Link href="/legal/terms" className="text-brand-400 hover:underline">terms</Link>.
        </label>
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>Create account</Button>
    </form>
  );
}
