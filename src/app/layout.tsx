import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { siteConfig } from "@/constants/siteConfig";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const merriweather = Merriweather({ variable: "--font-merriweather", subsets: ["latin"], weight: ["300", "400", "700", "900"], display: "swap" });

export const metadata: Metadata = {
  title: { default: `${siteConfig.school.name} | ${siteConfig.school.motto}`, template: `%s | ${siteConfig.school.name}` },
  description: "Kathmandu English School - A premier educational institution in Nepal providing quality education from Nursery to Grade 12.",
  keywords: ["Kathmandu English School", "KES", "education", "Nepal", "school"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${merriweather.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
