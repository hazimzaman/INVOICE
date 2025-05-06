'use client';

import { useState, FormEvent } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import SignupForm from '@/components/SignupForm';
import AuthGuard from '@/components/AuthGuard';
import { supabase } from '@/lib/supabase';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async (email: string, name: string, password: string) => {
    try {
      const verificationToken = crypto.randomUUID();

      // Save to unverified_users
      const { error: userError } = await supabase
        .from('unverified_users')
        .insert({
          email,
          name,
          password,
          verification_token: verificationToken,
          verified: false
        });

      if (userError) throw userError;

      // Send verification email
      const response = await fetch('http://localhost:5000/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, verificationToken }),
      });

      if (!response.ok) throw new Error('Failed to send verification email');

      alert('Please check your email to verify your account');
    } catch (error) {
      console.error('Signup error:', error);
      alert('Failed to create account');
    }
  };

  return (
    <AuthGuard>
      <section className='flex flex-col items-center justify-center h-screen'>
        <div className="container mx-auto px-4">
          <SignupForm onSubmit={handleSignUp} />
        </div>
      </section>
    </AuthGuard>
  );
} 