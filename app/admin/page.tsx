'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth, PLAN_LABELS, type Plan } from '@/contexts/AuthContext'
import { Logo } from '@/components/Logo'
import { toast } from 'sonner'
import {
  Plus,
  Tag,
  Users,
  Copy,
  ToggleLeft,
  ToggleRight,
  LogOut,
  RefreshCw,
  Gift,
  ShieldCheck,
} from 'lucide-react'

type PromoCode = {
  id: string
  code: string
  plan: Plan
  isActive: boolean
  usedBy: string | null
  usedAt: { seconds: number } | null
  createdAt: { seconds: number }
  notes?: string
}

type AppUser = {
  id: string
  email: string
  displayName: string
  plan: Plan
  meetingsUsed: number
  isAdmin: boolean
  promoUsed?: string
}

const PLAN_CREDIT_LIMITS: Record<Plan, number> = {
  free: 0,
  starter: 500,
  growth: 1000,
  scale: 2000,
}

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const seg = (n: number) =>
    Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `CV-${seg(4)}-${seg(4)}`
}

export default function AdminPage() {
  const { userData, logout } = useAuth()
  const router = useRouter()

  const [tab, setTab] = useState<'promos' | 'users'>('promos')
  const [promos, setPromos] = useState<PromoCode[]>([])
  const [users, setUsers] = useState<AppUser[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // New promo form
  const [newPlan, setNewPlan] = useState<Plan>('starter')
  const [newNotes, setNewNotes] = useState('')
  const [creating, setCreating] = useState(false)

  // Credit gift
  const [giftUid, setGiftUid] = useState('')
  const [giftPlan, setGiftPlan] = useState<Plan>('starter')
  const [gifting, setGifting] = useState(false)

  useEffect(() => {
    if (userData && !userData.isAdmin) {
      router.replace('/dashboard')
    }
  }, [userData, router])

  const fetchData = useCallback(async () => {
    setLoadingData(true)
    try {
      const [promoSnap, userSnap] = await Promise.all([
        getDocs(query(collection(db, 'promoCodes'), orderBy('createdAt', 'desc'))),
        getDocs(collection(db, 'users')),
      ])
      setPromos(promoSnap.docs.map(d => ({ id: d.id, ...d.data() } as PromoCode)))
      setUsers(userSnap.docs.map(d => ({ id: d.id, ...d.data() } as AppUser)))
    } catch (e) {
      toast.error('Failed to load data')
    } finally {
      setLoadingData(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const createPromo = async () => {
    setCreating(true)
    try {
      const code = generateCode()
      await addDoc(collection(db, 'promoCodes'), {
        code,
        plan: newPlan,
        isActive: true,
        usedBy: null,
        usedAt: null,
        notes: newNotes,
        createdBy: userData?.uid,
        createdAt: serverTimestamp(),
      })
      toast.success(`Code created: ${code}`)
      setNewNotes('')
      await fetchData()
    } catch {
      toast.error('Failed to create promo code')
    } finally {
      setCreating(false)
    }
  }

  const togglePromo = async (promo: PromoCode) => {
    if (promo.usedBy) {
      toast.error('Cannot toggle a used code')
      return
    }
    await updateDoc(doc(db, 'promoCodes', promo.id), { isActive: !promo.isActive })
    toast.success(`Code ${promo.isActive ? 'deactivated' : 'activated'}`)
    await fetchData()
  }

  const giftCredits = async () => {
    if (!giftUid) { toast.error('Select a user first'); return }
    setGifting(true)
    try {
      await updateDoc(doc(db, 'users', giftUid), {
        plan: giftPlan,
        giftedAt: serverTimestamp(),
        giftedBy: userData?.uid,
      })
      toast.success('Plan assigned successfully')
      await fetchData()
    } catch {
      toast.error('Failed to assign plan')
    } finally {
      setGifting(false)
    }
  }

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  if (!userData?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#6B7280]">Access denied.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Top Nav */}
      <nav className="bg-[#1A5C52] text-white px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
            <div className="w-3.5 h-3.5 border-2 border-[#1A5C52] rounded-sm rotate-45" />
          </div>
          <span className="font-bold text-lg">calvote</span>
          <span className="ml-2 bg-[#C49A2A] text-[#1C2B3A] text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck size={10} /> Admin
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="text-xs text-white/70 hover:text-white transition-colors">
            ← Dashboard
          </button>
          <button onClick={logout} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1C2B3A]">Admin Dashboard</h1>
            <p className="text-[#6B7280] text-sm mt-1">Manage promo codes and user plans</p>
          </div>
          <button onClick={fetchData} className="p-2 hover:bg-white rounded-lg transition-colors text-[#6B7280]">
            <RefreshCw size={18} className={loadingData ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: users.length, icon: Users },
            { label: 'Active Codes', value: promos.filter(p => p.isActive && !p.usedBy).length, icon: Tag },
            { label: 'Used Codes', value: promos.filter(p => p.usedBy).length, icon: Gift },
            { label: 'Paid Users', value: users.filter(u => u.plan !== 'free').length, icon: ShieldCheck },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
              <stat.icon size={18} className="text-[#1A5C52] mb-2" />
              <p className="text-2xl font-bold text-[#1C2B3A]">{stat.value}</p>
              <p className="text-xs text-[#6B7280]">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-[#E5E7EB]">
          {(['promos', 'users'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
                tab === t
                  ? 'border-[#1A5C52] text-[#1A5C52]'
                  : 'border-transparent text-[#6B7280] hover:text-[#1C2B3A]'
              }`}
            >
              {t === 'promos' ? 'Promo Codes' : 'Users'}
            </button>
          ))}
        </div>

        {/* Promo Codes Tab */}
        {tab === 'promos' && (
          <div className="space-y-6">
            {/* Create new promo */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
              <h2 className="text-base font-bold text-[#1C2B3A] mb-4 flex items-center gap-2">
                <Plus size={18} className="text-[#1A5C52]" /> Generate New Promo Code
              </h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Plan</label>
                  <select
                    value={newPlan}
                    onChange={e => setNewPlan(e.target.value as Plan)}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C52]/20 focus:border-[#1A5C52]"
                  >
                    <option value="starter">Starter — 500 meetings/mo — $500</option>
                    <option value="growth">Growth — 1,000 meetings/mo — $800</option>
                    <option value="scale">Scale — 2,000 meetings/mo — $2,500</option>
                  </select>
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Notes (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. For Acme Corp"
                    value={newNotes}
                    onChange={e => setNewNotes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C52]/20 focus:border-[#1A5C52]"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={createPromo}
                    disabled={creating}
                    className="px-6 py-2.5 bg-[#1A5C52] text-white font-bold rounded-lg hover:bg-[#1A5C52]/90 transition-all shadow-sm disabled:opacity-50 text-sm whitespace-nowrap"
                  >
                    {creating ? 'Creating...' : '+ Generate Code'}
                  </button>
                </div>
              </div>
            </div>

            {/* Promo list */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  <tr>
                    <th className="px-5 py-3.5 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Code</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Plan</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-[#6B7280] uppercase tracking-wider hidden sm:table-cell">Notes</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-[#6B7280] uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {promos.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-sm text-[#6B7280]">
                        No promo codes yet. Generate your first one above.
                      </td>
                    </tr>
                  )}
                  {promos.map(promo => (
                    <tr key={promo.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-sm font-bold text-[#1C2B3A]">{promo.code}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="capitalize text-xs font-bold px-2 py-1 rounded-full bg-[#1A5C52]/10 text-[#1A5C52]">
                          {promo.plan}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className="text-xs text-[#6B7280]">{promo.notes || '—'}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        {promo.usedBy ? (
                          <span className="text-xs font-bold text-[#C49A2A] bg-[#C49A2A]/10 px-2 py-1 rounded-full">Used</span>
                        ) : promo.isActive ? (
                          <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full">Active</span>
                        ) : (
                          <span className="text-xs font-bold text-[#6B7280] bg-[#F3F4F6] px-2 py-1 rounded-full">Inactive</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => copy(promo.code)} className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors text-[#6B7280]">
                            <Copy size={14} />
                          </button>
                          {!promo.usedBy && (
                            <button onClick={() => togglePromo(promo)} className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors text-[#6B7280]">
                              {promo.isActive ? <ToggleRight size={16} className="text-[#1A5C52]" /> : <ToggleLeft size={16} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="space-y-6">
            {/* Gift plan */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
              <h2 className="text-base font-bold text-[#1C2B3A] mb-4 flex items-center gap-2">
                <Gift size={18} className="text-[#1A5C52]" /> Assign Plan to User
              </h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">User</label>
                  <select
                    value={giftUid}
                    onChange={e => setGiftUid(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C52]/20 focus:border-[#1A5C52]"
                  >
                    <option value="">Select a user...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.email} ({u.plan})</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Plan</label>
                  <select
                    value={giftPlan}
                    onChange={e => setGiftPlan(e.target.value as Plan)}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C52]/20 focus:border-[#1A5C52]"
                  >
                    <option value="starter">Starter — 500/mo</option>
                    <option value="growth">Growth — 1,000/mo</option>
                    <option value="scale">Scale — 2,000/mo</option>
                    <option value="free">Free (revoke)</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={giftCredits}
                    disabled={gifting || !giftUid}
                    className="px-6 py-2.5 bg-[#C49A2A] text-white font-bold rounded-lg hover:bg-[#C49A2A]/90 transition-all shadow-sm disabled:opacity-50 text-sm whitespace-nowrap"
                  >
                    {gifting ? 'Assigning...' : 'Assign Plan'}
                  </button>
                </div>
              </div>
            </div>

            {/* Users list */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  <tr>
                    <th className="px-5 py-3.5 text-xs font-bold text-[#6B7280] uppercase tracking-wider">User</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Plan</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-[#6B7280] uppercase tracking-wider hidden sm:table-cell">Usage</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-[#6B7280] uppercase tracking-wider hidden md:table-cell">Promo Used</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-sm text-[#6B7280]">No users yet.</td>
                    </tr>
                  )}
                  {users.map(u => {
                    const limit = PLAN_CREDIT_LIMITS[u.plan]
                    const pct = limit > 0 ? Math.min((u.meetingsUsed / limit) * 100, 100) : 0
                    return (
                      <tr key={u.id} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#1A5C52]/10 text-[#1A5C52] flex items-center justify-center font-bold text-xs shrink-0">
                              {(u.displayName || u.email || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#1C2B3A] leading-tight">{u.displayName || '—'}</p>
                              <p className="text-[11px] text-[#6B7280]">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`capitalize text-xs font-bold px-2 py-1 rounded-full ${
                            u.plan === 'free' ? 'bg-[#F3F4F6] text-[#6B7280]' : 'bg-[#1A5C52]/10 text-[#1A5C52]'
                          }`}>
                            {u.plan}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          {limit > 0 ? (
                            <div className="flex items-center gap-2 min-w-[100px]">
                              <div className="flex-1 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                                <div className="h-full bg-[#1A5C52] rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs text-[#6B7280] whitespace-nowrap">
                                {u.meetingsUsed}/{limit}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-[#6B7280]">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <span className="font-mono text-xs text-[#6B7280]">{u.promoUsed || '—'}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          {u.isAdmin ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#C49A2A]/10 text-[#C49A2A] uppercase">Admin</span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F3F4F6] text-[#6B7280] uppercase">User</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
