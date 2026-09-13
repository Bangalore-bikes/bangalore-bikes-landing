import type { Metadata, Viewport } from "next";
import { Figtree, Unbounded } from "next/font/google";

import { RevealObserver } from "@/components/common/reveal-observer";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SosFab } from "@/components/layout/sos-fab";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SITE } from "@/data/site";

import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-figtree",
  display: "swap",
});

const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  variable: "--font-unbounded",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} - ${SITE.subreddit}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.tagline,
  keywords: [
    "bangalore",
    "bengaluru",
    "motorcycle community",
    "bike rides",
    "group rides",
    "riding routes",
  ],
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} - ${SITE.subreddit}`,
    description:
      "Weekend routes, night rides, ride rules and a community that shows up when you're stranded.",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/logo.jpeg", apple: "/logo.jpeg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0d" },
    { media: "(prefers-color-scheme: light)", color: "#f6f4ef" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${figtree.variable} ${unbounded.variable} antialiased`}>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem
          storageKey="bb-theme"
          disableTransitionOnChange
        >
          <div className="flex min-h-svh flex-col">
            <SiteHeader />
            <main className="grow">{children}</main>
            <SiteFooter />
          </div>
          <SosFab />
          <RevealObserver />
        </ThemeProvider>
      </body>
    </html>
  );
}
