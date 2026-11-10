import { NextResponse, type NextRequest } from "next/server";
import { domainErrorResponse, guardMutation } from "@/lib/auth/api";
import { loginAccount } from "@/lib/auth/accounts";
import { clientIp, rateLimit } from "@/lib/http/security";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const blocked = guardMutation(req, "login", 10, 60_000);
  if (blocked) return blocked;
  if (!rateLimit(`login-ip:${clientIp(req)}`, 10, 60_000)) {
    return NextResponse.json({ error: { code: "RATE_LIMITED", message: "Too many sign-in attempts." } }, { status: 429 });
  }
  try {
    const body = (await req.json()) as { email?: string; password?: string; remember?: boolean };
    const user = await loginAccount(body, Boolean(body.remember));
    return NextResponse.json({ ok: true, ...user });
  } catch (error) {
    return domainErrorResponse(error);
  }
}
