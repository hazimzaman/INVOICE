'use client';

import AuthGuard from '@/components/AuthGuard';
import SignupForm from '@/components/SignupForm';

export default function SignupPage() {
  return (
    <AuthGuard>
      <section className="flex flex-col items-center justify-center h-screen">
        <div className="container mx-auto px-4">
          <SignupForm />
        </div>
      </section>
    </AuthGuard>
  );
} 