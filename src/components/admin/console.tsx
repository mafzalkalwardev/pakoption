"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatPKR } from "@/lib/format";

type Listing = { id: string; title: string; seller: string; type: string };
type Order = { id: string; title: string; buyer: string; total: number; status: string };
type Inspection = { id: string; reference: string; city: string; customer: string; status: string };
type UserRow = { id: string; name: string; email: string; role: string; tier: string };
type Auction = { id: string; title: string; endsAt: string };

async function act(body: Record<string, unknown>) {
  const res = await fetch("/api/admin", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const json = (await res.json()) as { error?: { message: string } };
    throw new Error(json.error?.message ?? "Admin action failed");
  }
}

export function AdminConsole({
  listings,
  orders,
  inspections,
  users,
  auctions,
}: {
  listings: Listing[];
  orders: Order[];
  inspections: Inspection[];
  users: UserRow[];
  auctions: Auction[];
}) {
  const router = useRouter();
  const [error, setError] = React.useState("");

  async function run(body: Record<string, unknown>) {
    setError("");
    try {
      await act(body);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <div className="mt-8 space-y-10">
      {error && <p className="text-sm text-danger" role="alert">{error}</p>}

      <section>
        <h2 className="text-xl font-semibold text-ivory">Listings waiting for review</h2>
        {listings.length === 0 ? <p className="mt-2 text-sm text-muted">None.</p> : (
          <ul className="mt-4 space-y-3">
            {listings.map((listing) => (
              <li key={listing.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-3">
                <div>
                  <p className="font-medium text-ivory">{listing.title}</p>
                  <p className="text-sm text-muted">{listing.type} · {listing.seller}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => run({ action: "approve", listingId: listing.id })}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => run({ action: "reject", listingId: listing.id })}>Reject</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold text-ivory">Live auctions</h2>
        <Button className="mt-3" variant="outline" size="sm" onClick={() => run({ action: "close-due" })}>Close auctions that have ended</Button>
        <ul className="mt-4 space-y-3">
          {auctions.map((auction) => (
            <li key={auction.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-3">
              <div>
                <p className="font-medium text-ivory">{auction.title}</p>
                <p className="text-sm text-muted">Ends {new Date(auction.endsAt).toLocaleString("en-PK", { timeZone: "Asia/Karachi" })}</p>
              </div>
              <Button size="sm" variant="danger" onClick={() => run({ action: "close-now", auctionId: auction.id })}>Close now</Button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-ivory">Payments</h2>
        <p className="mt-1 text-sm text-muted">Bank transfer and cash are recorded here. There is no card gateway.</p>
        {orders.length === 0 ? <p className="mt-2 text-sm text-muted">No open orders.</p> : (
          <ul className="mt-4 space-y-3">
            {orders.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-3">
                <div>
                  <p className="font-medium text-ivory">{order.title}</p>
                  <p className="text-sm text-muted">{order.buyer} · {formatPKR(order.total)} · {order.status}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => run({ action: "mark-paid", orderId: order.id, method: "BANK_TRANSFER" })}>Bank transfer</Button>
                  <Button size="sm" variant="outline" onClick={() => run({ action: "mark-paid", orderId: order.id, method: "CASH" })}>Cash</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold text-ivory">Inspections to complete</h2>
        {inspections.length === 0 ? <p className="mt-2 text-sm text-muted">None scheduled.</p> : (
          <ul className="mt-4 space-y-3">
            {inspections.map((inspection) => (
              <li key={inspection.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-3">
                <div>
                  <p className="font-medium text-ivory">{inspection.reference}</p>
                  <p className="text-sm text-muted">{inspection.customer} · {inspection.city} · {inspection.status}</p>
                </div>
                <Button size="sm" onClick={() => run({ action: "complete-inspection", inspectionId: inspection.id, score: 8.4, summary: "Completed from the admin panel. Category scores use the overall score until an inspector enters them individually." })}>Mark complete</Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold text-ivory">Accounts</h2>
        <ul className="mt-4 space-y-3">
          {users.map((user) => (
            <li key={user.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-3">
              <div>
                <p className="font-medium text-ivory">{user.name}</p>
                <p className="text-sm text-muted">{user.email} · {user.role} · {user.tier}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => run({ action: "set-user", userId: user.id, role: "INSPECTOR", tier: "PHONE" })}>Make inspector</Button>
                <Button size="sm" variant="outline" onClick={() => run({ action: "set-user", userId: user.id, role: user.role, tier: "CNIC" })}>Mark CNIC</Button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
