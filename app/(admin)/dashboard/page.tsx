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
  Users,
  Clock,
  Zap,
  CheckCircle2,
  Power,
  Mail,
  Link2,
  ChevronDown,
  ChevronUp,
  Send,
  RefreshCw,
  X,
  CheckCheck,
  HelpCircle,
} from 'lucide-react'
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth, PLAN_LABELS, PLAN_LIMITS } from '@/contexts/AuthContext'
import { toast } from 'sonner'

type Contact = {
  id: string
  name: string
  email: string
  phone?: string
  calendarLinked: boolean
  calendarEmail?: string
}

type Meeting = {
  id: string
  title: string
  description?: string
  timeFrom: string
  timeTo: string
  attendees: { id: string; name: string }[]
  dates: string[]
  status: 'pending' | 'confirmed'
  createdAt?: { seconds: number }
}

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, userData } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [showInviteMenu, setShowInviteMenu] = useState(false)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [calendarMenuOpen, setCalendarMenuOpen] = useState<string | null>(null)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [responses, setResponses] = useState<{ id: string; attendeeName: string; selectedSlots: string[] }[]>([])
  const [loadingResponses, setLoadingResponses] = useState(false)

  // Load contacts from Firestore
  useEffect(() => {
    if (!user) return
    const ref = collection(db, 'users', user.uid, 'contacts')
    return onSnapshot(ref, snap => {
      setContacts(snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Contact, 'id'>) })))
    })
  }, [user])

  // Load meetings from Firestore
  useEffect(() => {
    if (!user) return
    const ref = collection(db, 'users', user.uid, 'meetings')
    return onSnapshot(ref, snap => {
      setMeetings(snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Meeting, 'id'>) })))
    })
  }, [user])

  // Handle Google Calendar OAuth callback — run once on mount only
  useEffect(() => {
    const calendar = searchParams.get('calendar')
    const error = searchParams.get('error')
    if (calendar === 'connected') {
      toast.success('Google Calendar connected successfully!', { id: 'cal-connected' })
      router.replace('/dashboard')
    } else if (error === 'calendar_auth_failed' || error === 'calendar_token_failed') {
      toast.error('Calendar connection failed. Please try again.', { id: 'cal-error' })
      router.replace('/dashboard')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const meetingsUsed = userData?.meetingsUsed ?? 0
  const meetingLimit = PLAN_LIMITS[userData?.plan ?? 'free']
  const usagePct = meetingLimit > 0 ? Math.min((meetingsUsed / meetingLimit) * 100, 100) : 0
  const calendarConnected = userData?.googleCalendar?.connected ?? false

  const linkedContacts = contacts.filter(c => c.calendarLinked)
  const unlinkedContacts = contacts.filter(c => !c.calendarLinked)

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const openMeeting = async (meeting: Meeting) => {
    setSelectedMeeting(meeting)
    setLoadingResponses(true)
    setResponses([])
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/responses`)
      const data = await res.json()
      setResponses(data.responses ?? [])
    } catch {
      toast.error('Failed to load responses.')
    } finally {
      setLoadingResponses(false)
    }
  }

  const disconnectCalendar = async () => {
    if (!user) return
    try {
      await import('firebase/firestore').then(({ updateDoc, doc }) =>
        updateDoc(doc(db, 'users', user.uid), {
          googleCalendar: { connected: false, email: null, accessToken: null, refreshToken: null },
        })
      )
      setCalendarMenuOpen(null)
      toast.success('Calendar disconnected.')
    } catch {
      toast.error('Failed to disconnect.')
    }
  }

  const copyInviteLink = async (contact: Contact) => {
    if (!user) return
    try {
      const res = await fetch('/api/contacts/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerUid: user.uid, contactId: contact.id, contactEmail: contact.email, contactName: contact.name }),
      })
      const { link, emailSent } = await res.json()
      await navigator.clipboard.writeText(link)
      setCopiedId(contact.id)
      setShowInviteMenu(false)
      toast.success(emailSent ? `Invite sent to ${contact.name} via email` : `Invite link copied for ${contact.name}`)
      setTimeout(() => setCopiedId(null), 3000)
    } catch {
      toast.error('Failed to generate invite link.')
    }
  }

  return (
    <div className="space-y-6 sm:space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1C2B3A]">Team Dashboard</h1>
          <p className="text-[#6B7280] mt-1 text-sm">Manage your team&apos;s availability and schedule meetings effortlessly.</p>
        </div>
        <Link
          href="/schedule"
          className="inline-flex items-center justify-center gap-2 bg-[#1A5C52] text-white px-5 py-3 rounded-lg font-semibold hover:bg-[#1A5C52]/90 transition-all shadow-md shadow-[#1A5C52]/10 text-sm sm:text-base"
        >
          <Plus size={18} />
          Schedule a Meeting
        </Link>
      </div>

      {/* Plan Status Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1A5C52]/10 rounded-xl flex items-center justify-center shrink-0">
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
          <div className="text-right min-w-[90px]">
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

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6 sm:space-y-8">

          {/* Connected Calendars */}
          <section className="bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base sm:text-lg font-bold text-[#1C2B3A] flex items-center gap-2">
                <Calendar className="text-[#1A5C52]" size={20} />
                Connected Calendars
              </h2>
            </div>

            <div className="space-y-3">
              {/* Your own calendar */}
              {calendarConnected ? (
                <div className="relative">
                  <div className="flex items-center justify-between p-3.5 bg-[#F0FDF9] rounded-xl border border-[#1A5C52]/20">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 bg-white rounded-lg border border-[#1A5C52]/20 flex items-center justify-center shrink-0">
                        <Calendar className="text-[#1A5C52]" size={15} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#1C2B3A] truncate">{userData?.googleCalendar?.email}</p>
                        <p className="text-[10px] text-[#6B7280]">You · Google Calendar</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setCalendarMenuOpen(v => v === 'me' ? null : 'me')}
                      className="w-6 h-6 bg-[#1A5C52] rounded-full flex items-center justify-center shrink-0 ml-2 hover:bg-[#154d44] transition-colors"
                    >
                      <Power size={11} className="text-white" />
                    </button>
                  </div>
                  {calendarMenuOpen === 'me' && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-20 overflow-hidden w-44">
                      <a
                        href={`/api/google-calendar/connect?state=${userData?.uid}`}
                        className="flex items-center gap-2 px-4 py-3 text-xs font-medium text-[#1C2B3A] hover:bg-[#F9FAFB] transition-colors"
                      >
                        <RefreshCw size={13} className="text-[#1A5C52]" /> Reconnect
                      </a>
                      <button
                        onClick={disconnectCalendar}
                        className="w-full flex items-center gap-2 px-4 py-3 text-xs font-medium text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
                      >
                        <Power size={13} /> Disconnect
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <a
                  href={`/api/google-calendar/connect?state=${userData?.uid}`}
                  className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[#E5E7EB] rounded-xl text-[#6B7280] text-xs font-medium hover:border-[#1A5C52] hover:text-[#1A5C52] transition-colors"
                >
                  <Plus size={14} />
                  Connect your Google Calendar
                </a>
              )}

              {/* Linked contacts' calendars */}
              {linkedContacts.map(contact => (
                <div key={contact.id} className="relative">
                  <div className="flex items-center justify-between p-3.5 bg-[#F0FDF9] rounded-xl border border-[#1A5C52]/20">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 bg-[#1A5C52]/10 rounded-full flex items-center justify-center shrink-0 text-[#1A5C52] font-bold text-xs">
                        {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#1C2B3A] truncate">{contact.name}</p>
                        <p className="text-[10px] text-[#6B7280] truncate">{contact.calendarEmail || 'Google Calendar'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setCalendarMenuOpen(v => v === contact.id ? null : contact.id)}
                      className="w-6 h-6 bg-[#1A5C52] rounded-full flex items-center justify-center shrink-0 ml-2 hover:bg-[#154d44] transition-colors"
                    >
                      <Power size={11} className="text-white" />
                    </button>
                  </div>
                  {calendarMenuOpen === contact.id && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-20 overflow-hidden w-44">
                      <button
                        onClick={async () => {
                          if (!user) return
                          await import('firebase/firestore').then(({ updateDoc, doc }) =>
                            updateDoc(doc(db, 'users', user.uid, 'contacts', contact.id), {
                              calendarLinked: false, calendarEmail: null, accessToken: null, refreshToken: null,
                            })
                          )
                          setCalendarMenuOpen(null)
                          toast.success(`${contact.name}'s calendar disconnected.`)
                        }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-xs font-medium text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
                      >
                        <Power size={13} /> Disconnect
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Invite to connect calendar — always visible */}
              <div className="relative">
                <button
                  onClick={() => unlinkedContacts.length > 0 ? setShowInviteMenu(v => !v) : router.push('/contacts')}
                  className="w-full flex items-center justify-between gap-2 py-2.5 px-4 border border-dashed border-[#E5E7EB] rounded-xl text-[#6B7280] text-xs font-medium hover:border-[#1A5C52] hover:text-[#1A5C52] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Mail size={13} />
                    Invite to connect calendar
                  </span>
                  {unlinkedContacts.length > 0 && (showInviteMenu ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                </button>

                {showInviteMenu && unlinkedContacts.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-10 overflow-hidden">
                    {unlinkedContacts.map(contact => (
                      <button
                        key={contact.id}
                        onClick={() => copyInviteLink(contact)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F9FAFB] transition-colors text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#6B7280] font-bold text-[10px] shrink-0">
                            {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#1C2B3A] truncate">{contact.name}</p>
                            <p className="text-[10px] text-[#9CA3AF] truncate">{contact.email}</p>
                          </div>
                        </div>
                        {copiedId === contact.id
                          ? <CheckCircle2 size={13} className="text-[#1A5C52] shrink-0 ml-2" />
                          : <Link2 size={13} className="text-[#9CA3AF] shrink-0 ml-2" />
                        }
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Recent Meetings */}
          <section className="bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base sm:text-lg font-bold text-[#1C2B3A] flex items-center gap-2">
                <Send className="text-[#1A5C52]" size={18} />
                Recent Meetings
                {meetings.length > 0 && (
                  <span className="bg-[#1A5C52]/10 text-[#1A5C52] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {meetings.length}
                  </span>
                )}
              </h2>
            </div>

            {meetings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Send className="text-[#E5E7EB] mb-2" size={32} />
                <p className="text-sm text-[#6B7280]">No meetings yet.</p>
                <button
                  onClick={() => router.push('/schedule')}
                  className="mt-3 text-xs text-[#1A5C52] font-semibold hover:underline"
                >
                  + Schedule a meeting
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {meetings
                  .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
                  .map(meeting => (
                    <div key={meeting.id} onClick={() => openMeeting(meeting)} className="p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] hover:border-[#1A5C52]/30 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-bold text-[#1C2B3A] leading-tight">{meeting.title}</p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {meeting.status === 'confirmed' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1A5C52]/10 text-[#1A5C52] uppercase tracking-wide">
                              Confirmed
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C49A2A]/10 text-[#C49A2A] uppercase tracking-wide">
                              Pending
                            </span>
                          )}
                          <button
                            onClick={async (e) => {
                              e.stopPropagation()
                              if (!user) return
                              await deleteDoc(doc(db, 'users', user.uid, 'meetings', meeting.id))
                              if (selectedMeeting?.id === meeting.id) setSelectedMeeting(null)
                              toast.success('Meeting deleted.')
                            }}
                            className="p-1 text-[#9CA3AF] hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded transition-colors"
                            title="Delete meeting"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#6B7280] mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {meeting.dates.length} date{meeting.dates.length !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {meeting.timeFrom} – {meeting.timeTo}
                        </span>
                      </div>
                      {meeting.attendees.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          {meeting.attendees.slice(0, 4).map(a => (
                            <div key={a.id} className="w-6 h-6 rounded-full bg-[#1A5C52]/10 text-[#1A5C52] flex items-center justify-center text-[9px] font-bold border border-white" title={a.name}>
                              {a.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                          ))}
                          {meeting.attendees.length > 4 && (
                            <span className="text-[10px] text-[#6B7280]">+{meeting.attendees.length - 4}</span>
                          )}
                          <span className="text-[10px] text-[#6B7280] ml-1">
                            {meeting.status === 'confirmed'
                              ? `${meeting.attendees.length} attendee${meeting.attendees.length !== 1 ? 's' : ''}`
                              : `waiting for ${meeting.attendees.length} response${meeting.attendees.length !== 1 ? 's' : ''}`
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                }
              </div>
            )}
          </section>
        </div>

        {/* Right Column – Contact Directory */}
        <div className="lg:col-span-2">
          <section className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col">
            <div className="p-4 sm:p-6 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-base sm:text-lg font-bold text-[#1C2B3A] flex items-center gap-2">
                <Users className="text-[#1A5C52]" size={20} />
                Contact Directory
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={16} />
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    className="pl-9 pr-4 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C52]/20 focus:border-[#1A5C52] transition-all w-full sm:w-56"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => router.push('/contacts')}
                  className="bg-[#1A5C52] text-white p-2 rounded-lg hover:bg-[#1A5C52]/90 transition-colors shrink-0"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F9FAFB]">
                  <tr>
                    <th className="px-4 sm:px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Name</th>
                    <th className="px-4 sm:px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider hidden sm:table-cell">Email</th>
                    <th className="px-4 sm:px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider hidden md:table-cell">Calendar</th>
                    <th className="px-4 sm:px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#1A5C52]/10 text-[#1A5C52] flex items-center justify-center font-bold text-xs shrink-0">
                              {contact.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-sm font-semibold text-[#1C2B3A] truncate">{contact.name}</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-[#6B7280] hidden sm:table-cell truncate max-w-[160px]">{contact.email}</td>
                        <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                          {contact.calendarLinked ? (
                            <span className="inline-flex items-center gap-1 text-[#1A5C52] text-xs font-bold">
                              <CheckCircle2 size={12} /> Linked
                            </span>
                          ) : (
                            <span className="text-[#9CA3AF] text-xs">Not linked</span>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 text-[#6B7280]">
                            <button
                              onClick={() => router.push('/contacts')}
                              className="p-1 hover:text-[#1A5C52] hover:bg-[#F9FAFB] rounded transition-colors"
                              title="Edit contact"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={async () => {
                                if (!user) return
                                await deleteDoc(doc(db, 'users', user.uid, 'contacts', contact.id))
                                toast.success('Contact removed.')
                              }}
                              className="p-1 hover:text-[#EF4444] hover:bg-[#F9FAFB] rounded transition-colors"
                              title="Delete contact"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <Users className="text-[#E5E7EB] mb-2" size={40} />
                          <p className="text-[#6B7280] text-sm font-medium">No contacts yet</p>
                          <button
                            onClick={() => router.push('/contacts')}
                            className="mt-3 text-xs text-[#1A5C52] font-semibold hover:underline"
                          >
                            + Add your first contact
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-[#E5E7EB] bg-[#F9FAFB] text-center">
              <Link href="/contacts" className="text-sm font-bold text-[#1A5C52] hover:underline">
                View &amp; Manage Full Directory
              </Link>
            </div>
          </section>
        </div>
      </div>

      {/* Meeting Detail Slide-over */}
      {selectedMeeting && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
            onClick={() => setSelectedMeeting(null)}
          />
          {/* Panel */}
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-[#E5E7EB] flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-[#6B7280] font-medium mb-0.5">Meeting Details</p>
                <h2 className="text-base font-bold text-[#1C2B3A] leading-snug">{selectedMeeting.title}</h2>
                <div className="flex items-center gap-3 mt-1 text-xs text-[#6B7280]">
                  <span className="flex items-center gap-1"><Calendar size={11} /> {selectedMeeting.dates.length} date{selectedMeeting.dates.length !== 1 ? 's' : ''}</span>
                  <span className="flex items-center gap-1"><Clock size={11} /> {selectedMeeting.timeFrom} – {selectedMeeting.timeTo}</span>
                </div>
              </div>
              <button onClick={() => setSelectedMeeting(null)} className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors shrink-0">
                <X size={18} className="text-[#6B7280]" />
              </button>
            </div>

            {/* Status badge */}
            <div className="px-5 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
              <span className="text-xs text-[#6B7280]">Status</span>
              {selectedMeeting.status === 'confirmed'
                ? <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#1A5C52]/10 text-[#1A5C52] uppercase tracking-wide">Confirmed</span>
                : <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#C49A2A]/10 text-[#C49A2A] uppercase tracking-wide">Pending</span>
              }
            </div>

            {/* Responses */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div>
                <h3 className="text-xs font-bold text-[#1C2B3A] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Users size={13} className="text-[#1A5C52]" />
                  Attendee Responses
                  {!loadingResponses && (
                    <span className="text-[#6B7280] font-normal normal-case tracking-normal">
                      ({responses.length} of {selectedMeeting.attendees.length} responded)
                    </span>
                  )}
                </h3>

                {loadingResponses ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-[#1A5C52] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedMeeting.attendees.map(attendee => {
                      const response = responses.find(r =>
                        r.attendeeName.toLowerCase().trim() === attendee.name.toLowerCase().trim()
                      )
                      return (
                        <div key={attendee.id} className="rounded-xl border border-[#E5E7EB] overflow-hidden">
                          <div className={`flex items-center justify-between px-4 py-3 ${response ? 'bg-[#F0FDF9]' : 'bg-[#F9FAFB]'}`}>
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-[#1A5C52]/10 text-[#1A5C52] flex items-center justify-center font-bold text-xs shrink-0">
                                {attendee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#1C2B3A] truncate">{attendee.name}</p>
                                {attendee.email && <p className="text-[10px] text-[#6B7280] truncate">{attendee.email}</p>}
                              </div>
                            </div>
                            {response
                              ? <CheckCheck size={16} className="text-[#1A5C52] shrink-0 ml-2" />
                              : <HelpCircle size={16} className="text-[#9CA3AF] shrink-0 ml-2" />
                            }
                          </div>

                          {response && response.selectedSlots.length > 0 && (
                            <div className="px-4 py-3 border-t border-[#E5E7EB] space-y-1.5">
                              <p className="text-[10px] font-bold text-[#1A5C52] uppercase tracking-wide mb-2">Available slots</p>
                              {response.selectedSlots.map((slot, i) => {
                                const lastDash = slot.lastIndexOf('-')
                                const date = slot.substring(0, lastDash)
                                const time = slot.substring(lastDash + 1)
                                return (
                                  <div key={i} className="flex items-center gap-2 text-xs text-[#374151] bg-white rounded-lg px-3 py-2 border border-[#E5E7EB]">
                                    <Calendar size={11} className="text-[#6B7280] shrink-0" />
                                    <span className="truncate">{date}</span>
                                    <span className="text-[#9CA3AF]">·</span>
                                    <Clock size={11} className="text-[#6B7280] shrink-0" />
                                    <span className="shrink-0 font-medium">{time}</span>
                                  </div>
                                )
                              })}
                            </div>
                          )}

                          {!response && (
                            <div className="px-4 py-2 border-t border-[#E5E7EB]">
                              <p className="text-[11px] text-[#9CA3AF] italic">Awaiting response...</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
