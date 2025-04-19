import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import HeaderWrapper from "@/components/HeaderWrapper";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";
import { Providers } from '@/store/provider';
import Notification from '@/components/common/Notification';

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
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <AuthProvider>
            <HeaderWrapper />
            <main className="min-h-screen bg-gray-50">
              {children}
            </main>
            <Notification />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
