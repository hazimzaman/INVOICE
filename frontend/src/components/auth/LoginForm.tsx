'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUnverified, setIsUnverified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        toast.success('Logged in successfully');
        router.push('/settings');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to login');
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
    <form onSubmit={handleSubmit} className="space-y-6">
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
      
      <div className="relative">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full h-[55px] px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Logging in...' : 'Login'}
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