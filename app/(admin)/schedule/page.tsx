'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Settings,
  MessageSquare,
  X,
  Search,
  Check,
  Star,
} from 'lucide-react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'

type Contact = { id: string; name: string; calendarLinked: boolean; email: string }

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const TODAY = new Date()

function buildCalendarDays(year: number, month: number) {
  const first = new Date(year, month, 1).getDay()
  const days = new Date(year, month + 1, 0).getDate()
  return { first, days }
}

export default function ScheduleMeetingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [allContacts, setAllContacts] = useState<Contact[]>([])
  const [selectedAttendees, setSelectedAttendees] = useState<Contact[]>([])
  const [showAttendeeSearch, setShowAttendeeSearch] = useState(false)
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [calYear, setCalYear] = useState(TODAY.getFullYear())
  const [calMonth, setCalMonth] = useState(TODAY.getMonth())
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timeFrom: '09:00',
    timeTo: '17:00',
    schedulingRule: 'Majority wins',
    sendVia: 'Email',
  })
  const [suggestedTime, setSuggestedTime] = useState<{ date: string; time: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  // 'me' = logged-in user's calendar, or a contact id
  const [primaryPersonId, setPrimaryPersonId] = useState<string>('me')

  // Load contacts from Firestore
  useEffect(() => {
    if (!user) return
    const ref = collection(db, 'users', user.uid, 'contacts')
    return onSnapshot(ref, snap => {
      setAllContacts(snap.docs.map(d => {
        const data = d.data()
        return { id: d.id, name: data.name, email: data.email, calendarLinked: data.calendarLinked ?? false }
      }))
    })
  }, [user])

  const toggleAttendee = (contact: Contact) => {
    let next: Contact[]
    if (selectedAttendees.find(a => a.id === contact.id)) {
      next = selectedAttendees.filter(a => a.id !== contact.id)
    } else {
      next = [...selectedAttendees, contact]
    }
    setSelectedAttendees(next)
    const allLinked = next.length > 0 && next.every(a => a.calendarLinked)
    setSuggestedTime(allLinked ? { date: 'April 15, 2026', time: '2:00 PM' } : null)
  }

  const toggleDate = (dateStr: string) => {
    setSelectedDates(prev =>
      prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]
    )
  }

  const { first, days } = buildCalendarDays(calYear, calMonth)

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
    else setCalMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
    else setCalMonth(m => m + 1)
  }

  const filteredContacts = allContacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedAttendees.find(a => a.id === c.id)
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const primaryContact = allContacts.find(c => c.id === primaryPersonId)
    sessionStorage.setItem('meetingDraft', JSON.stringify({
      title: formData.title,
      description: formData.description,
      timeFrom: formData.timeFrom,
      timeTo: formData.timeTo,
      schedulingRule: formData.schedulingRule,
      sendVia: formData.sendVia,
      attendees: selectedAttendees,
      dates: selectedDates,
      primaryPersonId,
      primaryPersonName: primaryPersonId === 'me' ? 'You' : (primaryContact?.name ?? ''),
    }))
    router.push('/preview')
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <button
        onClick={() => router.push('/dashboard')}
        className="flex items-center gap-2 text-[#6B7280] hover:text-[#1C2B3A] font-medium transition-colors mb-6 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1C2B3A]">Schedule a Meeting</h1>
        <p className="text-[#6B7280] mt-1">Fill in the details and let calvote find the best time.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Primary Person */}
        <section className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-[#1C2B3A] flex items-center gap-2">
            <Star size={18} className="text-[#1A5C52]" />
            Schedule Around
            <span className="text-xs font-normal text-[#6B7280] ml-1">Whose availability is the priority?</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            {/* Me option */}
            <button
              type="button"
              onClick={() => setPrimaryPersonId('me')}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 transition-all text-sm font-semibold ${
                primaryPersonId === 'me'
                  ? 'border-[#1A5C52] bg-[#1A5C52]/5 text-[#1A5C52]'
                  : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#1A5C52]/40'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-[#1A5C52]/10 flex items-center justify-center text-[10px] font-bold text-[#1A5C52]">
                Me
              </div>
              You
              {primaryPersonId === 'me' && <Check size={14} />}
            </button>

            {/* Linked contacts */}
            {allContacts.filter(c => c.calendarLinked).map(contact => (
              <button
                key={contact.id}
                type="button"
                onClick={() => setPrimaryPersonId(contact.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 transition-all text-sm font-semibold ${
                  primaryPersonId === contact.id
                    ? 'border-[#1A5C52] bg-[#1A5C52]/5 text-[#1A5C52]'
                    : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#1A5C52]/40'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[10px] font-bold text-[#6B7280]">
                  {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                {contact.name}
                {primaryPersonId === contact.id && <Check size={14} />}
              </button>
            ))}

            {allContacts.filter(c => c.calendarLinked).length === 0 && (
              <p className="text-xs text-[#9CA3AF] self-center">
                Connect a contact&apos;s calendar to schedule around them.
              </p>
            )}
          </div>
        </section>

        {/* Meeting Details */}
        <section className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-[#1C2B3A] flex items-center gap-2">
            <MessageSquare size={18} className="text-[#1A5C52]" />
            Meeting Details
          </h2>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1C2B3A]">Meeting Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Project Kickoff"
              value={formData.title}
              onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C52]/20 focus:border-[#1A5C52] transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1C2B3A]">Description</label>
            <textarea
              rows={3}
              placeholder="What's this meeting about?"
              value={formData.description}
              onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C52]/20 focus:border-[#1A5C52] transition-all resize-none"
            />
          </div>
        </section>

        {/* Attendees */}
        <section className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-[#1C2B3A] flex items-center gap-2">
            <Users size={18} className="text-[#1A5C52]" />
            Attendees
          </h2>

          {suggestedTime && (
            <div className="bg-[#1A5C52]/5 border border-[#1A5C52]/20 rounded-xl p-4 text-sm text-[#1A5C52] font-medium flex items-center gap-2">
              <Check size={16} />
              AI Suggested: <strong>{suggestedTime.date} at {suggestedTime.time}</strong> — all calendars are free!
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {selectedAttendees.map(a => (
              <span key={a.id} className="flex items-center gap-1.5 bg-[#1A5C52]/10 text-[#1A5C52] px-3 py-1.5 rounded-full text-xs font-semibold">
                {a.name}
                <button type="button" onClick={() => toggleAttendee(a)}>
                  <X size={12} />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={() => setShowAttendeeSearch(!showAttendeeSearch)}
              className="flex items-center gap-1.5 border-2 border-dashed border-[#E5E7EB] text-[#6B7280] px-3 py-1.5 rounded-full text-xs font-medium hover:border-[#1A5C52] hover:text-[#1A5C52] transition-colors"
            >
              + Add Attendee
            </button>
          </div>

          {showAttendeeSearch && (
            <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
              <div className="p-3 border-b border-[#E5E7EB] relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#6B7280]" size={14} />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-7 text-sm focus:outline-none bg-transparent"
                />
              </div>
              {filteredContacts.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { toggleAttendee(c); setSearchQuery('') }}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F9FAFB] transition-colors"
                >
                  <span className="text-sm font-medium text-[#1C2B3A]">{c.name}</span>
                  {c.calendarLinked && (
                    <span className="text-[10px] text-[#C49A2A] font-bold bg-[#C49A2A]/10 px-2 py-0.5 rounded uppercase">Calendar Linked</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Date & Time */}
        <section className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-[#1C2B3A] flex items-center gap-2">
            <CalendarIcon size={18} className="text-[#1A5C52]" />
            Date Window
          </h2>

          {/* Mini Calendar */}
          <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
            <div className="bg-[#1A5C52] text-white px-4 py-3 flex items-center justify-between">
              <button type="button" onClick={prevMonth} className="hover:bg-white/10 px-2 py-1 rounded transition-colors text-sm">‹</button>
              <span className="font-bold text-sm">{MONTHS[calMonth]} {calYear}</span>
              <button type="button" onClick={nextMonth} className="hover:bg-white/10 px-2 py-1 rounded transition-colors text-sm">›</button>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-7 mb-2">
                {['S','M','T','W','T','F','S'].map((d, i) => (
                  <div key={i} className="text-center text-[10px] font-bold text-[#6B7280] py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: first }).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: days }).map((_, i) => {
                  const day = i + 1
                  const dateStr = `${calYear}-${String(calMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
                  const isSelected = selectedDates.includes(dateStr)
                  const isPast = new Date(calYear, calMonth, day) < new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate())
                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={isPast}
                      onClick={() => toggleDate(dateStr)}
                      className={`aspect-square flex items-center justify-center text-xs rounded-lg font-medium transition-all ${
                        isPast ? 'text-[#D1D5DB] cursor-not-allowed' :
                        isSelected ? 'bg-[#1A5C52] text-white shadow-sm' :
                        'hover:bg-[#F9FAFB] text-[#1C2B3A]'
                      }`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {selectedDates.length > 0 && (
            <p className="text-xs text-[#1A5C52] font-semibold">
              {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''} selected
            </p>
          )}

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1C2B3A] flex items-center gap-1">
                <Clock size={14} className="text-[#1A5C52]" /> From
              </label>
              <input
                type="time"
                value={formData.timeFrom}
                onChange={e => setFormData(p => ({ ...p, timeFrom: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C52]/20 focus:border-[#1A5C52] transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1C2B3A] flex items-center gap-1">
                <Clock size={14} className="text-[#1A5C52]" /> To
              </label>
              <input
                type="time"
                value={formData.timeTo}
                onChange={e => setFormData(p => ({ ...p, timeTo: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C52]/20 focus:border-[#1A5C52] transition-all"
              />
            </div>
          </div>
        </section>

        {/* Settings */}
        <section className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-[#1C2B3A] flex items-center gap-2">
            <Settings size={18} className="text-[#1A5C52]" />
            Options
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1C2B3A]">Scheduling Rule</label>
              <select
                value={formData.schedulingRule}
                onChange={e => setFormData(p => ({ ...p, schedulingRule: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C52]/20 focus:border-[#1A5C52] transition-all"
              >
                <option>Majority wins</option>
                <option>All must agree</option>
                <option>Host decides</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1C2B3A]">Send Invites Via</label>
              <select
                value={formData.sendVia}
                onChange={e => setFormData(p => ({ ...p, sendVia: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C52]/20 focus:border-[#1A5C52] transition-all"
              >
                <option>Email</option>
                <option>SMS</option>
                <option>Both</option>
              </select>
            </div>
          </div>
        </section>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="flex-1 bg-white border-2 border-[#E5E7EB] text-[#1C2B3A] font-bold py-4 rounded-xl hover:bg-[#F9FAFB] transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-[2] bg-[#1A5C52] text-white font-bold py-4 px-8 rounded-xl hover:bg-[#1A5C52]/90 transition-all shadow-lg shadow-[#1A5C52]/20"
          >
            Preview &amp; Send →
          </button>
        </div>
      </form>
    </div>
  )
}
