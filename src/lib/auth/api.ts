import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromToken, type SessionUser } from "@/lib/auth/session";
import { clientIp, forbiddenOrigin, jsonError, rateLimit, sameOrigin } from "@/lib/http/security";
import { DomainError } from "@/lib/domain/errors";

export async function requireUser(req: NextRequest): Promise<SessionUser | NextResponse> {
  if (!sameOrigin(req)) return forbiddenOrigin();
  const session = await getSessionFromToken(req.cookies.get("po_session")?.value);
  if (!session) return jsonError("UNAUTHENTICATED", "Sign in to continue.", 401);
  return session;
}

export function guardMutation(req: NextRequest, key: string, limit: number, windowMs: number) {
  if (!sameOrigin(req)) return forbiddenOrigin();
  if (!rateLimit(`${key}:${clientIp(req)}`, limit, windowMs)) {
    return jsonError("RATE_LIMITED", "Too many requests. Try again shortly.", 429);
  }
  return null;
}

export function domainErrorResponse(error: unknown) {
  if (error instanceof DomainError) {
    return jsonError(error.code, error.message, error.status, error.extra);
  }
  console.error(error);
  return jsonError("INTERNAL", "Something went wrong.", 500);
}
