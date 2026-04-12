'use client'

import { useState, useEffect, useCallback } from 'react'
import { collection, getDocs, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { ROLE_PERMISSIONS, ROLE_LABELS, ROLE_COLORS, type AdminRole } from '@/lib/admin-config'
import { toast } from 'sonner'
import { Copy, Link2, Lock, UserPlus } from 'lucide-react'
import { nanoid } from 'nanoid'

type TeamMember = {
  id: string
  email: string
  displayName: string
  role: AdminRole
  joinedAt?: string
  seeded?: boolean
}

type Invite = {
  id: string
  token: string
  role: AdminRole
  usedBy: string | null
  createdAt: Timestamp
  expiresAt: Timestamp
}

export default function TeamPage() {
  const { adminData } = useAuth()
  const role = adminData?.role ?? 'teammate'
  const can = ROLE_PERMISSIONS[role]

  const [team, setTeam] = useState<TeamMember[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteRole, setInviteRole] = useState<AdminRole>('teammate')
  const [creating, setCreating] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    const [teamSnap, inviteSnap] = await Promise.all([
      getDocs(collection(db, 'adminTeam')),
      getDocs(collection(db, 'adminInvites')),
    ])
    setTeam(teamSnap.docs.map(d => ({ id: d.id, ...d.data() } as TeamMember)))
    setInvites(inviteSnap.docs.map(d => ({ id: d.id, ...d.data() } as Invite)))
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const createInvite = async () => {
    if (!can.canInviteAdmins) return
    setCreating(true)
    try {
      const token = nanoid(24)
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      await addDoc(collection(db, 'adminInvites'), {
        token,
        role: inviteRole,
        usedBy: null,
        createdBy: adminData?.uid,
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiresAt),
      })
      toast.success('Invite link created!')
      await fetch()
    } catch {
      toast.error('Failed to create invite')
    }
    setCreating(false)
  }

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/admin/join/${token}`
    navigator.clipboard.writeText(url)
    toast.success('Invite link copied!')
  }

  const activeInvites = invites.filter(i => !i.usedBy && i.expiresAt?.toDate() > new Date())

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[#1C2B3A]">Admin Team</h1>

      {/* Invite */}
      {can.canInviteAdmins ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
          <h2 className="text-base font-bold text-[#1C2B3A] mb-4 flex items-center gap-2">
            <UserPlus size={16} className="text-[#1A5C52]" /> Create Invitation Link
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value as AdminRole)}
              className="flex-1 px-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C52]/20 focus:border-[#1A5C52]"
            >
              <option value="teammate">Teammate — view only</option>
              <option value="dev">Developer — view only + dev tools</option>
            </select>
            <button
              onClick={createInvite}
              disabled={creating}
              className="px-6 py-2.5 bg-[#1A5C52] text-white font-bold rounded-lg text-sm hover:bg-[#1A5C52]/90 transition-all disabled:opacity-50 whitespace-nowrap flex items-center gap-2"
            >
              <Link2 size={14} />
              {creating ? 'Creating...' : 'Generate Link'}
            </button>
          </div>

          {/* Active invite links */}
          {activeInvites.length > 0 && (
            <div className="mt-5 space-y-2">
              <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Active Invite Links</p>
              {activeInvites.map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${ROLE_COLORS[inv.role]}`}>
                      {ROLE_LABELS[inv.role]}
                    </span>
                    <span className="font-mono text-xs text-[#6B7280] truncate">
                      /admin/join/{inv.token}
                    </span>
                    <span className="text-[10px] text-[#9CA3AF] shrink-0">
                      expires {inv.expiresAt?.toDate().toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => copyLink(inv.token)}
                    className="p-1.5 hover:bg-white rounded-lg transition-colors text-[#6B7280] shrink-0 ml-2"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-5 flex items-center gap-3 text-[#6B7280]">
          <Lock size={16} />
          <p className="text-sm">Only Owners can invite new team members.</p>
        </div>
      )}

      {/* Team list */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
            <tr>
              {['Member', 'Role', 'Joined', 'Permissions'].map(h => (
                <th key={h} className="px-5 py-3.5 text-xs font-bold text-[#6B7280] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {loading && <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-[#6B7280]">Loading...</td></tr>}
            {team.map(member => {
              const perms = ROLE_PERMISSIONS[member.role]
              return (
                <tr key={member.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#1A5C52]/10 text-[#1A5C52] flex items-center justify-center font-bold text-xs shrink-0">
                        {(member.displayName || member.email || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1C2B3A]">{member.displayName || '—'}</p>
                        <p className="text-[11px] text-[#6B7280]">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${ROLE_COLORS[member.role]}`}>
                      {ROLE_LABELS[member.role]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[#6B7280]">
                    {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {perms.canGeneratePromos && <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-bold">Promos</span>}
                      {perms.canAssignPlans && <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-bold">Credits</span>}
                      {perms.canInviteAdmins && <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-bold">Invite</span>}
                      {perms.canViewUsers && <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">View Users</span>}
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
