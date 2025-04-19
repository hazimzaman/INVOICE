import Navbar from '@/components/Navbar'
import AuthGuard from '@/components/AuthGuard'
import EnvCheck from '@/components/EnvCheck'
import { Providers } from '@/store/provider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <EnvCheck />
          <AuthGuard>
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
          </AuthGuard>
        </Providers>
      </body>
    </html>
  )
} 