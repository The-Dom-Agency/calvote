'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2,
  Calendar,
  Clock,
  Users,
  Home,
  MessageCircle,
  Smartphone,
  Tag,
} from 'lucide-react'
import { useAuth, PLAN_LIMITS } from '@/contexts/AuthContext'
import { toast } from 'sonner'

type MeetingDraft = {
  title: string
  description: string
  timeFrom: string
  timeTo: string
  attendees: { id: string; name: string; email: string }[]
  dates: string[]
  primaryPersonName: string
}

function fmt12(t: string) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

export default function MeetingConfirmedPage() {
  const router = useRouter()
  const { user, userData, refreshUserData } = useAuth()
  const [draft, setDraft] = useState<MeetingDraft | null>(null)
  const [promoCode, setPromoCode] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoActivated, setPromoActivated] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('meetingDraft')
    if (raw) setDraft(JSON.parse(raw))
  }, [])

  const handlePromoRedeem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !promoCode.trim()) return
    setPromoLoading(true)
    try {
      const res = await fetch('/api/promo/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim(), uid: user.uid }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        toast.error(data.error || 'Invalid promo code.')
        return
      }
      await refreshUserData()
      setPromoActivated(true)
      toast.success('Promo code activated!')
    } catch {
      toast.error('Something went wrong.')
    } finally {
      setPromoLoading(false)
    }
  }

  const timeRange = draft ? `${fmt12(draft.timeFrom)} – ${fmt12(draft.timeTo)}` : ''
  const firstDate = draft?.dates?.[0] ?? ''

  return (
    <div className="max-w-3xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden text-center p-8 sm:p-12">
        <div className="w-20 h-20 bg-[#1A5C52]/10 text-[#1A5C52] rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 size={44} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-[#1C2B3A] mb-2">Meeting Request Sent!</h1>
        <p className="text-[#6B7280] mb-8 text-sm">
          {draft?.attendees?.length
            ? `Invites sent to ${draft.attendees.length} attendee${draft.attendees.length > 1 ? 's' : ''}. Waiting for availability responses.`
            : 'Your meeting request has been sent.'}
        </p>

        {draft && (
          <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 mb-10 max-w-lg mx-auto text-left space-y-5">
            <h2 className="text-lg font-bold text-[#1C2B3A] text-center">{draft.title}</h2>

            <div className="space-y-3">
              {firstDate && (
                <div className="flex items-center gap-3 text-sm font-semibold text-[#1A5C52]">
                  <Calendar size={17} />
                  {draft.dates.length} date{draft.dates.length > 1 ? 's' : ''} in window
                </div>
              )}
              <div className="flex items-center gap-3 text-sm font-semibold text-[#1A5C52]">
                <Clock size={17} />
                {timeRange}
              </div>
            </div>

            {draft.attendees.length > 0 && (
              <div className="pt-4 border-t border-[#E5E7EB]">
                <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Users size={13} /> Attendees
                </p>
                <div className="flex items-center flex-wrap gap-3">
                  {draft.attendees.map(a => (
                    <div key={a.id} className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-[#1A5C52] text-white flex items-center justify-center font-bold text-xs border-2 border-white shadow-sm">
                        {a.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-[10px] font-medium text-[#1C2B3A]">{a.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SMS preview */}
        {draft && (
          <div className="pt-8 border-t border-[#E5E7EB] mb-10">
            <h3 className="text-xs font-bold text-[#1A5C52] uppercase tracking-wider mb-6 flex items-center justify-center gap-2">
              <Smartphone size={15} /> Confirmation Message Preview
            </h3>
            <div className="max-w-[280px] mx-auto p-5 bg-[#F3F4F6] rounded-[36px] border-[5px] border-[#E5E7EB] shadow-lg">
              <div className="w-1/3 h-1 bg-[#E5E7EB] rounded-full mx-auto mb-4" />
              <div className="bg-[#1A5C52] text-white p-3 rounded-2xl rounded-tr-none text-[10px] text-left leading-relaxed shadow-sm">
                <p className="font-bold mb-1 flex items-center gap-1">
                  <MessageCircle size={10} /> calvote
                </p>
                You&apos;ve been invited to <strong>{draft.title}</strong>. Please share your availability so we can find the best time.
              </div>
              <div className="w-1/2 h-1 bg-[#E5E7EB] rounded-full mx-auto mt-5" />
            </div>
          </div>
        )}

        {/* Promo Code — only shown when package is exhausted */}
        {userData && userData.meetingsUsed >= PLAN_LIMITS[userData.plan] && (
        <div className="pt-8 border-t border-[#E5E7EB] mb-8 max-w-sm mx-auto">
          {promoActivated ? (
            <div className="flex items-center justify-center gap-2 text-[#1A5C52] font-semibold text-sm">
              <CheckCircle2 size={16} /> Promo code activated!
            </div>
          ) : (
            <div>
              <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-3 flex items-center justify-center gap-2">
                <Tag size={13} /> Have a Promo Code?
              </p>
              <form onSubmit={handlePromoRedeem} className="flex gap-2">
                <input
                  type="text"
                  placeholder="CV-XXXX-XXXX"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-[#1A5C52]/20 focus:border-[#1A5C52] transition-all"
                />
                <button
                  type="submit"
                  disabled={promoLoading || !promoCode.trim()}
                  className="px-4 py-2.5 bg-[#1A5C52] text-white font-bold rounded-lg text-sm hover:bg-[#1A5C52]/90 transition-all disabled:opacity-50"
                >
                  {promoLoading ? '...' : 'Apply'}
                </button>
              </form>
            </div>
          )}
        </div>
        )}

        <button
          onClick={() => router.push('/dashboard')}
          className="text-[#1A5C52] font-bold text-sm hover:underline flex items-center justify-center gap-2 mx-auto"
        >
          <Home size={16} /> Back to Dashboard
        </button>
      </div>
    </div>
  )
}
