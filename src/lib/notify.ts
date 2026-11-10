import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/client";

export async function notify(userId: string, type: string, payload: Prisma.InputJsonValue, email?: { to: string; subject: string; text: string }) {
  await prisma.notification.create({
    data: { userId, type, payloadJson: payload },
  });
  if (email) await sendMail(email);
}

export async function sendMail(message: { to: string; subject: string; text: string }) {
  const host = process.env.SMTP_HOST;
  if (!host) return { sent: false as const, reason: "SMTP is not configured" };
  const port = Number(process.env.SMTP_PORT || 25);
  const from = process.env.EMAIL_FROM || "PakOption <no-reply@localhost>";
  try {
    const nodemailer = await import("nodemailer");
    const transport = nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === "true",
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASSWORD
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
          : undefined,
    });
    await transport.sendMail({ from, to: message.to, subject: message.subject, text: message.text });
    return { sent: true as const };
  } catch (error) {
    console.error("SMTP send failed", error);
    return { sent: false as const, reason: "SMTP send failed" };
  }
}
