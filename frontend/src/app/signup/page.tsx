'use client';

import SignupForm from '@/components/SignupForm';
import AuthGuard from '@/components/AuthGuard';

export default function SignupPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto px-4">
        <SignupForm />
      </div>
    </AuthGuard>
  );
} 