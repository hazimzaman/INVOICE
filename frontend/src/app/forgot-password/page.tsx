'use client';

import ForgotPasswordForm from '@/components/ForgotPasswordForm';
import AuthGuard from '@/components/AuthGuard';

export default function ForgotPasswordPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto px-4">
        <ForgotPasswordForm />
      </div>
    </AuthGuard>
  );
} 