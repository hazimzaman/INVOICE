'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <Image
          src="/Error.png"
          alt="404 Error"
          width={400}
          height={400}
          className="mx-auto mb-8"
          priority
        />
        
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Page Not Found
        </h1>
        
        <p className="text-gray-600 mb-8">
          Something went wrong. The page you're looking for doesn't exist.
        </p>

        <Link 
          href="/dashboard" 
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
} 