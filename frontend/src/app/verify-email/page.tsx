'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          throw new Error('Invalid verification link');
        }

        // Get user data from unverified_users
        const { data: userData, error: fetchError } = await supabase
          .from('unverified_users')
          .select('*')
          .eq('verification_token', token)
          .eq('verified', false)
          .single();

        if (fetchError || !userData) {
          console.error('Fetch error:', fetchError);
          throw new Error('Invalid or expired verification token');
        }

        // Create verified user in Supabase Auth
        const { data: authData, error: signupError } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              name: userData.name
            }
          }
        });

        if (signupError) {
          console.error('Auth error:', signupError);
          throw new Error('Failed to create user account');
        }

        // Update unverified_users record
        const { error: updateError } = await supabase
          .from('unverified_users')
          .update({ verified: true })
          .eq('verification_token', token)
          .select()
          .single();

        if (updateError) {
          console.error('Update error:', updateError);
          throw new Error('Failed to verify email');
        }

        // Redirect to login
        router.replace('/login?message=Email verified successfully. Please login.');

      } catch (error) {
        console.error('Verification error:', error);
        setError(error instanceof Error ? error.message : 'Verification failed');
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  if (verifying) {
    return (
      <div className="container mx-auto max-w-md px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Verifying your email...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-md px-4 py-12">
        <div className="bg-red-50 border border-red-400 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Verification Failed</h1>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push('/signup')}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Back to Sign Up
          </button>
        </div>
      </div>
    );
  }

  return null;
} 