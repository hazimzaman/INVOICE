'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type VerificationStatus = 'verifying' | 'success' | 'error';

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        if (!token) {
          throw new Error('No verification token provided');
        }

        const response = await fetch('http://localhost:5001/api/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || data.details || 'Failed to verify email');
        }

        // Sign in the user
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.user.email,
          password: data.user.password
        });

        if (signInError) {
          throw new Error('Failed to sign in after verification');
        }

        setStatus('success');

        // Start countdown
        let count = 3;
        const countdownInterval = setInterval(() => {
          count -= 1;
          setCountdown(count);
          if (count === 0) {
            clearInterval(countdownInterval);
            router.push('/');
          }
        }, 1000);

      } catch (error) {
        console.error('Verification error:', error);
        setError(error instanceof Error ? error.message : 'Failed to verify email');
        setStatus('error');
      }
    };

    verifyEmail();
  }, [router, searchParams]);

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white shadow-lg rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Verifying Your Email
          </h2>
          <p className="text-gray-600 text-center">
            Please wait while we verify your email address...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white shadow-lg rounded-lg">
          <div className="text-red-500 mx-auto mb-4 w-16 h-16">
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-center text-red-600 mb-2">
            Verification Failed
          </h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={() => router.push('/signup')}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Back to Sign Up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white shadow-lg rounded-lg">
        <div className="text-green-500 mx-auto mb-4 w-16 h-16">
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-center text-green-600 mb-2">
          Email Verified Successfully!
        </h2>
        <p className="text-gray-600 text-center mb-4">
          Your email has been verified and your account is now active.
        </p>
        <div className="text-sm text-gray-500 text-center">
          Redirecting to home page in {countdown} seconds...
        </div>
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Go to Home Page
          </button>
        </div>
      </div>
    </div>
  );
} 