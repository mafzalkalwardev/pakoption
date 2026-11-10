import type { Metadata } from "next";
import { LandingPage } from "@/components/home/landing";
import { JsonLd } from "@/components/seo/json-ld";
import { HOME_DESCRIPTION, HOME_TITLE, homeJsonLd, withCanonical } from "@/lib/seo";

export const metadata: Metadata = withCanonical("/", {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
});

export default function HomePage() {
  return (
    <>
      <JsonLd json={homeJsonLd()} />
      <LandingPage />
    </>
  );
}
