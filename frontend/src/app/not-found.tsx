'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className=" w-full max-w-[1240px] grid grid-cols-2 gap-6 text-center">
       
        <div className='flex items-center justify-end'>
        <Image
          src="/Group 102.png"
          alt="404 Error"
          width={400}
          height={400}
          className=" mb-8 w-[400px] h-[600px] "
          priority
        />
        </div>
        
        <div className='flex flex-col items-center justify-center'>
        <h1 className="text-9xl font-bold text-gray-900 mb-2 ">
         404
        </h1>
        <div>
        <p className="text-gray-600 ">
        Page Not Found
        </p>
        <p className="text-gray-600 mb-8">
          Something went wrong. The page you're looking for doesn't exist.
        </p>
        </div>

        <Link 
          href="/" 
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
        >
          Go to Home
        </Link>
        </div>

       
      </div>
    </div>
  );
} 