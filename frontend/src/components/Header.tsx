'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";
import { useAppSelector } from '@/store/hooks';
import { Settings } from '@/types/settings';
import { useLoading } from '@/contexts/LoadingContext';
import Image from 'next/image';
import { FiMenu, FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import { useState } from 'react';


export default function Header() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { data: settings } = useAppSelector<{ data: Settings | null }>((state) => state.settings);
  const { setLoading } = useLoading();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Get user's name from user metadata
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';

  // Add this check to hide user section on password reset pages
  const pathname = usePathname();
  const isPasswordResetPage = pathname?.includes('reset-password') || pathname?.includes('update-password');

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNavigation = (path: string) => {
    setLoading(true);
    router.push(path);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="bg-white shadow-md w-full">
      <div className="container mx-auto max-w-[1240px] px-4">
        <nav className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 gap-5">
              <Link href="/" className="text-gray-800 hover:text-gray-600 font-semibold">
                <Image 
                  src="/logo.png" 
                  alt="Logo" 
                  width={180} 
                  height={50}
                  className="w-auto h-auto"
                />
              </Link>
              
              {/* Only show nav links if user is logged in and not on password reset pages */}
              {user && !isPasswordResetPage && (
                <div className="hidden md:flex items-center space-x-4">
                  <Link href="/invoices" className="text-gray-800 hover:text-gray-600">
                    Invoices
                  </Link>
                  <Link href="/clients" className="text-gray-800 hover:text-gray-600">
                    Clients
                  </Link>
                  <Link href="/reports" className="text-gray-800 hover:text-gray-600">
                    Reports
                  </Link>
                </div>
              )}
            </div>
            
            {/* Show login/signup on password reset pages */}
            <div className="flex items-center space-x-4">
              {isPasswordResetPage ? (
                <>
                  <Link 
                    href="/login"
                    className="text-gray-800 hover:text-gray-600"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/signup"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <div className="relative">
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none cursor-pointer"
                  >
                    <FiUser className="w-5 h-5" />
                    <span className="hidden sm:inline">{userName}</span>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-58 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 ">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                        {user.email}
                      </div>
                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FiSettings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className=" w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FiLogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </header>
  );
} 