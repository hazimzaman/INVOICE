'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function VerifyEmail() {
  const [status, setStatus] = useState('Verifying...');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        console.log('Received token:', token);
        
        if (!token) {
          setStatus('Invalid verification link - No token found');
          return;
        }

        // Get stored password
        const password = localStorage.getItem(`temp_password_${token}`);
        console.log('Retrieved password exists:', !!password);

        if (!password) {
          throw new Error('Password not found in local storage. Token: ' + token);
        }

        console.log('Making verification request with token:', token);

        const response = await fetch('http://localhost:5001/api/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, password }),
        });

        const data = await response.json();
        console.log('Verification response:', data);

        if (response.ok && data.success) {
          localStorage.removeItem(`temp_password_${token}`);
          setStatus('Email verified successfully! Redirecting to login...');
          setTimeout(() => router.push('/login'), 2000);
        } else {
          throw new Error(data.details || `Verification failed: ${data.error}`);
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus(error instanceof Error ? error.message : 'Verification failed. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Email Verification
          </h2>
          <p className={`text-lg ${
            status.includes('success') ? 'text-green-600' : 
            status.includes('failed') ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            {status}
          </p>
        </div>
      </div>
    </div>
  );
} 