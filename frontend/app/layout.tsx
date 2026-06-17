import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WakeUp from "@/components/WakeUp";
import Providers from "@/components/Providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Socialyze — Know exactly where your brand stands",
  description: "Submit your Instagram handle and get a free AI-powered brand audit instantly. Scores, gaps, personas, and actionable recommendations.",
  openGraph: {
    title: "Socialyze — Know exactly where your brand stands",
    description: "Submit your Instagram handle and get a free AI-powered brand audit instantly.",
    url: "https://social-media-app-opt.vercel.app",
    siteName: "Socialyze",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Socialyze — Know exactly where your brand stands",
    description: "Free AI brand audit. Submit your Instagram handle, get your score instantly.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Providers>
          <WakeUp />
          <Nav />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
