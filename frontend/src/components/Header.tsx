'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";
import { useAppSelector } from '@/store/hooks';
import { Settings } from '@/types/settings';
import { useLoading } from '@/contexts/LoadingContext';
import Image from 'next/image';
import { FiMenu, FiUser, FiSettings, FiLogOut, FiX, FiMoreVertical } from 'react-icons/fi';
import { useState, useEffect, useRef } from 'react';
import { FaPowerOff } from "react-icons/fa6";
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

export default function Header() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { data: settings } = useAppSelector<{ data: Settings | null }>((state) => state.settings);
  const { setLoading } = useLoading();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get user's name from user metadata
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';

  // Add this check to hide user section on password reset pages
  const pathname = usePathname();
  const isPasswordResetPage = pathname?.includes('reset-password') || pathname?.includes('update-password');

  // Handle clicks outside of dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };

  const handleNavigation = (path: string) => {
    setLoading(true);
    router.push(path);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY) { // scrolling down
        setIsVisible(false);
      } else { // scrolling up
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY]);

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 z-[90]
          ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
        `}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sidebar */}
      <div 
        className={`
          fixed top-0 left-0 h-screen w-60 bg-white shadow-lg z-[100]
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full bg-white p-4">
          {/* Close Button */}
          <div className="flex justify-between items-center mb-8">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={120} 
              height={35}
              className="w-auto min-w-[120px] sm:min-w-[160px]  h-auto"
            />
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Navigation Links */}
          <div className="flex flex-col space-y-4">
          <Link 
              href="/reports" 
              className="text-blue-600 hover:text-blue-700 font-semibold py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            
            <Link 
              href="/clients" 
              className="text-blue-600 hover:text-blue-700 font-semibold py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Clients
            </Link>
            <Link 
              href="/invoices" 
              className="text-blue-600 hover:text-blue-700 font-semibold py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Invoices
            </Link>
           
          </div>
        </div>
      </div>

      {/* Backdrop overlay with blur when dropdown is open */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}

      {/* Header */}
      <header className={`fixed w-full bg-white shadow-md transition-transform duration-300 z-50 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="container mx-auto max-w-[1240px] px-4">
          <nav className="py-4">
            <div className="flex items-center gap-4 justify-between">
              <div className="w-full flex items-center space-x-4 gap-5 justify-between md:justify-start md:w-auto">
                <Link href="/" className="text-gray-800 hover:text-gray-600 font-semibold m-0">
                  <Image 
                    src="/logo.png" 
                    alt="Logo" 
                    width={180} 
                    height={50}
                    className="min-w-[120px] sm:min-w-[180px] w-full sm:min-h-[50px]  h-full"
                  />
                </Link>

                {/* Desktop Navigation - Now shows in logo div on md screens */}
                {user && !isPasswordResetPage && (
                  <nav className="hidden md:flex items-center space-x-4">
                   <Link href="/reports" className="text-gray-800 hover:text-gray-600 relative
             before:content-[''] before:absolute before:bottom-[-1] before:left-0
             before:h-[2px] before:bg-blue-600 before:w-0
             before:transition-all before:duration-300 before:ease-in-out
             hover:before:w-full">
                      Dashboard
                    </Link>
                    <Link href="/clients" className="text-gray-800 hover:text-gray-600 relative
             before:content-[''] before:absolute before:bottom-[-1] before:left-0
             before:h-[2px] before:bg-blue-600 before:w-0
             before:transition-all before:duration-300 before:ease-in-out
             hover:before:w-full">
                      Clients
                    </Link>
                   <Link
  href="/invoices"
  className="text-gray-800 hover:text-gray-600 relative
             before:content-[''] before:absolute before:bottom-[-1] before:left-0
             before:h-[2px] before:bg-blue-600 before:w-0
             before:transition-all before:duration-300 before:ease-in-out
             hover:before:w-full"
>
  Invoices
</Link>

                    
                   
                  </nav>
                )}
                
                {/* Mobile Menu Button */}
                {user && !isPasswordResetPage && (
                  <div className="flex items-center m-0 md:hidden">
                    <button
                      onClick={() => setIsMobileMenuOpen(true)}
                      className=""
                    >
                      <FiMenu className="w-6 h-6" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Auth buttons section */}
              <div className="flex items-center flex-row gap-4 space-x-4 w-auto">
                {!user ? (
                  <>
                    {/* Desktop Auth Buttons */}
                    <div className="hidden sm:flex items-center gap-4">
                      <Link 
                        href="/login"
                        className="text-gray-800 hover:text-gray-600"
                      >
                        Login
                      </Link>
                      <Link 
                        href="/signup"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors m-0 min-w-24"
                      >
                        Sign Up
                      </Link>
                    </div>

                    {/* Mobile Auth Menu */}
                    <div className="sm:hidden relative">
                      <button 
                        onClick={() => setIsAuthDropdownOpen(!isAuthDropdownOpen)}
                        className="p-2 hover:bg-gray-100 rounded-full"
                      >
                        <FiMoreVertical className="w-5 h-5 text-gray-500" />
                      </button>

                      {isAuthDropdownOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-30"
                            onClick={() => setIsAuthDropdownOpen(false)}
                          />
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-40 border border-gray-200">
                            <div className="py-1">
                              <Link
                                href="/login"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                                onClick={() => setIsAuthDropdownOpen(false)}
                              >
                                Login
                              </Link>
                              <Link
                                href="/signup"
                                className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 w-full"
                                onClick={() => setIsAuthDropdownOpen(false)}
                              >
                                Sign Up
                              </Link>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={toggleDropdown}
                      className="flex w-auto items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none cursor-pointer"
                    >
                      <FiUser className="w-5 h-5 m-0" />
                      <span className="hidden w-auto md:inline">{userName}</span>
                    </button>

                    {/* Dropdown Menu with higher z-index */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                        <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                          {user?.email}
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
                          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
      </header>
    </>
  );
} 