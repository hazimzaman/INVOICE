import { useUser } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { handleLogout } from '@/lib/auth'

export default function Navbar() {
  const user = useUser()
  const router = useRouter()

  const onLogout = async () => {
    try {
      await handleLogout()
      // The handleLogout function will handle the redirect
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              Home
            </Link>
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/settings"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Settings
                </Link>
                {/* Add other navigation links here */}
              </div>
            )}
          </div>
          <div className="flex items-center">
            {user ? (
              <button
                onClick={onLogout}
                className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 