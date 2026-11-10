import { NextResponse, type NextRequest } from "next/server";
import { domainErrorResponse, guardMutation } from "@/lib/auth/api";
import { registerAccount } from "@/lib/auth/accounts";
import { clientIp, rateLimit } from "@/lib/http/security";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const blocked = guardMutation(req, "register", 8, 60 * 60 * 1000);
  if (blocked) return blocked;
  if (!rateLimit(`register-ip:${clientIp(req)}`, 8, 60 * 60 * 1000)) {
    return NextResponse.json({ error: { code: "RATE_LIMITED", message: "Too many sign-ups." } }, { status: 429 });
  }
  try {
    const user = await registerAccount(await req.json());
    return NextResponse.json({ ok: true, ...user }, { status: 201 });
  } catch (error) {
    return domainErrorResponse(error);
  }
}
