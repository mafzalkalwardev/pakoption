import { NextResponse, type NextRequest } from "next/server";
import { getListings } from "@/lib/db/repository";
import { parseQuery, type SearchParams } from "@/lib/query";

/** Turns repeatable query params into the shape `parseQuery` expects. */
function toSearchParams(url: URL): SearchParams {
  const out: SearchParams = {};
  for (const key of new Set(url.searchParams.keys())) {
    const all = url.searchParams.getAll(key);
    out[key] = all.length > 1 ? all : all[0];
  }
  return out;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const query = parseQuery(toSearchParams(url));

  const result = await getListings({ ...query, type: "AUCTION" });

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
    },
  });
}
