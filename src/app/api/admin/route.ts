import { NextResponse, type NextRequest } from "next/server";
import { domainErrorResponse, guardMutation, requireUser } from "@/lib/auth/api";
import { approveListing, rejectListing } from "@/lib/domain/listings";
import { completeInspection } from "@/lib/domain/inspections";
import { markOrderPaid } from "@/lib/domain/orders";
import { closeDueAuctions } from "@/lib/domain/close";
import { prisma } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const blocked = guardMutation(req, "admin", 60, 60_000);
  if (blocked) return blocked;
  const user = await requireUser(req);
  if (user instanceof NextResponse) return user;
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: { code: "FORBIDDEN", message: "Admin only." } }, { status: 403 });
  }
  try {
    const body = (await req.json()) as {
      action?: string;
      listingId?: string;
      orderId?: string;
      inspectionId?: string;
      userId?: string;
      role?: "BUYER" | "SELLER" | "DEALER" | "INSPECTOR" | "ADMIN";
      tier?: "NONE" | "EMAIL" | "PHONE" | "CNIC" | "DEALER_VERIFIED";
      method?: "BANK_TRANSFER" | "CASH";
      score?: number;
      summary?: string;
      auctionId?: string;
    };
    if (body.action === "approve" && body.listingId) {
      await approveListing(body.listingId, user.id);
    } else if (body.action === "reject" && body.listingId) {
      await rejectListing(body.listingId, user.id);
    } else if (body.action === "mark-paid" && body.orderId && body.method) {
      await markOrderPaid(body.orderId, user.id, body.method);
    } else if (body.action === "complete-inspection" && body.inspectionId) {
      await completeInspection({
        inspectionId: body.inspectionId,
        inspectorId: user.id,
        overallScore: body.score ?? 8,
        summary: body.summary || "Inspection completed by an admin.",
      });
    } else if (body.action === "set-user" && body.userId) {
      await prisma.user.update({
        where: { id: body.userId },
        data: { role: body.role, tier: body.tier },
      });
      await prisma.auditLog.create({
        data: { actorId: user.id, action: "USER_UPDATED", entity: "User", entityId: body.userId, afterJson: { role: body.role, tier: body.tier } },
      });
    } else if (body.action === "close-now" && body.auctionId) {
      await prisma.auction.update({ where: { id: body.auctionId }, data: { endsAt: new Date(Date.now() - 1000) } });
      await closeDueAuctions();
    } else if (body.action === "close-due") {
      await closeDueAuctions();
    } else {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Unknown admin action." } }, { status: 422 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return domainErrorResponse(error);
  }
}
