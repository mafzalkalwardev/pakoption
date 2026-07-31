import { NextResponse } from "next/server";
import { getStats } from "@/lib/db/repository";

export async function GET() {
  const stats = await getStats();
  return NextResponse.json(
    { data: stats },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
