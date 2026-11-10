import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { AdminConsole } from "@/components/admin/console";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  const [listings, orders, inspections, users, auctions] = await Promise.all([
    prisma.listing.findMany({ where: { status: "PENDING_REVIEW" }, orderBy: { createdAt: "asc" }, include: { seller: true } }),
    prisma.order.findMany({ where: { status: { in: ["PENDING_DEPOSIT", "DEPOSIT_PAID"] } }, include: { listing: true, buyer: true }, orderBy: { createdAt: "desc" } }),
    prisma.inspection.findMany({ where: { status: { in: ["REQUESTED", "SCHEDULED"] } }, include: { customer: true }, orderBy: { createdAt: "asc" } }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 30, select: { id: true, name: true, email: true, role: true, tier: true } }),
    prisma.auction.findMany({ where: { status: "LIVE" }, include: { listing: true }, orderBy: { endsAt: "asc" }, take: 20 }),
  ]);

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold tracking-tight text-ivory">Moderation</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Approve listings, record a bank transfer or cash payment, complete an inspection, and close auctions whose clock has run out.
      </p>
      <AdminConsole
        listings={listings.map((listing) => ({ id: listing.id, title: listing.title, seller: listing.seller.name, type: listing.type }))}
        orders={orders.map((order) => ({ id: order.id, title: order.listing.title, buyer: order.buyer.name, total: order.total, status: order.status }))}
        inspections={inspections.map((inspection) => ({ id: inspection.id, reference: inspection.reference, city: inspection.city, customer: inspection.customer.name, status: inspection.status }))}
        users={users}
        auctions={auctions.map((auction) => ({ id: auction.id, title: auction.listing.title, endsAt: auction.endsAt.toISOString() }))}
      />
    </div>
  );
}
