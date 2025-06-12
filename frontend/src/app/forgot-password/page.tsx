'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { getPasswordResetEmailContent } from '@/utils/email';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First verify if user exists in auth.users
      const { count, error: authError } = await supabase
        .from('auth.users')
        .select('*', { count: 'exact', head: true })
        .eq('email', email.toLowerCase());

      if (authError || count === 0) {
        toast.error('This email is not registered with us');
        setLoading(false);
        return;
      }

      // Send reset password email
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase(),
        {
          redirectTo: `${window.location.origin}/update-password`,
          emailRedirectTo: `${window.location.origin}/update-password`,
          data: {
            email_template: getPasswordResetEmailContent(
              `${window.location.origin}/update-password`
            )
          }
        } as any
      );

      if (error) {
        console.error('Reset error:', error);
        throw new Error('Failed to initiate password reset');
      }

      setSent(true);
      toast.success('Reset instructions sent to your email');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {!sent 
              ? "Enter your registered email address" 
              : "Please check your email for reset instructions"}
          </p>
        </div>

        {!sent && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email address"
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center">
                  Verifying
                  <span className="ml-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        )}

        <div className="text-center mt-4">
          <Link 
            href="/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
} 