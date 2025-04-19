'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  isLoggedIn: boolean;
  onLogout?: () => void;
}

const Header = ({ isLoggedIn, onLogout }: HeaderProps) => {
  return (
    <header className="bg-white shadow-md w-full">
      <div className="container mx-auto max-w-[1240px] px-4">
        <nav className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-800 hover:text-gray-600 font-semibold text-xl">
                InvoiceApp
              </Link>
              
              {isLoggedIn && (
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
              {!isLoggedIn ? (
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
                <button
                  onClick={onLogout}
                  className="text-gray-800 hover:text-gray-600"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header; 