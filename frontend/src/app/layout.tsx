import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from '@/store/provider';
import RootLayoutClient from "@/components/RootLayoutClient";
import { LoadingProvider } from '@/contexts/LoadingContext';
import { openSans, montserrat } from '@/utils/fonts';
import Footer from '@/components/common/Footer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Invoice App",
  description: "Invoice management application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${openSans.variable} ${montserrat.variable} h-full`}>
      <body className="flex flex-col min-h-screen bg-gray-50">
        <Providers>
          <LoadingProvider>
            <RootLayoutClient geistSans={geistSans} geistMono={geistMono}>
              <div className="flex flex-col min-h-screen">
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
            </RootLayoutClient>
          </LoadingProvider>
        </Providers>
      </body>
    </html>
  );
}
