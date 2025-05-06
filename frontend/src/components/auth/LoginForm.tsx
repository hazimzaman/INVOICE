'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUnverified, setIsUnverified] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // First check if user exists and is verified
      const { data: users } = await supabase
        .from('users')
        .select('verified')
        .eq('email', email)
        .single();

      if (users && !users.verified) {
        setIsUnverified(true);
        toast.error('Please verify your email before logging in');
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          const { data: existingUser } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .single();

          if (existingUser) {
            toast.error('Invalid password');
          } else {
            toast.error('Email is not registered');
          }
        } else {
          toast.error(error.message);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      // Generate new verification token
      const token = Math.random().toString(36).substring(2);
      
      const { error } = await supabase
        .from('users')
        .update({ verification_token: token })
        .eq('email', email);

      if (error) throw error;

      // Send verification email
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/verify?token=${token}`,
      });

      toast.success('Verification email sent! Please check your inbox.');
    } catch (error) {
      console.error('Error resending verification:', error);
      toast.error('Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
      >
        {loading ? 'Loading...' : 'Login'}
      </button>

      {isUnverified && (
        <div className="text-center mt-4">
          <p className="text-red-600 mb-2">Your email is not verified.</p>
          <button
            type="button"
            onClick={handleResendVerification}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Resend verification email
          </button>
        </div>
      )}

      <div className="text-center mt-4">
        <Link href="/register" className="text-blue-600 hover:text-blue-800">
          Don't have an account? Register
        </Link>
      </div>
    </form>
  );
} 