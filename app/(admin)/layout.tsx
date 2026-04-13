'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, LogOut, LayoutDashboard, Users, CalendarPlus, Smartphone } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Logo } from '@/components/Logo'

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Contacts', path: '/contacts', icon: Users },
  { name: 'Schedule', path: '/schedule', icon: CalendarPlus },
  { name: 'Preview', path: '/availability/demo-meeting', icon: Smartphone },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { userData, logout } = useAuth()

  const initials = (userData?.displayName || userData?.email || '?')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Top nav */}
      <nav className="bg-[#1A5C52] text-white px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6 lg:gap-10">
          <Link href="/dashboard" className="hover:opacity-90 transition-opacity">
            <Logo height={28} className="brightness-0 invert" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.path
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                    isActive ? 'bg-white/15' : 'hover:bg-white/10'
                  }`}
                >
                  <Icon size={16} />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#C49A2A] rounded-full" />
          </button>

          <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-white/20">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold leading-tight">{userData?.displayName || 'User'}</p>
              <p className="text-[10px] text-white/60 capitalize">{userData?.plan} plan</p>
            </div>
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center border border-white/30 text-xs font-bold shrink-0">
              {initials}
            </div>
            <button onClick={logout} className="p-1.5 hover:bg-white/10 rounded-full transition-colors" title="Sign out">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main content — extra bottom padding on mobile for bottom nav */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] z-50 flex">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors ${
                isActive ? 'text-[#1A5C52]' : 'text-[#9CA3AF]'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-semibold">{item.name}</span>
              {isActive && <span className="absolute bottom-0 w-8 h-0.5 bg-[#1A5C52] rounded-full" />}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
