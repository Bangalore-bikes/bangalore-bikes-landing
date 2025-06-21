import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { ViewTransitions } from "next-view-transitions";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bangalore Bikes",
  description:
    "Started in 2024 we aim to be a hub for all biking enthusiasts in Bangalore. Whether you're a veteran or just someone who enjoys a leisurely ride through the city, this community is for you.",
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
        <body className={`${spaceGrotesk.className} antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-svh flex flex-col">
              <Navbar />
              <div className="flex grow flex-col px-2 sm:px-8 mt-16 w-full lg:w-3/4 self-center">
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
