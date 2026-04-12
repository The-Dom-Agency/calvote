'use client'

import { useState } from 'react'
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

const timeSlots = [
  { time: '09:00 AM', status: 'available' },
  { time: '10:00 AM', status: 'available' },
  { time: '11:00 AM', status: 'busy' },
  { time: '12:00 PM', status: 'available' },
  { time: '01:00 PM', status: 'available' },
  { time: '02:00 PM', status: 'busy' },
  { time: '03:00 PM', status: 'available' },
  { time: '04:00 PM', status: 'available' },
]

const dates = [
  { day: 'Mon', date: '13', full: 'April 13, 2026' },
  { day: 'Tue', date: '14', full: 'April 14, 2026', current: true },
  { day: 'Wed', date: '15', full: 'April 15, 2026' },
]

export default function AvailabilityPage() {
  const router = useRouter()
  const [name, setName] = useState('Travis Barker')
  const [selectedSlots, setSelectedSlots] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [activeDate, setActiveDate] = useState(dates[1])

  const toggleSlot = (time: string) => {
    const slotId = `${activeDate.full}-${time}`
    setSelectedSlots(prev =>
      prev.includes(slotId) ? prev.filter(s => s !== slotId) : [...prev, slotId]
    )
  }

  const handleSubmit = () => {
    if (selectedSlots.length === 0) {
      toast.error('Please select at least one time slot.')
      return
    }
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      toast.success('Availability submitted!')
    }, 1500)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-[#C49A2A]/10 text-[#C49A2A] rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-2xl font-bold text-[#1C2B3A] mb-2">Availability Sent</h1>
        <p className="text-[#6B7280] max-w-xs mx-auto mb-8">
          Thanks for responding, {name}! We&apos;ll notify you as soon as the meeting time is finalized.
        </p>
        <div className="bg-[#F9FAFB] p-6 rounded-2xl border border-[#E5E7EB] w-full max-w-sm space-y-4 mb-8">
          <p className="text-xs font-bold text-[#1A5C52] uppercase tracking-wider">You selected</p>
          <div className="space-y-2">
            {selectedSlots.map((slot, i) => {
              const parts = slot.split('-')
              return (
                <div key={i} className="flex items-center gap-2 text-sm text-[#1C2B3A] font-medium bg-white p-2 rounded-lg border border-[#E5E7EB]">
                  <Calendar size={14} className="text-[#6B7280]" />
                  {parts[0]}
                  <span className="text-[#6B7280]">•</span>
                  <Clock size={14} className="text-[#6B7280]" />
                  {parts[1]}
                </div>
              )
            })}
          </div>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-[#1A5C52] font-bold text-sm hover:underline"
        >
          <ChevronLeft size={16} /> Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
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
          <h1 className="text-xl font-bold text-[#1C2B3A]">Project Kickoff Sync</h1>
          <p className="text-[#6B7280] text-sm mt-1">
            Admin is scheduling a meeting. <br className="hidden sm:block" />
            Please select the times that work for you.
          </p>
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
            <button className="p-2 rounded-full border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors">
              <ChevronLeft size={16} />
            </button>
            <div className="flex-1 flex gap-2 overflow-x-auto pb-1">
              {dates.map((date, i) => (
                <button
                  key={i}
                  onClick={() => setActiveDate(date)}
                  className={`flex flex-col items-center justify-center min-w-[70px] py-3 rounded-xl border transition-all ${
                    activeDate.full === date.full
                      ? 'bg-[#1A5C52] border-[#1A5C52] text-white shadow-lg shadow-[#1A5C52]/20 scale-105'
                      : 'bg-white border-[#E5E7EB] text-[#1C2B3A]'
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase ${activeDate.full === date.full ? 'text-white/70' : 'text-[#6B7280]'}`}>
                    {date.day}
                  </span>
                  <span className="text-lg font-bold">{date.date}</span>
                </button>
              ))}
            </div>
            <button className="p-2 rounded-full border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Time Grid */}
        <div className="space-y-4">
          <p className="text-sm font-bold text-[#1C2B3A]">{activeDate.full}</p>
          <div className="grid grid-cols-2 gap-3">
            {timeSlots.map((slot, i) => {
              const slotId = `${activeDate.full}-${slot.time}`
              const isSelected = selectedSlots.includes(slotId)
              const isBusy = slot.status === 'busy'
              return (
                <button
                  key={i}
                  disabled={isBusy}
                  onClick={() => toggleSlot(slot.time)}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    isBusy
                      ? 'bg-[#F3F4F6] border-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed opacity-60'
                      : isSelected
                      ? 'bg-[#1A5C52] border-[#1A5C52] text-white shadow-md'
                      : 'bg-white border-[#1A5C52] text-[#1C2B3A] hover:bg-[#1A5C52]/5'
                  }`}
                >
                  <span className="text-sm font-bold">{slot.time}</span>
                  {isBusy ? (
                    <AlertCircle size={14} className="opacity-50" />
                  ) : isSelected ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-[#1A5C52]/30" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <p className="text-[10px] text-[#6B7280] text-center italic">
            *Busy times are automatically grayed out to help find the best match.
          </p>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-[#C49A2A] text-white font-bold py-4 rounded-xl hover:bg-[#C49A2A]/90 transition-all shadow-lg shadow-[#C49A2A]/20 flex items-center justify-center gap-2 active:scale-[0.98]"
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
