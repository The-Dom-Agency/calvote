'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, PLAN_LABELS, type Plan } from '@/contexts/AuthContext'
import { Logo } from '@/components/Logo'
import { toast } from 'sonner'
import { Tag, CheckCircle2, LogOut } from 'lucide-react'

const PLAN_BADGE_COLORS: Record<Plan, string> = {
  free: 'bg-gray-100 text-gray-600',
  starter: 'bg-blue-50 text-blue-700',
  growth: 'bg-purple-50 text-purple-700',
  scale: 'bg-[#1A5C52]/10 text-[#1A5C52]',
}

export default function ActivatePage() {
  const { user, userData, refreshUserData, logout } = useAuth()
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [activated, setActivated] = useState(false)
  const [activatedPlan, setActivatedPlan] = useState<Plan | null>(null)

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !code.trim()) return
    setLoading(true)

    try {
      const res = await fetch('/api/promo/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), uid: user.uid }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        toast.error(data.error || 'Something went wrong. Please try again.')
        return
      }

      await refreshUserData()
      setActivatedPlan(data.plan as Plan)
      setActivated(true)
      toast.success('Promo code activated!')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (activated && activatedPlan) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-[#1A5C52]/10 text-[#1A5C52] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-2xl font-bold text-[#1C2B3A] mb-2">You&apos;re all set!</h1>
          <p className="text-[#6B7280] mb-4">Your plan has been activated.</p>
          <span className={`inline-block text-sm font-bold px-4 py-1.5 rounded-full mb-8 ${PLAN_BADGE_COLORS[activatedPlan]}`}>
            {PLAN_LABELS[activatedPlan]}
          </span>
          <br />
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-[#1A5C52] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#1A5C52]/90 transition-all shadow-lg shadow-[#1A5C52]/20"
          >
            Go to Dashboard →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#1A5C52]/10 rounded-xl flex items-center justify-center">
              <Tag size={20} className="text-[#1A5C52]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1C2B3A]">Activate Your Account</h1>
              <p className="text-xs text-[#6B7280]">Signed in as {user?.email}</p>
            </div>
          </div>

          {/* Plan options info */}
          <div className="bg-[#F9FAFB] rounded-xl p-4 mb-6 space-y-2">
            <p className="text-xs font-bold text-[#1A5C52] uppercase tracking-wider mb-3">Available Plans</p>
            {[
              { plan: 'starter', label: 'Starter', meetings: '0–500 meetings/mo', price: '$500/mo' },
              { plan: 'growth', label: 'Growth', meetings: '500–1,000 meetings/mo', price: '$800/mo' },
              { plan: 'scale', label: 'Scale', meetings: '1,000–2,000 meetings/mo', price: '$2,500/mo' },
            ].map(p => (
              <div key={p.plan} className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1C2B3A]">{p.label} <span className="text-[#6B7280] font-normal">— {p.meetings}</span></span>
                <span className="font-bold text-[#1A5C52]">{p.price}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleRedeem} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1C2B3A]">Promo Code</label>
              <input
                type="text"
                placeholder="e.g. CV-XXXX-XXXX"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                required
                className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#1A5C52]/20 focus:border-[#1A5C52] transition-all font-mono text-sm tracking-widest"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full bg-[#1A5C52] text-white font-bold py-3 rounded-xl hover:bg-[#1A5C52]/90 transition-all shadow-lg shadow-[#1A5C52]/20 disabled:opacity-50"
            >
              {loading ? 'Validating...' : 'Activate Account'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E5E7EB] text-center">
            <p className="text-xs text-[#6B7280] mb-3">
              Need a promo code? Contact{' '}
              <a href="mailto:design@thedomagency.com" className="text-[#1A5C52] font-semibold hover:underline">
                design@thedomagency.com
              </a>
            </p>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#1C2B3A] mx-auto transition-colors"
            >
              <LogOut size={12} />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
