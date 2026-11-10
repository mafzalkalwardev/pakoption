import { NextResponse, type NextRequest } from "next/server";
import { placeBid } from "@/lib/domain/bids";
import { domainErrorResponse, guardMutation, requireUser } from "@/lib/auth/api";
import { getBidsForAuction } from "@/lib/db/repository";
import { bidSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auctionId = new URL(req.url).searchParams.get("auctionId");
  if (!auctionId) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "auctionId is required" } },
      { status: 422 },
    );
  }
  const bids = await getBidsForAuction(auctionId);
  return NextResponse.json({
    data: bids.map((bid) => ({
      handle: bid.bidderHandle,
      amount: bid.amount,
      isAutoBid: bid.isAutoBid,
      placedAt: bid.placedAt,
    })),
  });
}

export async function POST(req: NextRequest) {
  const limited = guardMutation(req, "bid", 10, 60_000);
  if (limited) return limited;
  const user = await requireUser(req);
  if (user instanceof NextResponse) return user;
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: { code: "UNAVAILABLE", message: "Bidding needs DATABASE_URL." } },
      { status: 503 },
    );
  }
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid JSON body" } },
      { status: 422 },
    );
  }
  const parsed = bidSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Enter a whole-rupee maximum.", details: parsed.error.flatten() } },
      { status: 422 },
    );
  }
  try {
    const result = await placeBid({ userId: user.id, ...parsed.data });
    return NextResponse.json(result);
  } catch (error) {
    return domainErrorResponse(error);
  }
}
