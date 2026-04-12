'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Bell, LogOut, LayoutDashboard, Users, CalendarPlus, Smartphone } from 'lucide-react'

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Contacts', path: '/contacts', icon: Users },
  { name: 'Schedule', path: '/schedule', icon: CalendarPlus },
  { name: 'Invitee Preview', path: '/availability/demo-meeting', icon: Smartphone },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-[#1A5C52] text-white px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-12">
          <Link href="/dashboard" className="hover:opacity-90 transition-opacity">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-[#1A5C52] rounded-sm rotate-45" />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">calvote</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.path
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                    isActive ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C49A2A] rounded-full border border-[#1A5C52]" />
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-white/20">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">Admin</p>
              <p className="text-xs text-white/70">calvote.ai</p>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
              <User size={20} />
            </div>
            <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <LogOut size={20} />
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
