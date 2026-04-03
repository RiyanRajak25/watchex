import type { Metadata } from "next";
import { Playfair_Display, Barlow_Condensed, DM_Sans } from "next/font/google";
import Navbar from "@/components/Navbar";
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import WatchBot from "@/components/WatchBot";
import { TooltipProvider } from '@radix-ui/react-tooltip';
import "./globals.css";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const barlow = Barlow_Condensed({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--font-barlow" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm" });

export const metadata: Metadata = {
  title: "WatchEX | Stream Anything",
  description: "Next-generation Cinematic streaming platform powered by TMDB.",
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${barlow.variable} ${dmSans.variable} font-sans antialiased bg-background text-foreground`}>
        <NuqsAdapter>
          <TooltipProvider delayDuration={400}>
            <Navbar />
            {children}
            <WatchBot />
          </TooltipProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
