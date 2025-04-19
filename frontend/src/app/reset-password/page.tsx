'use client';

import ResetPasswordForm from '@/components/ResetPasswordForm';
import AuthGuard from '@/components/AuthGuard';
import { useSearchParams } from 'next/navigation';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 border border-red-400 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Invalid Reset Link</h1>
          <p className="text-red-600">The password reset link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4">
        <ResetPasswordForm token={token} />
      </div>
    </AuthGuard>
  );
} 