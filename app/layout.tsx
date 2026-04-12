import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'calvote',
  description: 'AI-powered meeting scheduling for modern teams',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-right" expand={false} richColors />
      </body>
    </html>
  )
}
\\commment
