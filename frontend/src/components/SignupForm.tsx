'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';

// Function to generate a random token
function generateToken(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Function to generate UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const verificationToken = generateToken();
      console.log('Generated token:', verificationToken);
      const passwordUUID = generateUUID(); // Generate UUID for password

      // First, check if email exists
      const { data: existingUser } = await supabase
        .from('unverified_users')
        .select('*')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw new Error('Email already registered');
      }

      // Save to unverified_users with password_uuid
      const { data: insertedUser, error: userError } = await supabase
        .from('unverified_users')
        .insert({
          email,
          name,
          password_uuid: passwordUUID,
          verification_token: verificationToken,
          verified: false
        })
        .select()
        .single();

      console.log('Inserted user:', {
        success: !userError,
        userData: insertedUser,
        error: userError
      });

      // Store the actual password temporarily in localStorage for verification
      localStorage.setItem(`temp_password_${verificationToken}`, password);
      console.log('Stored password for token:', verificationToken);

      if (userError) {
        console.error('User creation error:', userError);
        throw new Error(userError.message);
      }

      // Send verification email
      const response = await fetch('http://localhost:5001/api/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          verificationToken
        }),
      });

      if (!response.ok) {
        // Cleanup if email sending fails
        await supabase
          .from('unverified_users')
          .delete()
          .eq('email', email);
        
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to send verification email');
      }

      // Clear form and show success
      setEmail('');
      setName('');
      setPassword('');
      alert('Please check your email to verify your account');
      router.push('/verify-pending');

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

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
          Name
        </label>
        <input
          type="text"
          id="name"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="relative mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
          Password
        </label>
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          name="password"
          required
          className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
          style={{ top: '24px' }} // Adjust for label
        >
          {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
        </button>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors mt-4"
        disabled={loading}
      >
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  );
} 