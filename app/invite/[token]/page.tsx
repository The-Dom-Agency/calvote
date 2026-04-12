'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Calendar, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Logo } from '@/components/Logo'

export default function InvitePage() {
  const { token } = useParams<{ token: string }>()
  const [status, setStatus] = useState<'loading' | 'ready' | 'invalid' | 'success'>('loading')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === '1') { setStatus('success'); return }
    if (params.get('error') === 'expired') { setStatus('invalid'); return }

    fetch(`/api/contacts/invite/validate?token=${token}`)
      .then(r => r.json())
      .then(d => setStatus(d.valid ? 'ready' : 'invalid'))
      .catch(() => setStatus('invalid'))
  }, [token])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#1A5C52]" size={32} />
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="text-center max-w-sm">
          <CheckCircle2 className="text-[#1A5C52] mx-auto mb-4" size={48} />
          <h1 className="text-xl font-bold text-[#1C2B3A] mb-2">Calendar connected!</h1>
          <p className="text-sm text-[#6B7280]">Your Google Calendar has been linked successfully. You can close this page.</p>
        </div>
      </div>
    )
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="text-center max-w-sm">
          <XCircle className="text-[#EF4444] mx-auto mb-4" size={48} />
          <h1 className="text-xl font-bold text-[#1C2B3A] mb-2">Invalid or expired link</h1>
          <p className="text-sm text-[#6B7280]">This invite link is no longer valid. Please ask the sender for a new one.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo height={36} />
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-sm text-center">
          <div className="w-14 h-14 bg-[#1A5C52]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Calendar className="text-[#1A5C52]" size={26} />
          </div>
          <h1 className="text-xl font-bold text-[#1C2B3A] mb-2">Connect Your Calendar</h1>
          <p className="text-sm text-[#6B7280] mb-8">
            You&apos;ve been invited to share your Google Calendar availability. Click below to authorize access.
          </p>

          <a
            href={`/api/google-calendar/connect?state=invite:${token}`}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] active:scale-[0.98] transition-all font-semibold text-[#1C2B3A] shadow-sm"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Connect with Google
          </a>

          <p className="text-xs text-[#9CA3AF] mt-5">
            We only read your availability. We never send emails or modify your events.
          </p>
        </div>
      </div>
    </div>
  )
}
