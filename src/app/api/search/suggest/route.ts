import { NextResponse, type NextRequest } from "next/server";
import { suggest } from "@/lib/db/repository";

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const data = await suggest(q, 8);

  return NextResponse.json(
    { data },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
