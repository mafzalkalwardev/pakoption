import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { guardMutation, requireUser } from "@/lib/auth/api";

export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(req: NextRequest) {
  const limited = guardMutation(req, "upload", 40, 60 * 60 * 1000);
  if (limited) return limited;
  const user = await requireUser(req);
  if (user instanceof NextResponse) return user;

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Choose an image." } }, { status: 422 });
  }
  const ext = TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Use JPG, PNG, or WebP." } }, { status: 422 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Images must be 10 MB or smaller." } }, { status: 422 });
  }
  const dir = process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const name = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, name), bytes);
  return NextResponse.json({ url: `/uploads/${name}` });
}
