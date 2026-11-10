import { OG_ALT, ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = OG_ALT;
export const size = ogSize;
export const contentType = ogContentType;

export default function TwitterImage() {
  return renderOgImage();
}
