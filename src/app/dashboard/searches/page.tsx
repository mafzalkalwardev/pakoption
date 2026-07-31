import type { Metadata } from "next";
import Link from "next/link";
import { Bell, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Saved searches" };

const SAVED = [
  {
    name: "Civic / Corolla under 70 lakh",
    query: "Honda Civic, Toyota Corolla · under PKR 70,00,000 · Certified only",
    frequency: "Instant",
    matches: 12,
  },
  {
    name: "Low-mileage SUVs in Lahore",
    query: "SUV · Lahore · under 50,000 km · 2020 onwards",
    frequency: "Daily digest",
    matches: 5,
  },
  {
    name: "No-reserve lots",
    query: "Auctions · no reserve · any make",
    frequency: "Daily digest",
    matches: 3,
  },
];

export default function SavedSearchesPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-ivory">
        Saved searches
      </h1>
      <p className="mt-1.5 text-[14px] text-muted">
        We check new listings against these and tell you when something matches.
      </p>

      <div className="mt-6 space-y-3">
        {SAVED.map((s) => (
          <div
            key={s.name}
            className="flex flex-wrap items-center gap-4 rounded-lg border border-line bg-surface p-5"
          >
            <Search className="size-5 shrink-0 text-brand-400" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-[14.5px] font-medium text-ivory">{s.name}</p>
              <p className="mt-1 text-[12.5px] text-muted">{s.query}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="brand" size="sm">
                {s.matches} new
              </Badge>
              <span className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-2">
                <Bell className="size-3.5" aria-hidden />
                {s.frequency}
              </span>
              <Button variant="ghost" size="icon-sm" aria-label="Delete search">
                <Trash2 />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" className="mt-6" asChild>
        <Link href="/auctions">Create a new search</Link>
      </Button>
    </div>
  );
}
