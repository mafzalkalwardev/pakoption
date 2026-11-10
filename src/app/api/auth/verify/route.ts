import { NextResponse, type NextRequest } from "next/server";
import { verifyEmailToken } from "@/lib/auth/accounts";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  try {
    await verifyEmailToken(token);
    return NextResponse.redirect(new URL("/dashboard?verified=1", req.url));
  } catch {
    return NextResponse.redirect(new URL("/login?error=verify", req.url));
  }
}
