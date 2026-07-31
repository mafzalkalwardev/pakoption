import type { Metadata } from "next";
import { Check, CreditCard, Mail, Phone, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Separator } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold tracking-tight text-ivory">
        Settings
      </h1>
      <p className="mt-1.5 text-[14px] text-muted">
        Verification tier controls what you can bid on. CNIC verification is
        required above PKR 50,00,000.
      </p>

      {/* verification */}
      <section className="mt-8 rounded-xl border border-line bg-surface p-6">
        <h2 className="text-[15px] font-semibold text-ivory">Verification</h2>

        <div className="mt-5 space-y-3">
          {[
            { Icon: Mail, label: "Email", value: "243472@students.au.edu.pk", done: true },
            { Icon: Phone, label: "Mobile number", value: "+92 3XX XXXXXXX", done: true },
            { Icon: CreditCard, label: "CNIC", value: "Not yet verified", done: false },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center gap-4 rounded-lg border border-line bg-ink-2 p-4"
            >
              <row.Icon className="size-4 shrink-0 text-muted-2" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-medium text-ivory">{row.label}</p>
                <p className="mt-0.5 truncate text-[12.5px] text-muted">
                  {row.value}
                </p>
              </div>
              {row.done ? (
                <Badge variant="brand" size="sm">
                  <Check aria-hidden />
                  Verified
                </Badge>
              ) : (
                <Button size="sm" variant="outline">
                  Verify
                </Button>
              )}
            </div>
          ))}
        </div>

        <p className="mt-4 flex items-start gap-2.5 text-[12px] leading-relaxed text-muted-2">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-brand-500" aria-hidden />
          <span>
            Your CNIC is stored as a one-way hash plus the last four digits. The
            full number is never persisted and never returned to any client.
          </span>
        </p>
      </section>

      {/* profile */}
      <section className="mt-6 rounded-xl border border-line bg-surface p-6">
        <h2 className="text-[15px] font-semibold text-ivory">Profile</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="st-name">Full name</Label>
            <Input id="st-name" defaultValue="Afzal Jani" />
          </div>
          <div>
            <Label htmlFor="st-city">City</Label>
            <Input id="st-city" defaultValue="Islamabad" />
          </div>
        </div>
        <Separator className="my-5" />
        <div>
          <Label htmlFor="st-handle">Public bidding handle</Label>
          <Input id="st-handle" defaultValue="bidder_4f9a" className="font-mono" />
          <p className="mt-1.5 text-[12px] text-muted-2">
            This is the only identity other bidders see in a bid log.
          </p>
        </div>
        <Button className="mt-6">Save changes</Button>
      </section>
    </div>
  );
}
