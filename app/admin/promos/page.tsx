'use client'

import { useState, useEffect, useCallback } from 'react'
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { ROLE_PERMISSIONS } from '@/lib/admin-config'
import type { Plan } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Plus, Copy, ToggleLeft, ToggleRight, Lock } from 'lucide-react'

type PromoCode = {
  id: string
  code: string
  plan: Plan
  isActive: boolean
  usedBy: string | null
  notes?: string
  createdAt?: { seconds: number }
}

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const seg = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `CV-${seg(4)}-${seg(4)}`
}

export default function PromosPage() {
  const { adminData } = useAdminAuth()
  const role = adminData?.role ?? 'teammate'
  const can = ROLE_PERMISSIONS[role]

  const [promos, setPromos] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [newPlan, setNewPlan] = useState<Plan>('starter')
  const [newNotes, setNewNotes] = useState('')
  const [creating, setCreating] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    const snap = await getDocs(query(collection(db, 'promoCodes'), orderBy('createdAt', 'desc')))
    setPromos(snap.docs.map(d => ({ id: d.id, ...d.data() } as PromoCode)))
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const create = async () => {
    if (!can.canGeneratePromos) return
    setCreating(true)
    const code = generateCode()
    await addDoc(collection(db, 'promoCodes'), {
      code, plan: newPlan, isActive: true, usedBy: null,
      notes: newNotes, createdBy: adminData?.uid,
      createdAt: serverTimestamp(),
    })
    toast.success(`Created: ${code}`)
    setNewNotes('')
    await fetch()
    setCreating(false)
  }

  const toggle = async (p: PromoCode) => {
    if (!can.canGeneratePromos || p.usedBy) return
    await updateDoc(doc(db, 'promoCodes', p.id), { isActive: !p.isActive })
    toast.success(p.isActive ? 'Deactivated' : 'Activated')
    await fetch()
  }

  const copy = (code: string) => { navigator.clipboard.writeText(code); toast.success('Copied!') }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1C2B3A]">Promo Codes</h1>

      {/* Generate */}
      {can.canGeneratePromos ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
          <h2 className="text-base font-bold text-[#1C2B3A] mb-4 flex items-center gap-2">
            <Plus size={16} className="text-[#1A5C52]" /> Generate New Code
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={newPlan}
              onChange={e => setNewPlan(e.target.value as Plan)}
              className="flex-1 px-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C52]/20 focus:border-[#1A5C52]"
            >
              <option value="starter">Starter — 500 meetings/mo — $500/mo</option>
              <option value="growth">Growth — 1,000 meetings/mo — $800/mo</option>
              <option value="scale">Scale — 2,000 meetings/mo — $2,500/mo</option>
            </select>
            <input
              type="text"
              placeholder="Notes (optional) e.g. Acme Corp"
              value={newNotes}
              onChange={e => setNewNotes(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C52]/20 focus:border-[#1A5C52]"
            />
            <button
              onClick={create}
              disabled={creating}
              className="px-6 py-2.5 bg-[#1A5C52] text-white font-bold rounded-lg text-sm hover:bg-[#1A5C52]/90 transition-all disabled:opacity-50 whitespace-nowrap"
            >
              {creating ? 'Generating...' : '+ Generate'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-5 flex items-center gap-3 text-[#6B7280]">
          <Lock size={16} />
          <p className="text-sm">Only Owners can generate promo codes.</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
            <tr>
              {['Code', 'Plan', 'Notes', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3.5 text-xs font-bold text-[#6B7280] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {loading && <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-[#6B7280]">Loading...</td></tr>}
            {!loading && promos.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-[#6B7280]">No promo codes yet.</td></tr>
            )}
            {promos.map(p => (
              <tr key={p.id} className="hover:bg-[#F9FAFB] transition-colors">
                <td className="px-5 py-3.5 font-mono text-sm font-bold text-[#1C2B3A]">{p.code}</td>
                <td className="px-5 py-3.5">
                  <span className="capitalize text-xs font-bold px-2 py-1 rounded-full bg-[#1A5C52]/10 text-[#1A5C52]">{p.plan}</span>
                </td>
                <td className="px-5 py-3.5 text-xs text-[#6B7280]">{p.notes || '—'}</td>
                <td className="px-5 py-3.5">
                  {p.usedBy
                    ? <span className="text-xs font-bold text-[#C49A2A] bg-[#C49A2A]/10 px-2 py-1 rounded-full">Used</span>
                    : p.isActive
                    ? <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full">Active</span>
                    : <span className="text-xs font-bold text-[#6B7280] bg-[#F3F4F6] px-2 py-1 rounded-full">Inactive</span>
                  }
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <button onClick={() => copy(p.code)} className="p-1.5 hover:bg-[#F3F4F6] rounded-lg text-[#6B7280] transition-colors">
                      <Copy size={14} />
                    </button>
                    {can.canGeneratePromos && !p.usedBy && (
                      <button onClick={() => toggle(p)} className="p-1.5 hover:bg-[#F3F4F6] rounded-lg text-[#6B7280] transition-colors">
                        {p.isActive ? <ToggleRight size={16} className="text-[#1A5C52]" /> : <ToggleLeft size={16} />}
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
  )
}
