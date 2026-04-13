'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AdminAuthProvider, useAdminAuth } from '@/contexts/AdminAuthContext'
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/admin-config'
import { LogOut, LayoutDashboard, Users, Tag, UserCog } from 'lucide-react'
import { Logo } from '@/components/Logo'

const navItems = [
  { label: 'Overview',    path: '/admin',        icon: LayoutDashboard, exact: true },
  { label: 'Users',       path: '/admin/users',  icon: Users },
  { label: 'Promo Codes', path: '/admin/promos', icon: Tag },
  { label: 'Team',        path: '/admin/team',   icon: UserCog },
]

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { adminData, logout } = useAdminAuth()

  // On public admin pages (login, join) don't render the sidebar
  if (pathname === '/admin/login' || pathname.startsWith('/admin/join')) {
    return <>{children}</>
  }

  const role     = adminData?.role ?? 'teammate'
  const initials = (adminData?.displayName || adminData?.email || '?')
    .split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* Sidebar */}
      <aside className="w-60 bg-[#1C2B3A] text-white flex flex-col fixed h-full z-40">
        <div className="px-5 py-5 border-b border-white/10">
          <Logo height={26} className="brightness-0 invert mb-1" />
          <p className="text-[10px] text-white/40 leading-none mt-1.5">Admin Panel</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => {
            const isActive = item.exact ? pathname === item.path : pathname.startsWith(item.path)
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#1A5C52] flex items-center justify-center text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{adminData?.displayName || 'Admin'}</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ROLE_COLORS[role]}`}>
                {ROLE_LABELS[role]}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      <main className="ml-60 flex-1 px-8 py-8 min-h-screen">
        {children}
      </main>
    </div>
  )
}

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  )
}
