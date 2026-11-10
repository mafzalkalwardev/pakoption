import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Gavel, Heart, Plus, ShieldCheck, Trophy } from "lucide-react";
import { ListingCard } from "@/components/auction/listing-card";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import { getAccountSnapshot } from "@/lib/db/repository";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const account = await getAccountSnapshot(session.id);

  const stats = [
    { label: "Bids placed", value: account.bids, Icon: Gavel },
    { label: "Leading on", value: account.leading, Icon: Trophy },
    { label: "Watching", value: account.watching, Icon: Heart },
    { label: "Inspections", value: account.inspections, Icon: ShieldCheck },
  ];

  return (
    <div className="space-y-10">
      {session.role === "ADMIN" && (
        <p className="text-sm">
          <Link href="/admin" className="text-brand-300 underline">Open the moderation panel</Link>
        </p>
      )}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, Icon }) => (
          <div key={label} className="edge-light rounded-lg border border-line bg-surface p-5">
            <Icon className="size-5 text-brand-400" aria-hidden />
            <p className="mt-4 font-mono text-2xl font-semibold text-ivory tnum">{value}</p>
            <p className="mt-1 text-[12.5px] text-muted">{label}</p>
          </div>
        ))}
      </div>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight text-ivory">Notifications</h2>
        </div>
        {account.notifications.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No notifications yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {account.notifications.map((item) => (
              <li key={item.id} className="rounded-md border border-line bg-surface px-4 py-3 text-sm text-ivory">
                <span className="font-mono text-[12px] text-brand-300">{item.type}</span>
                <span className="mt-1 block text-muted">{new Date(item.createdAt).toLocaleString("en-PK", { timeZone: "Asia/Karachi" })}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold text-ivory">Your listings</h2>
          <Button asChild size="sm">
            <Link href="/sell/new"><Plus /> New listing</Link>
          </Button>
        </div>
        {account.listings.length === 0 ? (
          <p className="mt-3 text-sm text-muted">You have not submitted a listing yet.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {account.listings.slice(0, 4).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
