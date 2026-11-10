import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(_request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await context.params;
  const name = parts.join("/");
  if (name.includes("..") || parts.length !== 1) {
    return new NextResponse("Not found", { status: 404 });
  }
  const dir = process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");
  const file = path.join(dir, name);
  if (!file.startsWith(path.resolve(dir))) return new NextResponse("Not found", { status: 404 });
  try {
    const bytes = await readFile(file);
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": TYPES[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
