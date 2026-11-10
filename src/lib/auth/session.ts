import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/client";
import type { Role, VerificationTier } from "@/types";

export const SESSION_COOKIE = "po_session";
export const NAME_COOKIE = "po_name";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  handle: string;
  role: Role;
  tier: VerificationTier;
  city: string | null;
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(user: { id: string; name: string }, remember: boolean) {
  const token = randomBytes(32).toString("hex");
  const maxAge = remember ? THIRTY_DAYS : 60 * 60 * 12;
  const expiresAt = new Date(Date.now() + maxAge * 1000);
  await prisma.session.create({
    data: { userId: user.id, tokenHash: hashToken(token), expiresAt },
  });
  const jar = await cookies();
  const secure = process.env.NODE_ENV === "production";
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge,
  });
  jar.set(NAME_COOKIE, user.name, {
    httpOnly: false,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  jar.delete(SESSION_COOKIE);
  jar.delete(NAME_COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  if (!process.env.DATABASE_URL) return null;
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const row = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
  if (!row || row.expiresAt.getTime() < Date.now()) {
    if (row) await prisma.session.delete({ where: { id: row.id } }).catch(() => undefined);
    return null;
  }
  return {
    id: row.user.id,
    email: row.user.email,
    name: row.user.name,
    handle: row.user.handle,
    role: row.user.role,
    tier: row.user.tier,
    city: row.user.city,
  };
}

export async function getSessionFromToken(token: string | undefined): Promise<SessionUser | null> {
  if (!token || !process.env.DATABASE_URL) return null;
  const row = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
  if (!row || row.expiresAt.getTime() < Date.now()) return null;
  return {
    id: row.user.id,
    email: row.user.email,
    name: row.user.name,
    handle: row.user.handle,
    role: row.user.role,
    tier: row.user.tier,
    city: row.user.city,
  };
}
