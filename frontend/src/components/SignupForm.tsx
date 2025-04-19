'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

const SignupForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      
      if (accessToken && refreshToken) {
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
      }
    }
  }, []);

  const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('Starting signup process...');
      
      // Generate verification token
      const verificationToken = generateVerificationToken();
      console.log('Generated token:', verificationToken);

      // First, check if email exists in unverified_users
      const { data: existingUser, error: checkError } = await supabase
        .from('unverified_users')
        .select('*')
        .eq('email', formData.email)
        .maybeSingle();

      console.log('Check existing user result:', { existingUser, checkError });

      if (existingUser) {
        throw new Error('Email already registered. Please check your email for verification link.');
      }

      const newUserData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        verification_token: verificationToken,
        verified: false
      };

      console.log('Attempting to insert:', newUserData);

      // Insert into unverified_users table
      const { data, error: insertError } = await supabase
        .from('unverified_users')
        .insert(newUserData)
        .select();

      console.log('Insert response:', { data, insertError });

      if (insertError) {
        console.error('Insert error details:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        });
        throw new Error(`Failed to create account: ${insertError.message || 'Unknown error'}`);
      }

      // Send verification email using our backend API
      const response = await fetch('http://localhost:5000/api/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          verificationToken: verificationToken
        }),
      });

      if (!response.ok) {
        // Cleanup: remove the unverified user if email fails
        const { error: deleteError } = await supabase
          .from('unverified_users')
          .delete()
          .eq('email', formData.email);

        console.log('Cleanup after email error:', { deleteError });
        
        throw new Error('Failed to send verification email. Please try again.');
      }

      setSuccess('Please check your email for verification link.');
      
      // Clear form
      setFormData({
        name: '',
        email: '',
        password: '',
      });

      // Redirect to verification pending page
      setTimeout(() => {
        router.push('/verify-pending');
      }, 3000);

    } catch (error) {
      console.error('Signup error:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
          Name
        </label>
        <input
          type="text"
          id="name"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
          Email
        </label>
        <input
          type="email"
          id="email"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
          Password
        </label>
        <input
          type="password"
          id="password"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
        disabled={loading}
      >
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  );
};

export default SignupForm; 