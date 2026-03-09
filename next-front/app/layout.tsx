import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { WalletProvider } from "@/contexts/WalletContext";
import Header from "@/components/Header";
import Nav from "@/components/Nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arena Mayhem",
  description: "Blockchain battle game powered by Cartesi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#1a1614] text-stone-200 font-serif selection:bg-amber-900 selection:text-white`}>
        <WalletProvider>
          <Header />
          <div className="max-w-full px-8 py-8 flex gap-10 pb-20">
            <Nav />
            <main className="flex-1 min-w-0">{children}</main>
          </div>
          {/* Fixed footer */}
          <footer className="fixed bottom-0 w-full bg-[#14110f] border-t-2 border-stone-800 px-8 py-2.5 flex justify-between items-center text-[10px] text-stone-600 uppercase tracking-[0.3em] font-bold font-sans z-40">
            <div className="flex gap-8">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-900 rounded-full border border-green-500 inline-block" />
                Cartesi Rollups v2
              </span>
            </div>
            <span>Arena Mayhem — Blood &amp; Steel on-chain</span>
          </footer>
        </WalletProvider>
        <Script src="/js/fight.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
