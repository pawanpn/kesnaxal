import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import Providers from "@/components/Providers";
import LocaleProvider from "@/context/LocaleContext";
import AdminProvider from "@/context/AdminContext";
import AdminToolbar from "@/components/admin/AdminToolbar";
import EditModeBanner from "@/components/admin/EditModeBanner";
import ToastContainer from "@/components/admin/Toast";
import { ToastProvider } from "@/context/ToastContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EmergencyPopup from "@/components/sections/EmergencyPopup";
import { getSiteMetadata } from "@/lib/supabase/content";
import "./globals.css";

export const dynamic = "force-dynamic";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { schoolName, motto, description, logoUrl } = await getSiteMetadata();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kes.edu.np";
  const ogImage = logoUrl.startsWith("http") ? logoUrl : `${siteUrl}${logoUrl}`;

  return {
    title: {
      default: `${schoolName} | ${motto}`,
      template: `%s | ${schoolName}`,
    },
    description,
    keywords: [schoolName, "KES", "education", "Nepal", "school"],
    verification: { google: "googlef387d18f57e91ec0" },
    openGraph: {
      title: `${schoolName} | ${motto}`,
      description,
      siteName: schoolName,
      type: "website",
      locale: "en_US",
      images: [{ url: ogImage, width: 1200, height: 630, alt: schoolName }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${schoolName} | ${motto}`,
      description,
      images: [ogImage],
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${merriweather.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <LocaleProvider>
            <AdminProvider>
            <ToastProvider>
              <EditModeBanner />
              <Navbar />
              <EmergencyPopup />
              <main className="flex-1">{children}</main>
              <Footer />
              <AdminToolbar />
              <ToastContainer />
            </ToastProvider>
            </AdminProvider>
          </LocaleProvider>
        </Providers>
      </body>
    </html>
  );
}