import { NextResponse, type NextRequest } from "next/server";
import { closeDueAuctions } from "@/lib/domain/close";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Invalid cron secret" } },
      { status: 401 },
    );
  }
  const started = Date.now();
  const result = await closeDueAuctions();
  return NextResponse.json({ ...result, durationMs: Date.now() - started, persisted: true });
}
