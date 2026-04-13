'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { Logo } from '@/components/Logo'

type Meeting = {
  id: string
  title: string
  description?: string
  timeFrom: string
  timeTo: string
  dates: string[]
  attendees: { id: string; name: string; email: string }[]
  primaryPersonName?: string
}

function fmt12(t: string) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

function generateTimeSlots(timeFrom: string, timeTo: string) {
  const slots: string[] = []
  const [fromH] = timeFrom.split(':').map(Number)
  const [toH] = timeTo.split(':').map(Number)
  for (let h = fromH; h < toH; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`)
  }
  return slots
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })
}

function formatDayShort(dateStr: string) {
  const d = new Date(dateStr)
  return { day: d.toLocaleDateString('en-US', { weekday: 'short' }), date: d.getDate().toString() }
}

export default function AvailabilityPage({ params }: { params: Promise<{ meetingId: string }> }) {
  const { meetingId } = use(params)
  const router = useRouter()
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [name, setName] = useState('')
  const [selectedSlots, setSelectedSlots] = useState<string[]>([])
  const [activeDateIndex, setActiveDateIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    fetch(`/api/meetings/${meetingId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setNotFound(true); setLoading(false); return }
        setMeeting(data)
        setLoading(false)
      })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [meetingId])

  const toggleSlot = (time: string) => {
    if (!meeting) return
    const slotId = `${meeting.dates[activeDateIndex]}-${time}`
    setSelectedSlots(prev =>
      prev.includes(slotId) ? prev.filter(s => s !== slotId) : [...prev, slotId]
    )
  }

  const handleSubmit = async () => {
    if (!meeting) return
    if (!name.trim()) { toast.error('Please enter your name.'); return }
    if (selectedSlots.length === 0) { toast.error('Please select at least one time slot.'); return }
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendeeName: name, selectedSlots }),
      })
      if (!res.ok) throw new Error('Failed to submit')
      setIsSubmitted(true)
      toast.success('Availability submitted!')
    } catch {
      toast.error('Failed to submit. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#1A5C52] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#6B7280]">Loading meeting...</p>
        </div>
      </div>
    )
  }

  if (notFound || !meeting) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
        <Calendar className="text-[#E5E7EB] mb-4" size={48} />
        <h1 className="text-xl font-bold text-[#1C2B3A] mb-2">Meeting Not Found</h1>
        <p className="text-[#6B7280] text-sm">This link may have expired or is invalid.</p>
      </div>
    )
  }

  const timeSlots = generateTimeSlots(meeting.timeFrom, meeting.timeTo)
  const activeDate = meeting.dates[activeDateIndex]

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-[#1A5C52]/10 text-[#1A5C52] rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-2xl font-bold text-[#1C2B3A] mb-2">Availability Sent!</h1>
        <p className="text-[#6B7280] max-w-xs mx-auto mb-8">
          Thanks, {name}! We&apos;ll notify you once the meeting time is finalized.
        </p>
        <div className="bg-[#F9FAFB] p-6 rounded-2xl border border-[#E5E7EB] w-full max-w-sm space-y-3 text-left mb-8">
          <p className="text-xs font-bold text-[#1A5C52] uppercase tracking-wider">You selected {selectedSlots.length} slot{selectedSlots.length !== 1 ? 's' : ''}</p>
          {selectedSlots.map((slot, i) => {
            const [date, time] = slot.split(/-(?=\d{2}:)/)
            return (
              <div key={i} className="flex items-center gap-2 text-sm text-[#1C2B3A] font-medium bg-white p-2 rounded-lg border border-[#E5E7EB]">
                <Calendar size={14} className="text-[#6B7280] shrink-0" />
                <span className="truncate">{formatDateLabel(date)}</span>
                <span className="text-[#6B7280]">·</span>
                <Clock size={14} className="text-[#6B7280] shrink-0" />
                <span className="shrink-0">{fmt12(time)}</span>
              </div>
            )
          })}
        </div>
        <p className="text-[10px] font-bold text-[#1C2B3A]/30 uppercase tracking-[0.2em]">Powered by calvote.ai</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="px-6 py-6 border-b border-[#E5E7EB] flex flex-col items-center gap-4 sticky top-0 bg-white z-10 shadow-sm shadow-[#000]/[0.02]">
        <div className="w-full flex justify-between items-center max-w-md">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-[#F9FAFB] rounded-full transition-colors text-[#6B7280]"
          >
            <ChevronLeft size={24} />
          </button>
          <Logo />
          <div className="w-10" />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold text-[#1C2B3A]">{meeting.title}</h1>
          {meeting.description && (
            <p className="text-[#6B7280] text-xs mt-1 max-w-xs mx-auto">{meeting.description}</p>
          )}
          <p className="text-[#6B7280] text-sm mt-1">Please select the times that work for you.</p>
        </div>
      </header>

      <main className="flex-1 px-6 py-8 max-w-md mx-auto w-full space-y-8">
        {/* Name */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#1A5C52] uppercase tracking-wider flex items-center gap-2">
            <User size={14} /> Your Name
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#1A5C52]/20 focus:border-[#1A5C52] transition-all font-semibold text-sm"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>

        {/* Date Selector */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#1A5C52] uppercase tracking-wider">Select Dates &amp; Times</h2>
            <p className="text-[10px] text-[#6B7280]">Tap to select preferred slots</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveDateIndex(i => Math.max(0, i - 1))}
              disabled={activeDateIndex === 0}
              className="p-2 rounded-full border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex-1 flex gap-2 overflow-x-auto pb-1">
              {meeting.dates.map((dateStr, i) => {
                const { day, date } = formatDayShort(dateStr)
                return (
                  <button
                    key={i}
                    onClick={() => setActiveDateIndex(i)}
                    className={`flex flex-col items-center justify-center min-w-[70px] py-3 rounded-xl border transition-all ${
                      activeDateIndex === i
                        ? 'bg-[#1A5C52] border-[#1A5C52] text-white shadow-lg shadow-[#1A5C52]/20 scale-105'
                        : 'bg-white border-[#E5E7EB] text-[#1C2B3A]'
                    }`}
                  >
                    <span className={`text-[10px] font-bold uppercase ${activeDateIndex === i ? 'text-white/70' : 'text-[#6B7280]'}`}>{day}</span>
                    <span className="text-lg font-bold">{date}</span>
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setActiveDateIndex(i => Math.min(meeting.dates.length - 1, i + 1))}
              disabled={activeDateIndex === meeting.dates.length - 1}
              className="p-2 rounded-full border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Time Grid */}
        <div className="space-y-4">
          <p className="text-sm font-bold text-[#1C2B3A]">{formatDateLabel(activeDate)}</p>
          <div className="grid grid-cols-2 gap-3">
            {timeSlots.map((time, i) => {
              const slotId = `${activeDate}-${time}`
              const isSelected = selectedSlots.includes(slotId)
              return (
                <button
                  key={i}
                  onClick={() => toggleSlot(time)}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-[#1A5C52] border-[#1A5C52] text-white shadow-md'
                      : 'bg-white border-[#1A5C52] text-[#1C2B3A] hover:bg-[#1A5C52]/5'
                  }`}
                >
                  <span className="text-sm font-bold">{fmt12(time)}</span>
                  {isSelected
                    ? <CheckCircle2 size={16} />
                    : <div className="w-4 h-4 rounded-full border border-[#1A5C52]/30" />
                  }
                </button>
              )
            })}
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <p className="text-[10px] text-[#6B7280] text-center italic">
            Select all times that work for you.
          </p>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-[#1A5C52] text-white font-bold py-4 rounded-xl hover:bg-[#1A5C52]/90 transition-all shadow-lg shadow-[#1A5C52]/20 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Availability'}
          </button>
        </div>
      </main>

      <footer className="py-8 text-center">
        <p className="text-[10px] font-bold text-[#1C2B3A]/30 uppercase tracking-[0.2em]">Powered by calvote.ai</p>
      </footer>
    </div>
  )
}
