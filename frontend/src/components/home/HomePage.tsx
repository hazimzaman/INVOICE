'use client';

import { useAuth } from "@/contexts/AuthContext";
import Link from 'next/link';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className=" grid grid-cols-2 gap-14">
        <div>
          <img src="invoice.png" alt="" />
        </div>
        <div className=" flex flex-col justify-center ">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Welcome to</span>
            <span className="block text-blue-600">Invoice Management System</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Streamline your invoicing process with our powerful and intuitive invoice management system.
          </p>
          <div className=" max-w-md w-fit sm:flex sm:justify-center md:mt-8">
            {!user ? (
              <>
                <div className="rounded-md shadow">
                  <Link
                    href="/login"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                  >
                    Get Started
                  </Link>
                </div>
                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                  <Link
                    href="/signup"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                  >
                    Sign Up
                  </Link>
                </div>
              </>
            ) : (
              <div className="rounded-md shadow">
                <Link
                  href="/dashboard"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                >
                  Go to Dashboard
                </Link>
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-900">Easy Invoicing</h3>
              <p className="mt-2 text-gray-500">
                Create and manage professional invoices with just a few clicks.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-900">Client Management</h3>
              <p className="mt-2 text-gray-500">
                Keep track of your clients and their information in one place.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-900">Payment Tracking</h3>
              <p className="mt-2 text-gray-500">
                Monitor payment status and send reminders automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 