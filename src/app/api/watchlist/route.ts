import { NextResponse, type NextRequest } from "next/server";
import { domainErrorResponse, guardMutation, requireUser } from "@/lib/auth/api";
import { toggleWatch } from "@/lib/domain/offers";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = guardMutation(req, "watch", 60, 60_000);
  if (limited) return limited;
  const user = await requireUser(req);
  if (user instanceof NextResponse) return user;
  try {
    const body = (await req.json()) as { listingId?: string };
    if (!body.listingId) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "listingId is required" } }, { status: 422 });
    }
    const result = await toggleWatch(user.id, body.listingId);
    return NextResponse.json(result);
  } catch (error) {
    return domainErrorResponse(error);
  }
}
