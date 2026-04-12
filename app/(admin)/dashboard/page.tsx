'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Calendar,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Users,
  Clock,
  Zap,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { useAuth, PLAN_LABELS, PLAN_LIMITS } from '@/contexts/AuthContext'
import { toast } from 'sonner'

const contacts = [
  { id: 1, name: 'Travis Barker', phone: '+1 234 567 8901', calendarLinked: 'Yes', email: 'travis@example.com' },
  { id: 2, name: 'Selena Gomez', phone: '+1 987 654 3210', calendarLinked: 'Yes', email: 'selena@example.com' },
  { id: 3, name: 'Justin Bieber', phone: '+1 555 123 4567', calendarLinked: 'No', email: 'justin@example.com' },
]

const recentMeetings = [
  { title: 'Project Kickoff', date: 'April 10, 2026', time: '10:00 AM', attendees: 3 },
  { title: 'Quarterly Review', date: 'April 12, 2026', time: '2:30 PM', attendees: 5 },
  { title: 'Design Sync', date: 'April 15, 2026', time: '9:00 AM', attendees: 2 },
]

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userData } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')

  // Handle Google Calendar OAuth callback messages
  useEffect(() => {
    if (searchParams.get('calendar') === 'connected') {
      toast.success('Google Calendar connected successfully!')
    }
    if (searchParams.get('error') === 'calendar_auth_failed') {
      toast.error('Calendar connection failed. Please try again.')
    }
  }, [searchParams])

  const meetingsUsed = userData?.meetingsUsed ?? 0
  const meetingLimit = PLAN_LIMITS[userData?.plan ?? 'free']
  const usagePct = meetingLimit > 0 ? Math.min((meetingsUsed / meetingLimit) * 100, 100) : 0
  const calendarConnected = userData?.googleCalendar?.connected ?? false

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1C2B3A]">Team Dashboard</h1>
          <p className="text-[#6B7280] mt-1">Manage your team&apos;s availability and schedule meetings effortlessly.</p>
        </div>
        <Link
          href="/schedule"
          className="inline-flex items-center justify-center gap-2 bg-[#1A5C52] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#1A5C52]/90 transition-all shadow-md shadow-[#1A5C52]/10"
        >
          <Plus size={20} />
          Schedule a Meeting
        </Link>
      </div>

      {/* Plan + Calendar Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Plan status */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1A5C52]/10 rounded-xl flex items-center justify-center">
              <Zap size={18} className="text-[#1A5C52]" />
            </div>
            <div>
              <p className="text-xs text-[#6B7280] font-medium">Current Plan</p>
              <p className="text-sm font-bold text-[#1C2B3A]">
                {PLAN_LABELS[userData?.plan ?? 'free']}
              </p>
            </div>
          </div>
          {meetingLimit > 0 && (
            <div className="text-right min-w-[100px]">
              <p className="text-xs text-[#6B7280] mb-1">{meetingsUsed} / {meetingLimit} meetings</p>
              <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${usagePct > 90 ? 'bg-[#EF4444]' : 'bg-[#1A5C52]'}`}
                  style={{ width: `${usagePct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Google Calendar status */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F9FAFB] rounded-xl flex items-center justify-center border border-[#E5E7EB]">
              <Calendar size={18} className={calendarConnected ? 'text-[#1A5C52]' : 'text-[#9CA3AF]'} />
            </div>
            <div>
              <p className="text-xs text-[#6B7280] font-medium">Google Calendar</p>
              {calendarConnected ? (
                <p className="text-sm font-bold text-[#1A5C52] flex items-center gap-1">
                  <CheckCircle2 size={13} /> Connected — {userData?.googleCalendar?.email}
                </p>
              ) : (
                <p className="text-sm font-bold text-[#6B7280] flex items-center gap-1">
                  <AlertCircle size={13} /> Not connected
                </p>
              )}
            </div>
          </div>
          {!calendarConnected && (
            <a
              href={`/api/google-calendar/connect?state=${userData?.uid}`}
              className="text-xs font-bold text-[#1A5C52] border border-[#1A5C52] px-3 py-1.5 rounded-lg hover:bg-[#1A5C52]/5 transition-colors whitespace-nowrap"
            >
              Connect →
            </a>
          )}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column */}
        <div className="lg:col-span-1 space-y-8">

          {/* Connected Calendars */}
          <section className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#1C2B3A] flex items-center gap-2">
                <Calendar className="text-[#1A5C52]" size={20} />
                Connected Calendars
              </h2>
            </div>
            <div className="space-y-4">
              {[
                { name: "Travis's Calendar", type: 'Direct Connection' },
                { name: "Selena's Calendar", type: 'Organization Sync' },
              ].map((cal) => (
                <div key={cal.name} className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg border border-[#E5E7EB] flex items-center justify-center">
                      <Calendar className="text-[#1A5C52]" size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1C2B3A]">{cal.name}</p>
                      <p className="text-xs text-[#6B7280]">{cal.type}</p>
                    </div>
                  </div>
                  <span className="bg-[#C49A2A]/10 text-[#C49A2A] text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                    Connected
                  </span>
                </div>
              ))}
              <button className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[#E5E7EB] rounded-xl text-[#6B7280] text-sm font-medium hover:border-[#1A5C52] hover:text-[#1A5C52] transition-colors group">
                <Plus size={16} className="group-hover:scale-110 transition-transform" />
                Connect Another Calendar
              </button>
            </div>
          </section>

          {/* Recent Meetings */}
          <section className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#1C2B3A] flex items-center gap-2">
                <Clock className="text-[#1A5C52]" size={20} />
                Recent Meetings
              </h2>
              <button className="text-xs text-[#1A5C52] font-semibold hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {recentMeetings.map((meeting, i) => (
                <div
                  key={i}
                  className="p-4 bg-white border-l-4 border-[#1A5C52] border-y border-r border-[#E5E7EB] rounded-r-xl hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-bold text-[#1C2B3A]">{meeting.title}</h3>
                    <ExternalLink size={14} className="text-[#6B7280]" />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#6B7280]">
                    <span className="flex items-center gap-1"><Calendar size={12} />{meeting.date}</span>
                    <span className="flex items-center gap-1"><Clock size={12} />{meeting.time}</span>
                  </div>
                  <div className="mt-3 flex -space-x-2">
                    {[...Array(Math.min(meeting.attendees, 3))].map((_, idx) => (
                      <div key={idx} className="w-6 h-6 rounded-full border-2 border-white bg-[#F3F4F6] flex items-center justify-center text-[8px] font-bold text-[#1A5C52]">
                        {['TB', 'SG', 'JB'][idx]}
                      </div>
                    ))}
                    {meeting.attendees > 3 && (
                      <div className="w-6 h-6 rounded-full border-2 border-white bg-[#F3F4F6] flex items-center justify-center text-[8px] font-bold text-[#6B7280]">
                        +{meeting.attendees - 3}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column – Contact Directory */}
        <div className="lg:col-span-2">
          <section className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col h-full">
            <div className="p-6 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-[#1C2B3A] flex items-center gap-2">
                <Users className="text-[#1A5C52]" size={20} />
                Contact Directory
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={18} />
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    className="pl-10 pr-4 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C52]/20 focus:border-[#1A5C52] transition-all w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => router.push('/contacts')}
                  className="bg-[#1A5C52] text-white p-2 rounded-lg hover:bg-[#1A5C52]/90 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F9FAFB]">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider hidden sm:table-cell">Email</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider hidden md:table-cell">Calendar Linked</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#1A5C52]/10 text-[#1A5C52] flex items-center justify-center font-bold text-xs">
                              {contact.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-sm font-semibold text-[#1C2B3A]">{contact.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#6B7280] hidden sm:table-cell">{contact.email}</td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          {contact.calendarLinked === 'Yes' ? (
                            <span className="inline-flex items-center gap-1 text-[#C49A2A] text-xs font-bold">
                              <Calendar size={12} /> Linked
                            </span>
                          ) : (
                            <span className="text-[#6B7280] text-xs">Not Linked</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 text-[#6B7280]">
                            <button className="p-1 hover:text-[#1A5C52] hover:bg-white rounded transition-colors">
                              <Edit2 size={16} />
                            </button>
                            <button className="p-1 hover:text-[#EF4444] hover:bg-white rounded transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <Users className="text-[#E5E7EB] mb-2" size={48} />
                          <p className="text-[#6B7280] text-sm font-medium">No contacts found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-[#E5E7EB] bg-[#F9FAFB] text-center mt-auto">
              <Link href="/contacts" className="text-sm font-bold text-[#1A5C52] hover:underline">
                View &amp; Manage Full Directory
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
