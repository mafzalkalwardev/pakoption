import { prisma } from "@/lib/db/client";
import { DomainError } from "@/lib/domain/errors";
import { notify } from "@/lib/notify";

export async function markOrderPaid(orderId: string, actorId: string, method: "BANK_TRANSFER" | "CASH") {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { buyer: true, seller: true, listing: true },
  });
  if (!order) throw new DomainError("NOT_FOUND", "Order not found.", 404);
  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: method === "CASH" ? "COMPLETED" : "DEPOSIT_PAID",
      depositPaidAt: new Date(),
      completedAt: method === "CASH" ? new Date() : undefined,
    },
  });
  await prisma.auditLog.create({
    data: {
      actorId,
      action: method === "CASH" ? "ORDER_CASH_RECEIVED" : "ORDER_BANK_TRANSFER_RECEIVED",
      entity: "Order",
      entityId: orderId,
      afterJson: { method, status: updated.status },
    },
  });
  await notify(order.buyerId, "PAYMENT_MARKED", { orderId, method }, {
    to: order.buyer.email,
    subject: `Payment recorded for ${order.listing.title}`,
    text: `An admin recorded your ${method === "CASH" ? "cash" : "bank transfer"} payment.`,
  });
  return updated;
}
