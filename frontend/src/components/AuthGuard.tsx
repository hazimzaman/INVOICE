'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthGuard({ 
  children, 
  requireAuth = false 
}: { 
  children: React.ReactNode;
  requireAuth?: boolean;
}) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && !requireAuth) {
        // If user is logged in and page doesn't require auth (like signup/login pages)
        router.replace('/');
      } else if (!session && requireAuth) {
        // If user is not logged in and page requires auth
        router.replace('/login');
      }
    };

    checkAuth();
  }, [router, requireAuth]);

  return <>{children}</>;
} 