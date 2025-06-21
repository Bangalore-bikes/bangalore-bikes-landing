import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
