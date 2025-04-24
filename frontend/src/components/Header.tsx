'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";
import { useAppSelector } from '@/store/hooks';
import { Settings } from '@/types/settings';
import { useLoading } from '@/contexts/LoadingContext';
import Image from 'next/image';

export default function Header() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { data: settings } = useAppSelector<{ data: Settings | null }>((state) => state.settings);
  const { setLoading } = useLoading();

  // Get user's name from user metadata
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';

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

  return (
    <header className="bg-white shadow-md w-full">
      <div className="container mx-auto max-w-[1240px] px-4">
        <nav className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 gap-5">
              <Link href="/" className="text-gray-800 hover:text-gray-600 font-semibold">
                <Image 
                  src="/logo.png" 
                  alt="Invoice App Logo" 
                  width={180} 
                  height={50}
                  priority
                />
              </Link>
              
              {user && (
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
                  <Link href="/settings" className="text-gray-800 hover:text-gray-600">
                    Settings
                  </Link>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {!user ? (
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
                <div className="flex items-center space-x-4">
                   <span className="text-sm text-gray-600">
                    {userName}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-red-600 hover:text-white border border-red-600 hover:bg-red-600 rounded-md transition-all duration-200 ease-in-out"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 mr-2" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
} 