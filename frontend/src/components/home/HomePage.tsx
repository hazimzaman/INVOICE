'use client';

import { useAuth } from "@/contexts/AuthContext";
import Link from 'next/link';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <section className="h-screen   px-4 bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center ">
      <div className="w-full max-w-[1240px] mx-auto grid grid-cols-1  gap-4 sm:grid-cols-2 ">
          <div className="flex flex-col justify-center gap-4">
            <h1 className=" tracking-tight text-3xl font-extrabold text-gray-900 sm:text-4xl md:text-5xl">
              Welcome to
              <span className="block text-blue-600">Invoice Management System</span>
            </h1>
            <p className="text-[14px] text-gray-500 w-[75%]">
              Streamline your invoicing process with our powerful and intuitive invoice management system.
            </p>
            <div className="mt-4 max-w-md w-fit  ">
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
          <div className="flex justify-center items-center">
            <img src="invoice.png" alt="" className="w-full h-full " />
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 hidden">
          <div className="grid grid-cols-1 xs:grid-cols-1 xs2:grid-cols-2 md:grid-cols-3 gap-8">
            <div className="p-6 bg-red-500 xs:bg-blue-500 sm2:bg-green-500 lg2:bg-yellow-500 rounded-lg shadow-md">
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

        {/* Test breakpoints section */}
    </section>
  );
} 