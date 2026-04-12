'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/Logo'

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col items-center mb-8">
          <Logo className="mb-4" />
          <h1 className="text-2xl font-bold text-[#1C2B3A]">Welcome Back</h1>
          <p className="text-[#6B7280] text-sm mt-1">Sign in to your calvote account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1C2B3A]">Email Address</label>
            <input
              type="email"
              placeholder="admin@calvote.ai"
              defaultValue="admin@calvote.ai"
              className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#1A5C52]/20 focus:border-[#1A5C52] transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#1C2B3A]">Password</label>
              <a href="#" className="text-xs text-[#1A5C52] hover:underline">Forgot password?</a>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              defaultValue="password123"
              className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#1A5C52]/20 focus:border-[#1A5C52] transition-all"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#1A5C52] text-white font-semibold py-3 rounded-lg hover:bg-[#1A5C52]/90 transition-colors shadow-sm"
          >
            Login
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-[#6B7280]">
            Default credentials for testing:<br />
            <span className="font-mono text-[#1A5C52]">admin@calvote.ai / password123</span>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-[#E5E7EB] text-center">
          <p className="text-sm text-[#6B7280]">
            Don&apos;t have an account?{' '}
            <a href="#" className="text-[#1A5C52] font-semibold hover:underline">Request access</a>
          </p>
        </div>
      </div>
    </div>
  )
}
