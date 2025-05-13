'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <section className="min-h-screen pt-[85px] pb-[100px] flex flex-col items-center justify-center px-4">
      <div className=" w-full  max-w-[1240px] grid grid-cols-1 gap-6 text-center md:grid-cols-2">
       
        <div className='flex items-center justify-center m-0 md:justify-end'>
        <Image
          src="/Group 102.png"
          alt="404 Error"
          width={400}
          height={400}
          className=" mb-8 w-[200px] h-[310px] !mb-0  md:w-[400px] md:h-[580px]"
          priority
        />
        </div>
        
        <div className='flex flex-col items-center justify-center'>
        <h1 className="text-6xl font-bold text-gray-900  md:text-8xl ">
         404
        </h1>
        <div>
        <p className="text-gray-600  ">
        Page Not Found
        </p>
        <div className='w-full flex items-center justify-center'>
        <p className="text-gray-600 text-center w-full mb-8 md:w-[70%] ">
          Something went wrong. The page you're looking for doesn't exist.
        </p>
        </div>
        </div>

        <Link 
          href="/" 
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
        >
          Go to Home
        </Link>
        </div>

       
      </div>
    </section>
  );
} 