'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { verifyEmail } from '@/utils/auth';
import { toast } from 'react-hot-toast';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      toast.error('Invalid verification link');
      router.push('/login');
      return;
    }

    const verify = async () => {
      try {
        await verifyEmail(token);
        toast.success('Email verified successfully!', {
          duration: 5000
        });
        router.push('/login');
      } catch (err) {
        toast.error('Failed to verify email');
        router.push('/login');
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [searchParams, router]);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your email...</p>
        </div>
      </div>
    );
  }

  return null;
} 