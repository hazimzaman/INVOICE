'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { fetchSettings } from '@/store/slices/settingsSlice';
import HeaderWrapper from "@/components/HeaderWrapper";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from 'react-hot-toast';
import Notification from '@/components/common/Notification';

export default function RootLayoutClient({
  children,
  geistSans,
  geistMono,
}: {
  children: React.ReactNode;
  geistSans: any;
  geistMono: any;
}) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  return (
    <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <AuthProvider>
        <HeaderWrapper />
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
        <Notification />
      </AuthProvider>
      <Toaster position="top-right" />
    </body>
  );
} 