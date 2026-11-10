import { NextResponse, type NextRequest } from "next/server";
import { domainErrorResponse, guardMutation, requireUser } from "@/lib/auth/api";
import { submitOffer } from "@/lib/domain/offers";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = guardMutation(req, "offer", 20, 60_000);
  if (limited) return limited;
  const user = await requireUser(req);
  if (user instanceof NextResponse) return user;
  try {
    const offer = await submitOffer(user.id, await req.json());
    return NextResponse.json({ ok: true, ...offer }, { status: 201 });
  } catch (error) {
    return domainErrorResponse(error);
  }
}
