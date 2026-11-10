import { NextResponse, type NextRequest } from "next/server";
import { domainErrorResponse, guardMutation, requireUser } from "@/lib/auth/api";
import { createListing } from "@/lib/domain/listings";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = guardMutation(req, "listing", 5, 60 * 60 * 1000);
  if (limited) return limited;
  const user = await requireUser(req);
  if (user instanceof NextResponse) return user;
  try {
    const body = await req.json();
    const listing = await createListing(user.id, body);
    return NextResponse.json({ ok: true, ...listing }, { status: 201 });
  } catch (error) {
    return domainErrorResponse(error);
  }
}
