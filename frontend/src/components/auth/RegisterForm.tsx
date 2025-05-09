'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate verification token
      const verificationToken = crypto.randomUUID();
      
      // First, store password temporarily
      const { data: passwordData, error: passwordError } = await supabase
        .from('temp_passwords')
        .insert([{ password: formData.password }])
        .select('id')
        .single();

      if (passwordError) throw passwordError;

      // Then create unverified user
      const { error: userError } = await supabase
        .from('unverified_users')
        .insert([{
          email: formData.email,
          name: formData.name,
          password_id: passwordData.id,
          verification_token: verificationToken
        }]);

      if (userError) throw userError;

      // Send verification email through backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/send-verification-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          token: verificationToken
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send verification email');
      }

      toast.success('Registration successful! Please check your email to verify your account.');
      router.push('/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="w-full h-[42px] px-3 border border-gray-300 rounded-md"
            required
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
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>

      <div className="text-center mt-4">
        <Link href="/login" className="text-blue-600 hover:text-blue-800">
          Already have an account? Login
        </Link>
      </div>
    </form>
  );
} 