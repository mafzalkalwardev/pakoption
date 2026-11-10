import { NextResponse, type NextRequest } from "next/server";
import { logoutAccount } from "@/lib/auth/accounts";
import { guardMutation } from "@/lib/auth/api";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const blocked = guardMutation(req, "logout", 30, 60_000);
  if (blocked) return blocked;
  await logoutAccount();
  return NextResponse.json({ ok: true });
}
