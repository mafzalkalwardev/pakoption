import { INSPECTION_PACKAGES } from "@/lib/constants";
import { prisma } from "@/lib/db/client";
import { DomainError } from "@/lib/domain/errors";
import { notify } from "@/lib/notify";
import { inspectionBookingSchema } from "@/lib/validations";

export async function bookInspection(userId: string, raw: unknown) {
  const parsed = inspectionBookingSchema.safeParse(raw);
  if (!parsed.success) {
    throw new DomainError("VALIDATION_ERROR", "Check the booking and try again.", 422, {
      details: parsed.error.flatten(),
    });
  }
  const input = parsed.data;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new DomainError("UNAUTHENTICATED", "Sign in to book an inspection.", 401);
  if (input.isDoorstep && (input.address?.trim().length ?? 0) < 8) {
    throw new DomainError("VALIDATION_ERROR", "Enter the doorstep address.", 422);
  }
  const pack = INSPECTION_PACKAGES.find((item) => item.id === input.packageId);
  if (!pack) throw new DomainError("VALIDATION_ERROR", "Unknown inspection package.", 422);

  const [hours] = input.scheduledSlot.split("–")[0]!.trim().split(":");
  const scheduledAt = new Date(`${input.scheduledDate}T${hours ?? "09"}:00:00+05:00`);
  const year = new Date().getFullYear();
  const count = await prisma.inspection.count();
  const reference = `PO-INS-${year}-${String(count + 1).padStart(5, "0")}`;

  const inspection = await prisma.inspection.create({
    data: {
      reference,
      listingId: input.listingId,
      customerId: user.id,
      package: input.packageId,
      status: "SCHEDULED",
      city: input.city,
      isDoorstep: input.isDoorstep,
      address: input.address,
      scheduledAt,
      price: pack.price,
    },
  });

  if (!user.phone) {
    await prisma.user.update({ where: { id: user.id }, data: { phone: input.phone, name: input.name } });
  }

  await notify(user.id, "INSPECTION_BOOKED", { reference, city: input.city }, {
    to: user.email,
    subject: `Inspection ${reference} booked`,
    text: `Your ${pack.name} inspection in ${input.city} is scheduled for ${input.scheduledDate} (${input.scheduledSlot}).`,
  });

  return { reference, id: inspection.id, publicToken: inspection.publicToken };
}

export async function completeInspection(input: {
  inspectionId: string;
  inspectorId: string;
  overallScore: number;
  summary: string;
}) {
  const grade = input.overallScore >= 9 ? "A" : input.overallScore >= 7.5 ? "B" : input.overallScore >= 6 ? "C" : "D";
  const categories = [
    ["engine", "Engine", 0.2],
    ["transmission", "Transmission & Drivetrain", 0.15],
    ["body", "Body & Structure", 0.16],
    ["suspension", "Suspension & Steering", 0.1],
    ["brakes", "Brakes", 0.09],
    ["electrical", "Electrical & Electronics", 0.1],
    ["interior", "Interior", 0.06],
    ["exterior", "Exterior & Glass", 0.06],
    ["documents", "Documents & History", 0.08],
  ] as const;
  const inspection = await prisma.inspection.update({
    where: { id: input.inspectionId },
    data: {
      status: "COMPLETED",
      inspectorId: input.inspectorId,
      completedAt: new Date(),
      overallScore: input.overallScore,
      grade,
      checkpointsTotal: 212,
      checkpointsPassed: Math.round((input.overallScore / 10) * 212),
      summary: input.summary,
      categories: {
        create: categories.map(([slug, name, weight]) => ({
          slug,
          name,
          score: input.overallScore,
          weight,
          itemsTotal: 10,
          itemsPassed: Math.round((input.overallScore / 10) * 10),
          items: {
            create: [{ label: `${name} check`, severity: input.overallScore >= 7.5 ? "OK" : "ADVISORY" }],
          },
        })),
      },
    },
  });
  await notify(inspection.customerId, "INSPECTION_READY", { reference: inspection.reference, token: inspection.publicToken }, {
    to: (await prisma.user.findUniqueOrThrow({ where: { id: inspection.customerId } })).email,
    subject: `Report ${inspection.reference} is ready`,
    text: `The inspection report is ready at /inspection/report/${inspection.publicToken}`,
  });
  return inspection;
}
