'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/config';

export default function VerifyEmail() {
  const [status, setStatus] = useState('Verifying...');
  const searchParams = useSearchParams();
  const router = useRouter();

  const verifyEmail = async () => {
    try {
      const token = searchParams.get('token');
      if (!token) {
        setStatus('Invalid verification link');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('Email verified successfully! Redirecting to login...');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        throw new Error(data.details || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus(error instanceof Error ? error.message : 'Verification failed');
    }
  };

  useEffect(() => {
    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Email Verification
          </h2>
          <p className={`text-lg mb-6 ${
            status.includes('success') ? 'text-green-600' : 
            status.includes('failed') || status.includes('expired') ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            {status}
          </p>
          {(status.includes('failed') || status.includes('expired')) && (
            <div className="space-y-4">
              <button
                onClick={() => router.push('/signup')}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
              >
                Sign Up Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 