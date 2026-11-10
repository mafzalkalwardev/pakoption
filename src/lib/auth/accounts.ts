import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/db/client";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { DomainError } from "@/lib/domain/errors";
import { sendMail } from "@/lib/notify";
import { loginSchema, registerSchema } from "@/lib/validations";

function handleFor(name: string) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 12) || "user";
  return `${base}_${randomBytes(2).toString("hex")}`;
}

export async function registerAccount(raw: unknown, options: { session?: boolean } = {}) {
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    throw new DomainError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Check the form.", 422);
  }
  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (existing) throw new DomainError("VALIDATION_ERROR", "An account with that email already exists.", 422);
  const phoneTaken = await prisma.user.findUnique({ where: { phone: parsed.data.phone } });
  if (phoneTaken) throw new DomainError("VALIDATION_ERROR", "That phone number is already registered.", 422);

  const smtp = Boolean(process.env.SMTP_HOST);
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email.toLowerCase(),
      passwordHash: await hashPassword(parsed.data.password),
      name: parsed.data.name,
      handle: handleFor(parsed.data.name),
      phone: parsed.data.phone,
      role: "BUYER",
      // Without SMTP there is no mailbox to prove. The account is usable at the email tier.
      tier: smtp ? "NONE" : "EMAIL",
    },
  });

  if (smtp) {
    const token = randomBytes(24).toString("hex");
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetTokenHash: createHash("sha256").update(`verify:${token}`).digest("hex"),
        resetTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    const url = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/auth/verify?token=${token}`;
    await sendMail({
      to: user.email,
      subject: "Verify your PakOption email",
      text: `Open this link to verify your email: ${url}`,
    });
  }

  if (options.session !== false) await createSession(user, true);
  return { id: user.id, email: user.email, tier: smtp ? "NONE" : "EMAIL" };
}

export async function loginAccount(raw: unknown, remember: boolean) {
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) throw new DomainError("VALIDATION_ERROR", "Enter your email and password.", 422);
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  const ok = await verifyPassword(parsed.data.password, user?.passwordHash);
  if (!user || !ok) throw new DomainError("UNAUTHENTICATED", "Email or password is wrong.", 401);
  await createSession(user, remember);
  return { id: user.id, role: user.role };
}

export async function logoutAccount() {
  await destroySession();
}

export async function verifyEmailToken(token: string) {
  const hash = createHash("sha256").update(`verify:${token}`).digest("hex");
  const user = await prisma.user.findFirst({
    where: { resetTokenHash: hash, resetTokenExpiresAt: { gt: new Date() } },
  });
  if (!user) throw new DomainError("NOT_FOUND", "This verification link is invalid or expired.", 404);
  await prisma.user.update({
    where: { id: user.id },
    data: { tier: user.tier === "NONE" ? "EMAIL" : user.tier, resetTokenHash: null, resetTokenExpiresAt: null },
  });
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return;
  const token = randomBytes(24).toString("hex");
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetTokenHash: createHash("sha256").update(`reset:${token}`).digest("hex"),
      resetTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/reset-password?token=${token}`;
  const sent = await sendMail({
    to: user.email,
    subject: "Reset your PakOption password",
    text: `Reset your password: ${url}`,
  });
  return sent.sent ? undefined : { token };
}

export async function resetPassword(token: string, password: string) {
  if (password.length < 8) throw new DomainError("VALIDATION_ERROR", "Use at least 8 characters.", 422);
  const hash = createHash("sha256").update(`reset:${token}`).digest("hex");
  const user = await prisma.user.findFirst({
    where: { resetTokenHash: hash, resetTokenExpiresAt: { gt: new Date() } },
  });
  if (!user) throw new DomainError("NOT_FOUND", "This reset link is invalid or expired.", 404);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(password), resetTokenHash: null, resetTokenExpiresAt: null },
  });
  await prisma.session.deleteMany({ where: { userId: user.id } });
}
