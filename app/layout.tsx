import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { PlayerProvider } from "@/components/player/PlayerContext";
import GlobalPlayer from "@/components/player/GlobalPlayer";
import MobileNav from "@/components/navigation/MobileNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VibeRush",
  description: "Upload, stream, and discover music on VibeRush.",
  manifest: "/manifest.json",
  themeColor: "#f97316",
  appleWebApp: {
    capable: true,
    title: "VibeRush",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export const viewport = {
  themeColor: "#f97316",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-black text-white">
        <PlayerProvider>
          <div className="relative flex min-h-screen flex-col">
            <main className="flex-1 pb-36 md:pb-32">
              {children}
            </main>

            <GlobalPlayer />

            <div className="md:hidden">
              <MobileNav />
            </div>
          </div>
        </PlayerProvider>
      </body>
    </html>
  );
}