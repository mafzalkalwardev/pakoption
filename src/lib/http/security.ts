import { NextResponse, type NextRequest } from "next/server";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "local";
}

/** Browsers send Origin on cross-site POSTs. Reject a mismatched origin. */
export function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function forbiddenOrigin() {
  return NextResponse.json(
    { error: { code: "FORBIDDEN", message: "Cross-origin request rejected." } },
    { status: 403 },
  );
}

export function rateLimited() {
  return NextResponse.json(
    { error: { code: "RATE_LIMITED", message: "Too many requests. Try again shortly." } },
    { status: 429 },
  );
}

export function jsonError(code: string, message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: { code, message }, ...extra }, { status });
}
