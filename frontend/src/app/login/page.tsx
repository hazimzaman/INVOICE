'use client';

import { useSearchParams } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import AuthGuard from '@/components/AuthGuard';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  return (
    <AuthGuard>
      <div>
        {message && (
          <div className="max-w-md mx-auto mt-4 p-4 bg-blue-100 text-blue-700 rounded-lg">
            {message}
          </div>
        )}
        <LoginForm />
      </div>
    </AuthGuard>
  );
} 