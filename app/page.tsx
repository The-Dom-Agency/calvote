import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Calendar, Clock, Users, Zap } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-[#E5E7EB]">
        <Logo />
        <Link
          href="/login"
          className="px-5 py-2.5 rounded-lg text-sm font-semibold text-[#1C2B3A] border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
        >
          Log in
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A5C52]/10 text-[#1A5C52] text-xs font-semibold mb-8 tracking-wide uppercase">
          Smart Scheduling
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-[#1C2B3A] max-w-3xl leading-tight mb-6">
          Scheduling that works as hard as you do
        </h1>

        <p className="text-lg text-[#6B7280] max-w-xl mb-12 leading-relaxed">
          calvote connects your team&apos;s calendars and lets clients book the right meeting, with the right person, at the right time — automatically.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <a
            href="mailto:hello@calvote.ai?subject=Book a Demo"
            className="px-8 py-4 rounded-xl bg-[#1A5C52] text-white font-semibold text-base hover:bg-[#154d44] active:scale-[0.98] transition-all shadow-sm"
          >
            Book a Demo
          </a>
          <Link
            href="/login"
            className="px-8 py-4 rounded-xl border border-[#E5E7EB] text-[#1C2B3A] font-semibold text-base hover:bg-[#F9FAFB] active:scale-[0.98] transition-all"
          >
            Log in
          </Link>
        </div>
      </main>

      {/* Features */}
      <section className="px-8 py-20 bg-[#F9FAFB] border-t border-[#E5E7EB]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Calendar, title: 'Google Calendar Sync', desc: 'Connect your org\'s calendars instantly.' },
            { icon: Clock, title: 'Smart Availability', desc: 'Show real-time open slots across your team.' },
            { icon: Users, title: 'Team Scheduling', desc: 'Route meetings to the right person automatically.' },
            { icon: Zap, title: 'SMS Reminders', desc: 'Reduce no-shows with automated Twilio alerts.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#1A5C52]/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#1A5C52]" />
              </div>
              <h3 className="font-semibold text-[#1C2B3A] text-sm">{title}</h3>
              <p className="text-[#6B7280] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#9CA3AF]">
        <span>© {new Date().getFullYear()} calvote. All rights reserved.</span>
        <a href="mailto:hello@calvote.ai" className="hover:text-[#1C2B3A] transition-colors">
          hello@calvote.ai
        </a>
      </footer>
    </div>
  )
}
