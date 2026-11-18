import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";
import type { Metadata } from "next";
import { Newsreader, Space_Grotesk } from "next/font/google";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { ViewTransitions } from "next-view-transitions";
import { siteName, siteOrigin } from "@/lib/siteMetadata";
import { jsonLdScript, organizationJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

/**
 * One reading serif for post bodies only. UI and display stay in Space Grotesk,
 * so the editorial pages feel different without a second visual language.
 */
const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: { default: siteName, template: "%s | " + siteName },
  description:
    "A community home for r/BangaloreBikes and motorcycle riders of every brand in Bengaluru.",
  keywords:
    "bangalore, motorcycle maintenance, bike rides, motorcycle community",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${spaceGrotesk.className} ${spaceGrotesk.variable} ${newsreader.variable} antialiased`}
        >
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: jsonLdScript([organizationJsonLd(), websiteJsonLd()]),
            }}
          />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-svh flex flex-col">
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-4 focus:py-3 focus:text-foreground focus:underline"
              >
                Skip to content
              </a>
              <Navbar />
              <div
                id="main-content"
                tabIndex={-1}
                className="flex grow flex-col px-2 sm:px-8 mt-16 w-full lg:w-3/4 self-center scroll-mt-20"
              >
                {children}
              </div>
              <Footer />
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
