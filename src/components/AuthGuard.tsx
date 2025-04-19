import { useUser } from '@supabase/auth-helpers-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

// Define protected paths instead of public paths
const protectedPaths = [
  '/settings',
  '/invoices',
  '/clients',
  '/reports',
  '/dashboard'
]

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useUser()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Only redirect if trying to access protected routes
    if (!user && protectedPaths.includes(pathname)) {
      router.push('/login')
    }
  }, [user, pathname, router])

  // Only block protected routes when not authenticated
  if (!user && protectedPaths.includes(pathname)) {
    return null
  }

  return <>{children}</>
} 