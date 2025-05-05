'use client';

import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import SignupForm from '@/components/SignupForm';
import AuthGuard from '@/components/AuthGuard';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <AuthGuard>
     <section className='flex flex-col items-center justify-center h-screen'>
     <div className="container mx-auto px-4">
        <SignupForm />
      </div>
     </section>
    </AuthGuard>
  );
} 