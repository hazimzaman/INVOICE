'use client';

import AuthGuard from '@/components/AuthGuard';
import Image from 'next/image';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <AuthGuard requireAuth>
      <div className="container mx-auto px-4 py-8 h-[100vh] flex max-w-[1240px] w-full">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          {/* Left Column - Image */}
          <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl bg-gray-100 flex items-center justify-center">
            <svg 
              className="w-64 h-64 text-gray-400"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
          </div>

          {/* Right Column - Content */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-gray-900">
              Welcome to Your Invoice Dashboard
            </h1>
            
            <p className="text-xl text-gray-600">
              Create, manage, and track your invoices all in one place. 
              Get started by creating your first invoice.
            </p>

            <div className="space-y-4">
              <Link
                href="/"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                About Us
              </Link>

             
            </div>

            {/* Quick Stats */}
            
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
