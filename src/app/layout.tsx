import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MotionProvider } from "@/components/motion/motion-provider";
import { TooltipProvider } from "@/components/ui/primitives";
import { SITE } from "@/lib/constants";
import { JsonLd } from "@/components/seo/json-ld";
import { HOME_TITLE, PUBLISHER, siteJsonLd } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  // The homepage does not use monospace. Skip the preload so it does not
  // compete with the sans file on the critical path.
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: HOME_TITLE,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "car auction Pakistan",
    "used cars Pakistan",
    "car inspection Pakistan",
    "sell car Pakistan",
    "buy car online Pakistan",
    "PakOption",
    "proxy bidding",
    "car bidding Pakistan",
  ],
  authors: [{ name: PUBLISHER.name, url: PUBLISHER.url }],
  creator: PUBLISHER.name,
  publisher: PUBLISHER.name,
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: `${SITE.url}/`,
    siteName: SITE.name,
    title: HOME_TITLE,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: SITE.description,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#04140E",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh antialiased">
        <JsonLd json={siteJsonLd()} />
        <MotionProvider>
          <TooltipProvider delayDuration={200}>
            <Navbar />
            <main id="main" className="pt-16 md:pt-18">
              {children}
            </main>
            <Footer />
            <Toaster
              position="bottom-right"
              theme="dark"
              toastOptions={{
                style: {
                  background: "#0A2119",
                  border: "1px solid #17392B",
                  color: "#F4F7F5",
                },
              }}
            />
          </TooltipProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
