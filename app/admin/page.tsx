'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { Users, Tag, Gift, TrendingUp } from 'lucide-react'

export default function AdminOverviewPage() {
  const { adminData } = useAdminAuth()
  const [stats, setStats] = useState({ users: 0, activeCodes: 0, usedCodes: 0, paidUsers: 0 })

  useEffect(() => {
    const load = async () => {
      const [userSnap, promoSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'promoCodes')),
      ])
      const users = userSnap.docs.map(d => d.data())
      const promos = promoSnap.docs.map(d => d.data())
      setStats({
        users: users.length,
        activeCodes: promos.filter(p => p.isActive && !p.usedBy).length,
        usedCodes: promos.filter(p => p.usedBy).length,
        paidUsers: users.filter(u => u.plan && u.plan !== 'free').length,
      })
    }
    load()
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1C2B3A]">Overview</h1>
        <p className="text-[#6B7280] text-sm mt-1">
          Welcome back, {adminData?.displayName?.split(' ')[0] || 'Admin'}.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Users', value: stats.users, icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Active Promo Codes', value: stats.activeCodes, icon: Tag, color: 'text-[#1A5C52] bg-[#1A5C52]/10' },
          { label: 'Codes Redeemed', value: stats.usedCodes, icon: Gift, color: 'text-[#C49A2A] bg-[#C49A2A]/10' },
          { label: 'Paid Users', value: stats.paidUsers, icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon size={18} />
            </div>
            <p className="text-2xl font-bold text-[#1C2B3A]">{s.value}</p>
            <p className="text-xs text-[#6B7280] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
