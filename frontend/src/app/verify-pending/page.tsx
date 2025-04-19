'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

export default function VerifyPendingPage() {
  const router = useRouter();
  const pendingUser = useAppSelector(state => state.verification?.pendingUser);

  useEffect(() => {
    // Add a small delay to prevent immediate redirect
    const timer = setTimeout(() => {
      if (!pendingUser) {
        router.replace('/signup');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pendingUser, router]);

  if (!pendingUser) {
    return null; // or a loading spinner
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-12">
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Check Your Email</h1>
        <p className="text-gray-600 mb-4">
          We've sent a verification link to <strong>{pendingUser.email}</strong>.
          Please check your email and click the verification link to complete your registration.
        </p>
        <p className="text-sm text-gray-500">
          If you don't see the email, check your spam folder.
        </p>
      </div>
    </div>
  );
} 