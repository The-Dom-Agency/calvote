'use client'

import { useState, useEffect, useCallback } from 'react'
import { collection, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { ROLE_PERMISSIONS } from '@/lib/admin-config'
import type { Plan } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Gift, Lock } from 'lucide-react'

type AppUser = {
  id: string
  email: string
  displayName: string
  plan: Plan
  meetingsUsed: number
  promoUsed?: string
}

const PLAN_LIMITS: Record<Plan, number> = { free: 0, starter: 500, growth: 1000, scale: 2000 }

export default function UsersPage() {
  const { adminData } = useAdminAuth()
  const role = adminData?.role ?? 'teammate'
  const can = ROLE_PERMISSIONS[role]

  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [giftUid, setGiftUid] = useState('')
  const [giftPlan, setGiftPlan] = useState<Plan>('starter')
  const [gifting, setGifting] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    const snap = await getDocs(collection(db, 'users'))
    setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as AppUser)))
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const giftPlanToUser = async () => {
    if (!can.canAssignPlans || !giftUid) return
    setGifting(true)
    try {
      await updateDoc(doc(db, 'users', giftUid), {
        plan: giftPlan,
        giftedBy: adminData?.uid,
        giftedAt: serverTimestamp(),
      })
      toast.success('Plan assigned!')
      setGiftUid('')
      await fetch()
    } catch {
      toast.error('Failed to assign plan')
    }
    setGifting(false)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1C2B3A]">Users</h1>

      {/* Assign plan */}
      {can.canAssignPlans ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
          <h2 className="text-base font-bold text-[#1C2B3A] mb-4 flex items-center gap-2">
            <Gift size={16} className="text-[#1A5C52]" /> Assign / Top-up Plan
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={giftUid}
              onChange={e => setGiftUid(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C52]/20 focus:border-[#1A5C52]"
            >
              <option value="">Select a user...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.email} — {u.plan}</option>
              ))}
            </select>
            <select
              value={giftPlan}
              onChange={e => setGiftPlan(e.target.value as Plan)}
              className="flex-1 px-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C52]/20 focus:border-[#1A5C52]"
            >
              <option value="starter">Starter — 500/mo</option>
              <option value="growth">Growth — 1,000/mo</option>
              <option value="scale">Scale — 2,000/mo</option>
              <option value="free">Free (revoke)</option>
            </select>
            <button
              onClick={giftPlanToUser}
              disabled={gifting || !giftUid}
              className="px-6 py-2.5 bg-[#C49A2A] text-white font-bold rounded-lg text-sm hover:bg-[#C49A2A]/90 transition-all disabled:opacity-50 whitespace-nowrap"
            >
              {gifting ? 'Saving...' : 'Assign Plan'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-5 flex items-center gap-3 text-[#6B7280]">
          <Lock size={16} />
          <p className="text-sm">Only Owners can assign or top-up plans.</p>
        </div>
      )}

      {/* Users table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
            <tr>
              {['User', 'Plan', 'Usage', 'Promo Used'].map(h => (
                <th key={h} className="px-5 py-3.5 text-xs font-bold text-[#6B7280] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {loading && <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-[#6B7280]">Loading...</td></tr>}
            {!loading && users.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-[#6B7280]">No users yet.</td></tr>
            )}
            {users.map(u => {
              const limit = PLAN_LIMITS[u.plan]
              const pct = limit > 0 ? Math.min((u.meetingsUsed / limit) * 100, 100) : 0
              return (
                <tr key={u.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#1A5C52]/10 text-[#1A5C52] flex items-center justify-center font-bold text-xs shrink-0">
                        {(u.displayName || u.email || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1C2B3A]">{u.displayName || '—'}</p>
                        <p className="text-[11px] text-[#6B7280]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`capitalize text-xs font-bold px-2 py-1 rounded-full ${
                      u.plan === 'free' ? 'bg-[#F3F4F6] text-[#6B7280]' : 'bg-[#1A5C52]/10 text-[#1A5C52]'
                    }`}>{u.plan}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    {limit > 0 ? (
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <div className="flex-1 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${pct > 90 ? 'bg-[#EF4444]' : 'bg-[#1A5C52]'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-[#6B7280] whitespace-nowrap">{u.meetingsUsed}/{limit}</span>
                      </div>
                    ) : <span className="text-xs text-[#6B7280]">—</span>}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-[#6B7280]">{u.promoUsed || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
