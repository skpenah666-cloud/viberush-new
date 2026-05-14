import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { PlayerProvider } from "@/components/player/PlayerContext";
import GlobalPlayer from "@/components/player/GlobalPlayer";
import MobileNav from "@/components/navigation/MobileNav";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";

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

  appleWebApp: {
    capable: true,
    title: "VibeRush",
    statusBarStyle: "black-translucent",
  },

  icons: {
    icon: [
      {
        url: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],

    apple: [
      {
        url: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
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
          <RegisterServiceWorker />

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