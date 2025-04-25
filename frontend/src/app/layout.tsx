import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from '@/store/provider';
import RootLayoutClient from "@/components/RootLayoutClient";
import { LoadingProvider } from '@/contexts/LoadingContext';
import { openSans, montserrat } from '@/utils/fonts';

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
    <html lang="en" className={`${openSans.variable} ${montserrat.variable}`}>
      <Providers>
        <LoadingProvider>
          <RootLayoutClient geistSans={geistSans} geistMono={geistMono}>
            {children}
          </RootLayoutClient>
        </LoadingProvider>
      </Providers>
    </html>
  );
}
