'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { ROLE_PERMISSIONS } from '@/lib/admin-config'
import type { Plan } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Plus, Copy, ToggleLeft, ToggleRight, Lock, Users, Trash2 } from 'lucide-react'

type PromoCode = {
  id: string
  code: string
  plan: Plan
  isActive: boolean
  maxUses: number
  usedCount: number
  usedBy: string[]
  notes?: string
  createdAt?: { seconds: number } | null
}

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const seg = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `CV-${seg(4)}-${seg(4)}`
}

const MAX_USES_OPTIONS = [
  { label: '1 use (single)', value: 1 },
  { label: '5 uses', value: 5 },
  { label: '10 uses', value: 10 },
  { label: '25 uses', value: 25 },
  { label: '50 uses', value: 50 },
  { label: '100 uses', value: 100 },
  { label: 'Unlimited', value: -1 },
]

function statusBadge(p: PromoCode) {
  const exhausted = p.maxUses !== -1 && p.usedCount >= p.maxUses
  if (exhausted) return <span className="text-xs font-bold text-[#C49A2A] bg-[#C49A2A]/10 px-2 py-1 rounded-full">Exhausted</span>
  if (p.isActive) return <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full">Active</span>
  return <span className="text-xs font-bold text-[#6B7280] bg-[#F3F4F6] px-2 py-1 rounded-full">Inactive</span>
}

function usageBadge(p: PromoCode) {
  if (p.maxUses === -1) return <span className="text-xs text-[#6B7280]">{p.usedCount} / ∞</span>
  const pct = Math.min((p.usedCount / p.maxUses) * 100, 100)
  const color = pct >= 100 ? 'bg-[#EF4444]' : pct >= 75 ? 'bg-[#C49A2A]' : 'bg-[#1A5C52]'
  return (
    <div className="flex items-center gap-2 min-w-[90px]">
      <div className="flex-1 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-[#6B7280] shrink-0">{p.usedCount}/{p.maxUses}</span>
    </div>
  )
}

export default function PromosPage() {
  const { adminData } = useAdminAuth()
  const role = adminData?.role ?? 'teammate'
  const can = ROLE_PERMISSIONS[role]

  const [promos, setPromos] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [newPlan, setNewPlan] = useState<Plan>('starter')
  const [newNotes, setNewNotes] = useState('')
  const [newMaxUses, setNewMaxUses] = useState(1)
  const [creating, setCreating] = useState(false)

  const fetchPromos = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/promos')
    const data = await res.json()
    setPromos(data.promos ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchPromos() }, [fetchPromos])

  const create = async () => {
    if (!can.canGeneratePromos) return
    setCreating(true)
    const code = generateCode()
    const res = await fetch('/api/admin/promos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, plan: newPlan, maxUses: newMaxUses, notes: newNotes, createdBy: adminData?.uid }),
    })
    if (res.ok) {
      toast.success(`Created: ${code}`)
      setNewNotes('')
      await fetchPromos()
    } else {
      toast.error('Failed to create promo code.')
    }
    setCreating(false)
  }

  const toggle = async (p: PromoCode) => {
    const exhausted = p.maxUses !== -1 && p.usedCount >= p.maxUses
    if (!can.canGeneratePromos || exhausted) return
    await fetch('/api/admin/promos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id, isActive: !p.isActive }),
    })
    toast.success(p.isActive ? 'Deactivated' : 'Activated')
    await fetchPromos()
  }

  const remove = async (p: PromoCode) => {
    if (!can.canGeneratePromos) return
    if (!confirm(`Delete promo code ${p.code}? This cannot be undone.`)) return
    await fetch('/api/admin/promos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id }),
    })
    toast.success(`Deleted ${p.code}`)
    await fetchPromos()
  }

  const copy = (code: string) => { navigator.clipboard.writeText(code); toast.success('Copied!') }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1C2B3A]">Promo Codes</h1>

      {can.canGeneratePromos ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
          <h2 className="text-base font-bold text-[#1C2B3A] mb-4 flex items-center gap-2">
            <Plus size={16} className="text-[#1A5C52]" /> Generate New Code
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <select
              value={newPlan}
              onChange={e => setNewPlan(e.target.value as Plan)}
              className="px-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C52]/20 focus:border-[#1A5C52]"
            >
              <option value="starter">Starter — 500/mo</option>
              <option value="growth">Growth — 1,000/mo</option>
              <option value="scale">Scale — 2,000/mo</option>
            </select>
            <select
              value={newMaxUses}
              onChange={e => setNewMaxUses(Number(e.target.value))}
              className="px-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C52]/20 focus:border-[#1A5C52]"
            >
              {MAX_USES_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Notes (optional) e.g. Acme Corp"
              value={newNotes}
              onChange={e => setNewNotes(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C52]/20 focus:border-[#1A5C52]"
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

      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
            <tr>
              {['Code', 'Plan', 'Usage', 'Notes', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3.5 text-xs font-bold text-[#6B7280] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {loading && <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-[#6B7280]">Loading...</td></tr>}
            {!loading && promos.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-[#6B7280]">No promo codes yet.</td></tr>
            )}
            {promos.map(p => {
              const exhausted = p.maxUses !== -1 && p.usedCount >= p.maxUses
              return (
                <tr key={p.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-5 py-3.5 font-mono text-sm font-bold text-[#1C2B3A]">{p.code}</td>
                  <td className="px-5 py-3.5">
                    <span className="capitalize text-xs font-bold px-2 py-1 rounded-full bg-[#1A5C52]/10 text-[#1A5C52]">{p.plan}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Users size={12} className="text-[#9CA3AF]" />
                      {usageBadge(p)}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[#6B7280]">{p.notes || '—'}</td>
                  <td className="px-5 py-3.5">{statusBadge(p)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => copy(p.code)} className="p-1.5 hover:bg-[#F3F4F6] rounded-lg text-[#6B7280] transition-colors" title="Copy">
                        <Copy size={14} />
                      </button>
                      {can.canGeneratePromos && !exhausted && (
                        <button onClick={() => toggle(p)} className="p-1.5 hover:bg-[#F3F4F6] rounded-lg text-[#6B7280] transition-colors" title={p.isActive ? 'Deactivate' : 'Activate'}>
                          {p.isActive ? <ToggleRight size={16} className="text-[#1A5C52]" /> : <ToggleLeft size={16} />}
                        </button>
                      )}
                      {can.canGeneratePromos && (
                        <button onClick={() => remove(p)} className="p-1.5 hover:bg-[#FEF2F2] rounded-lg text-[#6B7280] hover:text-[#EF4444] transition-colors" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
